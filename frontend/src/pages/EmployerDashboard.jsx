import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Layers, 
  ChevronLeft, 
  Send, 
  Info, 
  CheckCircle, 
  Globe, 
  Award,
  Plus,
  User as UserIcon
} from 'lucide-react';
import { useJobStore } from '../store/jobStore';
import { useAuthStore } from '../store/authStore';

function EmployerDashboard() {
  const { createJob, isLoading, error } = useJobStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'Full-time',
    category: '',
    minSalary: '',
    maxSalary: '',
    experienceLevel: 'Mid Level',
    isRemote: false,
    requirements: '',
    benefits: '',
  });

  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setServerError('');

    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        benefits: formData.benefits.split('\n').filter(b => b.trim()),
        salaryRange: {
          min: Number(formData.minSalary),
          max: Number(formData.maxSalary),
          currency: 'USD',
        },
      };

      delete jobData.minSalary;
      delete jobData.maxSalary;

      await createJob(jobData);
      setSuccess('Job posted successfully! Redirecting to home...');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to post job');
    }
  };

  if (user?.role !== 'employer') {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          Only employers can post jobs. Please log in as an employer.
        </div>
        <button onClick={() => navigate('/')} className="back-btn">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard-page"
    >
      <header className="header">
        <div className="header-content">
          <h1>
            <img src="/NJB.png" alt="NexJob Logo" className="app-logo" />
            Employer <span>Hub</span>
          </h1>
          <button onClick={() => navigate('/profile')} className="nav-btn">
            <UserIcon size={18} /> Profile
          </button>
          <button onClick={() => navigate('/')} className="nav-btn">
            <ChevronLeft size={18} /> Back to Jobs
          </button>
        </div>
      </header>

      <main className="main-content-wide">
        <div className="dashboard-grid">
          <div className="dashboard-sidebar">
            <div className="sidebar-card">
              <h3>Post a Opportunity</h3>
              <p>Reach thousands of qualified candidates across the globe. Fill out the details to get started.</p>
              
              <div className="progress-steps">
                <div className="step active">
                  <span className="step-num">1</span>
                  <span className="step-text">Core Details</span>
                </div>
                <div className="step">
                  <span className="step-num">2</span>
                  <span className="step-text">Description</span>
                </div>
                <div className="step">
                  <span className="step-num">3</span>
                  <span className="step-text">Perks & Req</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-form-area">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="form-glass-container"
            >
              <div className="form-header-fancy">
                <h2>Create Vacancy</h2>
                <p>Mandatory fields are marked with an asterisk (*)</p>
              </div>

              {success && (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="success-message-fancy">
                  <CheckCircle size={20} /> {success}
                </motion.div>
              )}
              {serverError && <div className="error-message">{serverError}</div>}

              <form onSubmit={handleSubmit} className="premium-job-form">
                <section className="form-section">
                  <div className="section-title">
                    <Info size={18} /> <h3>Basic Information</h3>
                  </div>
                  
                  <div className="form-row-grid">
                    <div className="premium-group">
                      <label htmlFor="title">Job Title *</label>
                      <div className="input-with-icon">
                        <Briefcase size={18} />
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="e.g., Senior React Developer"
                          required
                        />
                      </div>
                    </div>

                    <div className="premium-group">
                      <label htmlFor="category">Category *</label>
                      <div className="input-with-icon">
                        <Layers size={18} />
                        <input
                          type="text"
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          placeholder="e.g., Web Development"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row-grid">
                    <div className="premium-group">
                      <label htmlFor="type">Job Type *</label>
                      <select id="type" name="type" value={formData.type} onChange={handleChange} required>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    <div className="premium-group">
                      <label htmlFor="experienceLevel">Experience Level</label>
                      <select id="experienceLevel" name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
                        <option value="Entry Level">Entry Level</option>
                        <option value="Mid Level">Mid Level</option>
                        <option value="Senior Level">Senior Level</option>
                        <option value="Executive">Executive</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-grid">
                    <div className="premium-group">
                      <label htmlFor="location">Location *</label>
                      <div className="input-with-icon">
                        <MapPin size={18} />
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="e.g., San Francisco, CA"
                          required
                        />
                      </div>
                    </div>

                    <div className="premium-group checkbox-fancy">
                      <label htmlFor="isRemote" className="toggle-label">
                        <input
                          type="checkbox"
                          id="isRemote"
                          name="isRemote"
                          checked={formData.isRemote}
                          onChange={handleChange}
                        />
                        <span className="toggle-custom"></span>
                        <Globe size={18} /> Remote Opportunity
                      </label>
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <Award size={18} /> <h3>Compensation & Details</h3>
                  </div>
                  
                  <div className="form-row-grid">
                    <div className="premium-group">
                      <label htmlFor="minSalary">Min Salary (USD)</label>
                      <div className="input-with-icon">
                        <DollarSign size={18} />
                        <input
                          type="number"
                          id="minSalary"
                          name="minSalary"
                          value={formData.minSalary}
                          onChange={handleChange}
                          placeholder="e.g., 80000"
                        />
                      </div>
                    </div>

                    <div className="premium-group">
                      <label htmlFor="maxSalary">Max Salary (USD)</label>
                      <div className="input-with-icon">
                        <DollarSign size={18} />
                        <input
                          type="number"
                          id="maxSalary"
                          name="maxSalary"
                          value={formData.maxSalary}
                          onChange={handleChange}
                          placeholder="e.g., 120000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="premium-group">
                    <label htmlFor="description">Job Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the job, responsibilities, and what you're looking for..."
                      rows="8"
                      required
                    />
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <Plus size={18} /> <h3>Requirements & Benefits</h3>
                  </div>
                  
                  <div className="form-row-grid">
                    <div className="premium-group">
                      <label htmlFor="requirements">Requirements (One per line)</label>
                      <textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        placeholder="React.js&#10;Node.js&#10;5+ years experience"
                        rows="5"
                      />
                    </div>

                    <div className="premium-group">
                      <label htmlFor="benefits">Company Benefits (One per line)</label>
                      <textarea
                        id="benefits"
                        name="benefits"
                        value={formData.benefits}
                        onChange={handleChange}
                        placeholder="Health Insurance&#10;401k Matching&#10;Remote Work"
                        rows="5"
                      />
                    </div>
                  </div>
                </section>

                <div className="form-actions-premium">
                  <button type="submit" disabled={isLoading} className="submit-btn-premium">
                    {isLoading ? 'Processing...' : (
                      <>
                        <Send size={18} /> Publish Opportunity
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}

export default EmployerDashboard;
