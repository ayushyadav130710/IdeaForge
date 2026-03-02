import {GeminiResponse, HackathonIdea, UserInputs} from '../types';

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: string;
  fieldErrors?: Record<string, string>;
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let parsed: ApiSuccess<T> | ApiError | null = null;

  if (raw) {
    try {
      parsed = JSON.parse(raw) as ApiSuccess<T> | ApiError;
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const errorMessage = parsed && 'error' in parsed ? parsed.error : 'Request failed.';
    throw new Error(errorMessage);
  }

  if (!parsed || !('success' in parsed) || !parsed.success || !('data' in parsed)) {
    throw new Error('Invalid server response.');
  }

  return parsed.data;
}

export async function generateHackathonIdeas(inputs: UserInputs): Promise<GeminiResponse> {
  return postJson<GeminiResponse>('/api/generate-ideas', inputs);
}

export async function refineIdeaFeatures(idea: HackathonIdea): Promise<string[]> {
  return postJson<string[]>('/api/refine-features', {idea});
}
