import { useEffect, useMemo, useState } from 'react';
import FiltersBar from './components/FiltersBar.jsx';
import MessageList from './components/MessageList.jsx';
import { supabase } from './services/supabaseClient.js';

const defaultFilters = {
  kine: '',
  type: '',
};

const applyFilters = (messages, filters) =>
  messages.filter((message) => {
    const matchesKine =
      !filters.kine ||
      (filters.kine === 'Non assigné'
        ? !message.prenom_kine
        : message.prenom_kine === filters.kine);
    const matchesType = !filters.type || message.message_type === filters.type;
    return matchesKine && matchesType;
  });

const sortMessages = (messages) =>
  [...messages].sort((a, b) => new Date(b.date) - new Date(a.date));

const THEME_STORAGE_KEY = 'themePreference';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getStoredThemePreference = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'festif' || storedTheme === 'normal') {
      return storedTheme;
    }

    return null;
  };

  const isWithinFestivePeriod = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    return (
      (currentMonth === 11 && currentDay >= 24) || (currentMonth === 0 && currentDay <= 8)
    );
  };

  const getSeasonalTheme = () => (isWithinFestivePeriod() ? 'festif' : 'normal');

  const getInitialThemePreference = () => {
    const storedThemePreference = getStoredThemePreference();
    if (storedThemePreference === 'festif' && !isWithinFestivePeriod()) {
      return 'normal';
    }

    return storedThemePreference ?? getSeasonalTheme();
  };

  const [themePreference, setThemePreference] = useState(getInitialThemePreference);

  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const isFestiveThemeActive = themePreference === 'festif';

  useEffect(() => {
    const root = document.documentElement;
    if (isFestiveThemeActive) {
      root.setAttribute('data-theme', 'new-year');
    } else {
      root.removeAttribute('data-theme');
    }

    return () => {
      root.removeAttribute('data-theme');
    };
  }, [isFestiveThemeActive]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    }
  }, [themePreference]);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) {
        setError(`Erreur de chargement des messages: ${fetchError.message}`);
        setMessages([]);
      } else {
        setMessages(data || []);
      }

      setLoading(false);
    };

    fetchMessages();
  }, []);

  const filteredMessages = useMemo(
    () => sortMessages(applyFilters(messages, filters)),
    [messages, filters],
  );

  const handleFilterChange = (name, value) => {
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const handleAssignKine = async (id, newKine) => {
    const { error: updateError } = await supabase
      .from('messages')
      .update({ prenom_kine: newKine || null })
      .eq('id', id);

    if (updateError) {
      throw new Error(`Erreur mise à jour kiné: ${updateError.message}`);
    }

    setMessages((previous) =>
      previous.map((message) =>
        message.id === id ? { ...message, prenom_kine: newKine || null } : message,
      ),
    );
  };

  const handleUpdateType = async (id, newType) => {
    const { error: updateError } = await supabase
      .from('messages')
      .update({ message_type: newType })
      .eq('id', id);

    if (updateError) {
      throw new Error(`Erreur mise à jour type: ${updateError.message}`);
    }

    setMessages((previous) =>
      previous.map((message) =>
        message.id === id ? { ...message, message_type: newType } : message,
      ),
    );
  };

  const handleDelete = async (message) => {
    const { id, audio_path: audioPath } = message;
    const { error: dbError } = await supabase.from('messages').delete().eq('id', id);

    if (dbError) {
      throw new Error(
        `Échec de la suppression du message (ID: ${id}) de la base de données: ${dbError.message}`,
      );
    }

    if (audioPath) {
      const rawKey = audioPath.trim().replace(/^\/?audio-files\//, '');
      if (rawKey) {
        const { error: storageError } = await supabase.storage
          .from('audio-files')
          .remove([rawKey]);

        if (storageError) {
          throw new Error(
            `Le message est supprimé mais le fichier audio n'a pas pu être supprimé: ${storageError.message}`,
          );
        }
      }
    }

    setMessages((previous) => previous.filter((item) => item.id !== id));
  };

  return (
    <div className="app">
      <div className="version-badge">v0.13</div>
      <button
        className="settings-button"
        type="button"
        aria-label="Ouvrir les réglages"
        aria-expanded={isSettingsOpen}
        aria-controls="settings-panel"
        onClick={() => setIsSettingsOpen((previous) => !previous)}
      >
        ⚙️
      </button>
      {isSettingsOpen ? (
        <div className="settings-panel" id="settings-panel" role="dialog" aria-label="Réglages">
          <div className="settings-panel-header">
            <button
              type="button"
              className="settings-close-button"
              aria-label="Fermer les réglages"
              onClick={() => setIsSettingsOpen(false)}
            >
              ✕
            </button>
          </div>
          <label className="settings-field">
            <span>Thème</span>
            <select
              value={themePreference}
              onChange={(event) => setThemePreference(event.target.value)}
            >
              <option value="festif">Festif</option>
              <option value="normal">Normal</option>
            </select>
          </label>
        </div>
      ) : null}
      {isFestiveThemeActive ? (
        <div className="new-year-icons" aria-hidden="true">
          <span className="icon-right">🎈</span>
          <span className="icon-bottom">🥂</span>
        </div>
      ) : null}
      {isFestiveThemeActive ? (
        <div className="new-year-banner" role="status">
          Bonne année {year} 🥳🍾
        </div>
      ) : null}
      <FiltersBar filters={filters} onChange={handleFilterChange} />
      <MessageList
        messages={filteredMessages}
        loading={loading}
        error={error}
        hasMessages={messages.length > 0}
        onAssignKine={handleAssignKine}
        onUpdateType={handleUpdateType}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default App;
