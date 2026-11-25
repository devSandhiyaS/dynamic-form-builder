import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../features/dashboard/dashboardSlice";

function Dashboard() {
  const dispatch = useDispatch();

  const { stats, loading, error } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  return (
    <div>
      <div className="page-heading">
        <h1>Dashboard</h1>
        <p>Manage your forms and submissions from here.</p>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Forms</h3>
          <h2>{loading ? "..." : stats.totalForms}</h2>
        </div>

        <div className="dashboard-card">
          <h3>Published Forms</h3>
          <h2>{loading ? "..." : stats.publishedForms}</h2>
        </div>

        <div className="dashboard-card">
          <h3>Draft Forms</h3>
          <h2>{loading ? "..." : stats.draftForms}</h2>
        </div>

        <div className="dashboard-card">
          <h3>Total Submissions</h3>
          <h2>{loading ? "..." : stats.totalSubmissions}</h2>
        </div>
      </div>

      {error && (
        <p className="error-message">{error}</p>
      )}

      <div className="dashboard-welcome">
        <h2>Welcome to Dynamic Form Builder</h2>
        <p>
          Create, manage and publish dynamic forms without
          writing individual form components.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
