import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KINE_COLORS, KINES, MESSAGE_TYPE_COLORS, MESSAGE_TYPES } from '../constants.js';
import { supabase } from '../supabaseClient.js';
import {
  AudioUnavailableIcon,
  CopyIcon,
  CopiedIcon,
  DeleteIcon,
  PauseIcon,
  PlayIcon,
  StopIcon
} from './icons.jsx';

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }
  const formattedDate = date.toLocaleDateString('fr-FR');
  const formattedTime = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${formattedDate} ${formattedTime}`;
}

function sanitize(value) {
  return value.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Erreur lors de la copie :', error);
      alert("Erreur lors de la copie.");
    }
  };

  return (
    <button className="icon-button" type="button" onClick={handleCopy} title={label}>
      {copied ? <CopiedIcon /> : <CopyIcon />}
      <span className="sr-only">{label}</span>
    </button>
  );
}

export default function MessageCard({ message, onUpdate, onDelete, onRequestPlay, onStop, isCurrent }) {
  const [kineValue, setKineValue] = useState(message.prenom_kine ?? '');
  const [typeValue, setTypeValue] = useState(message.message_type || 'Autre');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const audioHandlersRef = useRef(null);

  useEffect(() => {
    setKineValue(message.prenom_kine ?? '');
  }, [message.prenom_kine]);

  useEffect(() => {
    setTypeValue(message.message_type || 'Autre');
  }, [message.message_type]);

  useEffect(() => {
    if (!isCurrent && isPlaying) {
      pauseAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrent]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        const audioElement = audioRef.current;
        if (audioHandlersRef.current) {
          const { loadedmetadata, timeupdate, ended, error } = audioHandlersRef.current;
          audioElement.removeEventListener('loadedmetadata', loadedmetadata);
          audioElement.removeEventListener('timeupdate', timeupdate);
          audioElement.removeEventListener('ended', ended);
          audioElement.removeEventListener('error', error);
          audioHandlersRef.current = null;
        }
        audioElement.pause();
        audioElement.src = '';
        audioElement.load();
        audioRef.current = null;
      }
    };
  }, []);

  const kineColors = KINE_COLORS[kineValue || 'Non assigné'] || KINE_COLORS['Non assigné'];
  const typeColor = MESSAGE_TYPE_COLORS[typeValue] || MESSAGE_TYPE_COLORS.Autre;

  const transcriptHtml = useMemo(() => {
    return message.transcript
      ? message.transcript.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      : '<em>Pas de transcription.</em>';
  }, [message.transcript]);

  const summaryText = useMemo(() => {
    const parts = [message.phone];
    if (message.name) {
      parts.push(message.name);
    }
    parts.push(`– ${message.resume || 'Pas de résumé.'}`);
    return parts.join(' ');
  }, [message.phone, message.name, message.resume]);

  const ensureAudio = useCallback(async () => {
    if (audioRef.current) {
      return audioRef.current;
    }
    if (!message.audio_path) {
      setAudioError(true);
      return null;
    }
    setIsLoadingAudio(true);
    const audioKey = message.audio_path.trim().replace(/^\/?audio-files\//, '');
    const { data, error } = supabase.storage.from('audio-files').getPublicUrl(audioKey);
    if (error || !data?.publicUrl) {
      console.error('Erreur getPublicUrl :', error);
      alert('Impossible de charger l\'audio.');
      setAudioError(true);
      setIsLoadingAudio(false);
      return null;
    }
    const audio = new Audio(data.publicUrl);
    setAudioError(false);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      onStop(message.id);
    };
    const handleError = (event) => {
      console.error("Erreur de l'élément Audio :", event);
      setAudioError(true);
      setIsPlaying(false);
      setProgress(0);
      alert('Erreur de lecture audio.');
      onStop(message.id);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audioHandlersRef.current = {
      loadedmetadata: handleLoadedMetadata,
      timeupdate: handleTimeUpdate,
      ended: handleEnded,
      error: handleError
    };

    setIsLoadingAudio(false);
    return audio;
  }, [message.audio_path, message.id, onStop]);

  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
      setProgress(audio.currentTime);
    }
  }, []);

  const handlePlayPause = async () => {
    if (audioError || !message.audio_path) {
      return;
    }
    const audio = await ensureAudio();
    if (!audio) {
      return;
    }

    if (isPlaying) {
      pauseAudio();
      onStop(message.id);
      return;
    }

    onRequestPlay(message.id, pauseAudio);
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Erreur au play() :', error);
      alert('Erreur de lecture audio.');
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setProgress(0);
    setIsPlaying(false);
    onStop(message.id);
  };

  const handleSeek = (event) => {
    const value = Number(event.target.value);
    setProgress(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  const handleKineChange = async (event) => {
    const value = event.target.value;
    try {
      await onUpdate(message.id, { prenom_kine: value || null });
      setKineValue(value);
    } catch (updateError) {
      console.error('Erreur mise à jour kiné :', updateError);
      alert(`Erreur mise à jour kiné : ${updateError.message}`);
    }
  };

  const handleTypeChange = async (event) => {
    const value = event.target.value;
    try {
      await onUpdate(message.id, { message_type: value });
      setTypeValue(value);
    } catch (updateError) {
      console.error('Erreur mise à jour type :', updateError);
      alert(`Erreur mise à jour type : ${updateError.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      const { storageError } = await onDelete(message);
      if (storageError) {
        alert(
          `Le message a été supprimé de la base, mais une erreur est survenue lors de la suppression du fichier audio : ${storageError.message}`
        );
      }
    } catch (deleteError) {
      console.error('Erreur suppression message :', deleteError);
      alert(`Erreur lors de la suppression : ${deleteError.message}`);
    }
  };

  const cardClassName = useMemo(() => {
    const classes = ['card'];
    if (kineValue) {
      classes.push(`card-kine-${sanitize(kineValue)}`);
    }
    if (isCurrent) {
      classes.push('card-playing');
    }
    return classes.join(' ');
  }, [kineValue, isCurrent]);

  return (
    <div className={cardClassName} style={{ backgroundColor: kineColors.card }}>
      <div className="meta">
        <div className="date">{formatDate(message.date)}</div>
        <div className="phone">
          <span>{message.phone}</span>
          <CopyButton text={message.phone} label="Copier numéro" />
        </div>
        {message.name ? <div className="name">{message.name}</div> : null}
        {message.email ? <div className="email">{message.email}</div> : null}
        <select
          className={`select-kine ${kineValue ? `kine-${sanitize(kineValue)}` : ''}`}
          value={kineValue}
          onChange={handleKineChange}
          style={{ backgroundColor: kineColors.select }}
        >
          <option value="">Kiné non assigné</option>
          {KINES.map((kine) => (
            <option key={kine} value={kine}>
              {kine}
            </option>
          ))}
        </select>
        <select
          className={`select-type type-${sanitize(typeValue)}`}
          value={typeValue}
          onChange={handleTypeChange}
          style={{ backgroundColor: typeColor }}
        >
          {MESSAGE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="main-content">
        <div className="transcript" dangerouslySetInnerHTML={{ __html: transcriptHtml }} />
        <div className="summary-line">
          <span className="text">{summaryText}</span>
          <CopyButton text={summaryText} label="Copier infos + résumé" />
        </div>
      </div>
      <div className="actions">
        <div className="audio-controls">
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={!message.audio_path || audioError || isLoadingAudio}
            title={message.audio_path ? 'Lire/Pause' : 'Audio indisponible'}
          >
            {audioError || !message.audio_path ? <AudioUnavailableIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
            <span className="sr-only">{message.audio_path ? 'Lire ou mettre en pause' : 'Audio indisponible'}</span>
          </button>
          <button
            type="button"
            onClick={handleStop}
            disabled={!message.audio_path || audioError}
            title="Arrêter"
          >
            <StopIcon />
            <span className="sr-only">Arrêter</span>
          </button>
        </div>
        <input
          className="progress-bar"
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={progress}
          onChange={handleSeek}
          disabled={!message.audio_path || audioError || isLoadingAudio || !duration}
        />
        <button type="button" className="delete-btn" onClick={handleDelete} title="Supprimer message">
          <DeleteIcon />
          <span className="sr-only">Supprimer message</span>
        </button>
      </div>
    </div>
  );
}
