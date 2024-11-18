import React, { useState } from 'react';
import './App.css';

function App() {
  const [userId, setUserId] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

  const fetchRecommendations = async () => {
    if (!userId.trim()) {
      setError("User ID is required.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/recommend?user_id=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      const data = await response.json();
      setRecommendations(data.recommendations);
      setError(null);
    } catch (err) {
      setError(err.message);
      setRecommendations(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Product Recommendation System</h1>
        <p className="subtitle">Enter your User ID to get personalized recommendations.</p>

        <div className="form">
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="input"
          />
          <button onClick={fetchRecommendations} className="button">
            {loading ? 'Loading...' : 'Get Recommendations'}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {recommendations && (
          <div className="recommendations">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-card">
                <h2>Product ID: {rec.product_id}</h2>
                <p>Rating: {rec.rating}</p>
                <button
                  className="details-button"
                  onClick={() => alert(`View details for product ${rec.product_id}`)}
                >
                  View Product
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
