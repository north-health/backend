import { body } from "express-validator";

// CAREER CATEGORY VALIDATOR (SUPPORTS SINGLE + ARRAY)
export const validateCareerCategory = [
  body().custom((value) => {
    // IF ARRAY (MULTIPLE)
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (!item.name || item.name.trim().length < 2 || item.name.trim().length > 500) {
          throw new Error(`Item ${index}: Career name must be between 2 and 500 characters`);
        }

        if (!item.description || item.description.trim().length < 2 || item.description.trim().length > 500) {
          throw new Error(`Item ${index}: Career description must be between 2 and 500 characters`);
        }
      });
    } 
    // IF SINGLE OBJECT
    else {
      if (!value.name || value.name.trim().length < 2 || value.name.trim().length > 500) {
        throw new Error("Career name must be between 2 and 500 characters");
      }

      if (!value.description || value.description.trim().length < 2 || value.description.trim().length > 500) {
        throw new Error("Career description must be between 2 and 500 characters");
      }
    }

    return true;
  }),
];