import ExcelJS from 'exceljs';
import { User } from '../../models/User.js';
import { hashPassword } from '../../utils/password.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const bulkImportUsers = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);

  const worksheet = workbook.getWorksheet('Users Template');
  if (!worksheet) {
    return res.status(400).json({ message: 'Invalid template. Sheet "Users Template" not found.' });
  }

  const results = {
    success: [],
    errors: [],
    total: 0,
  };

  // Skip header row, start from row 2
  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header
      rows.push({
        rowNumber,
        name: row.getCell(1).value,
        email: row.getCell(2).value,
        password: row.getCell(3).value,
        role: row.getCell(4).value,
      });
    }
  });

  results.total = rows.length;

  // Process each row
  for (const rowData of rows) {
    try {
      const { rowNumber, name, email, password, role } = rowData;

      // Validation
      if (!name || !email || !password || !role) {
        results.errors.push({
          row: rowNumber,
          email: email || 'N/A',
          error: 'Missing required fields (Name, Email, Password, or Role)',
        });
        continue;
      }

      // Validate role
      if (!['admin', 'faculty', 'student'].includes(role.toLowerCase())) {
        results.errors.push({
          row: rowNumber,
          email,
          error: `Invalid role: ${role}. Must be admin, faculty, or student`,
        });
        continue;
      }

      // Validate password length
      if (password.length < 6) {
        results.errors.push({
          row: rowNumber,
          email,
          error: 'Password must be at least 6 characters',
        });
        continue;
      }

      // Check if email already exists
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        results.errors.push({
          row: rowNumber,
          email,
          error: 'Email already exists',
        });
        continue;
      }

      // Create user
      const passwordHash = await hashPassword(password);
      await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role.toLowerCase(),
        isActive: true,
      });

      results.success.push({
        row: rowNumber,
        name,
        email,
        role: role.toLowerCase(),
      });
    } catch (error) {
      results.errors.push({
        row: rowData.rowNumber,
        email: rowData.email || 'N/A',
        error: error.message,
      });
    }
  }

  res.json({
    message: 'Bulk import completed',
    results: {
      total: results.total,
      successful: results.success.length,
      failed: results.errors.length,
      successDetails: results.success,
      errorDetails: results.errors,
    },
  });
});
