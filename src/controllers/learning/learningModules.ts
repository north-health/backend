import { Request, Response } from "express";
import { db } from "../../config/firebase/firebase";
import {
  LearningModule,
  ModuleContentBody,
} from "../../models/learningModule";

const COLLECTION = "learning_modules";

function singleParam(
  p: string | string[] | undefined
): string | undefined {
  if (p == null) return undefined;
  return Array.isArray(p) ? p[0] : p;
}

type AuthRequest = Request & { user?: { id: string; role: string } };

async function categoryExists(categoryId: string): Promise<boolean> {
  const snap = await db.collection("career_categories").doc(categoryId).get();
  return snap.exists;
}

function asTuple2(g: unknown): [string, string] | null {
  if (!Array.isArray(g) || g.length !== 2) return null;
  if (typeof g[0] !== "string" || typeof g[1] !== "string") return null;
  return [g[0], g[1]];
}

function normalizeContent(raw: unknown): ModuleContentBody | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  if (!Array.isArray(c.topics) /* length checked by validator */) return null;
  const topics = c.topics.filter((x) => typeof x === "string") as string[];
  const explanations =
    typeof c.explanations === "string" ? c.explanations : "";
  const examples = Array.isArray(c.examples)
    ? (c.examples.filter((x) => typeof x === "string") as string[])
    : [];
  const keyTakeaways = Array.isArray(c.keyTakeaways)
    ? (c.keyTakeaways.filter((x) => typeof x === "string") as string[])
    : [];
  const practiceProjects = Array.isArray(c.practiceProjects)
    ? (c.practiceProjects.filter((x) => typeof x === "string") as string[])
    : [];
  return {
    topics,
    explanations,
    examples,
    keyTakeaways,
    practiceProjects,
  };
}

// POST /api/learning/modules  (admin)
export const createLearningModule = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    const {
      categoryId,
      sortOrder,
      week,
      title,
      subtitle,
      dueDate,
      difficulty,
      gradient,
      accentColor,
      lessons,
      duration,
      content,
    } = req.body;

    if (!(await categoryExists(String(categoryId).trim()))) {
      return res.status(400).json({ message: "Unknown categoryId" });
    }

    const g = asTuple2(gradient);
    if (!g) {
      return res.status(400).json({ message: "Invalid gradient" });
    }

    const bodyContent = normalizeContent(content);
    if (!bodyContent) {
      return res.status(400).json({ message: "Invalid content" });
    }

    const now = new Date();
    const doc: LearningModule = {
      categoryId: String(categoryId).trim(),
      sortOrder: Number(sortOrder),
      week: String(week).trim(),
      title: String(title).trim(),
      subtitle: String(subtitle).trim(),
      dueDate: String(dueDate).trim(),
      difficulty: String(difficulty).trim(),
      gradient: g,
      accentColor: String(accentColor).trim(),
      lessons: Number(lessons),
      duration: String(duration).trim(),
      content: bodyContent,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(COLLECTION).add(doc);

    return res.status(201).json({
      message: "Learning module created",
      id: ref.id,
      data: doc,
    });
  } catch (error) {
    console.error("createLearningModule:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/learning/modules/:id  (admin)
export const updateLearningModule = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    const id = singleParam(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Module id is required" });
    }

    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ message: "Module not found" });
    }

    const current = existing.data() as LearningModule;
    const baseContent: ModuleContentBody = current.content ?? {
      topics: [],
      explanations: "",
      examples: [],
      keyTakeaways: [],
      practiceProjects: [],
    };
    const patch = req.body as Record<string, unknown>;

    const allowedTop = [
      "categoryId",
      "sortOrder",
      "week",
      "title",
      "subtitle",
      "dueDate",
      "difficulty",
      "gradient",
      "accentColor",
      "lessons",
      "duration",
      "content",
    ] as const;

    const hasAny = allowedTop.some((k) => patch[k] !== undefined);
    if (!hasAny) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const next: Partial<LearningModule> = {
      updatedAt: new Date(),
    };

    if (patch.categoryId !== undefined) {
      const cid = String(patch.categoryId).trim();
      if (!(await categoryExists(cid))) {
        return res.status(400).json({ message: "Unknown categoryId" });
      }
      next.categoryId = cid;
    }
    if (patch.sortOrder !== undefined) next.sortOrder = Number(patch.sortOrder);
    if (patch.week !== undefined) next.week = String(patch.week).trim();
    if (patch.title !== undefined) next.title = String(patch.title).trim();
    if (patch.subtitle !== undefined)
      next.subtitle = String(patch.subtitle).trim();
    if (patch.dueDate !== undefined)
      next.dueDate = String(patch.dueDate).trim();
    if (patch.difficulty !== undefined)
      next.difficulty = String(patch.difficulty).trim();
    if (patch.gradient !== undefined) {
      const g = asTuple2(patch.gradient);
      if (!g) {
        return res.status(400).json({ message: "Invalid gradient" });
      }
      next.gradient = g;
    }
    if (patch.accentColor !== undefined)
      next.accentColor = String(patch.accentColor).trim();
    if (patch.lessons !== undefined) next.lessons = Number(patch.lessons);
    if (patch.duration !== undefined)
      next.duration = String(patch.duration).trim();

    if (patch.content !== undefined) {
      const mergedContent: ModuleContentBody = { ...baseContent };
      const p = patch.content as Record<string, unknown>;
      if (p.topics !== undefined) {
        if (!Array.isArray(p.topics)) {
          return res.status(400).json({ message: "content.topics invalid" });
        }
        mergedContent.topics = p.topics.filter(
          (x) => typeof x === "string"
        ) as string[];
      }
      if (p.explanations !== undefined) {
        if (typeof p.explanations !== "string") {
          return res.status(400).json({ message: "content.explanations invalid" });
        }
        mergedContent.explanations = p.explanations;
      }
      if (p.examples !== undefined) {
        if (!Array.isArray(p.examples)) {
          return res.status(400).json({ message: "content.examples invalid" });
        }
        mergedContent.examples = p.examples.filter(
          (x) => typeof x === "string"
        ) as string[];
      }
      if (p.keyTakeaways !== undefined) {
        if (!Array.isArray(p.keyTakeaways)) {
          return res
            .status(400)
            .json({ message: "content.keyTakeaways invalid" });
        }
        mergedContent.keyTakeaways = p.keyTakeaways.filter(
          (x) => typeof x === "string"
        ) as string[];
      }
      if (p.practiceProjects !== undefined) {
        if (!Array.isArray(p.practiceProjects)) {
          return res
            .status(400)
            .json({ message: "content.practiceProjects invalid" });
        }
        mergedContent.practiceProjects = p.practiceProjects.filter(
          (x) => typeof x === "string"
        ) as string[];
      }
      next.content = mergedContent;
    }

    await ref.update(next);

    const updated = await ref.get();
    return res.status(200).json({
      message: "Learning module updated",
      id,
      data: { id, ...(updated.data() as LearningModule) },
    });
  } catch (error) {
    console.error("updateLearningModule:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/learning/modules/:id  (admin)
export const deleteLearningModule = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    const id = singleParam(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Module id is required" });
    }

    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ message: "Module not found" });
    }

    await ref.delete();

    return res.status(200).json({
      message: "Learning module deleted",
      id,
    });
  } catch (error) {
    console.error("deleteLearningModule:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/learning/modules/category/:categoryId  (public — mobile + CMS read)
export const listLearningModulesByCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const categoryIdRaw = singleParam(req.params.categoryId);
    if (!categoryIdRaw?.trim()) {
      return res.status(400).json({ message: "categoryId is required" });
    }
    const categoryKey = categoryIdRaw.trim();

    const snap = await db
      .collection(COLLECTION)
      .where("categoryId", "==", categoryKey)
      .get();

    type Row = LearningModule & { id: string };
    const rows: Row[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as LearningModule),
    }));

    rows.sort((a, b) => {
      const oa = a.sortOrder ?? 0;
      const ob = b.sortOrder ?? 0;
      if (oa !== ob) return oa - ob;
      const ca = a.createdAt
        ? new Date(a.createdAt as Date).getTime()
        : 0;
      const cb = b.createdAt
        ? new Date(b.createdAt as Date).getTime()
        : 0;
      return ca - cb;
    });

    return res.status(200).json({
      message: "Learning modules fetched",
      count: rows.length,
      categoryId: categoryKey,
      data: rows,
    });
  } catch (error) {
    console.error("listLearningModulesByCategory:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/learning/modules/:id  (public)
export const getLearningModuleById = async (req: Request, res: Response) => {
  try {
    const id = singleParam(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Module id is required" });
    }

    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Module not found" });
    }

    return res.status(200).json({
      message: "Learning module fetched",
      data: {
        id: doc.id,
        ...(doc.data() as LearningModule),
      },
    });
  } catch (error) {
    console.error("getLearningModuleById:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
