import { Request, Response } from "express";
import { auth, db } from "../../config/firebase/firebase";

export class UserController {
  // SOFT DELETE USER
  static async deleteUser(req: Request, res: Response) {
    try {
      const uid = req.user?.id?.toString() || req.body.uid;

      if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // GET USER DOCUMENT
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      // SOFT DELETE - MARK AS DELETED
      await db.collection("users").doc(uid).update({
        "DTO.isDeleted": true,
        "DTO.isActive": false,
        updatedAt: new Date(),
      });

      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("❌ Delete user error:", (error as Error).message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // HARD DELETE USER (ADMIN ONLY)
  static async hardDeleteUser(req: Request, res: Response) {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // DELETE FROM FIRESTORE
      await db.collection("users").doc(uid).delete();

      // DELETE FROM FIREBASE AUTH
      try {
        await auth.deleteUser(uid);
      } catch (authError) {
        console.warn("Could not delete from Firebase Auth:", authError);
      }

      return res.status(200).json({ message: "User permanently deleted" });
    } catch (error) {
      console.error("❌ Hard delete user error:", (error as Error).message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
// ENDS