'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BedDouble, BookOpen, Clock3, Compass, Expand, RotateCcw, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { wedding } from '@/lib/wedding-config';

const chapters = [
  { id: 'top', title: '邀请封面', number: '序' },
  { id: 'letter', title: '写给你的信', number: '01' },
  { id: 'reflections', title: '旅途中的心意', number: '02' },
  { id: 'details', title: '相聚的日子', number: '03' },
  { id: 'journey', title: '当天的安排', number: '04' },
  { id: 'companions', title: '我们的旅伴', number: '05' },
  { id: 'venue', title: '找到我们', number: '06' },
  { id: 'guide', title: '出发前的指南', number: '07' },
  { id: 'rsvp', title: '寄出你的回信', number: '08' },
];

export function JourneyNavigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('top');
  const [pending, setPending] = useState<string | null>(null);
  const progress = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const sections = chapters.map(chapter => document.getElementById(chapter.id));
    const update = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - innerHeight;
      const amount = range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0;
      progress.current?.style.setProperty('transform', `scaleX(${amount})`);
      let current = 'top';
      sections.forEach((section, i) => {
        if (section && section.getBoundingClientRect().top <= innerHeight * 0.36) current = chapters[i].id;
      });
      setActive(current);
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(queue);
    resize.observe(document.documentElement);
    update();
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); removeEventListener('scroll', queue); removeEventListener('resize', queue); };
  }, []);
  const current = chapters.find(chapter => chapter.id === active) || chapters[0];
  return <>
    <div className="journey-progress" aria-hidden="true"><span ref={progress}/></div>
    <Dialog open={open} onOpenChange={value => { setPending(null); setOpen(value); }} onOpenChangeComplete={isOpen => {
      if (isOpen || !pending) return;
      const target = pending;
      if (target === 'replay') { window.dispatchEvent(new Event('wedding-replay-envelope')); return; }
      const section = document.getElementById(target);
      section?.setAttribute('tabindex', '-1');
      section?.focus({ preventScroll: true });
      section?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      history.replaceState(null, '', `#${target}`);
    }}>
      <nav className="floating-nav journey-nav" aria-label="婚礼快捷入口">
        <DialogTrigger className="chapter-toggle" aria-label={`打开旅程目录，当前：${current.title}`}><Compass size={17}/><span>旅程目录</span><small aria-hidden="true">{current.number}</small></DialogTrigger>
        <a href="#details" aria-current={active === 'details' ? 'location' : undefined}>婚礼信息</a>
        <a href="#rsvp" aria-current={active === 'rsvp' ? 'location' : undefined}>填写回执 <ArrowUpRight size={14}/></a>
      </nav>
      <DialogContent className="chapter-dialog" finalFocus={pending ? false : undefined}>
        <p className="eyebrow">OUR LITTLE JOURNEY</p>
        <DialogTitle>这一页，想先去哪里</DialogTitle>
        <DialogDescription>从一封信，到我们相聚的那一天。</DialogDescription>
        <div className="chapter-links">{chapters.map(chapter => <a key={chapter.id} href={`#${chapter.id}`} aria-current={active === chapter.id ? 'location' : undefined} onClick={event => {
          event.preventDefault(); setPending(chapter.id); setOpen(false);
        }}><span>{chapter.number}</span><b>{chapter.title}</b><ArrowUpRight size={16}/></a>)}</div>
        <button className="replay-letter" type="button" onClick={() => { setPending('replay'); setOpen(false); }}><RotateCcw size={14}/>再打开一次邀请信</button>
      </DialogContent>
    </Dialog>
  </>;
}

type PhotoProps = { src: string; alt: string; width: number; height: number; title: string };
export function MemoryPhoto({ src, alt, width, height, title }: PhotoProps) {
  return <Dialog>
    <DialogTrigger className="memory-photo" aria-label={`放大查看：${title}`}>
      <img src={src} alt={alt} width={width} height={height} loading="lazy"/>
      <span className="photo-hint"><Expand size={14}/><span>放大这一刻</span></span>
    </DialogTrigger>
    <DialogContent className="memory-dialog">
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription className="sr-only">{alt}。按 Escape 或关闭按钮返回邀请函。</DialogDescription>
      <div className="memory-full-image"><img src={src} alt={alt} width={width} height={height}/></div>
      <p className="memory-caption"><BookOpen size={14}/>把这一刻，留在旅途中</p>
    </DialogContent>
  </Dialog>;
}

export function GuestGuide() {
  return <Accordion className="guide-grid interactive-guide" multiple defaultValue={['0']}>
    {wedding.guestGuide.map((item, i) => {
      const Icon = [Clock3, Users, BedDouble][i % 3];
      return <AccordionItem className="guide-card reveal" key={item.question} value={String(i)}>
        <AccordionTrigger className="guide-trigger">
          <span className="guide-question"><Icon size={22}/><span className="guide-number">0{i + 1}</span><span className="guide-title">{item.question}</span></span>
        </AccordionTrigger>
        <AccordionContent className="guide-answer"><p>{item.answer}</p>{i === 2 && <a className="guide-rsvp-link" href="#rsvp">在回执里登记住宿 <ArrowUpRight size={14}/></a>}</AccordionContent>
      </AccordionItem>;
    })}
  </Accordion>;
}
