export enum SkillLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
  EXPERT = "Expert"
}

export interface UserInputs {
  domain: string;
  skillLevel: SkillLevel;
  timeLimit: string;
  teamSize: number;
}

export interface HackathonIdea {
  projectTitle: string;
  oneLinePitch: string;
  problemStatement: string;
  targetUsers: string;
  coreFeatures: string[];
  technicalArchitecture: {
    frontend: string;
    backend: string;
    apis: string;
    database: string;
  };
  geminiUsage: string;
  developmentPlan: string[];
  monetizationPotential: string;
  futureExpansion: string;
  winningPotential: {
    score: number;
    explanation: string;
  };
}

export interface GeminiResponse {
  constraintAnalysis: string;
  ideas: HackathonIdea[];
}
