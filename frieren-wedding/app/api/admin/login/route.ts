import { createAdminSession,verifyAdminPassword } from '@/lib/admin-auth';
import { adminRedirect } from '@/lib/admin-settings';
export async function POST(request:Request){const form=await request.formData(),username=String(form.get('username')||''),password=String(form.get('password')||'');if(!verifyAdminPassword(username,password))return adminRedirect(true);await createAdminSession(username);return adminRedirect();}
