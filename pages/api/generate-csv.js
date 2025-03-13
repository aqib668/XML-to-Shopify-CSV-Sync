import { createClient } from '@supabase/supabase-js';
// ...existing code...

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key are required.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureUserTableExists() {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_name', 'users');

  if (error) {
    throw new Error('Error checking for user table: ' + error.message);
  }

  if (data.length === 0) {
    const { error: createError } = await supabase.rpc('create_user_table');
    if (createError) {
      throw new Error('Error creating user table: ' + createError.message);
    }
  }
}

// Call the function to ensure the user table exists
ensureUserTableExists().catch(console.error);

// Ensure that the supabaseKey is not used in a way that causes discrepancies between server and client rendering
// For example, avoid using it directly in the render method or in a way that changes between server and client

// ...existing code...
