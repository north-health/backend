import { Router } from "express";
import { UserController as RegisterController } from "../controllers/user/register";
import { UserController as LoginController } from "../controllers/user/login";
import { UserController as VerifyController } from "../controllers/user/verify";
import { UserController as UpdateController } from "../controllers/user/update";
import { UserController as DeleteController } from "../controllers/user/delete";
import { verifyJWT, authorizeRole } from "../middlewares/authMiddleware";
import {
  validateRegisterEmail,
  validateLoginEmail,
  validateUpdateProfile,
  validateChangePassword,
} from "../validators/userValidators";
import { validationResult } from "express-validator";

// MIDDLEWARE TO HANDLE VALIDATION ERRORS
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const router = Router();

// ================= PUBLIC ROUTES =================
// REGISTER ROUTES
router.post(
  "/register/email",
  validateRegisterEmail,
  handleValidationErrors,
  RegisterController.registerEmail
);
router.post("/register/google", RegisterController.registerGoogle);

// LOGIN ROUTES
router.post(
  "/login/email",
  validateLoginEmail,
  handleValidationErrors,
  LoginController.loginEmail
);
router.post("/login/google", LoginController.loginGoogle);

// ================= PROTECTED ROUTES =================
// VERIFY ROUTES (REQUIRES AUTH)
router.post("/verify", verifyJWT, VerifyController.verifyEmail);

// UPDATE ROUTES (REQUIRES AUTH)
router.put(
  "/profile",
  verifyJWT,
  validateUpdateProfile,
  handleValidationErrors,
  UpdateController.updateProfile
);
router.put(
  "/password",
  verifyJWT,
  validateChangePassword,
  handleValidationErrors,
  UpdateController.changePassword
);

// DELETE ROUTES (REQUIRES AUTH)
router.delete("/delete", verifyJWT, DeleteController.deleteUser);

// ================= ADMIN ROUTES =================
// BLOCK/UNBLOCK USERS (ADMIN ONLY)
router.post("/block", verifyJWT, authorizeRole("admin"), VerifyController.blockUser);
router.post("/unblock", verifyJWT, authorizeRole("admin"), VerifyController.unblockUser);

// HARD DELETE (ADMIN ONLY)
router.delete("/hard-delete", verifyJWT, authorizeRole("admin"), DeleteController.hardDeleteUser);

export default router;