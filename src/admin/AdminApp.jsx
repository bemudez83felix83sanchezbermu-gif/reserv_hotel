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
import Housekeeping from './views/Housekeeping.jsx';
import Bloqueos from './views/Bloqueos.jsx';
import Waitlist from './views/Waitlist.jsx';
import Cortesias from './views/Cortesias.jsx';
import Amenidades from './views/Amenidades.jsx';
import Huespedes from './views/Huespedes.jsx';
import Empresas from './views/Empresas.jsx';
import Canales from './views/Canales.jsx';
import Descuentos from './views/Descuentos.jsx';
import Temporadas from './views/Temporadas.jsx';
import TagsHuespedes from './views/TagsHuespedes.jsx';
import Solicitudes from './views/Solicitudes.jsx';
import AlbercaConfig from './views/AlbercaConfig.jsx';
import AlbercaBookings from './views/AlbercaBookings.jsx';
import Encuestas from './views/Encuestas.jsx';
import PlantillasImpresion from './views/PlantillasImpresion.jsx';
import PlantillasMensajes from './views/PlantillasMensajes.jsx';
import Textos from './views/Textos.jsx';
import FeatureFlags from './views/FeatureFlags.jsx';
import Catalogos from './views/Catalogos.jsx';
import Roles from './views/Roles.jsx';
import Staff from './views/Staff.jsx';
import CierreContable from './views/CierreContable.jsx';
import Notificaciones from './views/Notificaciones.jsx';
import Auditoria from './views/Auditoria.jsx';
import { useAuth } from '../shared/hooks/useAuth.jsx';
import { useConfig } from '../shared/hooks/useConfig.jsx';
import { usePackages } from '../shared/hooks/usePackages.jsx';
import { useRooms } from '../shared/hooks/useRooms.jsx';
import { useBuildings } from '../shared/hooks/useBuildings.jsx';
import { useRoomTypes, useBedTypes, useAmenitiesCatalog } from '../shared/hooks/useCatalog.jsx';
import { useMutation } from '../shared/hooks/useQuery.jsx';
import { activateKeyCard } from '../shared/api/keyCards.js';

export default function AdminApp({ onGoGuest }) {
  const rootRef = useRef(null);
  const { staff, signOut } = useAuth();
  const { config } = useConfig();
  const staffName = staff?.full_name || 'Recepción';

  const [tab, setTab] = useState('dash');
  const packagesApi = usePackages();
  const pkgs = packagesApi.packages;
  const roomsApi = useRooms();
  const rooms = roomsApi.rooms;
  const buildingsApi = useBuildings();
  const buildings = buildingsApi.buildings;
  const roomTypesQ = useRoomTypes();
  const bedTypesQ = useBedTypes();
  const amenitiesQ = useAmenitiesCatalog();

  const [modal, setModal] = useState(null);
  const [selResCode, setSelResCode] = useState(null);
  const [cardPhase, setCardPhase] = useState(null);
  const [cardContext, setCardContext] = useState(null);

  const keyCardsKey = cardContext?.selRes?.id ? `hotel.key_cards.res:${cardContext.selRes.id}` : null;
  const activateCardMut = useMutation(activateKeyCard, { invalidate: keyCardsKey ? [keyCardsKey] : [] });

  const timersRef = useRef([]);

  useEffect(() => {
    if (rootRef.current) rootRef.current.style.setProperty('--ac', config?.accent || '#B8552F');
  }, [config?.accent]);

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  useEffect(() => () => clearTimers(), []);

  const issueCard = async (selRes, room) => {
    try {
      const cardUid = 'NFC-' + Math.random().toString(36).slice(2, 10).toUpperCase();
      await activateCardMut.mutate({ reservationId: selRes.id, roomId: room?.id, activatedBy: staff?.id, cardUid });
    } catch (e) {
      console.error('activateKeyCard failed', e);
    }
  };

  const startCardFlow = (selRes, room) => {
    clearTimers();
    setCardContext({ selRes, room });
    setCardPhase('search');
    timersRef.current.push(setTimeout(() => setCardPhase('found'), 1700));
    timersRef.current.push(setTimeout(() => setCardPhase('writing'), 4000));
    timersRef.current.push(setTimeout(() => {
      setCardPhase('done');
      issueCard(selRes, room);
    }, 6200));
  };

  const cardAgain = () => {
    clearTimers();
    setCardPhase('found');
    timersRef.current.push(setTimeout(() => setCardPhase('writing'), 2300));
    timersRef.current.push(setTimeout(() => {
      setCardPhase('done');
      if (cardContext) issueCard(cardContext.selRes, cardContext.room);
    }, 4500));
  };
  const closeCard = () => { clearTimers(); setCardPhase(null); };

  const openRoomModal = (r) => {
    const draft = r ? { ...r, amenities: [...(r.amenities || [])] } :
      { num: '', name: '', room_type_id: null, bed_type_id: null, cap: 2, m2: 30, price: 2500, active: true, desc: '', amenities: [] };
    setModal({ kind: 'room', isNew: !r, draft });
  };
  const openPkgModal = (p) => {
    const draft = p ? { ...p } : { name: '', price: 300, unit: 'por persona', active: true, desc: '' };
    setModal({ kind: 'pkg', isNew: !p, draft });
  };
  const updateDraft = (field, val) => setModal((m) => (m ? { ...m, draft: { ...m.draft, [field]: val } } : m));
  const saveModal = async () => {
    if (!modal) return;
    const { kind, draft } = modal;
    if (!(draft.name || '').trim()) { setModal(null); return; }
    try {
      if (kind === 'room') await roomsApi.saveRoom(draft);
      else await packagesApi.savePackage(draft);
      setModal(null);
    } catch (e) {
      console.error('saveModal failed', e);
    }
  };
  const deleteModal = async () => {
    if (!modal) return;
    try {
      if (modal.kind === 'room') await roomsApi.deleteRoom(modal.draft.id);
      else await packagesApi.deletePackage(modal.draft.id);
      setModal(null);
    } catch (e) {
      console.error('deleteModal failed', e);
    }
  };

  const togglePackageActive = (id, active) => packagesApi.updatePackage(id, { active });
  const toggleRoomActive = (id, active) => roomsApi.updateRoom(id, { active });

  return (
    <div ref={rootRef} style={{
      display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr)',
      height: '100vh', overflow: 'hidden',
      background: '#F3EDE0', color: '#2E2418',
      fontFamily: 'Karla, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <Sidebar tab={tab} onNavigate={setTab} onGoGuest={onGoGuest} config={config} staffName={staffName} onSignOut={signOut} />

      <div style={{ overflowY: 'auto', position: 'relative' }}>
        {tab === 'dash'  && <Dashboard config={config} staffName={staffName} rooms={rooms} onCheckIn={(code) => { setSelResCode(code); setTab('chk'); }} />}
        {tab === 'res'   && <Reservaciones rooms={rooms} buildings={buildings} pkgs={pkgs} onGoConfig={() => setTab('cfg')} />}
        {tab === 'guests' && <Huespedes />}
        {tab === 'companies' && <Empresas />}
        {tab === 'channels' && <Canales />}
        {tab === 'discounts' && <Descuentos />}
        {tab === 'seasons' && <Temporadas />}
        {tab === 'rooms' && (
          <Habitaciones
            rooms={rooms}
            loading={roomsApi.loading}
            error={roomsApi.error}
            onToggle={toggleRoomActive}
            onEdit={openRoomModal}
            onNew={() => openRoomModal(null)}
          />
        )}
        {tab === 'pkgs'  && (
          <Paquetes
            pkgs={pkgs}
            loading={packagesApi.loading}
            error={packagesApi.error}
            onToggle={togglePackageActive}
            onEdit={openPkgModal}
            onNew={() => openPkgModal(null)}
          />
        )}
        {tab === 'chk'   && <CheckIn rooms={rooms} selResCode={selResCode} setSelResCode={setSelResCode} onStartCardFlow={startCardFlow} accent={config?.accent} />}
        {tab === 'hk'    && <Housekeeping rooms={rooms} />}
        {tab === 'blocks' && <Bloqueos rooms={rooms} />}
        {tab === 'wait'  && <Waitlist roomTypes={roomTypesQ.data || []} />}
        {tab === 'cts'   && <Cortesias />}
        {tab === 'amen'  && <Amenidades rooms={rooms} />}
        {tab === 'reqs'  && <Solicitudes />}
        {tab === 'tags'  && <TagsHuespedes />}
        {tab === 'pool_cfg' && <AlbercaConfig />}
        {tab === 'pool_bkg' && <AlbercaBookings />}
        {tab === 'surveys' && <Encuestas />}
        {tab === 'print_tmpl' && <PlantillasImpresion />}
        {tab === 'msg_tmpl' && <PlantillasMensajes />}
        {tab === 'texts' && <Textos />}
        {tab === 'flags' && <FeatureFlags />}
        {tab === 'catalogs' && <Catalogos />}
        {tab === 'roles' && <Roles />}
        {tab === 'staff' && <Staff />}
        {tab === 'closing' && <CierreContable />}
        {tab === 'notifs' && <Notificaciones />}
        {tab === 'audit' && <Auditoria />}
        {tab === 'cfg'   && <Configuracion />}
      </div>

      <RoomPackageModal
        modal={modal}
        updateDraft={updateDraft}
        onClose={() => setModal(null)}
        onSave={saveModal}
        onDelete={deleteModal}
        roomTypes={roomTypesQ.data || []}
        bedTypes={bedTypesQ.data || []}
        amenities={amenitiesQ.data || []}
        saving={roomsApi.saving || packagesApi.saving}
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
