import supabase from '../supabase.js';

const surveys = () => supabase.schema('hotel').from('surveys');
const responses = () => supabase.schema('hotel').from('survey_responses');

export async function listSurveys() {
  const { data, error } = await surveys().select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromSurveyRow);
}

export async function createSurvey(input) {
  const { data, error } = await surveys()
    .insert({ name: input.name, trigger: input.trigger, questions: input.questions || [], active: input.active ?? true })
    .select().single();
  if (error) throw error;
  return fromSurveyRow(data);
}

export async function updateSurvey(id, patch) {
  const row = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.trigger !== undefined) row.trigger = patch.trigger;
  if (patch.questions !== undefined) row.questions = patch.questions;
  if (patch.active !== undefined) row.active = patch.active;
  const { data, error } = await surveys().update(row).eq('id', id).select().single();
  if (error) throw error;
  return fromSurveyRow(data);
}

export async function deleteSurvey(id) {
  const { error } = await surveys().delete().eq('id', id);
  if (error) throw error;
}

const RESPONSE_SELECT = `
  id, survey_id, reservation_id, guest_id, answers, nps_score, submitted_at,
  reservations:reservation_id ( id, code ),
  guests:guest_id ( id, first_name, last_name )
`;

export async function listSurveyResponses(surveyId) {
  const { data, error } = await responses().select(RESPONSE_SELECT).eq('survey_id', surveyId).order('submitted_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromResponseRow);
}

export async function createSurveyResponse(input) {
  const { data, error } = await responses()
    .insert({
      survey_id: input.surveyId,
      reservation_id: input.reservationId || null,
      guest_id: input.guestId || null,
      answers: input.answers || {},
      nps_score: input.npsScore ?? null,
    })
    .select(RESPONSE_SELECT)
    .single();
  if (error) throw error;
  return fromResponseRow(data);
}

function fromSurveyRow(row) {
  return {
    id: row.id,
    name: row.name,
    trigger: row.trigger,
    questions: row.questions || [],
    active: row.active !== false,
    createdAt: row.created_at,
  };
}

function fromResponseRow(row) {
  const guest = row.guests ? [row.guests.first_name, row.guests.last_name].filter(Boolean).join(' ') : '';
  return {
    id: row.id,
    surveyId: row.survey_id,
    reservationId: row.reservation_id,
    reservationCode: row.reservations?.code || '',
    guestId: row.guest_id,
    guest,
    answers: row.answers || {},
    npsScore: row.nps_score,
    submittedAt: row.submitted_at,
  };
}
