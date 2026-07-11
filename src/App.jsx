import { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import RoomPackageModal from './components/RoomPackageModal.jsx';
import CardModal from './components/CardModal.jsx';
import Dashboard from './views/Dashboard.jsx';
import Reservaciones from './views/Reservaciones.jsx';
import Habitaciones from './views/Habitaciones.jsx';
import Paquetes from './views/Paquetes.jsx';
import CheckIn from './views/CheckIn.jsx';
import Configuracion from './views/Configuracion.jsx';
import GuestApp from './guest/GuestApp.jsx';
import { usePersistentState } from './hooks/usePersistentState.js';
import { DEF_ROOMS, DEF_PKGS, DEF_STRUCT, DEF_CONFIG, STAFF_NAME } from './data/mockData.js';

const isGuestHash = () => typeof window !== 'undefined' && window.location.hash === '#huesped';

export default function App() {
  const [route, setRoute] = useState(isGuestHash() ? 'guest' : 'admin');

  useEffect(() => {
    const onHash = () => setRoute(isGuestHash() ? 'guest' : 'admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const goGuest = () => { window.location.hash = 'huesped'; };
  const goAdmin = () => { window.location.hash = ''; };

  if (route === 'guest') return <GuestApp onGoAdmin={goAdmin} />;
  return <AdminApp onGoGuest={goGuest} />;
}

function AdminApp({ onGoGuest }) {
  const rootRef = useRef(null);
  const [tab, setTab] = useState('dash');
  const [rooms, setRooms] = usePersistentState('estancia-rooms', DEF_ROOMS);
  const [pkgs, setPkgs] = usePersistentState('estancia-pkgs', DEF_PKGS);
  const [config, setConfig] = usePersistentState('estancia-config', DEF_CONFIG);
  const [structure, setStructure] = usePersistentState('estancia-structure', DEF_STRUCT);

  const [modal, setModal] = useState(null);
  const [selResCode, setSelResCode] = useState('CA-4102');
  const [cardPhase, setCardPhase] = useState(null);
  const [cardContext, setCardContext] = useState(null);
  const [issued, setIssued] = useState({});

  const timersRef = useRef([]);

  useEffect(() => {
    if (rootRef.current) rootRef.current.style.setProperty('--ac', config.accent || '#B8552F');
  }, [config.accent]);

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  useEffect(() => () => clearTimers(), []);

  const startCardFlow = (selRes, room) => {
    clearTimers();
    setCardContext({ selRes, room });
    setCardPhase('search');
    timersRef.current.push(setTimeout(() => setCardPhase('found'), 1700));
    timersRef.current.push(setTimeout(() => setCardPhase('writing'), 4000));
    timersRef.current.push(setTimeout(() => {
      setCardPhase('done');
      setIssued((s) => ({ ...s, [selRes.code]: (s[selRes.code] || 0) + 1 }));
    }, 6200));
  };

  const cardAgain = () => {
    clearTimers();
    setCardPhase('found');
    timersRef.current.push(setTimeout(() => setCardPhase('writing'), 2300));
    timersRef.current.push(setTimeout(() => {
      setCardPhase('done');
      const code = cardContext?.selRes?.code;
      if (code) setIssued((s) => ({ ...s, [code]: (s[code] || 0) + 1 }));
    }, 4500));
  };
  const closeCard = () => { clearTimers(); setCardPhase(null); };

  const openRoomModal = (r) => {
    const draft = r ? { ...r, amenities: [...(r.amenities || [])] } :
      { id: 'r' + Date.now(), num: '', name: '', type: 'Doble', cap: 2, m2: 30, price: 2500, bed: 'Cama queen', active: true, desc: '', amenities: [] };
    setModal({ kind: 'room', isNew: !r, draft });
  };
  const openPkgModal = (p) => {
    const draft = p ? { ...p } : { id: 'p' + Date.now(), name: '', price: 300, unit: 'por persona', active: true, desc: '' };
    setModal({ kind: 'pkg', isNew: !p, draft });
  };
  const updateDraft = (field, val) => setModal((m) => (m ? { ...m, draft: { ...m.draft, [field]: val } } : m));
  const saveModal = () => {
    if (!modal) return;
    const { kind, draft } = modal;
    if (!(draft.name || '').trim()) { setModal(null); return; }
    if (kind === 'room') {
      const exists = rooms.some((r) => r.id === draft.id);
      setRooms(exists ? rooms.map((r) => (r.id === draft.id ? { ...draft } : r)) : [...rooms, { ...draft }]);
    } else {
      const exists = pkgs.some((p) => p.id === draft.id);
      setPkgs(exists ? pkgs.map((p) => (p.id === draft.id ? { ...draft } : p)) : [...pkgs, { ...draft }]);
    }
    setModal(null);
  };
  const deleteModal = () => {
    if (!modal) return;
    if (modal.kind === 'room') setRooms(rooms.filter((r) => r.id !== modal.draft.id));
    else setPkgs(pkgs.filter((p) => p.id !== modal.draft.id));
    setModal(null);
  };

  return (
    <div ref={rootRef} style={{
      display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr)',
      height: '100vh', overflow: 'hidden',
      background: '#F3EDE0', color: '#2E2418',
      fontFamily: 'Karla, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <Sidebar tab={tab} onNavigate={setTab} onGoGuest={onGoGuest} config={config} staffName={STAFF_NAME} />

      <div style={{ overflowY: 'auto', position: 'relative' }}>
        {tab === 'dash'  && <Dashboard config={config} staffName={STAFF_NAME} rooms={rooms} onCheckIn={(code) => { setSelResCode(code); setTab('chk'); }} />}
        {tab === 'res'   && <Reservaciones structure={structure} rooms={rooms} onGoConfig={() => setTab('cfg')} />}
        {tab === 'rooms' && <Habitaciones rooms={rooms} setRooms={setRooms} onEdit={openRoomModal} onNew={() => openRoomModal(null)} />}
        {tab === 'pkgs'  && <Paquetes pkgs={pkgs} setPkgs={setPkgs} onEdit={openPkgModal} onNew={() => openPkgModal(null)} />}
        {tab === 'chk'   && <CheckIn rooms={rooms} selResCode={selResCode} setSelResCode={setSelResCode} issued={issued} onStartCardFlow={startCardFlow} accent={config.accent} />}
        {tab === 'cfg'   && <Configuracion config={config} setConfig={setConfig} structure={structure} setStructure={setStructure} />}
      </div>

      <RoomPackageModal
        modal={modal}
        updateDraft={updateDraft}
        onClose={() => setModal(null)}
        onSave={saveModal}
        onDelete={deleteModal}
      />

      {cardPhase && cardContext && (
        <CardModal
          phase={cardPhase}
          selRes={cardContext.selRes}
          room={cardContext.room}
          config={config}
          onClose={closeCard}
          onAgain={cardAgain}
        />
      )}
    </div>
  );
}
