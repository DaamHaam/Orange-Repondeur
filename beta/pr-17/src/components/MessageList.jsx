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
        <p>Chargement des messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div id="list">
        <p>{error}</p>
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div id="list">
        <p>
          {hasMessages
            ? 'Aucun message ne correspond à vos filtres.'
            : "Aucun message pour le moment."}
        </p>
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
