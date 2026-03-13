
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../shared/Header';

const BungaAnalysis = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
        50% { box-shadow: 0 0 0 15px rgba(39, 174, 96, 0); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes scan {
        0% { top: 0%; }
        100% { top: 100%; }
      }
      .scanning-bar {
        position: absolute;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(39, 174, 96, 0.8);
        box-shadow: 0 0 15px 5px rgba(39, 174, 96, 0.5);
        z-index: 10;
        animation: scan 2s linear infinite;
      }
      .glass-card {
        animation: fadeInUp 0.6s ease forwards;
      }
      .result-card {
        animation: scaleIn 0.5s ease forwards;
      }
      .result-card-body {
        display: flex;
        flex-direction: column;
        min-height: 540px;
      }
      .result-card-main {
        flex: 3;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .result-note-card {
        grid-column: 2 / 3;
        background: rgba(0, 0, 0, 0.25);
        border-radius: 16px;
        padding: 16px 20px;
        border: 1px solid rgba(110, 255, 200, 0.22);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        line-height: 1.6;
        color: rgba(234, 255, 243, 0.9);
      }
      .result-note-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(87, 225, 140, 0.18);
        color: #57e18c;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.4px;
        text-transform: uppercase;
      }
      .analyzing-btn {
        animation: pulse 2s infinite;
      }
      .loading-shimmer {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      .leaf-analysis-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
        gap: 18px;
        align-items: start;
      }
      .leaf-analysis-layout.two-row {
        grid-template-areas:
          "image result"
          "image note"
          "advice advice";
      }
      .upload-card {
        grid-area: image;
        align-self: stretch;
      }
      .result-card-mainwrap {
        grid-area: result;
        align-self: stretch;
      }
      .result-note-card {
        grid-area: note;
        justify-self: stretch;
        align-self: stretch;
        min-height: 180px;
      }
      .advice-card {
        grid-area: advice;
      }
      .leaf-analysis-span {
        grid-column: 1 / -1;
      }
      .leaf-analysis-card {
        position: relative;
      }
      .image-frame {
        border-radius: 18px;
        overflow: hidden;
        border: 2px solid rgba(110, 255, 200, 0.22);
        background: rgba(6, 16, 12, 0.35);
        min-height: 420px;
      }
      .image-frame.is-empty {
        border-style: dashed;
        border-color: rgba(255, 255, 255, 0.2);
      }
      .result-placeholder {
        text-align: center;
        color: rgba(255, 255, 255, 0.75);
      }
      .result-placeholder h2 {
        margin: 12px 0 8px;
        font-size: 24px;
        color: #ffffff;
      }
      .result-placeholder p {
        margin: 0;
        font-size: 15px;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.7);
      }
      .result-placeholder-card {
        background: rgba(0, 0, 0, 0.25);
        border-radius: 16px;
        padding: 18px;
        margin-top: 18px;
        text-align: left;
      }
      .result-placeholder-card h4 {
        margin: 0 0 12px;
        font-size: 14px;
        color: #ffffff;
      }
      .result-placeholder-card ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 10px;
      }
      .result-placeholder-card li {
        position: relative;
        padding-left: 20px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.75);
      }
      .result-placeholder-card li::before {
        content: '-';
        position: absolute;
        left: 0;
        color: #27AE60;
        font-weight: 700;
      }
      .result-section {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 16px;
        padding: 18px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .result-section-title {
        margin: 0 0 12px;
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
      }
      .result-section-text {
        font-size: 15px;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.78);
        margin: 0 0 12px;
      }
      .result-section-label {
        display: block;
        font-size: 12px;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 6px;
      }
      .result-section-list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 10px;
      }
      .result-section-list li {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.78);
      }
      .result-section-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-top: 6px;
        background: #27AE60;
        flex-shrink: 0;
      }
      .advice-card {
        background: linear-gradient(135deg, rgba(20, 42, 32, 0.98), rgba(12, 26, 20, 0.96));
        border: 1px solid rgba(120, 255, 210, 0.28);
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 26px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(16px);
        color: rgba(234, 255, 243, 0.9);
      }
      .advice-card * {
        color: inherit;
      }
      .advice-card .advice-status {
        color: #57e18c;
      }
      .advice-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 18px;
      }
      .advice-title {
        margin: 0;
        font-size: 20px;
        font-weight: 800;
        color: #ffffff;
      }
      .advice-status {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        color: #57e18c;
      }
      .advice-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .advice-block {
        background: rgba(0, 0, 0, 0.32);
        border-radius: 16px;
        padding: 16px;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }
      .advice-block h5 {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 800;
        color: #eafff3;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .advice-block p {
        margin: 0;
        font-size: 14.5px;
        line-height: 1.65;
        color: rgba(234, 255, 243, 0.9);
      }
      .advice-list {
        display: grid;
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .advice-list li {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        font-size: 14.5px;
        line-height: 1.6;
        color: rgba(234, 255, 243, 0.9);
      }
      .advice-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-top: 6px;
        background: #57e18c;
        flex-shrink: 0;
      }
      @media (max-width: 900px) {
        .leaf-analysis-layout {
          grid-template-columns: 1fr;
          grid-template-areas:
            "image"
            "result"
            "note"
            "advice";
        }
        .advice-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const colors = {
    primary: '#1B4D3E',
    primaryLight: '#27AE60',
    success: '#2BB673',
    warning: '#F39C12',
    secondary: '#ffffffbb',
    background: '#f8faf798',
    text: '#1B4D3E',
    textLight: '#3c4d49f6',
    border: '#D4E5DD',
    accent: '#D4AF37',
    danger: '#E74C3C',
  };

  const ripenessRecommendations = {
    'Ripe': {
      icon: '',
      title: 'Peppercorn is Ripe',
      description: 'Your black pepper peppercorn has reached optimal ripeness for harvesting.',
      actions: ['Harvest immediately for best flavor', 'Use sharp pruning shears to avoid damage', 'Store in cool, dry place', 'Process or dry within 24 hours'],
      color: colors.success,
      gradient: 'linear-gradient(135deg, #2BB673 0%, #27AE60 100%)'
    },
    'Unripe': {
      icon: '',
      title: 'Peppercorn Not Yet Ripe',
      description: 'The peppercorn requires more time to reach full ripeness.',
      actions: ['Wait 5-7 more days before harvesting', 'Ensure adequate water and nutrients', 'Protect from birds and pests', 'Check daily for color change'],
      color: colors.warning,
      gradient: 'linear-gradient(135deg, #F2A93B 0%, #E67E22 100%)'
    },
    'Rotten': {
      icon: '',
      title: 'Peppercorn is Rotten',
      description: 'The peppercorn has deteriorated and is no longer usable.',
      actions: ['Remove immediately to prevent disease spread', 'Do not attempt to process or dry', 'Inspect nearby bunches for signs of rot', 'Improve ventilation to prevent future rot'],
      color: colors.danger,
      gradient: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'
    },
    'ripe': {
      icon: '',
      title: 'Peppercorn is Ripe',
      description: 'Your black pepper peppercorn has reached optimal ripeness for harvesting.',
      actions: ['Harvest immediately for best flavor', 'Use sharp pruning shears to avoid damage', 'Store in cool, dry place', 'Process or dry within 24 hours'],
      color: colors.success,
      gradient: 'linear-gradient(135deg, #2BB673 0%, #27AE60 100%)'
    },
    'unripe': {
      icon: '',
      title: 'Peppercorn Not Yet Ripe',
      description: 'The peppercorn requires more time to reach full ripeness.',
      actions: ['Wait 5-7 more days before harvesting', 'Ensure adequate water and nutrients', 'Protect from birds and pests', 'Check daily for color change'],
      color: colors.warning,
      gradient: 'linear-gradient(135deg, #F2A93B 0%, #E67E22 100%)'
    },
    'rotten': {
      icon: '',
      title: 'Peppercorn is Rotten',
      description: 'The peppercorn has deteriorated and is no longer usable.',
      actions: ['Remove immediately to prevent disease spread', 'Do not attempt to process or dry', 'Inspect nearby bunches for signs of rot', 'Improve ventilation to prevent future rot'],
      color: colors.danger,
      gradient: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'
    }
  };

  const getResultInfo = (result) => {
    if (!result) return null;
    const ripenessValue = result.ripeness || result.class || result.prediction || result.label;
    if (!ripenessValue) return null;
    const normalizedRipeness = ripenessValue.toString().toLowerCase();
    return ripenessRecommendations[normalizedRipeness] || null;
  };

  const getMarketGrade = (classStr) => {
    if (!classStr) return null;
    if (classStr.toLowerCase() === 'rotten') {
      return { grade: 'Reject', color: '#E74C3C', title: 'Reject Grade', description: 'This peppercorn is rotten and should not be processed or sold.', actions: ['Remove from harvest immediately', 'Do not process or dry', 'Prevent spread to other bunches'] };
    }
    const match = classStr.match(/Class\s*([A-D])-([a-d])/);
    if (!match) return null;
    const ripenessLetter = match[1];
    const healthLetter = match[2];
    if ((ripenessLetter === 'C' && healthLetter === 'd') || (ripenessLetter === 'D' && healthLetter === 'd')) {
      return { grade: 'Reject', color: '#E74C3C', title: 'Reject Grade', description: 'This peppercorn is not suitable for processing.', actions: ['Do not harvest or process', 'Wait for better development'] };
    }
    if (ripenessLetter === 'A' && healthLetter === 'a') {
      return { grade: 'Premium', color: '#D4AF37', title: 'Premium Grade', description: 'Excellent quality peppercorn suitable for export.', actions: ['Harvest and dry immediately', 'Use specialized drying equipment', 'Store in airtight containers'] };
    }
    if ((ripenessLetter === 'A' && healthLetter === 'b') || (ripenessLetter === 'B' && (healthLetter === 'a' || healthLetter === 'b'))) {
      return { grade: 'Standard', color: '#27AE60', title: 'Standard Grade', description: 'Good quality peppercorn for domestic markets.', actions: ['Harvest and dry using standard methods', 'Store in cool, dry conditions'] };
    }
    return { grade: 'Commercial', color: '#F39C12', title: 'Commercial Grade', description: 'Acceptable for commercial use.', actions: ['Harvest and dry with care', 'Sort and remove defective portions'] };
  };

  const detectionAdviceLibrary = {
    high: {
      classes: {
        a: {
          gradeKey: 'premium',
          gradeLabel: 'PREMIUM GRADE',
          tips: [
            { label: 'Best Use', text: 'Process immediately for White Pepper by soaking in clean water for 7 days to fetch the highest export price.' },
            { label: 'Black Pepper Tip', text: 'Blanch in 80C water for 1 minute before drying to achieve a premium, glossy jet-black finish.' },
            { label: 'Storage', text: 'Use hermetic (air-tight) bags and keep temperatures below 25C to lock in the high volatile oil content.' },
            { label: 'Value Strategy', text: 'Label as "Single-Origin" or "Estate Grade" to target gourmet spice markets.' },
          ],
        },
        b: {
          gradeKey: 'standard',
          gradeLabel: 'STANDARD GRADE',
          tips: [
            { label: 'Best Use', text: 'High-quality Whole Black Pepper for retail or wholesale distribution.' },
            { label: 'Processing', text: 'Use a mechanical thresher at low speed to remove stalks; ripe skins are soft and bruise easily.' },
            { label: 'Drying', text: 'Spread in a thin 3cm layer on black mats; perform a moisture test after 4 days to hit the 12% target.' },
            { label: 'Quality Check', text: 'Ensure the batch is kept away from smoke or strong odors, as ripe oils absorb ambient smells easily.' },
          ],
        },
        c: {
          gradeKey: 'commercial',
          gradeLabel: 'COMMERCIAL GRADE',
          tips: [
            { label: 'Best Use', text: 'Best suited for Ground Black Pepper; milling the berries hides surface blemishes while retaining flavor.' },
            { label: 'Pre-treatment', text: 'Wash in a 2% citric acid solution before drying to remove surface discoloration and neutralize bacteria.' },
            { label: 'Color Fix', text: 'Use a longer blanching time (2 mins) to force a uniform dark color across the "Fair" health spots.' },
            { label: 'Market Strategy', text: 'Sell to industrial spice blenders who prioritize heat and aroma over visual berry "boldness."' },
          ],
        },
        d: {
          gradeKey: 'commercial',
          gradeLabel: 'COMMERCIAL GRADE',
          tips: [
            { label: 'Best Use', text: 'Sell to industrial plants for Oleoresin or Oil Extraction; the inner chemistry is more valuable than the shell.' },
            { label: 'Sanitation', text: 'Deep-clean all baskets and mats with 10% bleach after handling this batch to kill lingering fungal spores.' },
            { label: 'Waste Control', text: 'If any berries show deep rot, bury them in a 1-meter pit with lime to protect your farm soil.' },
            { label: 'Risk Mitigation', text: 'Quarantine this batch 10 meters away from Premium stock to prevent cross-contamination.' },
          ],
        },
      },
    },
    mid: {
      classes: {
        ab: {
          gradeKey: 'standard',
          gradeLabel: 'STANDARD GRADE',
          tips: [
            { label: 'Best Use', text: 'The global benchmark for Bulk Black Pepper (FAQ Grade); target high-volume commodity wholesalers.' },
            { label: 'Logistics', text: 'Ensure high airflow with industrial fans for the first 24 hours to prevent the berries from fermenting.' },
            { label: 'Density Goal', text: 'Aim for a liter-weight of 550g/L; use a blower to winnow out light berries and increase batch value.' },
            { label: 'Specialty Idea', text: 'These are the best candidates for Freeze-Drying to produce high-value dehydrated green peppercorns.' },
          ],
        },
        cd: {
          gradeKey: 'commercial',
          gradeLabel: 'COMMERCIAL GRADE',
          tips: [
            { label: 'Best Use', text: 'Local market sales or low-value spice mixes where a lower density is acceptable.' },
            { label: 'Quality Sort', text: 'Use a water-flotation test; keep the sinkers for sale and discard floaters (hollow berries).' },
            { label: 'Safety Alert', text: 'Monitor for fuzzy mold growth; if detected, incinerate that portion immediately to avoid aflatoxins.' },
            { label: 'Blending', text: 'Limit this batch to 10% of any final blend to ensure you do not fail the overall liter-weight export test.' },
          ],
        },
      },
    },
    unripe: {
      classes: {
        ab: {
          gradeKey: 'standard',
          gradeLabel: 'STANDARD GRADE',
          tips: [
            { label: 'Best Use', text: 'Harvest as Green Peppercorns in brine or vinegar pickles for a crisp, pop texture.' },
            { label: 'Field Action', text: 'If still on the vine, apply Potash fertilizer immediately to help berries swell and reach Class C.' },
            { label: 'Drying Note', text: 'Expect high weight loss (80%); dry quickly at high heat to preserve the green chlorophyll color.' },
            { label: 'Value Strategy', text: 'Sell as Extra-Young Green Pepper flakes to niche spice blenders for a higher price markup.' },
          ],
        },
        c: {
          gradeKey: 'commercial',
          gradeLabel: 'COMMERCIAL GRADE',
          tips: [
            { label: 'Best Use', text: 'Internal farm use or non-food applications like organic insect repellent mulch.' },
            { label: 'Intervention', text: 'Poor health at this stage suggests vine stress; increase shade and irrigation to the parent plants.' },
            { label: 'Disease Check', text: 'Look for Yellow Mottle virus or sap-sucking insects that may be stunting the young fruit.' },
            { label: 'Resource Recovery', text: 'Do not waste expensive machine-drying time; sun-dry only if space and labor are free.' },
          ],
        },
        d: {
          gradeKey: 'reject',
          gradeLabel: 'REJECT',
          tips: [
            { label: 'Action', text: 'Automatic Reject. These will dry into pinheads (worthless dust) and should be culled immediately.' },
            { label: 'Diagnosis', text: 'Inspect vines for Quick Wilt (Phytophthora); blackening at the base of the stem is a critical warning.' },
            { label: 'System Alert', text: 'Removing this batch now saves fuel, space, and labor costs for your processing facility.' },
          ],
        },
      },
    },
    rotten: {
      gradeKey: 'reject',
      gradeLabel: 'REJECT',
      tips: [
        { label: 'Field Audit', text: 'Check your farm drainage and soil pH; rot usually signals waterlogged roots or acidic soil (pH < 5.5).' },
        { label: 'Storage Fix', text: 'Ensure your warehouse humidity is below 60%; use a dehumidifier to stop healthy berries from turning.' },
        { label: 'Safety', text: 'Dispose of this batch away from water sources; rot-prone berries can attract the Pepper Weevil pest.' },
        { label: 'Hygiene', text: 'Sanitize hands and all harvesting gear before returning to the field to prevent spreading the rot.' },
      ],
    },
  };

  const getDetectionAdvice = (analysisResult) => {
    if (!analysisResult) return null;
    const ripenessText = analysisResult.ripeness?.toLowerCase();
    const isRotten = ripenessText === 'rotten';
    const healthLetterMatch = String(analysisResult.health_class || '')
      .toLowerCase()
      .match(/[a-d]/);
    const healthLetter = healthLetterMatch ? healthLetterMatch[0] : '';
    const ripenessPct = Number(analysisResult.ripeness_percentage);

    let categoryKey = null;
    if (isRotten) {
      categoryKey = 'rotten';
    } else if (Number.isFinite(ripenessPct)) {
      if (ripenessPct >= 51) categoryKey = 'high';
      else if (ripenessPct >= 26) categoryKey = 'mid';
      else if (ripenessPct >= 0) categoryKey = 'unripe';
    } else if (ripenessText === 'ripe') {
      categoryKey = 'high';
    } else if (ripenessText === 'unripe') {
      categoryKey = 'unripe';
    }

    if (!categoryKey) return null;

    if (categoryKey === 'rotten') {
      return detectionAdviceLibrary.rotten;
    }

    if (!healthLetter) return null;

    const category = detectionAdviceLibrary[categoryKey];
    if (!category) return null;

    let advice = null;
    if (categoryKey === 'high') {
      advice = category.classes[healthLetter] || null;
    } else if (categoryKey === 'mid') {
      if (healthLetter === 'a' || healthLetter === 'b') advice = category.classes.ab;
      if (healthLetter === 'c' || healthLetter === 'd') advice = category.classes.cd;
    } else if (categoryKey === 'unripe') {
      if (healthLetter === 'a' || healthLetter === 'b') advice = category.classes.ab;
      if (healthLetter === 'c') advice = category.classes.c;
      if (healthLetter === 'd') advice = category.classes.d;
    }

    if (!advice) return null;

    return advice;
  };

  const getClassRipenessFromPercentage = (ripenessPercentage) => {
    const pct = Number(ripenessPercentage);
    if (!Number.isFinite(pct)) return null;
    if (pct >= 76) return { letter: 'A', label: 'Fully Ripe' };
    if (pct >= 51) return { letter: 'B', label: 'Semi-ripe' };
    if (pct >= 26) return { letter: 'C', label: 'Under-Ripe' };
    if (pct >= 0) return { letter: 'D', label: 'Unripe' };
    return null;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) { setError('Please select a valid image file'); return; }
      if (file.size > 10 * 1024 * 1024) { setError('Image size must be less than 10MB'); return; }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => { setPreview(reader.result); };
      reader.readAsDataURL(file);
      setError(null);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) { setError('Please select an image first'); return; }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) { setError('Authentication token not found. Please login again.'); setLoading(false); return; }

      const formData = new FormData();
      formData.append('image', image);

      const response = await axios.post(`${API_BASE_URL}/api/v1/predict/ripeness`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
        timeout: 180000
      });

      const responseData = response.data.data || response.data;

      if (response.data) {
        if (response.data.success === false) {
          setError(response.data.error || 'Prediction failed');
        } else if (responseData.ripeness || responseData.class) {
          let ripenessValue = responseData.ripeness;
          if (ripenessValue) {
            ripenessValue = ripenessValue.charAt(0).toUpperCase() + ripenessValue.slice(1).toLowerCase();
          }
          setResult({
            ...responseData,
            ripeness: ripenessValue || responseData.ripeness
          });
        } else {
          setError('No result received from server');
        }
      } else {
        setError('No result received from server');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      let errorMsg = 'Failed to analyze image. Please try again.';
      if (err.response?.data?.error) errorMsg = err.response.data.error;
      else if (err.message === 'Network Error') errorMsg = 'Network error. Make sure backend is running.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resultInfo = getResultInfo(result);
  const marketGrade = result && result.class ? getMarketGrade(result.class) : null;
  const marketGradeText = result?.market_grade || marketGrade?.grade || 'Unknown';
  const advice = getDetectionAdvice(result);
  const classInfo = getClassRipenessFromPercentage(result?.ripeness_percentage);
  const ripenessClassText = result?.ripeness?.toLowerCase() === 'rotten'
    ? 'Rotten'
    : (classInfo ? `Class ${classInfo.letter} - ${classInfo.label}` : 'Pending');
  const gradeColors = {
    premium: colors.accent,
    standard: colors.success,
    commercial: colors.warning,
    reject: colors.danger,
  };
  const adviceAccent = advice?.gradeKey ? (gradeColors[advice.gradeKey] || colors.primaryLight) : (resultInfo?.color || colors.primaryLight);
  const displayInfo = resultInfo || (result ? {
    title: result?.ripeness || result?.class || 'Analysis Complete',
    description: 'Your peppercorn has been analyzed successfully.',
    actions: [],
    color: colors.primaryLight,
    gradient: 'linear-gradient(135deg, #27AE60 0%, #1B4D3E 100%)',
  } : null);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <Header />

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        minHeight: '100vh',
        zIndex: -1,
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(0, 40, 20, 0.85) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(10, 30, 15, 0.75) 0%, transparent 50%),
          linear-gradient(180deg, rgba(10, 10, 10, 0.9) 0%, rgba(13, 26, 18, 0.85) 50%, rgba(10, 10, 10, 0.9) 100%),
          url('/registerBG.webp')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }} />

      <div style={{ minHeight: '100vh', padding: '90px 1in 40px' }}>
        <div style={{ maxWidth: 'min(1600px, calc(100% - 2in))', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              color: 'white',
              fontSize: '36px',
              fontWeight: '800',
              margin: '0 0 12px 0',
              textShadow: '0 2px 20px rgba(0, 255, 136, 0.3)',
              background: 'linear-gradient(135deg, #ffffff 0%, #00FF88 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Peppercorn Ripeness Analysis
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', margin: 0 }}>
              Upload a peppercorn image for AI-powered ripeness analysis
            </p>
          </div>

          <div className="leaf-analysis-layout two-row">
            <div className="glass-card leaf-analysis-card upload-card" style={{
              background: 'linear-gradient(135deg, rgba(16, 36, 28, 0.94), rgba(10, 22, 18, 0.9))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(110, 255, 200, 0.22)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '48px', height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1B4D3E 0%, #27AE60 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '800',
                  letterSpacing: '0.6px',
                  color: '#ffffff'
                }}>
                  BR
                </div>
                <div>
                  <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '700' }}>Peppercorn Ripeness Analyzer</h2>
                  <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Select an image to analyze</p>
                </div>
              </div>

              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div className={`image-frame ${preview ? '' : 'is-empty'}`}>
                  {preview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={preview} alt="Peppercorn preview" style={{
                        width: '100%',
                        height: result ? '520px' : '420px',
                        objectFit: 'contain',
                        background: 'rgba(0,0,0,0.25)',
                        display: 'block'
                      }} />
                      {loading && <div className="scanning-bar" />}
                      {loading && (
                        <div style={{
                          position: 'absolute', bottom: '20px', left: '0', width: '100%',
                          textAlign: 'center', color: 'white', textShadow: '0 2px 4px black',
                          fontWeight: '600'
                        }}>
                          Detecting ripeness...<br />Analyzing peppercorn...
                        </div>
                      )}
                      <button
                        onClick={() => { setImage(null); setPreview(null); setResult(null); setError(null); }}
                        style={{
                          position: 'absolute', top: '12px', right: '12px',
                          width: '36px', height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(231, 76, 60, 0.9)',
                          border: 'none', color: 'white',
                          cursor: 'pointer', fontSize: '16px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '700'
                        }}
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      padding: '70px 20px',
                      textAlign: 'center',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
                    }}>
                      <div style={{ fontSize: '36px', opacity: 0.5 }}>IMG</div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>No image selected</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Click button below to upload</div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '20px' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: loading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {preview ? 'Change' : 'Upload'}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />

              {error && (
                <div style={{
                  background: 'rgba(231, 76, 60, 0.15)',
                  border: '1px solid rgba(231, 76, 60, 0.3)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '20px',
                  color: '#E74C3C',
                  fontSize: '14px',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <span>!</span> {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!image || loading}
                className={loading ? 'analyzing-btn' : ''}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: image && !loading
                    ? 'linear-gradient(135deg, #27AE60 0%, #1B4D3E 100%)'
                    : 'rgba(255,255,255,0.1)',
                  color: image && !loading ? 'white' : 'rgba(255,255,255,0.4)',
                  cursor: image && !loading ? 'pointer' : 'not-allowed',
                  fontWeight: '700',
                  fontSize: '16px',
                  boxShadow: image && !loading ? '0 8px 25px rgba(39, 174, 96, 0.4)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Analyzing...' : 'Analyze Peppercorn'}
              </button>
            </div>

            {result && displayInfo ? (
              <>
                <div className="result-card leaf-analysis-card result-card-mainwrap" style={{
                  background: 'linear-gradient(135deg, rgba(16, 36, 28, 0.94), rgba(10, 22, 18, 0.9))',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  padding: '28px',
                  border: `1px solid ${displayInfo.color}55`,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                  borderLeft: `4px solid ${displayInfo.color}`
                }}>
                  <div className="result-card-body">
                    <div className="result-card-main">
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{
                          width: '72px', height: '72px',
                          borderRadius: '50%',
                          background: displayInfo.gradient,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px',
                          margin: '0 auto 14px',
                          boxShadow: `0 8px 30px ${displayInfo.color}40`,
                          color: '#ffffff',
                          fontWeight: '800',
                          letterSpacing: '0.4px'
                        }}>
                          BP
                        </div>
                        <h2 style={{ margin: 0, color: displayInfo.color, fontSize: '24px', fontWeight: '800', letterSpacing: '0.3px' }}>
                          {displayInfo.title}
                        </h2>
                      </div>

                      <div className="result-section" style={{ marginBottom: '16px' }}>
                        <span className="result-section-label">Quality Snapshot</span>
                        <p className="result-section-text">Ripeness Class: {ripenessClassText}</p>
                        <p className="result-section-text">
                          Ripeness Percentage: {Number.isFinite(Number(result?.ripeness_percentage)) ? `${Number(result.ripeness_percentage)}%` : 'N/A'}
                        </p>
                        <p className="result-section-text">
                          Health Percentage: {Number.isFinite(Number(result?.health_percentage)) ? `${Number(result.health_percentage)}%` : 'N/A'}
                        </p>
                        <p className="result-section-text">Market Grade: {marketGradeText}</p>
                      </div>

                      <p className="result-section-text" style={{ textAlign: 'center' }}>
                        {displayInfo.description}
                      </p>
                    </div>

                    <button
                      onClick={() => { setImage(null); setPreview(null); setResult(null); setError(null); }}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: displayInfo.gradient,
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '15px',
                        boxShadow: `0 4px 15px ${displayInfo.color}40`,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Analyze Another Peppercorn
                    </button>
                  </div>
                </div>

                <div className="result-note-card">
                  <span className="result-note-pill">Note</span>
                  <span>Advice and recommendations will appear in the section below.</span>
                </div>

                <div className="advice-card leaf-analysis-span">
                  <div className="advice-header">
                    <h3 className="advice-title">Advice & Recommendations</h3>
                    <span className="advice-status" style={{ color: adviceAccent }}>
                      {advice ? advice.gradeLabel : 'Advisory pending'}
                    </span>
                  </div>

                  <div className="advice-grid">
                    <div className="advice-block">
                      <h5>Recommended Actions</h5>
                      {displayInfo.actions && displayInfo.actions.length > 0 ? (
                        <ul className="advice-list">
                          {displayInfo.actions.map((action, idx) => (
                            <li key={idx}>
                              <span className="advice-dot" style={{ background: displayInfo.color }} />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Recommendations will appear after analysis.</p>
                      )}
                    </div>

                    <div className="advice-block">
                      <h5>Ripeness Summary</h5>
                      <p>{displayInfo.description}</p>
                    </div>

                    {marketGrade && (
                      <div className="advice-block">
                        <h5>Market Grade</h5>
                        <p>{marketGrade.title}</p>
                        <ul className="advice-list">
                          {marketGrade.actions.map((action, idx) => (
                            <li key={idx}>
                              <span className="advice-dot" style={{ background: marketGrade.color }} />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {advice && advice.tips && advice.tips.length > 0 && (
                      <div className="advice-block">
                        <h5>Analyzation Advice</h5>
                        <ul className="advice-list">
                          {advice.tips.map((tip, idx) => (
                            <li key={idx}>
                              <span className="advice-dot" style={{ background: adviceAccent }} />
                              <span>
                                <strong>{tip.label}:</strong> {tip.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="result-card leaf-analysis-card result-card-mainwrap" style={{
                background: 'linear-gradient(135deg, rgba(16, 36, 28, 0.94), rgba(10, 22, 18, 0.9))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '32px',
                border: '1px solid rgba(110, 255, 200, 0.22)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                borderLeft: '4px solid rgba(39, 174, 96, 0.6)'
              }}>
                <div className="result-placeholder">
                  <div style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '28px',
                    margin: '0 auto',
                    background: 'rgba(39, 174, 96, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#27AE60',
                    border: '1px solid rgba(39, 174, 96, 0.35)',
                    fontWeight: '800',
                    letterSpacing: '0.4px'
                  }}>
                    BR
                  </div>
                  <h2>Results will appear here</h2>
                  <p>Upload a peppercorn image and run analysis to see ripeness, health, and market grade.</p>
                  <div className="result-placeholder-card">
                    <h4>What you will see</h4>
                    <ul>
                      <li>Fully Ripe / Semi-ripe / Under-Ripe / Unripe</li>
                      <li>Ripeness Percentage</li>
                      <li>Health Percentage</li>
                      <li>Market Grade</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BungaAnalysis;
