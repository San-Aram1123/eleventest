import { DualPilotFailures } from './DualPilotFailures';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Square, Layers, Download } from 'lucide-react';
import { DualPilotKeyManagerCard } from './DualPilotKeyManagerCard';
import { DualPilotConfigCard } from './DualPilotConfigCard';
import { DualPilotInputCard } from './DualPilotInputCard';
import { DualPilotFamilyCard } from './DualPilotFamilyCard';
import { useDualPilotRunner } from './useDualPilotRunner';
import { fetchDualPilotConfig, DualPilotConfigResponse, FALLBACK_ELEVEN_VOICES } from './dualPilotApi';
import { DualPilotConfig, DUAL_PILOT_LANGUAGES } from './dualPilotTypes';
import { DualPilotEmotionExperiment } from './DualPilotEmotionExperiment';

interface DualPilotPageProps {
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const DualPilotPage: React.FC<DualPilotPageProps> = ({ addToast }) => {
  const [familyPage, setFamilyPage] = useState(0);
  const [configData, setConfigData] = useState<DualPilotConfigResponse | null>(null);
  const [geminiText, setGeminiText] = useState(() => DUAL_PILOT_LANGUAGES[0].sampleSentences.join('\n\n'));
  const [elevenText, setElevenText] = useState(() => DUAL_PILOT_LANGUAGES[0].sampleSentences.join('\n\n'));

  const [config, setConfig] = useState<DualPilotConfig>({
    elevenVoiceSlots: [0, 3, 1, 4, 2, 5].map(index => ({
      voiceId: FALLBACK_ELEVEN_VOICES[index].voice_id, voiceName: FALLBACK_ELEVEN_VOICES[index].name
    })),
    selectedPresetId: 'quick_smoke1',
    language: 'ckb',
    geminiFemaleVoice: 'Aoede',
    geminiMaleVoice: 'Puck',
    elevenFemaleVoiceId: FALLBACK_ELEVEN_VOICES[0].voice_id,
    elevenFemaleVoiceName: FALLBACK_ELEVEN_VOICES[0].name,
    elevenMaleVoiceId: FALLBACK_ELEVEN_VOICES[3].voice_id,
    elevenMaleVoiceName: FALLBACK_ELEVEN_VOICES[3].name,
    elevenModel: 'eleven_v4_turbo',
    dialect: 'sorani',
    chunkSize: 6,
    smokeEmotion: 'neutral',
    saveToDataset: true
  });

  const loadConfig = useCallback(async () => {
    try {
      const data = await fetchDualPilotConfig();
      setConfigData(data);
      const voices = data.elevenlabs.voices || FALLBACK_ELEVEN_VOICES;

      const premades = voices.filter(v => !v.category || v.category === 'premade');
      const voicePool = premades.length > 0 ? premades : voices;
      const female = voicePool.find(v => /sarah|laura|alice/i.test(v.name)) || voicePool.find(v => /female|nicole/i.test(v.name)) || voicePool[0];
      const male = voicePool.find(v => /roger|charlie|george|adam/i.test(v.name)) || voicePool.find(v => /male|callum/i.test(v.name)) || voicePool[1] || voicePool[0];

      setConfig(prev => ({
        ...prev,
        geminiFemaleVoice: data.gemini.defaultFemaleVoice || prev.geminiFemaleVoice,
        geminiMaleVoice: data.gemini.defaultMaleVoice || prev.geminiMaleVoice,
        elevenFemaleVoiceId: female?.voice_id || prev.elevenFemaleVoiceId,
        elevenFemaleVoiceName: female?.name || prev.elevenFemaleVoiceName,
        elevenMaleVoiceId: male?.voice_id || prev.elevenMaleVoiceId,
        elevenMaleVoiceName: male?.name || prev.elevenMaleVoiceName,
        elevenModel: 'eleven_v4_turbo'
      }));
    } catch (err: any) {
      console.warn('Failed to load dual pilot config:', err);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const geminiParagraphs = useMemo(() => geminiText.split(/\r?\n/).map(l => l.trim()).filter(Boolean), [geminiText]);
  const elevenParagraphs = useMemo(() => elevenText.split(/\r?\n/).map(l => l.trim()).filter(Boolean), [elevenText]);

  const runner = useDualPilotRunner({ geminiParagraphs, elevenParagraphs, config, addToast });

  const progressPercent = runner.progress.totalExpectedTakes > 0
    ? Math.round((runner.progress.completedTakes / runner.progress.totalExpectedTakes) * 100)
    : 0;

  const exportFamilyJsonl = () => {
    const lines = runner.families.map(f => JSON.stringify({
      familyId: f.familyId,
      sentenceIndex: f.paragraphIndex + 1,
      gender: f.gender,
      language: f.language,
      dialect: f.language === 'kmr' ? 'badini' : 'sorani',
      transcript: f.transcript,
      geminiTakes: Object.values(f.geminiTakes).map(t => ({
        condition: t.conditionId,
        model: t.modelId,
        voice: t.voiceName,
        slicingEngine: t.slicingEngine,
        duration: t.duration,
        emotion: t.emotion
      })),
      elevenlabsTakes: Object.values(f.elevenlabsTakes).map(t => ({
        condition: t.conditionId,
        model: t.modelId,
        voice: t.voiceName,
        keyUsed: t.keyUsedMasked,
        duration: t.duration,
        emotion: t.emotion
      })),
      userRatings: f.userRatings || {}
    })).join('\n');

    const blob = new Blob([lines], { type: 'application/x-jsonlines;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `v20_dual_pilot_${Date.now()}.jsonl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem 0 3.5rem' }}>
      {/* Apple Styled Hero Banner */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.65rem', letterSpacing: '-0.025em' }}>
            <span>Dual Provider Automated Matrix Studio</span>
            <span className="badge" style={{ background: 'rgba(10, 132, 255, 0.12)', color: '#0A84FF', border: '1px solid rgba(10, 132, 255, 0.3)', borderRadius: '9999px', padding: '3px 10px', fontSize: '0.74rem', fontWeight: 600 }}>
              Gemini 3.8 vs. ElevenLabs v4 Turbo
            </span>
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem', letterSpacing: '-0.005em' }}>
            Transposed 6-sentence master with 8 slicing engines (7 neural + silence, Gemini) • 1-by-1 with key rotation (ElevenLabs v4 Turbo) • Auto-loops through all tier conditions.
          </p>
        </div>

        {runner.families.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={exportFamilyJsonl}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', borderRadius: '9999px', padding: '6px 14px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid var(--border-medium)', fontWeight: 600 }}
          >
            <Download size={14} /> Export Dual Manifest (JSONL)
          </button>
        )}
      </div>

      {/* Key Pool Status & Management */}
      <DualPilotKeyManagerCard
        elevenKeys={configData?.elevenlabs.keys || []}
        geminiKeysCount={configData?.gemini.keys?.length || 0}
        onRefreshKeys={loadConfig}
        disabled={runner.progress.isActive}
      />

      {/* Preset Tier & Voice Configuration */}
      <DualPilotConfigCard
        config={config}
        onChangeConfig={setConfig}
        geminiVoices={configData?.gemini.voices || ['Aoede', 'Puck', 'Charon', 'Fenrir']}
        elevenVoices={configData?.elevenlabs.voices || FALLBACK_ELEVEN_VOICES}
        disabled={runner.progress.isActive}
      />

      {/* Sentences Input */}
      <DualPilotInputCard
        geminiText={geminiText}
        onChangeGeminiText={setGeminiText}
        elevenText={elevenText}
        onChangeElevenText={setElevenText}
        language={config.language}
        elevenVoiceSlots={config.elevenVoiceSlots}
        geminiFemaleVoice={config.geminiFemaleVoice}
        geminiMaleVoice={config.geminiMaleVoice}
        elevenFemaleVoiceName={config.elevenFemaleVoiceName}
        elevenMaleVoiceName={config.elevenMaleVoiceName}
        geminiParagraphCount={geminiParagraphs.length}
        elevenParagraphCount={elevenParagraphs.length}
        disabled={runner.progress.isActive}
      />

      {/* Apple Run Action Controls & Glass Progress Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.1rem 1.4rem',
          marginBottom: '1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-medium)',
          borderTop: '1px solid var(--border-specular)',
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.28)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {!runner.progress.isActive ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => runner.startBatch()}
              disabled={geminiParagraphs.length === 0 && elevenParagraphs.length === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.65rem 1.4rem',
                borderRadius: '9999px', fontWeight: 600, fontSize: '0.88rem',
                background: 'linear-gradient(145deg, #0A84FF, #0066CC)',
                boxShadow: '0 4px 18px rgba(10, 132, 255, 0.38)',
                borderTop: '1px solid rgba(255, 255, 255, 0.35)'
              }}
            >
              <Play size={16} /> Generate All 50 Emotions
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-danger"
              onClick={runner.stopBatch}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.65rem 1.4rem',
                borderRadius: '9999px', fontWeight: 600, fontSize: '0.88rem',
                background: 'linear-gradient(145deg, #FF453A, #D62B20)',
                boxShadow: '0 4px 18px rgba(255, 69, 58, 0.38)',
                borderTop: '1px solid rgba(255, 255, 255, 0.35)'
              }}
            >
              <Square size={16} /> Stop Batch
            </button>
          )}

          {runner.progress.isActive && (
            <div style={{ fontSize: '0.85rem', color: '#BF5AF2', fontWeight: 600, letterSpacing: '-0.01em' }}>
              <span>Cond {runner.progress.currentConditionIndex}/{runner.progress.totalConditions}: {runner.progress.currentConditionLabel}</span>
              <span style={{ color: '#30D158', marginLeft: '8px' }}>
                (Gemini 3.8 + ElevenLabs in parallel ⚡)
              </span>
            </div>
          )}
        </div>

        {runner.progress.totalExpectedTakes > 0 && (
          <div style={{ flex: 1, maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 500 }}>
              <span>Progress: {runner.progress.completedTakes} / {runner.progress.totalExpectedTakes} takes</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0A84FF' }}>{progressPercent}%</span>
            </div>
            <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #BF5AF2, #0A84FF, #30D158)', borderRadius: '9999px', transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            </div>
          </div>
        )}
      </div>

      <DualPilotEmotionExperiment
        paragraphs={geminiParagraphs}
        femaleVoice={config.geminiFemaleVoice}
        maleVoice={config.geminiMaleVoice}
        emotion={config.smokeEmotion || 'neutral'}
        language={config.language}
        dialect={config.dialect}
        disabled={runner.progress.isActive}
      />

      <DualPilotFailures failures={runner.failedTasks} active={runner.progress.isActive}
        retry={runner.retryFailed} download={runner.downloadFailures} />
      {/* Generated Families List */}
      {runner.families.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <Layers size={18} style={{ color: '#0A84FF' }} />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.015em' }}>
              Parallel Sentence Families ({runner.families.length} Families)
            </span>
          </div>

          <div><button disabled={familyPage === 0} onClick={() => setFamilyPage(page => page - 1)}>Previous</button>
            <span> Page {familyPage + 1} of {Math.max(1, Math.ceil(runner.families.length / 24))} </span>
            <button disabled={(familyPage + 1) * 24 >= runner.families.length} onClick={() => setFamilyPage(page => page + 1)}>Next</button></div>
          {runner.families.slice(familyPage * 24, (familyPage + 1) * 24).map(fam => (
            <DualPilotFamilyCard
              key={fam.familyId}
              family={fam}
              currentlyPlayingId={runner.currentlyPlayingId}
              onTogglePlay={runner.togglePlay}
              onRateFamily={runner.rateFamily}
            />
          ))}
        </div>
      )}
    </div>
  );
};
