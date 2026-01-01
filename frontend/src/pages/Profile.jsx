import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Globe, 
  MapPin, 
  GraduationCap, 
  Heart, 
  ChevronLeft, 
  Save, 
  CheckCircle,
  Link as LinkIcon,
  Linkedin,
  Github
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

function Profile() {
  const { user, updateProfile, isLoading, error: storeError } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resumeUrl: '',
    portfolio: '',
    linkedin: '',
    github: '',
    location: '',
    degree: '',
    areaOfInterest: '',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        resumeUrl: user.profile?.resumeUrl || '',
        portfolio: user.profile?.portfolio || '',
        linkedin: user.profile?.linkedin || '',
        github: user.profile?.github || '',
        location: user.profile?.location || '',
        degree: user.profile?.degree || '',
        areaOfInterest: Array.isArray(user.profile?.areaOfInterest) 
          ? user.profile.areaOfInterest.join(', ') 
          : user.profile?.areaOfInterest || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      const profileData = {
        name: formData.name,
        email: formData.email,
        profile: {
          phone: formData.phone,
          resumeUrl: formData.resumeUrl,
          portfolio: formData.portfolio,
          linkedin: formData.linkedin,
          github: formData.github,
          location: formData.location,
          degree: formData.degree,
          areaOfInterest: formData.areaOfInterest.split(',').map(item => item.trim()).filter(item => item !== ''),
        }
      };

      await updateProfile(profileData);
      setSuccess('Profile updated successfully!');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          Please log in to view your profile.
        </div>
        <button onClick={() => navigate('/login')} className="back-btn">
          Go to Login
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
            User <span>Profile</span>
          </h1>
          <button onClick={() => navigate('/')} className="nav-btn">
            <ChevronLeft size={18} /> Back to Jobs
          </button>
        </div>
      </header>

      <main className="main-content-wide">
        <div className="dashboard-grid">
          <div className="dashboard-sidebar">
            <div className="sidebar-card">
              <div className="profile-avatar-large">
                <User size={48} />
              </div>
              <h3>{user.name}</h3>
              <p className="role-badge">{user.role.toUpperCase()}</p>
              <p className="sidebar-info-text">Complete your profile to increase your chances of getting hired by top employers.</p>
              
              <div className="profile-completeness">
                <div className="completeness-bar">
                  <div className="fill" style={{ width: '85%' }}></div>
                </div>
                <span>Profile Strength: Strong</span>
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
                <h2>Personal Details</h2>
                <p>Manage your account information and professional presence</p>
              </div>

              {success && (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="success-message-fancy">
                  <CheckCircle size={20} /> {success}
                </motion.div>
              )}
              {(error || storeError) && <div className="error-message">{error || storeError}</div>}

              <form onSubmit={handleSubmit} className="premium-job-form">
                <section className="form-section">
                  <div className="section-title">
                    <User size={18} /> <h3>Basic Contact</h3>
                  </div>
                  
                  <div className="form-row-grid">
                    <div className="premium-group">
                      <label htmlFor="name">Full Name</label>
                      <div className="input-with-icon">
                        <User size={18} />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your Name"
                          required
                        />
                      </div>
                    </div>

                    <div className="premium-group">
                      <label htmlFor="email">Email Address</label>
                      <div className="input-with-icon">
                        <Mail size={18} />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row-grid">
                    <div className="premium-group">
                      <label htmlFor="phone">Phone Number</label>
                      <div className="input-with-icon">
                        <Phone size={18} />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    <div className="premium-group">
                      <label htmlFor="location">Place / Location</label>
                      <div className="input-with-icon">
                        <MapPin size={18} />
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <GraduationCap size={18} /> <h3>Professional Background</h3>
                  </div>
                  
                  <div className="form-row-grid">
                    <div className="premium-group">
                      <label htmlFor="degree">Degree / Education</label>
                      <div className="input-with-icon">
                        <GraduationCap size={18} />
                        <select 
                          id="degree" 
                          name="degree" 
                          value={formData.degree} 
                          onChange={handleChange}
                        >
                          <option value="">Select Degree</option>
                          <option value="B.E. / B.Tech (Engineering)">B.E. / B.Tech (Engineering)</option>
                          <option value="M.E. / M.Tech (Engineering)">M.E. / M.Tech (Engineering)</option>
                          <option value="B.A. (Arts)">B.A. (Arts)</option>
                          <option value="M.A. (Arts)">M.A. (Arts)</option>
                          <option value="B.Sc (Science)">B.Sc (Science)</option>
                          <option value="M.Sc (Science)">M.Sc (Science)</option>
                          <option value="B.Com (Commerce)">B.Com (Commerce)</option>
                          <option value="M.Com (Commerce)">M.Com (Commerce)</option>
                          <option value="BCA / MCA">BCA / MCA</option>
                          <option value="MBA / BBA">MBA / BBA</option>
                          <option value="PhD">PhD</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="premium-group">
                      <label htmlFor="areaOfInterest">Area of Interest (Comma separated)</label>
                      <div className="input-with-icon">
                        <Heart size={18} />
                        <input
                          type="text"
                          id="areaOfInterest"
                          name="areaOfInterest"
                          value={formData.areaOfInterest}
                          onChange={handleChange}
                          placeholder="Web Dev, UI/UX, AI, etc."
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <FileText size={18} /> <h3>Links & Documents</h3>
                  </div>
                  
                  <div className="form-row-grid">
                    <div className="premium-group">
                      <label htmlFor="resumeUrl">Resume Link (Drive/Cloud/Portfolio)</label>
                      <div className="input-with-icon">
                        <LinkIcon size={18} />
                        <input
                          type="url"
                          id="resumeUrl"
                          name="resumeUrl"
                          value={formData.resumeUrl}
                          onChange={handleChange}
                          placeholder="https://link-to-your-resume.com"
                        />
                      </div>
                    </div>

                    <div className="premium-group">
                      <label htmlFor="portfolio">Portfolio Website</label>
                      <div className="input-with-icon">
                        <Globe size={18} />
                        <input
                          type="url"
                          id="portfolio"
                          name="portfolio"
                          value={formData.portfolio}
                          onChange={handleChange}
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row-grid">
                    <div className="premium-group">
                      <label htmlFor="linkedin">LinkedIn Profile</label>
                      <div className="input-with-icon">
                        <Linkedin size={18} />
                        <input
                          type="url"
                          id="linkedin"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>

                    <div className="premium-group">
                      <label htmlFor="github">GitHub Profile</label>
                      <div className="input-with-icon">
                        <Github size={18} />
                        <input
                          type="url"
                          id="github"
                          name="github"
                          value={formData.github}
                          onChange={handleChange}
                          placeholder="https://github.com/username"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="form-actions-premium">
                  <button type="submit" disabled={isLoading} className="submit-btn-premium">
                    {isLoading ? 'Saving...' : (
                      <>
                        <Save size={18} /> Update Profile
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

export default Profile;
