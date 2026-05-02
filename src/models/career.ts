// CAREER

export interface Career {
  id?: string;
  uid: string;
  path: string;
  /** Firestore `career_categories` document id when learner picked from CMS categories. */
  categoryId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
// ENDS


// INSIGHT
export interface RoadmapInsight {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  position: number; 
  status: "pending" | "completed";
  dueDate: Date;
  points: number;
}
// ENDS


// COMPLETED INSIGHTS
export interface Roadmap {
  id?: string;
  uid: string;         
  careerId: string;
  insights: RoadmapInsight[]; 
  timestamp: Date;
  totalRoads: number;
  totalPoints?: number;
}
// ENDS

// LEADERBOARD
export interface LeaderboardEntry {
  uid: string;
  career: Career;
  displayName: string;
  points: number;
}
// ENDS

// CAREER CATEGORIES
export interface CareerCategory {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
// ENDS