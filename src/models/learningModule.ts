/**
 * Rich module body — matches (and extends) the mobile `ModuleContent` shape.
 */
export interface ModuleContentBody {
  topics: string[];
  explanations: string;
  examples: string[];
  keyTakeaways: string[];
  practiceProjects: string[];
}

/**
 * One learning module under a career category (`career_categories` doc id).
 */
export interface LearningModule {
  categoryId: string;
  sortOrder: number;
  week: string;
  title: string;
  subtitle: string;
  /** Empty string = self-paced (no instructor due date). */
  dueDate: string;
  difficulty: string;
  gradient: [string, string];
  accentColor: string;
  lessons: number;
  duration: string;
  content: ModuleContentBody;
  createdAt?: Date;
  updatedAt?: Date;
}
