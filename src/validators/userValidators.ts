import { body } from "express-validator";

// REGISTER EMAIL VALIDATOR
export const validateRegisterEmail = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("displayName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Display name must be between 2 and 50 characters"),
  body("identityNumber")
    .matches(/^\d{13}$/)
    .withMessage("Identity number must be exactly 13 digits"),
];

// LOGIN EMAIL VALIDATOR
export const validateLoginEmail = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// UPDATE PROFILE VALIDATOR
export const validateUpdateProfile = [
  body("displayName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Display name must be between 2 and 50 characters"),
  body("phoneNumber")
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),
  body("province")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Province must be between 2 and 50 characters"),
  body("city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),
  body("identityNumber")
    .optional()
    .matches(/^\d{13}$/)
    .withMessage("Identity number must be exactly 13 digits"),
];

// CHANGE PASSWORD VALIDATOR
export const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];