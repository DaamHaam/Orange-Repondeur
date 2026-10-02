import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabaseClient.js';

let currentStopHandler = null;

export const useAudioController = (audioPath) => {
  const audioRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
    audio.currentTime = 0;
    if (currentStopHandler === stop) {
      currentStopHandler = null;
    }
    setStatus('idle');
    setProgress(0);
  }, []);

  const reset = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (currentStopHandler === stop) {
      currentStopHandler = null;
    }
    setStatus('idle');
    setProgress(0);
  }, [stop]);

  const ensureAudio = useCallback(async () => {
    if (!audioPath) {
      setError("Audio indisponible");
      setStatus('error');
      return null;
    }

    if (!audioRef.current) {
      const cleanedKey = audioPath.trim().replace(/^\/?audio-files\//, '');
      const { data, error: storageError } = supabase.storage
        .from('audio-files')
        .getPublicUrl(cleanedKey);

      if (storageError || !data?.publicUrl) {
        setError("Impossible de charger l'audio.");
        setStatus('error');
        return null;
      }

      const audio = new Audio(data.publicUrl);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 0);
      });

      audio.addEventListener('timeupdate', () => {
        setProgress(audio.currentTime || 0);
      });

      audio.addEventListener('ended', () => {
        setStatus('idle');
        setProgress(0);
        if (currentStopHandler === stop) {
          currentStopHandler = null;
        }
      });

      audio.addEventListener('pause', () => {
        if (audio.currentTime === 0 || audio.currentTime === audio.duration) {
          setStatus('idle');
        } else {
          setStatus('paused');
        }
      });

      audio.addEventListener('play', () => {
        setStatus('playing');
      });

      audio.addEventListener('error', () => {
        setError("Erreur de lecture audio.");
        setStatus('error');
      });
    }

    return audioRef.current;
  }, [audioPath, stop]);

  const playPause = useCallback(async () => {
    const audio = await ensureAudio();
    if (!audio) {
      return;
    }

    if (currentStopHandler && currentStopHandler !== stop) {
      currentStopHandler();
    }

    if (audio.paused) {
      try {
        await audio.play();
        currentStopHandler = stop;
        setStatus('playing');
      } catch (playError) {
        setError("Erreur de lecture audio.");
        setStatus('error');
      }
    } else {
      audio.pause();
      if (currentStopHandler === stop) {
        currentStopHandler = null;
      }
      setStatus('paused');
    }
  }, [ensureAudio, stop]);

  const seek = useCallback((value) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value;
      setProgress(value);
    }
  }, []);

  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (currentStopHandler === stop) {
      currentStopHandler = null;
    }
  }, [stop]);

  return {
    playPause,
    stop,
    seek,
    status,
    progress,
    duration,
    error,
    hasAudio: Boolean(audioPath),
    reset,
  };
};
