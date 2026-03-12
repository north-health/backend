import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

export const wakeUpServer = async (req: Request, res: Response) => {
  try {
    const renderUrl = process.env.API_BASE_URL;
    const response = await fetch(renderUrl as string);

    if (response.ok) {
      res.json({ message: "Welcome to the community!" });
    } else {
      res.status(500).json({ error: "Failed to wake up server" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error waking up server" });
  }
};
