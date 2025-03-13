import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'user');

    if (error) {
      throw error;
    }

    if (data.length > 0) {
      res.status(200).json({ message: 'User table exists.' });
    } else {
      res.status(404).json({ message: 'User table does not exist.' });
    }
  } catch (error) {
    console.error('Error checking user table:', error.message);
    res.status(500).json({ error: 'Error checking user table: ' + error.message });
  }
}
