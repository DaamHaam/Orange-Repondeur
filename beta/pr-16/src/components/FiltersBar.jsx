import { KINES, MESSAGE_TYPES } from '../constants/index.jsx';
import FilterSelect from './ui/FilterSelect.jsx';

const FiltersBar = ({ filters, onChange }) => {
  const handleKineChange = (event) => {
    onChange('kine', event.target.value);
  };

  const handleTypeChange = (event) => {
    onChange('type', event.target.value);
  };

  return (
    <div className="filter-toolbar" role="region" aria-label="Filtres des messages">
      <FilterSelect
        id="filter-kine"
        label="Kiné"
        description="Sélectionner une affectation"
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
      </FilterSelect>
      <FilterSelect
        id="filter-type"
        label="Type de message"
        description="Filtrer par catégorie"
        value={filters.type}
        onChange={handleTypeChange}
      >
        <option value="">Tous types</option>
        {MESSAGE_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </FilterSelect>
    </div>
  );
};

export default FiltersBar;
