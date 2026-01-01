// Try to require the CJS version directly for better compatibility in CommonJS
let pdfParse;
try {
  // Try the primary CJS path for v2.4.5+
  pdfParse = require('pdf-parse/dist/pdf-parse/cjs/index.cjs');
} catch (e) {
  try {
    // Try the node-specific CJS path
    pdfParse = require('pdf-parse/dist/node/cjs/index.cjs');
  } catch (e2) {
    try {
      pdfParse = require('pdf-parse');
    } catch (e3) {
      console.error('All require attempts for pdf-parse failed');
    }
  }
}

// Helper to get the actual class
const getPdfClass = (obj) => {
  if (obj && typeof obj.PDFParse === 'function') return obj.PDFParse;
  if (obj && obj.default && typeof obj.default.PDFParse === 'function') return obj.default.PDFParse;
  return null;
};

// @desc    Analyze resume
// @route   POST /api/ai/analyze-resume
// @access  Private
const analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const dataBuffer = req.file.buffer;
    console.log(`Analyzing file: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // Quick validation: Check if it's actually a PDF
    if (dataBuffer.toString('utf8', 0, 4) !== '%PDF') {
      return res.status(400).json({ message: 'Invalid file format. Please upload a valid PDF.' });
    }

    let PdfClass = getPdfClass(pdfParse);
    
    // If static require failed or returned nothing usable, try dynamic import
    if (!PdfClass) {
      try {
        const mod = await import('pdf-parse');
        PdfClass = getPdfClass(mod);
      } catch (err) {
        console.error('Dynamic import fallback also failed:', err);
      }
    }

    if (!PdfClass) {
      return res.status(500).json({ 
        message: 'PDF analysis engine could not be initialized.',
        details: 'The PDFParse class could not be found in the pdf-parse library.' 
      });
    }

    let extractedText = '';
    let pageCount = 1;
    
    try {
      // Instantiate the parser with the data buffer
      const parser = new PdfClass({ data: dataBuffer });
      const result = await parser.getText();
      extractedText = result.text || '';
      pageCount = result.pages.length || 1;
    } catch (parseError) {
      console.error('Parsing error detail:', parseError);
      return res.status(400).json({ 
        message: 'The PDF parser encountered an error while reading the file content.',
        details: parseError.message 
      });
    }

    if (!extractedText || typeof extractedText !== 'string') {
      return res.status(400).json({ message: 'No readable text content found in the PDF.' });
    }

    const text = extractedText.toLowerCase();
    
    // Heuristic analysis
    const categories = {
      Experience: ['experience', 'work history', 'internship', 'employment', 'professional background', 'worked'],
      Education: ['education', 'university', 'college', 'degree', 'certification', 'academic', 'bachelor', 'master'],
      Skills: ['skills', 'technologies', 'proficiencies', 'expertise', 'tools', 'languages', 'technical'],
      Projects: ['projects', 'personal work', 'portfolio', 'github', 'side project'],
      Contact: ['email', 'phone', 'linkedin', 'github', 'address', 'contact', 'mobile']
    };

    let score = 0;
    const foundSections = [];
    
    for (const [name, keywords] of Object.entries(categories)) {
      if (keywords.some(k => text.includes(k))) {
        score += 15;
        foundSections.push(name);
      }
    }

    // Technology check
    const techStack = ['react', 'node', 'javascript', 'python', 'java', 'sql', 'aws', 'docker', 'typescript', 'mongodb', 'html', 'css', 'git', 'rest api'];
    let techCount = 0;
    techStack.forEach(t => {
      if (text.includes(t)) techCount++;
    });
    
    score += Math.min(techCount * 3, 25);
    score = Math.min(score, 100);

    let status = 'Weak';
    let feedback = '';

    if (score >= 80) {
      status = 'Strong';
      feedback = 'Excellent resume! It is well-structured and contains industry-standard keywords.';
    } else if (score >= 60) {
      status = 'Moderate';
      feedback = 'Good resume, but could be improved by adding more specific technical skills or project details.';
    } else {
      status = 'Weak';
      feedback = 'Your resume is missing critical sections. Consider using a professional template and adding more technical details.';
    }

    res.json({
      score,
      status,
      description: feedback,
      metadata: {
        pages: pageCount,
        words: text.split(/\s+/).filter(w => w.length > 0).length,
        foundSections
      }
    });

  } catch (error) {
    console.error('CRITICAL Resume Analysis Error:', error);
    res.status(500).json({ 
      message: 'A server error occurred during analysis.',
      details: error.message 
    });
  }
};

module.exports = { analyzeResume };
