import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tzimqnzapunmqpihnxsa.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aW1xbnphcHVubXFwaWhueHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTYzNTYsImV4cCI6MjA1NjQzMjM1Nn0.2RZkK5fy0CxUHCnEPy3GyPOIul8HMU3DNQQV2AkDq2E';

// Create a browser client for client-side usage
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey); 