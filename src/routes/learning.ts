import { Router } from "express";
import { validationResult } from "express-validator";
import { verifyJWT, authorizeRole } from "../middlewares/authMiddleware";
import {
  validateCreateLearningModule,
  validateUpdateLearningModule,
} from "../validators/learningModuleValidator";
import {
  createLearningModule,
  updateLearningModule,
  deleteLearningModule,
  listLearningModulesByCategory,
  getLearningModuleById,
} from "../controllers/learning/learningModules";

const router = Router();

const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// List and get-by-id: register static path before :id to avoid collisions
router.get(
  "/modules/category/:categoryId",
  listLearningModulesByCategory as any,
);

router.get("/modules/:id", getLearningModuleById as any);

router.post(
  "/modules",
  verifyJWT,
  authorizeRole("admin"),
  validateCreateLearningModule,
  handleValidationErrors,
  createLearningModule as any,
);

router.put(
  "/modules/:id",
  verifyJWT,
  authorizeRole("admin"),
  validateUpdateLearningModule,
  handleValidationErrors,
  updateLearningModule as any,
);

router.delete(
  "/modules/:id",
  verifyJWT,
  authorizeRole("admin"),
  deleteLearningModule as any,
);

export default router;
