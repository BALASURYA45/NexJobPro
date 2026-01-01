const axios = require('axios');

const stripHtml = (html) => {
  if (!html) return '';
  // Remove script and style tags and their contents
  let text = html.replace(/<(style|script|title)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Remove all other tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Replace multiple spaces/newlines
  text = text.replace(/\s+/g, ' ').trim();
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"');
  return text;
};

const translateText = async (text) => {
  if (!text || text.length < 5) return text;
  try {
    // Dynamic import for ESM package
    const { default: translate } = await import('translate');
    
    // Comprehensive detection: if it contains common non-English words
    const nonEnglishMarkers = [
      ' und ', ' der ', ' die ', ' das ', ' für ', ' mit ', ' von ', // German
      ' le ', ' la ', ' les ', ' et ', ' dans ', ' pour ', // French
      ' el ', ' la ', ' los ', ' las ', ' y ', ' en ', ' con ', // Spanish
      ' m/w/d ', ' (gn) ', ' (m/w/d) ' // Job specific German
    ];
    const isLikelyNonEnglish = nonEnglishMarkers.some(marker => text.toLowerCase().includes(marker));
    const hasGermanChars = /[äöüß]/i.test(text);
    
    if (isLikelyNonEnglish || hasGermanChars) {
      // Translate only first 800 chars for a better preview but keep performance
      const textToTranslate = text.length > 800 ? text.substring(0, 800) : text;
      
      // Try Google first (default)
      translate.engine = 'google';
      let translated = await translate(textToTranslate, { to: 'en' });
      
      // If google fails or returns same text, try libre
      if (!translated || translated === textToTranslate) {
        translate.engine = 'libre';
        translated = await translate(textToTranslate, { to: 'en' });
      }

      return text.length > 800 ? `${translated}... (translated)` : translated;
    }
    return text;
  } catch (error) {
    console.error('Translation error:', error.message);
    return text;
  }
};

const generateFallbackDescription = (title, company) => {
  const templates = [
    `Exciting opportunity for a ${title} to join the innovative team at ${company}. We are looking for passionate individuals to help us build the next generation of solutions.`,
    `Join ${company} as a ${title}. This role offers the chance to work on cutting-edge technologies and impact millions of users worldwide.`,
    `${company} is seeking a talented ${title} to contribute to our mission-critical projects. Ideal for those who thrive in fast-paced environments.`,
    `Are you a skilled ${title}? ${company} is hiring! This position provides significant growth potential and a collaborative work culture.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

const detectExperienceLevel = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('senior') || text.includes('sr.') || text.includes('lead') || text.includes('principal') || text.includes('staff')) return 'Senior Level';
  if (text.includes('junior') || text.includes('jr.') || text.includes('entry') || text.includes('graduate') || text.includes('associate')) return 'Entry Level';
  if (text.includes('intern') || text.includes('student') || text.includes('apprenticeship')) return 'Internship';
  return 'Mid Level';
};

const fetchWithFallback = async (keyword = '', location = '', type = '', category = '') => {
  const allExternalJobs = [];

  try {
    // 1. Fetch from Arbeitnow (Global)
    const arbeitnowRes = await axios.get('https://www.arbeitnow.com/api/job-board-api', { timeout: 12000 }).catch(() => null);
    if (arbeitnowRes?.data?.data) {
      // Increase processing to 100 jobs
      const jobs = await Promise.all(arbeitnowRes.data.data.slice(0, 100).map(async (job) => {
        let cleanedDesc = stripHtml(job.description);
        cleanedDesc = await translateText(cleanedDesc);
        
        let translatedTitle = job.title;
        if (job.title.includes(' (m/w/d)') || job.title.includes(' (gn)')) {
          translatedTitle = await translateText(job.title.replace(' (m/w/d)', '').replace(' (gn)', ''));
        }

        return {
          _id: `ext_an_${job.slug}`,
          title: translatedTitle,
          description: cleanedDesc || generateFallbackDescription(translatedTitle, job.company_name),
          company: { name: job.company_name },
          location: job.location,
          type: job.remote ? 'Remote' : 'Full-time',
          category: 'Technology',
          salaryRange: { min: null, max: null, currency: 'USD' },
          experienceLevel: detectExperienceLevel(translatedTitle, cleanedDesc),
          requirements: job.tags || [],
          benefits: [],
          isRemote: job.remote,
          status: 'active',
          source: 'external',
          sourceName: 'Arbeitnow',
          sourceUrl: job.url,
          postedDate: new Date(job.created_at * 1000),
        };
      }));
      allExternalJobs.push(...jobs);
    }

    // 2. Fetch from Remotive (Remote Tech)
    const remotiveSearch = keyword || category || type || 'software';
    const remotiveRes = await axios.get(`https://remotive.com/api/remote-jobs?search=${remotiveSearch}&limit=100`, { timeout: 10000 }).catch(() => null);
    if (remotiveRes?.data?.jobs) {
      const jobs = await Promise.all(remotiveRes.data.jobs.slice(0, 100).map(async (job) => {
        const cleanedDesc = stripHtml(job.description);
        const translatedDesc = await translateText(cleanedDesc);
        const translatedTitle = await translateText(job.title);

        return {
          _id: `ext_rm_${job.id}`,
          title: translatedTitle,
          description: translatedDesc || generateFallbackDescription(translatedTitle, job.company_name),
          company: { name: job.company_name },
          location: job.candidate_required_location || 'Remote',
          type: job.job_type || 'Full-time',
          category: job.category || 'Technology',
          salaryRange: { min: null, max: null, currency: 'USD' },
          experienceLevel: detectExperienceLevel(translatedTitle, translatedDesc),
          requirements: [],
          benefits: [],
          isRemote: true,
          status: 'active',
          source: 'external',
          sourceName: 'Remotive',
          sourceUrl: job.url,
          postedDate: new Date(job.publication_date),
        };
      }));
      allExternalJobs.push(...jobs);
    }

    // Comprehensive Filtering Logic
    let filtered = allExternalJobs;
    
    // Filter by keyword
    if (keyword) {
      const lowKeyword = keyword.toLowerCase();
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(lowKeyword) || 
        j.company.name.toLowerCase().includes(lowKeyword) ||
        j.description.toLowerCase().includes(lowKeyword)
      );
    }

    // Filter by location
    if (location) {
      const lowLoc = location.toLowerCase();
      filtered = filtered.filter(j => j.location.toLowerCase().includes(lowLoc));
    }

    // Filter by type
    if (type) {
      const lowType = type.toLowerCase();
      filtered = filtered.filter(j => {
        const jType = j.type.toLowerCase();
        if (lowType === 'internship') return j.title.toLowerCase().includes('intern') || jType.includes('intern');
        if (lowType === 'full-time') return jType.includes('full') || jType.includes('remote'); // Most external are full or remote
        return jType.includes(lowType);
      });
    }

    // Filter by category
    if (category) {
      const lowCat = category.toLowerCase();
      filtered = filtered.filter(j => 
        j.category.toLowerCase().includes(lowCat) || 
        j.title.toLowerCase().includes(lowCat)
      );
    }

    // Mock Big Tech listings (Global giants)
    const bigTechMock = [
      {
        _id: 'ext_mock_google_1',
        title: 'Software Engineer, University Graduate',
        description: 'Join Google as a software engineer...',
        company: { name: 'Google' },
        location: 'Mountain View, CA',
        type: 'Full-time',
        category: 'Software Engineering',
        salaryRange: { min: 140000, max: 190000, currency: 'USD' },
        experienceLevel: 'Entry Level',
        requirements: ['C++', 'Java'],
        benefits: ['Health', '401k'],
        isRemote: false,
        status: 'active',
        source: 'external',
        sourceName: 'Google Careers',
        sourceUrl: 'https://www.google.com/about/careers/applications/jobs/results/',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_apple_1',
        title: 'iOS Frameworks Engineer',
        description: 'Design and implement new features for Apple platforms...',
        company: { name: 'Apple' },
        location: 'Cupertino, CA',
        type: 'Full-time',
        category: 'Software Engineering',
        salaryRange: { min: 160000, max: 220000, currency: 'USD' },
        experienceLevel: 'Senior Level',
        requirements: ['Swift', 'Objective-C'],
        benefits: ['Product Discounts', 'Health Insurance'],
        isRemote: false,
        status: 'active',
        source: 'external',
        sourceName: 'Apple Jobs',
        sourceUrl: 'https://www.apple.com/careers/us/apps.html',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_msft_1',
        title: 'Cloud Solutions Architect',
        description: 'Work with Azure cloud technologies to solve complex problems...',
        company: { name: 'Microsoft' },
        location: 'Redmond, WA',
        type: 'Full-time',
        category: 'Technology',
        salaryRange: { min: 150000, max: 210000, currency: 'USD' },
        experienceLevel: 'Senior Level',
        requirements: ['Azure', 'Cloud Architecture'],
        benefits: ['Remote Work Options', 'Pension Plan'],
        isRemote: true,
        status: 'active',
        source: 'external',
        sourceName: 'Microsoft Careers',
        sourceUrl: 'https://careers.microsoft.com/',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_netflix_1',
        title: 'UI Engineer - Content Engineering',
        description: 'Build high-performance UIs for Netflix streaming service...',
        company: { name: 'Netflix' },
        location: 'Los Gatos, CA',
        type: 'Full-time',
        category: 'Design',
        salaryRange: { min: 200000, max: 350000, currency: 'USD' },
        experienceLevel: 'Senior Level',
        requirements: ['React', 'JavaScript', 'CSS'],
        benefits: ['Personal Top of Market Pay', 'Work Life Balance'],
        isRemote: true,
        status: 'active',
        source: 'external',
        sourceName: 'Netflix Jobs',
        sourceUrl: 'https://jobs.netflix.com/',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_meta_1',
        title: 'Product Designer (New Grad)',
        description: 'Design the future of social connection at Meta...',
        company: { name: 'Meta' },
        location: 'Menlo Park, CA',
        type: 'Full-time',
        category: 'Design',
        salaryRange: { min: 120000, max: 160000, currency: 'USD' },
        experienceLevel: 'Entry Level',
        requirements: ['Figma', 'UI/UX Design'],
        benefits: ['Mental Health Support', 'On-site Meals'],
        isRemote: false,
        status: 'active',
        source: 'external',
        sourceName: 'Meta Careers',
        sourceUrl: 'https://www.metacareers.com/',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_tsla_1',
        title: 'Autopilot Software Engineer',
        description: 'Develop the algorithms that power Tesla Autopilot...',
        company: { name: 'Tesla' },
        location: 'Palo Alto, CA',
        type: 'Full-time',
        category: 'Software Engineering',
        salaryRange: { min: 155000, max: 240000, currency: 'USD' },
        experienceLevel: 'Mid Level',
        requirements: ['Python', 'C++', 'Computer Vision'],
        benefits: ['Stock Options', 'Innovation Hub'],
        isRemote: false,
        status: 'active',
        source: 'external',
        sourceName: 'Tesla Careers',
        sourceUrl: 'https://www.tesla.com/careers',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_uber_1',
        title: 'Backend Engineer - Marketplace',
        description: 'Optimize the real-time pricing and matching algorithms for Uber...',
        company: { name: 'Uber' },
        location: 'San Francisco, CA',
        type: 'Full-time',
        category: 'Software Engineering',
        salaryRange: { min: 145000, max: 210000, currency: 'USD' },
        experienceLevel: 'Mid Level',
        requirements: ['Go', 'Java', 'Distributed Systems'],
        benefits: ['Commuter Credits', 'Global Impact'],
        isRemote: false,
        status: 'active',
        source: 'external',
        sourceName: 'Uber Careers',
        sourceUrl: 'https://www.uber.com/careers',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_airbnb_1',
        title: 'Frontend Developer - Guest Experience',
        description: 'Create beautiful, accessible experiences for Airbnb guests...',
        company: { name: 'Airbnb' },
        location: 'Remote',
        type: 'Full-time',
        category: 'Web Development',
        salaryRange: { min: 140000, max: 200000, currency: 'USD' },
        experienceLevel: 'Mid Level',
        requirements: ['React', 'TypeScript'],
        benefits: ['Travel Credits', 'Flexible Work'],
        isRemote: true,
        status: 'active',
        source: 'external',
        sourceName: 'Airbnb Careers',
        sourceUrl: 'https://careers.airbnb.com/',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_spotify_1',
        title: 'Data Scientist - Personalization',
        description: 'Help shape the future of music discovery at Spotify...',
        company: { name: 'Spotify' },
        location: 'New York, NY',
        type: 'Full-time',
        category: 'Data Science',
        salaryRange: { min: 130000, max: 185000, currency: 'USD' },
        experienceLevel: 'Mid Level',
        requirements: ['Python', 'SQL', 'Machine Learning'],
        benefits: ['Work from Anywhere', 'Mental Health Days'],
        isRemote: true,
        status: 'active',
        source: 'external',
        sourceName: 'Spotify Jobs',
        sourceUrl: 'https://www.lifeatspotify.com/',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_nvidia_1',
        title: 'Deep Learning Software Engineer',
        description: 'Work on the cutting edge of AI and GPU computing...',
        company: { name: 'Nvidia' },
        location: 'Santa Clara, CA',
        type: 'Full-time',
        category: 'Software Engineering',
        salaryRange: { min: 170000, max: 260000, currency: 'USD' },
        experienceLevel: 'Senior Level',
        requirements: ['CUDA', 'PyTorch', 'C++'],
        benefits: ['Leading Edge R&D', 'Comprehensive Health'],
        isRemote: false,
        status: 'active',
        source: 'external',
        sourceName: 'Nvidia Careers',
        sourceUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_amzn_2',
        title: 'Software Development Manager',
        description: 'Lead a team of engineers to build scalable systems for Amazon Retail...',
        company: { name: 'Amazon' },
        location: 'Seattle, WA',
        type: 'Full-time',
        category: 'Software Engineering',
        salaryRange: { min: 180000, max: 280000, currency: 'USD' },
        experienceLevel: 'Senior Level',
        requirements: ['Engineering Management', 'System Design'],
        benefits: ['Stocks', 'Relocation'],
        isRemote: false,
        status: 'active',
        source: 'external',
        sourceName: 'Amazon Jobs',
        sourceUrl: 'https://www.amazon.jobs/',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_goog_2',
        title: 'Cloud Security Engineer',
        description: 'Ensure the security and reliability of Google Cloud Platform...',
        company: { name: 'Google' },
        location: 'London, UK',
        type: 'Full-time',
        category: 'Technology',
        salaryRange: { min: 110000, max: 160000, currency: 'GBP' },
        experienceLevel: 'Mid Level',
        requirements: ['Cloud Security', 'Kubernetes'],
        benefits: ['Bonus', 'Private Healthcare'],
        isRemote: true,
        status: 'active',
        source: 'external',
        sourceName: 'Google Careers',
        sourceUrl: 'https://www.google.com/about/careers/',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_sam_1',
        title: 'Senior Android Developer',
        description: 'Create the next generation of mobile experiences for Galaxy devices...',
        company: { name: 'Samsung' },
        location: 'Seoul, South Korea',
        type: 'Full-time',
        category: 'Software Engineering',
        salaryRange: { min: 90000000, max: 130000000, currency: 'KRW' },
        experienceLevel: 'Senior Level',
        requirements: ['Kotlin', 'Android SDK'],
        benefits: ['Housing Support', 'Performance Bonus'],
        isRemote: false,
        status: 'active',
        source: 'external',
        sourceName: 'Samsung Careers',
        sourceUrl: 'https://www.samsung.com/global/ir/governance/careers/',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_intc_1',
        title: 'Hardware Design Intern',
        description: 'Help design the next generation of processors at Intel...',
        company: { name: 'Intel' },
        location: 'Austin, TX',
        type: 'Internship',
        category: 'Technology',
        salaryRange: { min: 35, max: 50, currency: 'USD/hr' },
        experienceLevel: 'Internship',
        requirements: ['VHDL', 'Verilog', 'Computer Architecture'],
        benefits: ['Mentorship', 'Intern Events'],
        isRemote: false,
        status: 'active',
        source: 'external',
        sourceName: 'Intel Jobs',
        sourceUrl: 'https://www.intel.com/content/www/us/en/jobs/jobs-at-intel.html',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_crm_1',
        title: 'Salesforce Developer',
        description: 'Build custom solutions on the Salesforce platform for enterprise clients...',
        company: { name: 'Salesforce' },
        location: 'San Francisco, CA',
        type: 'Full-time',
        category: 'Software Engineering',
        salaryRange: { min: 135000, max: 190000, currency: 'USD' },
        experienceLevel: 'Mid Level',
        requirements: ['Apex', 'Lightning Components'],
        benefits: ['Wellness Reimbursement', 'VTO'],
        isRemote: true,
        status: 'active',
        source: 'external',
        sourceName: 'Salesforce Careers',
        sourceUrl: 'https://www.salesforce.com/company/careers/',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_adbe_1',
        title: 'Product Manager - Creative Cloud',
        description: 'Define the roadmap for the world\'s leading creative tools...',
        company: { name: 'Adobe' },
        location: 'San Jose, CA',
        type: 'Full-time',
        category: 'Technology',
        salaryRange: { min: 150000, max: 210000, currency: 'USD' },
        experienceLevel: 'Mid Level',
        requirements: ['Product Strategy', 'UI/UX Knowledge'],
        benefits: ['Sabbatical', 'Education Subsidy'],
        isRemote: false,
        status: 'active',
        source: 'external',
        sourceName: 'Adobe Careers',
        sourceUrl: 'https://www.adobe.com/careers.html',
        postedDate: new Date(),
      },
      {
        _id: 'ext_mock_ora_1',
        title: 'Database Engineer',
        description: 'Maintain and optimize high-performance database clusters...',
        company: { name: 'Oracle' },
        location: 'Remote',
        type: 'Full-time',
        category: 'Technology',
        salaryRange: { min: 125000, max: 180000, currency: 'USD' },
        experienceLevel: 'Mid Level',
        requirements: ['SQL', 'Database Administration'],
        benefits: ['Flexible Working', 'Global Opportunities'],
        isRemote: true,
        status: 'active',
        source: 'external',
        sourceName: 'Oracle Careers',
        sourceUrl: 'https://www.oracle.com/corporate/careers/',
        postedDate: new Date(),
      }
    ];

    const matchedMock = bigTechMock.filter(m => {
      if (keyword && !m.title.toLowerCase().includes(keyword.toLowerCase()) && !m.company.name.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (location && !m.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (type && type.toLowerCase() === 'internship' && m.type !== 'Internship') return false;
      if (type && type.toLowerCase() === 'full-time' && m.type !== 'Full-time') return false;
      if (category && !m.category.toLowerCase().includes(category.toLowerCase())) return false;
      return true;
    });

    // Add unique results
    const finalResults = [...filtered];
    matchedMock.forEach(mock => {
      if (!finalResults.find(r => r._id === mock._id)) {
        finalResults.push(mock);
      }
    });

    return finalResults;
  } catch (error) {
    console.error('External job fetch error:', error.message);
    return [];
  }
};

module.exports = {
  fetchWithFallback,
  translateText
};
