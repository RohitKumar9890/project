import ExcelJS from 'exceljs';
import { User } from '../../models/User.js';
import { Exam } from '../../models/Exam.js';
import { Submission } from '../../models/Submission.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const exportUsersToExcel = asyncHandler(async (req, res) => {
  // Get all users
  const users = await User.find({});

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users');

  // Define columns
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 30 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add data
  users.forEach(user => {
    worksheet.addRow({
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.isActive ? 'Active' : 'Inactive',
      createdAt: user.createdAt?.toDate ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A',
    });
  });

  // Set response headers
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=users_${Date.now()}.xlsx`
  );

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
});

export const exportExamResults = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  // Get exam details
  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  // Get all submissions for this exam
  const submissions = await Submission.find({ examId });

  // Get student details for each submission
  const submissionsWithDetails = await Promise.all(
    submissions.map(async (sub) => {
      const student = await User.findById(sub.studentId);
      return {
        ...sub,
        studentName: student?.name || 'Unknown',
        studentEmail: student?.email || 'Unknown',
      };
    })
  );

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Exam Results');

  // Add exam info at top
  worksheet.mergeCells('A1:F1');
  worksheet.getCell('A1').value = `Exam: ${exam.title}`;
  worksheet.getCell('A1').font = { bold: true, size: 14 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:F2');
  worksheet.getCell('A2').value = `Total Marks: ${exam.totalMarks} | Type: ${exam.type.toUpperCase()}`;
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  // Add empty row
  worksheet.addRow([]);

  // Define columns (starting from row 4)
  const headerRow = worksheet.getRow(4);
  headerRow.values = ['Student Name', 'Email', 'Score', 'Max Score', 'Percentage', 'Status', 'Submitted At'];
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Set column widths
  worksheet.getColumn(1).width = 25;
  worksheet.getColumn(2).width = 30;
  worksheet.getColumn(3).width = 12;
  worksheet.getColumn(4).width = 12;
  worksheet.getColumn(5).width = 12;
  worksheet.getColumn(6).width = 15;
  worksheet.getColumn(7).width = 20;

  // Add data
  submissionsWithDetails.forEach(sub => {
    const percentage = sub.maxScore > 0 ? ((sub.score / sub.maxScore) * 100).toFixed(1) : '0';
    worksheet.addRow([
      sub.studentName,
      sub.studentEmail,
      sub.score || 0,
      sub.maxScore || 0,
      `${percentage}%`,
      sub.status || 'N/A',
      sub.submittedAt?.toDate ? new Date(sub.submittedAt.toDate()).toLocaleString() : 'Not submitted',
    ]);
  });

  // Add summary row
  const summaryRowNum = worksheet.rowCount + 2;
  worksheet.getRow(summaryRowNum).values = [
    'Summary',
    '',
    '',
    '',
    '',
    '',
    '',
  ];
  worksheet.getRow(summaryRowNum).font = { bold: true };

  const avgScore = submissionsWithDetails.length > 0
    ? submissionsWithDetails.reduce((sum, sub) => sum + (sub.score || 0), 0) / submissionsWithDetails.length
    : 0;

  worksheet.addRow([
    `Total Submissions: ${submissionsWithDetails.length}`,
    '',
    `Average Score: ${avgScore.toFixed(1)}`,
    '',
    '',
    '',
    '',
  ]);

  // Set response headers
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=exam_results_${exam.title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`
  );

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
});

export const downloadUserTemplate = asyncHandler(async (req, res) => {
  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users Template');

  // Define columns
  worksheet.columns = [
    { header: 'Name*', key: 'name', width: 25 },
    { header: 'Email*', key: 'email', width: 30 },
    { header: 'Password*', key: 'password', width: 20 },
    { header: 'Role*', key: 'role', width: 15 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add example rows
  worksheet.addRow({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123',
    role: 'student',
  });

  worksheet.addRow({
    name: 'Jane Smith',
    email: 'jane@faculty.com',
    password: 'Faculty123',
    role: 'faculty',
  });

  worksheet.addRow({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123',
    role: 'admin',
  });

  // Add instructions sheet
  const instructionsSheet = workbook.addWorksheet('Instructions');
  instructionsSheet.getColumn(1).width = 80;
  
  instructionsSheet.addRow(['BULK USER IMPORT INSTRUCTIONS']);
  instructionsSheet.getRow(1).font = { bold: true, size: 14 };
  instructionsSheet.addRow([]);
  instructionsSheet.addRow(['1. Fill in the "Users Template" sheet with user details']);
  instructionsSheet.addRow(['2. Required fields are marked with * (Name, Email, Password, Role)']);
  instructionsSheet.addRow(['3. Role must be one of: admin, faculty, student (lowercase)']);
  instructionsSheet.addRow(['4. Email must be unique (no duplicates)']);
  instructionsSheet.addRow(['5. Password must be at least 6 characters']);
  instructionsSheet.addRow(['6. Delete the example rows before uploading']);
  instructionsSheet.addRow(['7. Save the file and upload it in the Admin panel']);
  instructionsSheet.addRow([]);
  instructionsSheet.addRow(['Example:']);
  instructionsSheet.addRow(['Name: John Doe | Email: john@test.com | Password: Test123 | Role: student']);

  // Set response headers
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=user_import_template.xlsx'
  );

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
});

export const exportAllSubmissions = asyncHandler(async (req, res) => {
  // Get all submissions
  const submissions = await Submission.find({});

  // Get details for each submission
  const submissionsWithDetails = await Promise.all(
    submissions.map(async (sub) => {
      const student = await User.findById(sub.studentId);
      const exam = await Exam.findById(sub.examId);
      return {
        ...sub,
        studentName: student?.name || 'Unknown',
        studentEmail: student?.email || 'Unknown',
        examTitle: exam?.title || 'Unknown',
      };
    })
  );

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('All Submissions');

  // Define columns
  worksheet.columns = [
    { header: 'Student Name', key: 'studentName', width: 25 },
    { header: 'Student Email', key: 'studentEmail', width: 30 },
    { header: 'Exam Title', key: 'examTitle', width: 30 },
    { header: 'Score', key: 'score', width: 12 },
    { header: 'Max Score', key: 'maxScore', width: 12 },
    { header: 'Percentage', key: 'percentage', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Submitted At', key: 'submittedAt', width: 20 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add data
  submissionsWithDetails.forEach(sub => {
    const percentage = sub.maxScore > 0 ? ((sub.score / sub.maxScore) * 100).toFixed(1) : '0';
    worksheet.addRow({
      studentName: sub.studentName,
      studentEmail: sub.studentEmail,
      examTitle: sub.examTitle,
      score: sub.score || 0,
      maxScore: sub.maxScore || 0,
      percentage: `${percentage}%`,
      status: sub.status || 'N/A',
      submittedAt: sub.submittedAt?.toDate ? new Date(sub.submittedAt.toDate()).toLocaleString() : 'Not submitted',
    });
  });

  // Set response headers
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=all_submissions_${Date.now()}.xlsx`
  );

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
});
