# Job Board Application - Setup Instructions

## Quick Start

### 1. **Start Backend**
```bash
cd backend
npm run dev
```
Expected output:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

### 2. **Start Frontend**
```bash
cd frontend
npm run dev
```
Open: `http://localhost:5173`

---

## Create Test Accounts

### Employer Account (to post jobs)
1. Go to **Sign Up** at http://localhost:5173/signup
2. Fill form:
   - **First Name**: John
   - **Last Name**: Recruiter
   - **Email**: employer@example.com
   - **Role**: Employer
   - **Password**: test123
3. Click Sign Up

### Job Seeker Account (to apply for jobs)
1. Go to **Sign Up**
2. Fill form:
   - **First Name**: Jane
   - **Last Name**: Developer
   - **Email**: seeker@example.com
   - **Role**: Job Seeker
   - **Password**: test123
3. Click Sign Up

---

## Seed Demo Jobs

Once you have an **Employer account**, seed 8 sample jobs:

```bash
cd backend
node src/scripts/seedJobs.js
```

Output:
```
MongoDB Connected
8 jobs seeded successfully!
```

---

## Features Available

### **For Job Seekers**
✅ Browse all job listings  
✅ **Filter by**: Job Type, Location, Salary Range, Sort  
✅ View job details  
✅ Apply with cover letter  
✅ View my applications and status (Pending/Accepted/Rejected)  
✅ Withdraw applications  

### **For Employers**
✅ Post new job listings  
✅ View all applications received  
✅ Accept/Reject applications  
✅ Email applicants directly  
✅ See job metrics (applicant count)  

---

## Test Workflow

### **As Job Seeker:**
1. Login with seeker account
2. Home page shows **all jobs** with filters
3. Use filters: Job Type (Internship), Location (Boston, MA)
4. Click on job → View Details
5. Click "Apply Now" → Enter cover letter → Submit
6. Click "My Applications" → See your applications
7. Applications show status and can be withdrawn

### **As Employer:**
1. Login with employer account
2. Click "Post Job" → Fill form → Submit
3. New job appears in listings
4. Click "Applications" → See who applied
5. Accept/Reject applicants
6. Email button opens email client with applicant email

---

## Job Types Available

- **Full-time** 🔵
- **Part-time** 🔴
- **Contract** 🟡
- **Freelance** 🟢
- **Internship** 🟣

---

## Sample Jobs Included

1. **Senior React Developer** - San Francisco, CA ($120k-$160k)
2. **Junior Frontend Internship** - New York, NY ($15-$18/hr)
3. **Full Stack Developer** - Remote ($100k-$140k)
4. **Data Science Internship** - Boston, MA ($20-$25/hr)
5. **UI/UX Designer** - Los Angeles, CA ($80k-$120k)
6. **DevOps Engineer** - Remote ($130k-$170k)
7. **Marketing Intern** - Chicago, IL ($12-$15/hr)
8. **Backend Engineer** - Remote ($110k-$150k)

---

## Database Schema

### Users
- name, email, password, role (seeker/employer/admin)
- profile info, resume URL

### Jobs
- title, description, location, type, category
- salaryRange (min/max)
- experienceLevel, requirements, benefits
- isRemote, status, applicationCount

### Applications
- userId, jobId, coverLetter
- status (pending/accepted/rejected)
- createdAt timestamp

---

## Filtering Options

| Filter | Values |
|--------|--------|
| **Job Type** | Full-time, Part-time, Contract, Freelance, Internship |
| **Location** | Text search (e.g., "San Francisco") |
| **Salary** | Min & Max salary range |
| **Sort** | Newest First, Highest Salary |

---

## API Endpoints

### Jobs
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (employer only)
- `PUT /api/jobs/:id` - Update job (employer only)
- `DELETE /api/jobs/:id` - Delete job (employer only)

### Applications
- `POST /api/applications/:jobId` - Apply for job
- `GET /api/applications/user/my-applications` - Get my applications
- `GET /api/applications/employer/my-applications` - Get received applications
- `PUT /api/applications/:id` - Update application status
- `DELETE /api/applications/:id` - Delete application

---

## Troubleshooting

### No jobs showing?
```bash
# Make sure you're logged in as employer
# Then run seed script
cd backend && node src/scripts/seedJobs.js
```

### Backend connection error?
```bash
# Check MongoDB is running
# Update MONGO_URI in backend/.env
MONGO_URI=mongodb://localhost:27017/jobboard
```

### Login issues?
- Clear browser cookies/localStorage
- Check that backend is running on port 5000
- Verify email and password are correct

---

## Next Features to Add

- Real-time notifications
- Profile completion percentage
- Resume upload
- Job bookmarking
- Company profiles
- Reviews and ratings
- Advanced search (skills, experience)
- Email notifications
