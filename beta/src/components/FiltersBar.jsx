import { KINES, MESSAGE_TYPES } from '../constants/index.jsx';

const FiltersBar = ({
  filters,
  onChange,
  mailboxMeter,
  mailboxError,
  resetStatus,
  onResetMailbox,
  isResettingMailbox,
}) => {
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
  const progress = Math.min(100, Math.round((count / Math.max(capacity, 1)) * 100));
  const activeFilterCount = Number(Boolean(filters.kine)) + Number(Boolean(filters.type));

  return (
    <section id="filters" aria-labelledby="filters-title">
      <div className="filters-heading">
        <div>
          <span className="section-kicker">File d’appels</span>
          <h1 id="filters-title">Messages à traiter</h1>
        </div>
        <span className={`filter-count ${activeFilterCount ? 'is-active' : ''}`}>
          {activeFilterCount ? `${activeFilterCount} filtre${activeFilterCount > 1 ? 's' : ''}` : 'Vue complète'}
        </span>
      </div>
      <div className="filters-toolbar">
        <div className="filters-left">
          <label>
            <span>Attribué à</span>
            <select id="filter-kine" value={filters.kine} onChange={handleKineChange}>
              <option value="">Tous les kinés</option>
              {KINES.map((kine) => (
                <option key={kine} value={kine}>
                  {kine}
                </option>
              ))}
              <option value="Non assigné">Kiné non assigné</option>
            </select>
          </label>
          <label>
            <span>Motif</span>
            <select id="filter-type" value={filters.type} onChange={handleTypeChange}>
              <option value="">Tous les motifs</option>
              {MESSAGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div
          className={`mailbox-meter ${isAlert ? 'is-alert' : ''}`}
          style={{ '--meter-progress': `${progress}%` }}
        >
          <div className="mailbox-meter-copy">
            <div className="mailbox-meter-main">
              <span className="mailbox-meter-label">Capacité Orange</span>
              <span className="mailbox-meter-value">
                {count}<small> / {capacity}</small>
              </span>
              <span
                className="mailbox-meter-info"
                aria-label="Information sur la remise à zéro du compteur Orange"
                tabIndex="0"
              >
                i
                <span className="mailbox-meter-tooltip" role="tooltip">
                  Videz d’abord la messagerie Orange, puis remettez ce compteur à zéro.
                </span>
              </span>
            </div>
            <div
              className="mailbox-meter-track"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax={capacity}
              aria-valuenow={count}
            >
              <span />
            </div>
            {isAlert ? <p className="mailbox-meter-alert">Le répondeur doit être vidé.</p> : null}
            {resetStatus ? (
              <p className={`mailbox-meter-reset ${resetStatus.type}`}>{resetStatus.message}</p>
            ) : null}
            {mailboxError ? <p className="mailbox-meter-reset error">{mailboxError}</p> : null}
          </div>
          <button type="button" onClick={onResetMailbox} disabled={isResettingMailbox}>
            {isResettingMailbox ? 'Remise à zéro…' : 'Marquer comme vidé'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default FiltersBar;
