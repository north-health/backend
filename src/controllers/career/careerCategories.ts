import { Request, Response } from "express";
import { db } from "../../config/firebase/firebase";
import { CareerCategory } from "../../models/career";

type AuthRequest = Request & {
  user?: {
    role: string;
  };
};

export const CreateCareerCategory = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;

    // CHECK IF USER IS ADMIN (ONLY CHECK req.user, NEVER TRUST req.body FOR ROLE)
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    // ============================
    // HANDLE MULTIPLE CATEGORIES
    // ============================
    if (Array.isArray(body)) {
      const batch = db.batch();
      const createdCategories: any[] = [];

      body.forEach((item) => {
        // VALIDATE EACH ITEM
        if (!item.name || !item.description) {
          throw new Error("Each category must have name and description");
        }

        const docRef = db.collection("career_categories").doc();

        const careerCategoryData: CareerCategory = {
          name: item.name,
          description: item.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // ADD TO FIRESTORE BATCH
        batch.set(docRef, careerCategoryData);

        createdCategories.push({
          id: docRef.id,
          ...careerCategoryData,
        });
      });

      // COMMIT ALL AT ONCE
      await batch.commit();

      return res.status(201).json({
        message: "Career categories created successfully",
        count: createdCategories.length,
        data: createdCategories,
      });
    }

    // ============================
    // HANDLE SINGLE CATEGORY
    // ============================
    const { name, description } = body;

    // ❗ VALIDATION
    if (!name || !description) {
      return res.status(400).json({
        message: "Career category name and description are required",
      });
    }

    const careerCategoryData: CareerCategory = {
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 💾 SAVE TO FIRESTORE
    const docRef = await db.collection("career_categories").add(careerCategoryData);

    return res.status(201).json({
      message: "Career category created successfully",
      id: docRef.id,
      data: careerCategoryData,
    });

  } catch (error) {
    console.error("ERROR CREATING CAREER CATEGORY:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};