'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Check, MailCheck, ArrowRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RsvpFields, emptyDraft, formPayload, type Draft } from './rsvp-fields';
import { wedding } from '@/lib/wedding-config';
import { rsvpOpen, type RsvpRecord } from '@/lib/rsvp-domain';

const storageKey = 'frieren-wedding-receipt-v1';

function toDraft(r: RsvpRecord): Draft {
  return {
    ...r,
    guests: String(r.guests),
    stayGuests: String(r.stayGuests || 1),
    checkIn: wedding.rsvp.stayMin || '',
    checkOut: wedding.rsvp.stayMax || '',
  };
}

function focusAndReveal(element: HTMLElement | null | undefined) {
  if (!element) return;
  element.focus({ preventScroll: true });
  element.scrollIntoView({
    block: 'nearest',
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
}

export default function RsvpForm() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [consent, setConsent] = useState(false);
  const [record, setRecord] = useState<RsvpRecord | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorAttempt, setErrorAttempt] = useState(0);
  const [storageWarning, setStorageWarning] = useState(false);
  const [open, setOpen] = useState(wedding.rsvp.enabled);
  const [arrived, setArrived] = useState(false);
  const token = useRef('');
  const lock = useRef(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const errorMessage = useRef<HTMLParagraphElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const focusSuccess = useRef(false);
  const focusEditButton = useRef(false);

  useEffect(() => {
    setOpen(rsvpOpen(wedding.rsvp));
    try {
      token.current = localStorage.getItem(storageKey) || '';
    } catch {
      setStorageWarning(true);
    }
    if (!token.current) {
      setLoading(false);
      return;
    }
    fetch('/api/rsvp', {
      headers: { Authorization: `Bearer ${token.current}` },
      cache: 'no-store',
    })
      .then(async (r) => {
        const data = (await r.json()) as {
          error: string;
          record: RsvpRecord;
          records: RsvpRecord[];
        };
        if (r.ok) {
          setRecord(data.record);
          setDraft(toDraft(data.record));
        } else if (r.status !== 404) {
          setError(data.error || '无法恢复回执，请稍后刷新；不要重复登记。');
        }
      })
      .catch(() => setError('暂时无法恢复回执，请检查网络后刷新。'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (record && !editing && focusSuccess.current) {
      focusSuccess.current = false;
      focusAndReveal(successHeading.current);
    } else if (record && !editing && focusEditButton.current) {
      focusEditButton.current = false;
      focusAndReveal(editButton.current);
    }
  }, [record, editing]);

  useEffect(() => {
    if (editing) {
      focusAndReveal(form.current?.querySelector<HTMLInputElement>('input[autocomplete="name"]'));
    }
  }, [editing]);

  useEffect(() => {
    if (errorAttempt > 0 && error) {
      errorMessage.current?.focus({ preventScroll: true });
    }
  }, [error, errorAttempt]);

  function reportError(message: string) {
    setError(message);
    setErrorAttempt((attempt) => attempt + 1);
  }

  async function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current) return;
    setError('');
    if (draft.needsStay === null) {
      reportError('请选择是否需要住宿。');
      return;
    }
    if (!consent) {
      reportError('请先确认信息使用说明。');
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      if (!token.current) {
        token.current = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map((n) => n.toString(16).padStart(2, '0'))
          .join('');
        try {
          localStorage.setItem(storageKey, token.current);
        } catch {
          setStorageWarning(true);
        }
      }
      const response = await fetch('/api/rsvp', {
        method: record ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.current}`,
        },
        body: JSON.stringify({
          ...formPayload(draft, e.currentTarget),
          consent,
          website: honeypot.current?.value || '',
        }),
      });
      const data = (await response.json()) as { error: string; record: RsvpRecord };
      if (!response.ok) throw new Error(data.error || '保存失败，请稍后重试。');
      focusSuccess.current = true;
      setArrived(true);
      setRecord(data.record);
      setDraft(toDraft(data.record));
      setEditing(false);
      setConsent(false);
    } catch (e) {
      reportError(e instanceof Error ? e.message : '网络异常，请稍后重试。');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="form-paper rsvp-loading">
        <LoaderCircle size={18} className="rsvp-loader" aria-hidden="true" />
        <output className="muted">正在查看你的回信…</output>
      </div>
    );
  }

  if (record && !editing) {
    return (
      <div className={`form-paper success-panel rsvp-success${arrived ? ' is-arriving' : ''}`} aria-live="polite">
        <div className="rsvp-arrival-mark" aria-hidden="true">
          <MailCheck size={34} className="rsvp-arrival-mail" />
          <span className="rsvp-arrival-check"><Check size={14} /></span>
        </div>
        <p className="eyebrow">YOUR LETTER HAS ARRIVED</p>
        <h3 ref={successHeading} tabIndex={-1}>已收到你的回信</h3>
        <p>期待与你在{wedding.venue.name}相见。</p>
        <div className="receipt-summary">
          <span>{record.name}</span>
          <span>{record.guests} 位旅伴赴约</span>
          {record.needsStay && (
            <span>住宿需求：{record.stayGuests} 人 · {record.checkIn} 至 {record.checkOut}</span>
          )}
        </div>
        {record.needsStay && <p className="muted">住宿需求已登记，具体安排将由新人后续联系确认。</p>}
        <p className="muted">本设备保留了修改凭证，请勿分享凭证。更换设备后可联系新人协助修改。</p>
        {storageWarning && (
          <output className="notice rsvp-storage-warning">当前浏览器无法保存修改凭证，关闭页面后请联系新人修改。</output>
        )}
        {open ? (
          <Button ref={editButton} onClick={() => { setArrived(false); setEditing(true); }} variant="outline">
            修改这份回执 <ArrowRight size={14} aria-hidden="true" />
          </Button>
        ) : (
          <p className="muted">登记已结束，需要修改请联系新人。</p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <div className="form-paper">
        <h3>回信登记已结束</h3>
        <p className="muted">如需补充或修改安排，请联系新人。期待与你相聚。</p>
      </div>
    );
  }

  return (
    <form ref={form} className="form-paper rsvp-form" onSubmit={submit} aria-label="宾客回执" aria-busy={busy}>
      <div className="form-top">
        <Send size={22} aria-hidden="true" />
        <div>
          <h3>{editing ? '修改你的回信' : '亲爱的旅伴，你会来吗？'}</h3>
          <p className="muted">留下一点信息，让我们好好准备这次相聚。</p>
        </div>
      </div>
      <RsvpFields value={draft} onChange={setDraft} disabled={busy} />
      <div className="honeypot" aria-hidden="true">
        <label>Website<input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="consent-row">
        <Checkbox
          id="privacy-consent"
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          disabled={busy}
          aria-invalid={(error === '请先确认信息使用说明。' && !consent) || undefined}
          aria-describedby={error === '请先确认信息使用说明。' && !consent ? 'rsvp-error' : undefined}
        />
        <label htmlFor="privacy-consent">我确认以上信息仅用于本次婚礼联络与住宿安排，且仅管理人员可见。</label>
      </div>
      {error && (
        <p key={errorAttempt} ref={errorMessage} id="rsvp-error" className="form-error" role="alert" tabIndex={-1}>
          {error}
        </p>
      )}
      <Button type="submit" className="submit-button" disabled={busy} data-sending={busy || undefined}>
        <Send size={16} className="rsvp-send-icon" aria-hidden="true" />
        <span aria-live="polite">{busy ? '正在寄出回信…' : editing ? '保存修改' : '寄出我的回信'}</span>
        {busy ? <LoaderCircle size={16} className="rsvp-loader" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
      </Button>
      {editing && (
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => {
            focusEditButton.current = true;
            setDraft(toDraft(record!));
            setEditing(false);
            setError('');
          }}
        >
          取消修改
        </Button>
      )}
    </form>
  );
}
