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
];