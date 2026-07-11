import { useCallback, useMemo } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { useAuth } from './useAuth.jsx';
import {
  listCompanies, createCompany, updateCompany, deleteCompany, setCompanyVerification,
  listCorporateRates, upsertCorporateRate, deleteCorporateRate,
} from '../api/companies.js';

const KEY = 'hotel.companies';

export function useCompanies() {
  const { staff } = useAuth();
  const q = useQuery(KEY, listCompanies);
  const create = useMutation(createCompany, { invalidate: [KEY] });
  const update = useMutation(({ id, patch }) => updateCompany(id, patch), { invalidate: [KEY] });
  const remove = useMutation(deleteCompany, { invalidate: [KEY] });
  const verify = useMutation(({ id, status }) => setCompanyVerification(id, status, staff?.id), { invalidate: [KEY] });

  const patchCompany = useCallback((id, patch) => update.mutate({ id, patch }), [update]);
  const setVerification = useCallback((id, status) => verify.mutate({ id, status }), [verify]);

  return {
    companies: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createCompany: create.mutate,
    updateCompany: patchCompany,
    deleteCompany: remove.mutate,
    setVerification,
    saving: create.loading || update.loading || remove.loading || verify.loading,
  };
}

export function useCorporateRates(companyId) {
  const key = companyId ? `hotel.corporate_rates.company:${companyId}` : null;
  const fetcher = useMemo(() => () => listCorporateRates(companyId), [companyId]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  const upsert = useMutation(
    ({ roomTypeId, price, notes }) => upsertCorporateRate(companyId, roomTypeId, price, notes),
    { invalidate: key ? [key] : [] },
  );
  const remove = useMutation(
    (roomTypeId) => deleteCorporateRate(companyId, roomTypeId),
    { invalidate: key ? [key] : [] },
  );

  return {
    rates: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    saveRate: upsert.mutate,
    removeRate: remove.mutate,
    saving: upsert.loading || remove.loading,
  };
}
