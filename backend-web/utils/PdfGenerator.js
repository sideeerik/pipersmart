const PDFDocument = require('pdfkit');

/**
 * Generate analytics PDF with two formats:
 * - 'simple': Table-only export
 * - 'full': Full report with statistics
 */
exports.generateAnalyticsPDF = async (data, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const { format = 'simple', title = 'Analytics Report', stats = null, dataType = 'all' } = options;
      
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
      });

      let pdfBuffer = Buffer.alloc(0);
      doc.on('data', (chunk) => {
        pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
      });

      doc.on('end', () => {
        resolve(pdfBuffer);
      });

      // ===== HEADER =====
      doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.fontSize(10).fillColor('#666666').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.strokeColor('#CCCCCC').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);

      // ===== CONTENT BY FORMAT =====
      if (format === 'full' && stats) {
        // Full Report with Statistics
        generateFullReport(doc, data, stats, dataType);
      } else {
        // Simple Table Export
        generateSimpleTable(doc, data, dataType);
      }

      doc.moveDown(1);
      doc.fontSize(8).fillColor('#999999').text('PiperSmart Analytics Export', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate simple table-only PDF
 */
function generateSimpleTable(doc, data, dataType = 'all') {
  if (!data || data.length === 0) {
    doc.fontSize(12).fillColor('#333333').text('No data available for export.', { align: 'center' });
    return;
  }

  if (dataType === 'all') {
    const bungaData = data.filter(item => item?.results?.ripeness !== undefined);
    const leafData = data.filter(item => item?.results?.disease !== undefined);

    if (bungaData.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#27AE60').text('Peppercorns Analysis');
      doc.moveDown(0.5);
      drawBungaTable(doc, bungaData);
      drawParagraph(doc, buildPeppercornSummaryFromData(bungaData));
    }

    if (leafData.length > 0) {
      if (doc.y > 720) {
        doc.addPage();
      } else {
        doc.moveDown(0.5);
      }
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#27AE60').text('Leaf Analysis');
      doc.moveDown(0.5);
      drawLeafTable(doc, leafData);
      drawParagraph(doc, buildLeafSummaryFromData(leafData));
    }
    return;
  }

  if (dataType === 'bunga') {
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#27AE60').text('Peppercorns Analysis');
    doc.moveDown(0.5);
  }
  if (dataType === 'leaf') {
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#27AE60').text('Leaf Analysis');
    doc.moveDown(0.5);
  }

  // Determine columns based on data type
  const firstItem = data[0];
  let tableHTML = '';
  let columns = [];

  if (firstItem.results?.ripeness !== undefined) {
    // Peppercorns Analysis
    columns = ['User', 'Ripeness', 'Market Grade', 'Health Class', 'Confidence', 'Date'];
      tableHTML = `
      <table>
        <thead>
          <tr style="background-color: #27AE60; color: white; font-weight: bold;">
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map((item, idx) => `
            <tr style="background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#F0F9F4'};">
              <td>${item.userName || 'N/A'}</td>
              <td>${item.results?.ripeness || 'N/A'}</td>
              <td>${item.results?.market_grade || 'N/A'}</td>
              <td>${item.results?.health_class || 'N/A'}</td>
              <td>${item.results?.confidence || 'N/A'}%</td>
              <td>${new Date(item.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    drawBungaTable(doc, data);
    drawParagraph(doc, buildPeppercornSummaryFromData(data));
  } else if (firstItem.results?.disease !== undefined) {
    // Leaf Analysis
    columns = ['User', 'Disease', 'Confidence', 'Date'];
    drawLeafTable(doc, data);
    drawParagraph(doc, buildLeafSummaryFromData(data));
  } else {
    // Generic activity data
    columns = ['Type', 'User/Title', 'Details', 'Date'];
    drawActivityTable(doc, data);
  }
}

/**
 * Draw Bunga Analysis table
 */
function drawBungaTable(doc, data) {
  const startX = 40;
  const startY = doc.y;
  const colWidth = (555 - 40) / 6;
  const rowHeight = 25;
  const headerColor = '#27AE60';
  const headerTextColor = '#FFFFFF';
  const alternateColor = '#F0F9F4';
  const textColor = '#333333';

  const columns = ['User', 'Ripeness', 'Market Grade', 'Health Class', 'Confidence', 'Date'];

  // Draw header
  doc.fillColor(headerColor).rect(startX, doc.y, 555 - startX, rowHeight).fill();
  doc.fillColor(headerTextColor).fontSize(9).font('Helvetica-Bold');
  columns.forEach((col, i) => {
    doc.text(col, startX + (i * colWidth) + 5, startY + 7, { width: colWidth - 10, align: 'left' });
  });

  doc.moveDown(1.5);
  
  // Draw rows
  let yPos = doc.y;
  data.slice(0, 50).forEach((item, idx) => {
    const rowStartY = yPos;
    const bgColor = idx % 2 === 0 ? '#FFFFFF' : alternateColor;
    
    doc.fillColor(bgColor).rect(startX, rowStartY, 555 - startX, rowHeight).fill();
    doc.fillColor(textColor).fontSize(8).font('Helvetica');
    
    const values = [
      formatCellValue(item.userName),
      formatCellValue(item.results?.ripeness),
      formatCellValue(item.results?.market_grade),
      formatPercentValue(item.results?.health_percentage),
      `${formatCellValue(item.results?.confidence)}%`,
      new Date(item.createdAt).toLocaleDateString()
    ];

    columns.forEach((col, i) => {
      doc.text(values[i], startX + (i * colWidth) + 5, rowStartY + 7, { width: colWidth - 10, align: 'left' });
    });

    yPos += rowHeight;

    // Check if we need a new page
    if (yPos > 750) {
      doc.addPage();
      yPos = 40;
    }
  });

  doc.moveDown(2);
}

/**
 * Draw Leaf Analysis table
 */
function drawLeafTable(doc, data) {
  const startX = 40;
  const startY = doc.y;
  const colWidth = (555 - 40) / 4;
  const rowHeight = 25;
  const headerColor = '#27AE60';
  const headerTextColor = '#FFFFFF';
  const alternateColor = '#F0F9F4';
  const textColor = '#333333';

  const columns = ['User', 'Disease', 'Confidence', 'Date'];

  // Draw header
  doc.fillColor(headerColor).rect(startX, doc.y, 555 - startX, rowHeight).fill();
  doc.fillColor(headerTextColor).fontSize(9).font('Helvetica-Bold');
  columns.forEach((col, i) => {
    doc.text(col, startX + (i * colWidth) + 5, startY + 7, { width: colWidth - 10, align: 'left' });
  });

  doc.moveDown(1.5);
  
  // Draw rows
  let yPos = doc.y;
  data.slice(0, 50).forEach((item, idx) => {
    const rowStartY = yPos;
    const bgColor = idx % 2 === 0 ? '#FFFFFF' : alternateColor;
    
    doc.fillColor(bgColor).rect(startX, rowStartY, 555 - startX, rowHeight).fill();
    doc.fillColor(textColor).fontSize(8).font('Helvetica');
    
    const values = [
      formatCellValue(item.userName),
      formatCellValue(item.results?.disease),
      `${formatCellValue(item.results?.confidence)}%`,
      new Date(item.createdAt).toLocaleDateString()
    ];

    columns.forEach((col, i) => {
      doc.text(values[i], startX + (i * colWidth) + 5, rowStartY + 7, { width: colWidth - 10, align: 'left' });
    });

    yPos += rowHeight;

    // Check if we need a new page
    if (yPos > 750) {
      doc.addPage();
      yPos = 40;
    }
  });

  doc.moveDown(2);
}

/**
 * Draw Activity table
 */
function drawActivityTable(doc, data) {
  const startX = 40;
  const startY = doc.y;
  const colWidth = (555 - 40) / 4;
  const rowHeight = 25;
  const headerColor = '#27AE60';
  const headerTextColor = '#FFFFFF';
  const alternateColor = '#F0F9F4';
  const textColor = '#333333';

  const columns = ['Type', 'User/Title', 'Details', 'Date'];

  // Draw header
  doc.fillColor(headerColor).rect(startX, doc.y, 555 - startX, rowHeight).fill();
  doc.fillColor(headerTextColor).fontSize(9).font('Helvetica-Bold');
  columns.forEach((col, i) => {
    doc.text(col, startX + (i * colWidth) + 5, startY + 7, { width: colWidth - 10, align: 'left' });
  });

  doc.moveDown(1.5);
  
  // Draw rows
  let yPos = doc.y;
  data.slice(0, 50).forEach((item, idx) => {
    const rowStartY = yPos;
    const bgColor = idx % 2 === 0 ? '#FFFFFF' : alternateColor;
    
    doc.fillColor(bgColor).rect(startX, rowStartY, 555 - startX, rowHeight).fill();
    doc.fillColor(textColor).fontSize(8).font('Helvetica');
    
    const values = [
      item.type || 'N/A',
      item.userName || item.title || 'N/A',
      item.description || 'N/A',
      new Date(item.timestamp || item.createdAt).toLocaleDateString()
    ];

    columns.forEach((col, i) => {
      doc.text(values[i], startX + (i * colWidth) + 5, rowStartY + 7, { width: colWidth - 10, align: 'left' });
    });

    yPos += rowHeight;

    // Check if we need a new page
    if (yPos > 750) {
      doc.addPage();
      yPos = 40;
    }
  });

  doc.moveDown(2);
}

/**
 * Generate full report with statistics
 */
function generateFullReport(doc, data, stats, dataType = 'all') {
  if (!data || data.length === 0) {
    doc.fontSize(12).fillColor('#333333').text('No data available for export.', { align: 'center' });
    return;
  }

  // ==== STATISTICS SECTION ====
  const peppercornSummary = buildPeppercornSummary(stats?.bungaAnalyses);
  const leafSummary = buildLeafSummary(stats?.leafAnalyses);

  // ==== CHARTS SECTION ====
  drawChartsSection(doc, stats, dataType);

  doc.moveDown(0.5);
  doc.strokeColor('#CCCCCC').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(1);

  // ==== DATA TABLE ====
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#27AE60').text('Detailed Records', { align: 'center' });
  doc.moveDown(0.5);

  // Determine which table to draw based on data type
  if (dataType === 'all') {
    const bungaData = data.filter(item => item?.results?.ripeness !== undefined);
    const leafData = data.filter(item => item?.results?.disease !== undefined);

    if (bungaData.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#27AE60').text('Peppercorns Analysis', 40, doc.y, { align: 'left' });
      doc.moveDown(0.5);
      drawBungaTable(doc, bungaData);
      drawParagraph(doc, peppercornSummary);
    }

    if (leafData.length > 0) {
      if (doc.y > 720) {
        doc.addPage();
      } else {
        doc.moveDown(0.5);
      }
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#27AE60').text('Leaf Analysis', 40, doc.y, { align: 'left' });
      doc.moveDown(0.5);
      drawLeafTable(doc, leafData);
      drawParagraph(doc, leafSummary);
    }
  } else {
    const firstItem = data[0];
    if (firstItem.results?.ripeness !== undefined) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#27AE60').text('Peppercorns Analysis', 40, doc.y, { align: 'left' });
      doc.moveDown(0.5);
      drawBungaTable(doc, data);
      drawParagraph(doc, peppercornSummary);
    } else if (firstItem.results?.disease !== undefined) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#27AE60').text('Leaf Analysis', 40, doc.y, { align: 'left' });
      doc.moveDown(0.5);
      drawLeafTable(doc, data);
      drawParagraph(doc, leafSummary);
    } else {
      drawActivityTable(doc, data);
    }
  }
}

function drawChartsSection(doc, stats, dataType) {
  if (!stats) return;

  if (dataType === 'all') {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#27AE60').text('Peppercorns Charts', 40, doc.y, { align: 'left' });
    doc.moveDown(0.5);
    drawPeppercornCharts(doc, stats.bungaAnalyses);

    doc.moveDown(0.5);
    doc.strokeColor('#E0E0E0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.8);

    doc.fontSize(14).font('Helvetica-Bold').fillColor('#27AE60').text('Leaf Charts', 40, doc.y, { align: 'left' });
    doc.moveDown(0.5);
    drawLeafCharts(doc, stats.leafAnalyses);
    return;
  }

  if (dataType === 'bunga') {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#27AE60').text('Peppercorns Charts', 40, doc.y, { align: 'left' });
    doc.moveDown(0.5);
    drawPeppercornCharts(doc, stats.bungaAnalyses);
    return;
  }

  if (dataType === 'leaf') {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#27AE60').text('Leaf Charts', 40, doc.y, { align: 'left' });
    doc.moveDown(0.5);
    drawLeafCharts(doc, stats.leafAnalyses);
  }
}

function ensureSpace(doc, heightNeeded) {
  if (doc.y + heightNeeded > 760) {
    doc.addPage();
    doc.moveDown(0.5);
  }
}

function drawBarChart(doc, { title, labels = [], values = [], color = '#27AE60' }) {
  const chartWidth = 500;
  const chartHeight = 120;
  const x = 50;

  ensureSpace(doc, chartHeight + 60);

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text(title, x, doc.y);
  doc.moveDown(0.5);

  const y = doc.y;
  const maxValue = Math.max(...values, 1);
  const gap = 8;
  const barWidth = Math.max((chartWidth - gap * (labels.length - 1)) / (labels.length || 1), 16);

  doc.strokeColor('#DDDDDD').lineWidth(1).moveTo(x, y + chartHeight).lineTo(x + chartWidth, y + chartHeight).stroke();

  labels.forEach((label, idx) => {
    const value = Number(values[idx]) || 0;
    const barHeight = Math.round((value / maxValue) * chartHeight);
    const barX = x + idx * (barWidth + gap);
    const barY = y + chartHeight - barHeight;

    doc.fillColor(color).rect(barX, barY, barWidth, barHeight).fill();

    doc.fillColor('#333333').fontSize(8).text(value.toString(), barX, barY - 10, {
      width: barWidth,
      align: 'center'
    });

    doc.fillColor('#666666').fontSize(7).text(label, barX, y + chartHeight + 4, {
      width: barWidth,
      align: 'center'
    });
  });

  doc.moveDown(3);
}

function drawPeppercornCharts(doc, bunga = {}) {
  if (!bunga || Object.keys(bunga).length === 0) {
    doc.fontSize(9).fillColor('#666666').text('No peppercorns chart data available.');
    doc.moveDown(0.5);
    return;
  }

  drawBarChart(doc, {
    title: 'Peppercorns Ripeness',
    labels: ['Ripe', 'Unripe', 'Rotten'],
    values: [Number(bunga.ripe) || 0, Number(bunga.unripe) || 0, Number(bunga.rotten) || 0],
    color: '#27AE60'
  });

  const market = bunga.marketGradeCounts || {};
  drawBarChart(doc, {
    title: 'Market Grade',
    labels: ['Premium', 'Standard', 'Commercial', 'Reject'],
    values: [
      Number(market.Premium) || 0,
      Number(market.Standard) || 0,
      Number(market.Commercial) || 0,
      Number(market.Reject) || 0
    ],
    color: '#F1C40F'
  });

  const health = bunga.healthClassCounts || {};
  drawBarChart(doc, {
    title: 'Health Class',
    labels: ['A', 'B', 'C', 'D'],
    values: [
      Number(health.a) || 0,
      Number(health.b) || 0,
      Number(health.c) || 0,
      Number(health.d) || 0
    ],
    color: '#2ECC71'
  });

  const ripenessClass = bunga.ripenessClassCounts || {};
  drawBarChart(doc, {
    title: 'Ripeness Class',
    labels: ['A', 'B', 'C', 'D'],
    values: [
      Number(ripenessClass.A) || 0,
      Number(ripenessClass.B) || 0,
      Number(ripenessClass.C) || 0,
      Number(ripenessClass.D) || 0
    ],
    color: '#1ABC9C'
  });
}

function drawLeafCharts(doc, leaf = {}) {
  if (!leaf || Object.keys(leaf).length === 0) {
    doc.fontSize(9).fillColor('#666666').text('No leaf chart data available.');
    doc.moveDown(0.5);
    return;
  }

  const diseaseCounts = leaf.diseaseCounts || {};
  const diseaseEntries = Object.entries(diseaseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  drawBarChart(doc, {
    title: 'Leaf Disease Distribution (Top 6)',
    labels: diseaseEntries.map(([label]) => label),
    values: diseaseEntries.map(([, value]) => Number(value) || 0),
    color: '#3498DB'
  });

  drawBarChart(doc, {
    title: 'Detections Summary',
    labels: ['Total', 'Avg/Analysis'],
    values: [Number(leaf.totalDetections) || 0, Number(leaf.avgDetectionsPerAnalysis) || 0],
    color: '#9B59B6'
  });
}

function buildPeppercornSummary(bunga = {}) {
  if (!bunga || Object.keys(bunga).length === 0) {
    return 'Summary not available.';
  }

  const total = formatNumber(bunga.total);
  const avgConfidence = formatPercent(bunga.avgConfidence);
  const ripe = formatNumber(bunga.ripe);
  const unripe = formatNumber(bunga.unripe);
  const rotten = formatNumber(bunga.rotten);
  const topMarket = formatLabel(pickTopKey(bunga.marketGradeCounts, 'N/A'));
  const topMarketCount = formatNumber(bunga.marketGradeCounts?.[pickTopKey(bunga.marketGradeCounts, 'N/A')]);
  const topHealth = formatClassLabel(pickTopKey(bunga.healthClassCounts, 'N/A'));
  const topHealthCount = formatNumber(bunga.healthClassCounts?.[pickTopKey(bunga.healthClassCounts, 'N/A')]);
  const topRipeness = formatClassLabel(pickTopKey(bunga.ripenessClassCounts, 'N/A'));
  const topRipenessCount = formatNumber(bunga.ripenessClassCounts?.[pickTopKey(bunga.ripenessClassCounts, 'N/A')]);
  const totalRipeness = Number(bunga.ripe || 0) + Number(bunga.unripe || 0) + Number(bunga.rotten || 0);
  const ripeShare = totalRipeness > 0 ? `${((Number(bunga.ripe || 0) / totalRipeness) * 100).toFixed(2)}%` : 'N/A';
  const unripeShare = totalRipeness > 0 ? `${((Number(bunga.unripe || 0) / totalRipeness) * 100).toFixed(2)}%` : 'N/A';
  const rottenShare = totalRipeness > 0 ? `${((Number(bunga.rotten || 0) / totalRipeness) * 100).toFixed(2)}%` : 'N/A';

  return `This summary highlights the peppercorn analyses included in the report. A total of ${total} analyses are recorded with an average confidence of ${avgConfidence}, providing a sense of overall model certainty. Ripeness results are split into ${ripe} ripe (${ripeShare}), ${unripe} unripe (${unripeShare}), and ${rotten} rotten (${rottenShare}). The most common market grade is ${topMarket}, with ${topMarketCount} instances across the records. Health class is led by ${topHealth}, appearing ${topHealthCount} times in the dataset. Ripeness class is most frequently ${topRipeness}, with ${topRipenessCount} occurrences. Labels are standardized so grade and class names remain consistent throughout the report. Use this paragraph as a quick overview before reviewing the detailed peppercorns table below.`;
}

function buildLeafSummary(leaf = {}) {
  if (!leaf || Object.keys(leaf).length === 0) {
    return 'Summary not available.';
  }

  const total = formatNumber(leaf.total);
  const avgConfidence = formatPercent(leaf.avgConfidence);
  const diseaseCounts = leaf.diseaseCounts || {};
  const topDiseaseKey = pickTopKey(diseaseCounts, 'N/A');
  const topDisease = formatLabel(topDiseaseKey);
  const topDiseaseCount = formatNumber(diseaseCounts?.[topDiseaseKey]);
  const totalDiseases = Object.values(diseaseCounts).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const topDiseaseShare = totalDiseases > 0
    ? `${((Number(diseaseCounts?.[topDiseaseKey]) || 0) / totalDiseases * 100).toFixed(2)}%`
    : 'N/A';

  return `This summary highlights the leaf analyses included in the report. A total of ${total} analyses are recorded with an average confidence of ${avgConfidence}, reflecting overall model certainty. The most frequent condition is ${topDisease}, with ${topDiseaseCount} cases, representing about ${topDiseaseShare} of the labeled results. Other detected conditions appear less frequently and are distributed across the remaining records. Disease names are standardized to keep labels consistent across the report. Use this summary as a quick snapshot before reviewing the detailed table for individual entries.`;
}

function buildPeppercornSummaryFromData(records = []) {
  const data = Array.isArray(records) ? records : [];
  const stats = {
    total: data.length,
    avgConfidence: 0,
    ripe: 0,
    unripe: 0,
    rotten: 0,
    marketGradeCounts: { Premium: 0, Standard: 0, Commercial: 0, Reject: 0 },
    healthClassCounts: { a: 0, b: 0, c: 0, d: 0 },
    ripenessClassCounts: { A: 0, B: 0, C: 0, D: 0 }
  };

  let confidenceSum = 0;
  data.forEach((item) => {
    const results = item?.results || {};
    const ripeness = String(results.ripeness || '');
    if (ripeness === 'Ripe') stats.ripe += 1;
    else if (ripeness === 'Unripe') stats.unripe += 1;
    else if (ripeness === 'Rotten') stats.rotten += 1;

    const marketGrade = String(results.market_grade || '').toLowerCase();
    if (marketGrade.includes('premium')) stats.marketGradeCounts.Premium += 1;
    else if (marketGrade.includes('standard')) stats.marketGradeCounts.Standard += 1;
    else if (marketGrade.includes('commercial')) stats.marketGradeCounts.Commercial += 1;
    else if (marketGrade.includes('reject')) stats.marketGradeCounts.Reject += 1;

    const healthClass = String(results.health_class || '').toLowerCase();
    if (healthClass === 'a') stats.healthClassCounts.a += 1;
    else if (healthClass === 'b') stats.healthClassCounts.b += 1;
    else if (healthClass === 'c') stats.healthClassCounts.c += 1;
    else if (healthClass === 'd') stats.healthClassCounts.d += 1;

    const ripenessPct = Number(results.ripeness_percentage);
    if (Number.isFinite(ripenessPct)) {
      if (ripenessPct >= 76) stats.ripenessClassCounts.A += 1;
      else if (ripenessPct >= 51) stats.ripenessClassCounts.B += 1;
      else if (ripenessPct >= 26) stats.ripenessClassCounts.C += 1;
      else if (ripenessPct >= 0) stats.ripenessClassCounts.D += 1;
    }

    confidenceSum += parseFloat(results.confidence) || 0;
  });

  stats.avgConfidence = data.length > 0 ? (confidenceSum / data.length).toFixed(2) : 0;
  return buildPeppercornSummary(stats);
}

function buildLeafSummaryFromData(records = []) {
  const data = Array.isArray(records) ? records : [];
  const stats = {
    total: data.length,
    avgConfidence: 0,
    diseaseCounts: {}
  };

  let confidenceSum = 0;
  data.forEach((item) => {
    const results = item?.results || {};
    const disease = normalizeDiseaseLabel(results.disease);
    if (disease) {
      stats.diseaseCounts[disease] = (stats.diseaseCounts[disease] || 0) + 1;
    }
    confidenceSum += parseFloat(results.confidence) || 0;
  });

  stats.avgConfidence = data.length > 0 ? (confidenceSum / data.length).toFixed(2) : 0;
  return buildLeafSummary(stats);
}

function normalizeDiseaseLabel(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function drawSummaryParagraph(doc, title, text) {
  ensureSpace(doc, 70);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#27AE60').text(title, 40, doc.y, { align: 'left' });
  doc.fontSize(9).font('Helvetica').fillColor('#333333').text(text, 40, doc.y, { width: 515, align: 'left' });
  doc.moveDown(0.6);
}

function drawParagraph(doc, text) {
  ensureSpace(doc, 70);
  doc.fontSize(9).font('Helvetica').fillColor('#333333').text(text, 40, doc.y, { width: 515, align: 'left' });
  doc.moveDown(0.6);
}

function pickTopKey(counts = {}, fallback = 'N/A') {
  let topKey = fallback;
  let topValue = -1;
  Object.entries(counts || {}).forEach(([key, value]) => {
    const num = Number(value) || 0;
    if (num > topValue) {
      topValue = num;
      topKey = key;
    }
  });
  return topKey || fallback;
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return number.toLocaleString();
}

function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0%';
  return `${number.toFixed(2)}%`;
}

function formatLabel(value) {
  return String(value || 'N/A')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatClassLabel(value) {
  const cleaned = String(value || '').trim();
  if (cleaned.length === 1) return cleaned.toUpperCase();
  return formatLabel(cleaned);
}

function formatCellValue(value, fallback = 'N/A') {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((item) => String(item)).join(', ') : fallback;
  }
  if (typeof value === 'object') {
    const named = value.label || value.name || value.value;
    if (named !== undefined && named !== null) return String(named);
    return fallback;
  }
  return String(value);
}

function formatPercentValue(value, fallback = 'N/A') {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return `${number.toFixed(2)}%`;
}
