import { useState, useEffect } from "react";
import "./InvestorsList.css";

const InvestorsList = () => {
      const [investors, setInvestors] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      const API_BASE_URL =
            process.env.NODE_ENV === "production"
                  ? "https://finlete-be.vercel.app/api"
                  : "http://localhost:3000/api";
      const DEAL_ID = "3701";

      useEffect(() => {
            fetchInvestors();
      }, []);

      const fetchInvestors = async (retryCount = 0) => {
            try {
                  setLoading(true);
                  console.log(
                        `Fetching investors (attempt ${retryCount + 1})...`
                  );

                  const response = await fetch(
                        `${API_BASE_URL}/deals/${DEAL_ID}/investors`,
                        {
                              method: "GET",
                              mode: "cors",
                              cache: "no-cache",
                        }
                  );

                  if (!response.ok) {
                        throw new Error(
                              `HTTP error! status: ${response.status}`
                        );
                  }

                  const data = await response.json();
                  setInvestors(data.items || []);
                  setError(null);
                  console.log("Investors fetched successfully");
            } catch (err) {
                  console.error("Error fetching investors:", err);

                  // Retry up to 3 times with exponential backoff
                  if (retryCount < 3) {
                        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
                        console.log(`Retrying in ${delay}ms...`);
                        setTimeout(() => fetchInvestors(retryCount + 1), delay);
                        return;
                  }

                  setError(err.message);
            } finally {
                  if (retryCount === 0) {
                        setLoading(false);
                  }
            }
      };

      const formatCurrency = (amount) => {
            return new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
            }).format(amount);
      };

      const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
            });
      };

      const getStateColor = (state) => {
            switch (state) {
                  case "accepted":
                        return "#22c55e";
                  case "inactive":
                        return "#6b7280";
                  default:
                        return "#6b7280";
            }
      };

      const getFundingStateColor = (fundingState) => {
            switch (fundingState) {
                  case "funded":
                        return "#22c55e";
                  case "unfunded":
                        return "#ef4444";
                  default:
                        return "#6b7280";
            }
      };

      if (loading) {
            return (
                  <div className='investors-container'>
                        <div className='loading'>
                              <div className='spinner'></div>
                              <p>Loading investors...</p>
                        </div>
                  </div>
            );
      }

      if (error) {
            return (
                  <div className='investors-container'>
                        <div className='error'>
                              <h3>❌ Error loading investors</h3>
                              <p>{error}</p>
                              <button
                                    onClick={fetchInvestors}
                                    className='retry-btn'>
                                    🔄 Retry
                              </button>
                        </div>
                  </div>
            );
      }

      return (
            <div className='investors-container'>
                  <header className='investors-header'>
                        <h1>👥 Deal Investors</h1>
                        <p>
                              Deal ID: {DEAL_ID} | API: {API_BASE_URL}
                        </p>
                        <button
                              onClick={fetchInvestors}
                              className='refresh-btn'>
                              🔄 Refresh
                        </button>
                  </header>

                  <div className='investors-stats'>
                        <div className='stat'>
                              <span className='stat-number'>
                                    {investors.length}
                              </span>
                              <span className='stat-label'>
                                    Total Investors
                              </span>
                        </div>
                        <div className='stat'>
                              <span className='stat-number'>
                                    {
                                          investors.filter(
                                                (inv) =>
                                                      inv.state === "accepted"
                                          ).length
                                    }
                              </span>
                              <span className='stat-label'>Accepted</span>
                        </div>
                        <div className='stat'>
                              <span className='stat-number'>
                                    {
                                          investors.filter(
                                                (inv) =>
                                                      inv.funding_state ===
                                                      "funded"
                                          ).length
                                    }
                              </span>
                              <span className='stat-label'>Funded</span>
                        </div>
                        <div className='stat'>
                              <span className='stat-number'>
                                    {formatCurrency(
                                          investors.reduce(
                                                (sum, inv) =>
                                                      sum +
                                                      (inv.investment_value ||
                                                            0),
                                                0
                                          )
                                    )}
                              </span>
                              <span className='stat-label'>
                                    Total Investment
                              </span>
                        </div>
                  </div>

                  <div className='investors-grid'>
                        {investors.map((investor) => (
                              <div
                                    key={investor.id}
                                    className='investor-card'>
                                    <div className='investor-header'>
                                          <div className='investor-title'>
                                                <h3>
                                                      {investor.name ||
                                                            "Unnamed Investor"}
                                                </h3>
                                                <div className='status-badges'>
                                                      <span
                                                            className='state-badge'
                                                            style={{
                                                                  backgroundColor:
                                                                        getStateColor(
                                                                              investor.state
                                                                        ),
                                                            }}>
                                                            {investor.state.toUpperCase()}
                                                      </span>
                                                      <span
                                                            className='funding-badge'
                                                            style={{
                                                                  backgroundColor:
                                                                        getFundingStateColor(
                                                                              investor.funding_state
                                                                        ),
                                                            }}>
                                                            {investor.funding_state.toUpperCase()}
                                                      </span>
                                                </div>
                                          </div>
                                          <div className='investor-id'>
                                                ID: {investor.id}
                                          </div>
                                    </div>

                                    <div className='investor-contact'>
                                          <div className='contact-info'>
                                                <span className='email'>
                                                      📧{" "}
                                                      {investor.user?.email ||
                                                            "N/A"}
                                                </span>
                                                <span className='phone'>
                                                      📞{" "}
                                                      {investor.phone_number ||
                                                            investor.user
                                                                  ?.phone ||
                                                            "N/A"}
                                                </span>
                                          </div>
                                    </div>

                                    <div className='investor-details'>
                                          <div className='detail-row'>
                                                <span className='label'>
                                                      Investment Value:
                                                </span>
                                                <span className='value price'>
                                                      {formatCurrency(
                                                            investor.investment_value
                                                      )}
                                                </span>
                                          </div>

                                          <div className='detail-row'>
                                                <span className='label'>
                                                      Securities:
                                                </span>
                                                <span className='value'>
                                                      {
                                                            investor.number_of_securities
                                                      }
                                                </span>
                                          </div>

                                          <div className='detail-row'>
                                                <span className='label'>
                                                      Funds Value:
                                                </span>
                                                <span className='value'>
                                                      {formatCurrency(
                                                            investor.funds_value
                                                      )}
                                                </span>
                                          </div>
                                    </div>

                                    <div className='investor-location'>
                                          <h4>📍 Location</h4>
                                          <p className='address'>
                                                {investor.beneficial_address ||
                                                      "Address not provided"}
                                          </p>
                                    </div>

                                    <div className='investor-meta'>
                                          <div className='meta-row'>
                                                <span className='label'>
                                                      Created:
                                                </span>
                                                <span className='value'>
                                                      {formatDate(
                                                            investor.created_at
                                                      )}
                                                </span>
                                          </div>
                                          <div className='meta-row'>
                                                <span className='label'>
                                                      Checkout State:
                                                </span>
                                                <span className='value'>
                                                      {investor.checkout_state?.replace(
                                                            /_/g,
                                                            " "
                                                      )}
                                                </span>
                                          </div>
                                    </div>

                                    {investor.tags &&
                                          investor.tags.length > 0 && (
                                                <div className='investor-tags'>
                                                      <h4>🏷️ Tags</h4>
                                                      <div className='tags-list'>
                                                            {investor.tags.map(
                                                                  (
                                                                        tag,
                                                                        index
                                                                  ) => (
                                                                        <span
                                                                              key={
                                                                                    index
                                                                              }
                                                                              className='tag'>
                                                                              {
                                                                                    tag
                                                                              }
                                                                        </span>
                                                                  )
                                                            )}
                                                      </div>
                                                </div>
                                          )}
                              </div>
                        ))}
                  </div>

                  {investors.length === 0 && (
                        <div className='no-investors'>
                              <h3>📭 No investors found</h3>
                              <p>Check your API connection</p>
                        </div>
                  )}
            </div>
      );
};

export default InvestorsList;
