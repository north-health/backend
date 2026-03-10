// CAREER

export interface Career {
  id?: number;
  uid: number;
  path: string;
  createdAt?: Date;
  updatedAt?: Date;
}
// ENDS


// INSIGHT
export interface RoadmapInsight {
  id: number;
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
  id?: number;
  uid: number;         
  careerId: number;
  insights: RoadmapInsight[]; 
  timestamp: Date;
  totalRoads: number;
  totalPoints?: number;
}
// ENDS

// LEADERBOARD
export interface LeaderboardEntry {
  id: number;
  uid: number;
  career: Career;
  displayName: string;
  points: number;
}