import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { CalendarRange, KanbanSquare, Wallet, Users, Stamp } from 'lucide-react';
import { ToastProvider } from './components/ui.jsx';
import Island from './components/Island.jsx';
import Schedule from './screens/Schedule.jsx';
import Board from './screens/Board.jsx';
import Budget from './screens/Budget.jsx';
import { Meetings, MeetingDetail } from './screens/Meetings.jsx';
import Trademark from './screens/Trademark.jsx';
import { useBoot } from './lib/collection.js';

const NAV = [
  { to: '/calendar', label: '캘린더', icon: CalendarRange },
  { to: '/todo', label: '해야 할 일', icon: KanbanSquare },
  { to: '/money', label: '지출', icon: Wallet },
  { to: '/meetings', label: '미팅 기록', icon: Users },
  { to: '/trademark', label: '상표', icon: Stamp },
];

function Shell({ children }) {
  const loc = useLocation();
  const { ready, error } = useBoot();
  return (
    <div className="app">
      <aside className="sidebar" aria-label="주 메뉴">
        <div className="brand"><div className="brand-mark" aria-hidden="true">M</div><div><div className="t-headline">마에로 팀 보드</div><div className="t-caption secondary">팀 버터와플</div></div></div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><n.icon size={20} aria-hidden="true" />{n.label}</NavLink>
        ))}
      </aside>
      <Island />
      <main className="main" id="main" aria-busy={!ready}>
        {error && <p className="note" role="status" style={{ textAlign: 'center', paddingBottom: 12 }}>{error}</p>}
        {ready ? children : <div className="splash"><span className="spin" aria-label="불러오는 중" /></div>}
      </main>
      <nav className="tabbar" aria-label="탭">
        {NAV.map((t) => {
          const active = loc.pathname.startsWith(t.to);
          return <NavLink key={t.to} to={t.to} className={`tab ${active ? 'active' : ''}`}><t.icon size={24} strokeWidth={active ? 2.4 : 1.8} aria-hidden="true" /><span>{t.label}</span></NavLink>;
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Shell>
        <Routes>
          <Route path="/calendar" element={<Schedule />} />
          <Route path="/todo" element={<Board />} />
          <Route path="/money" element={<Budget />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/meetings/:id" element={<MeetingDetail />} />
          <Route path="/trademark" element={<Trademark />} />
          <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
      </Shell>
    </ToastProvider>
  );
}
