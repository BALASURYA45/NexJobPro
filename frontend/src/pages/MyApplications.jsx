import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationStore } from '../store/applicationStore';
import { useAuthStore } from '../store/authStore';

function MyApplications() {
  const { applications, getUserApplications, isLoading, error, deleteApplication } = useApplicationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    if (user?.role === 'seeker') {
      getUserApplications();
    }
  }, [user, getUserApplications]);

  const handleDelete = async (appId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        await deleteApplication(appId);
        setDeleteSuccess('Application withdrawn successfully');
        setTimeout(() => setDeleteSuccess(''), 3000);
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  };

  if (user?.role !== 'seeker') {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          Only job seekers can view applications.
        </div>
        <button onClick={() => navigate('/')} className="back-btn">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-content">
          <h1>
            <img src="/NJB.png" alt="NexJob Logo" className="app-logo" />
            My Applications
          </h1>
          <button onClick={() => navigate('/')} className="nav-btn">
            Back to Jobs
          </button>
        </div>
      </header>

      <main className="main-content">
        {deleteSuccess && <div className="success-message">{deleteSuccess}</div>}
        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading">Loading applications...</div>
        ) : (
          <div className="applications-container">
            <h2>Your Applications ({applications.length})</h2>
            {applications.length === 0 ? (
              <div className="empty-state">
                <p>You haven't applied to any jobs yet.</p>
                <button onClick={() => navigate('/')} className="nav-btn">
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((app) => (
                  <div key={app._id} className="application-card">
                    <div className="app-header">
                      <div>
                        <h3>{app.jobId?.title || 'Job'}</h3>
                        <p className="company">{app.jobId?.category || 'Unknown'}</p>
                      </div>
                      <span className={`status ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>

                    <div className="app-details">
                      <p><strong>Location:</strong> {app.jobId?.location || 'N/A'}</p>
                      <p><strong>Type:</strong> {app.jobId?.type || 'N/A'}</p>
                      <p><strong>Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>

                    {app.coverLetter && (
                      <div className="cover-letter">
                        <strong>Your Cover Letter:</strong>
                        <p>{app.coverLetter}</p>
                      </div>
                    )}

                    <div className="app-actions">
                      <button
                        onClick={() => navigate(`/job/${app.jobId?._id}`)}
                        className="view-job-btn"
                      >
                        View Job
                      </button>
                      {app.status === 'pending' && (
                        <button
                          onClick={() => handleDelete(app._id)}
                          className="delete-btn"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyApplications;
