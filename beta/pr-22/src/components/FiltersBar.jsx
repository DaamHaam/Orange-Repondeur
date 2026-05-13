import { KINES, MESSAGE_TYPES } from '../constants/index.jsx';

const FiltersBar = ({ filters, onChange }) => {
  const handleKineChange = (event) => {
    onChange('kine', event.target.value);
  };

  const handleTypeChange = (event) => {
    onChange('type', event.target.value);
  };

  return (
    <div id="filters">
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
  );
};

export default FiltersBar;
