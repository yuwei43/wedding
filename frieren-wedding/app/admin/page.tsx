import { getChatGPTUser,chatGPTSignInPath as chatgptSignInPath } from '@/app/chatgpt-auth';
import { isAdmin } from '@/lib/server';
import AdminDashboard from '@/components/admin-dashboard';
export const dynamic='force-dynamic';
export default async function Admin(){const user=await getChatGPTUser();if(!user)return <main className="admin-gate"><p className="eyebrow">FOR THE HOSTS</p><h1>婚礼回信管理</h1><p>仅限新人管理账号。登录后仍需验证管理权限。</p><a className="primary-link" href={chatgptSignInPath('/admin')} target="_top">登录管理账号</a><a href="/">返回邀请函</a></main>;if(!await isAdmin())return <main className="admin-gate"><h1>暂无管理权限</h1><p>当前账号未被授权管理宾客信息。请使用已配置的新人账号。</p><a href="/">返回邀请函</a></main>;return <AdminDashboard/>;}
