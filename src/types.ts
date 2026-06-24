export type LevelType = '1.0-2.0' | '2.5' | '3.0' | '3.5' | '4.0';

export interface Student {
  id: string;
  name: string;
  avatar: string;
  level: LevelType;
  joiningDate: string;
  isPublic: boolean; // Coach decides what to publish
  skills: Record<string, number>; // rating 1 to 5 for initial 16 skills + others
  targetGoal: string;
  notes: string;
  phone: string;
  email: string;
  nationality?: string;
  dominantHand?: 'Trái' | 'Phải' | string;
}

export interface CurriculumSkill {
  id: string;
  name: string;
  category: 'Basics' | 'Dink & Soft' | 'Hard Drives' | 'Defense & Reset' | 'Tactics & Footwork';
  descriptionVI: string;
  descriptionEN: string;
}

export interface LessonPlan {
  id: string;
  titleVI: string;
  titleEN: string;
  descriptionVI: string;
  descriptionEN: string;
  skillsFocused: string[]; // references of skill names/ids
  durationMin: number;
  isPublic: boolean;
}

export interface Session {
  id: string;
  studentId: string;
  date: string;
  lessonPlanId: string;
  title: string;
  durationMin: number;
  notes: string;
  status: 'Scheduled' | 'Completed';
  skillScores: Record<string, number>; // scale 1-5 scored in this session
  isPublic: boolean;
  coachFeedbackVI: string;
  coachFeedbackEN: string;
  location?: string;
}

export interface NotificationItem {
  id: string;
  titleVI: string;
  titleEN: string;
  contentVI: string;
  contentEN: string;
  date: string;
  type: 'info' | 'success' | 'warning';
  isPublic: boolean;
}

export interface CoachProfile {
  name: string;
  avatar: string;
  slogan: string;
  aboutVI: string;
  aboutEN: string;
  coursesVI: { title: string; desc: string; price: string }[];
  coursesEN: { title: string; desc: string; price: string }[];
  youtubeYoutIds: string[]; // Youtube Video Embed Identifiers
  photos: string[]; // Base64 or elegant pickleball URLs
  courts?: string;
}

