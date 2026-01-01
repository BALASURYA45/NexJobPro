const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobboard');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedJobs = async () => {
  try {
    await connectDB();

    const user = await User.findOne({ email: 'employer@example.com' });
    if (!user) {
      console.log('Employer not found. Create an employer account first.');
      process.exit(1);
    }

    const jobs = [
      {
        title: 'Senior React Developer',
        description: 'We are looking for an experienced React developer to join our team. You will work on cutting-edge web applications.',
        company: user._id,
        location: 'San Francisco, CA',
        type: 'Full-time',
        category: 'Web Development',
        salaryRange: { min: 120000, max: 160000, currency: 'USD' },
        experienceLevel: 'Senior Level',
        requirements: ['React', 'Node.js', 'MongoDB', '5+ years experience'],
        benefits: ['Health Insurance', 'Remote Work', '401k', 'Paid Time Off'],
        isRemote: true,
      },
      {
        title: 'Junior Frontend Developer Internship',
        description: 'Summer internship for aspiring frontend developers. Learn modern web development practices.',
        company: user._id,
        location: 'New York, NY',
        type: 'Internship',
        category: 'Web Development',
        salaryRange: { min: 15, max: 18, currency: 'USD/hour' },
        experienceLevel: 'Entry Level',
        requirements: ['HTML/CSS', 'JavaScript basics', 'Willingness to learn'],
        benefits: ['Mentorship', 'Portfolio building', 'Networking'],
        isRemote: false,
      },
      {
        title: 'Full Stack Developer',
        description: 'Build scalable applications using MERN stack. Join our innovative fintech startup.',
        company: user._id,
        location: 'Remote',
        type: 'Full-time',
        category: 'Full Stack Development',
        salaryRange: { min: 100000, max: 140000, currency: 'USD' },
        experienceLevel: 'Mid Level',
        requirements: ['MongoDB', 'Express.js', 'React', 'Node.js', '3+ years experience'],
        benefits: ['Flexible Hours', 'Stock Options', 'Remote First', 'Learning Budget'],
        isRemote: true,
      },
      {
        title: 'Data Science Internship',
        description: 'Help us analyze large datasets and build machine learning models for real business problems.',
        company: user._id,
        location: 'Boston, MA',
        type: 'Internship',
        category: 'Data Science',
        salaryRange: { min: 20, max: 25, currency: 'USD/hour' },
        experienceLevel: 'Entry Level',
        requirements: ['Python', 'SQL', 'Statistics basics', 'Pandas'],
        benefits: ['Remote Option', 'Real Projects', 'Career Guidance'],
        isRemote: false,
      },
      {
        title: 'UI/UX Designer',
        description: 'Design beautiful and intuitive user interfaces for our mobile and web platforms.',
        company: user._id,
        location: 'Los Angeles, CA',
        type: 'Full-time',
        category: 'Design',
        salaryRange: { min: 80000, max: 120000, currency: 'USD' },
        experienceLevel: 'Mid Level',
        requirements: ['Figma', 'UI/UX Design', 'User Research', 'Prototyping'],
        benefits: ['Creative Freedom', 'Flexible Schedule', 'Health Insurance'],
        isRemote: false,
      },
      {
        title: 'DevOps Engineer',
        description: 'Manage and optimize our cloud infrastructure. Work with Docker, Kubernetes, and AWS.',
        company: user._id,
        location: 'Remote',
        type: 'Full-time',
        category: 'DevOps',
        salaryRange: { min: 130000, max: 170000, currency: 'USD' },
        experienceLevel: 'Senior Level',
        requirements: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
        benefits: ['High Salary', 'Remote Work', '401k', 'Conferences'],
        isRemote: true,
      },
      {
        title: 'Marketing Intern',
        description: 'Help grow our brand through social media, content creation, and marketing campaigns.',
        company: user._id,
        location: 'Chicago, IL',
        type: 'Internship',
        category: 'Marketing',
        salaryRange: { min: 12, max: 15, currency: 'USD/hour' },
        experienceLevel: 'Entry Level',
        requirements: ['Social Media Skills', 'Writing Ability', 'Creativity', 'Basic Analytics'],
        benefits: ['Resume Building', 'Real Campaign Experience', 'Flexible Hours'],
        isRemote: true,
      },
      {
        title: 'Backend Engineer',
        description: 'Build robust APIs and backend services. Scale our infrastructure to millions of users.',
        company: user._id,
        location: 'Remote',
        type: 'Full-time',
        category: 'Backend Development',
        salaryRange: { min: 110000, max: 150000, currency: 'USD' },
        experienceLevel: 'Mid Level',
        requirements: ['Node.js', 'MongoDB', 'REST APIs', 'System Design'],
        benefits: ['Remote First', 'Learning Budget', 'Team Outings', 'Equity'],
        isRemote: true,
      },
    ];

    await Job.deleteMany({});
    const createdJobs = await Job.insertMany(jobs);
    console.log(`${createdJobs.length} jobs seeded successfully!`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedJobs();
