import { useMemo, useState } from 'react';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };

function getValue(row, key) {
  return key.split('.').reduce((v, k) => (v == null ? v : v[k]), row);
}

/**
 * Tabla reutilizable con búsqueda, ordenamiento y paginación.
 * Cada columna controla su propio render — DataTable solo filtra/ordena/pagina.
 */
export default function DataTable({
  columns,
  rows,
  getRowId = (r) => r.id,
  searchKeys = [],
  searchPlaceholder = 'Buscar…',
  pageSize = 10,
  emptyMessage = 'Sin resultados.',
  toolbarExtra = null,
  onRowClick = null,
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search.trim() || !searchKeys.length) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) => searchKeys.some((k) => String(getValue(r, k) ?? '').toLowerCase().includes(q)));
  }, [rows, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    const sortValue = col?.sortValue || ((r) => getValue(r, sort.key));
    return [...filtered].sort((a, b) => {
      const av = sortValue(a);
      const bv = sortValue(b);
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * sort.dir;
      if (bv == null) return 1 * sort.dir;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sort.dir;
      return String(av).localeCompare(String(bv), 'es-MX') * sort.dir;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const curPage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(curPage * pageSize, curPage * pageSize + pageSize);

  const toggleSort = (col) => {
    if (!col.sortable) return;
    setSort((s) => (s.key === col.key ? { key: col.key, dir: -s.dir } : { key: col.key, dir: 1 }));
    setPage(0);
  };

  return (
    <div style={{ ...CARD, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #EDE3CF', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder={searchPlaceholder}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '9px 13px',
              border: '1px solid #E4D8C0', borderRadius: 10, background: '#FDFBF4',
              fontSize: 13, outline: 'none',
            }}
          />
        </div>
        <div style={{ flex: 1 }} />
        {toolbarExtra}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c)}
                  style={{
                    textAlign: c.align || 'left', padding: '10px 14px',
                    fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63',
                    borderBottom: '1px solid #EDE3CF', whiteSpace: 'nowrap',
                    cursor: c.sortable ? 'pointer' : 'default', userSelect: 'none',
                    width: c.width,
                  }}
                >
                  {c.label}
                  {c.sortable && sort.key === c.key && (sort.dir === 1 ? ' ▲' : ' ▼')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{ cursor: onRowClick ? 'pointer' : 'default', transition: 'background .12s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FBF6EA'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map((c) => (
                  <td key={c.key} style={{
                    padding: '11px 14px', borderBottom: '1px solid #F3ECDC',
                    textAlign: c.align || 'left', verticalAlign: 'middle',
                  }}>
                    {c.render ? c.render(row) : String(getValue(row, c.key) ?? '')}
                  </td>
                ))}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ padding: '24px 14px', textAlign: 'center', color: '#8A7A63', fontSize: 13 }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '11px 16px', borderTop: '1px solid #EDE3CF' }}>
          <span style={{ fontSize: 12, color: '#8A7A63' }}>
            {curPage * pageSize + 1}–{Math.min(sorted.length, (curPage + 1) * pageSize)} de {sorted.length}
          </span>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={curPage === 0}
            style={{
              width: 30, height: 30, border: '1px solid #E4D8C0', borderRadius: 8,
              background: '#FFFDF7', color: '#6B5D4A', cursor: curPage === 0 ? 'not-allowed' : 'pointer',
              opacity: curPage === 0 ? 0.5 : 1,
            }}
          >‹</button>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={curPage >= pageCount - 1}
            style={{
              width: 30, height: 30, border: '1px solid #E4D8C0', borderRadius: 8,
              background: '#FFFDF7', color: '#6B5D4A', cursor: curPage >= pageCount - 1 ? 'not-allowed' : 'pointer',
              opacity: curPage >= pageCount - 1 ? 0.5 : 1,
            }}
          >›</button>
        </div>
      )}
    </div>
  );
}
