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

  return (
    <div id="filters">
      <div className="filters-left">
        <select id="filter-kine" value={filters.kine} onChange={handleKineChange}>
          <option value="">Tous les kinés</option>
          {KINES.map((kine) => (
            <option key={kine} value={kine}>
              {kine}
            </option>
          ))}
          <option value="Non assigné">Kiné non assigné</option>
        </select>
        <select id="filter-type" value={filters.type} onChange={handleTypeChange}>
          <option value="">Tous types</option>
          {MESSAGE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className={`mailbox-meter ${isAlert ? 'is-alert' : ''}`}>
        <div className="mailbox-meter-main">
          <span className="mailbox-meter-label">Répondeur Orange :</span>
          <span className="mailbox-meter-value">
            {count} / {capacity}
          </span>
          <span
            className="mailbox-meter-info"
            title="Videz d’abord la messagerie Orange, puis cliquez ici pour remettre le compteur à zéro dans l’application."
            aria-label="Information sur la remise à zéro du compteur Orange"
          >
            i
          </span>
        </div>
        {isAlert ? <p className="mailbox-meter-alert">Vider le répondeur Orange.</p> : null}
        <button type="button" onClick={onResetMailbox} disabled={isResettingMailbox}>
          {isResettingMailbox ? 'Remise à zéro…' : 'Répondeur Orange vidé'}
        </button>
        {resetStatus ? (
          <p className={`mailbox-meter-reset ${resetStatus.type}`}>{resetStatus.message}</p>
        ) : null}
        {mailboxError ? <p className="mailbox-meter-reset error">{mailboxError}</p> : null}
      </div>
    </div>
  );
};

export default FiltersBar;
