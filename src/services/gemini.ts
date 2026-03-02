import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse, UserInputs, HackathonIdea } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateHackathonIdeas(inputs: UserInputs): Promise<GeminiResponse> {
  const prompt = `
    You are an elite hackathon mentor, startup strategist, and product architect.
    Generate exactly 3 distinct, highly innovative, practical, and hackathon-winning project ideas based on these constraints:
    
    Domain: ${inputs.domain}
    Skill Level: ${inputs.skillLevel}
    Time Limit: ${inputs.timeLimit}
    Team Size: ${inputs.teamSize}

    Instructions:
    1. Avoid generic or overused ideas.
    2. Ensure feasibility within the given time limit.
    3. Match technical complexity to skill level.
    4. Prioritize creativity, real-world relevance, and innovation.
    5. CRITICAL: For the second idea, you MUST include 2-3 additional highly specific and innovative core features that align deeply with the problem statement and target users. These should be "game-changer" features that would make the project stand out in a competitive hackathon.
    6. For the 'winningPotential.explanation', provide a highly specific analysis for each idea. 
    7. SPECIAL INSTRUCTION FOR THE SECOND IDEA: The 'winningPotential.explanation' for the SECOND idea must be exceptionally detailed. It should directly reference how its specific features and technical architecture (frontend, backend, APIs) contribute to its competitiveness and judge appeal. Highlight unique aspects, potential impact, and why this specific combination of tech and features makes it a top-tier contender.
    
    Before generating the ideas, provide a brief analysis of the constraints and explain your reasoning in 4-5 lines.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          constraintAnalysis: {
            type: Type.STRING,
            description: "A 4-5 line analysis of the constraints and reasoning."
          },
          ideas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                projectTitle: { type: Type.STRING },
                oneLinePitch: { type: Type.STRING },
                problemStatement: { type: Type.STRING },
                targetUsers: { type: Type.STRING },
                coreFeatures: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                technicalArchitecture: {
                  type: Type.OBJECT,
                  properties: {
                    frontend: { type: Type.STRING },
                    backend: { type: Type.STRING },
                    apis: { type: Type.STRING },
                    database: { type: Type.STRING }
                  },
                  required: ["frontend", "backend", "apis", "database"]
                },
                geminiUsage: { type: Type.STRING },
                developmentPlan: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                monetizationPotential: { type: Type.STRING },
                futureExpansion: { type: Type.STRING },
                winningPotential: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    explanation: { 
                      type: Type.STRING,
                      description: "A highly specific analysis of how the features and architecture contribute to the idea's competitiveness and judge appeal."
                    }
                  },
                  required: ["score", "explanation"]
                }
              },
              required: [
                "projectTitle", "oneLinePitch", "problemStatement", "targetUsers", 
                "coreFeatures", "technicalArchitecture", "geminiUsage", 
                "developmentPlan", "monetizationPotential", "futureExpansion", 
                "winningPotential"
              ]
            }
          }
        },
        required: ["constraintAnalysis", "ideas"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as GeminiResponse;
}

export async function refineIdeaFeatures(idea: HackathonIdea): Promise<string[]> {
  const prompt = `
    You are an elite hackathon mentor. I have a project idea:
    Title: ${idea.projectTitle}
    Problem: ${idea.problemStatement}
    Current Features: ${idea.coreFeatures.join(", ")}

    Add 2-3 more highly specific, innovative, and "game-changing" core features to this idea.
    Ensure they align perfectly with the problem statement and target users.
    Return ONLY a JSON array of strings representing the new features.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text || "[]") as string[];
}
