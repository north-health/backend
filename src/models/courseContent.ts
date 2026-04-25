export interface LearningTaskModel {
  id: number;
  week: string;
  title: string;
  subtitle: string;
  dueDate: string;
  difficulty: string;

  lessons: number;
  duration: string;

  gradient: string;   
  accentColor: string;

  content: string;    

  createdAt?: Date;
}

export interface UserProgress {
  userId: number;
  taskId: number;
  progress: number;
}