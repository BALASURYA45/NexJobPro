import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationStore } from '../store/applicationStore';
import { useAuthStore } from '../store/authStore';

function EmployerApplications() {
  const { applications, getEmployerApplications, isLoading, error, updateApplicationStatus } = useApplicationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState('');
  const [groupedApps, setGroupedApps] = useState({});

  useEffect(() => {
    if (user?.role === 'employer') {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    try {
      await getEmployerApplications();
    } catch (err) {
      console.error('Error loading applications:', err);
    }
  };

  useEffect(() => {
    if (applications && applications.length > 0) {
      const grouped = {};
      applications.forEach((app) => {
        const jobTitle = app.jobId?.title || 'Unknown Job';
        if (!grouped[jobTitle]) {
          grouped[jobTitle] = [];
        }
        grouped[jobTitle].push(app);
      });
      setGroupedApps(grouped);
    }
  }, [applications]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      setSuccessMsg(`Application ${newStatus} successfully`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Status update error:', err);
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

  if (user?.role !== 'employer') {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          Only employers can view applications.
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
            Job Applications
          </h1>
          <nav className="nav">
            <button onClick={() => navigate('/employer-dashboard')} className="nav-btn">
              Post Job
            </button>
            <button onClick={() => navigate('/')} className="nav-btn">
              Back to Jobs
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {successMsg && <div className="success-message">{successMsg}</div>}
        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading">Loading applications...</div>
        ) : (
          <div className="employer-apps-container">
            <h2>Received Applications</h2>
            {applications.length === 0 ? (
              <div className="empty-state">
                <p>No applications received yet.</p>
                <button onClick={() => navigate('/employer-dashboard')} className="nav-btn">
                  Post a Job
                </button>
              </div>
            ) : (
              <div className="jobs-applications">
                {Object.entries(groupedApps).map(([jobTitle, apps]) => (
                  <div key={jobTitle} className="job-applications">
                    <h3>{jobTitle}</h3>
                    <p className="app-count">{apps.length} application{apps.length !== 1 ? 's' : ''}</p>

                    <div className="applicants-list">
                      {apps.map((app) => (
                        <div key={app._id} className="applicant-card">
                          <div className="applicant-header">
                            <div>
                              <h4>{app.userId?.name || 'Unknown Applicant'}</h4>
                              <p className="email">{app.userId?.email || 'N/A'}</p>
                            </div>
                            <span className={`status ${getStatusColor(app.status)}`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </div>

                          <div className="applicant-details">
                            <p><strong>Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>

                          {app.coverLetter && (
                            <div className="cover-letter">
                              <strong>Cover Letter:</strong>
                              <p>{app.coverLetter}</p>
                            </div>
                          )}

                          <div className="applicant-actions">
                            {app.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(app._id, 'accepted')}
                                  className="accept-btn"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleStatusChange(app._id, 'rejected')}
                                  className="reject-btn"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => window.open(`mailto:${app.userId?.email}`)}
                              className="email-btn"
                            >
                              Email
                            </button>
                          </div>
                        </div>
                      ))}
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

export default EmployerApplications;
