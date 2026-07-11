import { useState } from 'react';
import DataTable from '../../shared/ui/DataTable.jsx';
import { useI18nLabels } from '../../shared/hooks/useI18nLabels.jsx';

const CELL_INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '8px 10px',
  border: '1px solid #E4D8C0', borderRadius: 9, background: '#FDFBF4',
  fontSize: 13, outline: 'none',
};
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

export default function Textos() {
  const { labels, loading, error, saveLabel, deleteLabel, saving } = useI18nLabels();
  const [form, setForm] = useState({ key: '', locale: 'es', value: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.key.trim() || !form.locale.trim()) return;
    saveLabel(form.key.trim(), form.locale.trim(), form.value);
    setForm({ key: '', locale: form.locale, value: '' });
  };

  const columns = [
    { key: 'key', label: 'KEY', sortable: true, width: '28%', render: (l) => <span style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{l.key}</span> },
    { key: 'locale', label: 'LOCALE', sortable: true, width: 90 },
    {
      key: 'value', label: 'VALOR', sortable: true,
      render: (l) => (
        <input defaultValue={l.value}
          onBlur={(e) => { if (e.target.value !== l.value) saveLabel(l.key, l.locale, e.target.value); }}
          style={CELL_INPUT} />
      ),
    },
    {
      key: 'actions', label: '', align: 'right', width: 60,
      render: (l) => (
        <button onClick={() => deleteLabel(l.key, l.locale)} disabled={saving} style={{
          width: 30, height: 30, borderRadius: '50%',
          border: '1px solid #E3B8AC', background: 'transparent',
          color: '#A8442C', cursor: 'pointer', fontSize: 12.5,
        }}>✕</button>
      ),
    },
  ];

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Textos (i18n)</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
          Catálogo de textos por key + locale — si un texto no está aquí, la UI muestra el key tal cual
        </div>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18, alignItems: 'center' }}>
        <input placeholder="key (ej. checkout.thanks)" required value={form.key}
          onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} style={{ ...inputStyle, flex: '1 1 220px' }} />
        <input placeholder="locale (ej. es)" required value={form.locale}
          onChange={(e) => setForm((f) => ({ ...f, locale: e.target.value }))} style={{ ...inputStyle, width: 100 }} />
        <input placeholder="valor" value={form.value}
          onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} style={{ ...inputStyle, flex: '2 1 260px' }} />
        <button type="submit" disabled={saving} style={{
          padding: '10px 18px', border: 'none', borderRadius: 10,
          background: 'var(--ac, #B8552F)', color: '#FBF6EA',
          fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
        }}>+ Guardar</button>
      </form>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ marginTop: 20 }}>
        <DataTable
          columns={columns}
          rows={labels}
          getRowId={(l) => `${l.key}::${l.locale}`}
          searchKeys={['key', 'locale', 'value']}
          searchPlaceholder="Buscar key o texto…"
          emptyMessage={loading ? 'Cargando textos…' : 'Sin textos registrados.'}
        />
      </div>
    </div>
  );
}
