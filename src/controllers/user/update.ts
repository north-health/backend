import { Request, Response } from "express";
import { db } from "../../config/firebase/firebase";
import { User } from "../../models/user";
import bcrypt from "bcryptjs";

export class UserController {
  // UPDATE USER PROFILE
  static async updateProfile(req: Request, res: Response) {
    try {
      const uid = req.user?.id?.toString() || req.body.uid; // From auth middleware or body
      const { displayName, phoneNumber, province, city, identityNumber } = req.body;

      if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // GET USER DOCUMENT
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = userDoc.data() as User;

      // VALIDATION
      if (identityNumber && !/^\d{13}$/.test(identityNumber)) {
        return res.status(400).json({ message: "Identity number must be 13 digits" });
      }

      // PREPARE UPDATE DATA
      const updateData: Partial<User> = {
        updatedAt: new Date(),
      };

      if (displayName !== undefined) updateData.displayName = displayName;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (province !== undefined) updateData.province = province;
      if (city !== undefined) updateData.city = city;
      if (identityNumber !== undefined) updateData.identityNumber = identityNumber;

      // UPDATE USER
      await db.collection("users").doc(uid).update(updateData);

      return res.status(200).json({
        message: "Profile updated successfully",
        user: { ...userData, ...updateData },
      });
    } catch (error) {
      console.error("❌ Update profile error:", (error as Error).message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // CHANGE PASSWORD
  static async changePassword(req: Request, res: Response) {
    try {
      const uid = req.user?.id?.toString() || req.body.uid;
      const { currentPassword, newPassword } = req.body;

      if (!uid || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // GET USER DOCUMENT
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = userDoc.data() as User;

      // VERIFY CURRENT PASSWORD
      const isMatch = await bcrypt.compare(currentPassword, userData.password || "");
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // HASH NEW PASSWORD
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // UPDATE PASSWORD
      await db.collection("users").doc(uid).update({
        password: hashedNewPassword,
        updatedAt: new Date(),
      });

      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("❌ Change password error:", (error as Error).message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
// ENDS