import { Request, Response } from "express";
import { db } from "../../config/firebase/firebase";
import { Career } from "../../models/career";


type AuthRequest = Request & {
  user?: {
    id: string;
  };
};

export const CreateCareer = async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.id || req.body.uid;
    const { path } = req.body;

    if (!uid) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!path) {
      return res.status(400).json({ message: "Career path is required" });
    }

    const careerData: Career = {
      uid,
      path,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("careers").add(careerData);

    return res.status(201).json({
      message: "Career created successfully",
      id: docRef.id,
      data: careerData,
    });
  } catch (error) {
    console.error("Error creating career:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
