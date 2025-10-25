const PageHeader = ({ title, subtitle }) => (
  <header className="app-header">
    <div className="app-header__titles">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  </header>
);

export default PageHeader;
