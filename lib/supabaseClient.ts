
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vviulzonozhfammwkego.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aXVsem9ub3poZmFtbXdrZWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxODk1MjQsImV4cCI6MjA4Mzc2NTUyNH0.tTdQETfZ7697z8oBKOJrXjxl0u0SUIVnUD_IrgwwlvU';

export const supabase = createClient(supabaseUrl, supabaseKey);
