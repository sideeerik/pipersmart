const PDFDocument = require('pdfkit');

const ACTIVITY_TYPES = ['BUNGA_ANALYSIS', 'LEAF_ANALYSIS', 'FORUM_POST', 'SAVED_LOCATION'];

function safeDate(activity) {
  return activity.createdAt || activity.savedAt || new Date();
}

function extractBungaRipeness(activity) {
  const raw = activity.results?.ripeness;
  if (typeof raw === 'object' && raw !== null) {
    return raw.grade || 'Unknown';
  }
  return raw || 'Unknown';
}

function extractBungaConfidence(activity) {
  if (typeof activity.results?.confidence === 'number') {
    return activity.results.confidence;
  }
  if (typeof activity.results?.ripeness?.confidence === 'number') {
    return activity.results.ripeness.confidence;
  }
  return 0;
}

function extractLeafConfidence(activity) {
  if (typeof activity.results?.confidence === 'number') {
    return activity.results.confidence;
  }
  return 0;
}

function formatSavedLocation(activity) {
  const farm = activity.farm || {};
  const name = farm.name || 'Unnamed Location';
  const address = farm.address || 'Location saved';
  const latitude = typeof farm.latitude === 'number' ? farm.latitude.toFixed(4) : 'N/A';
  const longitude = typeof farm.longitude === 'number' ? farm.longitude.toFixed(4) : 'N/A';

  return {
    name,
    address,
    coordinates: `Lat: ${latitude}, Lng: ${longitude}`,
  };
}

function formatType(type) {
  switch (type) {
    case 'BUNGA_ANALYSIS':
      return 'Bunga Analysis';
    case 'LEAF_ANALYSIS':
      return 'Leaf Analysis';
    case 'FORUM_POST':
      return 'Forum Post';
    case 'SAVED_LOCATION':
      return 'Saved Location';
    default:
      return type || 'Unknown';
  }
}

function getActivityTitle(activity) {
  switch (activity.type) {
    case 'BUNGA_ANALYSIS': {
      const ripeness = extractBungaRipeness(activity);
      const grade = activity.results?.market_grade || 'N/A';
      return `Bunga Analysis: ${ripeness} (${grade})`;
    }
    case 'LEAF_ANALYSIS':
      return `Leaf Disease: ${activity.results?.disease || 'Unknown'}`;
    case 'FORUM_POST':
      return `Forum Post in "${activity.threadId?.title || 'Unknown Thread'}"`;
    case 'SAVED_LOCATION':
      return `Saved Location: ${activity.farm?.name || 'Unnamed Location'}`;
    default:
      return 'Recent Activity';
  }
}

function getActivityDescription(activity) {
  switch (activity.type) {
    case 'BUNGA_ANALYSIS': {
      const ripeness = extractBungaRipeness(activity);
      const healthClass = activity.results?.health_class || 'N/A';
      const confidence = extractBungaConfidence(activity);
      return `${ripeness} | Health: ${healthClass} | Confidence: ${confidence}%`;
    }
    case 'LEAF_ANALYSIS': {
      const disease = activity.results?.disease || 'Unknown';
      const confidence = extractLeafConfidence(activity);
      return `${disease} | Confidence: ${confidence}%`;
    }
    case 'FORUM_POST':
      return `Posted in "${activity.threadId?.title || 'Unknown Thread'}"`;
    case 'SAVED_LOCATION': {
      const location = formatSavedLocation(activity);
      return `${location.address} | ${location.coordinates}`;
    }
    default:
      return 'Activity recorded';
  }
}

function getActivityDetails(activity) {
  switch (activity.type) {
    case 'BUNGA_ANALYSIS': {
      const ripeness = extractBungaRipeness(activity);
      const ripenessPercentage = activity.results?.ripeness_percentage || activity.results?.ripeness?.percentage || 0;
      const healthClass = activity.results?.health_class || 'N/A';
      const healthPercentage = activity.results?.health_percentage || activity.results?.health?.percentage || 0;
      const confidence = extractBungaConfidence(activity);
      const marketGrade = activity.results?.market_grade || 'Unknown';
      const processingTime = activity.processingTime || 0;

      return [
        `Ripeness: ${ripeness}`,
        `Ripeness %: ${ripenessPercentage}%`,
        `Health Class: ${healthClass}`,
        `Health %: ${healthPercentage}%`,
        `Confidence: ${confidence}%`,
        `Market Grade: ${marketGrade}`,
        `Processing Time: ${processingTime}ms`,
      ];
    }
    case 'LEAF_ANALYSIS': {
      const disease = activity.results?.disease || 'Unknown';
      const confidence = extractLeafConfidence(activity);
      const detections = Array.isArray(activity.results?.detections) ? activity.results.detections.length : 0;
      const processingTime = activity.processingTime || 0;

      return [
        `Disease: ${disease}`,
        `Confidence: ${confidence}%`,
        `Detections: ${detections}`,
        `Processing Time: ${processingTime}ms`,
      ];
    }
    case 'FORUM_POST': {
      const content = activity.content || '';
      const preview = content.length > 120 ? `${content.substring(0, 120)}...` : content;
      return [
        `Thread: ${activity.threadId?.title || 'Unknown Thread'}`,
        `Content: ${preview || 'N/A'}`,
      ];
    }
    case 'SAVED_LOCATION': {
      const location = formatSavedLocation(activity);
      return [
        `Location Name: ${location.name}`,
        `Address: ${location.address}`,
        `Coordinates: ${location.coordinates}`,
      ];
    }
    default:
      return [];
  }
}

function computeSummary(activities) {
  return {
    BUNGA_ANALYSIS: activities.filter((a) => a.type === 'BUNGA_ANALYSIS').length,
    LEAF_ANALYSIS: activities.filter((a) => a.type === 'LEAF_ANALYSIS').length,
    FORUM_POST: activities.filter((a) => a.type === 'FORUM_POST').length,
    SAVED_LOCATION: activities.filter((a) => a.type === 'SAVED_LOCATION').length,
  };
}

function ensurePdfPageSpace(doc, requiredSpace) {
  if (doc.y + requiredSpace > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

// ============ PDF EXPORT ============
exports.generateActivityPDF = (user, activities, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const summary = computeSummary(activities);
      const generatedAt = new Date();
      const notes = options.notes ? String(options.notes).trim() : '';

      doc.fontSize(24).font('Helvetica-Bold').fillColor('#1B4D3E').text('PiperSmart', { align: 'center' });
      doc.fontSize(12).font('Helvetica').fillColor('#000').text('Recent Activities Report', { align: 'center' });
      doc
        .fontSize(10)
        .fillColor('#666')
        .text(`Generated on ${generatedAt.toLocaleDateString()} at ${generatedAt.toLocaleTimeString()}`, { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1B4D3E').text('User Information');
      doc.fontSize(10).font('Helvetica').fillColor('#000');
      doc.text(`Name: ${user.name || 'N/A'}`);
      doc.text(`Email: ${user.email || 'N/A'}`);
      doc.text(`Role: ${user.role || 'User'}`);
      doc.moveDown(0.8);

      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1B4D3E').text('Summary');
      doc.fontSize(10).font('Helvetica').fillColor('#000');
      doc.text(`Total Activities: ${activities.length}`);
      doc.text(`Bunga Analysis: ${summary.BUNGA_ANALYSIS}`);
      doc.text(`Leaf Analysis: ${summary.LEAF_ANALYSIS}`);
      doc.text(`Forum Posts: ${summary.FORUM_POST}`);
      doc.text(`Saved Locations: ${summary.SAVED_LOCATION}`);
      doc.moveDown(1);

      if (notes) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1B4D3E').text('Export Notes');
        doc.fontSize(10).font('Helvetica').fillColor('#333').text(notes);
        doc.moveDown(1);
      }

      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1B4D3E').text('Activities');
      doc.moveDown(0.3);

      activities.forEach((activity, index) => {
        ensurePdfPageSpace(doc, 110);

        const dateValue = new Date(safeDate(activity));
        const details = getActivityDetails(activity);

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#1B4D3E').text(`${index + 1}. ${getActivityTitle(activity)}`);
        doc.fontSize(9).font('Helvetica').fillColor('#333').text(`Type: ${formatType(activity.type)}`);
        doc.text(`Date: ${dateValue.toLocaleString()}`);
        doc.text(`Description: ${getActivityDescription(activity)}`);

        details.forEach((detail) => {
          doc.text(`- ${detail}`);
        });

        doc.moveDown(0.8);
        doc.strokeColor('#D4E5DD').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.5);
      });

      doc.fontSize(8).fillColor('#777').text('Report generated by PiperSmart', { align: 'center' });
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildWordHtml(user, activities, options = {}) {
  const summary = computeSummary(activities);
  const generatedAt = new Date();
  const notes = options.notes ? String(options.notes).trim() : '';

  const rows = activities
    .map((activity, index) => {
      const details = getActivityDetails(activity).join(' | ');
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(getActivityTitle(activity))}</td>
          <td>${escapeHtml(formatType(activity.type))}</td>
          <td>${escapeHtml(new Date(safeDate(activity)).toLocaleString())}</td>
          <td>${escapeHtml(getActivityDescription(activity))}</td>
          <td>${escapeHtml(details)}</td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>PiperSmart Recent Activities</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1f2937; }
    h1 { color: #1B4D3E; margin-bottom: 0; }
    h2 { margin-top: 4px; color: #374151; font-size: 18px; }
    .meta { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
    .section-title { color: #1B4D3E; font-weight: 700; margin-top: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #e8f5e9; color: #1B4D3E; }
  </style>
</head>
<body>
  <h1>PiperSmart</h1>
  <h2>Recent Activities Report</h2>
  <div class="meta">Generated on ${escapeHtml(generatedAt.toLocaleDateString())} at ${escapeHtml(generatedAt.toLocaleTimeString())}</div>

  <div class="section-title">User Information</div>
  <div>Name: ${escapeHtml(user.name || 'N/A')}</div>
  <div>Email: ${escapeHtml(user.email || 'N/A')}</div>
  <div>Role: ${escapeHtml(user.role || 'User')}</div>

  <div class="section-title">Summary</div>
  <div>Total Activities: ${activities.length}</div>
  <div>Bunga Analysis: ${summary.BUNGA_ANALYSIS}</div>
  <div>Leaf Analysis: ${summary.LEAF_ANALYSIS}</div>
  <div>Forum Posts: ${summary.FORUM_POST}</div>
  <div>Saved Locations: ${summary.SAVED_LOCATION}</div>

  ${notes ? `<div class="section-title">Export Notes</div><div>${escapeHtml(notes)}</div>` : ''}

  <div class="section-title">Activities</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Activity</th>
        <th>Type</th>
        <th>Date</th>
        <th>Description</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>
`;
}

// ============ WORD EXPORT (.doc HTML format) ============
exports.generateActivityWord = async (user, activities, options = {}) => {
  const html = buildWordHtml(user, activities, options);
  return Buffer.from(html, 'utf8');
};

// ============ HELPER FUNCTIONS ============
exports.getActivityTitle = getActivityTitle;

// Filter activities by date range
exports.filterActivitiesByDate = (activities, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return activities;
  }

  return activities.filter((activity) => {
    const actDate = new Date(safeDate(activity));
    return actDate >= start && actDate <= end;
  });
};

// Filter activities by type
exports.filterActivitiesByType = (activities, types) => {
  if (!Array.isArray(types) || types.length === 0) return activities;

  const normalizedTypes = types
    .map((type) => String(type).trim())
    .filter((type) => ACTIVITY_TYPES.includes(type));

  if (normalizedTypes.length === 0) return activities;
  return activities.filter((activity) => normalizedTypes.includes(activity.type));
};
