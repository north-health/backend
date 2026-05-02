import { body } from "express-validator";

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

const contentRules = [
  body("content.topics")
    .isArray({ min: 1 })
    .withMessage("content.topics must be a non-empty array of strings")
    .custom((v: unknown) => isStringArray(v))
    .withMessage("Each topic must be a string"),
  body("content.explanations")
    .isString()
    .isLength({ min: 1, max: 200_000 })
    .withMessage("content.explanations is required"),
  body("content.examples")
    .isArray()
    .withMessage("content.examples must be an array")
    .custom((v: unknown) => isStringArray(v))
    .withMessage("Each example must be a string"),
  body("content.keyTakeaways")
    .isArray()
    .withMessage("content.keyTakeaways must be an array")
    .custom((v: unknown) => isStringArray(v))
    .withMessage("Each key takeaway must be a string"),
  body("content.practiceProjects")
    .isArray()
    .withMessage("content.practiceProjects must be an array")
    .custom((v: unknown) => isStringArray(v))
    .withMessage("Each practice project must be a string"),
];

export const validateCreateLearningModule = [
  body("categoryId")
    .trim()
    .notEmpty()
    .withMessage("categoryId is required"),
  body("sortOrder")
    .isInt({ min: 0 })
    .withMessage("sortOrder must be a non-negative integer"),
  body("week")
    .trim()
    .isLength({ min: 1, max: 32 })
    .withMessage("week is required"),
  body("title")
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage("title is required"),
  body("subtitle")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("subtitle is required"),
  body("dueDate")
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage("dueDate is required"),
  body("difficulty")
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage("difficulty is required"),
  body("gradient")
    .isArray({ min: 2, max: 2 })
    .withMessage("gradient must be [string, string]"),
  body("gradient.*")
    .isString()
    .isLength({ min: 1, max: 32 })
    .withMessage("Each gradient stop must be a non-empty string"),
  body("accentColor")
    .trim()
    .isLength({ min: 1, max: 32 })
    .withMessage("accentColor is required"),
  body("lessons")
    .isInt({ min: 0 })
    .withMessage("lessons must be a non-negative integer"),
  body("duration")
    .trim()
    .isLength({ min: 1, max: 32 })
    .withMessage("duration is required"),
  body("content").isObject().withMessage("content object is required"),
  ...contentRules,
];

/** Partial update: every field optional; at least one must be sent (checked in controller). */
export const validateUpdateLearningModule = [
  body("categoryId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("categoryId cannot be empty"),
  body("sortOrder").optional().isInt({ min: 0 }),
  body("week").optional().trim().isLength({ min: 1, max: 32 }),
  body("title").optional().trim().isLength({ min: 1, max: 300 }),
  body("subtitle").optional().trim().isLength({ min: 1, max: 500 }),
  body("dueDate").optional().trim().isLength({ min: 1, max: 64 }),
  body("difficulty").optional().trim().isLength({ min: 1, max: 64 }),
  body("gradient")
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage("gradient must be [string, string]"),
  body("gradient.*")
    .optional()
    .isString()
    .isLength({ min: 1, max: 32 }),
  body("accentColor").optional().trim().isLength({ min: 1, max: 32 }),
  body("lessons").optional().isInt({ min: 0 }),
  body("duration").optional().trim().isLength({ min: 1, max: 32 }),
  body("content").optional().isObject(),
  body("content.topics")
    .optional()
    .isArray({ min: 1 })
    .custom((v: unknown) => (v == null ? true : isStringArray(v)))
    .withMessage("Each topic must be a string"),
  body("content.explanations")
    .optional()
    .isString()
    .isLength({ min: 1, max: 200_000 }),
  body("content.examples")
    .optional()
    .isArray()
    .custom((v: unknown) => (v == null ? true : isStringArray(v))),
  body("content.keyTakeaways")
    .optional()
    .isArray()
    .custom((v: unknown) => (v == null ? true : isStringArray(v))),
  body("content.practiceProjects")
    .optional()
    .isArray()
    .custom((v: unknown) => (v == null ? true : isStringArray(v))),
];
