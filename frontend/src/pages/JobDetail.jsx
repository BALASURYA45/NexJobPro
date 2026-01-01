import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobStore } from '../store/jobStore';
import { useApplicationStore } from '../store/applicationStore';
import { useAuthStore } from '../store/authStore';
import jobService from '../services/jobService';

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedJob, getJobById, isLoading: jobLoading } = useJobStore();
  const { applyForJob, isLoading: appLoading, error: appError } = useApplicationStore();
  const { user, token } = useAuthStore();
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [description, setDescription] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    getJobById(id);
  }, [id, getJobById]);

  useEffect(() => {
    if (selectedJob) {
      setDescription(selectedJob.description);
    }
  }, [selectedJob]);

  const handleTranslate = async () => {
    if (!description) return;
    setIsTranslating(true);
    try {
      const response = await jobService.translateText(description);
      console.log('Translation response:', response.data);
      if (response.data && response.data.translated) {
        setDescription(response.data.translated);
      } else {
        alert('Translation returned no content. The text might already be in English.');
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('Failed to translate description. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await applyForJob(id, { coverLetter });
      setCoverLetter('');
      setShowApplyForm(false);
      alert('Application submitted successfully!');
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to submit application');
    }
  };

  if (jobLoading) return <div className="loading">Loading job details...</div>;
  if (!selectedJob) return <div className="not-found">Job not found</div>;

  return (
    <div className="job-detail-container">
      <button onClick={() => navigate('/')} className="back-btn">
        ← Back to Jobs
      </button>

      <div className="job-detail">
        <h1>{selectedJob.title}</h1>
        <div className="job-meta">
          <span className="company">
            {typeof selectedJob.company === 'string' ? selectedJob.company : selectedJob.company?.name || selectedJob.category}
          </span>
          <span className="location">{selectedJob.location}</span>
          <span className="salary">
            {selectedJob.salaryRange ? 
              `$${selectedJob.salaryRange.min?.toLocaleString() || '?'}-$${selectedJob.salaryRange.max?.toLocaleString() || '?'}` : 
              `$${selectedJob.salary}`
            }
          </span>
        </div>

        <div className="job-body">
          <div className="description">
            <div className="description-header">
              <h2>Description</h2>
              <button 
                onClick={handleTranslate} 
                disabled={isTranslating}
                className="translate-btn"
              >
                {isTranslating ? 'Translating...' : '🌐 Translate to English'}
              </button>
            </div>
            <p>{description}</p>
          </div>

          <div className="requirements">
            <h2>Requirements</h2>
            <ul>
              {selectedJob.requirements?.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>

          <div className="benefits">
            <h2>Benefits</h2>
            <ul>
              {selectedJob.benefits?.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>

        {selectedJob?.source === 'external' ? (
          <div className="apply-section">
            <div className="external-job-notice">
              <p>🌐 This is an external job posting from a partner company.</p>
              <button
                onClick={() => window.open(selectedJob.sourceUrl, '_blank')}
                className="apply-external-btn"
              >
                Apply on Company Website →
              </button>
            </div>
          </div>
        ) : (
          user?.role === 'seeker' && (
            <div className="apply-section">
              {!showApplyForm ? (
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="apply-btn"
                >
                  Apply Now
                </button>
              ) : (
                <form onSubmit={handleApply} className="apply-form">
                  <h3>Submit Your Application</h3>
                  {submitError && <div className="error-message">{submitError}</div>}
                  {appError && <div className="error-message">{appError}</div>}
                  <div className="form-group">
                    <label htmlFor="coverLetter">Cover Letter</label>
                    <textarea
                      id="coverLetter"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Tell us why you're a great fit for this role..."
                      rows="5"
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" disabled={appLoading}>
                      {appLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplyForm(false)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default JobDetail;
