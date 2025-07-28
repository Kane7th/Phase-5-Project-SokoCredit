import React, { useEffect, useState } from "react";
import "./AnalyticsDashboard.css";

const AnalyticsDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token"); // Ensure user is logged in

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const [
          overviewRes,
          performanceRes,
          customersRes,
          riskRes,
          loanTypesRes,
          portfolioRes,
          paymentsRes,
        ] = await Promise.all([
          fetch("http://localhost:5000/analytics/overview", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/analytics/performance", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/analytics/customers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/analytics/risk", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/analytics/loans/types", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/analytics/portfolio", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/analytics/loans/payments", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [
          overview,
          performance,
          customers,
          risk,
          loanTypes,
          portfolio,
          payments,
        ] = await Promise.all([
          overviewRes.json(),
          performanceRes.json(),
          customersRes.json(),
          riskRes.json(),
          loanTypesRes.json(),
          portfolioRes.json(),
          paymentsRes.json(),
        ]);

        // If loanTypes is an array or object, just include it directly
        setAnalyticsData({
          overview,
          performance: { ...performance, loanTypes },
          customers,
          risk,
          portfolio,
          payments,
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const renderTabContent = () => {
    if (isLoading) {
      return <p>Loading analytics...</p>;
    }

    if (!analyticsData) {
      return <p>No analytics data available.</p>;
    }

    switch (selectedTab) {
      case "overview":
      case "performance":
      case "customers":
      case "risk":
      case "portfolio":
      case "payments":
        return (
          <div className="analytics-grid">
            {Object.entries(analyticsData[selectedTab]).map(([key, value]) => (
              <div className="analytics-card" key={key}>
                <h3>{key}</h3>
                {typeof value === "object" ? (
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                ) : (
                  <p>{value}</p>
                )}
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Analytics Dashboard</h1>

      <div className="tab-buttons">
        <button
          onClick={() => setSelectedTab("overview")}
          className={selectedTab === "overview" ? "active" : ""}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab("performance")}
          className={selectedTab === "performance" ? "active" : ""}
        >
          Performance
        </button>
        <button
          onClick={() => setSelectedTab("customers")}
          className={selectedTab === "customers" ? "active" : ""}
        >
          Customers
        </button>
        <button
          onClick={() => setSelectedTab("risk")}
          className={selectedTab === "risk" ? "active" : ""}
        >
          Risk
        </button>
        <button
          onClick={() => setSelectedTab("portfolio")}
          className={selectedTab === "portfolio" ? "active" : ""}
        >
          Portfolio
        </button>
        <button
          onClick={() => setSelectedTab("payments")}
          className={selectedTab === "payments" ? "active" : ""}
        >
          Payments
        </button>
      </div>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default AnalyticsDashboard;
