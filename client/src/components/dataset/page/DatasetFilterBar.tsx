import React from 'react';
import {
  Search,
  Users,
  Volume2,
  Languages,
  Globe,
  Filter,
  Key,
  ArrowUpDown,
  Layers,
  Sparkles
} from 'lucide-react';

interface DatasetFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterGender: 'all' | 'male' | 'female';
  onGenderChange: (g: 'all' | 'male' | 'female') => void;
  filterVoice: string;
  onVoiceChange: (v: string) => void;
  availableVoices: { name: string; count: number }[];
  filterLanguage: string;
  onLanguageChange: (l: string) => void;
  availableLanguages: { code: string; label: string; count: number }[];
  filterDialect: 'all' | 'sorani' | 'badini';
  onDialectChange: (d: 'all' | 'sorani' | 'badini') => void;
  filterEmotion: string;
  onEmotionChange: (e: string) => void;
  filterMethod: string;
  onMethodChange: (m: string) => void;
  filterKey: string;
  onKeyChange: (k: string) => void;
  availableKeys: { key: string; count: number }[];
  sortBy: string;
  onSortChange: (s: string) => void;
  pageSize: number;
  onPageSizeChange: (s: number) => void;
  viewMode: 'cards' | 'table' | 'families' | 'expressive_families';
  onViewModeChange: (m: 'cards' | 'table' | 'families' | 'expressive_families') => void;
  totalSamplesCount: number;
}

export const DatasetFilterBar: React.FC<DatasetFilterBarProps> = ({
  searchQuery, onSearchChange,
  filterGender, onGenderChange,
  filterVoice, onVoiceChange, availableVoices,
  filterLanguage, onLanguageChange, availableLanguages,
  filterDialect, onDialectChange,
  filterEmotion, onEmotionChange,
  filterMethod, onMethodChange,
  filterKey, onKeyChange, availableKeys,
  sortBy, onSortChange,
  pageSize, onPageSizeChange,
  viewMode, onViewModeChange,
  totalSamplesCount
}) => {
  return (
    <div className="filter-grid">
      {/* Search Box */}
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="input-control search-input"
          placeholder="Search Kurdish text, ID (e.g. 022), voice..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Gender Filter */}
      <div className="filter-select-group">
        <Users size={15} className="text-muted" />
        <select
          className="select-control filter-select"
          value={filterGender}
          onChange={(e) => onGenderChange(e.target.value as any)}
          title="Filter by Voice Gender"
        >
          <option value="all">All Genders</option>
          <option value="male">Male Voices Only</option>
          <option value="female">Female Voices Only</option>
        </select>
      </div>

      {/* Voice Filter */}
      <div className="filter-select-group">
        <Volume2 size={15} className="text-muted" />
        <select
          className="select-control filter-select"
          value={filterVoice}
          onChange={(e) => onVoiceChange(e.target.value)}
          title="Filter by Voice"
        >
          <option value="all">All Voices ({totalSamplesCount})</option>
          {availableVoices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.count})
            </option>
          ))}
        </select>
      </div>

      {/* Language Filter */}
      <div className="filter-select-group">
        <Languages size={15} className="text-muted" />
        <select
          className="select-control filter-select"
          value={filterLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          title="Filter by Target Language"
          id="filter-language-select"
        >
          <option value="all">All Languages ({totalSamplesCount})</option>
          {availableLanguages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label} ({l.count})
            </option>
          ))}
        </select>
      </div>

      {/* Dialect Filter */}
      <div className="filter-select-group">
        <Globe size={15} className="text-muted" />
        <select
          className="select-control filter-select"
          value={filterDialect}
          onChange={(e) => onDialectChange(e.target.value as any)}
          title="Filter by Kurdish Dialect"
        >
          <option value="all">All Dialects</option>
          <option value="sorani">Sorani (سۆرانی)</option>
          <option value="badini">Badini (بادینی)</option>
        </select>
      </div>

      {/* Emotion Filter */}
      <div className="filter-select-group">
        <Filter size={15} className="text-muted" />
        <select
          className="select-control filter-select"
          value={filterEmotion}
          onChange={(e) => onEmotionChange(e.target.value)}
        >
          <option value="all">All Emotions</option>
          <option value="neutral">Neutral</option>
          <option value="happy">Happy</option>
          <option value="sad">Sad</option>
          <option value="angry">Angry</option>
          <option value="fear">Fear</option>
          <option value="excited">Excited</option>
          <option value="whisper">Whisper</option>
          <option value="laughing">Laughing / Laugh / Cackle</option>
          <option value="crying">Crying / Cry</option>
          <option value="shouting">Shouting / Shout</option>
          <option value="sigh">Sigh</option>
          <option value="mixed">Mixed Pairs</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Method Filter */}
      <div className="filter-select-group">
        <select
          className="select-control filter-select"
          value={filterMethod}
          onChange={(e) => onMethodChange(e.target.value)}
        >
          <option value="all">All Methods</option>
          <option value="gemini_api">Gemini API</option>
          <option value="elevenlabs_api">ElevenLabs API</option>
          <option value="elevenlabs_web">Normal Web Workflow</option>
        </select>
      </div>

      {/* Key Filter */}
      {availableKeys.length > 0 && (
        <div className="filter-select-group">
          <Key size={15} className="text-muted" />
          <select
            className="select-control filter-select"
            value={filterKey}
            onChange={(e) => onKeyChange(e.target.value)}
            title="Filter by API Key"
          >
            <option value="all">All Keys ({totalSamplesCount})</option>
            {availableKeys.map((k) => (
              <option key={k.key} value={k.key}>
                Key: {k.key} ({k.count})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sort By */}
      <div className="filter-select-group">
        <ArrowUpDown size={15} className="text-muted" />
        <select
          className="select-control filter-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          title="Sort dataset items"
        >
          <option value="id_desc">ID: Newest First (999 → 001)</option>
          <option value="id_asc">ID: Oldest First (001 → 999)</option>
          <option value="newest">Created Date: Newest First</option>
          <option value="oldest">Created Date: Oldest First</option>
          <option value="rating_desc">Highest Rated First</option>
          <option value="duration_desc">Longest Duration First</option>
        </select>
      </div>

      {/* Page Size Selector */}
      <div className="filter-select-group">
        <span className="filter-label-text">Per page:</span>
        <select
          className="select-control filter-select-sm"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          title="Samples to display per page"
        >
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={48}>48</option>
          <option value={96}>96</option>
        </select>
      </div>

      {/* View Mode Toggle */}
      <div className="view-mode-toggle">
        <button
          className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
          onClick={() => onViewModeChange('cards')}
          title="Card Grid View"
        >
          Cards
        </button>
        <button
          className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => onViewModeChange('table')}
          title="Table List View"
        >
          Table
        </button>
        <button
          className={`view-btn ${viewMode === 'families' ? 'active' : ''}`}
          onClick={() => onViewModeChange('families')}
          title="Paired Emotion Families View (6 Basic Emotions)"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <Layers size={13} />
          <span>Families (6 Emos)</span>
        </button>
        <button
          className={`view-btn ${viewMode === 'expressive_families' ? 'active' : ''}`}
          onClick={() => onViewModeChange('expressive_families')}
          title="Audar Expressive & Mixed Families View (Matrix + Mixed)"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <Sparkles size={13} style={{ color: '#C084FC' }} />
          <span>Expressive Families</span>
        </button>
      </div>
    </div>
  );
};
