/*
  # Add INSERT policy for user_profiles

  ## Changes
  - Add policy to allow profile creation during signup
  - This ensures the trigger can create profiles properly

  ## Security
  - Only allows inserting your own profile (matching auth.uid())
  - Prevents users from creating profiles for other users
*/

-- Drop policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Add INSERT policy for user profiles
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
