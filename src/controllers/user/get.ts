import { Request, Response } from "express";
import { db } from "../../config/firebase/firebase";
import { User } from "../../models/user";

type SafeUser = Omit<User, "password"> & { uid: string };

function toSafeUser(uid: string, user: User): SafeUser {
  const { password, ...safeUser } = user;
  return {
    ...safeUser,
    uid,
  };
}

export class UserController {
  // GET ALL USERS (ADMIN ONLY)
  static async getUsers(req: Request, res: Response) {
    try {
      const usersSnapshot = await db.collection("users").get();

      const users: SafeUser[] = usersSnapshot.docs.map((doc) =>
        toSafeUser(doc.id, doc.data() as User),
      );

      return res.status(200).json({
        message: "Users fetched successfully",
        count: users.length,
        users,
      });
    } catch (error) {
      console.error("❌ Get users error:", (error as Error).message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // GET USER BY UID (SELF OR ADMIN)
  static async getUserById(req: Request, res: Response) {
    try {
      const uidParam = req.params.uid;
      const uid = Array.isArray(uidParam) ? uidParam[0] : uidParam;
      const requesterUid = req.user?.id?.toString();
      const requesterRole = req.user?.role || "user";

      if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
      }

      if (requesterRole !== "admin" && requesterUid !== uid) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      }

      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = userDoc.data() as User;

      return res.status(200).json({
        message: "User fetched successfully",
        user: toSafeUser(userDoc.id, userData),
      });
    } catch (error) {
      console.error("❌ Get user by ID error:", (error as Error).message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
