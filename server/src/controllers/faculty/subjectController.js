import { Subject } from '../../models/Subject.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getMySubjects = asyncHandler(async (req, res) => {
  // Get subjects assigned to the logged-in faculty member
  const subjects = await Subject.find({ facultyId: req.user.id });
  res.json({ subjects });
});
