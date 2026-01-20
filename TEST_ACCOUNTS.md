# 🔑 Test Accounts - Ready to Use!

## 📋 **Login Credentials**

### 👨‍💼 **ADMIN ACCOUNT (Your Account)**
```
Email: rk8766323@gmail.com
Password: Rohit@4850
```

**What you can do:**
- ✅ Manage all users (create, edit, delete)
- ✅ Create semesters (Fall 2024, Spring 2025, etc.)
- ✅ Create subjects (Data Structures, Calculus, etc.)
- ✅ Create sections (Section A, B, C)
- ✅ Assign faculty to sections
- ✅ Bulk import users from Excel
- ✅ Export data to Excel
- ✅ Full system access

---

### 👨‍🏫 **FACULTY ACCOUNT**
```
Email: faculty@test.com
Password: Faculty@123
```

**What you can do:**
- ✅ See only assigned subjects/sections
- ✅ Create exams with unique codes
- ✅ Upload course materials
- ✅ Post announcements
- ✅ View student submissions
- ✅ Share exam codes with students

---

### 🎓 **STUDENT ACCOUNT**
```
Email: student@test.com
Password: Student@123
```

**What you can do:**
- ✅ Join exams using code
- ✅ Take exams
- ✅ View progress and grades
- ✅ See enrolled sections
- ✅ Access course materials

---

## 🧪 **Complete Testing Workflow**

### **Step 1: Setup (As Admin)**
```
1. Login: rk8766323@gmail.com / Rohit@4850
2. Go to "Semesters" → Create "Fall 2024"
3. Go to "Subjects" → Create "Data Structures (CS301)"
4. Go to "Sections" → Create "Section A"
   - Subject: Data Structures
   - Faculty: Dr. John Smith (faculty@test.com)
   - Max Students: 75
```

### **Step 2: Create Exam (As Faculty)**
```
1. Logout from admin
2. Login: faculty@test.com / Faculty@123
3. Go to "Exams" → Create exam
   - Title: Midterm Exam
   - Type: MCQ
   - Duration: 60 minutes
   - Total Marks: 100
4. Note the EXAM CODE (e.g., ABC123)
5. Click copy button 📋
```

### **Step 3: Join Exam (As Student)**
```
1. Logout from faculty
2. Login: student@test.com / Student@123
3. Go to "Join Exam"
4. Enter the exam code (ABC123)
5. Click "Join Exam"
6. Exam appears in "My Exams"
7. Click "Start Exam"
```

### **Step 4: Export Data (As Admin)**
```
1. Login: rk8766323@gmail.com / Rohit@4850
2. Go to "Export"
3. Click "Download Users Excel"
4. Open Excel file → See all users
5. Click "Download Submissions"
6. See exam results
```

---

## 🎯 **Quick Test Scenarios**

### **Scenario 1: Full Course Setup**
```
ADMIN:
1. Create Semester: Fall 2024
2. Create Subject: Programming 101
3. Create Section A (assign faculty)
4. Create Section B (assign faculty)

FACULTY:
1. Login as faculty
2. Create exam for Section A
3. Get exam code
4. Share with students

STUDENT:
1. Login as student
2. Join using code
3. Take exam
4. View results
```

### **Scenario 2: Bulk User Import**
```
ADMIN:
1. Go to Export page
2. Download template Excel
3. Fill with 10 test students
4. Upload Excel
5. All 10 students created instantly!
```

### **Scenario 3: Section Management**
```
ADMIN:
1. Create 3 sections for same subject
2. Assign different faculty to each
3. Each faculty sees only their section

FACULTY 1:
- Sees Section A only
- Creates exam for Section A

FACULTY 2:
- Sees Section B only
- Creates different exam for Section B
```

---

## 🔐 **Security Testing**

### **Test 1: Auto Logout**
```
1. Login as admin
2. Close browser completely
3. Open browser again
4. Should see login page ✓
```

### **Test 2: Role-Based Access**
```
1. Login as student
2. Try to access /admin/users
3. Should be denied ✓
```

### **Test 3: Faculty Isolation**
```
1. Create 2 faculty accounts
2. Create 2 sections (one per faculty)
3. Faculty 1 can't see Faculty 2's sections ✓
```

---

## 📊 **Test Data You Can Create**

### **Semesters:**
```
- Fall 2024
- Spring 2025
- Summer 2025
```

### **Subjects:**
```
- Data Structures (CS301)
- Web Development (CS302)
- Database Systems (CS303)
- Calculus (MA101)
```

### **Sections:**
```
Data Structures:
  - Section A (Morning, Dr. Smith)
  - Section B (Evening, Dr. Smith)

Web Development:
  - Section A (Dr. Smith)
```

### **Exams:**
```
- Midterm Exam (MCQ, 60 min, 100 marks)
- Final Exam (QUIZ, 90 min, 150 marks)
- Lab Test (CODING, 120 min, 50 marks)
```

---

## 🎨 **Frontend Pages to Test**

### **Admin Pages:**
```
✓ /admin/users - User management
✓ /admin/semesters - Semester management
✓ /admin/subjects - Subject management
✓ /admin/sections - Section management ← NEW!
✓ /admin/export - Bulk import/export
```

### **Faculty Pages:**
```
✓ /faculty/exams - Exam creation with codes
✓ /faculty/materials - Material upload
✓ /faculty/announcements - Post updates
```

### **Student Pages:**
```
✓ /student/join-exam - Join using code
✓ /student/exams - My enrolled exams
✓ /student/progress - Grades & performance
```

---

## 🚀 **Start Testing Now!**

### **Backend (should be running):**
```powershell
cd D:\project\server
npm run dev
```

### **Frontend:**
```powershell
cd D:\project\client
npm run dev
```

### **Open Browser:**
```
http://localhost:3001
```

### **Login with your admin account:**
```
Email: rk8766323@gmail.com
Password: Rohit@4850
```

---

## 📝 **Testing Checklist**

### **Admin Features:**
- [ ] Login with admin account
- [ ] Create semester
- [ ] Create subject
- [ ] Create section (with faculty assignment)
- [ ] Create multiple users manually
- [ ] Bulk import users from Excel
- [ ] Export users to Excel
- [ ] Export submissions to Excel

### **Faculty Features:**
- [ ] Login with faculty account
- [ ] See only assigned sections
- [ ] Create exam
- [ ] Copy exam code
- [ ] Upload material
- [ ] Post announcement

### **Student Features:**
- [ ] Login with student account
- [ ] Join exam with code
- [ ] See joined exams
- [ ] View progress (if submissions exist)

### **Security Features:**
- [ ] Close browser and verify auto logout
- [ ] Try accessing admin pages as student (should fail)
- [ ] Verify faculty can't see other faculty's sections

---

## 🎉 **You're All Set!**

**Three accounts ready:**
1. ✅ **Your Admin** - rk8766323@gmail.com
2. ✅ **Test Faculty** - faculty@test.com
3. ✅ **Test Student** - student@test.com

**Start testing the complete workflow!** 🚀
