import { Request, Response } from "express";
import { db } from "../../config/firebase/firebase";
import { User } from "../../models/user";

export class UserController {
  // VERIFY USER EMAIL
  static async verifyEmail(req: Request, res: Response) {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // GET USER DOCUMENT
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = userDoc.data() as User;

      // CHECK IF ALREADY VERIFIED
      if (userData.DTO.isVerfied) {
        return res.status(200).json({ message: "User already verified" });
      }

      // UPDATE VERIFICATION STATUS
      await db.collection("users").doc(uid).update({
        "DTO.isVerfied": true,
        updatedAt: new Date(),
      });

      return res.status(200).json({ message: "User verified successfully" });
    } catch (error) {
      console.error("❌ Verify email error:", (error as Error).message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // BLOCK USER
  static async blockUser(req: Request, res: Response) {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // GET USER DOCUMENT
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      // UPDATE BLOCK STATUS
      await db.collection("users").doc(uid).update({
        "DTO.isBlocked": true,
        updatedAt: new Date(),
      });

      return res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
      console.error("❌ Block user error:", (error as Error).message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // UNBLOCK USER
  static async unblockUser(req: Request, res: Response) {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // GET USER DOCUMENT
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      // UPDATE BLOCK STATUS
      await db.collection("users").doc(uid).update({
        "DTO.isBlocked": false,
        updatedAt: new Date(),
      });

      return res.status(200).json({ message: "User unblocked successfully" });
    } catch (error) {
      console.error("❌ Unblock user error:", (error as Error).message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
// ENDS