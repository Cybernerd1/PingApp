/**
 * Ping Shared API Types & Data Envelopes
 * Standard API envelope: { status: 'success' | 'error', message: string, data: T }
 */

// --- Base Envelope Shapes ---

export interface ApiSuccessEnvelope<T = any> {
  status: 'success';
  message: string;
  data: T;
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'NOT_IMPLEMENTED'
  | 'NETWORK_ERROR';

export interface ApiErrorEnvelope {
  status: 'error';
  code: ApiErrorCode;
  message: string;
  details?: string | Record<string, string>;
  /** HTTP status, added client-side for branching on 404/409 etc. */
  httpStatus?: number;
}

export type ApiResponse<T = any> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

// Helper guard
export function isApiError<T>(res: ApiResponse<T>): res is ApiErrorEnvelope {
  return res.status === 'error';
}

// --- Auth Types ---

export type PreferredChallenge = 'EMAIL_OTP' | 'SMS_OTP';

export interface SignupRequest {
  username: string;
  preferred_challenge: PreferredChallenge;
}

export interface VerifyOtpRequest {
  username: string;
  otp: string;
  challenge_name: PreferredChallenge;
  session?: string;
}

export interface AuthTokenData {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expires_in: number;
  profile_exists?: boolean;
  /** True for the shared demo/test account. */
  is_demo?: boolean;
}

export interface PasswordLoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  id_token: string;
}

export interface AppleAuthRequest {
  identity_token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// --- Profile Types ---

/** Must match pingbckd users.gender enum. */
export type GenderType = 'male' | 'female' | 'non-binary' | 'other' | 'prefer_not_to_say';
/** Must match pingbckd preferences VALID_GENDERS. */
export type PreferenceGenderType = 'male' | 'female' | 'non-binary' | 'everyone';

export interface CreateProfileRequest {
  full_name: string;
  phone?: string;
  email?: string;
  birthdate: string;
  gender: GenderType;
  bio?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  email?: string;
  birthdate?: string;
  gender?: GenderType;
  bio?: string;
}

export interface VerifyLoginInfoRequest {
  otp: string;
  session: string;
}

export interface ProfilePhoto {
  photo_id: string;
  photo_url: string;
  is_profile_picture?: boolean;
  order?: number;
}

export interface UserProfile {
  user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  birthdate?: string | null;
  age?: number | null;
  gender?: GenderType | null;
  bio?: string | null;
  interests?: string[];
  photos?: ProfilePhoto[];
  onboarding_step?: 'profile' | 'interests' | 'photos' | 'preferences' | 'completed';
  onboarding_completed?: boolean;
  /** Shared demo/test account (email + password sign-in). */
  is_demo?: boolean;
  created_at?: string;
}

export interface ProfileDataExport {
  export_url: string;
  expires_at: string;
}

// --- Interest Types ---

export interface MasterInterest {
  id: string;
  name: string;
  category: string;
}

export interface SaveInterestsRequest {
  interest_ids: string[];
}

// --- Dating Preference Types ---

export interface DatingPreferences {
  interested_in: PreferenceGenderType[];
  min_age: number;
  max_age: number;
  max_distance_km: number;
}

// --- Privacy Settings Types ---

export interface PrivacySettings {
  show_distance: boolean;
  show_age: boolean;
  show_online_status: boolean;
  profile_visible_in_discover: boolean;
}

// --- Location Types ---

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

// --- Discover & Candidate Types ---

export interface DiscoverCandidate {
  user_id: string;
  full_name: string;
  /** null when the user hides their age */
  age: number | null;
  gender?: GenderType | null;
  bio: string | null;
  /** null when either side has no location or the user hides distance */
  distance_km: number | null;
  interests: string[];
  photos: { photo_id: string | null; photo_url: string }[];
}

// --- Interaction Types ---

export type SwipeAction = 'like' | 'dislike';

export interface SwipeRequest {
  user_id: string;
  action: SwipeAction;
}

export interface SwipeResponseData {
  liked_user_id: string;
  is_match: boolean;
  like_id: string;
  match: { id?: string; status?: string; created_at?: string };
  chat: { id?: string; status?: string; created_at?: string };
}

// --- Matches & Chat Types ---

export type MessageType = 'text' | 'image' | 'voice';

export interface LastMessage {
  content: string;
  message_type: MessageType;
  sent_at: string;
  sender_user_id: string;
}

export interface MatchItem {
  match_id: string;
  chat_id: string | null;
  matched_at: string;
  has_conversation: boolean;
  last_message: LastMessage | null;
  matched_user: {
    user_id: string;
    full_name: string;
    age: number | null;
    profile_picture: { photo_id: string | null; photo_url: string } | null;
  };
}

export interface ChatConversation {
  chat_id: string;
  match_id: string | null;
  status_code: string;
  created_at: string;
  updated_at: string;
  matched_user_id: string;
  matched_user_name: string;
  matched_user_photo_url: string | null;
  last_message: LastMessage | null;
}

export interface ChatMessage {
  message_id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  is_read: boolean;
  created_at: string;
  media_url?: string | null;
  /** client-only: optimistic message waiting for the server echo */
  pending?: boolean;
}

export interface UploadMediaResponse {
  media_url: string;
  media_type: 'image' | 'voice';
}

// --- Safety & Report Types ---

/** Must match pingbckd safety.controller VALID_REASONS. */
export type ReportReason =
  | 'spam'
  | 'inappropriate_content'
  | 'harassment'
  | 'fake_profile'
  | 'underage'
  | 'hate_speech'
  | 'other';

export interface ReportUserRequest {
  reason: ReportReason;
  details?: string;
}

export interface BlockedUserItem {
  user_id: string;
  full_name: string;
  profile_picture: string | null;
  blocked_at: string;
}

// ── Ping Assistant ─────────────────────────────────────────────────────
export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  /** Client-only: optimistic message not yet saved. */
  pending?: boolean;
}

export interface AssistantHistory {
  messages: AssistantMessage[];
  /** False when the server has no OPENROUTER_API_KEY (built-in replies only). */
  ai_enabled: boolean;
}

export interface AssistantReply {
  message: AssistantMessage;
  reply: AssistantMessage;
  source: 'openrouter' | 'fallback';
}
