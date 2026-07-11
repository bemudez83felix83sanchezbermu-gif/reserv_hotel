// Piezas de UI reutilizables del módulo Restaurante.
// Mismo lenguaje visual que el resto del admin (papel crema, serif Marcellus,
// acento via var(--ac), verde salvia para estados activos).
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const C = {
  paper: '#FFFDF7', border: '#EDE3CF', ink: '#2E2418', muted: '#8A7A63', sub: '#6B5D4A',
  bg: '#F3EDE0', field: '#FDFBF4', green: '#6F7D5C', greenBg: '#EAF2E6', greenDk: '#3F6E4C',
  red: '#A8442C', redBg: '#F5E0DA', gold: '#C99B4E',
};

// Comprime un File de imagen a un data URL (~máx 640px, JPEG) para guardar en menu_items.image
export function compressImage(file, max = 640, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export const money = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-MX');
export const money2 = (n) => '$' + (Number(n) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const timeOf = (iso) => iso ? new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '—';
export const dateOf = (iso) => iso ? new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const btnPrimary = {
  padding: '11px 20px', border: 'none', borderRadius: 12,
  background: 'var(--ac, #B8552F)', color: '#FBF6EA',
  fontFamily: 'Karla, sans-serif', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
  boxShadow: '0 8px 18px rgba(184,85,47,.28)',
};
export const btnGhost = {
  padding: '9px 16px', border: '1px solid #DACBAE', borderRadius: 10,
  background: 'transparent', color: C.ink,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
};
export const input = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px',
  border: '1px solid #E4D8C0', borderRadius: 11, background: C.field,
  fontSize: 14, color: C.ink, outline: 'none', fontFamily: 'Karla, sans-serif',
};
export const label = { display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, color: C.muted, marginBottom: 6 };

export function PageHeader({ title, subtitle, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29, color: C.ink }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

export function Card({ children, style }) {
  return <div style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, ...style }}>{children}</div>;
}

export function StatCard({ label: lb, value, hint, accent, i = 0 }) {
  return (
    <Card style={{ animation: `fadeUp .5s ${(0.05 + i * 0.05).toFixed(2)}s both` }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.3, color: C.muted, textTransform: 'uppercase' }}>{lb}</div>
      <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 30, color: accent || C.ink, marginTop: 6 }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>{hint}</div>}
    </Card>
  );
}

export function Toggle({ on, onClick, labels = ['Activo', 'Oculto'] }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <div style={{ width: 38, height: 21, borderRadius: 99, background: on ? C.green : '#D8CCB2', position: 'relative', transition: 'background .18s ease' }}>
        <div style={{ position: 'absolute', top: 2.5, width: 16, height: 16, borderRadius: 99, background: C.paper, boxShadow: '0 1px 3px rgba(0,0,0,.25)', transition: 'left .18s ease', left: on ? 19.5 : 2.5 }} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: on ? C.greenDk : '#9A8A70' }}>{on ? labels[0] : labels[1]}</span>
    </div>
  );
}

export function Chip({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { bg: '#F1E9D8', fg: C.sub }, green: { bg: C.greenBg, fg: C.greenDk },
    red: { bg: C.redBg, fg: C.red }, gold: { bg: '#F6ECD5', fg: '#8A6A1E' }, accent: { bg: '#F8EDE4', fg: 'var(--ac,#B8552F)' },
  };
  const t = tones[tone] || tones.neutral;
  return <span style={{ fontSize: 11, fontWeight: 700, background: t.bg, color: t.fg, borderRadius: 999, padding: '4px 10px', whiteSpace: 'nowrap' }}>{children}</span>;
}

export function Empty({ icon = '🍽️', title, hint }) {
  return (
    <Card style={{ textAlign: 'center', padding: '46px 24px', animation: 'fadeIn .4s both' }}>
      <div style={{ fontSize: 34 }}>{icon}</div>
      <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 19, color: C.ink, marginTop: 8 }}>{title}</div>
      {hint && <div style={{ fontSize: 13, color: C.muted, marginTop: 6, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>{hint}</div>}
    </Card>
  );
}

export function Loading({ label: lb = 'Cargando…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.muted, padding: '40px 4px', fontSize: 14 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: 'spin .8s linear infinite' }}>
        <circle cx="12" cy="12" r="9" fill="none" stroke="#E4D8C0" strokeWidth="3" />
        <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="var(--ac,#B8552F)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {lb}
    </div>
  );
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <div style={{ background: C.redBg, color: '#7A3B2A', padding: '11px 14px', borderRadius: 11, fontSize: 13.5, margin: '12px 0' }}>⚠ {String(error)}</div>;
}

// Dropdown personalizado (panel en portal → nunca se recorta dentro del modal).
export function Select({ value, onChange, options, placeholder = 'Selecciona…', disabled, style }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const [up, setUp] = useState(false);
  const btnRef = useRef(null);
  const current = options.find((o) => String(o.value) === String(value));

  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom;
    setUp(below < 240 && r.top > below);
    setRect({ left: r.left, top: r.bottom, bottom: r.top, width: r.width });
  };
  useLayoutEffect(() => { if (open) place(); }, [open]);
  useEffect(() => {
    if (!open) return undefined;
    const onScroll = () => setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onScroll); window.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div style={{ position: 'relative', ...style }}>
      <button type="button" ref={btnRef} disabled={disabled} onClick={() => setOpen((o) => !o)} style={{
        width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        padding: '11px 13px', border: `1px solid ${open ? 'var(--ac,#B8552F)' : '#E4D8C0'}`, borderRadius: 11,
        background: disabled ? '#F1E9D8' : C.field, color: C.ink, fontSize: 14, fontFamily: 'Karla, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left', outline: 'none',
        boxShadow: open ? '0 0 0 3px rgba(184,85,47,.12)' : 'none', transition: 'box-shadow .15s, border-color .15s',
      }}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: current ? C.ink : C.muted }}>{current?.label ?? placeholder}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.2" strokeLinecap="round" style={{ flex: 'none', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s ease' }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && rect && createPortal(
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
          <div style={{
            position: 'fixed', left: rect.left, width: rect.width, zIndex: 91,
            ...(up ? { bottom: window.innerHeight - rect.bottom + 6 } : { top: rect.top + 6 }),
            maxHeight: 240, overflowY: 'auto', background: C.paper, border: `1px solid ${C.border}`, borderRadius: 12,
            boxShadow: '0 18px 44px rgba(38,29,18,.22)', padding: 6, animation: 'pop .14s both',
          }}>
            {options.map((o) => {
              const on = String(o.value) === String(value);
              return (
                <div key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} style={{
                  padding: '9px 11px', borderRadius: 8, cursor: 'pointer', fontSize: 13.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  background: on ? '#F8EDE4' : 'transparent', color: on ? 'var(--ac,#B8552F)' : C.ink, fontWeight: on ? 700 : 500,
                }}
                  onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = '#F4EBD9'; }}
                  onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.label}</span>
                  {on && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>}
                </div>
              );
            })}
          </div>
        </>, document.body)}
    </div>
  );
}

// Carga de imagen amigable (zona clickeable + preview) — reemplaza el <input file> nativo.
export function ImageUpload({ value, onChange, height = 120 }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const pick = () => inputRef.current?.click();
  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try { onChange(await compressImage(f)); } catch { /* ignore */ } finally { setBusy(false); e.target.value = ''; }
  };
  return (
    <div>
      <div onClick={pick} style={{
        position: 'relative', height, borderRadius: 14, cursor: 'pointer', overflow: 'hidden',
        border: value ? `1px solid ${C.border}` : `2px dashed #D8C7A6`,
        background: value ? `#EDE3CF url(${value}) center/cover` : C.field,
        display: 'grid', placeItems: 'center', transition: 'border-color .15s',
      }}
        onMouseEnter={(e) => { if (!value) e.currentTarget.style.borderColor = 'var(--ac,#B8552F)'; }}
        onMouseLeave={(e) => { if (!value) e.currentTarget.style.borderColor = '#D8C7A6'; }}
      >
        {!value && (
          <div style={{ textAlign: 'center', color: C.muted }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5" /><circle cx="8.5" cy="10" r="1.6" /><path d="M21 16l-5-5-8 8" /></svg>
            <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 6 }}>{busy ? 'Procesando…' : 'Subir foto'}</div>
            <div style={{ fontSize: 11, opacity: 0.75 }}>JPG o PNG</div>
          </div>
        )}
        {value && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.35), transparent 45%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 8, opacity: 0, transition: 'opacity .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,.5)', padding: '4px 10px', borderRadius: 8 }}>Cambiar</span>
          </div>
        )}
      </div>
      {value && <button type="button" onClick={() => onChange(null)} style={{ ...btnGhost, padding: '6px 12px', marginTop: 8 }}>Quitar foto</button>}
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
    </div>
  );
}

// Unidades alternativas por dimensión → factor para convertir a la unidad base del producto.
const DIM_UNITS = {
  kg: [['mg', 1e-6], ['g', 1e-3], ['kg', 1]],
  g:  [['mg', 1e-3], ['g', 1], ['kg', 1e3]],
  L:  [['ml', 1e-3], ['L', 1]],
  ml: [['ml', 1], ['L', 1e3]],
};
const altsFor = (sym) => DIM_UNITS[sym] || [[sym || 'u', 1]];
function pickUnit(base, sym) {
  const alts = altsFor(sym);
  if (alts.length === 1) return alts[0][0];
  if (sym === 'kg') return base >= 1 ? 'kg' : 'g';
  if (sym === 'g') return base >= 1000 ? 'kg' : 'g';
  if (sym === 'L') return base >= 1 ? 'L' : 'ml';
  if (sym === 'ml') return base >= 1000 ? 'L' : 'ml';
  return alts[alts.length - 1][0];
}
const trimNum = (n) => (Number.isFinite(n) ? String(Math.round(n * 1e6) / 1e6) : '');

// Campo de cantidad con selector de unidad. `value` está en la unidad base del producto (`baseUnit`);
// onChange devuelve el valor convertido a esa unidad base. Permite mg/g/kg y ml/L.
export function QtyInput({ value, baseUnit, onChange, allowNegative = false, width }) {
  const alts = altsFor(baseUnit);
  const [unit, setUnit] = useState(() => pickUnit(Math.abs(Number(value) || 0), baseUnit));
  const factor = alts.find((a) => a[0] === unit)?.[1] ?? 1;
  const [text, setText] = useState(() => (value ? trimNum(Number(value) / factor) : ''));

  const emit = (t, f) => onChange((parseFloat(t) || 0) * f);
  const onText = (e) => {
    let v = e.target.value;
    if (!allowNegative && v.startsWith('-')) v = v.slice(1);
    setText(v); emit(v, factor);
  };
  const onUnit = (u) => {
    const base = (parseFloat(text) || 0) * factor;
    const nf = alts.find((a) => a[0] === u)?.[1] ?? 1;
    setUnit(u); setText(trimNum(base / nf)); onChange(base);
  };

  return (
    <div style={{ display: 'flex', gap: 6, width, alignItems: 'stretch' }}>
      <input type="number" step="any" value={text} onChange={onText} placeholder="0"
        style={{ ...input, flex: 1, minWidth: 0, textAlign: 'right' }} />
      {alts.length > 1
        ? <Select style={{ width: 78, flex: 'none' }} value={unit} onChange={onUnit} options={alts.map((a) => ({ value: a[0], label: a[0] }))} />
        : <span style={{ alignSelf: 'center', fontSize: 12.5, color: C.muted, minWidth: 30 }}>{baseUnit}</span>}
    </div>
  );
}

export function Modal({ title, children, onClose, footer, width = 460 }) {
  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(38,29,18,.42)', display: 'grid', placeItems: 'center', zIndex: 60, padding: 20, animation: 'fadeIn .2s both' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: `min(${width}px, 100%)`, maxHeight: '90vh', overflowY: 'auto', background: C.paper, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, animation: 'pop .22s both', boxShadow: '0 30px 70px rgba(38,29,18,.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 21, color: C.ink }}>{title}</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 15 }}>✕</button>
        </div>
        {children}
        {footer && <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>{footer}</div>}
      </div>
    </div>
  );
}
