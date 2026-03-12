export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type NotificationType = "follow" | "like" | "comment" | "share" | "list_invite";

export interface User {
  user_id: string;
  name: string | null;
  email: string | null;
  profile_photo: string | null;
  bio: string | null;
  join_date: string;
}

export interface Restaurant {
  restaurant_id: string;
  name: string;
  latitude: number;
  longitude: number;
  cuisine_type: string | null;
  google_place_id: string;
  address: string | null;
  created_at: string;
}

export interface Review {
  review_id: string;
  user_id: string;
  restaurant_id: string;
  rating: number;
  review_text: string | null;
  visit_date: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  restaurant?: Restaurant;
  review_photos?: ReviewPhoto[];
  review_likes?: ReviewLike[];
  like_count?: number;
  comment_count?: number;
}

export interface ReviewPhoto {
  photo_id: string;
  review_id: string;
  image_url: string;
  created_at: string;
}

export interface ReviewLike {
  user_id: string;
  review_id: string;
  created_at: string;
}

export interface Comment {
  comment_id: string;
  user_id: string;
  review_id: string;
  comment_text: string;
  created_at: string;
  user?: User;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface WantToTry {
  user_id: string;
  restaurant_id: string;
  created_at: string;
  restaurant?: Restaurant;
}

export interface Notification {
  notification_id: string;
  user_id: string;
  type: NotificationType;
  reference_id: string | null;
  created_at: string;
  is_read: boolean;
}

export interface RestaurantStats {
  restaurant_id: string;
  avg_rating: number | null;
  review_count: number;
  updated_at: string;
}
