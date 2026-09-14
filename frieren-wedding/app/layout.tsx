import type { Metadata } from 'next';
import { coupleNames, wedding, dateLabel } from '@/lib/wedding-config';
import './globals.css';
import './enhancements.css';
import './journey-motion.css';
import './rsvp-motion.css';
export function generateMetadata():Metadata {
  const origin=process.env.SITE_ORIGIN;
  const title=`${coupleNames}的婚礼邀请函`,description=`${dateLabel}，${wedding.venue.city} · ${wedding.venue.name}。${wedding.copy.headline}`;
  const image=origin?new URL(wedding.images.share,origin).toString():undefined;
  return {title,description,icons:{icon:'/favicon.svg'},robots:{index:false,follow:false},referrer:'no-referrer',openGraph:{title,description,type:'website',locale:'zh_CN',...(origin?{url:origin}:{}),...(image?{images:[{url:image,width:600,height:600,alt:title}]}:{})},twitter:{card:'summary',title,description,...(image?{images:[image]}:{})}};
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
