import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://pocijnvpsxivxvvzfiev.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvY2lqbnZwc3hpdnh2dnpmaWV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU2Njc3NSwiZXhwIjoyMDk4MTQyNzc1fQ.SYZASZn6MPMIZ8jJpa3_dNLOIoHi_Uqp7snii9RWjIM"

export const supabase = createClient(supabaseUrl, supabaseKey)
