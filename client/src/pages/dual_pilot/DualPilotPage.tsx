import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Square, Layers, Download, CheckCircle2, Zap } from 'lucide-react';
import { DualPilotKeyManagerCard } from './DualPilotKeyManagerCard';
import { DualPilotConfigCard } from './DualPilotConfigCard';
import { DualPilotInputCard } from './DualPilotInputCard';
import { DualPilotFamilyCard } from './DualPilotFamilyCard';
import { useDualPilotRunner } from './useDualPilotRunner';
import { fetchDualPilotConfig, DualPilotConfigResponse, FALLBACK_ELEVEN_VOICES } from './dualPilotApi';
import { DualPilotConfig, DUAL_PILOT_LANGUAGES } from './dualPilotTypes';
import { V20_PRESET_TIERS } from './v20Conditions';

interface DualPilotPageProps {
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const DualPilotPage: React.FC<DualPilotPageProps> = ({ addToast }) => {
  const [configData, setConfigData] = useState<DualPilotConfigResponse | null>(null);
  const [geminiText, setGeminiText] = useState(() => DUAL_PILOT_LANGUAGES[0].sampleSentences.join('\n\n'));
  const [elevenText, setElevenText] = useState(() => DUAL_PILOT_LANGUAGES[0].sampleSentences.join('\n\n'));

  const [config, setConfig] = useState<DualPilotConfig>({
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

      // Select female and male voices (prioritize premades for free tier compatibility)
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

  const geminiParagraphs = useMemo(() => {
    return geminiText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  }, [geminiText]);

  const elevenParagraphs = useMemo(() => {
    return elevenText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  }, [elevenText]);

  const runner = useDualPilotRunner({ geminiParagraphs, elevenParagraphs, config, addToast });

  const progressPercent = runner.progress.totalExpectedTakes > 0
    ? Math.round((runner.progress.completedTakes / runner.progress.totalExpectedTakes) * 100)
    : 0;

  const exportFamilyJsonl = () => {
    const lines = runner.families.map(f => JSON.stringify({
      familyId: f.familyId,
      sentenceIndex: f.paragraphIndex + 1,
      gender: f.gender,
      language: config.language,
      dialect: config.dialect,
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

  const selectedTier = V20_PRESET_TIERS.find(p => p.id === config.selectedPresetId) || V20_PRESET_TIERS[0];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 0 3rem' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>Dual Provider Automated Matrix Studio</span>
            <span className="badge" style={{ background: '#6366F122', color: '#818CF8', border: '1px solid #6366F155' }}>
              Gemini 3.8 vs. ElevenLabs v4 Turbo
            </span>
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: '#94A3B8', fontSize: '0.85rem' }}>
            Transposed 6-sentence master with 7 neural slicing engines (Gemini) • 1-by-1 with key rotation (ElevenLabs v4 Turbo) • Auto-loops through all tier conditions.
          </p>
        </div>

        {runner.families.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={exportFamilyJsonl}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
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
        geminiFemaleVoice={config.geminiFemaleVoice}
        geminiMaleVoice={config.geminiMaleVoice}
        elevenFemaleVoiceName={config.elevenFemaleVoiceName}
        elevenMaleVoiceName={config.elevenMaleVoiceName}
        geminiParagraphCount={geminiParagraphs.length}
        elevenParagraphCount={elevenParagraphs.length}
        disabled={runner.progress.isActive}
      />

      {/* Run Action Controls & Live Progress */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!runner.progress.isActive ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => runner.startBatch()}
              disabled={geminiParagraphs.length === 0 && elevenParagraphs.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}
            >
              <Play size={16} /> {config.selectedPresetId === 'quick_smoke1'
                ? `Run Quick Test: [${config.smokeEmotion || 'neutral'}]`
                : `Run Automated Batch (${selectedTier.conditionCount} Conditions)`}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-danger"
              onClick={runner.stopBatch}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}
            >
              <Square size={16} /> Stop Batch
            </button>
          )}

          {runner.progress.isActive && (
            <div style={{ fontSize: '0.85rem', color: '#A78BFA', fontWeight: 600 }}>
              <span>Cond {runner.progress.currentConditionIndex}/{runner.progress.totalConditions}: {runner.progress.currentConditionLabel}</span>
              <span style={{ color: '#34D399', marginLeft: '6px' }}>
                (Gemini 3.8 + ElevenLabs in parallel ⚡)
              </span>
            </div>
          )}
        </div>

        {runner.progress.totalExpectedTakes > 0 && (
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>
              <span>Progress: {runner.progress.completedTakes} / {runner.progress.totalExpectedTakes} takes</span>
              <span>{progressPercent}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #7C3AED, #10B981)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Generated Families List */}
      {runner.families.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Layers size={18} className="text-primary" />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>
              Parallel Sentence Families ({runner.families.length} Families)
            </span>
          </div>

          {runner.families.map(fam => (
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
