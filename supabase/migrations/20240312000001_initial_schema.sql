-- Restaurant Journal: Initial schema per PRD
-- Run in Supabase SQL Editor or via: supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (synced from auth.users via trigger)
CREATE TABLE public.users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  profile_photo TEXT,
  bio TEXT,
  join_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Restaurants (from Google Places)
CREATE TABLE public.restaurants (
  restaurant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  cuisine_type TEXT,
  google_place_id TEXT UNIQUE NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_restaurants_google_place_id ON public.restaurants(google_place_id);
CREATE INDEX idx_restaurants_location ON public.restaurants(latitude, longitude);

-- Reviews
CREATE TABLE public.reviews (
  review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(restaurant_id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review_text TEXT,
  visit_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_reviews_restaurant ON public.reviews(restaurant_id);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- Review photos
CREATE TABLE public.review_photos (
  photo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES public.reviews(review_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_photos_review ON public.review_photos(review_id);

-- Review likes
CREATE TABLE public.review_likes (
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES public.reviews(review_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, review_id)
);

CREATE INDEX idx_review_likes_review ON public.review_likes(review_id);

-- Comments on reviews (required for social features)
CREATE TABLE public.comments (
  comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES public.reviews(review_id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_review ON public.comments(review_id);

-- Follows
CREATE TABLE public.follows (
  follower_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_following ON public.follows(following_id);

-- Want-to-try list
CREATE TABLE public.want_to_try (
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(restaurant_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, restaurant_id)
);

CREATE INDEX idx_want_to_try_user ON public.want_to_try(user_id);

-- Notifications
CREATE TYPE notification_type AS ENUM ('follow', 'like', 'comment', 'share', 'list_invite');

CREATE TABLE public.notifications (
  notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Restaurant stats (denormalized for performance)
CREATE TABLE public.restaurant_stats (
  restaurant_id UUID PRIMARY KEY REFERENCES public.restaurants(restaurant_id) ON DELETE CASCADE,
  avg_rating NUMERIC(3,2),
  review_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, name, email, profile_photo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: update reviews.updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger: refresh restaurant_stats on review insert/update/delete
CREATE OR REPLACE FUNCTION public.refresh_restaurant_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.restaurant_stats
    SET
      avg_rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE restaurant_id = OLD.restaurant_id),
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE restaurant_id = OLD.restaurant_id),
      updated_at = NOW()
    WHERE restaurant_id = OLD.restaurant_id;
    RETURN OLD;
  ELSE
    UPDATE public.restaurant_stats
    SET
      avg_rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE restaurant_id = NEW.restaurant_id),
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE restaurant_id = NEW.restaurant_id),
      updated_at = NOW()
    WHERE restaurant_id = NEW.restaurant_id;
    IF NOT FOUND THEN
      INSERT INTO public.restaurant_stats (restaurant_id, avg_rating, review_count, updated_at)
      SELECT NEW.restaurant_id, ROUND(AVG(rating)::numeric, 2), COUNT(*), NOW()
      FROM public.reviews WHERE restaurant_id = NEW.restaurant_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_stats_insert
  AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.refresh_restaurant_stats();
CREATE TRIGGER review_stats_update
  AFTER UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.refresh_restaurant_stats();
CREATE TRIGGER review_stats_delete
  AFTER DELETE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.refresh_restaurant_stats();

-- Storage bucket for review photos (run in Dashboard or add via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('review-photos', 'review-photos', true);
