import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sqvqssdsrpdfvfxcnwwa.supabase.co";
const supabaseKey = "sb_publishable_HfHYwaCI4kEPGWTtPIpvBw_96WL_UPu";

export const supabase = createClient(supabaseUrl, supabaseKey);