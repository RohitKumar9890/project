import { validationResult } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { executeCode } from '../services/codeExecutionService.js';

export const execute = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { language, code, stdin } = req.body;

  const result = await executeCode({ language, code, stdin });
  res.json({ result });
});
