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
  age: number;
  bio: string;
  distance_km: number;
  interests: string[];
  photos: ProfilePhoto[];
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
  match?: {
    id: string;
    status: string;
    created_at: string;
  };
  chat?: {
    id: string;
    status: string;
    created_at: string;
  };
}

// --- Matches & Chat Types ---

export interface MatchItem {
  match_id: string;
  chat_id: string;
  matched_at: string;
  has_conversation: boolean;
  last_message?: {
    content: string;
    message_type: 'text' | 'image' | 'voice';
    sent_at: string;
    sender_user_id: string;
  };
  matched_user: {
    user_id: string;
    full_name: string;
    age: number;
    profile_picture?: ProfilePhoto;
  };
}

export interface ChatConversation {
  chat_id: string;
  match_id: string;
  status_code: string;
  created_at: string;
  updated_at: string;
  matched_user_id: string;
  matched_user_name: string;
  matched_user_photo_url: string;
}

export interface ChatMessage {
  message_id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'voice';
  is_read: boolean;
  created_at: string;
  media_url?: string;
}

export interface UploadMediaResponse {
  media_url: string;
  media_type: 'image' | 'voice';
}

// --- Safety & Report Types ---

export interface ReportUserRequest {
  reason: string;
  details?: string;
}

export interface BlockedUserItem {
  user_id: string;
  full_name: string;
  blocked_at: string;
}
