// CAREER ROUTES
import { Router } from "express";
import { CreateCareer } from "../controllers/career/career";
import { GetCareerCategories } from "../controllers/career/fetchCareerCategories";
import { CreateCareerCategory } from "../controllers/career/careerCategories";
// ENDS

// MIDDLEWARES
import { verifyJWT } from "../middlewares/authMiddleware";
// ENDS

// VALIDATORS
import { validateCareer } from "../validators/careerValidator";
import { validationResult } from "express-validator";
import { validateCareerCategory } from "../validators/careerCategoryValidator";
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
  "/",
  verifyJWT,
  validateCareer,
  handleValidationErrors,
  CreateCareer as any,
);
// ENDS

// GET CAREER CATEGORIES (NO AUTH REQUIRED)
router.get("/categories", GetCareerCategories as any);
// ENDS

// CREATE CAREER CATEGORY (REQUIRES ADMIN AUTH)
router.post(
  "/category",
  verifyJWT,               
  validateCareerCategory,   
  handleValidationErrors,
  CreateCareerCategory as any
);
// ENDS

export default router;