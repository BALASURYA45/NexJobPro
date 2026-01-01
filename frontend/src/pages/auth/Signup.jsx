import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, MapPin, Briefcase, Sparkles, ArrowRight, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'seeker',
    phone: '',
    location: '',
  });
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { confirmPassword, firstName, lastName, phone, location, ...signupData } = formData;
      const name = `${firstName} ${lastName}`.trim();
      
      await signup({ ...signupData, name });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="signup-box"
      >
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/NJB.png" alt="NexJob Logo" className="login-logo" />
          </div>
          <h1>Join NexJob Pro</h1>
          <p>Create your professional account and start your journey</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="error-message"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <div className="input-wrapper">
                <User size={18} />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <div className="input-wrapper">
                <User size={18} />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">I am a...</label>
              <div className="input-wrapper">
                <UserCircle size={18} />
                <select id="role" name="role" value={formData.role} onChange={handleChange}>
                  <option value="seeker">Job Seeker</option>
                  <option value="employer">Employer</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <div className="input-wrapper">
                <MapPin size={18} />
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="San Francisco, CA"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <Phone size={18} />
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : (
              <>
                Create Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in instead</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;
