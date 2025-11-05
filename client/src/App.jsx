import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [response, setResponse] = useState(null);
  const [headers, setHeaders] = useState({});
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [limit, setLimit] = useState(null);
  const [resetTime, setResetTime] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [requestHistory, setRequestHistory] = useState([]);
  const [activeEndpoint, setActiveEndpoint] = useState("/api/resource");

  const callAPI = async (endpoint, endpointName) => {
    setLoading(true);
    setActiveEndpoint(endpoint);
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const headerEntries = Object.fromEntries(res.headers.entries());
      setResponse(data);
      setHeaders(headerEntries);

      const limit = parseInt(headerEntries["x-ratelimit-limit"] || 0);
      const remaining = parseInt(headerEntries["x-ratelimit-remaining"] || 0);
      const reset = parseInt(headerEntries["x-ratelimit-reset"] || 0);
      const retryAfter = parseInt(headerEntries["retry-after"] || 0);

      setLimit(limit);
      setRemaining(remaining);
      // Convert Unix timestamp to milliseconds
      setResetTime(reset * 1000);

      // Add to request history
      setRequestHistory(prev => [
        { 
          timestamp, 
          status: res.status, 
          remaining, 
          success: res.ok,
          endpoint: endpointName
        }, 
        ...prev.slice(0, 9) // Keep last 10 requests
      ]);
    } catch (err) {
      setResponse({ error: err.message });
      setRequestHistory(prev => [
        { timestamp, status: 'Error', remaining: 0, success: false, endpoint: endpointName }, 
        ...prev.slice(0, 9)
      ]);
    }
    setLoading(false);
  };

  // Countdown timer logic
  useEffect(() => {
    if (!resetTime) return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.round((resetTime - Date.now()) / 1000));
      setCountdown(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [resetTime]);

  const getStatusColor = () => {
    if (remaining === null) return "#64748b";
    const percentage = (remaining / limit) * 100;
    if (percentage > 50) return "#10b981";
    if (percentage > 20) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        {/* Header Section */}
        <header className="header">
          <div className="header-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#gradient1)" />
              <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="url(#gradient2)" opacity="0.7" />
              <defs>
                <linearGradient id="gradient1" x1="2" y1="2" x2="22" y2="12">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="gradient2" x1="2" y1="12" x2="22" y2="22">
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="title">Redis Rate Limiter</h1>
          <p className="subtitle">Token Bucket Algorithm Demo</p>
        </header>

        {/* Main Action Card */}
        <div className="main-card">
          <div className="card-header">
            <h2>API Request Tester</h2>
            <div className="status-badge" style={{ backgroundColor: getStatusColor() }}>
              {remaining !== null ? `${remaining} / ${limit} available` : "Ready"}
            </div>
          </div>

          {/* Multiple Endpoint Buttons */}
          <div className="endpoint-buttons">
            <button 
              className={`api-button standard ${loading && activeEndpoint === "/api/resource" ? 'loading' : ''}`} 
              onClick={() => callAPI("/api/resource", "Standard")} 
              disabled={loading}
            >
              <div className="button-icon">
                {loading && activeEndpoint === "/api/resource" ? (
                  <span className="spinner"></span>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </div>
              <div className="button-content">
                <span className="button-title">Standard</span>
                <span className="button-subtitle">10 capacity • 5 tokens/min</span>
              </div>
            </button>

            <button 
              className={`api-button strict ${loading && activeEndpoint === "/api/login" ? 'loading' : ''}`} 
              onClick={() => callAPI("/api/login", "Login")} 
              disabled={loading}
            >
              <div className="button-icon">
                {loading && activeEndpoint === "/api/login" ? (
                  <span className="spinner"></span>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
              <div className="button-content">
                <span className="button-title">Login</span>
                <span className="button-subtitle">5 capacity • 3 tokens/min</span>
              </div>
            </button>

            <button 
              className={`api-button generous ${loading && activeEndpoint === "/api/data" ? 'loading' : ''}`} 
              onClick={() => callAPI("/api/data", "Data")} 
              disabled={loading}
            >
              <div className="button-icon">
                {loading && activeEndpoint === "/api/data" ? (
                  <span className="spinner"></span>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                )}
              </div>
              <div className="button-content">
                <span className="button-title">Data</span>
                <span className="button-subtitle">20 capacity • 10 tokens/min</span>
              </div>
            </button>

            <button 
              className={`api-button very-strict ${loading && activeEndpoint === "/api/expensive" ? 'loading' : ''}`} 
              onClick={() => callAPI("/api/expensive", "Expensive")} 
              disabled={loading}
            >
              <div className="button-icon">
                {loading && activeEndpoint === "/api/expensive" ? (
                  <span className="spinner"></span>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div className="button-content">
                <span className="button-title">Expensive</span>
                <span className="button-subtitle">3 capacity • 2 tokens/min</span>
              </div>
            </button>
          </div>

          {/* Rate Limit Visualization */}
          {limit !== null && (
            <div className="rate-limit-section">
              <div className="progress-header">
                <span className="progress-label">Request Tokens</span>
                <span className="progress-value">{remaining} / {limit}</span>
              </div>
              
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${(remaining / limit) * 100}%`,
                    backgroundColor: getStatusColor()
                  }}
                >
                  <div className="progress-shine"></div>
                </div>
              </div>

              {countdown > 0 && (
                <div className="countdown-section">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                  </svg>
                  <span>Token refill in: <strong>{countdown}s</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Response Card */}
        {response && (
          <div className="response-card">
            <h3 className="response-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              API Response
            </h3>
            <pre className="response-content">{JSON.stringify(response, null, 2)}</pre>
            
            {/* Rate Limit Headers Display */}
            {headers && Object.keys(headers).length > 0 && (
              <div className="headers-section">
                <h4 className="headers-title">Rate Limit Headers:</h4>
                <div className="headers-grid">
                  {headers["x-ratelimit-limit"] && (
                    <div className="header-item">
                      <span className="header-key">X-RateLimit-Limit:</span>
                      <span className="header-value">{headers["x-ratelimit-limit"]}</span>
                    </div>
                  )}
                  {headers["x-ratelimit-remaining"] && (
                    <div className="header-item">
                      <span className="header-key">X-RateLimit-Remaining:</span>
                      <span className="header-value">{headers["x-ratelimit-remaining"]}</span>
                    </div>
                  )}
                  {headers["x-ratelimit-reset"] && (
                    <div className="header-item">
                      <span className="header-key">X-RateLimit-Reset:</span>
                      <span className="header-value">
                        {headers["x-ratelimit-reset"]} 
                        <span className="header-hint"> ({new Date(parseInt(headers["x-ratelimit-reset"]) * 1000).toLocaleTimeString()})</span>
                      </span>
                    </div>
                  )}
                  {headers["retry-after"] && (
                    <div className="header-item">
                      <span className="header-key">Retry-After:</span>
                      <span className="header-value">{headers["retry-after"]}s</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Request History */}
        {requestHistory.length > 0 && (
          <div className="history-card">
            <h3 className="history-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Request History
            </h3>
            <div className="history-list">
              {requestHistory.map((req, index) => (
                <div key={index} className={`history-item ${req.success ? 'success' : 'error'}`}>
                  <div className="history-status">
                    {req.success ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    )}
                  </div>
                  <span className="history-time">{req.timestamp}</span>
                  <span className="history-endpoint">{req.endpoint}</span>
                  <span className="history-badge">Status: {req.status}</span>
                  <span className="history-remaining">Remaining: {req.remaining}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="info-footer">
          <div className="info-item">
            <div className="info-icon redis">🔴</div>
            <div>
              <strong>Redis</strong>
              <p>Token bucket storage</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon mongo">🍃</div>
            <div>
              <strong>MongoDB</strong>
              <p>Throttle event logs</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon node">💚</div>
            <div>
              <strong>Express</strong>
              <p>API server</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;