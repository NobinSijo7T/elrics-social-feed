-- Add bio column to profiles table for the Edit Profile feature.
-- bio is optional (nullable), max 160 characters to match the UI constraint.
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS bio TEXT CHECK (char_length(bio) <= 160);
