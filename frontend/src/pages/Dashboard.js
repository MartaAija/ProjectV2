import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { useNavigate } from 'react-router-dom';
import "../App.css"; // Import the CSS file

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Title);

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const [trafficData, setTrafficData] = useState(() => {
    const savedData = sessionStorage.getItem("trafficData");
    return savedData ? JSON.parse(savedData) : [];
  });
  const [timestamps, setTimestamps] = useState(() => {
    const savedTimestamps = sessionStorage.getItem("timestamps");
    return savedTimestamps ? JSON.parse(savedTimestamps) : [];
  });
  const [attackTypes, setAttackTypes] = useState(() => {
    const savedAttackTypes = sessionStorage.getItem("attackTypes");
    return savedAttackTypes ? JSON.parse(savedAttackTypes) : [];
  });
  const [attackCounts, setAttackCounts] = useState(() => {
    const savedAttackCounts = sessionStorage.getItem("attackCounts");
    return savedAttackCounts ? JSON.parse(savedAttackCounts) : {};
  });
  const [latestTraffic, setLatestTraffic] = useState(() => {
    const savedLatestTraffic = sessionStorage.getItem("latestTraffic");
    return savedLatestTraffic ? JSON.parse(savedLatestTraffic) : {};
  });
  const [recommendations, setRecommendations] = useState(() => {
    const savedRecommendations = sessionStorage.getItem("recommendations");
    return savedRecommendations ? JSON.parse(savedRecommendations) : [];
  });
  const [explanationImage, setExplanationImage] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [timeWindow, setTimeWindow] = useState({ start: 0, end: 50 });
  const [selectedAttack, setSelectedAttack] = useState(null);
  const [showAttackModal, setShowAttackModal] = useState(false);
  const [shapExplanation, setShapExplanation] = useState(null);
  const [attackHistory, setAttackHistory] = useState(() => {
    const savedHistory = sessionStorage.getItem("attackHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [autoFollow, setAutoFollow] = useState(true);
  const [attackFeatureStats, setAttackFeatureStats] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [confidenceScores, setConfidenceScores] = useState([]);
  const [featureImportances, setFeatureImportances] = useState([]);

  const fetchTrafficData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/live-traffic");
      const data = response.data;
      
      // If an attack is detected (prediction is not BENIGN)
      if (data.prediction !== 'BENIGN') {
        const chartContainer = document.querySelector('.chart-container');
        chartContainer.classList.add('attack-detected');
        
        // Remove the class after animation completes
        setTimeout(() => {
          chartContainer.classList.remove('attack-detected');
        }, 1000);
      }
      
      // Update traffic data for line chart
      const flowBytes = data.traffic_stats["Flow Bytes/s"];
      const attackType = data.prediction;
      const currentTime = new Date().toLocaleTimeString();
      
      // Store attack data if not benign
        const attackData = {
          timestamp: currentTime,
          attackType: attackType,
          flowBytes: flowBytes,
          recommendation: data.recommendation,
          interpretation: data.interpretation,
          confidence: data.confidence_score,
          featureImportance: data.feature_importance,
          sourceIP: data["Source IP"],
          destinationIP: data["Destination IP"],
          protocol: data["Protocol"],
          sourcePort: data["Source Port"],
          destinationPort: data.traffic_stats["Destination Port"],
          flowDuration: data.traffic_stats["Flow Duration"]
        };
        setAttackHistory(prev => {
          const updatedHistory = [...prev, attackData];
          sessionStorage.setItem("attackHistory", JSON.stringify(updatedHistory));
          return updatedHistory;
        });
      

      // Update traffic data arrays
      setTrafficData(prevData => {
        const updatedData = [...prevData, flowBytes];
        sessionStorage.setItem("trafficData", JSON.stringify(updatedData));
        return updatedData;
      });

      setTimestamps(prevTimestamps => {
        const updatedTimestamps = [...prevTimestamps, currentTime];
        sessionStorage.setItem("timestamps", JSON.stringify(updatedTimestamps));
        return updatedTimestamps;
      });

      setAttackTypes(prevTypes => {
        const updatedTypes = [...prevTypes, attackType];
        sessionStorage.setItem("attackTypes", JSON.stringify(updatedTypes));
        return updatedTypes;
      });

      setAttackCounts((prevCounts) => {
        const updatedCounts = {
          ...prevCounts,
          [attackType]: (prevCounts[attackType] || 0) + 1,
        };
        sessionStorage.setItem("attackCounts", JSON.stringify(updatedCounts));
        return updatedCounts;
      });

      // Update latest traffic details
      setLatestTraffic({
        source_ip: data["Source IP"],
        destination_ip: data["Destination IP"],
        protocol: data["Protocol"],
        source_port: data["Source Port"],
        destination_port: data.traffic_stats["Destination Port"],
        flow_duration: data.traffic_stats["Flow Duration"],
        traffic_stats: {
          "Total Fwd Packets": data.traffic_stats["Total Fwd Packets"],
          "Total Backward Packets": data.traffic_stats["Total Backward Packets"],
          "Flow Packets/s": data.traffic_stats["Flow Packets/s"],
          "Fwd Packet Length Mean": data.traffic_stats["Fwd Packet Length Mean"],
          "Fwd Packet Length Max": data.traffic_stats["Fwd Packet Length Max"],
          "Fwd Packet Length Min": data.traffic_stats["Fwd Packet Length Min"],
          "Bwd Packet Length Mean": data.traffic_stats["Bwd Packet Length Mean"],
          "Bwd Packet Length Max": data.traffic_stats["Bwd Packet Length Max"],
          "Bwd Packet Length Min": data.traffic_stats["Bwd Packet Length Min"],
          "Fwd IAT Mean": data.traffic_stats["Fwd IAT Mean"],
          "Fwd IAT Max": data.traffic_stats["Fwd IAT Max"],
          "Fwd IAT Min": data.traffic_stats["Fwd IAT Min"],
          "Bwd IAT Mean": data.traffic_stats["Bwd IAT Mean"],
          "Bwd IAT Max": data.traffic_stats["Bwd IAT Max"],
          "Bwd IAT Min": data.traffic_stats["Bwd IAT Min"],
          "PSH Flag Count": data.traffic_stats["PSH Flag Count"],
          "ACK Flag Count": data.traffic_stats["ACK Flag Count"],
          "SYN Flag Count": data.traffic_stats["SYN Flag Count"],
          "Active Mean": data.traffic_stats["Active Mean"],
          "Active Max": data.traffic_stats["Active Max"],
          "Active Min": data.traffic_stats["Active Min"],
          "Idle Mean": data.traffic_stats["Idle Mean"],
          "Idle Max": data.traffic_stats["Idle Max"],
          "Idle Min": data.traffic_stats["Idle Min"]
        }
      });

      sessionStorage.setItem("latestTraffic", JSON.stringify({
        source_ip: data["Source IP"],
        destination_ip: data["Destination IP"],
        protocol: data["Protocol"],
        source_port: data["Source Port"],
        destination_port: data.traffic_stats["Destination Port"],
        flow_duration: data.traffic_stats["Flow Duration"],
        traffic_stats: {
          "Total Fwd Packets": data.traffic_stats["Total Fwd Packets"],
          "Total Backward Packets": data.traffic_stats["Total Backward Packets"],
          "Flow Packets/s": data.traffic_stats["Flow Packets/s"],
          "Fwd Packet Length Mean": data.traffic_stats["Fwd Packet Length Mean"],
          "Fwd Packet Length Max": data.traffic_stats["Fwd Packet Length Max"],
          "Fwd Packet Length Min": data.traffic_stats["Fwd Packet Length Min"],
          "Bwd Packet Length Mean": data.traffic_stats["Bwd Packet Length Mean"],
          "Bwd Packet Length Max": data.traffic_stats["Bwd Packet Length Max"],
          "Bwd Packet Length Min": data.traffic_stats["Bwd Packet Length Min"],
          "Fwd IAT Mean": data.traffic_stats["Fwd IAT Mean"],
          "Fwd IAT Max": data.traffic_stats["Fwd IAT Max"],
          "Fwd IAT Min": data.traffic_stats["Fwd IAT Min"],
          "Bwd IAT Mean": data.traffic_stats["Bwd IAT Mean"],
          "Bwd IAT Max": data.traffic_stats["Bwd IAT Max"],
          "Bwd IAT Min": data.traffic_stats["Bwd IAT Min"],
          "PSH Flag Count": data.traffic_stats["PSH Flag Count"],
          "ACK Flag Count": data.traffic_stats["ACK Flag Count"],
          "SYN Flag Count": data.traffic_stats["SYN Flag Count"],
          "Active Mean": data.traffic_stats["Active Mean"],
          "Active Max": data.traffic_stats["Active Max"],
          "Active Min": data.traffic_stats["Active Min"],
          "Idle Mean": data.traffic_stats["Idle Mean"],
          "Idle Max": data.traffic_stats["Idle Max"],
          "Idle Min": data.traffic_stats["Idle Min"]
        }
      }));

      // Update recommendations
      setRecommendations((prevRecommendations) => {
        const updatedRecommendations = [...prevRecommendations, data.recommendation];
        sessionStorage.setItem("recommendations", JSON.stringify(updatedRecommendations));
        return updatedRecommendations;
      });

      // Update SHAP explanation
      if (data.feature_importance) {
        setShapExplanation({
          interpretation: data.interpretation,
          feature_importance: data.feature_importance
        });
      }

      // Update attack feature stats
      if (data.attack_feature_stats) {
        setAttackFeatureStats(data.attack_feature_stats);
      }

      // Update confidence scores and feature importances
      setConfidenceScores(prevScores => [...prevScores, data.confidence_score]);
      setFeatureImportances(prevImportances => [...prevImportances, data.feature_importance]);

    } catch (err) {
      console.error("Failed to fetch traffic data", err);
      setImageError("Failed to load analysis visualization");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTrafficData();
    };

    fetchData(); // Initial fetch
    
    // Only set up the interval if not paused
    let interval;
    if (!isPaused) {
      interval = setInterval(fetchData, 5000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      // Cleanup old image URLs
      if (explanationImage) {
        URL.revokeObjectURL(explanationImage);
      }
    };
  }, [isPaused]); // Add isPaused to dependencies

  const moveTimeWindow = (direction) => {
    console.log('Button clicked:', direction);
    console.log('Current timeWindow:', timeWindow);
    console.log('TrafficData length:', trafficData.length);

    if (direction === 'left') {
      if (timeWindow.start > 0) {
        setAutoFollow(false);
        const newStart = Math.max(0, timeWindow.start - 10);
        const newEnd = Math.min(trafficData.length, newStart + 50);
        console.log('New window (left):', { start: newStart, end: newEnd });
        setTimeWindow({ start: newStart, end: newEnd });
      }
    } else if (direction === 'right') {
      if (timeWindow.end < trafficData.length) {
        const newStart = Math.min(trafficData.length - 50, timeWindow.start + 10);
        const newEnd = Math.min(trafficData.length, newStart + 50);
        console.log('New window (right):', { start: newStart, end: newEnd });
        setTimeWindow({ start: newStart, end: newEnd });
        setAutoFollow(newEnd === trafficData.length);
      }
    }
  };

  useEffect(() => {
    if (trafficData.length > timeWindow.end && autoFollow) {
      setTimeWindow(prev => ({
        start: trafficData.length - 50,
        end: trafficData.length
      }));
    }
  }, [trafficData.length]);



  const lineChartData = {
    labels: timestamps.slice(timeWindow.start, timeWindow.end),
    datasets: [{
      label: 'Network Traffic (Bytes/sec)',
      data: trafficData.slice(timeWindow.start, timeWindow.end),
      borderColor: '#00d4ff',
      backgroundColor: 'rgba(0, 212, 255, 0.2)',
      tension: 0.1,
      fill: true,
      pointRadius: (context) => {
        const index = context.dataIndex + timeWindow.start;
        return attackTypes[index] !== 'BENIGN' ? 6 : 3;
      },
      pointBackgroundColor: (context) => {
        const index = context.dataIndex + timeWindow.start;
        return attackTypes[index] !== 'BENIGN' ? '#ff4444' : '#00d4ff';
      },
      pointBorderColor: (context) => {
        const index = context.dataIndex + timeWindow.start;
        return attackTypes[index] !== 'BENIGN' ? '#ff4444' : '#00d4ff';
      },
      pointHoverRadius: 8,
    }]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        title: {
          display: true,
          text: "Time",
          color: "#fff",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        title: {
          display: true,
          text: "Bytes/sec",
          color: "#fff",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#fff",
        },
      },
    },
    transitions: {
      show: {
        animations: {
          x: {
            from: 0
          },
          y: {
            from: 0
          }
        }
      },
      hide: {
        animations: {
          x: {
            to: 0
          },
          y: {
            to: 0
          }
        }
      }
    },
    animation: {
      duration: 750, // Animation duration in milliseconds
      easing: 'easeInOutQuart', // Easing function for smooth animation
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index + timeWindow.start;
        if (attackTypes[index]) {
          const historicalAttack = attackHistory.find(
            attack => attack.timestamp === timestamps[index]
          );
          if (historicalAttack) {
            setSelectedAttack(historicalAttack);
            setShowAttackModal(true);
          }
        }
      }
    }
  };

  const pieChartData = {
    labels: Object.keys(attackCounts),
    datasets: [
      {
        data: Object.values(attackCounts),
        backgroundColor: ["#00d4ff", "#ff6384", "#ff9f40", "#90ee90", "#cc65fe", "#ffcd56", "#ff0000"],
        hoverOffset: 4,
      },
    ],
  };

  const attackData = attackTypes[attackTypes.length - 1];
  const recommendation = recommendations[recommendations.length - 1];
  const interpretation = shapExplanation?.interpretation;

  // Helper function to interpret SHAP value magnitude
  const getImpactLevel = (value) => {
    const absValue = Math.abs(value);
    if (absValue > 0.05) return { level: "Strong", color: "#ff4444" };
    if (absValue > 0.02) return { level: "Moderate", color: "#ffa500" };
    return { level: "Subtle", color: "#00d4ff" };
  };

  return (
    <div
      style={{
        color: "#e0e0e0",
        padding: "20px",
        minHeight: "100vh",
        maxWidth: "100%",
        overflow: "hidden"
      }}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h1 style={{ color: "#00d4ff" }}>Live Network Traffic Dashboard</h1>
        
        <button
          onClick={() => setIsPaused(!isPaused)}
          style={{
            background: isPaused ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 212, 255, 0.6)',
            border: '2px solid #00d4ff',
            borderRadius: '5px',
            padding: '8px 15px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{ 
            fontSize: '18px',
            lineHeight: '1' 
          }}>
            {isPaused ? '▶' : '⏸'}
          </span>
          {isPaused ? 'Resume Live Updates' : 'Pause Live Updates'}
        </button>
      </div>

      {/* Add a banner when paused */}
      {isPaused && (
        <div style={{
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid #00d4ff',
          borderRadius: '5px',
          padding: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#00d4ff' }}>
            Live updates are paused. Data shown may not reflect current network state.
          </span>
          <button
            onClick={() => setIsPaused(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#00d4ff',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            Resume
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "row", marginTop: "20px" }}>
        <div style={{ flex: 2, marginRight: "10px" }}>
          <div
            className="chart-container"
            style={{
              backgroundColor: "#333",
              padding: "30px",
              borderRadius: "10px",
              height: "400px",
              position: "relative"
            }}
          >
            <div style={{
              position: 'absolute',
              bottom: 5,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              zIndex: 10
            }}>
              <button
                onClick={() => moveTimeWindow('left')}
                disabled={timeWindow.start === 0}
                style={{
                  background: 'rgba(0, 212, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: timeWindow.start === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  opacity: timeWindow.start === 0 ? 0.5 : 1
                }}
              >
                ←
              </button>

              <div style={{
                width: '200px',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  transform: `translateX(${(timeWindow.start / Math.max(trafficData.length, 1)) * 100}%) 
                             scaleX(${(timeWindow.end - timeWindow.start) / Math.max(trafficData.length, 1)})`,
                  backgroundColor: '#00d4ff',
                  borderRadius: '2px',
                  transition: 'transform 0.3s ease'
                }}/>
              </div>

              <button
                onClick={() => moveTimeWindow('right')}
                disabled={timeWindow.end >= trafficData.length}
                style={{
                  background: 'rgba(0, 212, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: timeWindow.end >= trafficData.length ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  opacity: timeWindow.end >= trafficData.length ? 0.5 : 1
                }}
              >
                →
              </button>

              <button
                onClick={() => {
                  setAutoFollow(!autoFollow);
                  if (!autoFollow) {
                    setTimeWindow({
                      start: Math.max(0, trafficData.length - 50),
                      end: trafficData.length
                    });
                  }
                }}
                style={{
                  background: autoFollow ? 'rgba(0, 212, 255, 0.6)' : 'rgba(0, 212, 255, 0.2)',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '5px 10px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {autoFollow ? 'Following' : 'Follow'}
              </button>
            </div>

            <div style={{ height: "100%", width: "100%" }}>
              <div style={{
                width: "100%",
                height: "400px",
                marginBottom: "20px"
              }}>
                <Line 
                  data={lineChartData} 
                  options={lineChartOptions} 
                />
              </div>

              {/* Attack Details Modal */}
              {showAttackModal && selectedAttack && (
                <div style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: '#333',
                  padding: '20px',
                  borderRadius: '10px',
                  zIndex: 1000,
                  boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                  maxWidth: '50vw',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await axios.post('http://127.0.0.1:5000/api/attacks/save', 
                            {
                              ...selectedAttack,
                              timestamp: selectedAttack.timestamp,
                              attackType: selectedAttack.attackType,
                              flowBytes: selectedAttack.flowBytes,
                              confidence: selectedAttack.confidence,
                              recommendation: selectedAttack.recommendation,
                              interpretation: selectedAttack.interpretation,
                              featureImportance: selectedAttack.featureImportance,
                              source_ip: selectedAttack.sourceIP,
                              destination_ip: selectedAttack.destinationIP,
                              protocol: selectedAttack.protocol,
                              source_port: selectedAttack.sourcePort,
                              destination_port: selectedAttack.destinationPort,
                              flow_duration: selectedAttack.flowDuration
                            },
                            {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            }
                          );
                          alert('Attack details saved to history!');
                        } catch (error) {
                          alert('Failed to save attack details');
                        }
                      }}
                      style={{
                        background: '#00d4ff',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 10px',
                        color: '#333',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Save to History
                    </button>
                    <button
                      onClick={() => setShowAttackModal(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '20px',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>Attack Details</h3>
                  <div style={{ marginBottom: '10px' }}>
                    <p><strong>Time:</strong> {selectedAttack.timestamp}</p>
                    <p><strong>Attack Type:</strong> {selectedAttack.attackType}</p>
                    <p><strong>Flow Rate:</strong> {selectedAttack.flowBytes.toFixed(2)} bytes/s</p>
                    <p><strong>Model's Confidence Score:</strong> {selectedAttack.confidence !== 'N/A' ? `${selectedAttack.confidence.toFixed(2)}%` : 'N/A'}</p>
                    
                    {/* Format recommendations */}
                    <div style={{ marginTop: '10px' }}>
                      <strong>Recommendations:</strong>
                      {selectedAttack.recommendation.split('\n').map((rec, index) => {
                        if (!rec.trim()) return null;
                        
                        if (rec.includes('→')) {
                          const [cause, solution] = rec.split('→').map(part => part.trim());
                          return (
                            <div key={index} style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              padding: '8px 12px',
                              margin: '8px 0',
                              borderRadius: '5px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}>
                              <span>{cause}</span>
                              <span style={{ color: '#00d4ff' }}>→</span>
                              <span>{solution}</span>
                            </div>
                          );
                        }
                        return <p key={index} style={{ margin: '8px 0' }}>{rec}</p>;
                      })}
                    </div>

                    <p><strong>Source IP:</strong> {selectedAttack.sourceIP}</p>
                    <p><strong>Destination IP:</strong> {selectedAttack.destinationIP}</p>
                    <p><strong>Source Port:</strong> {selectedAttack.sourcePort}</p>
                    <p><strong>Destination Port:</strong> {selectedAttack.destinationPort}</p>
                    <p><strong>Protocol:</strong> {selectedAttack.protocol}</p>
                    <p><strong>Flow Duration:</strong> {selectedAttack.flowDuration} ms</p>
                  </div>
                  
                  <h4 style={{ color: '#00d4ff', marginTop: '15px', marginBottom: '10px' }}>Feature Impact Analysis</h4>
                  <div style={{ fontSize: '0.9em' }}>
                    {Object.entries(selectedAttack.featureImportance).map(([feature, value]) => {
                      const impact = getImpactLevel(value);
                      return (
                        <div key={feature} style={{
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          padding: "12px",
                          marginBottom: "8px",
                          borderRadius: "5px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div>
                            <strong>{feature}</strong>
                            <div style={{ fontSize: "0.9em", color: "#888" }}>
                              SHAP value: {value.toFixed(4)}
                            </div>
                          </div>
                          <div style={{
                            backgroundColor: impact.color,
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8em",
                            color: "white"
                          }}>
                            {impact.level} Impact
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#333",
              padding: "20px",
              borderRadius: "10px",
              marginTop: "20px",
            }}
          >
            {/* Analysis Section */}
            <div style={{ marginTop: "20px", backgroundColor: "#1E1E1E", padding: "20px", borderRadius: "10px" }}>
              <h2 style={{ color: "#00d4ff" }}>Current Attack Type: {attackData || "None"}</h2>

              {/* Attack Analysis */}
              <div style={{
                width: "100%",
                marginBottom: "20px"
              }}>
                <h3 style={{ color: "#00d4ff" }}>Attack Analysis</h3>
                <div style={{ 
                  backgroundColor: attackData !== "BENIGN" ? "rgba(201, 11, 11, 0.41)" : "#2A2A2A", 
                  padding: "15px", 
                  borderRadius: "8px",
                  marginTop: "10px",
                  border: attackData !== "BENIGN" ? "2px solid rgb(228, 2, 2)" : "none"
                }}>
                  {recommendation && typeof recommendation === 'string' && recommendation.split('\n').map((rec, index, array) => {
                    if (!rec.trim()) return null;
                    
                    // First item (base recommendation)
                    if (index === 0) {
                      return (
                        <p key={index} style={{ 
                          margin: "0 0 15px 0",
                          color: "#fff"
                        }}>
                          {rec.trim()}
                        </p>
                      );
                    }
                    
                    // For attack detections
                    if (attackData !== "BENIGN") {
                      if (rec.includes('→')) {
                        return (
                          <div 
                            key={index}
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              padding: "12px",
                              borderRadius: "5px",
                              marginBottom: "8px",
                              border: "1px solid rgba(255, 255, 255, 0.2)"
                            }}
                          >
                            <div style={{ 
                              display: "flex", 
                              alignItems: "center",
                              gap: "10px",
                              color: "#fff"
                            }}>
                              {rec.split('→').map((part, i) => (
                                <>
                                  <span>{part.trim()}</span>
                                  {i === 0 && <span style={{ color: "#ff9999", padding: "0 10px" }}>→</span>}
                                </>
                              ))}
                            </div>
                          </div>
                        );
                      } else {
                        // Final recommendation for attacks
                        return (
                          <p key={index} style={{ 
                            margin: "15px 0 0 0",
                            color: "#fff"
                          }}>
                            {rec.trim()}
                          </p>
                        );
                      }
                    }
                    
                    // For benign traffic recommendations
                    // Skip the final conclusion for benign traffic
                    if (rec.includes("These network characteristics strongly indicate")) {
                      return null;
                    }
                    
                    return (
                      <div 
                        key={index}
                        style={{
                          backgroundColor: "rgba(0, 212, 255, 0.1)",
                          padding: "12px",
                          borderRadius: "5px",
                          marginBottom: "8px",
                          border: "1px solid rgba(0, 212, 255, 0.2)"
                        }}
                      >
                        <p style={{ margin: 0, color: "#fff" }}>{rec.trim()}</p>
                      </div>
                    );
                  })}

                  {/* Add the benign conclusion outside the boxes */}
                  {attackData === "BENIGN" && recommendation?.includes("These network characteristics") && (
                    <p style={{ 
                      margin: "15px 0 0 0",
                      color: "#fff"
                    }}>
                      These network characteristics strongly indicate legitimate traffic patterns. Continue monitoring but no immediate action required.
                    </p>
                  )}
                </div>
              </div>

              {/* Key Contributing Factors */}
              <div style={{
                width: "100%",
                marginBottom: "20px"
              }}>
                <h3 style={{ color: "#00d4ff" }}>Key Contributing Factors</h3>
                <div style={{ 
                  backgroundColor: "#2A2A2A", 
                  padding: "20px", 
                  borderRadius: "8px",
                  marginTop: "10px" 
                }}>
                  <p style={{ 
                    color: "#fff", 
                    marginBottom: "15px",
                    fontSize: "15px" 
                  }}>
                    Top features influencing the traffic classification, ranked by their SHAP values 
                    (higher values indicate stronger influence on the decision):
                  </p>
                  
                  {shapExplanation?.feature_importance && Object.entries(shapExplanation.feature_importance)
                    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                    .slice(0, 5)
                    .map(([feature, value], index) => {
                      const impact = getImpactLevel(value);
                      return (
                        <div
                          key={index}
                          style={{
                            backgroundColor: "rgba(0, 212, 255, 0.1)",
                            padding: "15px",
                            borderRadius: "8px",
                            marginBottom: "10px",
                            border: "1px solid rgba(0, 212, 255, 0.2)"
                          }}
                        >
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                            <div>
                              <h4 style={{ 
                                color: "#00d4ff", 
                                margin: "0 0 5px 0",
                                fontSize: "14px" 
                              }}>
                                {feature}
                              </h4>
                              <p style={{ 
                                color: "#888", 
                                margin: "0",
                                fontSize: "12px" 
                              }}>
                                {getFeatureDescription(feature)}
                              </p>
                              <div style={{ 
                                color: "#888", 
                                margin: "5px 0 0 0",
                                fontSize: "11px" 
                              }}>
                                SHAP value: {value.toFixed(4)}
                              </div>
                            </div>
                            <div style={{
                              backgroundColor: impact.color,
                              padding: "5px 10px",
                              borderRadius: "15px",
                              minWidth: "80px",
                              textAlign: "center"
                            }}>
                              <span style={{ 
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "13px"
                              }}>
                                {impact.level}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#333",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
              width: "300px",
              height: "400px",
            }}
          >
            <h3 style={{ color: "#00d4ff" }}>Attack Distribution</h3>
            <div style={{ width: "100%", height: "100%" }}>
              <Pie data={pieChartData} options={{ responsive: true }} />
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#333",
              padding: "20px",
              borderRadius: "8px",
              padding: "20px",
              color: "#e0e0e0",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              width: "300px",
              margin: "0 auto",
              overflow: "visible"
            }}
          >
            <h4 style={{ color: "#00d4ff" }}>Traffic Details</h4>
            <p><strong>Source IP:</strong> {latestTraffic.source_ip}</p>
            <p><strong>Destination IP:</strong> {latestTraffic.destination_ip}</p>
            <p><strong>Protocol:</strong> {latestTraffic.protocol}</p>
            <p><strong>Source Port:</strong> {latestTraffic.source_port}</p>
            <p><strong>Destination Port:</strong> {latestTraffic.destination_port}</p>
            <p><strong>Flow Duration:</strong> {latestTraffic.flow_duration}</p>

            {latestTraffic.traffic_stats && (
              <>
                <p><strong>Total Fwd Packets:</strong> {latestTraffic.traffic_stats['Total Fwd Packets']}</p>
                <p><strong>Total Backward Packets:</strong> {latestTraffic.traffic_stats['Total Backward Packets']}</p>
                <p><strong>Flow Packets/s:</strong> {latestTraffic.traffic_stats['Flow Packets/s']}</p>
                <p><strong>Fwd Packet Length Mean:</strong> {latestTraffic.traffic_stats['Fwd Packet Length Mean']}</p>
                <p><strong>Fwd Packet Length Max:</strong> {latestTraffic.traffic_stats['Fwd Packet Length Max']}</p>
                <p><strong>Fwd Packet Length Min:</strong> {latestTraffic.traffic_stats['Fwd Packet Length Min']}</p>
                <p><strong>Bwd Packet Length Mean:</strong> {latestTraffic.traffic_stats['Bwd Packet Length Mean']}</p>
                <p><strong>Bwd Packet Length Max:</strong> {latestTraffic.traffic_stats['Bwd Packet Length Max']}</p>
                <p><strong>Bwd Packet Length Min:</strong> {latestTraffic.traffic_stats['Bwd Packet Length Min']}</p>
                <p><strong>Fwd IAT Mean:</strong> {latestTraffic.traffic_stats['Fwd IAT Mean']}</p>
                <p><strong>Fwd IAT Max:</strong> {latestTraffic.traffic_stats['Fwd IAT Max']}</p>
                <p><strong>Fwd IAT Min:</strong> {latestTraffic.traffic_stats['Fwd IAT Min']}</p>
                <p><strong>Bwd IAT Mean:</strong> {latestTraffic.traffic_stats['Bwd IAT Mean']}</p>
                <p><strong>Bwd IAT Max:</strong> {latestTraffic.traffic_stats['Bwd IAT Max']}</p>
                <p><strong>Bwd IAT Min:</strong> {latestTraffic.traffic_stats['Bwd IAT Min']}</p>
                <p><strong>PSH Flag Count:</strong> {latestTraffic.traffic_stats['PSH Flag Count']}</p>
                <p><strong>ACK Flag Count:</strong> {latestTraffic.traffic_stats['ACK Flag Count']}</p>
                <p><strong>SYN Flag Count:</strong> {latestTraffic.traffic_stats['SYN Flag Count']}</p>
                <p><strong>Active Mean:</strong> {latestTraffic.traffic_stats['Active Mean']}</p>
                <p><strong>Active Max:</strong> {latestTraffic.traffic_stats['Active Max']}</p>
                <p><strong>Active Min:</strong> {latestTraffic.traffic_stats['Active Min']}</p>
                <p><strong>Idle Mean:</strong> {latestTraffic.traffic_stats['Idle Mean']}</p>
                <p><strong>Idle Max:</strong> {latestTraffic.traffic_stats['Idle Max']}</p>
                <p><strong>Idle Min:</strong> {latestTraffic.traffic_stats['Idle Min']}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Attack Feature Statistics Section */}
      <div style={{ marginTop: "30px" }}>
        <h2 style={{ color: "#00d4ff" }}>Attack Feature Statistics</h2>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "20px",
          marginTop: "20px"
        }}>
          {Object.entries(attackFeatureStats).map(([attackType, features]) => (
            <div
              key={attackType}
              style={{
                backgroundColor: "#333",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
              }}
            >
              <h3 style={{ color: "#00d4ff", marginBottom: "15px" }}>{attackType}</h3>
              {Object.entries(features).length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {Object.entries(features)
                    .sort(([, a], [, b]) => b - a) // Sort by frequency
                    .map(([feature, count]) => (
                      <div
                        key={feature}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px",
                          backgroundColor: "rgba(0, 212, 255, 0.1)",
                          borderRadius: "5px"
                        }}
                      >
                        <span style={{ flex: 1 }}>{feature}</span>
                        <span
                          style={{
                            backgroundColor: "#00d4ff",
                            color: "#333",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "0.9em",
                            fontWeight: "bold"
                          }}
                        >
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p style={{ color: "#888", fontStyle: "italic" }}>No features detected yet</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to get feature descriptions
const getFeatureDescription = (feature) => {
  const descriptions = {
    // Basic Flow Features
    'Destination Port': 'Target port number for the network traffic',
    'Flow Duration': 'Total duration of the network flow in microseconds',
    'Flow Bytes/s': 'Number of bytes transferred per second',
    'Flow Packets/s': 'Number of packets transferred per second',
    
    // Packet Count Features
    'Total Fwd Packets': 'Total number of packets in the forward direction',
    'Total Backward Packets': 'Total number of packets in the backward direction',
    'Subflow Fwd Packets': 'Average number of packets in a forward sub-flow',
    'Subflow Bwd Packets': 'Average number of packets in a backward sub-flow',
    'act_data_pkt_fwd': 'Count of packets with at least 1 byte of TCP data',
    
    // Packet Length Features
    'Total Length of Fwd Packets': 'Total size of packet data in forward direction',
    'Total Length of Bwd Packets': 'Total size of packet data in backward direction',
    'Fwd Packet Length Max': 'Maximum packet length in forward direction',
    'Fwd Packet Length Min': 'Minimum packet length in forward direction',
    'Fwd Packet Length Mean': 'Average packet length in forward direction',
    'Fwd Packet Length Std': 'Standard deviation of packet length in forward direction',
    'Bwd Packet Length Max': 'Maximum packet length in backward direction',
    'Bwd Packet Length Min': 'Minimum packet length in backward direction',
    'Bwd Packet Length Mean': 'Average packet length in backward direction',
    'Bwd Packet Length Std': 'Standard deviation of packet length in backward direction',
    'Min Packet Length': 'Minimum length of a packet in the flow',
    'Max Packet Length': 'Maximum length of a packet in the flow',
    'Packet Length Mean': 'Average length of all packets in the flow',
    'Packet Length Std': 'Standard deviation of packet lengths',
    'Packet Length Variance': 'Variance in packet lengths',
    
    // Inter-arrival Time (IAT) Features
    'Flow IAT Mean': 'Average time between two packets in the flow',
    'Flow IAT Std': 'Standard deviation of packet inter-arrival times',
    'Flow IAT Max': 'Maximum time between two packets in the flow',
    'Flow IAT Min': 'Minimum time between two packets in the flow',
    'Fwd IAT Total': 'Total time between two forward packets',
    'Fwd IAT Mean': 'Average time between two forward packets',
    'Fwd IAT Std': 'Standard deviation of forward inter-arrival times',
    'Fwd IAT Max': 'Maximum time between two forward packets',
    'Fwd IAT Min': 'Minimum time between two forward packets',
    'Bwd IAT Total': 'Total time between two backward packets',
    'Bwd IAT Mean': 'Average time between two backward packets',
    'Bwd IAT Std': 'Standard deviation of backward inter-arrival times',
    'Bwd IAT Max': 'Maximum time between two backward packets',
    'Bwd IAT Min': 'Minimum time between two backward packets',
    
    // Flag Count Features
    'FIN Flag Count': 'Number of packets with FIN flag set',
    'SYN Flag Count': 'Number of packets with SYN flag set',
    'RST Flag Count': 'Number of packets with RST flag set',
    'PSH Flag Count': 'Number of packets with PUSH flag set',
    'ACK Flag Count': 'Number of packets with ACK flag set',
    'URG Flag Count': 'Number of packets with URG flag set',
    'CWE Flag Count': 'Number of packets with CWE flag set',
    'ECE Flag Count': 'Number of packets with ECE flag set',
    'Fwd PSH Flags': 'Number of times PSH flag was set in forward direction',
    'Fwd URG Flags': 'Number of times URG flag was set in forward direction',
    
    // Header Features
    'Fwd Header Length': 'Total bytes used for headers in forward direction',
    'Bwd Header Length': 'Total bytes used for headers in backward direction',
    'Fwd Header Length Extra': 'Extra bytes in forward header',
    
    // Window Features
    'Init_Win_bytes_forward': 'TCP window size of forward packets',
    'Init_Win_bytes_backward': 'TCP window size of backward packets',
    'min_seg_size_forward': 'Minimum segment size in forward direction',
    
    // Ratio Features
    'Down/Up Ratio': 'Ratio of download to upload size',
    'Average Packet Size': 'Average size of each packet in the flow',
    'Avg Fwd Segment Size': 'Average size of each forward segment',
    'Avg Bwd Segment Size': 'Average size of each backward segment',
    
    // Subflow Features
    'Subflow Fwd Bytes': 'Average number of bytes in a forward sub-flow',
    'Subflow Bwd Bytes': 'Average number of bytes in a backward sub-flow',
    
    // Activity Features
    'Active Mean': 'Mean time a flow was active before idle',
    'Active Std': 'Standard deviation of active times',
    'Active Max': 'Longest time a flow was active before idle',
    'Active Min': 'Shortest time a flow was active before idle',
    'Idle Mean': 'Mean time a flow was idle before active',
    'Idle Std': 'Standard deviation of idle times',
    'Idle Max': 'Longest time a flow was idle before active',
    'Idle Min': 'Shortest time a flow was idle before active'
  };
  
  return descriptions[feature] || 'Network traffic characteristic';
};

export default Dashboard;
