// USER ROUTES
import { Router } from "express";
import { CreateCareer } from "../controllers/career/career";
// ENDS

// MIDDLEWARES
import { verifyJWT } from "../middlewares/authMiddleware";
// ENDS

// VALIDATORS
import { validateCareer } from "../validators/careerValidator";
import { validationResult } from "express-validator";
// ENDS

// MIDDLEWARE TO HANDLE VALIDATION ERRORS
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const router = Router();



// UPDATE ROUTES (REQUIRES AUTH)
router.post(
  "/career",
  verifyJWT,
  validateCareer,
  handleValidationErrors,
  CreateCareer as any
);


export default router;