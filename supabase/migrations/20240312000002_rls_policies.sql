-- RLS policies for Restaurant Journal

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.want_to_try ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_stats ENABLE ROW LEVEL SECURITY;

-- Users: read all, update own
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own row" ON public.users FOR UPDATE USING (auth.uid() = user_id);

-- Restaurants: read all, insert/update via service role or authenticated
CREATE POLICY "Restaurants are viewable by everyone" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert restaurants" ON public.restaurants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update restaurants" ON public.restaurants FOR UPDATE USING (auth.role() = 'authenticated');

-- Reviews: read all, CRUD own
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Review photos: read all, CRUD own (via review ownership)
CREATE POLICY "Review photos are viewable by everyone" ON public.review_photos FOR SELECT USING (true);
CREATE POLICY "Users can add photos to own reviews" ON public.review_photos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.reviews r WHERE r.review_id = review_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can delete photos from own reviews" ON public.review_photos FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.reviews r WHERE r.review_id = review_id AND r.user_id = auth.uid()));

-- Review likes: read all, insert/delete own
CREATE POLICY "Likes are viewable by everyone" ON public.review_likes FOR SELECT USING (true);
CREATE POLICY "Users can like reviews" ON public.review_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own likes" ON public.review_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: read all, CRUD own
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Follows: read all, insert/delete own
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Want-to-try: read all, insert/delete own
CREATE POLICY "Want-to-try is viewable by everyone" ON public.want_to_try FOR SELECT USING (true);
CREATE POLICY "Users can add to want-to-try" ON public.want_to_try FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from want-to-try" ON public.want_to_try FOR DELETE USING (auth.uid() = user_id);

-- Notifications: read/update own only
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications (read)" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Restaurant stats: read only
CREATE POLICY "Restaurant stats are viewable by everyone" ON public.restaurant_stats FOR SELECT USING (true);
