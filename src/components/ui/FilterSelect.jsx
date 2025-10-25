const FilterSelect = ({ id, label, description, children, ...props }) => (
  <label className="filter-select" htmlFor={id}>
    <span className="filter-select__label">
      <span className="filter-select__title">{label}</span>
      {description ? <span className="filter-select__description">{description}</span> : null}
    </span>
    <select id={id} {...props}>
      {children}
    </select>
  </label>
);

export default FilterSelect;
