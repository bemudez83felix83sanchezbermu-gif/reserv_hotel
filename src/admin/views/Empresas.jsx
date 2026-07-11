import { useState } from 'react';
import DataTable from '../../shared/ui/DataTable.jsx';
import CompanyModal from '../components/CompanyModal.jsx';
import { useCompanies } from '../../shared/hooks/useCompanies.jsx';

const VERIF_LABEL = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' };
const VERIF_COLOR = { pending: '#8A6420', approved: '#3F6E4C', rejected: '#93402D' };

export default function Empresas() {
  const { companies, loading, error, createCompany, updateCompany, deleteCompany, setVerification, saving } = useCompanies();
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const openEdit = (c) => { setEditing(c); setOpen(true); };
  const close = () => setOpen(false);

  const onSave = async (draft) => {
    try {
      if (draft.id) await updateCompany(draft.id, draft);
      else await createCompany(draft);
      close();
    } catch (e) {
      console.error('saveCompany failed', e);
    }
  };
  const onDelete = async (id) => {
    try { await deleteCompany(id); close(); } catch (e) { console.error('deleteCompany failed', e); }
  };

  const columns = [
    { key: 'legalName', label: 'RAZÓN SOCIAL', sortable: true, render: (c) => <span style={{ fontWeight: 700 }}>{c.legalName}</span> },
    { key: 'commercialName', label: 'NOMBRE COMERCIAL', sortable: true },
    { key: 'contactName', label: 'CONTACTO' },
    {
      key: 'verificationStatus', label: 'VERIFICACIÓN', sortable: true, width: 140,
      render: (c) => (
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 999,
          background: (VERIF_COLOR[c.verificationStatus] || '#8A7A63') + '1E',
          color: VERIF_COLOR[c.verificationStatus] || '#8A7A63',
        }}>{VERIF_LABEL[c.verificationStatus] || c.verificationStatus}</span>
      ),
    },
    {
      key: 'actions', label: '', align: 'right', width: 90,
      render: (c) => (
        <button onClick={() => openEdit(c)} style={{
          padding: '8px 14px', border: '1px solid #DACBAE', borderRadius: 9,
          background: 'transparent', color: '#2E2418',
          fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>Ver</button>
      ),
    },
  ];

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Empresas</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Cuentas corporativas con tarifas preferenciales por tipo de habitación
          </div>
        </div>
        <button onClick={() => openEdit(null)} style={{
          flex: 'none', padding: '12px 20px', border: 'none', borderRadius: 12,
          background: 'var(--ac, #B8552F)', color: '#FBF6EA',
          fontFamily: 'Karla, sans-serif', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 8px 18px rgba(184,85,47,.28)',
        }}>+ Nueva empresa</button>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ marginTop: 20 }}>
        <DataTable
          columns={columns}
          rows={companies}
          searchKeys={['legalName', 'commercialName', 'contactName', 'rfc']}
          searchPlaceholder="Buscar empresa…"
          emptyMessage={loading ? 'Cargando empresas…' : 'Sin empresas registradas.'}
        />
      </div>

      {open && (
        <CompanyModal
          company={editing}
          onClose={close}
          onSave={onSave}
          onDelete={onDelete}
          onSetVerification={setVerification}
          saving={saving}
        />
      )}
    </div>
  );
}
