'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { coupleNames, dateLabel, wedding } from '@/lib/wedding-config';

export default function WelcomeLetter() {
  const [open, setOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attempt = useRef(0);
  const [destination, setDestination] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const initialFrame = requestAnimationFrame(() => {
      try { if (!location.hash && !sessionStorage.getItem('wedding-letter-opened')) setOpen(true); }
      catch { /* The invitation remains usable without browser storage. */ }
    });
    const replay = () => {
      attempt.current++;
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      opener.current = document.querySelector<HTMLElement>('.chapter-toggle');
      setDestination(null); setPreparing(false); setOpen(true);
    };
    addEventListener('wedding-replay-envelope', replay);
    return () => { attempt.current++; cancelAnimationFrame(initialFrame); removeEventListener('wedding-replay-envelope', replay); if (timer.current) clearTimeout(timer.current); };
  }, []);
  function remember() {
    try { sessionStorage.setItem('wedding-letter-opened', '1'); } catch { /* Device-local preference only. */ }
  }
  function dismiss() {
    attempt.current++;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setDestination(null);
    setOpen(false);
    setPreparing(false);
    remember();
  }
  function unwrap(target: string) {
    if (preparing || timer.current) return;
    const run = ++attempt.current;
    setDestination(target);
    setPreparing(true);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let started = false;
    const unfold = () => {
      if (started || attempt.current !== run) return;
      started = true;
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      setPreparing(false);
      remember();
      setOpen(false);
    };
    // At most 2 s preparing + 350 ms fading the existing invitation away.
    // Image decoding is asynchronous; a slow or failed image never traps guests.
    timer.current = setTimeout(unfold, reduced ? 0 : 2000);
    const hero = document.querySelector<HTMLImageElement>('.hero-art img');
    if (hero) void hero.decode().then(unfold, unfold);
    else unfold();
  }
  return <Dialog open={open} onOpenChange={value => { if (!value) dismiss(); }} onOpenChangeComplete={isOpen => {
    if (isOpen) return;
    const target = destination;
    if (target) {
      const element = document.getElementById(target);
      element?.setAttribute('tabindex', '-1');
      element?.focus({ preventScroll: true });
      element?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      window.dispatchEvent(new Event('wedding-music-start'));
    }
  }}>
    <DialogContent className={`welcome-letter animated-envelope${preparing ? ' is-preparing' : ''}`} aria-busy={preparing} finalFocus={destination ? false : () => opener.current?.isConnected ? opener.current : document.querySelector<HTMLElement>('.open-letter-link')}>
      <img src={wedding.images.envelope} alt="蓝白花草与旅行手记旁，一封带蓝色星光封蜡的邀请信"/>
      <div className="envelope-light" aria-hidden="true"/>
      <div className="welcome-text"><p className="eyebrow">A LETTER FOR OUR COMPANIONS</p><DialogTitle>{coupleNames}</DialogTitle><DialogDescription>{dateLabel} · 一封写给你的婚礼邀请</DialogDescription></div>
      <button type="button" className="envelope-open-area" aria-label="点按信封，打开邀请" disabled={preparing} onClick={() => unwrap('top')}/>
      <div className="welcome-actions">
        <Button onClick={() => unwrap('top')} disabled={preparing}><span aria-live="polite">{preparing ? '正在打开…' : '打开这封邀请'}</span><ArrowRight size={15}/></Button>
      </div>
    </DialogContent>
  </Dialog>;
}
