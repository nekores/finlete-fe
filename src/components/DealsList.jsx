import { useState, useEffect } from 'react';
import './DealsList.css';

const DealsList = ({ onDealSelect }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = '/api';

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/deals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('🔒 Deployment protection is enabled. Please disable it in Vercel Dashboard → Settings → Deployment Protection');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDeals(data.items || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'active': return '#22c55e';
      case 'close': return '#ef4444';
      case 'draft': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="deals-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deals-container">
        <div className="error">
          <h3>❌ Error loading deals</h3>
          <p>{error}</p>
          <button onClick={fetchDeals} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="deals-container">
      <header className="deals-header">
        <h1>🏆 DealMaker Deals</h1>
        <p>Connected to Production API: {API_BASE_URL}</p>
        <button onClick={fetchDeals} className="refresh-btn">
          🔄 Refresh
        </button>
      </header>

      <div className="deals-stats">
        <div className="stat">
          <span className="stat-number">{deals.length}</span>
          <span className="stat-label">Total Deals</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {deals.filter(deal => deal.state === 'active').length}
          </span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {deals.filter(deal => deal.state === 'close').length}
          </span>
          <span className="stat-label">Closed</span>
        </div>
      </div>

      <div className="deals-grid">
        {deals.map((deal) => (
          <div key={deal.id} className="deal-card" onClick={() => onDealSelect(deal)}>
            <div className="deal-header">
              <div className="deal-title">
                <h3>{deal.title}</h3>
                <span 
                  className="deal-state"
                  style={{ backgroundColor: getStateColor(deal.state) }}
                >
                  {deal.state.toUpperCase()}
                </span>
              </div>
              <div className="deal-id">ID: {deal.id}</div>
            </div>

            <div className="deal-details">
              <div className="detail-row">
                <span className="label">Security Type:</span>
                <span className="value">{deal.security_type || 'N/A'}</span>
              </div>
              
              <div className="detail-row">
                <span className="label">Price per Security:</span>
                <span className="value price">
                  {formatCurrency(deal.price_per_security)}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">Min Investment:</span>
                <span className="value">
                  {deal.minimum_investment ? formatCurrency(deal.minimum_investment) : 'N/A'}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">Max Investment:</span>
                <span className="value">
                  {deal.maximum_investment ? formatCurrency(deal.maximum_investment) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="deal-investors">
              <h4>👥 Investors</h4>
              <div className="investors-stats">
                <div className="investor-stat">
                  <span className="number">{deal.investors?.total || 0}</span>
                  <span className="label">Total</span>
                </div>
                <div className="investor-stat">
                  <span className="number">{deal.investors?.accepted || 0}</span>
                  <span className="label">Accepted</span>
                </div>
                <div className="investor-stat">
                  <span className="number">{deal.investors?.invited || 0}</span>
                  <span className="label">Invited</span>
                </div>
              </div>
            </div>

            <div className="deal-funding">
              <h4>💰 Funding</h4>
              <div className="funding-stats">
                <div className="funding-stat">
                  <span className="label">Subscribed:</span>
                  <span className="amount">
                    {formatCurrency(deal.funding?.amount_subscribed || 0)}
                  </span>
                </div>
                <div className="funding-stat">
                  <span className="label">Received:</span>
                  <span className="amount">
                    {formatCurrency(deal.funding?.funds_received || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="deal-enterprise">
              <small>🏢 {deal.enterprise?.name || 'N/A'}</small>
            </div>
          </div>
        ))}
      </div>

      {deals.length === 0 && (
        <div className="no-deals">
          <h3>📭 No deals found</h3>
          <p>Check your API connection</p>
        </div>
      )}
    </div>
  );
};

export default DealsList;