# 🧪 Testing Real Jobs Integration

## Quick Start

### 1. **Start Your Application**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. **Open Browser**
- Go to: http://localhost:5173

### 3. **Login as Job Seeker**
```
Email: seeker@example.com
Password: test123
```

If account doesn't exist, create one via Sign Up.

---

## Test Scenario 1: View All Jobs (Mixed)

### Steps:
1. Click "Sign Up" → Create job seeker account
2. Login with created account
3. **Home page loads automatically with jobs**

### Expected Results:
```
✅ See ~60+ job listings
   - 8 from "Posted by Users" (your seed data)
   - 50+ from "From Companies" (real jobs)

✅ Jobs show badges:
   - Job type: Full-time, Part-time, Internship, etc.
   - 🌐 External Job badge on real jobs
   - 📍 Location + 🌍 Remote badge

✅ Filters visible:
   - Job Type dropdown
   - Location search
   - Salary range
   - Job Source dropdown (ALL/Internal/External)
   - Sort options
```

---

## Test Scenario 2: Filter by Job Source

### Step 1: Show Only External Jobs
1. Find "Job Source" filter
2. Select "From Companies 🌐"
3. Watch results update instantly

### Expected Results:
```
✅ See 40-50 real jobs from companies
✅ All have 🌐 External Job badge
✅ All have sourceUrl (apply link)
✅ No internal jobs visible
✅ Shows real company names
```

### Step 2: Show Only Internal Jobs
1. Job Source filter → "Posted by Users"

### Expected Results:
```
✅ See exactly 8 jobs (your seed data)
✅ No 🌐 badge
✅ Shows "TechStartup Inc" as company
✅ Shows application count (0 or more)
```

### Step 3: Show All Jobs
1. Job Source filter → "All Jobs"

### Expected Results:
```
✅ Mix of ~60 jobs
✅ Both internal and external visible
✅ Sorted by date (newest first)
```

---

## Test Scenario 3: Search External Jobs

### Test Search 1: React Developer
1. In search box, type: "React Developer"
2. Click "Search" button
3. From filters: Select "From Companies 🌐"

### Expected Results:
```
✅ See 20-30 real React Developer positions
✅ Companies like Google, Meta, Amazon may appear
✅ Various locations worldwide
✅ Mixed experience levels
```

### Test Search 2: Internship
1. Clear search (click "Clear Filters")
2. Job Type filter → "Internship"
3. Location → "Boston"
4. Source → "All Jobs"

### Expected Results:
```
✅ See internship positions in Boston
✅ Mix of internal + external
✅ Lower salary ranges than full-time
✅ Entry level jobs
```

### Test Search 3: Remote Jobs
1. Clear filters
2. Location → "Remote"
3. Source → "From Companies"

### Expected Results:
```
✅ See 15-25 remote positions
✅ 🌍 Remote badge on all
✅ Companies offering remote work
✅ No location dependency
```

---

## Test Scenario 4: View Job Details

### For Internal Job:
1. From job list, click "Senior React Developer" (posted by users)
2. Scroll down

### Expected Results:
```
✅ See full job details:
   - Title, company, location, salary
   - Description, requirements, benefits
   - Experience level

✅ At bottom, see "Apply Now" button
✅ Click → Reveals cover letter form
✅ Required to write cover letter
```

### For External Job:
1. From job list, click a 🌐 job (real company job)
2. Scroll down

### Expected Results:
```
✅ See job details:
   - Title, company, location
   - Description, requirements
   
✅ See different button:
   "🌐 Apply on Company Website →"
   
✅ Click button → Opens company website
   in NEW TAB

✅ No cover letter form shown
```

---

## Test Scenario 5: Apply to Jobs

### Apply to Internal Job:
1. Find "Junior Frontend Internship" 
2. Click the card
3. Scroll to "Apply Now"
4. Click → Shows cover letter form
5. Type cover letter:
   ```
   I'm excited about this opportunity because...
   [Write anything]
   ```
6. Click "Submit Application"

### Expected Results:
```
✅ "Application submitted successfully!"
✅ Redirected to home page
✅ Can view in "My Applications"
```

### Apply to External Job:
1. Find a 🌐 job (e.g., "React Engineer" from Google)
2. Click the card
3. Scroll to bottom
4. See blue button: "Apply on Company Website →"
5. Click button

### Expected Results:
```
✅ NEW TAB opens with company website
✅ Shows their actual job page
✅ Can apply directly there
✅ Back on your site, nothing tracked
```

---

## Test Scenario 6: View My Applications

### For Job Seeker:
1. Apply to 2-3 internal jobs
2. Top navigation → "My Applications"
3. Click button

### Expected Results:
```
✅ See list of your applications
✅ Each card shows:
   - Job title
   - Company/Category
   - Your cover letter
   - Application status (Pending)
   - Date applied
   - "View Job" and "Withdraw" buttons

✅ Only shows internal jobs applied
✅ External jobs not tracked (applied on company site)

✅ Click "Withdraw" → Application removed
```

---

## Test Scenario 7: Filter with Multiple Criteria

### Complex Filter:
1. Job Type: "Full-time"
2. Location: "San Francisco"
3. Source: "All Jobs"
4. Sort: "Highest Salary"
5. Search: "Developer"

### Expected Results:
```
✅ Results filtered by ALL criteria
✅ Shows developers in SF
✅ Only full-time positions
✅ Mix of internal/external
✅ Sorted by salary (highest first)
✅ Shows ~10-20 results

✅ Both internal and external filtered
```

---

## API Testing (Advanced)

### Test Backend Directly

```bash
# Get all jobs with external
curl "http://localhost:5000/api/jobs"

# Search for React jobs
curl "http://localhost:5000/api/jobs?keyword=React"

# Get external jobs only
curl "http://localhost:5000/api/jobs?source=external"

# Get internal jobs only
curl "http://localhost:5000/api/jobs?source=internal"

# San Francisco jobs
curl "http://localhost:5000/api/jobs?location=San%20Francisco"
```

### Expected API Response:
```json
{
  "jobs": [
    {
      "_id": "ext_xyz123",
      "title": "React Developer",
      "company": { "name": "Google" },
      "location": "San Francisco, CA",
      "source": "external",
      "sourceUrl": "https://careers.google.com/...",
      "description": "Build web apps...",
      "isRemote": false
    },
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Senior React Developer",
      "company": "507f1f77bcf86cd799439010",
      "location": "San Francisco, CA",
      "source": "internal",
      "sourceUrl": null,
      "applicationCount": 2
    }
  ]
}
```

---

## Troubleshooting Tests

### Issue: No External Jobs Showing

**Check:**
1. Backend running? (`npm run dev` in terminal)
2. No console errors? (F12 → Console tab)
3. Network tab shows API request?

**Fix:**
```bash
# Restart backend
cd backend
npm run dev
```

### Issue: "Apply on Company Website" button doesn't work

**Check:**
1. Is it an external job? (Has 🌐 badge)
2. Does sourceUrl exist?
3. Company website still active?

**Debug:**
Open browser console (F12) and check:
```javascript
// Check job object
console.log(job);
console.log(job.sourceUrl);
```

### Issue: Search returns nothing

**Try:**
1. Clear filters first
2. Use common keywords: "Developer", "Engineer", "Manager"
3. Use English keywords only
4. Wait 5 seconds for API response

### Issue: External API is slow

**Expected behavior:**
- First search: 5-10 seconds (API call)
- Subsequent searches: 1-2 seconds (cached)

**Jooble API limitations:**
- Rate limit: 10 requests per minute
- Cache time: 1 hour
- If rate limited, wait 1 minute

---

## Test Checklist

### ✅ Job Display
- [ ] External jobs show with 🌐 badge
- [ ] Internal jobs show without badge
- [ ] Job cards show: Title, Company, Location, Salary, Type
- [ ] Remote badge shows for remote jobs

### ✅ Filtering
- [ ] Job Source filter works (All/Internal/External)
- [ ] Job Type filter works
- [ ] Location filter works
- [ ] Salary range filters work
- [ ] Clear Filters button resets everything

### ✅ Job Details
- [ ] Can view full job details
- [ ] Requirements and benefits display
- [ ] External jobs show company name correctly

### ✅ Applications
- [ ] Internal jobs show cover letter form
- [ ] External jobs show company website button
- [ ] Applying to internal job works
- [ ] External apply opens new tab

### ✅ My Applications
- [ ] Shows all internal applications
- [ ] Shows application status
- [ ] Can withdraw applications
- [ ] Doesn't show external applications

---

## Performance Metrics

### Expected Load Times:
```
Home page load:        2-3 seconds
First job search:      5-10 seconds (API call)
Second search:         1-2 seconds (cached)
Job details page:      1 second
Apply form:            Instant
```

### Expected Job Count:
```
Internal jobs:    8 (from seed)
External jobs:    40-50 (from Jooble)
Total shown:      48-58 jobs
```

---

## Success Criteria

✅ **All checks pass** if you can:

1. See 50+ real jobs on home page
2. Filter by job source (Internal/External/All)
3. Search for specific jobs
4. View external job details with company info
5. Click "Apply on Company Website" and visit company site
6. Apply to internal jobs with cover letter
7. View applications in "My Applications"
8. No errors in browser console

---

## Report Issues

If something doesn't work:

1. **Note the issue**: What happened? What did you expect?
2. **Check console**: F12 → Console for errors
3. **Try again**: Sometimes API is slow
4. **Check backend**: Is `npm run dev` running?
5. **Restart**: Kill and restart both backend and frontend

---

## Next Feature Ideas

After testing, consider adding:
- [ ] Save external jobs to "Bookmarks"
- [ ] Email me when new jobs match my search
- [ ] Show company reviews for external jobs
- [ ] Resume auto-match for external jobs
- [ ] One-click apply with resume upload

---

**Happy Testing! 🎉**
