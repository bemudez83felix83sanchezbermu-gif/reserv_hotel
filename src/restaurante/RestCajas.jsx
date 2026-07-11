import { useState } from 'react';
import { useQuery, useMutation } from '../shared/hooks/useQuery.jsx';
import { useAuth } from '../shared/hooks/useAuth.jsx';
import { fetchShifts, fetchStaff, fetchShiftCash, openShift, closeShift } from './data.js';
import { C, money, timeOf, dateOf, PageHeader, Card, Chip, Loading, ErrorBox, Modal, input, label, btnPrimary, btnGhost } from './ui.jsx';

function OpenShiftCard({ shift, staffMap, onClose }) {
  const { data: cash } = useQuery(`shift-cash-${shift.id}`, () => fetchShiftCash(shift.id));
  const expected = Number(shift.opened_cash) + (cash?.cash || 0);
  const who = staffMap[shift.opened_by]?.full_name || 'Cajero';
  return (
    <Card style={{ borderLeft: `4px solid ${C.greenDk}`, animation: 'fadeUp .5s .05s both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: C.greenDk, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 18 }}>{who[0].toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.greenDk, letterSpacing: 0.5 }}>CAJA ABIERTA</div>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 20, color: C.ink }}>{who}</div>
            <div style={{ fontSize: 12.5, color: C.sub }}>Abrió a las {timeOf(shift.opened_at)} · {dateOf(shift.opened_at).split(',')[0] || ''}</div>
          </div>
        </div>
        <Chip tone="green">● Cobrando ahora</Chip>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
        {[['Fondo inicial', money(shift.opened_cash)], ['Cobrado en efectivo', money(cash?.cash || 0)], ['Efectivo esperado', money(expected)]].map(([l, v], i) => (
          <div key={l} style={{ background: i === 2 ? C.greenBg : C.field, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: C.muted }}>{l.toUpperCase()}</div>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 22, color: i === 2 ? C.greenDk : C.ink, marginTop: 3 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <button onClick={() => onClose(shift, expected)} style={btnPrimary}>Hacer corte y cerrar caja</button>
      </div>
    </Card>
  );
}

export default function RestCajas() {
  const { staff } = useAuth();
  const { data, loading, error, refresh } = useQuery('rest-shifts', fetchShifts);
  const { data: staffData } = useQuery('rest-staff', fetchStaff);
  const [openDraft, setOpenDraft] = useState(null);
  const [closeDraft, setCloseDraft] = useState(null);

  const staffMap = staffData?.map || {};
  const shifts = data?.shifts || [];
  const open = data?.open;
  const history = shifts.filter((s) => s.closed_at);

  const doOpen = useMutation((d) => openShift(d), { invalidate: ['rest-shifts', 'rest-dashboard'], onSuccess: () => { setOpenDraft(null); refresh(); } });
  const doClose = useMutation((d) => closeShift(d), { invalidate: ['rest-shifts', 'rest-dashboard'], onSuccess: () => { setCloseDraft(null); refresh(); } });

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <PageHeader
        title="Cajas y cortes"
        subtitle="Quién cobra, desde qué hora, y el corte al cierre"
        right={!open && <button onClick={() => setOpenDraft({ opened_cash: 0, notes: '' })} style={btnPrimary}>Abrir turno de caja</button>}
      />
      <ErrorBox error={error || doOpen.error || doClose.error} />

      {loading && !data ? <Loading /> : (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {open ? (
            <OpenShiftCard shift={open} staffMap={staffMap} onClose={(s, expected) => setCloseDraft({ shift_id: s.id, expected, opened_cash: s.opened_cash, closed_cash: expected, notes: '' })} />
          ) : (
            <Card style={{ textAlign: 'center', padding: '34px 20px' }}>
              <div style={{ fontSize: 30 }}>🔒</div>
              <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 19, color: C.ink, marginTop: 8 }}>No hay caja abierta</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Abre un turno para empezar a cobrar y registrar el efectivo del día.</div>
              <button onClick={() => setOpenDraft({ opened_cash: 0, notes: '' })} style={{ ...btnPrimary, marginTop: 14 }}>Abrir turno de caja</button>
            </Card>
          )}

          {/* Historial de cortes */}
          <div>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 20, color: C.ink, marginBottom: 12 }}>Historial de cortes</div>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr auto', gap: 8, padding: '12px 18px', background: '#F7F0E1', fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: C.muted }}>
                <div>CAJERO</div><div>APERTURA</div><div>CORTE</div><div style={{ textAlign: 'right' }}>ESPERADO</div><div style={{ textAlign: 'right' }}>CONTADO</div><div style={{ textAlign: 'right' }}>DIF.</div>
              </div>
              {history.length === 0 && <div style={{ padding: 20, color: C.muted, fontSize: 14 }}>Aún no hay cortes cerrados.</div>}
              {history.map((s) => {
                const diff = Number(s.closed_cash || 0) - Number(s.expected_cash || 0);
                return (
                  <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr auto', gap: 8, padding: '12px 18px', borderTop: `1px solid ${C.border}`, alignItems: 'center', fontSize: 13 }}>
                    <div style={{ fontWeight: 700, color: C.ink }}>{staffMap[s.opened_by]?.full_name || '—'}</div>
                    <div style={{ color: C.sub }}>{timeOf(s.opened_at)}</div>
                    <div style={{ color: C.sub }}>{timeOf(s.closed_at)}</div>
                    <div style={{ textAlign: 'right', color: C.sub }}>{money(s.expected_cash)}</div>
                    <div style={{ textAlign: 'right', fontWeight: 700, color: C.ink }}>{money(s.closed_cash)}</div>
                    <div style={{ textAlign: 'right' }}>
                      <Chip tone={diff === 0 ? 'green' : Math.abs(diff) < 20 ? 'gold' : 'red'}>{diff > 0 ? '+' : ''}{money(diff)}</Chip>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      )}

      {/* Modal abrir */}
      {openDraft && (
        <Modal
          title="Abrir turno de caja"
          onClose={() => setOpenDraft(null)}
          footer={<>
            <button onClick={() => setOpenDraft(null)} style={btnGhost}>Cancelar</button>
            <button onClick={() => doOpen.mutate({ opened_by: staff?.id, opened_cash: Number(openDraft.opened_cash) || 0, notes: openDraft.notes })} style={{ ...btnPrimary, opacity: doOpen.loading ? 0.7 : 1 }}>{doOpen.loading ? 'Abriendo…' : 'Abrir caja'}</button>
          </>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: C.sub }}>Cajero: <b>{staff?.full_name}</b></div>
            <div>
              <label style={label}>FONDO INICIAL EN CAJA $</label>
              <input type="number" min="0" autoFocus value={openDraft.opened_cash} onChange={(e) => setOpenDraft({ ...openDraft, opened_cash: e.target.value })} style={input} />
            </div>
            <div>
              <label style={label}>NOTA (opcional)</label>
              <input value={openDraft.notes} onChange={(e) => setOpenDraft({ ...openDraft, notes: e.target.value })} style={input} placeholder="Turno matutino…" />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal cerrar (corte) */}
      {closeDraft && (
        <Modal
          title="Corte de caja"
          onClose={() => setCloseDraft(null)}
          footer={<>
            <button onClick={() => setCloseDraft(null)} style={btnGhost}>Cancelar</button>
            <button onClick={() => doClose.mutate({ shift_id: closeDraft.shift_id, closed_by: staff?.id, closed_cash: Number(closeDraft.closed_cash) || 0, notes: closeDraft.notes })} style={{ ...btnPrimary, opacity: doClose.loading ? 0.7 : 1 }}>{doClose.loading ? 'Cerrando…' : 'Confirmar corte'}</button>
          </>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: C.greenBg, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: C.muted }}>EFECTIVO ESPERADO EN CAJA</div>
              <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 26, color: C.greenDk }}>{money(closeDraft.expected)}</div>
              <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>Fondo {money(closeDraft.opened_cash)} + ventas en efectivo</div>
            </div>
            <div>
              <label style={label}>EFECTIVO CONTADO $</label>
              <input type="number" min="0" autoFocus value={closeDraft.closed_cash} onChange={(e) => setCloseDraft({ ...closeDraft, closed_cash: e.target.value })} style={input} />
            </div>
            {(() => {
              const diff = Number(closeDraft.closed_cash || 0) - Number(closeDraft.expected);
              return <div style={{ fontSize: 13.5, fontWeight: 700, color: diff === 0 ? C.greenDk : Math.abs(diff) < 20 ? '#8A6A1E' : C.red }}>Diferencia: {diff > 0 ? 'sobrante ' : diff < 0 ? 'faltante ' : ''}{money(Math.abs(diff))}</div>;
            })()}
            <div>
              <label style={label}>NOTA DEL CORTE (opcional)</label>
              <input value={closeDraft.notes} onChange={(e) => setCloseDraft({ ...closeDraft, notes: e.target.value })} style={input} placeholder="Observaciones del cierre…" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
