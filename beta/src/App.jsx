import { useCallback, useMemo, useState } from 'react';
import Filters from './components/Filters.jsx';
import MessageList from './components/MessageList.jsx';
import { KINES, MESSAGE_TYPES } from './constants.js';
import useSupabaseMessages from './hooks/useSupabaseMessages.js';

export default function App() {
  const { messages, loading, error, updateMessage, deleteMessage } = useSupabaseMessages();
  const [kineFilter, setKineFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentAudioController, setCurrentAudioController] = useState(null);

  const handleRequestPlay = useCallback((id, pauseFn) => {
    setCurrentAudioController((previous) => {
      if (previous && previous.id !== id && typeof previous.pause === 'function') {
        previous.pause();
      }
      return { id, pause: pauseFn };
    });
  }, []);

  const handleStop = useCallback((id) => {
    setCurrentAudioController((previous) => {
      if (previous && previous.id === id) {
        return null;
      }
      return previous;
    });
  }, []);

  const filteredMessages = useMemo(() => {
    if (!messages.length) return [];
    return messages.filter((message) => {
      const kineMatches =
        !kineFilter ||
        (kineFilter === 'Non assigné' ? !message.prenom_kine : message.prenom_kine === kineFilter);
      const typeMatches = !typeFilter || message.message_type === typeFilter;
      return kineMatches && typeMatches;
    });
  }, [messages, kineFilter, typeFilter]);

  return (
    <div className="app">
      <Filters
        kineFilter={kineFilter}
        typeFilter={typeFilter}
        onKineChange={setKineFilter}
        onTypeChange={setTypeFilter}
        kines={KINES}
        messageTypes={MESSAGE_TYPES}
      />
      <MessageList
        messages={filteredMessages}
        hasMessages={messages.length > 0}
        loading={loading}
        error={error}
        onUpdate={updateMessage}
        onDelete={deleteMessage}
        onRequestPlay={handleRequestPlay}
        onStop={handleStop}
        currentAudioId={currentAudioController?.id ?? null}
      />
    </div>
  );
}
