import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, RefreshCw, KeyRound } from 'lucide-react';
import '../styles/operationalPanels.css';
interface Row { keyId: string; provider: string; maskedKey: string; requests: number; succeeded: number;
  failed: number; rateLimited: number; unfinished: number; inputCharacters: number; durationMs: number;
  models: Record<string, number>; lastUsed: string }
interface Statistics { since: string | null; rows: Row[]; note: string }
export function RequestStatisticsPage({ active }: { active: boolean }) {
  const [data, setData] = useState<Statistics>(), [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/request-statistics');
      if (!response.ok) throw new Error('Statistics endpoint unavailable. Restart the backend to load the update.');
      setData(await response.json()); setError('');
    } catch (failure: any) { setError(failure.message); }
  }, []);
  useEffect(() => { if (!active) return; void refresh(); const timer = setInterval(refresh, 5000); return () => clearInterval(timer); }, [active, refresh]);
  const rows = data?.rows || [], total = rows.reduce((sum, row) => sum + row.requests, 0);
  return <section className="ops-page">
    <div className="ops-heading"><div><h2><BarChart3 size={24}/> Request statistics</h2><p>Speech API attempts across both providers and every key.</p></div>
      <button className="btn btn-secondary" onClick={() => void refresh()}><RefreshCw size={15}/> Refresh</button></div>
    {error && <p role="alert" className="ops-error">{error}</p>}
    <div className="ops-summary-grid">
      <div className="glass-card ops-summary"><small>Total attempts</small><strong>{total.toLocaleString()}</strong></div>
      {['gemini', 'elevenlabs'].map(provider => {
        const items = rows.filter(row => row.provider === provider);
        return <div className="glass-card ops-summary" key={provider}><small>{provider === 'gemini' ? 'Gemini' : 'ElevenLabs'}</small>
          <strong>{items.reduce((sum, row) => sum + row.requests, 0).toLocaleString()}</strong>
          <span>{items.reduce((sum, row) => sum + row.succeeded, 0)} successful / {items.reduce((sum, row) => sum + row.failed, 0)} failed HTTP requests</span></div>;
      })}
    </div>
    <div className="glass-card ops-table-wrap"><table className="ops-table"><thead><tr>
      <th>Provider / key</th><th>Attempts</th><th>HTTP success</th><th>Failed</th><th>429s</th><th>Unfinished</th><th>Input characters</th><th>Avg. response</th><th>Models</th><th>Last request</th>
    </tr></thead><tbody>{rows.map(row => <tr key={row.keyId}>
      <td><strong>{row.provider}</strong><span><KeyRound size={12}/> {row.maskedKey}</span><small>{row.keyId.slice(0, 8)}</small></td>
      <td>{row.requests}</td><td>{row.succeeded}</td><td>{row.failed}</td><td>{row.rateLimited}</td><td>{row.unfinished}</td>
      <td>{row.inputCharacters.toLocaleString()}</td><td>{((row.durationMs / Math.max(1, row.succeeded + row.failed)) / 1000).toFixed(1)}s</td>
      <td>{Object.entries(row.models).map(([model, count]) => <small key={model}>{model}: {count}</small>)}</td>
      <td>{new Date(row.lastUsed).toLocaleString()}</td>
    </tr>)}</tbody></table>{!rows.length && <p className="ops-empty">No tracked speech requests yet.</p>}</div>
    <p className="ops-note">{data?.note || 'Historical attempts before tracking began are unavailable.'}</p>
    <p className="ops-note">Tracking started: {data?.since ? new Date(data.since).toLocaleString() : 'No requests yet'}. Attempts include key rotation and endpoint retries. HTTP success does not mean the audio passed slicing or review. Input characters are not billed credits. Unfinished requests may be in flight or interrupted by a server restart.</p>
  </section>;
}
