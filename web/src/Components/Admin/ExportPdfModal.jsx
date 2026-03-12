import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExportPdfModal = ({ isOpen, onClose, currentFilters, currentActiveTab, API_BASE_URL }) => {
  const [format, setFormat] = useState('simple');
  const [dataType, setDataType] = useState(currentActiveTab === 'bunga' ? 'bunga' : currentActiveTab === 'leaf' ? 'leaf' : 'all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Bunga filters
  const [bungaRipeness, setBungaRipeness] = useState(currentFilters?.ripeness || '');
  const [bungaMarketGrade, setBungaMarketGrade] = useState(currentFilters?.market_grade || currentFilters?.marketGrade || '');
  const [bungaHealthClass, setBungaHealthClass] = useState(currentFilters?.health_class || currentFilters?.healthClass || '');
  const [bungaMinConfidence, setBungaMinConfidence] = useState(currentFilters?.minConfidence || '');
  const [bungaMaxConfidence, setBungaMaxConfidence] = useState(currentFilters?.maxConfidence || '');

  // Leaf filters
  const [leafDisease, setLeafDisease] = useState(currentFilters?.disease || '');
  const [leafMinConfidence, setLeafMinConfidence] = useState(currentFilters?.minConfidence || '');
  const [leafMaxConfidence, setLeafMaxConfidence] = useState(currentFilters?.maxConfidence || '');

  // Date range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const defaultType = currentActiveTab === 'bunga'
      ? 'bunga'
      : currentActiveTab === 'leaf'
        ? 'leaf'
        : 'all';
    setDataType(defaultType);

    const filters = currentFilters || {};
    if (currentActiveTab === 'bunga') {
      setBungaRipeness(filters.ripeness || '');
      setBungaMarketGrade(filters.market_grade || filters.marketGrade || '');
      setBungaHealthClass(filters.health_class || filters.healthClass || '');
      setBungaMinConfidence(filters.minConfidence || '');
      setBungaMaxConfidence(filters.maxConfidence || '');
    } else {
      setBungaRipeness('');
      setBungaMarketGrade('');
      setBungaHealthClass('');
      setBungaMinConfidence('');
      setBungaMaxConfidence('');
    }

    if (currentActiveTab === 'leaf') {
      setLeafDisease(filters.disease || '');
      setLeafMinConfidence(filters.minConfidence || '');
      setLeafMaxConfidence(filters.maxConfidence || '');
    } else {
      setLeafDisease('');
      setLeafMinConfidence('');
      setLeafMaxConfidence('');
    }

    setStartDate(filters.startDate || '');
    setEndDate(filters.endDate || '');
  }, [isOpen, currentActiveTab, currentFilters]);

  const colors = {
    primary: '#27AE60',
    primaryLight: '#52BE80',
    secondary: '#FFDBAC',
    background: '#F0F9F4',
    backgroundHover: '#E8F6F0',
    text: '#1B4D3E',
    textLight: '#52866A',
    border: '#D5EFDB',
    danger: '#E74C3C'
  };

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Build filters object
      const filters = {};

      if (dataType === 'bunga' || dataType === 'all') {
        if (bungaRipeness) filters.ripeness = bungaRipeness;
        if (bungaMarketGrade) filters.market_grade = bungaMarketGrade;
        if (bungaHealthClass) filters.health_class = bungaHealthClass;
        if (bungaMinConfidence) {
          if (dataType === 'all') filters.bungaMinConfidence = bungaMinConfidence;
          else filters.minConfidence = bungaMinConfidence;
        }
        if (bungaMaxConfidence) {
          if (dataType === 'all') filters.bungaMaxConfidence = bungaMaxConfidence;
          else filters.maxConfidence = bungaMaxConfidence;
        }
      }

      if (dataType === 'leaf' || dataType === 'all') {
        if (leafDisease) filters.disease = leafDisease;
        if (leafMinConfidence) {
          if (dataType === 'all') filters.leafMinConfidence = leafMinConfidence;
          else filters.minConfidence = leafMinConfidence;
        }
        if (leafMaxConfidence) {
          if (dataType === 'all') filters.leafMaxConfidence = leafMaxConfidence;
          else filters.maxConfidence = leafMaxConfidence;
        }
      }

      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      // Make API request
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/reports/export/pdf`,
        {
          format,
          dataType,
          filters
        },
        {
          responseType: 'blob'
        }
      );

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${dataType}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.response?.data?.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.secondary,
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: colors.text, marginBottom: '20px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '10px' }}>
          Export Analytics Report
        </h2>

        {/* Data Type Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', color: colors.text, marginBottom: '10px' }}>
            What to Export:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['bunga', 'leaf', 'all'].map((type) => (
              <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="dataType"
                  value={type}
                  checked={dataType === type}
                  onChange={(e) => setDataType(e.target.value)}
                />
                <span style={{ color: colors.text, textTransform: 'capitalize' }}>
                  {type === 'bunga' && 'Bunga Analysis Only'}
                  {type === 'leaf' && 'Leaf Analysis Only'}
                  {type === 'all' && 'All Analyses (Bunga + Leaf)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Format Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', color: colors.text, marginBottom: '10px' }}>
            Export Format:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="format"
                value="simple"
                checked={format === 'simple'}
                onChange={(e) => setFormat(e.target.value)}
              />
              <span style={{ color: colors.text }}>Quick Export (Table only)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="format"
                value="full"
                checked={format === 'full'}
                onChange={(e) => setFormat(e.target.value)}
              />
              <span style={{ color: colors.text }}>Full Report (Statistics + Charts)</span>
            </label>
          </div>
        </div>

        {/* Filters Section */}
        <details style={{ marginBottom: '20px', border: `1px solid ${colors.border}`, borderRadius: '6px', padding: '10px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: colors.primary, marginBottom: '10px' }}>
            Filter Options (Optional)
          </summary>

          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Date Range */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textLight, marginBottom: '4px' }}>
                Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textLight, marginBottom: '4px' }}>
                End Date:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px'
                }}
              />
            </div>

            {/* Bunga Filters */}
            {(dataType === 'bunga' || dataType === 'all') && (
              <>
                <hr style={{ borderColor: colors.border }} />
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: colors.text }}>Bunga Filters:</label>

                <div>
                  <label style={{ fontSize: '12px', color: colors.textLight }}>Ripeness:</label>
                  <select
                    value={bungaRipeness}
                    onChange={(e) => setBungaRipeness(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">All</option>
                    <option value="Ripe">Ripe</option>
                    <option value="Unripe">Unripe</option>
                    <option value="Rotten">Rotten</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: colors.textLight }}>Market Grade:</label>
                  <select
                    value={bungaMarketGrade}
                    onChange={(e) => setBungaMarketGrade(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">All</option>
                    <option value="Premium">Premium</option>
                    <option value="Standard">Standard</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Reject">Reject</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: colors.textLight }}>Health Class:</label>
                  <select
                    value={bungaHealthClass}
                    onChange={(e) => setBungaHealthClass(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">All</option>
                    <option value="a">A (76-100%)</option>
                    <option value="b">B (51-75%)</option>
                    <option value="c">C (26-50%)</option>
                    <option value="d">D (0-25%)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: colors.textLight }}>Min Confidence:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={bungaMinConfidence}
                      onChange={(e) => setBungaMinConfidence(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '4px'
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: colors.textLight }}>Max Confidence:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={bungaMaxConfidence}
                      onChange={(e) => setBungaMaxConfidence(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '4px'
                      }}
                      placeholder="100"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Leaf Filters */}
            {(dataType === 'leaf' || dataType === 'all') && (
              <>
                <hr style={{ borderColor: colors.border }} />
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: colors.text }}>Leaf Filters:</label>

                <div>
                  <label style={{ fontSize: '12px', color: colors.textLight }}>Disease:</label>
                  <select
                    value={leafDisease}
                    onChange={(e) => setLeafDisease(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">All</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Footrot">Footrot</option>
                    <option value="Slow Decline">Slow Decline</option>
                    <option value="Pollu_Disease">Pollu Disease</option>
                    <option value="Yellow Mottle Virus">Yellow Mottle Virus</option>
                    <option value="Leaf Blight">Leaf Blight</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: colors.textLight }}>Min Confidence:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={leafMinConfidence}
                      onChange={(e) => setLeafMinConfidence(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '4px'
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: colors.textLight }}>Max Confidence:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={leafMaxConfidence}
                      onChange={(e) => setLeafMaxConfidence(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '4px'
                      }}
                      placeholder="100"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </details>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            backgroundColor: '#FADBD8',
            color: colors.danger,
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#D5F4E6',
            color: colors.primary,
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            fontSize: '13px'
          }}>
            PDF downloaded successfully!
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#E0E0E0',
              color: colors.text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#B8DDB1' : colors.primary,
              color: colors.secondary,
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPdfModal;
