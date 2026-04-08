// V-Interview API Client
// Centralized API functions for communicating with the Django backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers,
  });

  // Handle non-JSON responses (e.g. 204 No Content)
  const contentType = response.headers.get("content-type");
  let data: any;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = {};
  }

  if (!response.ok) {
    // Extract error message from Django REST responses
    const errorMessage =
      data?.error ||
      data?.detail ||
      data?.non_field_errors?.[0] ||
      Object.values(data || {})
        .flat()
        .join(", ") ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

// ─── Interview Types ──────────────────────────────────────────────────────────

export interface GenerateQuestionsPayload {
  jobTitle: string;
  experienceLevel: string;
  skills: string[];
  industry: string;
  language: string;
  positionType: string;
  certifications: string[];
  preferredTechnologies: string[];
  softSkills: string[];
}

export interface GeneratedQuestion {
  questionID: number;
  questionText: string;
  difficulty: string;
  order: number;
}

export interface GenerateQuestionsResponse {
  success: boolean;
  entryID: number;
  questionsGenerated: number;
  questions: GeneratedQuestion[];
}

export interface SubmitAnswerItem {
  questionID: number;
  answerText: string;
  timeSpent: number | null;
}

export interface SubmitAnswersResponse {
  success: boolean;
  message: string;
  resultID: number;
  overallScore: number;
}

export interface QuestionScore {
  question_number: number;
  score: number;
  feedback: string;
}

export interface InterviewResultsResponse {
  success: boolean;
  interview: {
    entryID: number;
    jobTitle: string;
    experienceLevel: string;
    completedAt: string;
  };
  results: {
    overallScore: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    questionScores: QuestionScore[];
  };
  questionsAndAnswers: {
    questionID: number;
    questionText: string;
    difficulty: string;
    answerText: string;
    timeSpent: number | null;
  }[];
}

export interface InterviewHistoryEntry {
  entryID: number;
  jobTitle: string;
  experienceLevel: string;
  industry: string;
  createdAt: string;
  questionCount: number;
  status: "completed" | "pending";
  results?: {
    overallScore: number;
    completedAt: string;
  };
}

export interface InterviewHistoryResponse {
  success: boolean;
  history: InterviewHistoryEntry[];
}

export interface UserEntry {
  entryID: number;
  jobTitle: string;
  experienceLevel: string;
  industry: string;
  createdAt: string;
  questionCount: number;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export async function signUp(data: {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("auth/signup/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function signIn(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("auth/signin/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function signOut(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("auth/signout/", {
    method: "POST",
  });
}

// ─── Profile API ──────────────────────────────────────────────────────────────

export async function getProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>("auth/profile/");
}

export async function updateProfile(
  data: Partial<UserProfile>
): Promise<{ message: string; user: UserProfile }> {
  return apiRequest<{ message: string; user: UserProfile }>(
    "auth/profile/update/",
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteProfile(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("auth/profile/delete/", {
    method: "DELETE",
  });
}

// ─── Interview API ────────────────────────────────────────────────────────────

export async function generateQuestions(
  data: GenerateQuestionsPayload
): Promise<GenerateQuestionsResponse> {
  return apiRequest<GenerateQuestionsResponse>("ai/generate-questions/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getUserEntries(): Promise<{
  success: boolean;
  entries: UserEntry[];
}> {
  return apiRequest<{ success: boolean; entries: UserEntry[] }>(
    "ai/user-entries/"
  );
}

export async function submitAnswers(
  entryId: number,
  answers: SubmitAnswerItem[]
): Promise<SubmitAnswersResponse> {
  return apiRequest<SubmitAnswersResponse>(
    `ai/interviews/${entryId}/submit-answers/`,
    {
      method: "POST",
      body: JSON.stringify({ answers }),
    }
  );
}

export async function getInterviewResults(
  entryId: number
): Promise<InterviewResultsResponse> {
  return apiRequest<InterviewResultsResponse>(
    `ai/interviews/${entryId}/results/`
  );
}

export async function getInterviewHistory(): Promise<InterviewHistoryResponse> {
  return apiRequest<InterviewHistoryResponse>("ai/interview-history/");
}
