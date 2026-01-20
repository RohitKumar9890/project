import { Submission } from '../../models/Submission.js';
import { Progress } from '../../models/Progress.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getMyProgress = asyncHandler(async (req, res) => {
  // Get all submissions for the student
  const submissions = await Submission.find({ studentId: req.user.id });
  
  // Get progress records if any
  const progress = await Progress.find({ studentId: req.user.id });
  
  res.json({ progress, submissions });
});
