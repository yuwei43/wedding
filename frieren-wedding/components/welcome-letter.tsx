'use client';
import { useEffect,useState } from 'react';
import { Dialog,DialogContent,DialogTitle,DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { coupleNames,dateLabel,wedding } from '@/lib/wedding-config';
export default function WelcomeLetter(){const [open,setOpen]=useState(false);useEffect(()=>{try{if(!location.hash&&!sessionStorage.getItem('wedding-letter-opened'))setOpen(true);}catch{/* Progressive enhancement only. */}},[]);
  function close(){setOpen(false);window.dispatchEvent(new Event('wedding-music-start'));try{sessionStorage.setItem('wedding-letter-opened','1');}catch{/* preference only */}}
  return <Dialog open={open} onOpenChange={v=>{if(!v)close();}}><DialogContent className="welcome-letter" showCloseButton={false}><img src={wedding.images.envelope} alt="蓝白花草与旅行手记旁，一封带蓝色星光封蜡的邀请信"/><div className="welcome-text"><p className="eyebrow">A LETTER FOR OUR COMPANIONS</p><DialogTitle>{coupleNames}</DialogTitle><DialogDescription>{dateLabel} · 一封写给你的婚礼邀请</DialogDescription></div><div className="welcome-actions"><Button onClick={close}>打开这封邀请 <ArrowRight size={15}/></Button><Button variant="ghost" onClick={()=>{close();requestAnimationFrame(()=>document.getElementById('details')?.scrollIntoView());}}>直接查看婚礼信息</Button></div></DialogContent></Dialog>;
}
