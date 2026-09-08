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

  const handleFiltersToggle = () => {
    if (!isFiltersOpen && isSettingsOpen) {
      onToggleSettings();
    }
    setIsFiltersOpen((previous) => !previous);
  };

  const handleSettingsToggle = () => {
    setIsFiltersOpen(false);
    onToggleSettings();
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
          onClick={handleFiltersToggle}
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
        <div className={`mailbox-status ${isAlert ? 'is-alert' : ''}`} aria-live="polite">
          <span className="mailbox-label mailbox-label-full">Répondeur Orange :</span>
          <span className="mailbox-label mailbox-label-short">Orange</span>
          <strong>
            {count}<small> / {capacity}</small>
          </strong>
          <button
            className="mailbox-info-button"
            type="button"
            aria-label="Information sur le compteur du répondeur Orange"
            onClick={() => setIsFiltersOpen(false)}
          >
            i
            <span className="mailbox-info-tooltip" role="tooltip">
              Videz d’abord la messagerie Orange, puis marquez le répondeur comme vidé ici.
            </span>
          </button>
        </div>
        <div className="mailbox-actions">
          <button
            className={`mailbox-reset-button ${isAlert ? 'is-alert' : ''}`}
            type="button"
            onClick={onResetMailbox}
            disabled={isResettingMailbox}
            title={`Répondeur : ${count} message${count !== 1 ? 's' : ''} sur ${capacity}`}
          >
            {isResettingMailbox ? (
              'Remise à zéro…'
            ) : (
              <>
                <span className="reset-label-full">Marquer comme vidé</span>
                <span className="reset-label-short">Vidé</span>
              </>
            )}
          </button>
        </div>
        <button
          className="settings-button"
          type="button"
          aria-label="Ouvrir les réglages"
          aria-expanded={isSettingsOpen}
          aria-controls="settings-panel"
          onClick={handleSettingsToggle}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.09a2 2 0 0 1 1 1.74v.5a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
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
