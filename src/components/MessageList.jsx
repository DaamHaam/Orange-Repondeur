import MessageCard from './MessageCard.jsx';

const MessageList = ({
  messages,
  loading,
  error,
  hasMessages,
  onAssignKine,
  onUpdateType,
  onDelete,
}) => {
  if (loading) {
    return (
      <div id="list">
        <div className="list-state is-loading" role="status">
          <span className="state-pulse" aria-hidden="true" />
          <strong>Récupération des messages</strong>
          <p>La boîte vocale se synchronise…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="list">
        <div className="list-state is-error" role="alert">
          <strong>Impossible d’afficher les messages</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div id="list">
        <div className="list-state">
          <span className="empty-wave" aria-hidden="true">— · —</span>
          <strong>{hasMessages ? 'Aucun résultat' : 'La boîte est à jour'}</strong>
          <p>
          {hasMessages
              ? 'Modifiez les filtres pour retrouver les autres messages.'
              : 'Les prochains appels apparaîtront ici automatiquement.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="list">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          onAssignKine={onAssignKine}
          onUpdateType={onUpdateType}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default MessageList;
