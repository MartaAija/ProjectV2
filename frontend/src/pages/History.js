import React, { useState, useEffect } from 'react';
import "../App.css"; // Import the CSS file
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const getImpactLevel = (value) => {
  const absValue = Math.abs(value);
  if (absValue > 0.05) return { level: "Strong", color: "#ff4444" };
  if (absValue > 0.02) return { level: "Moderate", color: "#ffa500" };
  return { level: "Subtle", color: "#00d4ff" };
};

const History = () => {
  const navigate = useNavigate();
  const [savedAttacks, setSavedAttacks] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchSavedAttacks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:5000/api/attacks/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setSavedAttacks(response.data);
      } catch (error) {
        console.error('Error fetching saved attacks:', error);
      }
    };

    fetchSavedAttacks();
  }, []);

  return (
    <div className="history-container">
      <h1>Attack History</h1>
      
      <div className="history-grid">
        {savedAttacks.map((attack, index) => (
          <div
            key={index}
            className="history-card"
          >
            {/* Delete button */}
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this attack record?')) {
                  try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://127.0.0.1:5000/api/attacks/delete/${attack.id}`, {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });
                    setSavedAttacks(savedAttacks.filter(a => a.id !== attack.id));
                  } catch (error) {
                    console.error('Error deleting attack:', error);
                    alert('Failed to delete attack record');
                  }
                }
              }}
              className="delete-button"
            >
              ×
            </button>

            {/* Card content */}
            <div>
              <h3>{attack.attackType}</h3>
              <p><strong>Time:</strong> {attack.timestamp}</p>
              <p><strong>Flow Rate:</strong> {attack.flowBytes.toFixed(2)} bytes/s</p>
              <p><strong>Model's Confidence Score:</strong> {attack.confidence.toFixed(2)}%</p>
              
              {/* Styled Recommendations */}
              <div className="recommendations">
                <strong>Recommendations:</strong>
                {attack.recommendation.split('\n').map((rec, index) => {
                  if (!rec.trim()) return null;
                  
                  if (rec.includes('→')) {
                    const [cause, solution] = rec.split('→').map(part => part.trim());
                    return (
                      <div key={index} className="recommendation-item">
                        <span>{cause}</span>
                        <span>→</span>
                        <span>{solution}</span>
                      </div>
                    );
                  }
                  return <p key={index}>{rec}</p>;
                })}
              </div>

              <p><strong>Source IP:</strong> {attack.sourceIP}</p>
              <p><strong>Destination IP:</strong> {attack.destinationIP}</p>
              <p><strong>Source Port:</strong> {attack.sourcePort}</p>
              <p><strong>Destination Port:</strong> {attack.destinationPort}</p>
              <p><strong>Protocol:</strong> {attack.protocol}</p>
              <p><strong>Flow Duration:</strong> {attack.flowDuration} ms</p>
              
              {/* Feature Importance section */}
              <h4>Key Contributing Factors</h4>
              <div className="feature-importance">
                {Object.entries(attack.featureImportance)
                  .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                  .map(([feature, value]) => {
                    const impact = getImpactLevel(value);
                    return (
                      <div key={feature} className="feature-item">
                        <div>
                          <strong>{feature}</strong>
                          <div>SHAP value: {value.toFixed(4)}</div>
                        </div>
                        <div style={{ backgroundColor: impact.color }} className="impact-level">
                          {impact.level} Impact
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;

