import { body } from "express-validator";

// CAREER VALIDATOR
export const validateCareer = [
  body("uid")
    .isNumeric()
    .withMessage("User ID must be a number"),
  body("path")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Career path must be between 2 and 200 characters"),
];