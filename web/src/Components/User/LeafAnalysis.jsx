import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../shared/Header';

// Floating Leaves Component with animation
const FloatingLeaves = () => {
  const leaves = [
    { top: '8%', left: '3%', rotation: '15deg', opacity: 0.12, size: '36px', animationDuration: '20s' },
    { top: '15%', left: '88%', rotation: '-25deg', opacity: 0.1, size: '32px', animationDuration: '25s' },
    { top: '45%', left: '2%', rotation: '35deg', opacity: 0.08, size: '28px', animationDuration: '22s' },
    { top: '70%', left: '92%', rotation: '-40deg', opacity: 0.1, size: '40px', animationDuration: '18s' },
    { top: '35%', left: '95%', rotation: '50deg', opacity: 0.08, size: '26px', animationDuration: '28s' },
    { top: '85%', left: '8%', rotation: '-15deg', opacity: 0.1, size: '34px', animationDuration: '24s' },
    { top: '55%', left: '5%', rotation: '60deg', opacity: 0.06, size: '30px', animationDuration: '21s' },
    { top: '25%', left: '75%', rotation: '-30deg', opacity: 0.08, size: '38px', animationDuration: '26s' },
  ];

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(var(--rotation)); }
        50% { transform: translateY(-20px) rotate(calc(var(--rotation) + 10deg)); }
      }
      .leaf-float {
        animation: float var(--duration) ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {leaves.map((leaf, idx) => (
        <span key={idx} className="leaf-float" style={{
          position: 'absolute',
          top: leaf.top,
          left: leaf.left,
          opacity: leaf.opacity,
          fontSize: leaf.size,
          '--rotation': leaf.rotation,
          '--duration': leaf.animationDuration,
        }}>
          
        </span>
      ))}
    </div>
  );
};

const LeafAnalysis = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);
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
    primaryDark: '#0D2818',
    primaryLight: '#27AE60',
    secondary: '#FFFFFF',
    background: '#F8FAF7',
    text: '#1B4D3E',
    textLight: '#5A7A73',
    border: '#D4E5DD',
    accent: '#D4AF37',
    warning: '#F39C12',
    danger: '#E74C3C',
    success: '#27AE60',
  };

  const diseaseRecommendations = {
    'Healthy': {
      icon: '',
      title: 'Plant is Healthy',
      description: 'Your pepper plant shows no signs of disease. Keep up the great work!',
      actions: ['Continue regular watering routine', 'Weekly monitoring recommended', 'Maintain proper plant spacing', 'Ensure adequate sunlight exposure'],
      color: colors.success,
      gradient: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)'
    },
    'Footrot': {
      icon: '',
      title: 'Footrot Disease Detected',
      description: 'This is a serious fungal disease affecting the base of the plant. Immediate action recommended.',
      actions: ['Remove infected plant parts immediately', 'Improve soil drainage', 'Apply copper-based fungicide', 'Avoid waterlogging', 'Quarantine affected plants'],
      color: colors.danger,
      gradient: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'
    },
    'Pollu_Disease': {
      icon: '',
      title: 'Pollu Disease Detected',
      description: 'Viral infection causing leaf curling and discoloration. Spread by aphids.',
      actions: ['Isolate affected plant immediately', 'Remove all diseased leaves', 'Control aphid population', 'Apply insecticidal soap', 'Monitor nearby plants'],
      color: colors.warning,
      gradient: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)'
    },
    'Slow-Decline': {
      icon: '',
      title: 'Slow Decline Detected',
      description: 'Progressive weakening of plant vigor. Usually caused by poor soil conditions.',
      actions: ['Test soil moisture levels', 'Conduct soil pH test', 'Improve fertilization schedule', 'Ensure proper drainage', 'Add organic matter to soil'],
      color: colors.warning,
      gradient: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)'
    },
    'Slow_Decline': {
      icon: '',
      title: 'Slow Decline Detected',
      description: 'Progressive weakening of plant vigor. Usually caused by poor soil conditions.',
      actions: ['Test soil moisture levels', 'Conduct soil pH test', 'Improve fertilization schedule', 'Ensure proper drainage', 'Add organic matter to soil'],
      color: colors.warning,
      gradient: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)'
    },
    'Leaf_Blight': {
      icon: '',
      title: 'Leaf Blight Detected',
      description: 'Fungal infection causing leaf spots, browning, and premature leaf drop.',
      actions: ['Remove and destroy affected leaves', 'Improve air circulation', 'Reduce leaf wetness duration', 'Apply copper fungicide', 'Avoid overhead watering'],
      color: colors.danger,
      gradient: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'
    },
    'Yellow_Mottle_Virus': {
      icon: '',
      title: 'Yellow Mottle Virus',
      description: 'Viral infection causing yellow patterns on leaves. Can spread rapidly.',
      actions: ['Remove infected plant if severe', 'Control insect vectors aggressively', 'Sanitize all tools', 'Avoid working with wet plants', 'Monitor all nearby plants'],
      color: colors.danger,
      gradient: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'
    }
  };

  const leafAdvisoryGuide = {
    Healthy: {
      status: 'Plant is Vigorous',
      description: 'Leaves are vibrant green with optimal chlorophyll levels and no visible pathogen interference.',
      commonSymptoms: 'Glossy leaf surface; uniform green color; smooth margins with no lesions, curling, or distortion.',
      prevention: 'Maintain balanced NPK levels; apply Neem oil (prophylactic) monthly to repel sap-sucking vectors from the foliage.',
      treatment: 'No chemical treatment required.',
      primaryAdvice: 'Focus on leaf-absorbed biostimulants like seaweed extract to boost immunity for the upcoming flowering season.',
      advancedProTips: [
        'Precision Feeding: Every 6 months, conduct a soil pH test (Target: 5.5-6.5). If pH is off, the leaves cannot absorb the NPK nutrients you provide.',
        'Micro-Nutrient Boost: Apply a foliar spray of Zinc and Magnesium during spike initiation to ensure maximum berry setting and leaf health.',
      ],
    },
    Footrot: {
      status: 'CRITICAL: Immediate Action Required',
      description: 'A lethal fungal infection (Phytophthora) detected by rapid leaf degradation and vascular blockage.',
      commonSymptoms: 'Water-soaked dark lesions on the leaf surface; rapid yellowing; total leaf drop (defoliation) within days.',
      prevention: 'Ensure raised-bed planting for drainage; apply Trichoderma-enriched manure to the soil before the monsoon.',
      treatment: 'Drench the soil and spray the foliage with 1% Bordeaux mixture or Metalaxyl-Mancozeb (0.2%).',
      primaryAdvice: 'Check the vine base for blackening; if the collar is rotten, the vine may need to be removed to save neighbors.',
      advancedProTips: [
        'Containment Trenching: Dig a 30cm deep isolation trench around the infected vine to cut off root-to-root spread of fungi.',
        'The 3-Step Drench: Treat the infected vine AND the immediate 8 healthy neighbor vines; the fungus spreads underground before leaves show wilt.',
      ],
    },
    Pollu_Disease: {
      status: 'WARNING: Crop Quality Risk',
      description: 'A fungal pathogen detected via foliar spots that eventually migrates to fruit spikes, causing "hollow berries."',
      commonSymptoms: 'Circular brown spots with distinct yellow halos on the leaves; necrotic (dead) patches on leaf margins.',
      prevention: 'Prune for better aeration; regulate shade to ensure at least 50% sunlight reaches the leaf canopy.',
      treatment: 'Apply Copper Oxychloride (0.2%) or Carbendazim (0.1%) sprays twice during the monsoon cycle.',
      primaryAdvice: 'Remove all fallen leaves and spikes from the basin, as they act as a reservoir for spores that re-infect the plant.',
      advancedProTips: [
        'Shade Regulation: Use a lux meter to ensure light intensity is between 2,000-3,000 foot-candles. Over-shading breeds this leaf-eating fungus.',
        'Spike Protection: Prioritize spraying the fruit spikes specifically to prevent "hollow berries," which can reduce harvest weight by 40%.',
      ],
    },
    Leaf_Blight: {
      status: 'ATTENTION: Localized Infection',
      description: 'A localized infection spread through leaf-to-leaf contact, usually triggered by rain splashes and high humidity.',
      commonSymptoms: 'Large, papery brown patches that look "burnt"; visible fungal threads (mycelium) often found on the leaf underside.',
      prevention: 'Avoid overhead irrigation; keep the area around the vine free of weeds that trap moisture near lower leaves.',
      treatment: 'Use a foliar spray of Mancozeb (0.2%) or Propiconazole; ensure total coverage of the leaf underside.',
      primaryAdvice: 'Sanitize pruning shears with alcohol after use to prevent spreading the blight from infected leaves to healthy ones.',
      advancedProTips: [
        'Mulch Management: Replace damp mulch with fresh, dry organic matter. Old mulch acts as a springboard for fungal spores to splash onto lower leaves.',
        'Morning Watering: Irrigate before 9:00 AM. This allows the sun to dry the leaves quickly; wet leaves at night are the #1 cause of blight outbreaks.',
      ],
    },
    Yellow_Mottle_Virus: {
      status: 'ALERT: Viral Contamination',
      description: "A systemic virus spread by insects. The leaves act as the primary visual indicator of the plant's internal viral load.",
      commonSymptoms: 'Distinct yellow mosaic patterns on the leaf; leaf curling/puckering; brittle, narrow, and distorted leaf growth.',
      prevention: 'Use only certified disease-free cuttings; strictly control mealybugs on the foliage using Imidacloprid.',
      treatment: 'No chemical cure. Infected vines must be uprooted and burnt to stop the spread.',
      primaryAdvice: 'Do not take any cuttings from this vine; the virus will inhabit any new plants created from this infected foliage.',
      advancedProTips: [
        'Vector Scouting: Inspect leaf undersides and node joints for white, cottony masses (Mealybugs). Killing the bugs stops the virus from moving.',
        'Tool Sterilization: If you prune an infected vine, you must flame-sterilize or soak tools in 10% bleach for 5 minutes before touching a healthy vine.',
      ],
    },
    Slow_Decline: {
      status: 'MANAGEMENT REQUIRED: Long-term Stress',
      description: 'A root-based complex where leaf yellowing and size reduction signal that the root system is failing.',
      commonSymptoms: 'Gradual paling/yellowing of the entire canopy; reduced leaf size over time; "die-back" of terminal twigs.',
      prevention: 'Apply Neem cake (1-2 kg) to the base annually; avoid moving soil from "declined" leaf zones to healthy zones.',
      treatment: 'Drench roots with bio-nematicides (Paecilomyces) or apply Phorate (10g) per vine if the decline is severe.',
      primaryAdvice: 'This is a root issue; if the leaves are showing these symptoms, the roots are already 50% compromised. Act on the soil immediately.',
      advancedProTips: [
        'Root Health Check: Dig up a small feeder root. If you see tiny knots or galls (bead-like), you have a nematode infestation destroying the leaf-feeding system.',
        'Potash Recovery: Increase Potassium (K) application by 20%. Potash helps the leaves "pump" water more effectively, compensating for nematode root damage.',
      ],
    },
  };

  const normalizeDiseaseeName = (diseaseName) => {
    const diseaseMapping = {
      'healthy': 'Healthy',
      'footrot': 'Footrot',
      'pollu': 'Pollu_Disease',
      'pollu_disease': 'Pollu_Disease',
      'slow-decline': 'Slow-Decline',
      'slow_decline': 'Slow_Decline',
      'slowdecline': 'Slow_Decline',
      'leaf-blight': 'Leaf_Blight',
      'leaf_blight': 'Leaf_Blight',
      'leafblight': 'Leaf_Blight',
      'yellow-mottle': 'Yellow_Mottle_Virus',
      'yellow_mottle': 'Yellow_Mottle_Virus',
      'yellow_mottle_virus': 'Yellow_Mottle_Virus',
      'ymv': 'Yellow_Mottle_Virus'
    };
    const lowerName = (diseaseName || '').toLowerCase().trim();
    return diseaseMapping[lowerName] || diseaseName;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
      setResult(null);
    }
  };

  const handlePredict = async () => {
    if (!image) {
      setError('Please select an image first');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    const startTime = Date.now();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', image);

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/predict/disease`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          timeout: 60000
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Backend returns: { success, message, data: { disease, confidence }, processingTime }
      const responseData = response.data.data || response.data;

      if (response.data) {
        if (response.data.success === false) {
          setError(response.data.error || 'Prediction failed');
        } else if (responseData.disease) {
          const normalizedDisease = normalizeDiseaseeName(responseData.disease);
          setResult({ ...responseData, disease: normalizedDisease, processingTime: duration });
          setProcessingTime(duration);
        } else {
          setError('No disease detected in response');
        }
      } else {
        setError('No response from server');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      let errorMsg = 'Failed to analyze image. Please try again.';
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message === 'Network Error') {
        errorMsg = 'Network error. Make sure backend is running.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getDiseaseInfo = (diseaseName) => {
    const normalized = normalizeDiseaseeName(diseaseName);
    return diseaseRecommendations[normalized] || {
      icon: '',
      title: `${diseaseName || 'Unknown'} Disease`,
      description: 'Unable to identify the disease. Please consult an agricultural expert.',
      actions: ['Consult agricultural expert', 'Get professional diagnosis', 'Take clear photos of symptoms'],
      color: colors.textLight,
      gradient: 'linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)'
    };
  };

  const getLeafAdvisory = (diseaseName) => {
    const normalized = normalizeDiseaseeName(diseaseName);
    return leafAdvisoryGuide[normalized] || null;
  };

  const resultInfo = result ? getDiseaseInfo(result.disease) : null;
  const advisory = result ? getLeafAdvisory(result.disease) : null;

  // Calculate confidence level
  const getConfidenceLevel = (confidence) => {
    if (confidence >= 85) return { label: 'High Confidence', color: colors.success };
    if (confidence >= 60) return { label: 'Medium Confidence', color: colors.warning };
    return { label: 'Low Confidence', color: colors.danger };
  };

  const confidenceLevel = result ? getConfidenceLevel(result.confidence) : null;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <Header />
      
      {/* Floating Leaves Background */}
      <FloatingLeaves />

      {/* Background with bpplant.jpg and opacity overlay */}
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
          url('/plant.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }} />
      
      <div style={{ minHeight: '100vh', padding: '90px 1in 40px' }}>
        <div style={{ maxWidth: 'min(1600px, calc(100% - 2in))', margin: '0 auto', width: '100%' }}>
          
          {/* Header */}
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
               Leaf Disease Detection
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', margin: 0 }}>
              Upload a leaf image for AI-powered disease analysis
            </p>
          </div>

          {/* Dual Card Layout */}
          <div className="leaf-analysis-layout two-row">
            
            {/* Upload Card */}
            <div className="glass-card leaf-analysis-card upload-card" style={{
              background: 'linear-gradient(135deg, rgba(16, 36, 28, 0.94), rgba(10, 22, 18, 0.9))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(110, 255, 200, 0.22)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
            }}>
              {/* Card Header */}
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
                  LE
                </div>
                <div>
                  <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '700' }}>Upload Leaf Image</h2>
                  <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Select an image to analyze</p>
                </div>
              </div>

{/* Image Preview - Widens when results are shown */}
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div className={`image-frame ${preview ? '' : 'is-empty'}`}>
{preview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={preview} alt="Preview" style={{ 
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
                          Detecting Disease...<br/>Analyzing Leaf...
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
                          cursor: 'pointer', fontSize: '18px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        
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
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Click buttons below to upload</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
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
                onClick={handlePredict} 
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
                {loading ? 'Analyzing...' : 'Analyze Leaf'}
              </button>
            </div>

            {/* Results Cards */}
            {result && resultInfo ? (
              <>
                <div className="result-card leaf-analysis-card result-card-mainwrap" style={{
                  background: 'linear-gradient(135deg, rgba(16, 36, 28, 0.94), rgba(10, 22, 18, 0.9))',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  padding: '28px',
                  border: `1px solid ${resultInfo.color}55`,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                  borderLeft: `4px solid ${resultInfo.color}`
                }}>
                  <div className="result-card-body">
                    <div className="result-card-main">
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ 
                          width: '72px', height: '72px', 
                          borderRadius: '50%', 
                          background: resultInfo.gradient,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '36px',
                          margin: '0 auto 14px',
                          boxShadow: `0 8px 30px ${resultInfo.color}40`
                        }}>
                          {resultInfo.icon}
                        </div>
                        <h2 style={{ margin: 0, color: resultInfo.color, fontSize: '24px', fontWeight: '800', letterSpacing: '0.3px' }}>
                          {resultInfo.title}
                        </h2>
                      </div>

                      <div style={{ 
                        background: 'rgba(0,0,0,0.2)', 
                        borderRadius: '14px', 
                        padding: '16px', 
                        marginBottom: '16px',
                        textAlign: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                          <div style={{ position: 'relative', width: '100px', height: '55px' }}>
                            <div style={{
                              position: 'absolute',
                              width: '100px',
                              height: '50px',
                              borderRadius: '50px 50px 0 0',
                              background: 'rgba(255,255,255,0.1)',
                              overflow: 'hidden'
                            }} />
                            <div style={{
                              position: 'absolute',
                              width: '100px',
                              height: '50px',
                              borderRadius: '50px 50px 0 0',
                              background: `conic-gradient(from 180deg, ${confidenceLevel?.color} 0deg, transparent ${(result.confidence / 100) * 180}deg)`,
                            }} />
                            <div style={{
                              position: 'absolute',
                              bottom: '0',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: '26px',
                              fontWeight: '800',
                              color: 'white'
                            }}>
                              {result.confidence}%
                            </div>
                          </div>
                        </div>
                        <div style={{
                          display: 'inline-block',
                          marginTop: '12px',
                          padding: '6px 14px',
                          background: `${confidenceLevel?.color}20`,
                          borderRadius: '20px',
                          color: confidenceLevel?.color,
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {confidenceLevel?.label}
                        </div>
                      </div>

                      <p className="result-section-text" style={{ textAlign: 'center' }}>
                        {resultInfo.description}
                      </p>
                    </div>

                    <button 
                      onClick={() => { setImage(null); setPreview(null); setResult(null); setError(null); }}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: resultInfo.gradient,
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '15px',
                        boxShadow: `0 4px 15px ${resultInfo.color}40`,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Analyze Another Leaf
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
                    <span className="advice-status" style={{ color: resultInfo.color }}>
                      {advisory ? advisory.status : 'Advisory pending'}
                    </span>
                  </div>

                  <div className="advice-grid">
                    <div className="advice-block">
                      <h5>Recommended Actions</h5>
                      <ul className="advice-list">
                        {resultInfo.actions.map((action, idx) => (
                          <li key={idx}>
                            <span className="advice-dot" style={{ background: resultInfo.color }} />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {advisory ? (
                      <>
                        <div className="advice-block">
                          <h5>Description</h5>
                          <p>{advisory.description}</p>
                        </div>
                        <div className="advice-block">
                          <h5>Common Symptoms</h5>
                          <p>{advisory.commonSymptoms}</p>
                        </div>
                        <div className="advice-block">
                          <h5>Prevention</h5>
                          <p>{advisory.prevention}</p>
                        </div>
                        <div className="advice-block">
                          <h5>Treatment</h5>
                          <p>{advisory.treatment}</p>
                        </div>
                        <div className="advice-block">
                          <h5>Primary Advice</h5>
                          <p>{advisory.primaryAdvice}</p>
                        </div>
                        <div className="advice-block">
                          <h5>Advanced Pro-Tip</h5>
                          <ul className="advice-list">
                            {advisory.advancedProTips.map((tip, idx) => (
                              <li key={idx}>
                                <span className="advice-dot" style={{ background: resultInfo.color }} />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <div className="advice-block">
                        <h5>Advisory Guide</h5>
                        <p>Advisory details will appear here after analysis.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="result-card leaf-analysis-card" style={{
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
                    border: '1px solid rgba(39, 174, 96, 0.35)'
                  }}>
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M4 13.5C4 7.7 8.7 4 14.4 4H20c0 6.2-3.7 10.9-9.5 10.9H9.5c-2 0-3.6 1.6-3.6 3.6V20c-1.2-1.4-1.9-3-1.9-4.7Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 19c0-3.4 2.6-6.2 6.4-7.2"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <h2>Results will appear here</h2>
                  <p>Upload a leaf image and run analysis to see the diagnosis, confidence, and next steps.</p>
                  <div className="result-placeholder-card">
                    <h4>What you'll see</h4>
                    <ul>
                      <li>Disease name with confidence score</li>
                      <li>Short diagnosis summary</li>
                      <li>Recommended action checklist</li>
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

export default LeafAnalysis;
