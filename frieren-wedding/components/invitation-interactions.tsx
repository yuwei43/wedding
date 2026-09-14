'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Check, Copy, Music2, VolumeX } from 'lucide-react';
import { wedding, venueLabel } from '@/lib/wedding-config';
import { dayMessage } from '@/lib/rsvp-domain';
import { Button } from '@/components/ui/button';

export function OpenLetter() {
  const [opened, setOpened] = useState(false);
  return <a href="#letter" className="primary-link open-letter-link" onClick={() => {
    setOpened(true);
    window.dispatchEvent(new Event('wedding-music-start'));
    window.dispatchEvent(new Event('wedding-letter-open'));
  }}><span>{opened ? '一起走进这段旅程' : '打开这封邀请'}</span><ArrowDown size={16}/></a>;
}

export function Countdown() {
  const [text, setText] = useState('期待与你相聚');
  useEffect(() => {
    const update = () => setText(dayMessage(wedding.date));
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);
  return <p className="countdown" aria-live="polite"><span aria-hidden="true">✧</span><span>{text}</span><span aria-hidden="true">✧</span></p>;
}

export function CopyAddress() {
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);
  return <><Button variant="outline" className="copy-address" onClick={async () => {
    try {
      await navigator.clipboard.writeText(venueLabel);
      setCopied(true);
      setMessage('地址已复制，出发时见');
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => { setCopied(false); setMessage(''); }, 3200);
    } catch {
      setMessage('无法自动复制，请长按上方地址复制。');
    }
  }}>{copied ? <Check size={14}/> : <Copy size={14}/>}<span>{copied ? '已复制' : '复制地址'}</span></Button><output className="copy-message">{message}</output></>;
}

export function Motion() {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    const animate = (element: Element, index = 0) => {
      if (preference.matches) return;
      const animation = element.animate([
        { opacity: 0, transform: 'translateY(24px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 850, delay: index * 110, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    };
    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        element.classList.add('is-visible');
        // Animate siblings individually while keeping content available before hydration.
        const children = element.matches('.letter')
          ? element.querySelectorAll('.eyebrow, h2, .letter-lines p, .signature, .small-label')
          : element.matches('.reflections-copy')
            ? element.querySelectorAll('.eyebrow, h2, .reflection-intro, .reflection-list article')
            : [];
        if (children.length) children.forEach((child, i) => animate(child, Math.min(i, 4)));
        else animate(element);
        reveal.unobserve(element);
      }
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => reveal.observe(element));
    const hero = document.querySelector<HTMLElement>('.hero');
    const art = hero?.querySelector<HTMLElement>('.hero-art img');
    let frame = 0;
    const scroll = () => {
      if (frame || preference.matches) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!hero || !art || document.hidden) return;
        const bounds = hero.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < innerHeight) {
          art.style.setProperty('--hero-drift', `${Math.max(-22, Math.min(22, -bounds.top * 0.06))}px`);
        }
      });
    };
    const enter = () => {
      document.querySelectorAll('.hero-copy > *').forEach((element, i) => animate(element, Math.min(i, 4)));
    };
    const opened = () => {
      const letter = document.querySelector('.letter');
      if (letter && !preference.matches) {
        const animation = letter.animate([{ filter: 'brightness(1.12)' }, { filter: 'brightness(1)' }], { duration: 1100 });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    };
    const reset = () => {
      if (preference.matches) {
        animations.forEach(animation => animation.cancel());
        animations.clear();
        art?.style.removeProperty('--hero-drift');
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    enter();
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('wedding-invitation-opened', enter);
    addEventListener('wedding-letter-open', opened);
    preference.addEventListener('change', reset);
    return () => {
      reveal.disconnect();
      cancelAnimationFrame(frame);
      animations.forEach(animation => animation.cancel());
      art?.style.removeProperty('--hero-drift');
      removeEventListener('scroll', scroll);
      removeEventListener('wedding-invitation-opened', enter);
      removeEventListener('wedding-letter-open', opened);
      preference.removeEventListener('change', reset);
    };
  }, []);
  return null;
}

export function SparkleTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    type Particle = { x: number; y: number; vx: number; vy: number; age: number; lifetime: number; size: number; rotation: number };
    let particles: Particle[] = [], frame = 0, previousTime = 0;
    let lastPoint: { x: number; y: number } | null = null;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (time: number) => {
      frame = 0;
      const delta = Math.min(previousTime ? time - previousTime : 16, 40);
      previousTime = time;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      particles = particles.filter(p => p.age < p.lifetime);
      for (const p of particles) {
        p.age += delta;
        p.x += p.vx * delta / 16;
        p.y += p.vy * delta / 16;
        const alpha = Math.max(0, 1 - p.age / p.lifetime);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation + p.age * 0.0005);
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = '#a7d6f0';
        ctx.shadowColor = '#d6f0ff';
        ctx.shadowBlur = 7;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const radius = i % 2 ? p.size * 0.22 : p.size;
          const x = Math.cos(i * Math.PI / 4) * radius;
          const y = Math.sin(i * Math.PI / 4) * radius;
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.closePath(); ctx.fill(); ctx.restore();
      }
      if (particles.length) frame = requestAnimationFrame(draw);
      else previousTime = 0;
    };
    const add = (x: number, y: number, count: number, burst = false) => {
      if (preference.matches || document.hidden) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push({ x, y, vx: Math.cos(angle) * (burst ? 1.6 : 0.25), vy: Math.sin(angle) * (burst ? 1.6 : 0.25) - 0.2,
          age: 0, lifetime: 1100 + Math.random() * 700, size: 2 + Math.random() * (burst ? 4 : 2), rotation: angle });
      }
      if (particles.length > 110) particles.splice(0, particles.length - 110);
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      if (!event.isPrimary) return;
      const distance = lastPoint ? Math.hypot(event.clientX - lastPoint.x, event.clientY - lastPoint.y) : 0;
      if (lastPoint && distance < 8) return;
      const steps = Math.min(6, Math.max(1, Math.floor(distance / 12)));
      for (let i = 1; i <= steps; i++) {
        const x = lastPoint ? lastPoint.x + (event.clientX - lastPoint.x) * i / steps : event.clientX;
        const y = lastPoint ? lastPoint.y + (event.clientY - lastPoint.y) * i / steps : event.clientY;
        add(x, y, 2);
      }
      lastPoint = { x: event.clientX, y: event.clientY };
    };
    const down = (event: PointerEvent) => { if (event.isPrimary) add(event.clientX, event.clientY, 16, true); };
    const end = () => { lastPoint = null; };
    const stop = () => {
      if (!document.hidden && !preference.matches) return;
      cancelAnimationFrame(frame); frame = 0; previousTime = 0; particles = []; lastPoint = null;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    resize();
    addEventListener('resize', resize);
    addEventListener('pointermove', move, { passive: true });
    addEventListener('pointerdown', down, { passive: true });
    addEventListener('pointercancel', end);
    addEventListener('pointerup', end);
    addEventListener('blur', end);
    document.addEventListener('visibilitychange', stop);
    preference.addEventListener('change', stop);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('resize', resize); removeEventListener('pointermove', move); removeEventListener('pointerdown', down);
      removeEventListener('pointercancel', end); removeEventListener('pointerup', end); removeEventListener('blur', end);
      document.removeEventListener('visibilitychange', stop); preference.removeEventListener('change', stop);
    };
  }, []);
  return <canvas ref={canvasRef} className="sparkle-trail" aria-hidden="true"/>;
}

export function MusicToggle() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false), [error, setError] = useState('');
  const manuallyPaused = useRef(false);
  useEffect(() => {
    if (audio.current) audio.current.volume = Math.min(1, Math.max(0, wedding.music.volume));
    const start = () => {
      if (!manuallyPaused.current) audio.current?.play().catch(() => setError('点击音乐按钮即可播放'));
    };
    window.addEventListener('wedding-music-start', start);
    return () => window.removeEventListener('wedding-music-start', start);
  }, []);
  if (!wedding.music.enabled || !wedding.music.src) return null;
  return <div className="music-control" data-playing={playing}>
    <div className="music-caption"><span>{playing ? 'NOW PLAYING' : 'PLAY THE THEME'}</span><b>{wedding.music.title}</b><small>{wedding.music.artist}</small></div>
    <audio ref={audio} src={wedding.music.src} preload="none" loop playsInline onPause={() => setPlaying(false)} onPlay={() => { setPlaying(true); setError(''); }} onError={() => { setPlaying(false); setError('音乐暂不可用，请稍后重试'); }}/>
    <Button variant="outline" size="icon" aria-label={playing ? '暂停背景音乐' : '播放背景音乐'} aria-pressed={playing} onClick={async () => {
      setError('');
      if (playing) { manuallyPaused.current = true; audio.current?.pause(); return; }
      manuallyPaused.current = false;
      try { await audio.current?.play(); } catch { setError('请再次点击播放音乐'); }
    }}>{playing ? <VolumeX/> : <Music2/>}<span className="music-bars" aria-hidden="true"><i/><i/><i/></span></Button>
    {error && <output className="music-error">{error}</output>}
  </div>;
}
