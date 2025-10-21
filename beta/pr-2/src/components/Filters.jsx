export default function Filters({ kines, messageTypes, kineFilter, typeFilter, onKineChange, onTypeChange }) {
  return (
    <div className="filters">
      <select value={kineFilter} onChange={(event) => onKineChange(event.target.value)}>
        <option value="">Tous les kinés</option>
        {kines.map((kine) => (
          <option key={kine} value={kine}>
            {kine}
          </option>
        ))}
        <option value="Non assigné">Kiné non assigné</option>
      </select>
      <select value={typeFilter} onChange={(event) => onTypeChange(event.target.value)}>
        <option value="">Tous types</option>
        {messageTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}
