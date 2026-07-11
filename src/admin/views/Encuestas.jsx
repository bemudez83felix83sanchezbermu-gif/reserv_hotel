import { useState } from 'react';
import { useSurveys, useSurveyResponses } from '../../shared/hooks/useSurveys.jsx';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

const TRIGGERS = ['post_checkout', 'manual', 'post_meal'];
const TRIGGER_LABELS = { post_checkout: 'Al hacer check-out', manual: 'Manual', post_meal: 'Después de comer' };

function newQuestionId() { return 'q' + Math.random().toString(36).slice(2, 9); }

function SurveyCard({ survey, onUpdate, onDelete, expanded, onToggleExpand }) {
  const { responses, nps, createResponse, saving: savingResponse } = useSurveyResponses(expanded ? survey.id : null);
  const [answerForm, setAnswerForm] = useState({});
  const [npsInput, setNpsInput] = useState('');

  const addQuestion = () => onUpdate(survey.id, { questions: [...survey.questions, { id: newQuestionId(), text: 'Nueva pregunta' }] });
  const editQuestion = (qid, text) => onUpdate(survey.id, {
    questions: survey.questions.map((q) => (q.id === qid ? { ...q, text } : q)),
  });
  const removeQuestion = (qid) => onUpdate(survey.id, { questions: survey.questions.filter((q) => q.id !== qid) });

  const submitResponse = async (e) => {
    e.preventDefault();
    await createResponse({
      surveyId: survey.id,
      answers: answerForm,
      npsScore: npsInput === '' ? null : Math.max(0, Math.min(10, Number(npsInput))),
    });
    setAnswerForm({});
    setNpsInput('');
  };

  return (
    <div style={{ ...CARD, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <input defaultValue={survey.name}
          onBlur={(e) => { if (e.target.value !== survey.name) onUpdate(survey.id, { name: e.target.value }); }}
          style={{ ...inputStyle, fontWeight: 700, fontSize: 15, flex: '1 1 200px' }} />
        <select value={survey.trigger} onChange={(e) => onUpdate(survey.id, { trigger: e.target.value })} style={inputStyle}>
          {TRIGGERS.map((t) => <option key={t} value={t}>{TRIGGER_LABELS[t]}</option>)}
        </select>
        <div onClick={() => onUpdate(survey.id, { active: !survey.active })} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div style={{
            width: 38, height: 21, borderRadius: 99,
            background: survey.active ? '#6F7D5C' : '#D8CCB2',
            position: 'relative', transition: 'background .18s ease',
          }}>
            <div style={{
              position: 'absolute', top: 2.5, width: 16, height: 16, borderRadius: 99,
              background: '#FFFDF7', boxShadow: '0 1px 3px rgba(0,0,0,.25)',
              transition: 'left .18s ease', left: survey.active ? 19.5 : 2.5,
            }} />
          </div>
          <span style={{ fontSize: 12, color: '#6B5D4A' }}>{survey.active ? 'Activa' : 'Inactiva'}</span>
        </div>
        <button onClick={() => onToggleExpand(survey.id)} style={{
          padding: '8px 14px', border: '1px solid #DACBAE', borderRadius: 9,
          background: 'transparent', fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>{expanded ? 'Cerrar' : 'Ver preguntas y respuestas'}</button>
        <button onClick={() => onDelete(survey.id)} style={{
          width: 32, height: 32, borderRadius: '50%', border: '1px solid #E3B8AC',
          background: 'transparent', color: '#A8442C', cursor: 'pointer', fontSize: 12.5,
        }}>✕</button>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed #E9DFCC' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#8A7A63' }}>PREGUNTAS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {survey.questions.map((q) => (
              <div key={q.id} style={{ display: 'flex', gap: 8 }}>
                <input defaultValue={q.text}
                  onBlur={(e) => { if (e.target.value !== q.text) editQuestion(q.id, e.target.value); }}
                  style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => removeQuestion(q.id)} style={{
                  border: 'none', background: 'transparent', color: '#93402D',
                  fontFamily: 'Karla, sans-serif', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                }}>Quitar</button>
              </div>
            ))}
            {survey.questions.length === 0 && <div style={{ fontSize: 12, color: '#8A7A63' }}>Sin preguntas todavía.</div>}
          </div>
          <button onClick={addQuestion} style={{
            marginTop: 8, padding: '8px 14px', border: '1.5px dashed #C9B788', borderRadius: 9,
            background: 'transparent', color: '#6B5335',
            fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>+ Agregar pregunta</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#8A7A63' }}>RESPUESTAS ({responses.length})</div>
            {nps != null && (
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999,
                background: nps >= 0 ? '#EAF2E6' : '#F5E0DA', color: nps >= 0 ? '#3F6E4C' : '#7A3B2A',
              }}>NPS {nps}</span>
            )}
          </div>

          <form onSubmit={submitResponse} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, background: '#FDFBF4', border: '1px solid #EDE3CF', borderRadius: 12, padding: 12 }}>
            {survey.questions.map((q) => (
              <input key={q.id} placeholder={q.text} value={answerForm[q.id] || ''}
                onChange={(e) => setAnswerForm((a) => ({ ...a, [q.id]: e.target.value }))}
                style={inputStyle} />
            ))}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" min={0} max={10} placeholder="NPS 0-10 (opcional)" value={npsInput}
                onChange={(e) => setNpsInput(e.target.value)} style={{ ...inputStyle, width: 160 }} />
              <button type="submit" disabled={savingResponse} style={{
                padding: '9px 16px', border: 'none', borderRadius: 9,
                background: 'var(--ac, #B8552F)', color: '#FBF6EA',
                fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>+ Registrar respuesta</button>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {responses.map((r) => (
              <div key={r.id} style={{ fontSize: 12, color: '#6B5D4A', borderTop: '1px solid #F2EADA', paddingTop: 6 }}>
                {r.npsScore != null && <span style={{ fontWeight: 700, marginRight: 8 }}>NPS {r.npsScore}</span>}
                {Object.values(r.answers || {}).filter(Boolean).join(' · ') || '—'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Encuestas() {
  const { surveys, loading, error, createSurvey, updateSurvey, deleteSurvey } = useSurveys();
  const [expandedId, setExpandedId] = useState(null);

  const onNew = () => createSurvey({ name: 'Nueva encuesta', trigger: 'manual', questions: [], active: true });

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Encuestas</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Preguntas por encuesta, respuestas registradas y NPS agregado
          </div>
        </div>
        <button onClick={onNew} style={{
          flex: 'none', padding: '12px 20px', border: 'none', borderRadius: 12,
          background: 'var(--ac, #B8552F)', color: '#FBF6EA',
          fontFamily: 'Karla, sans-serif', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 8px 18px rgba(184,85,47,.28)',
        }}>+ Nueva encuesta</button>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
        {surveys.map((s) => (
          <SurveyCard
            key={s.id}
            survey={s}
            onUpdate={updateSurvey}
            onDelete={deleteSurvey}
            expanded={expandedId === s.id}
            onToggleExpand={(id) => setExpandedId((cur) => (cur === id ? null : id))}
          />
        ))}
        {!loading && surveys.length === 0 && (
          <div style={{ ...CARD, padding: 24, textAlign: 'center', color: '#8A7A63', fontSize: 13.5 }}>Sin encuestas registradas.</div>
        )}
      </div>
    </div>
  );
}
