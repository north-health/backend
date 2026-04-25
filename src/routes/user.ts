// USER ROUTES
import { Router } from "express";
import { registerEmail, registerGoogle } from "../controllers/user/register";
import { UserController as LoginController } from "../controllers/user/login";
import { UserController as VerifyController } from "../controllers/user/verify";
import { UserController as UpdateController } from "../controllers/user/update";
import { UserController as DeleteController } from "../controllers/user/delete";
import { UserController as GetController } from "../controllers/user/get";
// ENDS

// MIDDLEWARES
import { verifyJWT, authorizeRole } from "../middlewares/authMiddleware";
// ENDS

// VALIDATORS
import {
  validateRegisterEmail,
  validateLoginEmail,
  validateUpdateProfile,
  validateChangePassword,
} from "../validators/userValidators";
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

// PUBLIC ROUTES 

// REGISTER ROUTES
router.post(
  "/register/email",
  validateRegisterEmail,
  handleValidationErrors,
  registerEmail as any
);
router.post("/register/google", registerGoogle as any);
// ENDS

// LOGIN ROUTES
router.post(
  "/login/email",
  validateLoginEmail,
  handleValidationErrors,
  LoginController.loginEmail
);
router.post("/login/google", LoginController.loginGoogle);
// ENDS
// ENDS

// PROTECTED ROUTES 

// GET ROUTES (REQUIRES AUTH)
router.get("/", verifyJWT, authorizeRole("admin"), GetController.getUsers);
// ENDS

// VERIFY ROUTES (REQUIRES AUTH)
router.post("/verify", verifyJWT, VerifyController.verifyEmail);
// ENDS

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
// ENDS

// DELETE ROUTES (REQUIRES AUTH)
router.delete("/delete", verifyJWT, DeleteController.deleteUser);
// ENDS

// ADMIN ROUTES 
// BLOCK/UNBLOCK USERS (ADMIN ONLY)
router.post("/block", verifyJWT, authorizeRole("admin"), VerifyController.blockUser);
router.post("/unblock", verifyJWT, authorizeRole("admin"), VerifyController.unblockUser);
// ENDS

// HARD DELETE (ADMIN ONLY)
router.delete("/hard-delete", verifyJWT, authorizeRole("admin"), DeleteController.hardDeleteUser);
// ENDS
// ENDS

// KEEP DYNAMIC ROUTES LAST TO AVOID MASKING STATIC PATHS
router.get("/:uid", verifyJWT, GetController.getUserById);

export default router;