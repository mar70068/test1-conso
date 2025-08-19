// supabaseClient.ts
//
// This file exports a configured Supabase client instance. It reads
// the project URL and public (publishable) key from Vite environment
// variables. Both variables should be defined in your `.env` or
// `.env.local` file using the `VITE_` prefix so that Vite exposes
// them at build time. See the Supabase documentation for details.

import { createClient } from '@supabase/supabase-js';

// Grab the Supabase credentials from the Vite environment. When
// deploying or running locally, define these in `.env.local`:
//
// VITE_SUPABASE_URL=https://your-project-ref.supabase.co
// VITE_SUPABASE_PUBLISHABLE_KEY=public-anon-key
//
// The `as string` assertions ensure the values are typed correctly.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// Create a single client for interacting with your Supabase project.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
