import React, { useState } from 'react';
import { ChevronDown, Headphones, CheckCircle2 } from 'lucide-react';
import { Sample } from '../../../types';
import { AudioPlayer } from '../../AudioPlayer';
import { V20Family } from '../../../../../shared/v20Families.mjs';
import emotions from '../../../../../shared/v20Emotions.json';
export function V20FamilyCard({ family, onInspect }: { family: V20Family; onInspect: (sample: Sample) => void }) {
  const [open, setOpen] = useState(false), [emotion, setEmotion] = useState('neutral'), [version, setVersion] = useState(0);
  const variants = family.takes[emotion] || [], sample = variants[version] || variants[0];
  return <article className={`v20-family-card v20-${family.provider}`}>
    <button className="v20-family-heading" onClick={() => setOpen(value => !value)} aria-expanded={open}>
      <span className="v20-provider-icon"><Headphones size={19}/></span>
      <span className="v20-family-heading-text"><strong>{family.speaker}</strong><small>{family.provider === 'gemini' ? 'Gemini' : 'ElevenLabs'} / {family.language?.toUpperCase()} / {family.runId}</small></span>
      <span className="v20-completion">{family.present}/50 <small>emotions saved</small></span><ChevronDown size={17}/>
    </button>
    <div className="v20-family-progress"><span style={{ width: `${family.present * 2}%` }}/></div>
    <p className="v20-family-transcript" dir="auto">{family.text}</p>
    <div className="v20-family-summary"><code>{family.id}</code><span>{50 - family.present} missing{family.duplicates ? ` / ${family.duplicates} additional takes` : ''}</span></div>
    {open && <div className="v20-family-expanded">
      <div className="v20-emotion-grid">{emotions.map(item => {
        const takes = family.takes[item.key] || [], exists = takes.some(take => take.hasAudio !== false);
        return <button key={item.key} className={`v20-emotion ${exists ? 'saved' : 'missing'} ${emotion === item.key ? 'selected' : ''}`}
          onClick={() => { setEmotion(item.key); setVersion(0); }} aria-pressed={emotion === item.key}>
          <span>{item.name}</span><small>{exists ? `${Number(takes[0].duration_seconds || takes[0].durationSeconds || 0).toFixed(1)}s` : 'Missing'}</small>
          {exists && <CheckCircle2 size={12}/>}</button>;
      })}</div>
      <div className="v20-take-inspector"><strong>{emotions.find(item => item.key === emotion)?.name}</strong>
        {variants.length > 1 && <select className="select-control" value={version} onChange={event => setVersion(Number(event.target.value))}>
          {variants.map((take, index) => <option key={take.id} value={index}>Take {index + 1} / {take.id}</option>)}
        </select>}
        {sample && sample.hasAudio !== false ? <>
          <AudioPlayer key={sample.id} src={sample.audioUrl || `/api/dataset/${sample.id}/audio`} sampleId={sample.id}
            initialDuration={Number(sample.duration_seconds || sample.durationSeconds || 0)}/>
          <p>{sample.model_id} / {sample.review_status === 'reviewed' ? 'Reviewed' : 'Unreviewed'}{sample.metadata_extra?.segmentation_strategy ? ` / Slicer: ${sample.metadata_extra.segmentation_strategy}` : ''}</p>
          <button className="btn btn-secondary btn-sm" onClick={() => onInspect(sample)}>Inspect take details</button>
        </> : <p>This emotion has no saved audio. Missing does not necessarily mean failed.</p>}
      </div>
    </div>}
  </article>;
}
