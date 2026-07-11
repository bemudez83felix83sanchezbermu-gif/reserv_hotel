import { useCallback, useMemo } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import {
  listSurveys,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  listSurveyResponses,
  createSurveyResponse,
} from '../api/surveys.js';

const KEY = 'hotel.surveys';

export function useSurveys() {
  const q = useQuery(KEY, listSurveys);
  const create = useMutation(createSurvey, { invalidate: [KEY] });
  const update = useMutation(({ id, patch }) => updateSurvey(id, patch), { invalidate: [KEY] });
  const remove = useMutation(deleteSurvey, { invalidate: [KEY] });

  const patchSurvey = useCallback((id, patch) => update.mutate({ id, patch }), [update]);

  return {
    surveys: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createSurvey: create.mutate,
    updateSurvey: patchSurvey,
    deleteSurvey: remove.mutate,
    saving: create.loading || update.loading || remove.loading,
  };
}

// NPS clásico: %promotores (9-10) - %detractores (0-6), sobre respuestas con nps_score.
function computeNps(responses) {
  const scored = responses.filter((r) => r.npsScore != null);
  if (!scored.length) return null;
  const promoters = scored.filter((r) => r.npsScore >= 9).length;
  const detractors = scored.filter((r) => r.npsScore <= 6).length;
  return Math.round(((promoters - detractors) / scored.length) * 100);
}

export function useSurveyResponses(surveyId) {
  const key = surveyId ? `hotel.survey_responses.survey:${surveyId}` : null;
  const fetcher = useMemo(() => () => listSurveyResponses(surveyId), [surveyId]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  const create = useMutation(createSurveyResponse, { invalidate: key ? [key] : [] });

  const responses = q.data || [];
  return {
    responses,
    nps: computeNps(responses),
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createResponse: create.mutate,
    saving: create.loading,
  };
}
