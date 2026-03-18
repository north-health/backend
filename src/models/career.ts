// CAREER

export interface Career {
  id?: string;
  uid: string;
  path: string;
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
  id: string;
  uid: string;
  career: Career;
  displayName: string;
  points: number;
}