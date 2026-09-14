import { clearAdminSession } from '@/lib/admin-auth';
import { adminRedirect } from '@/lib/admin-settings';
export async function POST(){await clearAdminSession();return adminRedirect();}
