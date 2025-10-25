const AppShell = ({ version, children }) => (
  <div className="app-shell">
    <div className="app-shell__version" aria-label={`Version de l'application : v${version}`}>
      v{version}
    </div>
    {children}
  </div>
);

export default AppShell;
