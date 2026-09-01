import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
const AUTHORIZED_EMAIL = 'kinecleunay@gmail.com';
const MESSAGE_REFRESH_INTERVAL = 30000;

const BrandMark = () => (
  <div className="brand-mark">
    <span className="brand-copy">
      <strong>Répondeur</strong>
      <span>Cabinet de kinésithérapie</span>
    </span>
  </div>
);

const hasMessageMetadataChanged = (currentMessages, refreshedMetadata) => {
  if (currentMessages.length !== refreshedMetadata.length) {
    return true;
  }

  const currentMessagesById = new Map(
    currentMessages.map((message) => [message.id, message]),
  );

  return refreshedMetadata.some((message) => {
    const currentMessage = currentMessagesById.get(message.id);
    return (
      !currentMessage ||
      currentMessage.prenom_kine !== message.prenom_kine ||
      currentMessage.message_type !== message.message_type
    );
  });
};

const App = () => {
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef([]);
  const [mailboxMeter, setMailboxMeter] = useState(null);
  const [mailboxError, setMailboxError] = useState(null);
  const [isResettingMailbox, setIsResettingMailbox] = useState(false);
  const [mailboxResetStatus, setMailboxResetStatus] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const userEmail = session?.user?.email;
  const isAuthorizedUser = userEmail?.trim().toLowerCase() === AUTHORIZED_EMAIL;

  const getStoredThemePreference = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (['festif', 'normal', 'ocean', 'coucher-soleil'].includes(storedTheme)) {
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
    const themeMap = {
      festif: 'new-year',
      ocean: 'ocean',
      'coucher-soleil': 'sunset',
    };

    const nextTheme = themeMap[themePreference];

    if (nextTheme) {
      root.setAttribute('data-theme', nextTheme);
    } else {
      root.removeAttribute('data-theme');
    }

    return () => {
      root.removeAttribute('data-theme');
    };
  }, [themePreference]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    }
  }, [themePreference]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);


  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setAuthError(`Erreur de récupération de session: ${sessionError.message}`);
        setSession(null);
      } else {
        setAuthError(null);
        setSession(data.session);
      }

      setAuthLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setAuthError(null);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchMessages = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setLoading(true);
      setError(null);
    }

    const { data, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .order('date', { ascending: false });

    if (fetchError) {
      if (showLoading) {
        setError(`Erreur de chargement des messages: ${fetchError.message}`);
        setMessages([]);
      }
    } else {
      setError(null);
      setMessages(data || []);
    }

    if (showLoading) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session || !isAuthorizedUser) {
      setMessages([]);
      setMailboxMeter(null);
      setMailboxError(null);
      setMailboxResetStatus(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchMailboxMeter = async () => {
      const { data, error: meterError } = await supabase
        .from('app_mailbox_meter')
        .select('mailbox_key, provider, capacity, threshold, count, last_reset, updated_at')
        .eq('mailbox_key', 'orange_voicemail')
        .maybeSingle();

      if (meterError) {
        setMailboxError(
          `Compteur Orange indisponible: ${meterError.message}. Vérifiez les policies RLS sur app_mailbox_meter.`,
        );
        setMailboxMeter(null);
      } else {
        setMailboxError(null);
        setMailboxMeter(data);
      }
    };

    fetchMessages();
    fetchMailboxMeter();
  }, [session, isAuthorizedUser, fetchMessages]);

  useEffect(() => {
    if (!session || !isAuthorizedUser || typeof window === 'undefined') {
      return undefined;
    }

    let isChecking = false;
    let isDisposed = false;

    const refreshMessagesIfChanged = async () => {
      if (
        isChecking ||
        isDisposed ||
        document.visibilityState !== 'visible'
      ) {
        return;
      }

      isChecking = true;

      try {
        const { data, error: metadataError } = await supabase
          .from('messages')
          .select('id, prenom_kine, message_type');

        if (
          !isDisposed &&
          !metadataError &&
          hasMessageMetadataChanged(messagesRef.current, data || [])
        ) {
          await fetchMessages({ showLoading: false });
        }
      } finally {
        isChecking = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshMessagesIfChanged();
      }
    };

    const intervalId = window.setInterval(
      refreshMessagesIfChanged,
      MESSAGE_REFRESH_INTERVAL,
    );

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refreshMessagesIfChanged);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refreshMessagesIfChanged);
    };
  }, [session, isAuthorizedUser, fetchMessages]);

  const refreshMailboxMeter = async () => {
    const { data, error: meterError } = await supabase
      .from('app_mailbox_meter')
      .select('mailbox_key, provider, capacity, threshold, count, last_reset, updated_at')
      .eq('mailbox_key', 'orange_voicemail')
      .maybeSingle();

    if (meterError) {
      setMailboxError(
        `Compteur Orange indisponible: ${meterError.message}. Vérifiez les policies RLS sur app_mailbox_meter.`,
      );
      return;
    }

    setMailboxError(null);
    setMailboxMeter(data);
  };

  const handleResetMailboxCounter = async () => {
    setIsResettingMailbox(true);
    setMailboxResetStatus(null);

    try {
      const response = await fetch(
        'https://n8n.srv801217.hstgr.cloud/webhook/reset-orange-counter',
        {
          method: 'POST',
        },
      );

      const payload = await response.json();

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message || 'Réponse invalide du webhook');
      }

      setMailboxResetStatus({ type: 'success', message: 'Remis à zéro.' });
      setMailboxMeter((previous) =>
        previous
          ? {
              ...previous,
              count: 0,
            }
          : previous,
      );
      await refreshMailboxMeter();
    } catch (resetError) {
      setMailboxResetStatus({
        type: 'error',
        message: 'Impossible de remettre le compteur à zéro. Réessayez.',
      });
    } finally {
      setIsResettingMailbox(false);
    }
  };

  const filteredMessages = useMemo(
    () => sortMessages(applyFilters(messages, filters)),
    [messages, filters],
  );

  const handleSignInWithGoogle = async () => {
    setIsSigningIn(true);
    setAuthError(null);

    const redirectTo = typeof window !== 'undefined' ? window.location.href : undefined;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (signInError) {
      setAuthError(`Erreur de connexion Google: ${signInError.message}`);
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setAuthError(null);

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setAuthError(`Erreur de déconnexion: ${signOutError.message}`);
    } else {
      setSession(null);
      setMessages([]);
      setMailboxMeter(null);
    }

    setIsSigningOut(false);
  };

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

    setMessages((previous) => previous.filter((item) => item.id !== id));

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
  };

  return (
    <div className="app">
      {session && isAuthorizedUser ? (
        <>
          <button
            className="settings-button"
            type="button"
            aria-label="Ouvrir les réglages"
            aria-expanded={isSettingsOpen}
            aria-controls="settings-panel"
            onClick={() => setIsSettingsOpen((previous) => !previous)}
          >
            <span aria-hidden="true">⚙</span>
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
              <div className="settings-account">
                <span className="settings-account-label">Compte connecté</span>
                <span className="settings-account-email">{userEmail || 'Compte Google'}</span>
                <button type="button" onClick={handleSignOut} disabled={isSigningOut}>
                  {isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}
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
                  <option value="ocean">Océan</option>
                  <option value="coucher-soleil">Coucher de soleil</option>
                </select>
              </label>
            </div>
          ) : null}
        </>
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
      {authLoading ? (
        <section className="auth-shell" aria-live="polite">
          <div className="auth-card auth-card-loading">
            <BrandMark />
            <p>Vérification de votre session…</p>
            <span className="loading-line" aria-hidden="true" />
          </div>
        </section>
      ) : !session ? (
        <section className="auth-shell" aria-labelledby="auth-title">
          <div className="auth-card">
            <BrandMark />
            <h1 id="auth-title">Connexion</h1>
            <button
              type="button"
              className="google-signin-button"
              onClick={handleSignInWithGoogle}
              disabled={isSigningIn}
            >
              <span className="google-mark" aria-hidden="true">G</span>
              {isSigningIn ? 'Redirection…' : 'Continuer avec Google'}
            </button>
            <span className="auth-access-note">Accès réservé à l’équipe du cabinet.</span>
            {authError ? <p className="auth-error">{authError}</p> : null}
            <span className="auth-version">v0.25</span>
          </div>
        </section>
      ) : !isAuthorizedUser ? (
        <section className="auth-shell" aria-labelledby="unauthorized-title">
          <div className="auth-card unauthorized-card">
            <BrandMark />
            <h1 id="unauthorized-title">Compte non autorisé</h1>
            <p>{userEmail || 'Le compte Google utilisé'} n’est pas autorisé à consulter les messages.</p>
            <button
              type="button"
              className="google-signin-button"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? 'Déconnexion…' : 'Changer de compte'}
            </button>
            {authError ? <p className="auth-error">{authError}</p> : null}
          </div>
        </section>
      ) : (
        <>
          <header className="app-header">
            <BrandMark />
            <div className="app-header-count" aria-live="polite">
              <strong>{filteredMessages.length}</strong>
              <span>{filteredMessages.length > 1 ? 'messages' : 'message'}</span>
            </div>
            <span className="app-version">v0.25</span>
          </header>
          <main className="workspace">
            <FiltersBar
              filters={filters}
              onChange={handleFilterChange}
              mailboxMeter={mailboxMeter}
              mailboxError={mailboxError}
              resetStatus={mailboxResetStatus}
              onResetMailbox={handleResetMailboxCounter}
              isResettingMailbox={isResettingMailbox}
            />
            <MessageList
              messages={filteredMessages}
              loading={loading}
              error={error}
              hasMessages={messages.length > 0}
              onAssignKine={handleAssignKine}
              onUpdateType={handleUpdateType}
              onDelete={handleDelete}
            />
          </main>
        </>
      )}
    </div>
  );
};

export default App;
