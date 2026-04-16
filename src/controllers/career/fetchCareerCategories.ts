import { Request, Response } from "express";
import { db } from "../../config/firebase/firebase";
import { CareerCategory } from "../../models/career";

export const GetCareerCategories = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("career_categories").get();

    if (snapshot.empty) {
      return res.status(200).json({
        message: "No career categories found",
        data: [],
      });
    }

    const categories: (CareerCategory & { id: string })[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as CareerCategory),
    }));

    return res.status(200).json({
      message: "Career categories fetched successfully",
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching career categories:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};