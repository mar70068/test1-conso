import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffadogifwezsmtldvfiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmYWRvZ2lmd2V6c210bGR2Zml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTQ0NzUsImV4cCI6MjA2MzgzMDQ3NX0.OMeuZxxmM0xT0P_p4P_8IJUdHzH0nlNN0Yl90RfJpq4';

export const supabase = createClient(supabaseUrl, supabaseKey);
