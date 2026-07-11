import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('companies');
const ratesTable = () => supabase.schema('hotel').from('corporate_rates');

export async function listCompanies() {
  const { data, error } = await table().select('*').order('legal_name');
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createCompany(input) {
  const { data, error } = await table().insert(toRow(input)).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateCompany(id, patch) {
  const { data, error } = await table().update(toRow(patch, true)).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteCompany(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

export async function setCompanyVerification(id, status, verifiedBy) {
  const patch = { verification_status: status };
  if (status === 'approved' || status === 'rejected') {
    patch.verified_by = verifiedBy || null;
    patch.verified_at = new Date().toISOString();
  }
  const { data, error } = await table().update(patch).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function listCorporateRates(companyId) {
  const { data, error } = await ratesTable()
    .select('company_id, room_type_id, price, notes, updated_at, room_types:room_type_id ( id, name )')
    .eq('company_id', companyId);
  if (error) throw error;
  return (data || []).map((r) => ({
    companyId: r.company_id,
    roomTypeId: r.room_type_id,
    roomTypeName: r.room_types?.name || '',
    price: Number(r.price),
    notes: r.notes || '',
    updatedAt: r.updated_at,
  }));
}

export async function upsertCorporateRate(companyId, roomTypeId, price, notes) {
  const { error } = await ratesTable()
    .upsert({ company_id: companyId, room_type_id: roomTypeId, price, notes: notes || null }, { onConflict: 'company_id,room_type_id' });
  if (error) throw error;
}

export async function deleteCorporateRate(companyId, roomTypeId) {
  const { error } = await ratesTable().delete().eq('company_id', companyId).eq('room_type_id', roomTypeId);
  if (error) throw error;
}

function toRow(input, partial = false) {
  const row = {};
  if (input.legalName !== undefined) row.legal_name = input.legalName;
  if (input.commercialName !== undefined) row.commercial_name = input.commercialName || null;
  if (input.rfc !== undefined) row.rfc = input.rfc || null;
  if (input.contactName !== undefined) row.contact_name = input.contactName || null;
  if (input.email !== undefined) row.email = input.email || null;
  if (input.phone !== undefined) row.phone = input.phone || null;
  if (input.notes !== undefined) row.notes = input.notes || null;
  if (partial && Object.keys(row).length === 0) return {};
  return row;
}

function fromRow(row) {
  return {
    id: row.id,
    legalName: row.legal_name,
    commercialName: row.commercial_name || '',
    rfc: row.rfc || '',
    contactName: row.contact_name || '',
    email: row.email || '',
    phone: row.phone || '',
    verificationStatus: row.verification_status,
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}
