export interface UserSettings {
  theme: "dark" | "light";
  autoplayTrailers: boolean;
  language: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  settings: UserSettings;
}

export interface UserMediaItem {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  watchedAt?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("movieflix_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function signUp(name: string, email: string, password: string) {
  return request<{ token: string; user: UserProfile }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function signIn(email: string, password: string) {
  return request<{ token: string; user: UserProfile }>("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return request<UserProfile>("/user/me");
}

export async function getFavorites() {
  return request<UserMediaItem[]>("/user/favorites");
}

export async function addFavorite(item: UserMediaItem) {
  return request<UserMediaItem[]>("/user/favorites", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function removeFavorite(tmdbId: number, mediaType: "movie" | "tv") {
  return request<UserMediaItem[]>(`/user/favorites/${mediaType}/${tmdbId}`, {
    method: "DELETE",
  });
}

export async function getHistory() {
  return request<UserMediaItem[]>("/user/history");
}

export async function addHistory(item: UserMediaItem) {
  return request<UserMediaItem[]>("/user/history", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function updateSettings(payload: Partial<UserSettings> & { name?: string }) {
  return request<UserProfile>("/user/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
