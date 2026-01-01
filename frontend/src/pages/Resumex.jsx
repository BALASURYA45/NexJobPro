import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  Zap,
  BarChart,
  Sparkles,
  ArrowRight,
  Target,
  Lightbulb,
  Cpu,
  Layers,
  Award,
  X,
  FileCode
} from 'lucide-react';
import aiService from '../services/aiService';

function Resumex() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dropRef = useRef(null);

  const loadingSteps = [
    { label: 'Scanning PDF structure...', icon: <Layers size={18} /> },
    { label: 'Extracting key technical skills...', icon: <Cpu size={18} /> },
    { label: 'Analysing section relevance...', icon: <Target size={18} /> },
    { label: 'Generating AI recommendations...', icon: <Sparkles size={18} /> }
  ];

  const handleMouseMove = (e) => {
    if (dropRef && dropRef.current) {
      const rect = dropRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dropRef.current.style.setProperty('--mouse-x', `${x}px`);
      dropRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  useEffect(() => {
    let interval;
    if (isLoading && loadingStep < loadingSteps.length - 1) {
      interval = setInterval(() => {
        setLoadingStep(prev => prev + 1);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading, loadingStep]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setFile(null);
        setError('Please upload a valid PDF file.');
      }
    }
  };

  const removeFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    setError('');
    const input = document.getElementById('resume-upload');
    if (input) input.value = '';
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await aiService.analyzeResume(formData);
      // Artificial delay to show the cool loading steps
      setTimeout(() => {
        setResult(response.data);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to analyze resume. Please ensure it is a valid PDF.';
      setError(msg);
      setIsLoading(false);
      console.error('Analysis error:', err);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setFile(null);
    setError('');
    setLoadingStep(0);
  };

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
            Resume<span>X</span>
          </h1>
          <button onClick={() => navigate('/')} className="nav-btn">
            <ChevronLeft size={18} /> Back to Jobs
          </button>
        </div>
      </header>

      <main className="main-content-wide">
        <div className="dashboard-grid">
          {/* Sidebar Info */}
          <div className="dashboard-sidebar">
            <div className="sidebar-card">
              <div className="profile-avatar-large">
                <Sparkles size={48} className="text-primary pulse-animation" />
              </div>
              <h3>AI Resume Engine</h3>
              <p className="sidebar-info-text">
                Our advanced AI scans your resume for keywords, structure, and readability to give you an edge in your job search.
              </p>
              
              <div className="info-badges">
                <div className="info-badge-item">
                  <CheckCircle size={16} /> ATS-Friendly Parsing
                </div>
                <div className="info-badge-item">
                  <CheckCircle size={16} /> Semantic Skill Extraction
                </div>
                <div className="info-badge-item">
                  <CheckCircle size={16} /> Impact Analysis
                </div>
                <div className="info-badge-item">
                  <CheckCircle size={16} /> Instant Optimization
                </div>
              </div>
            </div>
          </div>

          {/* Main Analysis Area */}
          <div className="dashboard-form-area">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div 
                  key="upload"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="form-glass-container"
                >
                  <div className="form-header-fancy">
                    <h2>Professional Analyzer</h2>
                    <p>Elevate your career with deep AI insights into your professional profile.</p>
                  </div>

                  <div className="upload-zone-premium">
                    <div 
                      ref={dropRef}
                      onMouseMove={handleMouseMove}
                      className={`drop-area ${file ? 'has-file' : ''}`}
                    >
                      <input 
                        type="file" 
                        id="resume-upload" 
                        accept=".pdf" 
                        onChange={handleFileChange}
                        className="hidden-input"
                      />
                      
                      {file && (
                        <button className="remove-file-btn" onClick={removeFile} title="Remove File">
                          <X size={18} />
                        </button>
                      )}

                      <label htmlFor="resume-upload" className="upload-label">
                        <div className="upload-icon-wrapper">
                          {file ? (
                            <FileCode size={40} className="text-success" />
                          ) : (
                            <Upload size={40} className="text-secondary" />
                          )}
                        </div>
                        
                        <AnimatePresence>
                          {file ? (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="file-selected-info"
                            >
                              <h3>{file.name}</h3>
                              <div className="file-info-badge">
                                <CheckCircle size={14} /> {(file.size / 1024).toFixed(1)} KB • Ready
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="upload-prompt"
                            >
                              <p>Click icon to upload or drag PDF here</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </label>
                    </div>

                    {isLoading && (
                      <div className="loading-steps-container">
                        {loadingSteps.map((step, idx) => (
                          <div 
                            key={idx} 
                            className={`loading-step ${idx === loadingStep ? 'active' : idx < loadingStep ? 'completed' : ''}`}
                          >
                            <div className="step-dot" />
                            {step.icon}
                            <span>{step.label}</span>
                            {idx < loadingStep && <CheckCircle size={14} className="text-success" />}
                          </div>
                        ))}
                      </div>
                    )}

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="error-message" 
                        style={{ marginTop: '1.5rem' }}
                      >
                        <AlertCircle size={18} /> {error}
                      </motion.div>
                    )}

                    <button 
                      onClick={handleAnalyze} 
                      disabled={!file || isLoading}
                      className="submit-btn-premium"
                      style={{ marginTop: '2rem' }}
                    >
                      {isLoading ? (
                        <>
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            style={{ display: 'flex' }}
                          >
                            <Search size={20} />
                          </motion.div>
                          Analyzing Deeply...
                        </>
                      ) : (
                        <>
                          <Zap size={20} /> Launch AI Analysis
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="form-glass-container"
                >
                  <div className="results-header">
                    <div className="flex items-center gap-3">
                      <Award size={24} className="text-primary" />
                      <h2>Analysis Report</h2>
                    </div>
                    <div className={`status-pill ${result.status.toLowerCase()}`}>
                      {result.status} Match
                    </div>
                  </div>

                  <div className="score-hero">
                    <div className="score-circle-container">
                      <svg className="score-svg" viewBox="0 0 100 100">
                        <circle className="score-bg" cx="50" cy="50" r="45" />
                        <motion.circle 
                          className="score-fill" 
                          cx="50" cy="50" r="45" 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: result.score / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          style={{ 
                            stroke: result.score >= 80 ? '#10b981' : result.score >= 60 ? '#f59e0b' : '#ef4444' 
                          }}
                        />
                      </svg>
                      <div className="score-value">
                        <span className="number">{result.score}</span>
                        <span className="total">Score</span>
                      </div>
                    </div>
                    
                    <div className="score-summary">
                      <h3>Expert Evaluation</h3>
                      <p>{result.description}</p>
                    </div>
                  </div>

                  <div className="analysis-details-grid">
                    <div className="analysis-card">
                      <BarChart size={20} className="text-primary" />
                      <div>
                        <h4>Structural Integrity</h4>
                        <div className="tags-flex">
                          {result.metadata.foundSections.map(s => (
                            <span key={s} className="tag-found">{s}</span>
                          ))}
                          {result.metadata.foundSections.length === 0 && (
                            <span className="tag-none">Weak structure detected</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="analysis-card">
                      <FileText size={20} className="text-primary" />
                      <div>
                        <h4>Content Density</h4>
                        <p className="stat-text">
                          Detected <strong>{result.metadata.words}</strong> professional keywords across <strong>{result.metadata.pages}</strong> page(s).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="analysis-section-box">
                    <div className="section-header-compact">
                      <Cpu size={20} className="text-primary" />
                      <h3>Identified Skill Matrix</h3>
                    </div>
                    <div className="skills-grid-modern">
                      {result.metadata.skills && result.metadata.skills.length > 0 ? (
                        result.metadata.skills.map(skill => (
                          <div key={skill} className="skill-chip-premium">
                            <CheckCircle size={14} /> {skill}
                          </div>
                        ))
                      ) : (
                        <p className="tag-none">No specific technical skills identified.</p>
                      )}
                    </div>
                  </div>

                  {/* Suggestions Section */}
                  <div className="analysis-section-box" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                    <div className="section-header-compact">
                      <Lightbulb size={20} style={{ color: '#f59e0b' }} />
                      <h3>Optimization Roadmap</h3>
                    </div>
                    <div className="suggestions-list">
                      {result.metadata.suggestions && result.metadata.suggestions.length > 0 ? (
                        result.metadata.suggestions.map((sug, idx) => (
                          <div key={idx} className="suggestion-item">
                            <div className="suggestion-content">
                              <h4>Enhancement #{idx + 1}</h4>
                              <p>{sug}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="suggestion-item" style={{ borderLeftColor: '#10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
                          <div className="suggestion-content">
                            <h4>Peak Performance</h4>
                            <p>Your resume is highly optimized. No major suggestions at this time.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="action-footer">
                    <button onClick={resetAnalysis} className="secondary-btn">
                      Analyze Another
                    </button>
                    <button onClick={() => navigate('/')} className="primary-btn">
                      Find Matching Jobs <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </motion.div>
  );
}

export default Resumex;
