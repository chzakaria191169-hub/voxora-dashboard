import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Send, Inbox, Settings,
  Cpu, Zap, BarChart2, TrendingUp, Activity, Bot,
  ChevronDown, Search, RefreshCw, Filter, Tag, Mail, X, Clock, Building2,
  ExternalLink, Globe, Briefcase, Target, ChevronRight, CheckCircle2, Circle, Terminal, Trash2, Paperclip, MapPin, Bell
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, ArcElement,
  Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Bubble, Doughnut } from 'react-chartjs-2';
import './index.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, ArcElement, Title, Tooltip, Legend);

/* ═══════════════════════════════════════════════════════════
   VOXORA AI NETWORK CANVAS — exact DNA from voxora.agency
   ═══════════════════════════════════════════════════════════ */
function AINetworkCanvas() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height, nodes;

    const NODE_COUNT = 80;
    const MAX_DIST = 160;
    const MOUSE_RADIUS = 220;

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    function createNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.8,
        color: Math.random() > 0.5 ? '139,92,246' : '6,182,212',
        pulse: Math.random() * Math.PI * 2,
      }));
    }

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);

      // Atmospheric glow orbs — like voxora.agency
      const g1 = ctx.createRadialGradient(width * 0.75, height * 0.2, 0, width * 0.75, height * 0.2, 500);
      g1.addColorStop(0, 'rgba(139,92,246,0.07)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, width, height);

      const g2 = ctx.createRadialGradient(width * 0.1, height * 0.8, 0, width * 0.1, height * 0.8, 400);
      g2.addColorStop(0, 'rgba(6,182,212,0.05)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, width, height);

      // Update + draw nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.018;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Mouse repel
        const dx = n.x - mouse.current.x;
        const dy = n.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          n.vx += (dx / dist) * force * 0.25;
          n.vy += (dy / dist) * force * 0.25;
        }

        // Speed limit
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > 1.2) { n.vx = (n.vx / speed) * 1.2; n.vy = (n.vy / speed) * 1.2; }

        // Pulse size
        const r = n.radius + Math.sin(n.pulse) * 0.6;
        const alpha = 0.45 + Math.sin(n.pulse) * 0.25;

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color},${alpha})`;
        ctx.fill();
      });

      // Draw connections with gradient lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.22;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(drawFrame);
    }

    resize();
    createNodes();
    drawFrame();

    const handleResize = () => { resize(); createNodes(); };
    const handleMouse = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="canvas-bg" />;
}

/* ═══════════════════════════════════════════════════════════
   SPOTLIGHT CARD — Premium Web3/SaaS hover effect
   ═══════════════════════════════════════════════════════════ */
function SpotlightCard({ children, className = '', style = {} }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, opacity: 1 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPos(p => ({ ...p, opacity: 0 }));
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: pos.opacity,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          background: `radial-gradient(350px circle at ${pos.x}px ${pos.y}px, rgba(139,92,246,0.12), transparent 70%)`,
          zIndex: 1,
          borderRadius: 'inherit',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CYBER SCRAMBLE TEXT — Hacker decode effect
   ═══════════════════════════════════════════════════════════ */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*![]{}';
function CyberScramble({ text, trigger = 0, duration = 900 }) {
  const [display, setDisplay] = useState(text);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!text) return;
    let start = Date.now();
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const resolved = Math.floor(progress * text.length);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        if (i < resolved || text[i] === ' ') {
          out += text[i];
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplay(out);
      if (progress >= 1) {
        clearInterval(intervalRef.current);
        setDisplay(text);
      }
    }, 30);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [text, trigger, duration]);

  return <span style={{ fontFamily: 'monospace' }}>{display}</span>;
}

/* ═══════════════════════════════════════════════════════════
   BRAIN FEED TERMINAL — The Voxora AI Operations Log
   ═══════════════════════════════════════════════════════════ */
const BRAIN_MESSAGES = [
  { tag: 'AI Engine', color: '#8b5cf6', msg: 'Scraping and analyzing 2,500 new targets from Apollo.io...' },
  { tag: 'SMTP Router', color: '#06b6d4', msg: 'Dispatching cold email batch via Inbox #7 — vox-outreach-07@...' },
  { tag: 'Outbound', color: '#8b5cf6', msg: 'Sent 1,420 automated follow-ups across 20 inboxes.' },
  { tag: 'Reply AI', color: '#10b981', msg: 'Detected 3 positive replies. Routing to Unified Inbox...' },
  { tag: 'AI Engine', color: '#8b5cf6', msg: 'Niche scoring complete: Healthcare SaaS — Match Score 94%' },
  { tag: 'Scheduler', color: '#f59e0b', msg: 'Follow-up sequence queued for 847 leads at 09:00 UTC.' },
  { tag: 'Guardian', color: '#ef4444', msg: 'Bounce detected: contact@oldomain.net — auto-archived.' },
  { tag: 'Scraper', color: '#06b6d4', msg: 'LinkedIn profile enrichment: 120 leads updated with job titles.' },
  { tag: 'AI Engine', color: '#8b5cf6', msg: 'Subject line A/B test: Variant B +22% open rate. Switching...' },
  { tag: 'Outbound', color: '#8b5cf6', msg: 'Campaign #3 running. 2,141 emails delivered. 0 spam flags.' },
  { tag: 'Reply AI', color: '#10b981', msg: 'Positive intent flagged: "Can we schedule a call?" — SAAS NICHE' },
  { tag: 'Watchdog', color: '#f59e0b', msg: 'SMTP health check passed: 20/20 inboxes active. Warmup: 99.8%' },
  { tag: 'AI Engine', color: '#8b5cf6', msg: 'Personalisation tokens injected: 2,500 emails — 100% unique.' },
  { tag: 'Scraper', color: '#06b6d4', msg: 'New niche unlocked: Logistics Plus — 380 validated leads ready.' },
];

function BrainFeed() {
  const [lines, setLines] = useState([]);
  const [msgIdx, setMsgIdx] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Add initial lines
    const initial = BRAIN_MESSAGES.slice(0, 4).map((m, i) => ({
      ...m, id: i, ts: new Date(Date.now() - (4 - i) * 8000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), scramble: 0
    }));
    setLines(initial);
    setMsgIdx(4);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => {
        const idx = prev % BRAIN_MESSAGES.length;
        const newLine = {
          ...BRAIN_MESSAGES[idx],
          id: Date.now(),
          ts: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          scramble: Date.now(),
        };
        setLines(l => [...l.slice(-12), newLine]);
        return prev + 1;
      });
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="brain-feed">
      <div className="brain-feed-header">
        <Terminal size={13} style={{ color: '#8b5cf6' }} />
        <span className="brain-feed-title">VOXORA BRAIN FEED</span>
        <span className="brain-feed-live"><span className="pulse-dot" />LIVE</span>
      </div>
      <div className="brain-feed-body" ref={scrollRef}>
        {lines.map((line) => (
          <div key={line.id} className="brain-line">
            <span className="brain-ts">{line.ts}</span>
            <span className="brain-tag" style={{ color: line.color }}>[{line.tag}]</span>
            <span className="brain-msg">
              <CyberScramble text={line.msg} trigger={line.scramble} duration={700} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LIVE SYSTEM TICKER — Continuous marquee bar
   ═══════════════════════════════════════════════════════════ */
function SystemTicker() {
  const items = [
    '/// SMTP HEALTH: 99.9%',
    '/// AI AGENTS: ONLINE',
    '/// DAILY CAPACITY: 2,500 LEADS',
    '/// OUTBOUND ENGINE: OPTIMIZED',
    '/// REPLY DETECTION: ACTIVE',
    '/// INBOX WARMUP: 98.2%',
    '/// N8N WORKFLOWS: 7 RUNNING',
    '/// SPAM SCORE: 0.02% (EXCELLENT)',
    '/// DOMAINS ACTIVE: 20',
    '/// SEQUENCES QUEUED: 847',
  ];
  const text = items.join('   ');

  return (
    <div className="system-ticker">
      <div className="ticker-track">
        <span className="ticker-content">{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3D MATRIX GLOBE — Canvas-based wireframe globe
   ═══════════════════════════════════════════════════════════ */
function MatrixGlobe() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const rotRef = useRef(0);

  const ORBIT_LABELS = [
    'Automated Outbound', 'Hyper Growth', 'AI Lead Scoring',
    'SMTP Routing', 'Global Reach', 'Cold Outreach', 'n8n Automation'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 420;
    const H = canvas.height = 420;
    const cx = W / 2, cy = H / 2, R = 130;

    // Globe points
    const latLines = 10, lngLines = 16;
    const globePts = [];
    for (let i = 0; i <= latLines; i++) {
      for (let j = 0; j <= lngLines; j++) {
        const lat = (i / latLines) * Math.PI - Math.PI / 2;
        const lng = (j / lngLines) * 2 * Math.PI;
        globePts.push({ lat, lng });
      }
    }

    // Activity dots (simulate email pings)
    const activityDots = Array.from({ length: 12 }, () => ({
      lat: (Math.random() - 0.5) * Math.PI,
      lng: Math.random() * 2 * Math.PI,
      life: Math.random(),
      speed: 0.003 + Math.random() * 0.004,
      color: Math.random() > 0.5 ? '139,92,246' : '6,182,212',
    }));

    // Orbit ring label positions
    const orbitAngleRef = { val: 0 };

    function project(lat, lng, rot) {
      const x = R * Math.cos(lat) * Math.cos(lng + rot);
      const y = R * Math.sin(lat);
      const z = R * Math.cos(lat) * Math.sin(lng + rot);
      return { x: cx + x, y: cy - y, z };
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      const rot = rotRef.current;

      // Outer glow
      const grd = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.3);
      grd.addColorStop(0, 'rgba(139,92,246,0.0)');
      grd.addColorStop(0.7, 'rgba(139,92,246,0.04)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2); ctx.fill();

      // Draw lat lines
      for (let i = 0; i <= latLines; i++) {
        const lat = (i / latLines) * Math.PI - Math.PI / 2;
        ctx.beginPath();
        let first = true;
        for (let j = 0; j <= 64; j++) {
          const lng = (j / 64) * 2 * Math.PI;
          const p = project(lat, lng, rot);
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        }
        const alpha = 0.08 + 0.04 * Math.sin(i / latLines * Math.PI);
        ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Draw lng lines
      for (let j = 0; j <= lngLines; j++) {
        const lng = (j / lngLines) * 2 * Math.PI;
        ctx.beginPath();
        let first = true;
        for (let i = 0; i <= 64; i++) {
          const lat = (i / 64) * Math.PI - Math.PI / 2;
          const p = project(lat, lng, rot);
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = 'rgba(139,92,246,0.07)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Activity dots
      activityDots.forEach(dot => {
        dot.life += dot.speed;
        if (dot.life > 1) { dot.life = 0; dot.lng = Math.random() * 2 * Math.PI; dot.lat = (Math.random() - 0.5) * Math.PI; }
        const p = project(dot.lat, dot.lng, rot);
        if (p.z > 0) {
          const alpha = 0.4 + 0.6 * Math.sin(dot.life * Math.PI);
          const r = 2 + 3 * Math.sin(dot.life * Math.PI);
          // Pulse ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${dot.color},${alpha * 0.3})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          // Core dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${dot.color},${alpha})`;
          ctx.fill();
        }
      });

      // Orbit ring with labels
      orbitAngleRef.val += 0.004;
      const orbitR = R + 30;
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(139,92,246,0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      ORBIT_LABELS.forEach((label, i) => {
        const angle = orbitAngleRef.val + (i / ORBIT_LABELS.length) * Math.PI * 2;
        const lx = cx + (orbitR + 18) * Math.cos(angle);
        const ly = cy + (orbitR + 18) * Math.sin(angle);
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(angle + Math.PI / 2);
        ctx.font = 'bold 7.5px Inter, monospace';
        ctx.fillStyle = 'rgba(139,92,246,0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, 0);
        ctx.restore();
      });

      // AI Robot icon in center (simplified SVG-like drawing)
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#8b5cf6';
      // Head
      ctx.beginPath(); ctx.roundRect(cx - 14, cy - 22, 28, 22, 6); ctx.fill();
      // Eyes
      ctx.fillStyle = '#06b6d4'; ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.arc(cx - 6, cy - 13, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 6, cy - 13, 3.5, 0, Math.PI * 2); ctx.fill();
      // Antenna
      ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.moveTo(cx, cy - 22); ctx.lineTo(cx, cy - 30);
      ctx.arc(cx, cy - 30, 2, 0, Math.PI * 2); ctx.stroke();
      // Body
      ctx.fillStyle = '#8b5cf6'; ctx.globalAlpha = 0.15;
      ctx.beginPath(); ctx.roundRect(cx - 18, cy + 2, 36, 20, 5); ctx.fill();
      ctx.restore();

      rotRef.current += 0.004;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="matrix-globe-wrap">
      <canvas ref={canvasRef} className="matrix-globe-canvas" width="420" height="420" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════ */
function AnimCounter({ value, loading }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (loading || !value || value === 0 || isNaN(value)) { setN(value || 0); return; }
    let cur = 0; const step = value / 60;
    const t = setInterval(() => { cur += step; if (cur >= value) { setN(value); clearInterval(t); } else setN(Math.floor(cur)); }, 16);
    return () => clearInterval(t);
  }, [value, loading]);
  if (loading) return <div className="skeleton" style={{ width: 60, height: 36 }} />;
  return <>{n}</>;
}

/* ═══════════════════════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════════════════════ */
function StatusBadge({ status }) {
  const map = {
    new: 'new',
    cold_email_sent: 'sent',
    follow_up_1_sent: 'followup',
    follow_up_2_sent: 'followup',
    follow_up_3_sent: 'followup',
    replied: 'replied',
    archived: 'archived',
    bounced: 'bounced',
    sent: 'sent',
    followup_1: 'followup',
    followup_2: 'followup',
    followup_3: 'followup',
    interested: 'interested',
    meeting_booked: 'meeting_booked',
  };
  const cls = map[status] || 'new';
  const labels = {
    new: 'New',
    cold_email_sent: 'Cold Email',
    follow_up_1_sent: 'Follow-up 1',
    follow_up_2_sent: 'Follow-up 2',
    follow_up_3_sent: 'Follow-up 3',
    replied: 'Replied',
    archived: 'Archived',
    bounced: 'Bounced',
    sent: 'Sent',
    followup_1: 'Follow-up 1',
    followup_2: 'Follow-up 2',
    followup_3: 'Follow-up 3',
    interested: 'Interested',
    meeting_booked: 'Meeting Booked',
  };
  return <span className={`status-badge badge-${cls}`}><span className="status-dot" />{labels[status] || status?.replace(/_/g, ' ')}</span>;
}

/* ═══════════════════════════════════════════════════════════
   CAMPAIGN SELECTOR DROPDOWN
   ═══════════════════════════════════════════════════════════ */
function CampaignSelector({ campaigns, selectedId, onSelect, loading }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = campaigns.find(c => c.id === selectedId);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) return <div className="skeleton" style={{ width: 200, height: 32, borderRadius: 8 }} />;

  return (
    <div className="campaign-selector" ref={ref}>
      <button className="campaign-selector__btn" onClick={() => setOpen(!open)}>
        <span className="campaign-selector__dot" />
        <span>{selected ? `Campaign #${selected.id} · ${selected.name}` : 'Select Campaign'}</span>
        <ChevronDown size={13} style={{ marginLeft: 'auto', opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="campaign-selector__dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            {campaigns.length === 0 ? (
              <div className="campaign-selector__empty">No campaigns found</div>
            ) : (
              campaigns.map(c => (
                <button
                  key={c.id}
                  className={`campaign-selector__item ${c.id === selectedId ? 'campaign-selector__item--active' : ''}`}
                  onClick={() => { onSelect(c.id); setOpen(false); }}
                >
                  <span className="campaign-selector__item-dot" />
                  <div>
                    <div className="campaign-selector__item-name">Campaign #{c.id} · {c.name}</div>
                    <div className="campaign-selector__item-sub">
                      {c.niche && <span className="niche-tag">{c.niche}</span>}
                      {c.created_at && <span>{new Date(c.created_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  {c.id === selectedId && <span className="campaign-selector__check">✓</span>}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════════════ */
function Sidebar({ activePage, onNavigate }) {
  const navItems = [
    { l: 'Dashboard', i: <LayoutDashboard size={15} />, page: 'dashboard' },
    { l: 'Leads', i: <Users size={15} />, page: 'leads' },
    { l: 'Campaigns', i: <Send size={15} />, page: 'campaigns' },
    { l: 'Analytics', i: <BarChart2 size={15} />, page: 'analytics' },
    { l: 'Inbox', i: <Inbox size={15} />, page: 'inbox' },
    { l: 'Filters', i: <Filter size={15} />, page: 'filters' },
  ];
  const sysItems = [
    { l: 'AI Agents', i: <Bot size={15} />, page: 'agents' },
    { l: 'Automations', i: <Cpu size={15} />, page: 'automations' },
    { l: 'Settings', i: <Settings size={15} />, page: 'settings' },
  ];

  return (
    <motion.div className="sidebar" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="sidebar-logo" style={{ marginBottom: 36, marginTop: 4, gap: 10 }}>
        <div className="logo-icon-glass">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#A78BFA' }}>
            <path d="M4 4l8 16 8-16" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span className="logo-text">VOXORA</span>
          <span className="logo-subtext">COMMAND CENTER</span>
        </div>
      </div>
      <span className="nav-section-label">Navigation</span>
      {navItems.map(x => (
        <div key={x.l} className={`nav-item ${activePage === x.page ? 'active' : ''}`} onClick={() => onNavigate(x.page)}>
          <span className="nav-icon">{x.i}</span>{x.l}
        </div>
      ))}
      <span className="nav-section-label" style={{ marginTop: 24 }}>System</span>
      {sysItems.map(x => (
        <div key={x.l} className={`nav-item ${activePage === x.page ? 'active' : ''}`} onClick={() => onNavigate(x.page)}>
          <span className="nav-icon">{x.i}</span>{x.l}
        </div>
      ))}
      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="user-avatar">V</div>
          <div className="user-info"><div className="user-name">Admin</div><div className="user-role">Voxora Agency</div></div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   METRIC CARD — with Spotlight hover
   ═══════════════════════════════════════════════════════════ */
function MetricCard({ label, value, icon, variant, badge, sub, loading, idx }) {
  return (
    <SpotlightCard className={`glass-card metric-card metric-${variant}`}>
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: idx * 0.07, ease: [0.23, 1, 0.32, 1] }}>
        <div className="metric-header"><span className="metric-label">{label}</span><div className="metric-icon-wrap">{icon}</div></div>
        <div className="metric-value"><AnimCounter value={value} loading={loading} /></div>
        {!loading && <div className="metric-footer"><span className="metric-badge">{badge}</span><span className="metric-sub">{sub}</span></div>}
      </motion.div>
    </SpotlightCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMING SOON PAGE
   ═══════════════════════════════════════════════════════════ */
function ComingSoonPage({ icon, title, desc }) {
  return (
    <motion.div
      className="coming-soon-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="coming-soon-icon">{icon}</div>
      <h2 className="coming-soon-title">{title}</h2>
      <p className="coming-soon-desc">{desc}</p>
      <div className="coming-soon-badge">Coming Soon</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════ */
function DashboardPage({ stats, leads, loading, campaign, campaigns, selectedCampaignId, onCampaignChange, onRefresh, refreshing, onLeadClick, onDeleteLead, onNoteClick, onUpdateWorkspace, onAddContact, onUpdateContact }) {
  const replyRate = stats.total > 0 ? Math.round(((stats.replied + stats.interested + stats.meeting_booked) / stats.total) * 100) : 0;

  const chartData = {
    labels: ['Sent', 'Follow-up', 'Replied', 'Interested', 'Meeting'],
    datasets: [{
      data: [stats.sent, stats.followups, stats.replied, stats.interested, stats.meeting_booked],
      backgroundColor: ['rgba(139,92,246,0.5)', 'rgba(245,158,11,0.5)', 'rgba(6,182,212,0.5)', 'rgba(139,92,246,0.7)', 'rgba(16,185,129,0.6)'],
      borderColor: ['rgba(139,92,246,0.9)', 'rgba(245,158,11,0.9)', 'rgba(6,182,212,0.9)', 'rgba(139,92,246,1)', 'rgba(16,185,129,0.9)'],
      borderWidth: 1, borderRadius: 8,
    }],
  };
  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(7,7,21,0.95)', titleColor: '#F8FAFC', bodyColor: '#94A3B8', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, padding: 12, cornerRadius: 10 } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', precision: 0, font: { size: 11 } }, border: { display: false } },
      x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11 } }, border: { display: false } },
    },
  };

  return (
    <div className="content">
      {/* HERO — CINEMATIC COMMAND CENTER */}
      <motion.div
        className="hero-banner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Label row */}
        <div className="hero-greeting">AI Automation Command Center</div>

        {/* Main shimmer title */}
        <div className="hero-title">Your Pipeline, Automated</div>

        {/* Scanner line */}
        <div className="hero-scanner">
          <div className="hero-scanner-track" />
        </div>

        {/* Subtitle */}
        <div className="hero-subtitle">
          Real-time intelligence. Every lead tracked, every follow-up automated,
          every reply detected &mdash; all running silently in the background.
        </div>

        {/* Live status dots */}
        <div className="hero-status-row">
          <div className="hero-status-dot green"><span />Agents Online</div>
          <div className="hero-status-dot cyan"><span />20 Inboxes Active</div>
          <div className="hero-status-dot purple"><span />Outbound Live</div>
        </div>
      </motion.div>

      {/* KPI CARDS */}
      <div className="metrics-grid">
        <MetricCard label="Total Leads" value={stats.total} icon={<Users size={14} />} variant="purple" badge={`${stats.total - stats.archived} active`} sub="in pipeline" loading={loading} idx={0} />
        <MetricCard label="Emails Sent" value={stats.sent + stats.followups + stats.replied + stats.interested + stats.meeting_booked} icon={<Send size={14} />} variant="cyan" badge="Delivered" sub="across 20 inboxes" loading={loading} idx={1} />
        <MetricCard label="Reply Rate" value={replyRate} icon={<TrendingUp size={14} />} variant="emerald" badge="%" sub={`${stats.replied + stats.interested + stats.meeting_booked} replies`} loading={loading} idx={2} />
        <MetricCard label="Follow-ups" value={stats.followups} icon={<Activity size={14} />} variant="amber" badge="Running" sub="auto-scheduled" loading={loading} idx={3} />
      </div>

      {/* GLOBE + CHART + AI PANEL */}
      <motion.div className="cinematic-row" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
        {/* Matrix Globe */}
        <SpotlightCard className="glass-card globe-card">
          <div className="card-title" style={{ marginBottom: 4 }}>Global Outreach Matrix</div>
          <div className="card-subtitle" style={{ marginBottom: 10 }}>Live signal — emails in flight across the world</div>
          <MatrixGlobe />
        </SpotlightCard>

        {/* Chart */}
        <SpotlightCard className="glass-card chart-card">
          <div className="card-title">Conversion Funnel</div>
          <div className="card-subtitle">Lead journey from first touch to meeting booked</div>
          <div style={{ height: 220 }}><Bar data={chartData} options={chartOpts} /></div>
        </SpotlightCard>

        {/* AI Panel */}
        <SpotlightCard className="glass-card ai-panel">
          <div className="ai-panel-header" style={{ marginBottom: 16 }}>
            <div className="ai-panel-icon-glass"><Bot size={13} style={{ color: 'var(--purple-bright)' }} /></div>
            <div>
              <div className="card-title" style={{ marginBottom: 0 }}>AI Agents</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live System Status</div>
            </div>
          </div>
          <div className="agent-row-glass"><div className="agent-dot-pulse active" /><div className="agent-info"><div className="agent-name">Reply Detection</div><div className="agent-desc">Monitoring 20 SMTP inboxes</div></div><span className="agent-badge badge-active">Live</span></div>
          <div className="agent-row-glass"><div className="agent-dot-pulse scheduled" /><div className="agent-info"><div className="agent-name">Follow-up Engine</div><div className="agent-desc">Next run: 9:00 AM</div></div><span className="agent-badge badge-scheduled">Queued</span></div>
          <div className="agent-row-glass"><div className="agent-dot-pulse active" /><div className="agent-info"><div className="agent-name">Archive Cleaner</div><div className="agent-desc">Day 13 → auto-archive</div></div><span className="agent-badge badge-active">Live</span></div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}><span>Archived leads</span><span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{stats.archived}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}><span>Meetings booked</span><span style={{ color: 'var(--emerald)', fontWeight: 600 }}>{stats.meeting_booked}</span></div>
          </div>
        </SpotlightCard>
      </motion.div>

      {/* BRAIN FEED */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.38 }}>
        <SpotlightCard className="glass-card">
          <BrainFeed />
        </SpotlightCard>
      </motion.div>

      {/* LEADS TABLE */}
      <motion.div className="glass-card table-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.45 }}>
        <div className="table-header">
          <div>
            <div className="card-title">Recent Leads</div>
            <div className="card-subtitle" style={{ marginBottom: 0 }}>
              {campaign ? `Campaign #${campaign.id} · ${campaign.name}` : '—'} · {leads.length} leads total
              {campaign?.niche && <span className="niche-tag" style={{ marginLeft: 8 }}>{campaign.niche}</span>}
            </div>
          </div>
        </div>
        <LeadsTable leads={leads.slice(0, 20)} loading={loading} onLeadClick={onLeadClick} onDeleteLead={onDeleteLead} onNoteClick={onNoteClick} onUpdateWorkspace={onUpdateWorkspace} onAddContact={onAddContact} onUpdateContact={onUpdateContact} />
        {leads.length > 20 && (
          <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-3)', fontSize: 12 }}>
            Showing 20 of {leads.length} leads — go to Leads page for full list
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   OUTREACH TIMELINE ITEM
   ═══════════════════════════════════════════════════════════ */
function TimelineItem({ step, label, color, subject, body, sender, sentAt, isFuture, delay = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const hasMeta = subject || body || sender || sentAt;

  return (
    <motion.div
      className={`timeline-item ${isFuture ? 'timeline-item--future' : ''}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <div className="timeline-left">
        <div className={`timeline-dot ${isFuture ? 'timeline-dot--future' : ''}`} style={{ '--dot-color': color }}>
          {isFuture
            ? <Circle size={8} style={{ opacity: 0.4 }} />
            : <CheckCircle2 size={10} color="white" />
          }
        </div>
        <div className="timeline-line" />
      </div>

      <div className="timeline-content">
        <div className="timeline-header" onClick={() => hasMeta && !isFuture && setExpanded(e => !e)} style={{ cursor: hasMeta && !isFuture ? 'pointer' : 'default' }}>
          <div className="timeline-step-badge" style={{ '--step-color': color }}>{label}</div>
          {sentAt && <span className="timeline-time"><Clock size={10} />{new Date(sentAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
          {isFuture && <span className="timeline-queued">Queued</span>}
          {hasMeta && !isFuture && (
            <motion.span
              className="timeline-expand-icon"
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={13} />
            </motion.span>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              className="timeline-detail"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            >
              {sender && (
                <div className="timeline-detail-row">
                  <Mail size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
                  <span className="timeline-detail-label">From:</span>
                  <span className="timeline-detail-val">{sender}</span>
                </div>
              )}
              {subject && (
                <div className="timeline-detail-row">
                  <span className="timeline-detail-label">Subject:</span>
                  <span className="timeline-detail-val" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{subject}</span>
                </div>
              )}
              {body && (
                <div className="timeline-body-wrap">
                  <pre className="timeline-body-text">{body}</pre>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LEAD INTELLIGENCE PANEL (Slide-over)
   ═══════════════════════════════════════════════════════════ */
function LeadIntelPanel({ lead, onClose }) {
  if (!lead) return null;

  const statusOrder = ['cold_email_sent', 'follow_up_1_sent', 'follow_up_2_sent', 'follow_up_3_sent', 'archived', 'replied', 'bounced'];
  const currentIdx = statusOrder.indexOf(lead.status);

  const steps = [
    {
      key: 'cold_email_sent',
      label: 'Cold Email',
      color: 'var(--purple)',
      subject: lead.cold_email_subject,
      body: lead.cold_email_body || lead.message,
      sender: lead.cold_email_sender || lead.sender,
      sentAt: lead.cold_email_sent_at || lead.sent_at,
    },
    {
      key: 'follow_up_1_sent',
      label: 'Follow-up 1',
      color: 'var(--cyan)',
      subject: lead.follow_up_1_subject,
      body: lead.follow_up_1_body,
      sender: lead.follow_up_1_sender,
      sentAt: lead.follow_up_1_sent_at,
    },
    {
      key: 'follow_up_2_sent',
      label: 'Follow-up 2',
      color: 'var(--amber)',
      subject: lead.follow_up_2_subject,
      body: lead.follow_up_2_body,
      sender: lead.follow_up_2_sender,
      sentAt: lead.follow_up_2_sent_at,
    },
    {
      key: 'follow_up_3_sent',
      label: 'Follow-up 3',
      color: 'var(--emerald)',
      subject: lead.follow_up_3_subject,
      body: lead.follow_up_3_body,
      sender: lead.follow_up_3_sender,
      sentAt: lead.follow_up_3_sent_at,
    },
  ];

  const initials = (lead.first_name || '?').charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      <motion.div
        className="intel-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="intel-panel"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="intel-panel-header">
          <div className="intel-avatar">{initials}</div>
          <div className="intel-header-info">
            <div className="intel-name">{lead.first_name || '—'}</div>
            {lead.job_title && <div className="intel-job-title-header">{lead.job_title}</div>}
            <div className="intel-email">{lead.email}</div>
          </div>
          <button className="intel-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="intel-panel-body">

          <div className="intel-section">
            <div className="intel-company-card">
              <div className="intel-company-left">
                <Building2 size={14} style={{ color: 'var(--purple-bright)', flexShrink: 0 }} />
                <div>
                  <div className="intel-company-name">{lead.company_name || lead.company || '—'}</div>
                  {lead.location && (
                    <div className="intel-location">
                      <MapPin size={11} /> {lead.location}
                    </div>
                  )}
                </div>
              </div>
              <div className="intel-company-actions">
                {lead.linkedin && (
                  <a href={lead.linkedin.startsWith('http') ? lead.linkedin : `https://${lead.linkedin}`} target="_blank" rel="noreferrer" className="intel-linkedin-btn">
                    <Briefcase size={11} /> LinkedIn <ExternalLink size={10} />
                  </a>
                )}
                {lead.website && (
                  <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="intel-website-btn">
                    <Globe size={11} /> Visit Site <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {(lead.target_client || lead.industry_pain || lead.niche_tag) && (
            <div className="intel-section">
              <div className="intel-section-title">AI Intelligence</div>
              <div className="intel-tags-grid">
                {lead.niche_tag && (
                  <div className="intel-tag intel-tag--purple">
                    <Tag size={10} />
                    <div>
                      <div className="intel-tag-label">Niche</div>
                      <div className="intel-tag-val">{lead.niche_tag}</div>
                    </div>
                  </div>
                )}
                {lead.target_client && (
                  <div className="intel-tag intel-tag--cyan">
                    <Target size={10} />
                    <div>
                      <div className="intel-tag-label">Target Client</div>
                      <div className="intel-tag-val">{lead.target_client}</div>
                    </div>
                  </div>
                )}
                {lead.industry_pain && (
                  <div className="intel-tag intel-tag--amber" style={{ gridColumn: '1 / -1' }}>
                    <Briefcase size={10} />
                    <div>
                      <div className="intel-tag-label">Industry Pain</div>
                      <div className="intel-tag-val">{lead.industry_pain}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="intel-section" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusBadge status={lead.status} />
            {lead.replied_at && (
              <span style={{ fontSize: 11, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={11} /> Replied {new Date(lead.replied_at).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="intel-section">
            <div className="intel-section-title">Outreach Timeline</div>
            <div className="intel-timeline">
              {steps.map((step, i) => {
                const isSent = step.sentAt != null;
                const isFuture = !isSent;
                return (
                  <TimelineItem
                    key={step.key}
                    label={step.label}
                    color={step.color}
                    subject={step.subject}
                    body={step.body}
                    sender={step.sender}
                    sentAt={step.sentAt}
                    isFuture={isFuture}
                    delay={i * 0.07}
                  />
                );
              })}
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   LEADS TABLE (reusable)
   ═══════════════════════════════════════════════════════════ */
function LeadsTable({ leads, loading, onLeadClick, onDeleteLead, onNoteClick, onUpdateWorkspace, onAddContact, onUpdateContact }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id, e) => {
    if(e) e.stopPropagation();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div className="empty-state">Loading leads...</div>;
  if (leads.length === 0) return <div className="empty-state">No leads found for this campaign yet.</div>;
  return (
    <>
      <table className="leads-table">
        <thead>
          <tr>
            <th style={{ width: 40, padding: '12px 16px' }}></th>
            <th>Name</th><th>Company</th><th>Email</th>
            <th>Status</th><th style={{ width: 140 }}>Reply Type</th><th>Sender</th><th>Last Sent</th><th className="col-sticky" style={{ textAlign: 'center', minWidth: 100 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => {
            const lastSentAt = lead.follow_up_3_sent_at || lead.follow_up_2_sent_at || lead.follow_up_1_sent_at || lead.cold_email_sent_at || lead.sent_at;
            const hasMsgs = !!(lead.cold_email_body || lead.message || lead.follow_up_1_body || lead.follow_up_2_body || lead.follow_up_3_body);
            const hasContacts = lead.contacts && lead.contacts.length > 0;
            const isExpanded = expanded[lead.id];
            
            return (
              <React.Fragment key={lead.id}>
                <tr onClick={() => onLeadClick && onLeadClick(lead)} style={{ cursor: 'pointer' }} className={isExpanded ? 'row-expanded' : ''}>
                  <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                    <button 
                      className="expand-arrow"
                      onClick={(e) => toggleExpand(lead.id, e)}
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </td>
                  <td className="lead-name">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <InlineEditable value={lead.display_name} onSave={(val) => onUpdateWorkspace(lead.id, { display_name: val })} placeholder={lead.first_name || '—'} />
                          {hasContacts && <span className="contacts-badge">👥 {lead.contacts.length}</span>}
                          {lead.manual_note && (
                            <div className="note-tooltip-wrapper" onClick={(e) => { e.stopPropagation(); onNoteClick && onNoteClick(lead); }}>
                              <Paperclip size={12} color={lead.note_color === 'red' ? '#ef4444' : lead.note_color === 'green' ? '#10b981' : lead.note_color === 'blue' ? '#3b82f6' : 'var(--text-3)'} />
                              <div className="note-tooltip">{lead.manual_note.length > 40 ? lead.manual_note.substring(0, 40) + '...' : lead.manual_note}</div>
                            </div>
                          )}
                        </div>
                        {lead.job_title && <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{lead.job_title}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <InlineEditable value={lead.display_company} onSave={(val) => onUpdateWorkspace(lead.id, { display_company: val })} placeholder={lead.company_name || lead.company || '—'} />
                  </td>
                  <td className="lead-email">
                    <InlineEditable value={lead.display_email} onSave={(val) => onUpdateWorkspace(lead.id, { display_email: val })} placeholder={lead.email || '—'} />
                  </td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td>
                    <select 
                      className="reply-type-select" 
                      value={lead.reply_type}
                      onChange={(e) => {
                        onUpdateWorkspace(lead.id, { reply_type: e.target.value });
                        if(e.target.value === 'Contact Changed') setExpanded(prev => ({ ...prev, [lead.id]: true }));
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Contact Changed">Contact Changed</option>
                      <option value="Out of Office">Out of Office</option>
                      <option value="Not Interested">Not Interested</option>
                    </select>
                  </td>
                  <td><span style={{ fontSize: 11, color: 'var(--text-2)' }}>{lead.sender || lead.cold_email_sender || '—'}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {lastSentAt ? new Date(lastSentAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="col-sticky" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <button
                        className={`msg-btn ${hasMsgs ? 'msg-btn--has' : 'msg-btn--empty'}`}
                        onClick={e => { e.stopPropagation(); onLeadClick && onLeadClick(lead); }}
                        title="View lead intelligence"
                      >
                        <Mail size={13} />
                      </button>
                      <button
                        className={`msg-btn ${lead.manual_note ? 'msg-btn--has' : 'msg-btn--empty'}`}
                        onClick={e => { e.stopPropagation(); onNoteClick && onNoteClick(lead); }}
                        title="Add/Edit Note"
                      >
                        <Paperclip size={13} color={lead.note_color === 'red' ? '#ef4444' : lead.note_color === 'green' ? '#10b981' : lead.note_color === 'blue' ? '#3b82f6' : 'currentColor'} />
                      </button>
                      <button
                        className="msg-btn msg-btn--empty"
                        onClick={e => { e.stopPropagation(); onDeleteLead && onDeleteLead(lead.id, e); }}
                        title="Delete Lead"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="sub-row-container">
                    <td colSpan="9" style={{ padding: 0, background: 'rgba(0,0,0,0.2)' }}>
                      <SubContactsPanel lead={lead} onAddContact={onAddContact} onUpdateContact={onUpdateContact} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   LEADS PAGE (full list with search + filter)
   ═══════════════════════════════════════════════════════════ */
function LeadsPage({ leads, loading, campaign, onLeadClick, onDeleteLead, onNoteClick, onUpdateWorkspace, onAddContact, onUpdateContact }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [nicheFilter, setNicheFilter] = useState('all');

  const statuses = ['all', 'new', 'cold_email_sent', 'follow_up_1_sent', 'follow_up_2_sent', 'follow_up_3_sent', 'replied', 'archived', 'bounced'];
  const niches = ['all', ...new Set(leads.map(l => l.niche_tag || l.niche).filter(Boolean))];

  const filtered = leads.filter(l => {
    const matchSearch = !search ||
      (l.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchNiche = nicheFilter === 'all' || l.niche_tag === nicheFilter || l.niche === nicheFilter;
    return matchSearch && matchStatus && matchNiche;
  });

  return (
    <motion.div className="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Leads</h1>
          <p className="page-sub">{campaign ? `Campaign #${campaign.id} · ${campaign.name}` : '—'} · {leads.length} total leads</p>
        </div>
      </div>

      <div className="leads-controls">
        <div className="leads-search">
          <Search size={13} style={{ opacity: 0.4 }} />
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="leads-search-input"
          />
        </div>
        <select className="leads-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>)}
        </select>
        {niches.length > 1 && (
          <select className="leads-filter-select" value={nicheFilter} onChange={e => setNicheFilter(e.target.value)}>
            {niches.map(n => <option key={n} value={n}>{n === 'all' ? 'All Niches' : n}</option>)}
          </select>
        )}
        <span className="leads-count">{filtered.length} leads</span>
      </div>

      <div className="glass-card table-card" style={{ marginTop: 0 }}>
        <LeadsTable leads={filtered} loading={loading} onLeadClick={onLeadClick} onDeleteLead={onDeleteLead} onNoteClick={onNoteClick} onUpdateWorkspace={onUpdateWorkspace} onAddContact={onAddContact} onUpdateContact={onUpdateContact} />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CAMPAIGNS PAGE
   ═══════════════════════════════════════════════════════════ */
function CampaignsPage({ campaigns, selectedCampaignId, onSelect, stats, loading }) {
  return (
    <motion.div className="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-sub">{campaigns.length} campaigns · Click to switch active view</p>
        </div>
      </div>

      <div className="campaigns-grid">
        {campaigns.map((c, i) => (
          <motion.div
            key={c.id}
            className={`campaign-card glass-card ${c.id === selectedCampaignId ? 'campaign-card--active' : ''}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            onClick={() => onSelect(c.id)}
          >
            <div className="campaign-card__head">
              <div>
                <div className="campaign-card__name">Campaign #{c.id}</div>
                <div className="campaign-card__title">{c.name}</div>
              </div>
              {c.id === selectedCampaignId && (
                <span className="campaign-card__active-badge">Active</span>
              )}
            </div>
            {c.niche && <span className="niche-tag" style={{ marginTop: 8, display: 'inline-block' }}>{c.niche}</span>}
            <div className="campaign-card__meta">
              <span>📅 {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}</span>
              {c.id === selectedCampaignId && !loading && (
                <span>👥 {stats.total} leads</span>
              )}
            </div>
            <button
              className={`campaign-card__btn ${c.id === selectedCampaignId ? 'campaign-card__btn--active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onSelect(c.id); }}
            >
              {c.id === selectedCampaignId ? '✓ Currently Viewing' : 'View Campaign →'}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   KEYWORDS MODAL (Glassmorphism)
   ═══════════════════════════════════════════════════════════ */
function KeywordsModal({ data, onClose }) {
  const isExclude = data.type === 'exclude';
  const colorVar = isExclude ? 'var(--red)' : 'var(--emerald)';
  const icon = isExclude ? '🚫 Exclude Keywords' : '🔑 Include Keywords';

  // Local Storage Key
  const storageKey = `voxora_filter_${data.id}_${data.type}`;

  // Default List from DB
  const defaultKeywords = useMemo(() => {
    return (data.keywords || '').split(',').map(s => s.trim()).filter(Boolean);
  }, [data.keywords]);

  // State initialized from Local Storage or DB
  const [keywordsList, setKeywordsList] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return defaultKeywords;
  });

  const [newTag, setNewTag] = useState('');

  const saveToLocal = (newList) => {
    setKeywordsList(newList);
    localStorage.setItem(storageKey, JSON.stringify(newList));
  };

  const removeTag = (index) => {
    const newList = [...keywordsList];
    newList.splice(index, 1);
    saveToLocal(newList);
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      const val = newTag.trim();
      if (!keywordsList.includes(val)) {
        const newList = [...keywordsList, val];
        saveToLocal(newList);
      }
      setNewTag('');
    }
  };

  const handleReset = () => {
    localStorage.removeItem(storageKey);
    setKeywordsList(defaultKeywords);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(keywordsList.join(', '));
  };

  return (
    <>
      <motion.div
        className="intel-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ zIndex: 1000 }}
      />
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, scale: 0.95, y: '-40%', x: '-50%' }}
        animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
        exit={{ opacity: 0, scale: 0.95, y: '-40%', x: '-50%' }}
        style={{
          position: 'fixed', top: '50%', left: '50%', width: '90%', maxWidth: 500,
          zIndex: 1001, padding: 24, display: 'flex', flexDirection: 'column', gap: 16
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: colorVar, display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon} <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 400 }}>({keywordsList.length})</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: '40vh', overflowY: 'auto', paddingRight: 8 }}>
          {keywordsList.length === 0 ? (
            <span style={{ color: 'var(--text-3)', fontSize: 13 }}>No keywords provided.</span>
          ) : (
            keywordsList.map((kw, i) => (
              <span key={i} style={{
                background: `color-mix(in srgb, ${colorVar} 15%, transparent)`,
                border: `1px solid color-mix(in srgb, ${colorVar} 30%, transparent)`,
                color: colorVar, padding: '4px 8px 4px 10px', borderRadius: 6, fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                {kw}
                <button 
                  onClick={() => removeTag(i)} 
                  style={{ background: 'none', border: 'none', color: colorVar, opacity: 0.7, cursor: 'pointer', padding: 0, display: 'flex' }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                  onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>

        <input 
          type="text" 
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={addTag}
          placeholder="Type a new keyword and press Enter..."
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '10px 12px',
            borderRadius: 8,
            color: 'var(--text-1)',
            fontSize: 13,
            outline: 'none',
            marginTop: 4
          }}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {keywordsList.length > 0 && (
            <button
              onClick={handleCopy}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: `color-mix(in srgb, ${colorVar} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${colorVar} 40%, transparent)`, color: colorVar,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = `color-mix(in srgb, ${colorVar} 20%, transparent)`}
              onMouseOut={(e) => e.currentTarget.style.background = `color-mix(in srgb, ${colorVar} 10%, transparent)`}
            >
              📋 Copy Raw String
            </button>
          )}
          <button
            onClick={handleReset}
            style={{
              padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            title="Reset to Database Default"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   FILTERS PAGE
   ═══════════════════════════════════════════════════════════ */
function FiltersPage() {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('campaign_filters').select('*').order('created_at', { ascending: false });
      if (error) console.error(error);
      if (data) setFilters(data);
      setLoading(false);
    })();
  }, []);

  return (
    <motion.div className="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaign Filters</h1>
          <p className="page-sub">Golden targeting recipes for your B2B campaigns</p>
        </div>
      </div>

      <div className="glass-card table-card">
        {loading ? (
          <div className="empty-state">Loading filters...</div>
        ) : filters.length === 0 ? (
          <div className="empty-state">No filters saved yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="leads-table" style={{ minWidth: 800 }}>
              <thead>
                <tr>
                  <th>Campaign / Niche</th>
                  <th>Location & Employees</th>
                  <th>Industry</th>
                  <th>Keywords</th>
                </tr>
              </thead>
              <tbody>
                {filters.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{f.campaign_number || '—'}</div>
                      <div className="niche-tag" style={{ marginTop: 4 }}>{f.niche || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--text-2)' }}>📍 {f.location || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>👥 {f.employees || '—'}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-2)', maxWidth: 200, lineHeight: '1.5' }}>
                      {f.industry ? <div style={{ marginBottom: 4 }}><strong style={{color:'var(--text-3)'}}>Inc:</strong> {f.industry}</div> : null}
                      {f.exclude_industry ? <div><strong style={{color:'var(--text-3)'}}>Exc:</strong> <span style={{color:'var(--red)'}}>{f.exclude_industry}</span></div> : null}
                      {!f.industry && !f.exclude_industry && '—'}
                    </td>
                    <td style={{ display: 'flex', gap: 8, alignItems: 'center', height: '100%', padding: '16px 12px' }}>
                      <button 
                        onClick={() => setModalData({ id: f.id, type: 'include', keywords: f.keywords })}
                        className="msg-btn msg-btn--has" 
                        style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--emerald)', border: '1px solid rgba(16,185,129,0.2)', padding: '6px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, width: 'auto' }}
                        title="View Included Keywords"
                      >
                        🔑 Include
                      </button>
                      <button 
                        onClick={() => setModalData({ id: f.id, type: 'exclude', keywords: f.exclude_keywords })}
                        className="msg-btn msg-btn--has" 
                        style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, width: 'auto' }}
                        title="View Excluded Keywords"
                      >
                        🚫 Exclude
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalData && <KeywordsModal data={modalData} onClose={() => setModalData(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INBOX PAGE — FULL CINEMATIC + FUNCTIONAL SIGNAL CENTER
   ═══════════════════════════════════════════════════════════ */
function InboxPage() {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState('All');
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [scrambleTrigger, setScrambleTrigger] = useState(0);

  const loadReplies = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'replied')
      .order('replied_at', { ascending: false, nullsFirst: false });
    if (data) setReplies(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadReplies(); }, [loadReplies]);

  // Realtime subscription — new replies appear instantly
  useEffect(() => {
    const channel = supabase
      .channel('inbox-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leads',
        filter: 'status=eq.replied'
      }, () => { loadReplies(); })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadReplies]);

  const accounts = ['All', ...new Set(replies.map(r => r.cold_email_sender || r.sender).filter(Boolean))];
  const filtered = selectedAccount === 'All'
    ? replies
    : replies.filter(r => (r.cold_email_sender || r.sender) === selectedAccount);
  const selectedMsg = replies.find(r => r.id === selectedMsgId);

  // Quick action: update lead status in Supabase
  const handleAction = useCallback(async (id, newStatus) => {
    setUpdatingId(id);
    await supabase.from('leads').update({ status: newStatus }).eq('id', id);
    setReplies(prev => prev.filter(r => r.id !== id));
    setSelectedMsgId(null);
    setUpdatingId(null);
  }, []);

  // AI intent scoring based on reply content
  const getAIIntent = (msg) => {
    const text = (msg.reply_message || '').toLowerCase();
    if (!text) return { label: 'Unknown', score: 0, color: 'var(--text-3)' };
    const positive = ['interest', 'yes', 'call', 'meeting', 'schedule', 'tell me more', 'sounds good', 'let\'s', 'when', 'available', 'book', 'demo', 'love to', 'great', 'perfect'];
    const negative = ['not interest', 'unsubscribe', 'remove', 'stop', 'no thanks', 'not looking', 'don\'t contact', 'do not'];
    const posCount = positive.filter(w => text.includes(w)).length;
    const negCount = negative.filter(w => text.includes(w)).length;
    if (negCount > 0) return { label: 'Not Interested', score: Math.max(5, 30 - negCount * 15), color: 'var(--red)' };
    if (posCount >= 3) return { label: 'Hot Lead 🔥', score: Math.min(98, 75 + posCount * 5), color: 'var(--emerald)' };
    if (posCount >= 1) return { label: 'Positive Signal', score: Math.min(85, 55 + posCount * 10), color: 'var(--cyan)' };
    return { label: 'Neutral', score: 45, color: 'var(--amber)' };
  };

  return (
    <motion.div className="inbox-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

      {/* COLUMN 1: Sender accounts */}
      <div className="inbox-sidebar glass-card" style={{ borderRadius: 14 }}>
        <div className="inbox-sidebar-header">
          <span>📡 SMTP Inboxes</span>
          <span style={{ fontSize: 10, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="pulse-dot" />Live
          </span>
        </div>
        <div className="inbox-sidebar-list">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8, marginBottom: 6 }} />
            ))
          ) : (
            accounts.map(acc => {
              const count = acc === 'All' ? replies.length : replies.filter(r => (r.cold_email_sender || r.sender) === acc).length;
              return (
                <button
                  key={acc}
                  className={`inbox-account-btn ${selectedAccount === acc ? 'inbox-account-btn--active' : ''}`}
                  onClick={() => { setSelectedAccount(acc); setSelectedMsgId(null); }}
                >
                  <div className="inbox-account-dot" style={{ background: selectedAccount === acc ? 'var(--cyan)' : undefined }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12 }}>
                    {acc === 'All' ? '🌐 All Inboxes' : acc}
                  </span>
                  {count > 0 && <span className="inbox-count-badge">{count}</span>}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 2: Message list */}
      <div className="inbox-list glass-card" style={{ borderRadius: 14, padding: 0, overflow: 'hidden' }}>
        <div className="inbox-list-header">
          <span>💬 Replies</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{filtered.length} messages</span>
        </div>
        <div className="inbox-list-scroll">
          {loading && (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 6, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 11, width: '40%', borderRadius: 6 }} />
              </div>
            ))
          )}
          {!loading && filtered.length === 0 && (
            <div className="inbox-empty-state">
              <Inbox size={40} style={{ opacity: 0.15, marginBottom: 12 }} />
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No replies in this inbox</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Waiting for signals...</div>
            </div>
          )}
          {filtered.map(msg => {
            const intent = getAIIntent(msg);
            const name = msg.first_name || msg.name || 'Unknown';
            const company = msg.company_name || msg.company || 'Unknown Company';
            const snippet = (msg.reply_message || '').slice(0, 80);
            const isNew = msg.replied_at && (Date.now() - new Date(msg.replied_at).getTime()) < 86400000;
            return (
              <div
                key={msg.id}
                className={`inbox-msg-card ${selectedMsgId === msg.id ? 'inbox-msg-card--active' : ''}`}
                onClick={() => { setSelectedMsgId(msg.id); setScrambleTrigger(t => t + 1); }}
              >
                <div className="inbox-msg-head">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isNew && <span className="inbox-new-dot" />}
                    <span className="inbox-msg-name">{name}</span>
                  </div>
                  <span className="inbox-msg-time">
                    {msg.replied_at ? new Date(msg.replied_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''}
                  </span>
                </div>
                <div className="inbox-msg-company">
                  <Building2 size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
                  <span>{company}</span>
                  <span className="inbox-intent-pill" style={{ color: intent.color, borderColor: intent.color }}>
                    {intent.label}
                  </span>
                </div>
                {snippet && (
                  <div className="inbox-msg-snippet">{snippet}{snippet.length >= 80 ? '...' : ''}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* COLUMN 3: Message detail */}
      <div className="inbox-detail glass-card" style={{ borderRadius: 14, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {selectedMsg ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMsg.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              {/* Detail Header */}
              <div className="inbox-detail-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="intel-avatar" style={{ width: 38, height: 38, fontSize: 16 }}>
                    {(selectedMsg.first_name || selectedMsg.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="inbox-detail-name">{selectedMsg.first_name || selectedMsg.name || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{selectedMsg.job_title || 'Contact'}</div>
                  </div>
                </div>
                <div className="inbox-detail-meta">
                  <span><Mail size={11} style={{ opacity: 0.5 }} />{selectedMsg.email}</span>
                  <span><Building2 size={11} style={{ opacity: 0.5 }} />{selectedMsg.company_name || selectedMsg.company || '—'}</span>
                  {(selectedMsg.niche_tag || selectedMsg.niche) && (
                    <span className="niche-tag" style={{ marginTop: 0 }}>{selectedMsg.niche_tag || selectedMsg.niche}</span>
                  )}
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="status-dot" style={{ background: 'var(--emerald)' }} />
                  Received by: <strong style={{ color: 'var(--text-2)' }}>{selectedMsg.cold_email_sender || selectedMsg.sender || '—'}</strong>
                  {selectedMsg.replied_at && (
                    <span style={{ marginLeft: 'auto' }}>
                      <Clock size={10} style={{ opacity: 0.5, marginRight: 3, verticalAlign: 'middle' }} />
                      {new Date(selectedMsg.replied_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Intent Analysis Bar */}
              {(() => {
                const intent = getAIIntent(selectedMsg);
                return (
                  <div className="inbox-ai-analysis">
                    <div className="inbox-ai-label">
                      <Bot size={11} />
                      <span>AI SIGNAL ANALYSIS</span>
                    </div>
                    <div className="inbox-ai-chips">
                      <span className="inbox-ai-chip" style={{ color: intent.color, borderColor: intent.color }}>
                        Intent: {intent.label}
                      </span>
                      <span className="inbox-ai-chip" style={{ color: 'var(--purple)', borderColor: 'var(--purple)' }}>
                        Score: {intent.score}%
                      </span>
                      {selectedMsg.niche_tag && (
                        <span className="inbox-ai-chip" style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)' }}>
                          Niche: {selectedMsg.niche_tag}
                        </span>
                      )}
                      {selectedMsg.job_title && (
                        <span className="inbox-ai-chip" style={{ color: 'var(--amber)', borderColor: 'var(--amber)' }}>
                          {selectedMsg.job_title}
                        </span>
                      )}
                    </div>
                    <div className="inbox-score-bar">
                      <div className="inbox-score-fill" style={{ width: `${intent.score}%`, background: intent.color }} />
                    </div>
                  </div>
                );
              })()}

              {/* Context: our outreach message */}
              {(selectedMsg.cold_email_subject || selectedMsg.cold_email_body) && (
                <div className="inbox-context-wrap">
                  <div className="inbox-context-label">📤 Our Original Outreach</div>
                  {selectedMsg.cold_email_subject && (
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
                      Subject: <span style={{ color: 'var(--text-2)' }}>{selectedMsg.cold_email_subject}</span>
                    </div>
                  )}
                  {selectedMsg.cold_email_body && (
                    <div className="inbox-context-body">{selectedMsg.cold_email_body.slice(0, 200)}{selectedMsg.cold_email_body.length > 200 ? '...' : ''}</div>
                  )}
                </div>
              )}

              {/* Reply body with CyberScramble */}
              <div className="inbox-reply-wrap" style={{ flex: 1, overflow: 'auto' }}>
                <div className="inbox-context-label" style={{ color: 'var(--emerald)', marginBottom: 10 }}>💬 Their Reply</div>
                <div className="inbox-detail-body" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 10, padding: 16, minHeight: 80 }}>
                  {selectedMsg.reply_message
                    ? <CyberScramble text={selectedMsg.reply_message} trigger={scrambleTrigger} duration={600} />
                    : <span style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>No reply text stored yet.</span>
                  }
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="inbox-actions">
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quick Actions</div>
                <div className="inbox-action-row">
                  <button
                    className="inbox-action-btn inbox-action-btn--green"
                    disabled={updatingId === selectedMsg.id}
                    onClick={() => handleAction(selectedMsg.id, 'interested')}
                  >
                    ✅ Mark Interested
                  </button>
                  <button
                    className="inbox-action-btn inbox-action-btn--purple"
                    disabled={updatingId === selectedMsg.id}
                    onClick={() => handleAction(selectedMsg.id, 'meeting_booked')}
                  >
                    📅 Meeting Booked
                  </button>
                  <button
                    className="inbox-action-btn inbox-action-btn--red"
                    disabled={updatingId === selectedMsg.id}
                    onClick={() => handleAction(selectedMsg.id, 'archived')}
                  >
                    🗑️ Archive
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="inbox-detail-empty">
            <div className="inbox-empty-icon">
              <Inbox size={36} style={{ opacity: 0.3 }} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 12 }}>Select a reply to analyze</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, opacity: 0.6 }}>AI intent analysis will appear here</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANALYTICS PAGE — ADVANCED DATA VISUALIZATION
   ═══════════════════════════════════════════════════════════ */
function AnalyticsPage({ leads = [] }) {
  // 1. Niche A/B Warfare
  const nicheStats = useMemo(() => {
    const map = {};
    leads.forEach(l => {
      const niche = l.niche_tag || l.niche || 'Unknown';
      if (!map[niche]) map[niche] = { total: 0, replied: 0, interested: 0, meetings: 0 };
      map[niche].total++;
      if (l.status === 'replied' || l.status === 'interested' || l.status === 'meeting_booked') map[niche].replied++;
      if (l.status === 'interested' || l.status === 'meeting_booked') map[niche].interested++;
      if (l.status === 'meeting_booked') map[niche].meetings++;
    });
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [leads]);

  const nicheChartData = {
    labels: nicheStats.map(n => n.name.length > 20 ? n.name.slice(0, 20) + '...' : n.name),
    datasets: [
      { label: 'Total Leads', data: nicheStats.map(n => n.total), backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4 },
      { label: 'Replies', data: nicheStats.map(n => n.replied), backgroundColor: 'rgba(6,182,212,0.6)', borderRadius: 4 },
      { label: 'Interested', data: nicheStats.map(n => n.interested), backgroundColor: 'rgba(139,92,246,0.8)', borderRadius: 4 },
      { label: 'Meetings', data: nicheStats.map(n => n.meetings), backgroundColor: 'rgba(16,185,129,0.9)', borderRadius: 4 },
    ]
  };

  // 2. Sentiment Quality Funnel
  const sentimentStats = useMemo(() => {
    let hot = 0, positive = 0, neutral = 0, notInterested = 0;
    const getScore = (text) => {
      if (!text) return 'neutral';
      const t = text.toLowerCase();
      const pos = ['interest', 'yes', 'call', 'meeting', 'schedule', 'tell me more', 'sounds good', 'let\'s', 'when', 'available', 'book', 'demo', 'love to', 'great', 'perfect'].filter(w => t.includes(w)).length;
      const neg = ['not interest', 'unsubscribe', 'remove', 'stop', 'no thanks', 'not looking', 'don\'t contact', 'do not'].filter(w => t.includes(w)).length;
      if (neg > 0) return 'notInterested';
      if (pos >= 3) return 'hot';
      if (pos >= 1) return 'positive';
      return 'neutral';
    };
    leads.filter(l => l.status === 'replied' || l.status === 'interested' || l.status === 'meeting_booked').forEach(l => {
      if (l.status === 'meeting_booked' || l.status === 'interested') { hot++; return; }
      const intent = getScore(l.reply_message);
      if (intent === 'hot') hot++;
      else if (intent === 'positive') positive++;
      else if (intent === 'notInterested') notInterested++;
      else neutral++;
    });
    return { hot, positive, neutral, notInterested };
  }, [leads]);

  const sentimentChartData = {
    labels: ['Hot Leads 🔥', 'Positive', 'Neutral', 'Not Interested'],
    datasets: [{
      data: [sentimentStats.hot, sentimentStats.positive, sentimentStats.neutral, sentimentStats.notInterested],
      backgroundColor: ['rgba(16,185,129,0.9)', 'rgba(6,182,212,0.8)', 'rgba(245,158,11,0.7)', 'rgba(239,68,68,0.7)'],
      borderColor: 'transparent', hoverOffset: 4
    }]
  };

  // 3. Golden Hours Heatmap
  const heatmapData = useMemo(() => {
    const grid = {};
    leads.forEach(l => {
      if (!l.sent_at && !l.cold_email_sent_at) return;
      if (!l.replied_at) return;
      const sentDate = new Date(l.sent_at || l.cold_email_sent_at);
      const repDate = new Date(l.replied_at);
      const x = sentDate.getHours();
      const y = repDate.getHours();
      const key = `${x},${y}`;
      grid[key] = (grid[key] || 0) + 1;
    });
    const bubbles = [];
    Object.entries(grid).forEach(([key, count]) => {
      const [x, y] = key.split(',').map(Number);
      bubbles.push({ x, y, r: Math.min(25, count * 5 + 3), count });
    });
    return bubbles;
  }, [leads]);

  const heatmapChartData = {
    datasets: [{
      label: 'Replies Density',
      data: heatmapData,
      backgroundColor: 'rgba(139,92,246,0.6)',
      borderColor: 'rgba(139,92,246,1)',
      borderWidth: 1
    }]
  };

  const heatmapOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Sent: ${ctx.raw.x}:00, Replied: ${ctx.raw.y}:00 -> ${ctx.raw.count} Replies`
        },
        backgroundColor: 'rgba(7,7,21,0.95)', titleColor: '#F8FAFC', bodyColor: '#94A3B8', padding: 12, cornerRadius: 10
      }
    },
    scales: {
      x: { title: { display: true, text: 'Sent Time (Hour)', color: 'var(--text-3)' }, min: -1, max: 24, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { stepSize: 2, color: 'var(--text-3)' } },
      y: { title: { display: true, text: 'Reply Time (Hour)', color: 'var(--text-3)' }, min: -1, max: 24, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { stepSize: 2, color: 'var(--text-3)' } },
    }
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94A3B8' } }, tooltip: { backgroundColor: 'rgba(7,7,21,0.95)', titleColor: '#F8FAFC', bodyColor: '#94A3B8', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, padding: 12, cornerRadius: 10 } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', precision: 0 }, border: { display: false } },
      x: { grid: { display: false }, ticks: { color: '#475569' }, border: { display: false } },
    },
  };

  const pieOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#94A3B8', usePointStyle: true, padding: 20 } }, tooltip: { backgroundColor: 'rgba(7,7,21,0.95)', titleColor: '#F8FAFC', bodyColor: '#94A3B8', padding: 12, cornerRadius: 10 } },
    cutout: '65%'
  };

  const geoStats = useMemo(() => {
    const map = {};
    leads.filter(l => l.location).forEach(l => {
      map[l.location] = (map[l.location] || 0) + 1;
    });
    return Object.entries(map).map(([loc, count]) => ({ loc, count })).sort((a,b)=>b.count-a.count);
  }, [leads]);

  return (
    <motion.div className="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Advanced Analytics</h1>
          <p className="page-sub">Next-dimension data visualization for your B2B machine</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        
        <SpotlightCard className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title">⚔️ Niche A/B Warfare</div>
          <div className="card-subtitle">Compare performance and conversion velocity across your target niches</div>
          <div style={{ height: 280, marginTop: 16 }}>
            {nicheStats.length > 0 ? (
              <Bar data={nicheChartData} options={chartOpts} />
            ) : <div className="empty-state" style={{ height: '100%', display:'flex', alignItems:'center', justifyContent:'center'}}>Not enough data yet</div>}
          </div>
        </SpotlightCard>

        <SpotlightCard className="glass-card">
          <div className="card-title">⏰ Golden Hours Heatmap</div>
          <div className="card-subtitle">Correlation between Email Sent Time and Reply Time</div>
          <div style={{ height: 240, marginTop: 16 }}>
            {heatmapData.length > 0 ? (
              <Bubble data={heatmapChartData} options={heatmapOpts} />
            ) : <div className="empty-state" style={{ height: '100%', display:'flex', alignItems:'center', justifyContent:'center'}}>Waiting for reply data...</div>}
          </div>
        </SpotlightCard>

        <SpotlightCard className="glass-card">
          <div className="card-title">🧠 Sentiment Quality Funnel</div>
          <div className="card-subtitle">AI analysis of reply intent to gauge copy effectiveness</div>
          <div style={{ height: 240, marginTop: 16 }}>
            {(sentimentStats.hot + sentimentStats.positive + sentimentStats.neutral + sentimentStats.notInterested) > 0 ? (
              <Doughnut data={sentimentChartData} options={pieOpts} />
            ) : <div className="empty-state" style={{ height: '100%', display:'flex', alignItems:'center', justifyContent:'center'}}>Waiting for reply data...</div>}
          </div>
        </SpotlightCard>

        <SpotlightCard className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title">🌍 Geographic Hit Rate</div>
          <div className="card-subtitle">Top performing locations (populates automatically for new leads)</div>
          <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {geoStats.length > 0 ? (
              geoStats.map(g => (
                <div key={g.loc} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 12, minWidth: 160 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>{g.count} <span style={{fontSize: 12, fontWeight: 400, color: 'var(--text-3)'}}>Leads</span></div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>📍 {g.loc}</div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-3)', fontSize: 13, fontStyle: 'italic', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, width: '100%', textAlign: 'center' }}>
                Geographic tracking initialized. Awaiting new leads with location data.
              </div>
            )}
          </div>
        </SpotlightCard>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════════════════════ */

function InlineEditable({ value, onSave, placeholder = '—' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  const handleSave = () => {
    setIsEditing(false);
    if (val !== value) onSave(val);
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        value={val || ''}
        onChange={e => setVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setIsEditing(false); setVal(value); } }}
        className="inline-edit-input"
        onClick={e => e.stopPropagation()}
      />
    );
  }

  return (
    <span className="inline-editable" onClick={e => { e.stopPropagation(); setIsEditing(true); }}>
      {value || placeholder}
    </span>
  );
}

function SubContactsPanel({ lead, onAddContact, onUpdateContact }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', position: '', status: 'Not Contacted', priority: 'Medium' });

  const handleSaveNew = async () => {
    if (!newContact.name) return;
    await onAddContact(lead.id, newContact);
    setShowAdd(false);
    setNewContact({ name: '', email: '', position: '', status: 'Not Contacted', priority: 'Medium' });
  };

  return (
    <div className="sub-contacts-panel">
      <div className="sub-contacts-header">
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--cyan)' }}>REFERRED CONTACTS</div>
      </div>
      {lead.contacts && lead.contacts.length > 0 && (
        <table className="sub-contacts-table">
          <thead>
            <tr>
              <th>Name</th><th>Position</th><th>Email</th><th>Status</th><th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {lead.contacts.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500, color: '#fff' }}><InlineEditable value={c.name} onSave={val => onUpdateContact(c.id, { name: val })} /></td>
                <td><InlineEditable value={c.position} onSave={val => onUpdateContact(c.id, { position: val })} /></td>
                <td><InlineEditable value={c.email} onSave={val => onUpdateContact(c.id, { email: val })} /></td>
                <td>
                  <select value={c.status} onChange={e => onUpdateContact(c.id, { status: e.target.value })} className="sub-select">
                    <option>Not Contacted</option><option>Contacted</option><option>Replied</option><option>Interested</option><option>Meeting</option><option>Closed</option>
                  </select>
                </td>
                <td>
                  <select value={c.priority} onChange={e => onUpdateContact(c.id, { priority: e.target.value })} className="sub-select">
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {showAdd ? (
        <div className="add-contact-form">
          <input placeholder="Name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} autoFocus />
          <input placeholder="Position" value={newContact.position} onChange={e => setNewContact({...newContact, position: e.target.value})} />
          <input placeholder="Email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} />
          <select value={newContact.status} onChange={e => setNewContact({...newContact, status: e.target.value})}>
            <option>Not Contacted</option><option>Contacted</option><option>Replied</option>
          </select>
          <button onClick={handleSaveNew} className="btn-save-contact">Save</button>
          <button onClick={() => setShowAdd(false)} className="btn-cancel-contact"><X size={14}/></button>
        </div>
      ) : (
        <button className="btn-add-contact" onClick={() => setShowAdd(true)}>+ Add Contact</button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NOTE MODAL (الملقط)
   ═══════════════════════════════════════════════════════════ */
function NoteModal({ lead, onClose, onSave }) {
  const [note, setNote] = useState(lead?.manual_note || '');
  const [color, setColor] = useState(lead?.note_color || 'blue');
  const [saving, setSaving] = useState(false);

  if (!lead) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave(lead.id, note, color);
    setSaving(false);
  };

  const getHex = (c) => c === 'red' ? '#ef4444' : c === 'green' ? '#10b981' : '#3b82f6';

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 99999 }}>
      <motion.div className="intel-panel" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ maxWidth: 420, height: 'auto', position: 'relative', margin: 'auto', top: '15vh', padding: 24, borderRadius: 16 }}>
        <button className="intel-close" onClick={onClose}><X size={16} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div className="intel-avatar" style={{ background: 'var(--glass-2)' }}>
            <Paperclip size={20} color={getHex(color)} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>Attach Note</h2>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{lead.first_name || 'Client'} • {lead.company_name || lead.company || 'Company'}</div>
          </div>
        </div>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Type your note here... (e.g., Call back next Monday, Hot lead!)"
          style={{ width: '100%', height: 120, background: 'var(--bg-2)', border: '1px solid var(--glass-3)', borderRadius: 8, padding: 12, color: '#fff', fontSize: 13, resize: 'none', marginBottom: 16, outline: 'none' }}
        />

        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {['red', 'green', 'blue'].map(c => (
            <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: 'var(--text-2)' }}>
              <input type="radio" name="noteColor" value={c} checked={color === c} onChange={() => setColor(c)} style={{ display: 'none' }} />
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: color === c ? '2px solid #fff' : '2px solid transparent', background: getHex(c), outline: '2px solid transparent', outlineOffset: 2, boxShadow: color === c ? '0 0 10px ' + getHex(c) : 'none', transition: 'all 0.2s' }} />
              {c === 'red' ? 'Urgent / Hot' : c === 'green' ? 'Positive / Follow-up' : 'General Note'}
            </label>
          ))}
        </div>

        <button onClick={handleSave} disabled={saving} style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', padding: '12px 0', borderRadius: 8, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s' }}>
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState({ total: 0, sent: 0, followups: 0, replied: 0, interested: 0, meeting_booked: 0, archived: 0 });
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [noteModalLead, setNoteModalLead] = useState(null);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const campaignsRef = useRef(campaigns);

  useEffect(() => {
    campaignsRef.current = campaigns;
  }, [campaigns]);

  useEffect(() => {
    // Request notification permission on load
    if (window.Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const audio = new Audio('/notification.mp3');

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          console.log('Realtime payload received:', payload);
          if (payload.new && payload.new.status === 'replied' && payload.old?.status !== 'replied') {
            const lead = payload.new;
            const camp = campaignsRef.current.find(c => c.id === lead.campaign_id);
            const campName = camp ? camp.niche : `Campaign ${lead.campaign_id}`;
            const clientName = lead.first_name || 'Client';
            const companyName = lead.company || 'Company';
            
            // Play Sound
            audio.play().catch(e => console.log('Audio play failed:', e));
            
            const title = `New Reply from ${clientName}`;
            const body = `${companyName} — ${campName}`;

            // Show In-App Toast
            setToast({
              id: Date.now(),
              title,
              body,
              lead
            });

            // Add to Notifications List
            setNotifications(prev => [{
              id: Date.now(),
              title,
              body,
              lead,
              time: new Date(),
              read: false
            }, ...prev]);

            // Hide Toast after 6 seconds
            setTimeout(() => setToast(null), 6000);

            // Desktop Notification
            if (window.Notification && Notification.permission === 'granted') {
              new Notification(title, {
                body: body,
                icon: '/vite.svg'
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteLead = async (leadId, e) => {
    if(e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;
    try {
      await supabase.from('leads').delete().eq('id', leadId);
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch(err) { console.error('Delete error', err); }
  };

  const handleSaveNote = async (leadId, note, color) => {
    try {
      await supabase.from('leads').update({ manual_note: note, note_color: color }).eq('id', leadId);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, manual_note: note, note_color: color } : l));
      setNoteModalLead(null);
    } catch(err) { console.error('Save note error', err); }
  };

  const handleUpdateWorkspace = async (leadId, updates) => {
    try {
      await supabase.from('lead_workspace').upsert({ lead_id: leadId, ...updates }, { onConflict: 'lead_id' });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updates } : l));
    } catch(err) { console.error('Workspace update error', err); }
  };

  const handleAddContact = async (leadId, contact) => {
    try {
      const { data, error } = await supabase.from('lead_contacts').insert({ lead_id: leadId, ...contact }).select();
      if (data && data[0]) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, contacts: [...l.contacts, data[0]] } : l));
      }
    } catch(err) { console.error('Add contact error', err); }
  };

  const handleUpdateContact = async (contactId, updates) => {
    try {
      await supabase.from('lead_contacts').update(updates).eq('id', contactId);
      setLeads(prev => prev.map(l => ({
        ...l,
        contacts: l.contacts.map(c => c.id === contactId ? { ...c, ...updates } : c)
      })));
    } catch(err) { console.error('Update contact error', err); }
  };


  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('campaigns').select('*').order('id', { ascending: false });
      if (data && data.length > 0) {
        setCampaigns(data);
        setSelectedCampaignId(data[0].id);
      }
    })();
  }, []);

  const loadCampaignData = useCallback(async (cid, isRefresh = false) => {
    if (!cid) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);

    const { data: camp } = await supabase.from('campaigns').select('*').eq('id', cid).single();
    setCampaign(camp);

    const { data, error } = await supabase.from('leads').select('*, lead_workspace(*), lead_contacts(*)').eq('campaign_id', cid).order('id', { ascending: false }).range(0, 9999);
    if (error) console.error(error);
    if (data) {
      setStats({
        total: data.length,
        new: data.filter(l => l.status === 'new').length,
        sent: data.filter(l => l.status === 'cold_email_sent' || l.status === 'sent').length,
        followups: data.filter(l => ['follow_up_1_sent', 'follow_up_2_sent', 'follow_up_3_sent', 'followup_1', 'followup_2', 'followup_3'].includes(l.status)).length,
        replied: data.filter(l => l.status === 'replied').length,
        archived: data.filter(l => l.status === 'archived').length,
        bounced: data.filter(l => l.status === 'bounced').length,
        interested: data.filter(l => l.status === 'interested').length,
        meeting_booked: data.filter(l => l.status === 'meeting_booked').length,
      });
      const mergedLeads = data.map(lead => {
        const ws = lead.lead_workspace && lead.lead_workspace.length > 0 ? lead.lead_workspace[0] : null;
        return {
          ...lead,
          display_name: ws?.display_name || null,
          display_email: ws?.display_email || null,
          display_company: ws?.display_company || null,
          reply_type: ws?.reply_type || 'Standard',
          manual_note: ws?.manual_note || lead.manual_note,
          note_color: ws?.note_color || lead.note_color,
          contacts: lead.lead_contacts || []
        };
      });
      setLeads(mergedLeads);
    }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedCampaignId) loadCampaignData(selectedCampaignId);
  }, [selectedCampaignId, loadCampaignData]);

  const handleCampaignChange = (id) => {
    setSelectedCampaignId(id);
    setActivePage('dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage stats={stats} leads={leads} loading={loading} campaign={campaign} campaigns={campaigns} selectedCampaignId={selectedCampaignId} onCampaignChange={handleCampaignChange} onRefresh={() => loadCampaignData(selectedCampaignId, true)} refreshing={refreshing} onLeadClick={setSelectedLead} onDeleteLead={handleDeleteLead} onNoteClick={setNoteModalLead} onUpdateWorkspace={handleUpdateWorkspace} onAddContact={handleAddContact} onUpdateContact={handleUpdateContact} />;
      case 'leads':
        return <LeadsPage leads={leads} loading={loading} campaign={campaign} onLeadClick={setSelectedLead} onDeleteLead={handleDeleteLead} onNoteClick={setNoteModalLead} onUpdateWorkspace={handleUpdateWorkspace} onAddContact={handleAddContact} onUpdateContact={handleUpdateContact} />;
      case 'campaigns':
        return <CampaignsPage campaigns={campaigns} selectedCampaignId={selectedCampaignId} onSelect={handleCampaignChange} stats={stats} loading={loading} />;
      case 'analytics':
        return <AnalyticsPage leads={leads} />;
      case 'inbox':
        return <InboxPage />;
      case 'filters':
        return <FiltersPage />;
      case 'agents':
        return <ComingSoonPage icon={<Bot size={40} />} title="AI Agents" desc="Configure and monitor your AI agents — reply detection, follow-up engine, archive cleaner, and more." />;
      case 'automations':
        return <ComingSoonPage icon={<Cpu size={40} />} title="Automations" desc="Manage your n8n workflows, triggers, and automation sequences directly from this panel." />;
      case 'settings':
        return <ComingSoonPage icon={<Settings size={40} />} title="Settings" desc="Manage your account, connected inboxes, API keys, and team members." />;
      default:
        return null;
    }
  };

  return (
    <>
      <AINetworkCanvas />
      <SystemTicker />
      <div className="layout">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <div className="main">
          {/* TOP BAR */}
          <motion.div className="topbar" initial={{ y: -15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <div className="topbar-left">
              <span className="topbar-title">Command Center</span>
              <CampaignSelector
                campaigns={campaigns}
                selectedId={selectedCampaignId}
                onSelect={handleCampaignChange}
                loading={campaigns.length === 0}
              />
            </div>
            <div className="topbar-right">
              <button
                className={`refresh-btn ${refreshing ? 'refresh-btn--spinning' : ''}`}
                onClick={() => loadCampaignData(selectedCampaignId, true)}
                title="Refresh data"
              >
                <RefreshCw size={14} />
              </button>
              <div 
                style={{ position: 'relative', cursor: 'pointer', padding: '6px', color: 'var(--text-2)', display: 'flex' }} 
                title="Notifications"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }
                }}
              >
                <Bell size={16} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: 'var(--red)', borderRadius: '50%', border: '2px solid #000' }} />
                )}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: 12,
                        width: 320, background: 'rgba(20,20,20,0.95)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 1000
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 600, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Notifications</span>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 400, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 10 }}>
                          {notifications.length} Total
                        </span>
                      </div>
                      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                            No new notifications yet.
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n.id} 
                              style={{ 
                                padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.02)',
                                display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer',
                                transition: 'background 0.2s', background: n.read ? 'transparent' : 'rgba(139,92,246,0.05)'
                              }}
                              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                              onMouseOut={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(139,92,246,0.05)'}
                              onClick={() => {
                                setSelectedLead(n.lead);
                                setShowNotifications(false);
                              }}
                            >
                              <div style={{ background: 'var(--emerald)', borderRadius: '50%', padding: 8, display: 'flex', marginTop: 2 }}>
                                <Mail size={14} color="#000" />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>{n.title}</div>
                                <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>{n.body}</div>
                                <div style={{ color: 'var(--text-3)', fontSize: 10, marginTop: 6, opacity: 0.7 }}>
                                  {n.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="status-pill"><span className="pulse-dot" />3 Agents Running</div>
            </div>
          </motion.div>

          {/* PAGE CONTENT */}
          <AnimatePresence mode="wait">
            <motion.div key={activePage} style={{ flex: 1, overflow: 'hidden auto' }}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {selectedLead && (
            <LeadIntelPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {noteModalLead && (
            <NoteModal lead={noteModalLead} onClose={() => setNoteModalLead(null)} onSave={handleSaveNote} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, x: 50, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
                background: 'rgba(15, 15, 15, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16, padding: '16px 20px', width: 340,
                boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
                display: 'flex', gap: 16, alignItems: 'flex-start',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedLead(toast.lead);
                setToast(null);
              }}
            >
              <div style={{ background: 'var(--emerald)', borderRadius: '50%', padding: 10, display: 'flex', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
                <Mail size={20} color="#000" />
              </div>
              <div style={{ flex: 1, paddingTop: 2 }}>
                <div style={{ color: 'white', fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>{toast.title}</div>
                <div style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>{toast.body}</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setToast(null); }} 
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4, display: 'flex' }}
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
