import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Globe, 
  Filter, 
  LogOut, 
  PlusCircle, 
  FileText,
  ChevronRight,
  Zap,
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import { useJobStore } from '../store/jobStore';
import { useAuthStore } from '../store/authStore';
import jobService from '../services/jobService';

function JobBoardHome() {
  const { jobs, getAllJobs, isLoading, error } = useJobStore();
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [translatedContent, setTranslatedContent] = useState({});
  const [translatingIds, setTranslatingIds] = useState({});
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    sort: 'newest',
    source: 'all',
  });

  const handleTranslateJob = async (e, id, title, description) => {
    e.stopPropagation(); // Prevent navigating to detail page
    if (translatingIds[id]) return;

    setTranslatingIds(prev => ({ ...prev, [id]: true }));
    try {
      // Translate title and description snippet
      const titleRes = await jobService.translateText(title || '');
      const descRes = await jobService.translateText(description || '');

      if (titleRes.data.translated || descRes.data.translated) {
        setTranslatedContent(prev => ({
          ...prev,
          [id]: {
            title: titleRes.data.translated || title,
            description: descRes.data.translated || description
          }
        }));
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslatingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (searchParams = {}) => {
    const params = {
      ...filters,
      ...searchParams,
    };
    
    const queryParams = {};
    if (searchQuery) queryParams.keyword = searchQuery;
    if (params.type) queryParams.type = params.type;
    if (params.category) queryParams.category = params.category;
    if (params.location) queryParams.location = params.location;
    if (params.minSalary) queryParams.minSalary = params.minSalary;
    if (params.maxSalary) queryParams.maxSalary = params.maxSalary;
    if (params.sort) queryParams.sort = params.sort;
    if (params.source && params.source !== 'all') queryParams.source = params.source;

    await getAllJobs(queryParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Mouse tracking effect for job cards
  const handleMouseMove = (e, id) => {
    const card = document.getElementById(`job-card-${id}`);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="home-container"
    >
      <header className="header">
        <div className="header-content">
          <h1>
            <img src="/NJB.png" alt="NexJob Logo" className="app-logo" />
            NexJob <span>Pro</span>
          </h1>
          <nav className="nav">
            {token && user ? (
              <>
                <div className="nav-user-info">
                  Welcome, <strong>{user.name}</strong>
                </div>
                {user.role === 'employer' && (
                  <>
                    <button onClick={() => navigate('/employer-dashboard')} className="nav-btn primary">
                      <PlusCircle size={18} /> Post Job
                    </button>
                    <button onClick={() => navigate('/employer-applications')} className="nav-btn">
                      <FileText size={18} /> Applications
                    </button>
                  </>
                )}
                {user.role === 'seeker' && (
                  <button onClick={() => navigate('/my-applications')} className="nav-btn">
                    <FileText size={18} /> My Applications
                  </button>
                )}
                <button onClick={() => navigate('/resumex')} className="nav-btn">
                  <Zap size={18} /> ResumeX
                </button>
                <button onClick={() => navigate('/profile')} className="nav-btn">
                  <UserIcon size={18} /> Profile
                </button>
                <button onClick={handleLogout} className="logout-btn">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="nav-btn">Login</button>
                <button onClick={() => navigate('/signup')} className="nav-btn primary">Sign Up</button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <section className="search-section">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="hero-badge">AI-Powered Job Discovery</span>
            <h2>Find your next <br />dream career.</h2>
            <p>Connect with the world's most innovative companies and discover opportunities tailored to your expertise.</p>
            
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <Search size={24} />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit">Search Jobs</button>
            </form>
          </motion.div>
        </section>

        <section className="filters-section">
          <div className="filters-header">
            <h3><Filter size={20} /> Advanced Filters</h3>
            <button 
              type="button" 
              onClick={() => {
                setFilters({ type: '', category: '', location: '', minSalary: '', maxSalary: '', sort: 'newest', source: 'all' });
                setSearchQuery('');
              }}
              className="clear-filters-btn"
            >
              Reset All
            </button>
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label>Job Type</label>
              <select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                <option value="Web Development">Web Development</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Technology">Technology</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="text"
                  name="location"
                  placeholder="City or Remote"
                  value={filters.location}
                  onChange={handleFilterChange}
                  style={{ paddingLeft: '35px' }}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Salary Range (Min)</label>
              <input
                type="number"
                name="minSalary"
                placeholder="Min Salary"
                value={filters.minSalary}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>Job Source</label>
              <select name="source" value={filters.source} onChange={handleFilterChange}>
                <option value="all">All Sources</option>
                <option value="internal">NexJob Direct</option>
                <option value="external">External 🌐</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select name="sort" value={filters.sort} onChange={handleFilterChange}>
                <option value="newest">Latest First</option>
                <option value="salary">Highest Salary</option>
              </select>
            </div>
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}

        <div className="jobs-container">
          <div className="jobs-header-meta">
            <h2>Featured Opportunities ({jobs.length})</h2>
          </div>

          {isLoading ? (
            <div className="loading">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Sparkles size={40} className="text-primary" />
              </motion.div>
              <p>Curating the best roles for you...</p>
            </div>
          ) : (
            <>
              {jobs.length === 0 ? (
                <div className="no-jobs">
                  <Search size={48} />
                  <p>No jobs found. Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="jobs-list">
                  <AnimatePresence mode='popLayout'>
                    {jobs.map((job, index) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        key={job._id}
                        id={`job-card-${job._id}`}
                        className="job-card"
                        onMouseMove={(e) => handleMouseMove(e, job._id)}
                        onClick={() => {
                          navigate(`/job/${job._id}`);
                        }}
                      >
                        <div className="job-header">
                          <div className="company-info">
                            <div className="company-logo">
                              {job.company?.[0] || job.category?.[0] || 'J'}
                            </div>
                            <div>
                              <div className="company-name">
                                {typeof job.company === 'string' ? job.company : job.company?.name || job.category}
                              </div>
                              <h3 className="job-title">
                                {translatedContent[job._id]?.title || job.title}
                              </h3>
                            </div>
                          </div>
                          <div className="job-header-right">
                            <button 
                              className="translate-btn-mini"
                              onClick={(e) => handleTranslateJob(e, job._id, job.title, job.description?.substring(0, 160))}
                              disabled={translatingIds[job._id]}
                              title="Translate to English"
                            >
                              {translatingIds[job._id] ? '...' : '🌐'}
                            </button>
                            <span className={`job-type ${job.type?.toLowerCase().replace(' ', '-')}`}>
                              {job.type}
                            </span>
                          </div>
                        </div>

                        <div className="job-meta-info">
                          <div className="job-meta-item">
                            <MapPin size={16} /> {job.location}
                          </div>
                          {job.isRemote && (
                            <div className="job-meta-item">
                              <Globe size={16} /> Remote
                            </div>
                          )}
                          <div className="job-meta-item">
                            <Briefcase size={16} /> {job.experienceLevel || 'Entry Level'}
                          </div>
                        </div>

                        {job.salaryRange && (job.salaryRange.min || job.salaryRange.max) ? (
                          <div className="salary">
                            ${job.salaryRange.min?.toLocaleString() || '?'}-{job.salaryRange.max?.toLocaleString() || '?'}
                            <span style={{ fontSize: '0.9rem', color: 'var(--muted)', marginLeft: '0.5rem' }}>
                              {job.salaryRange.currency}/yr
                            </span>
                          </div>
                        ) : (
                          <div className="salary" style={{ fontSize: '1.25rem', color: 'var(--muted)' }}>Salary Undisclosed</div>
                        )}

                        <p className="description">
                          {translatedContent[job._id]?.description || (
                            job.description && job.description.length > 5 ? (
                              job.description.substring(0, 160) + '...'
                            ) : (
                              `Explore this ${job.title} role at ${typeof job.company === 'string' ? job.company : job.company?.name || 'this company'}. Click for full details and application instructions.`
                            )
                          )}
                        </p>

                        <div className="job-footer">
                          {job.source === 'external' ? (
                            <div className="external-source">
                              <div className="source-icon">
                                <Zap size={14} color="white" />
                              </div>
                              <span className="source-text">Apply via {job.sourceName || 'Partner'}</span>
                            </div>
                          ) : (
                            <div className="experience-badge">
                              <Clock size={14} /> 
                              {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                          )}
                          
                          <button className="apply-btn-mini">
                            View Details <ChevronRight size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </motion.div>
  );
}

export default JobBoardHome;
