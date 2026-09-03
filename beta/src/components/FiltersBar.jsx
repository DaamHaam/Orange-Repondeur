import { useState } from 'react';
import { KINES, MESSAGE_TYPES } from '../constants/index.jsx';

const FiltersBar = ({
  filters,
  onChange,
  mailboxMeter,
  mailboxError,
  resetStatus,
  onResetMailbox,
  isResettingMailbox,
  isSettingsOpen,
  onToggleSettings,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleKineChange = (event) => {
    onChange('kine', event.target.value);
  };

  const handleTypeChange = (event) => {
    onChange('type', event.target.value);
  };

  const count = mailboxMeter?.count ?? 0;
  const capacity = mailboxMeter?.capacity ?? 50;
  const threshold = mailboxMeter?.threshold ?? 40;
  const isAlert = count >= threshold;
  const activeFilterCount = Number(Boolean(filters.kine)) + Number(Boolean(filters.type));
  const feedback = mailboxError
    ? { type: 'error', message: mailboxError }
    : resetStatus;

  return (
    <section id="filters" aria-label="Outils du répondeur">
      <div className="filters-toolbar">
        <button
          className="filters-toggle"
          type="button"
          aria-expanded={isFiltersOpen}
          aria-controls="filter-controls"
          onClick={() => setIsFiltersOpen((previous) => !previous)}
        >
          Filtres{activeFilterCount ? ` (${activeFilterCount})` : ''}
          <span aria-hidden="true">⌄</span>
        </button>
        <div
          className={`filters-left ${isFiltersOpen ? 'is-open' : ''}`}
          id="filter-controls"
        >
          <select
            id="filter-kine"
            aria-label="Filtrer par kiné"
            value={filters.kine}
            onChange={handleKineChange}
          >
            <option value="">Tous les kinés</option>
            {KINES.map((kine) => (
              <option key={kine} value={kine}>
                {kine}
              </option>
            ))}
            <option value="Non assigné">Kiné non assigné</option>
          </select>
          <select
            id="filter-type"
            aria-label="Filtrer par motif"
            value={filters.type}
            onChange={handleTypeChange}
          >
            <option value="">Tous les motifs</option>
            {MESSAGE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="mailbox-actions">
          <button
            className={`mailbox-reset-button ${isAlert ? 'is-alert' : ''}`}
            type="button"
            onClick={onResetMailbox}
            disabled={isResettingMailbox}
            title={`Répondeur : ${count} message${count !== 1 ? 's' : ''} sur ${capacity}`}
          >
            {isResettingMailbox ? 'Remise à zéro…' : 'Marquer comme vidé'}
          </button>
        </div>
        <button
          className="settings-button"
          type="button"
          aria-label="Ouvrir les réglages"
          aria-expanded={isSettingsOpen}
          aria-controls="settings-panel"
          onClick={onToggleSettings}
        >
          <span aria-hidden="true">⚙</span>
        </button>
      </div>
      {feedback ? (
        <p className={`toolbar-feedback ${feedback.type}`} role="status">
          {feedback.message}
        </p>
      ) : null}
    </section>
  );
};

export default FiltersBar;
