import { useMemo, useState } from 'react';
import { useAuth } from '../../shared/hooks/useAuth.jsx';
import { useConfig } from '../../shared/hooks/useConfig.jsx';
import { useGuests } from '../../shared/hooks/useGuests.jsx';
import { useCompanies, useCorporateRates } from '../../shared/hooks/useCompanies.jsx';
import { useSalesChannelsActive } from '../../shared/hooks/useCatalog.jsx';
import { useActiveDiscounts } from '../../shared/hooks/useDiscounts.jsx';
import { useRatePeriodsInRange } from '../../shared/hooks/useRatePeriods.jsx';
import { useReservationsInRange } from '../../shared/hooks/useReservations.jsx';
import { fmt, todayIso, addDaysIso } from '../../shared/utils/helpers.js';
import { nightsBetween, roomSubtotal, packageLineTotal, totalDiscount, courtesyQty } from '../../shared/utils/pricing.js';

const INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px',
  border: '1px solid #E4D8C0', borderRadius: 11, background: '#FDFBF4',
  fontSize: 14, outline: 'none',
};
const LABEL = { fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, color: '#8A7A63', marginBottom: 5 };
const ACTIVE_STATUSES = new Set(['confirmada', 'llega-hoy', 'en-casa']);

export default function ReservationModal({ rooms, pkgs, defaultRoomId, onClose, onCreated }) {
  const { staff } = useAuth();
  const { config } = useConfig();
  const { guests, createGuest } = useGuests();
  const { companies } = useCompanies();
  const channelsQ = useSalesChannelsActive();
  const channels = channelsQ.data || [];
  const { discounts: activeDiscounts } = useActiveDiscounts();

  const [checkIn, setCheckIn] = useState(todayIso());
  const [checkOut, setCheckOut] = useState(addDaysIso(todayIso(), 1));
  const [roomId, setRoomId] = useState(defaultRoomId || '');
  const [guestId, setGuestId] = useState('');
  const [newGuest, setNewGuest] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [notes, setNotes] = useState('');
  const [pkgQty, setPkgQty] = useState({}); // packageId -> qty
  const [discountIds, setDiscountIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const effectiveChannelId = channelId || channels.find((c) => c.slug === 'direct')?.id || '';

  const nights = nightsBetween(checkIn, checkOut);
  const { reservations: overlapping } = useReservationsInRange(checkIn, nights > 0 ? checkOut : null);
  const busyRoomIds = useMemo(() => new Set(
    (overlapping || [])
      .filter((r) => ACTIVE_STATUSES.has(r.status) && r.checkIn < checkOut && r.checkOut > checkIn)
      .map((r) => r.roomId),
  ), [overlapping, checkIn, checkOut]);
  const availableRooms = rooms.filter((r) => r.active !== false && (r.id === roomId || !busyRoomIds.has(r.id)));

  const room = rooms.find((r) => r.id === roomId);
  const { rates: corpRates } = useCorporateRates(companyId || null);
  const corpRate = room && companyId ? corpRates.find((r) => r.roomTypeId === room.room_type_id) : null;
  const baseNightly = corpRate ? corpRate.price : (room?.price || 0);

  const { ratePeriods } = useRatePeriodsInRange(checkIn, nights > 0 ? checkOut : null);
  const roomTotal = room && nights > 0 ? roomSubtotal(baseNightly, checkIn, checkOut, room.room_type_id, ratePeriods) : 0;

  const selectedPkgs = (pkgs || []).filter((p) => (pkgQty[p.id] || 0) > 0);
  const packagesTotal = selectedPkgs.reduce((sum, p) => sum + packageLineTotal(p, pkgQty[p.id], { guestsCount, nights }), 0);
  const subtotal = roomTotal + packagesTotal;
  const selectedDiscountObjs = activeDiscounts.filter((d) => discountIds.includes(d.id));
  const discountTotal = totalDiscount(selectedDiscountObjs, subtotal);
  const total = subtotal - discountTotal;
  const courtQty = courtesyQty(config, guestsCount, nights);

  const togglePkgQty = (p, delta) => setPkgQty((m) => ({ ...m, [p.id]: Math.max(0, (m[p.id] || 0) + delta) }));
  const toggleDiscount = (id) => setDiscountIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const canSubmit = nights > 0 && roomId && effectiveChannelId && guestsCount > 0 &&
    (newGuest ? newFirstName.trim() : guestId) && !saving;

  const submit = async () => {
    setErr(null);
    setSaving(true);
    try {
      let finalGuestId = guestId;
      if (newGuest) {
        const g = await createGuest({ firstName: newFirstName.trim(), lastName: newLastName.trim() });
        finalGuestId = g.id;
      }
      const payload = {
        primaryGuestId: finalGuestId,
        roomId,
        companyId: companyId || null,
        channelId: effectiveChannelId,
        checkIn, checkOut,
        guestsCount,
        totalBeforeDiscount: subtotal,
        discountTotal,
        total,
        notes: notes.trim() || null,
        createdBy: staff?.id || null,
        reservationPrefix: config?.reservation_prefix,
        packages: selectedPkgs.map((p) => ({ packageId: p.id, qty: pkgQty[p.id], unitPrice: p.price })),
        discounts: selectedDiscountObjs.map((d) => ({ discountId: d.id, appliedAmount: discountAmountFor(d, subtotal, selectedDiscountObjs) })),
        courtesyQty: courtQty,
      };
      await onCreated(payload);
      onClose();
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(38,29,18,.55)',
      backdropFilter: 'blur(5px)', zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 30, animation: 'fadeIn .2s ease both',
    }}>
      <div style={{
        background: '#FFFDF7', borderRadius: 22,
        width: 760, maxWidth: '100%', maxHeight: '100%',
        overflowY: 'auto', padding: 26,
        animation: 'pop .28s cubic-bezier(.2,.7,.2,1) both',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 22 }}>Nueva reserva</div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%',
            border: '1px solid #E4D8C0', background: 'transparent',
            fontSize: 15, cursor: 'pointer', color: '#6B5D4A',
          }}>✕</button>
        </div>

        {err && <div style={{ marginTop: 14, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{err}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 18 }}>
          <div>
            <div style={LABEL}>LLEGADA</div>
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={INPUT} />
          </div>
          <div>
            <div style={LABEL}>SALIDA</div>
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={INPUT} />
          </div>
          <div>
            <div style={LABEL}>HUÉSPEDES</div>
            <input type="number" min={1} value={guestsCount} onChange={(e) => setGuestsCount(Math.max(1, Number(e.target.value) || 1))} style={INPUT} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={LABEL}>HABITACIÓN {nights > 0 ? `· ${nights} ${nights === 1 ? 'noche' : 'noches'}` : '· elige fechas válidas'}</div>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)} style={{ ...INPUT, fontSize: 13.5 }}>
            <option value="">— selecciona una habitación —</option>
            {availableRooms.map((r) => <option key={r.id} value={r.id}>Hab. {r.num} · {r.name} · {fmt(r.price)}/noche</option>)}
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={LABEL}>HUÉSPED PRINCIPAL</div>
          {!newGuest ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={guestId} onChange={(e) => setGuestId(e.target.value)} style={{ ...INPUT, fontSize: 13.5, flex: 1 }}>
                <option value="">— selecciona un huésped —</option>
                {guests.map((g) => <option key={g.id} value={g.id}>{g.fullName}{g.email ? ` · ${g.email}` : ''}</option>)}
              </select>
              <button onClick={() => setNewGuest(true)} style={{
                padding: '0 16px', border: '1.5px dashed #C9B788', borderRadius: 11,
                background: 'transparent', color: '#6B5335',
                fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>+ Nuevo</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="Nombre(s)" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} style={{ ...INPUT, flex: 1 }} />
              <input placeholder="Apellidos" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} style={{ ...INPUT, flex: 1 }} />
              <button onClick={() => setNewGuest(false)} style={{
                padding: '0 14px', border: '1px solid #DACBAE', borderRadius: 11,
                background: 'transparent', color: '#2E2418',
                fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>Cancelar</button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div>
            <div style={LABEL}>CANAL DE VENTA</div>
            <select value={effectiveChannelId} onChange={(e) => setChannelId(e.target.value)} style={{ ...INPUT, fontSize: 13.5 }}>
              {channels.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <div style={LABEL}>EMPRESA (OPCIONAL · TARIFA CORPORATIVA)</div>
            <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} style={{ ...INPUT, fontSize: 13.5 }}>
              <option value="">— sin empresa —</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.legalName}</option>)}
            </select>
          </div>
        </div>

        {!!(pkgs || []).length && (
          <div style={{ marginTop: 16 }}>
            <div style={{ ...LABEL, marginBottom: 8 }}>PAQUETES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pkgs.filter((p) => p.active !== false).map((p) => {
                const qty = pkgQty[p.id] || 0;
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    border: '1px solid #EDE3CF', borderRadius: 11, padding: '9px 12px',
                    background: qty > 0 ? '#F8EDE4' : '#FDFBF4',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: '#8A7A63' }}>{fmt(p.price)} · {p.unit}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => togglePkgQty(p, -1)} disabled={qty === 0} style={{ width: 26, height: 26, borderRadius: 8, border: '1px solid #DACBAE', background: 'transparent', cursor: qty === 0 ? 'not-allowed' : 'pointer' }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                      <button onClick={() => togglePkgQty(p, 1)} style={{ width: 26, height: 26, borderRadius: 8, border: '1px solid #DACBAE', background: 'transparent', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!!activeDiscounts.length && (
          <div style={{ marginTop: 16 }}>
            <div style={{ ...LABEL, marginBottom: 8 }}>DESCUENTOS</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activeDiscounts.map((d) => {
                const on = discountIds.includes(d.id);
                return (
                  <button key={d.id} onClick={() => toggleDiscount(d.id)} style={{
                    padding: '7px 13px', borderRadius: 999,
                    border: '1px solid ' + (on ? '#2E2418' : '#E4D8C0'),
                    background: on ? '#2E2418' : '#FFFDF7',
                    color: on ? '#FBF6EA' : '#6B5D4A',
                    fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>{d.name} · {d.kind === 'percentage' ? `${d.value}%` : fmt(d.value)}</button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <div style={LABEL}>NOTAS</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...INPUT, fontSize: 13.5, lineHeight: 1.5, resize: 'vertical' }} />
        </div>

        <div style={{
          marginTop: 18, padding: '14px 16px', borderRadius: 14, background: '#F4EFE3',
          display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          <Row label={`Habitación · ${nights} ${nights === 1 ? 'noche' : 'noches'}`} value={fmt(roomTotal)} />
          {packagesTotal > 0 && <Row label="Paquetes" value={fmt(packagesTotal)} />}
          {discountTotal > 0 && <Row label="Descuento" value={'−' + fmt(discountTotal)} />}
          <Row label="Total" value={fmt(total)} strong />
          {courtQty > 0 && <div style={{ fontSize: 11.5, color: '#8A7A63', marginTop: 2 }}>{courtQty} cortesías incluidas según la configuración del hotel.</div>}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22, alignItems: 'center' }}>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} disabled={saving} style={{
            padding: '12px 20px', border: '1px solid #DACBAE', borderRadius: 11,
            background: 'transparent', color: '#2E2418',
            fontFamily: 'Karla, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>Cancelar</button>
          <button onClick={submit} disabled={!canSubmit} style={{
            padding: '12px 24px', border: 'none', borderRadius: 11,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 13, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed',
            boxShadow: '0 8px 18px rgba(184,85,47,.28)', opacity: canSubmit ? 1 : 0.6,
          }}>{saving ? 'Creando…' : 'Crear reserva'}</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: strong ? 15 : 13, fontWeight: strong ? 700 : 600, color: strong ? '#2E2418' : '#6B5D4A' }}>
      <span>{label}</span>
      <span style={strong ? { color: 'var(--ac, #B8552F)' } : undefined}>{value}</span>
    </div>
  );
}

// Recalcula el monto de un descuento individual respetando el orden de aplicación (igual que totalDiscount).
function discountAmountFor(discount, subtotal, allSelected) {
  let remaining = subtotal;
  for (const d of allSelected) {
    const raw = d.kind === 'percentage' ? remaining * (d.value / 100) : d.value;
    const amt = Math.max(0, Math.min(raw, remaining));
    if (d.id === discount.id) return amt;
    remaining -= amt;
  }
  return 0;
}
