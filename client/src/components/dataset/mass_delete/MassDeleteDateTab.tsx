import React from 'react';

export type DatePreset = 'not_today' | 'today_only' | 'older_7_days' | 'older_30_days' | 'custom';

interface MassDeleteDateTabProps {
  datePreset: DatePreset;
  setDatePreset: (p: DatePreset) => void;
  customDateType: 'before' | 'after' | 'between';
  setCustomDateType: (t: 'before' | 'after' | 'between') => void;
  customDateStart: string;
  setCustomDateStart: (s: string) => void;
  customDateEnd: string;
  setCustomDateEnd: (s: string) => void;
  timeInfo: {
    notTodayCount: number;
    todayCount: number;
    older7DaysCount: number;
    older30DaysCount: number;
  };
}

export const MassDeleteDateTab: React.FC<MassDeleteDateTabProps> = ({
  datePreset,
  setDatePreset,
  customDateType,
  setCustomDateType,
  customDateStart,
  setCustomDateStart,
  customDateEnd,
  setCustomDateEnd,
  timeInfo
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Select Date Condition:
      </span>

      {/* Preset 1: Not Today / Created Before Today */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderRadius: '10px',
          background: datePreset === 'not_today' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
          border: datePreset === 'not_today' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="radio"
            name="date_preset"
            checked={datePreset === 'not_today'}
            onChange={() => setDatePreset('not_today')}
            style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>
              Not Today (Created Before Today)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Delete all older samples prior to today's date. Keeps today's newly generated samples intact.
            </div>
          </div>
        </div>
        <span className="badge badge-warning" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
          {timeInfo.notTodayCount.toLocaleString()} samples
        </span>
      </label>

      {/* Preset 2: Created Today Only */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderRadius: '10px',
          background: datePreset === 'today_only' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
          border: datePreset === 'today_only' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="radio"
            name="date_preset"
            checked={datePreset === 'today_only'}
            onChange={() => setDatePreset('today_only')}
            style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>
              Created Today Only
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Purge samples created today (useful if a bad test run was generated).
            </div>
          </div>
        </div>
        <span className="badge badge-info" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
          {timeInfo.todayCount.toLocaleString()} samples
        </span>
      </label>

      {/* Preset 3: Older than 7 Days */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderRadius: '10px',
          background: datePreset === 'older_7_days' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
          border: datePreset === 'older_7_days' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="radio"
            name="date_preset"
            checked={datePreset === 'older_7_days'}
            onChange={() => setDatePreset('older_7_days')}
            style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>Older Than 7 Days</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Keep the last week's samples, purge older history.</div>
          </div>
        </div>
        <span className="badge badge-secondary" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
          {timeInfo.older7DaysCount.toLocaleString()} samples
        </span>
      </label>

      {/* Preset 4: Older than 30 Days */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderRadius: '10px',
          background: datePreset === 'older_30_days' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
          border: datePreset === 'older_30_days' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="radio"
            name="date_preset"
            checked={datePreset === 'older_30_days'}
            onChange={() => setDatePreset('older_30_days')}
            style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>Older Than 30 Days</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Archive cleanup for stale tests older than a month.</div>
          </div>
        </div>
        <span className="badge badge-secondary" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
          {timeInfo.older30DaysCount.toLocaleString()} samples
        </span>
      </label>

      {/* Preset 5: Custom Date Range */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '10px',
          background: datePreset === 'custom' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
          border: datePreset === 'custom' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <input
            type="radio"
            name="date_preset"
            checked={datePreset === 'custom'}
            onChange={() => setDatePreset('custom')}
            style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>Custom Date Boundary</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Specify an exact before, after, or between date range.</div>
          </div>
        </label>

        {datePreset === 'custom' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginTop: '6px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Range Mode</label>
              <select
                className="select-control"
                value={customDateType}
                onChange={(e) => setCustomDateType(e.target.value as any)}
                style={{ width: '100%', fontSize: '0.82rem' }}
              >
                <option value="before">Created Before Date</option>
                <option value="after">Created After Date</option>
                <option value="between">Created Between Dates</option>
              </select>
            </div>

            {(customDateType === 'after' || customDateType === 'between') && (
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Start Date</label>
                <input
                  type="date"
                  className="input-control"
                  value={customDateStart}
                  onChange={(e) => setCustomDateStart(e.target.value)}
                  style={{ width: '100%', fontSize: '0.82rem' }}
                />
              </div>
            )}

            {(customDateType === 'before' || customDateType === 'between') && (
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>End Date</label>
                <input
                  type="date"
                  className="input-control"
                  value={customDateEnd}
                  onChange={(e) => setCustomDateEnd(e.target.value)}
                  style={{ width: '100%', fontSize: '0.82rem' }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
