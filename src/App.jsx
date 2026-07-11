import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Send, Inbox, Settings,
  Cpu, Zap, BarChart2, TrendingUp, Activity, Bot,
  ChevronDown, Search, RefreshCw, Filter, Tag, Mail, X, Clock, Building2,
  ExternalLink, Globe, Briefcase, Target, ChevronRight, CheckCircle2, Circle
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './index.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ═══════════════════════════════════════════════════════════
   PARTICLE CANVAS
   ═══════════════════════════════════════════════════════════ */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d');
    let raf;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      a: Math.random() * 0.4 + 0.1,
      col: ['139,92,246', '6,182,212', '255,255,255'][Math.floor(Math.random() * 3)]
    }));
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      const g1 = ctx.createRadialGradient(c.width * 0.75, c.height * 0.25, 0, c.width * 0.75, c.height * 0.25, 400);
      g1.addColorStop(0, 'rgba(139,92,246,0.06)'); g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, c.width, c.height);
      const g2 = ctx.createRadialGradient(c.width * 0.15, c.height * 0.8, 0, c.width * 0.15, c.height * 0.8, 300);
      g2.addColorStop(0, 'rgba(6,182,212,0.04)'); g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 100) { ctx.beginPath(); ctx.strokeStyle = `rgba(139,92,246,${0.05 * (1 - d / 100)})`; ctx.lineWidth = 0.5; ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
      }
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.col},${p.a})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} className="canvas-bg" />;
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════ */
function AnimCounter({ value, loading }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (loading || value === 0) { setN(value); return; }
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
    // legacy
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
   SIDEBAR — now with active page state
   ═══════════════════════════════════════════════════════════ */
function Sidebar({ activePage, onNavigate }) {
  const navItems = [
    { l: 'Dashboard', i: <LayoutDashboard size={15} />, page: 'dashboard' },
    { l: 'Leads', i: <Users size={15} />, page: 'leads' },
    { l: 'Campaigns', i: <Send size={15} />, page: 'campaigns' },
    { l: 'Analytics', i: <BarChart2 size={15} />, page: 'analytics' },
    { l: 'Inbox', i: <Inbox size={15} />, page: 'inbox' },
  ];
  const sysItems = [
    { l: 'AI Agents', i: <Bot size={15} />, page: 'agents' },
    { l: 'Automations', i: <Cpu size={15} />, page: 'automations' },
    { l: 'Settings', i: <Settings size={15} />, page: 'settings' },
  ];

  return (
    <motion.div className="sidebar" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="sidebar-logo">
        <div className="logo-icon"><Zap size={18} color="white" /></div>
        <span className="logo-text">Voxora</span>
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
   METRIC CARD
   ═══════════════════════════════════════════════════════════ */
function MetricCard({ label, value, icon, variant, badge, sub, loading, idx }) {
  return (
    <motion.div className={`glass-card metric-card metric-${variant}`}
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: idx * 0.07, ease: [0.23, 1, 0.32, 1] }}>
      <div className="metric-header"><span className="metric-label">{label}</span><div className="metric-icon-wrap">{icon}</div></div>
      <div className="metric-value"><AnimCounter value={value} loading={loading} /></div>
      {!loading && <div className="metric-footer"><span className="metric-badge">{badge}</span><span className="metric-sub">{sub}</span></div>}
    </motion.div>
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
function DashboardPage({ stats, leads, loading, campaign, campaigns, selectedCampaignId, onCampaignChange, onRefresh, refreshing }) {
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
      {/* HERO */}
      <motion.div className="hero-banner" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="hero-greeting">AI AUTOMATION COMMAND CENTER</div>
        <div className="hero-title">Your Pipeline, Automated</div>
        <div className="hero-subtitle">Real-time intelligence. Every lead tracked, every follow-up automated, every reply detected — all running silently in the background.</div>
      </motion.div>

      {/* KPI CARDS */}
      <div className="metrics-grid">
        <MetricCard label="Total Leads" value={stats.total} icon={<Users size={14} />} variant="purple" badge={`${stats.total - stats.archived} active`} sub="in pipeline" loading={loading} idx={0} />
        <MetricCard label="Emails Sent" value={stats.sent + stats.followups + stats.replied + stats.interested + stats.meeting_booked} icon={<Send size={14} />} variant="cyan" badge="Delivered" sub="across 20 inboxes" loading={loading} idx={1} />
        <MetricCard label="Reply Rate" value={replyRate} icon={<TrendingUp size={14} />} variant="emerald" badge="%" sub={`${stats.replied + stats.interested + stats.meeting_booked} replies`} loading={loading} idx={2} />
        <MetricCard label="Follow-ups" value={stats.followups} icon={<Activity size={14} />} variant="amber" badge="Running" sub="auto-scheduled" loading={loading} idx={3} />
      </div>

      {/* CHART + AI PANEL */}
      <div className="mid-grid">
        <motion.div className="glass-card chart-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.3 }}>
          <div className="card-title">Conversion Funnel</div>
          <div className="card-subtitle">Lead journey from first touch to meeting booked</div>
          <div style={{ height: 220 }}><Bar data={chartData} options={chartOpts} /></div>
        </motion.div>

        <motion.div className="glass-card ai-panel" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.35 }}>
          <div className="ai-panel-header">
            <div className="ai-panel-icon"><Bot size={14} color="white" /></div>
            <div><div className="card-title" style={{ marginBottom: 0 }}>AI Agents</div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>Live system status</div></div>
          </div>
          <div className="agent-row"><div className="agent-dot active" /><div className="agent-info"><div className="agent-name">Reply Detection</div><div className="agent-desc">Monitoring 20 SMTP inboxes</div></div><span className="agent-badge badge-active">Live</span></div>
          <div className="agent-row"><div className="agent-dot scheduled" /><div className="agent-info"><div className="agent-name">Follow-up Engine</div><div className="agent-desc">Next run: 9:00 AM</div></div><span className="agent-badge badge-scheduled">Queued</span></div>
          <div className="agent-row"><div className="agent-dot active" /><div className="agent-info"><div className="agent-name">Archive Cleaner</div><div className="agent-desc">Day 13 → auto-archive</div></div><span className="agent-badge badge-active">Live</span></div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}><span>Archived leads</span><span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{stats.archived}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}><span>Meetings booked</span><span style={{ color: 'var(--emerald)', fontWeight: 600 }}>{stats.meeting_booked}</span></div>
          </div>
        </motion.div>
      </div>

      {/* LEADS TABLE — preview only on dashboard */}
      <motion.div className="glass-card table-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.4 }}>
        <div className="table-header">
          <div>
            <div className="card-title">Recent Leads</div>
            <div className="card-subtitle" style={{ marginBottom: 0 }}>
              {campaign ? `Campaign #${campaign.id} · ${campaign.name}` : '—'} · {leads.length} leads total
              {campaign?.niche && <span className="niche-tag" style={{ marginLeft: 8 }}>{campaign.niche}</span>}
            </div>
          </div>
        </div>
        <LeadsTable leads={leads.slice(0, 20)} loading={loading} />
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
      {/* Left: icon + line */}
      <div className="timeline-left">
        <div className={`timeline-dot ${isFuture ? 'timeline-dot--future' : ''}`} style={{ '--dot-color': color }}>
          {isFuture
            ? <Circle size={8} style={{ opacity: 0.4 }} />
            : <CheckCircle2 size={10} color="white" />
          }
        </div>
        <div className="timeline-line" />
      </div>

      {/* Right: content */}
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
      body: lead.cold_email_body,
      sender: lead.cold_email_sender,
      sentAt: lead.cold_email_sent_at,
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
      {/* Backdrop */}
      <motion.div
        className="intel-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="intel-panel"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Panel Header */}
        <div className="intel-panel-header">
          <div className="intel-avatar">{initials}</div>
          <div className="intel-header-info">
            <div className="intel-name">{lead.first_name || '—'}</div>
            <div className="intel-email">{lead.email}</div>
          </div>
          <button className="intel-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Scrollable body */}
        <div className="intel-panel-body">

          {/* Company Card */}
          <div className="intel-section">
            <div className="intel-company-card">
              <div className="intel-company-left">
                <Building2 size={14} style={{ color: 'var(--purple-bright)', flexShrink: 0 }} />
                <div>
                  <div className="intel-company-name">{lead.company_name || lead.company || '—'}</div>
                  {lead.job_title && <div className="intel-job-title">{lead.job_title}</div>}
                </div>
              </div>
              {lead.website && (
                <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="intel-website-btn">
                  <Globe size={11} /> Visit Site <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>

          {/* AI Intelligence Tags */}
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

          {/* Status + Reply info */}
          <div className="intel-section" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusBadge status={lead.status} />
            {lead.replied_at && (
              <span style={{ fontSize: 11, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={11} /> Replied {new Date(lead.replied_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Outreach Timeline */}
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
function LeadsTable({ leads, loading }) {
  const [selectedLead, setSelectedLead] = useState(null);

  if (loading) return <div className="empty-state">Loading leads...</div>;
  if (leads.length === 0) return <div className="empty-state">No leads found for this campaign yet.</div>;
  return (
    <>
      <LeadIntelPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
      <table className="leads-table">
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>Company</th><th>Email</th>
            <th>Status</th><th>Niche</th><th>Last Sent</th><th style={{ textAlign: 'center' }}>Intel</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => {
            const lastSentAt = lead.follow_up_3_sent_at || lead.follow_up_2_sent_at || lead.follow_up_1_sent_at || lead.cold_email_sent_at;
            const hasMsgs = !!(lead.cold_email_body || lead.follow_up_1_body || lead.follow_up_2_body || lead.follow_up_3_body);
            return (
              <tr key={lead.id} onClick={() => setSelectedLead(lead)} style={{ cursor: 'pointer' }}>
                <td style={{ color: 'var(--text-3)', fontSize: 11 }}>{i + 1}</td>
                <td className="lead-name">
                  <div>{lead.first_name || '—'}</div>
                  {lead.job_title && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{lead.job_title}</div>}
                </td>
                <td>
                  {lead.website
                    ? <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="company-link">{lead.company_name || lead.company || '—'}</a>
                    : (lead.company_name || lead.company || '—')
                  }
                </td>
                <td className="lead-email">{lead.email}</td>
                <td><StatusBadge status={lead.status} /></td>
                <td>{lead.niche_tag ? <span className="niche-tag">{lead.niche_tag}</span> : (lead.niche ? <span className="niche-tag">{lead.niche}</span> : '—')}</td>
                <td style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {lastSentAt ? new Date(lastSentAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    className={`msg-btn ${hasMsgs ? 'msg-btn--has' : 'msg-btn--empty'}`}
                    onClick={e => { e.stopPropagation(); setSelectedLead(lead); }}
                    title="View lead intelligence"
                  >
                    <Mail size={13} />
                  </button>
                </td>
              </tr>
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
function LeadsPage({ leads, loading, campaign }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [nicheFilter, setNicheFilter] = useState('all');

  const statuses = ['all', 'new', 'cold_email_sent', 'follow_up_1_sent', 'follow_up_2_sent', 'follow_up_3_sent', 'replied', 'archived', 'bounced'];
  const niches = ['all', ...new Set(leads.map(l => l.niche_tag || l.niche).filter(Boolean))];

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.first_name?.toLowerCase().includes(search.toLowerCase()) || l.company_name?.toLowerCase().includes(search.toLowerCase()) || l.company?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase());
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

      {/* Filters */}
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
        <LeadsTable leads={filtered} loading={loading} />
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
   INBOX PAGE
   ═══════════════════════════════════════════════════════════ */
function InboxPage() {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState('All');
  const [selectedMsgId, setSelectedMsgId] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('scraped_leads')
        .select('*')
        .eq('status', 'replied')
        .order('replied_at', { ascending: false, nullsFirst: false });
      if (data) setReplies(data);
      setLoading(false);
    })();
  }, []);

  const accounts = ['All', ...new Set(replies.map(r => r.sender).filter(Boolean))];
  const filtered = selectedAccount === 'All' ? replies : replies.filter(r => r.sender === selectedAccount);
  const selectedMsg = replies.find(r => r.id === selectedMsgId);

  return (
    <motion.div className="inbox-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Sidebar: Accounts */}
      <div className="inbox-sidebar">
        <div className="inbox-sidebar-header">Inboxes</div>
        <div className="inbox-sidebar-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-3)' }}>Loading...</div>
          ) : (
            accounts.map(acc => {
              const count = acc === 'All' ? replies.length : replies.filter(r => r.sender === acc).length;
              return (
                <button
                  key={acc}
                  className={`inbox-account-btn ${selectedAccount === acc ? 'inbox-account-btn--active' : ''}`}
                  onClick={() => { setSelectedAccount(acc); setSelectedMsgId(null); }}
                >
                  <div className="inbox-account-dot" />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{acc}</span>
                  <span style={{ opacity: 0.6, fontSize: 11 }}>{count}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Middle: Message List */}
      <div className="inbox-list">
        <div className="inbox-list-scroll">
          {filtered.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No replies found.</div>
          )}
          {filtered.map(msg => (
            <div
              key={msg.id}
              className={`inbox-msg-card ${selectedMsgId === msg.id ? 'inbox-msg-card--active' : ''}`}
              onClick={() => setSelectedMsgId(msg.id)}
            >
              <div className="inbox-msg-head">
                <span className="inbox-msg-name">{msg.name || 'Unknown'}</span>
                <span className="inbox-msg-time">
                  {msg.replied_at ? new Date(msg.replied_at).toLocaleDateString() : ''}
                </span>
              </div>
              <div className="inbox-msg-company">
                <Building2 size={12} /> {msg.company || 'Unknown Company'}
              </div>
              <div className="inbox-msg-snippet">
                {msg.reply_message}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Message Detail */}
      <div className="inbox-detail">
        {selectedMsg ? (
          <>
            <div className="inbox-detail-header">
              <div className="inbox-detail-name">{selectedMsg.name}</div>
              <div className="inbox-detail-meta">
                <span><Mail size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}/> {selectedMsg.email}</span>
                <span><Building2 size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}/> {selectedMsg.company}</span>
                <span className="niche-tag" style={{ marginTop: 0 }}>{selectedMsg.niche}</span>
              </div>
              <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="status-dot" style={{ background: 'var(--emerald)' }} />
                Received by: <strong style={{ color: 'var(--text-2)' }}>{selectedMsg.sender}</strong>
              </div>
            </div>
            <div className="inbox-detail-body">
              {selectedMsg.reply_message}
            </div>
          </>
        ) : (
          <div className="inbox-detail-empty">
            <Inbox size={48} style={{ opacity: 0.2 }} />
            <div>Select a message to read</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState({ total: 0, sent: 0, followups: 0, replied: 0, interested: 0, meeting_booked: 0, archived: 0 });
  const [leads, setLeads] = useState([]);

  // Load all campaigns on mount
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('scraping_jobs').select('*').order('id', { ascending: false });
      if (data && data.length > 0) {
        setCampaigns(data);
        setSelectedCampaignId(data[0].id); // default to latest
      }
    })();
  }, []);

  // Load leads whenever selected campaign changes
  const loadCampaignData = useCallback(async (cid, isRefresh = false) => {
    if (!cid) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);

    const { data: camp } = await supabase.from('scraping_jobs').select('*').eq('id', cid).single();
    setCampaign(camp);

    const { data, error } = await supabase.from('scraped_leads').select('*').eq('campaign_id', cid).order('id', { ascending: false }).range(0, 9999);
    if (error) console.error(error);
    if (data) {
      setStats({
        total: data.length,
        new: data.filter(l => l.status === 'new').length,
        sent: data.filter(l => l.status === 'cold_email_sent').length,
        followups: data.filter(l => ['follow_up_1_sent','follow_up_2_sent','follow_up_3_sent'].includes(l.status)).length,
        replied: data.filter(l => l.status === 'replied').length,
        archived: data.filter(l => l.status === 'archived').length,
        bounced: data.filter(l => l.status === 'bounced').length,
      });
      setLeads(data);
    }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedCampaignId) loadCampaignData(selectedCampaignId);
  }, [selectedCampaignId, loadCampaignData]);

  const handleCampaignChange = (id) => {
    setSelectedCampaignId(id);
    setActivePage('dashboard'); // switch to dashboard when campaign changes
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage stats={stats} leads={leads} loading={loading} campaign={campaign} campaigns={campaigns} selectedCampaignId={selectedCampaignId} onCampaignChange={handleCampaignChange} onRefresh={() => loadCampaignData(selectedCampaignId, true)} refreshing={refreshing} />;
      case 'leads':
        return <LeadsPage leads={leads} loading={loading} campaign={campaign} />;
      case 'campaigns':
        return <CampaignsPage campaigns={campaigns} selectedCampaignId={selectedCampaignId} onSelect={handleCampaignChange} stats={stats} loading={loading} />;
      case 'analytics':
        return <ComingSoonPage icon={<BarChart2 size={40} />} title="Analytics" desc="Deep dive into open rates, click rates, reply rates, and campaign performance over time. Connected to your n8n workflows." />;
      case 'inbox':
        return <InboxPage />;
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
      <ParticleCanvas />
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
      </div>
    </>
  );
}
