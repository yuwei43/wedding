export type WeddingEvent = { id: string; title: string; time: string | null; description: string; enabled: boolean };
export type WeddingConfig = {
  couple: { groom: string; bride: string }; date: string; timezone: 'Asia/Shanghai'; dinnerTime: string | null;
  venue: { name: string; city: string; address: string; navigationUrl: string; traffic: string; parking: string; rainPlan: string };
  contact: { name: string; phone: string } | null;
  copy: { headline: string; introduction: string[]; closing: string; outdoor: string; sections: { letter: string; reflections: string; calendar: string; journey: string; companions: string; venue: string; guide: string; rsvp: string } };
  reflections: { title: string; text: string }[];
  guestGuide: { question: string; answer: string }[];
  events: WeddingEvent[]; images: { hero: string; celebration: string; companions: string; night: string; share: string; envelope:string };
  music: { enabled: boolean; src: string; title: string; artist: string; volume: number; startOnFirstInteraction: boolean }; rsvp: { enabled: boolean; deadline: string | null; stayMin: string | null; stayMax: string | null };
};
export const wedding: WeddingConfig = {
  couple: { groom: '肖禹', bride: '陈雨晴' }, date: '2026-10-24', timezone: 'Asia/Shanghai', dinnerTime: null,
  venue: { name: '初元', city: '福州', address: '福州市鼓楼区华侨新村36号', navigationUrl: '', traffic: '', parking: '', rainPlan: '' }, contact: null,
  copy: { headline: '下一段旅程，邀请你同行。', introduction: ['我们决定，把往后的日常写进同一段旅程。', '这个十月，想邀请你来到福州，', '在风与草木之间相聚，留下合照，共享晚宴。', '肖禹与陈雨晴，期待与你见面。'], closing: '故事还在继续，很高兴这一页有你。', outdoor: '活动包含户外环节，具体安排以新人通知为准。', sections: { letter: '写给同行的你', reflections: '旅途中，想与你分享', calendar: '把这一天，留给相聚', journey: '这一天的旅程', companions: '旅伴们，也来见证这一页', venue: '循着风，来见面', guide: '出发前的小小指南', rsvp: '寄一封，赴约的回信' } },
  reflections: [
    { title: '关于时间', text: '重要的不是旅程有多长，而是一起度过的每一刻。' },
    { title: '关于同行', text: '有人并肩看过平凡的风景，日常也会拥有魔法。' },
    { title: '关于此后', text: '从这一天起，我们将继续分享四季，也继续向远方出发。' },
  ],
  guestGuide: [
    { question: '什么时候到场？', answer: '游园、合照与晚宴的具体时间仍在准备中，确认后会在这里更新，也会由新人另行通知。' },
    { question: '可以带同行人或小朋友吗？', answer: '可以在回执中填写出席总人数，请把填写人、同行人和儿童都计算在内。' },
    { question: '需要住宿怎么办？', answer: '在回执中选择“需要住宿”并登记人数与日期，我们会在安排确认后单独联系你。' },
  ],
  events: [
    { id: 'arrival', title: '到场相聚', time: '15:30', description: '来到初元，领取今天的好心情', enabled: true },
    { id: 'garden', title: '游园时光', time: null, description: '在草木之间走走，与朋友聊聊', enabled: true },
    { id: 'photo', title: '合照留念', time: null, description: '把此刻的笑容，留作旅途纪念', enabled: true },
    { id: 'ceremony', title: '婚礼仪式', time: null, description: '见证我们共同的约定', enabled: false },
    { id: 'dinner', title: '共进晚宴', time: null, description: '围坐相聚，共享这一晚', enabled: true },
  ],
  images: { hero: '/images/frieren-himmel-hero-blue.png', celebration: '/images/companions-snow-blue.png', companions: '/images/companions-flower-circle-blue.png', night: '/images/frieren-himmel-night.webp', share: '/og-share-envelope.jpg', envelope:'/images/envelope-blue.webp' },
  music: { enabled: true, src: '/audio/frieren-main-theme.mp3', title: 'New Friends and Old Faces', artist: 'Evan Call', volume: 0.32, startOnFirstInteraction: true }, rsvp: { enabled: true, deadline: null, stayMin: '2026-10-24', stayMax: '2026-10-25' },
};
export const coupleNames = `${wedding.couple.groom} & ${wedding.couple.bride}`;
export const dateLabel = wedding.date.replaceAll('-', '.');
export const venueLabel = `${wedding.venue.name} · ${wedding.venue.address}`;
// Let Amap attempt its native app; the invitation remains in its original tab.
export const navigationUrl = wedding.venue.navigationUrl || `https://uri.amap.com/search?${new URLSearchParams({
  keyword: wedding.venue.address,
  city: wedding.venue.city,
  view: 'map',
  src: 'wedding',
  callnative: '1',
})}`;
