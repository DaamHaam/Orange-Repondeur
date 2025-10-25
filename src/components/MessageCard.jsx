import { useEffect, useMemo, useState } from 'react';
import { ICONS, KINES, MESSAGE_TYPES } from '../constants/index.jsx';
import { useAudioController } from '../hooks/useAudioController.js';
import {
  copyToClipboard,
  formatDate,
  getCardClassByKine,
  getKineStyle,
  getMessageTypeStyle,
} from '../utils/index.js';

const COPY_TIMEOUT = 1500;

const MessageCard = ({ message, onAssignKine, onUpdateType, onDelete }) => {
  const [selectedKine, setSelectedKine] = useState(message.prenom_kine || '');
  const [selectedType, setSelectedType] = useState(message.message_type || 'Autre');
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const audioController = useAudioController(message.audio_path);

  useEffect(() => {
    setSelectedKine(message.prenom_kine || '');
  }, [message.prenom_kine]);

  useEffect(() => {
    setSelectedType(message.message_type || 'Autre');
  }, [message.message_type]);

  const kineStyle = useMemo(() => getKineStyle(selectedKine), [selectedKine]);
  const messageTypeStyle = useMemo(
    () => getMessageTypeStyle(selectedType),
    [selectedType],
  );

  const cardClassName = useMemo(() => {
    const className = getCardClassByKine(selectedKine);
    return ['card', className, messageTypeStyle.className]
      .filter(Boolean)
      .join(' ');
  }, [selectedKine, messageTypeStyle.className]);

  const PlayIcon = ICONS.Play;
  const PauseIcon = ICONS.Pause;
  const StopIcon = ICONS.Stop;
  const DeleteIcon = ICONS.Delete;
  const CopyIcon = ICONS.Copy;
  const CopiedIcon = ICONS.Copied;
  const AudioUnavailableIcon = ICONS.AudioUnavailable;

  const transcriptHtml = useMemo(() => {
    if (!message.transcript) {
      return '<em>Pas de transcription.</em>';
    }
    return message.transcript.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }, [message.transcript]);

  const summaryText = useMemo(() => {
    let summary = message.phone || '';
    if (message.name) {
      summary += ` ${message.name}`;
    }
    summary += ` – ${message.resume || 'Pas de résumé.'}`;
    return summary.trim();
  }, [message.phone, message.name, message.resume]);

  const handleKineChange = async (event) => {
    const newValue = event.target.value;
    const previousValue = selectedKine;
    setSelectedKine(newValue);
    try {
      await onAssignKine(message.id, newValue);
    } catch (assignError) {
      alert(assignError.message);
      setSelectedKine(previousValue);
    }
  };

  const handleTypeChange = async (event) => {
    const newValue = event.target.value;
    const previousValue = selectedType;
    setSelectedType(newValue);
    try {
      await onUpdateType(message.id, newValue);
    } catch (updateError) {
      alert(updateError.message);
      setSelectedType(previousValue);
    }
  };

  const handleCopyPhone = async () => {
    try {
      await copyToClipboard(message.phone || '');
      setPhoneCopied(true);
      setTimeout(() => setPhoneCopied(false), COPY_TIMEOUT);
    } catch (copyError) {
      alert(copyError.message || 'Erreur lors de la copie.');
    }
  };

  const handleCopySummary = async () => {
    try {
      await copyToClipboard(summaryText);
      setSummaryCopied(true);
      setTimeout(() => setSummaryCopied(false), COPY_TIMEOUT);
    } catch (copyError) {
      alert(copyError.message || 'Erreur lors de la copie.');
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(message);
    } catch (deleteError) {
      alert(deleteError.message);
    }
  };

  const renderPlayPauseIcon = () => {
    if (!audioController.hasAudio || audioController.status === 'error') {
      return <AudioUnavailableIcon />;
    }
    if (audioController.status === 'playing') {
      return <PauseIcon />;
    }
    return <PlayIcon />;
  };

  return (
    <div className={cardClassName} data-id={message.id}>
      <div className="meta">
        <div className="meta-header">
          <div className="date">{formatDate(message.date)}</div>
        </div>
        <div className="meta-contact">
          <div className="phone">
            <span>{message.phone}</span>
            <button
              type="button"
              className="copy-icon"
              title="Copier numéro"
              onClick={handleCopyPhone}
            >
              {phoneCopied ? <CopiedIcon /> : <CopyIcon />}
              <span className="sr-only">Copier le numéro</span>
            </button>
          </div>
          {message.name ? <div className="name">{message.name}</div> : null}
          {message.email ? <div className="email">{message.email}</div> : null}
        </div>
        <div className="meta-controls">
          <label className="field">
            <select
              className={['select-kine', kineStyle.className].filter(Boolean).join(' ')}
              style={{ backgroundColor: kineStyle.backgroundColor }}
              value={selectedKine}
              onChange={handleKineChange}
              aria-label="Assignation du kiné"
            >
              <option value="">Kiné non assigné</option>
              {KINES.map((kine) => (
                <option key={kine} value={kine}>
                  {kine}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <select
              className={['select-type', messageTypeStyle.className].filter(Boolean).join(' ')}
              style={{ backgroundColor: messageTypeStyle.backgroundColor }}
              value={selectedType}
              onChange={handleTypeChange}
              aria-label="Type de rendez-vous"
            >
              {MESSAGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="main-content">
        <div
          className="transcript"
          dangerouslySetInnerHTML={{ __html: transcriptHtml }}
        />
        <div className="summary-line">
          <span className="text">{summaryText}</span>
          <button
            type="button"
            className="copy-icon"
            title="Copier infos + résumé"
            onClick={handleCopySummary}
          >
            {summaryCopied ? <CopiedIcon /> : <CopyIcon />}
            <span className="sr-only">Copier les informations et le résumé</span>
          </button>
        </div>
      </div>
      <div className="actions">
        <div className="audio-controls">
          <button
            type="button"
            onClick={audioController.playPause}
            title={
              audioController.hasAudio
                ? 'Lire / Pause'
                : 'Audio indisponible'
            }
            disabled={!audioController.hasAudio || audioController.status === 'error'}
          >
            {renderPlayPauseIcon()}
            <span className="sr-only">Contrôle audio principal</span>
          </button>
          <button
            type="button"
            onClick={audioController.stop}
            title="Arrêter"
            disabled={!audioController.hasAudio || audioController.status === 'error'}
          >
            <StopIcon />
            <span className="sr-only">Arrêter l’audio</span>
          </button>
        </div>
        <input
          type="range"
          className="progress-bar"
          min="0"
          max={audioController.duration || 0}
          step="0.01"
          value={audioController.progress}
          onChange={(event) => audioController.seek(Number(event.target.value))}
          disabled={!audioController.hasAudio || audioController.status === 'error'}
        />
        <button
          type="button"
          className="delete-btn"
          title="Supprimer message"
          onClick={handleDelete}
        >
          <DeleteIcon />
          <span className="sr-only">Supprimer le message</span>
        </button>
      </div>
    </div>
  );
};

export default MessageCard;
