import { useMemo, useState } from 'react';
import { useHousekeepingTasks, useCamaristas, useRoomHousekeeping } from '../../shared/hooks/useHousekeeping.jsx';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };

const HK_STATUSES = ['dirty', 'cleaning', 'clean', 'maintenance'];
const HK_META = {
  dirty:       { label: 'Sucia',         bg: '#F6E3DE', bd: '#D49B8B', fg: '#93402D', dot: '#C0503C' },
  cleaning:    { label: 'En limpieza',   bg: '#F7ECD8', bd: '#DEBE85', fg: '#8A6420', dot: '#D9A13B' },
  clean:       { label: 'Limpia',        bg: '#EAF2E6', bd: '#A9C6A1', fg: '#3F6E4C', dot: '#4C8A5C' },
  maintenance: { label: 'Mantenimiento', bg: '#E8E3EF', bd: '#B7A9CE', fg: '#5A4A7A', dot: '#8871B0' },
};

const TASK_STATUSES = ['pending', 'in_progress', 'done'];
const TASK_STATUS_META = {
  pending:     { label: 'Pendiente', bg: '#F1E7D2', fg: '#6B5335' },
  in_progress: { label: 'En curso',  bg: '#E4D5B8', fg: '#5C4A2E' },
  done:        { label: 'Hecha',     bg: '#EAF2E6', fg: '#3F6E4C' },
  cancelled:   { label: 'Cancelada', bg: '#F5E0DA', fg: '#7A3B2A' },
};
const TASK_TYPES = ['turndown', 'full_clean', 'maintenance', 'linen', 'restock'];
const TASK_TYPE_LABELS = {
  turndown: 'Turndown', full_clean: 'Limpieza completa', maintenance: 'Mantenimiento', linen: 'Blancos', restock: 'Reabasto',
};
const NEXT_STATUS = { pending: 'in_progress', in_progress: 'done' };

const chipBtn = {
  padding: '8px 14px', border: '1px solid #DACBAE', borderRadius: 9,
  background: 'transparent', color: '#2E2418',
  fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
};
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

export default function Housekeeping({ rooms }) {
  const { tasks, createTask, setTaskStatus, saving: savingTask } = useHousekeepingTasks();
  const { camaristas } = useCamaristas();
  const { setStatus: setRoomStatus, saving: savingRoom } = useRoomHousekeeping();

  const [camaristaFilter, setCamaristaFilter] = useState('');
  const [form, setForm] = useState({ roomId: '', taskType: 'full_clean', assignedTo: '', notes: '' });

  const roomsByStatus = useMemo(() => {
    const map = { dirty: [], cleaning: [], clean: [], maintenance: [] };
    rooms.forEach((r) => { (map[r.housekeepingStatus || 'clean'] || map.clean).push(r); });
    return map;
  }, [rooms]);

  const filteredTasks = useMemo(
    () => (camaristaFilter ? tasks.filter((t) => t.assignedTo === camaristaFilter) : tasks),
    [tasks, camaristaFilter],
  );
  const tasksByStatus = useMemo(() => {
    const map = { pending: [], in_progress: [], done: [] };
    filteredTasks.forEach((t) => { if (map[t.status]) map[t.status].push(t); });
    return map;
  }, [filteredTasks]);

  const submitTask = async (e) => {
    e.preventDefault();
    if (!form.roomId) return;
    await createTask({
      roomId: form.roomId,
      taskType: form.taskType,
      assignedTo: form.assignedTo || null,
      notes: form.notes.trim(),
    });
    setForm({ roomId: '', taskType: 'full_clean', assignedTo: '', notes: '' });
  };

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Housekeeping</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
          Estado de limpieza por habitación y tareas asignadas a camaristas
        </div>
      </div>

      {/* Board de habitaciones por estado */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14, marginTop: 20 }}>
        {HK_STATUSES.map((st) => {
          const m = HK_META[st];
          const list = roomsByStatus[st] || [];
          return (
            <div key={st} style={{ ...CARD, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 99, background: m.dot }} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{m.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#8A7A63', fontWeight: 700 }}>{list.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {list.map((r) => (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    border: '1px solid ' + m.bd, background: m.bg, color: m.fg,
                    borderRadius: 11, padding: '8px 10px',
                  }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>Hab. {r.num} · {r.name}</span>
                    <select
                      value={st}
                      disabled={savingRoom}
                      onChange={(e) => setRoomStatus(r.id, e.target.value)}
                      style={{
                        fontSize: 11, fontWeight: 700, border: 'none', background: 'transparent',
                        color: m.fg, cursor: 'pointer', outline: 'none',
                      }}
                    >
                      {HK_STATUSES.map((s2) => <option key={s2} value={s2}>{HK_META[s2].label}</option>)}
                    </select>
                  </div>
                ))}
                {list.length === 0 && <div style={{ fontSize: 11.5, color: '#B3A386' }}>Sin habitaciones</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Nueva tarea */}
      <div style={{ ...CARD, padding: 18, marginTop: 20 }}>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18 }}>Nueva tarea</div>
        <form onSubmit={submitTask} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
          <select required value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))} style={inputStyle}>
            <option value="">Habitación…</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>Hab. {r.num} · {r.name}</option>)}
          </select>
          <select value={form.taskType} onChange={(e) => setForm((f) => ({ ...f, taskType: e.target.value }))} style={inputStyle}>
            {TASK_TYPES.map((t) => <option key={t} value={t}>{TASK_TYPE_LABELS[t]}</option>)}
          </select>
          <select value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} style={inputStyle}>
            <option value="">Sin asignar</option>
            {camaristas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            placeholder="Notas (opcional)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            style={{ ...inputStyle, flex: '1 1 180px' }}
          />
          <button type="submit" disabled={savingTask} style={{
            padding: '10px 18px', border: 'none', borderRadius: 10,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          }}>+ Crear tarea</button>
        </form>
      </div>

      {/* Kanban de tareas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18 }}>Tareas</div>
        <select value={camaristaFilter} onChange={(e) => setCamaristaFilter(e.target.value)} style={{ ...inputStyle, marginLeft: 8 }}>
          <option value="">Todas las camaristas</option>
          {camaristas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginTop: 12 }}>
        {TASK_STATUSES.map((st) => (
          <div key={st} style={{ ...CARD, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                background: TASK_STATUS_META[st].bg, color: TASK_STATUS_META[st].fg,
              }}>{TASK_STATUS_META[st].label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#8A7A63', fontWeight: 700 }}>{tasksByStatus[st].length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {tasksByStatus[st].map((t) => (
                <div key={t.id} style={{ border: '1px solid #EDE3CF', borderRadius: 12, padding: 11 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{t.roomLabel}</div>
                  <div style={{ fontSize: 11.5, color: '#8A7A63', marginTop: 2 }}>
                    {TASK_TYPE_LABELS[t.taskType] || t.taskType}{t.assignedName ? ' · ' + t.assignedName : ''}
                  </div>
                  {t.notes && <div style={{ fontSize: 11.5, color: '#6B5D4A', marginTop: 4 }}>{t.notes}</div>}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {NEXT_STATUS[t.status] && (
                      <button onClick={() => setTaskStatus(t.id, NEXT_STATUS[t.status])} style={{ ...chipBtn, padding: '6px 10px', fontSize: 11 }}>
                        {t.status === 'pending' ? 'Iniciar →' : 'Completar →'}
                      </button>
                    )}
                    {t.status !== 'done' && (
                      <button onClick={() => setTaskStatus(t.id, 'cancelled')} style={{ ...chipBtn, padding: '6px 10px', fontSize: 11, color: '#93402D', borderColor: '#D49B8B' }}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {tasksByStatus[st].length === 0 && <div style={{ fontSize: 11.5, color: '#B3A386' }}>Sin tareas</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
