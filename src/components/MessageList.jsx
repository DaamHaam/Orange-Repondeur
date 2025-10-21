import MessageCard from './MessageCard.jsx';

export default function MessageList({
  messages,
  hasMessages,
  loading,
  error,
  onUpdate,
  onDelete,
  onRequestPlay,
  onStop,
  currentAudioId
}) {
  if (loading) {
    return <p className="status-message">Chargement des messages...</p>;
  }

  if (error) {
    return (
      <p className="status-message error">
        Erreur de chargement des messages : {error.message}
      </p>
    );
  }

  if (!messages.length) {
    return (
      <p className="status-message">
        {hasMessages ? 'Aucun message ne correspond à vos filtres.' : 'Aucun message pour le moment.'}
      </p>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onRequestPlay={onRequestPlay}
          onStop={onStop}
          isCurrent={currentAudioId === message.id}
        />
      ))}
    </div>
  );
}
