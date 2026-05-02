import { body } from "express-validator";

// CAREER VALIDATOR
export const validateCareer = [
  body("uid")
    .isString()
    .withMessage("User ID must be a string"),
  body("path")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Career path must be between 2 and 200 characters"),
  body("categoryId")
    .optional()
    .trim()
    .isLength({ min: 1, max: 128 })
    .withMessage("categoryId must be a non-empty string when provided"),
];