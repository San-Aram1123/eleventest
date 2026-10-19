import React from 'react';
import { AutoTask } from '../../../../shared/dualPilotAuto.mjs';
interface Props {
  failures: Array<{ task: AutoTask; error: string }>; active: boolean;
  retry: () => unknown; download: () => void;
}
export const DualPilotFailures: React.FC<Props> = ({ failures, active, retry, download }) => {
  if (!failures.length) return null;
  return <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
    <button className="btn btn-secondary" disabled={active} onClick={() => void retry()}>Retry {failures.length} failed tasks</button>
    <button className="btn btn-secondary" onClick={download}>Download failure report</button>
    <p>Gemini retries its failed task using cached audio when available. ElevenLabs retries only the failed sentence. Successful tasks stay saved. Retry is available in this open session.</p>
    <details><summary>Failure details</summary>{failures.map(item => <p key={item.task.key}>
      {item.task.provider} / sentences {item.task.start + 1}?{item.task.start + item.task.count} / {item.task.condition.name}: {item.error}
    </p>)}</details>
  </div>;
};
