import { Request, Response } from "express";
import { db } from "../../config/firebase/firebase";

type AuthRequest = Request & {
  user?: { id: string };
};

function timestampMs(value: unknown): number {
  if (value == null) return 0;
  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis: () => number }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return 0;
}

/** GET /api/career/me — latest career row for the authenticated user */
export const getMyCareer = async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.id;
    if (!uid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const snapshot = await db.collection("careers").where("uid", "==", uid).get();

    if (snapshot.empty) {
      return res.status(200).json({ message: "No career", data: null });
    }

    let bestDoc = snapshot.docs[0]!;
    let bestTime = -1;

    for (const doc of snapshot.docs) {
      const row = doc.data();
      const t = Math.max(
        timestampMs(row.updatedAt),
        timestampMs(row.createdAt)
      );
      if (t >= bestTime) {
        bestTime = t;
        bestDoc = doc;
      }
    }

    const d = bestDoc.data();
    const pathStr = String(d.path ?? "").trim();
    const rawCat = d.categoryId;
    const categoryId =
      rawCat != null && String(rawCat).trim()
        ? String(rawCat).trim()
        : null;

    return res.status(200).json({
      message: "Career fetched",
      data: {
        id: bestDoc.id,
        uid: String(d.uid ?? uid),
        path: pathStr,
        categoryId,
      },
    });
  } catch (error) {
    console.error("getMyCareer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
