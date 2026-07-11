import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import {
  listPrintTemplates,
  createPrintTemplate,
  updatePrintTemplate,
  deletePrintTemplate,
  getActivePrintTemplate,
  printWithTemplate,
} from '../api/printTemplates.js';

const KEY = 'hotel.print_templates';

export function usePrintTemplates() {
  const q = useQuery(KEY, listPrintTemplates);
  const create = useMutation(createPrintTemplate, { invalidate: [KEY] });
  const update = useMutation(({ id, patch }) => updatePrintTemplate(id, patch), { invalidate: [KEY] });
  const remove = useMutation(deletePrintTemplate, { invalidate: [KEY] });

  const patchTemplate = useCallback((id, patch) => update.mutate({ id, patch }), [update]);

  return {
    templates: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createTemplate: create.mutate,
    updateTemplate: patchTemplate,
    deleteTemplate: remove.mutate,
    saving: create.loading || update.loading || remove.loading,
  };
}

// Imprime con la plantilla activa del kind indicado; no hace nada si no hay ninguna activa.
export async function printActiveTemplate(kind, variables) {
  const template = await getActivePrintTemplate(kind);
  if (!template) return false;
  return printWithTemplate(template, variables);
}
