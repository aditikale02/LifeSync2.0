import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MeditationSound } from "@/lib/meditation-sounds";

type UseMeditationSessionOptions = {
  sounds: MeditationSound[];
  defaultSoundId?: string;
  onSessionComplete?: () => void;
};

export function useMeditationSession({
  sounds,
  defaultSoundId,
  onSessionComplete,
}: UseMeditationSessionOptions) {
  const [selectedSoundId, setSelectedSoundId] = useState(defaultSoundId ?? sounds[0]?.id ?? "");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  const selectedSound = useMemo(
    () => sounds.find((sound) => sound.id === selectedSoundId) ?? sounds[0] ?? null,
    [selectedSoundId, sounds],
  );

  const stopAudio = useCallback(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
  }, []);

  const clearSessionInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const playSelectedSound = useCallback(async () => {
    if (!selectedSound) {
      return;
    }

    stopAudio();

    const audio = new Audio(selectedSound.src);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.7;
    audioRef.current = audio;

    try {
      await audio.play();
    } catch {
      audioRef.current = null;
    }
  }, [selectedSound, stopAudio]);

  const stopSession = useCallback(() => {
    clearSessionInterval();
    stopAudio();
    setIsSessionActive(false);
    setRemainingSeconds(0);
  }, [clearSessionInterval, stopAudio]);

  const startSession = useCallback(
    async (durationMinutes: number) => {
      clearSessionInterval();
      setRemainingSeconds(durationMinutes * 60);
      setIsSessionActive(true);
      await playSelectedSound();
    },
    [clearSessionInterval, playSelectedSound],
  );

  const toggleSession = useCallback(
    async (durationMinutes: number) => {
      if (isSessionActive) {
        stopSession();
        return;
      }

      await startSession(durationMinutes);
    },
    [isSessionActive, startSession, stopSession],
  );

  const selectSound = useCallback(
    async (soundId: string) => {
      setSelectedSoundId(soundId);

      if (isSessionActive) {
        const sound = sounds.find((item) => item.id === soundId);

        if (!sound) {
          stopAudio();
          return;
        }

        stopAudio();

        const audio = new Audio(sound.src);
        audio.loop = true;
        audio.preload = "auto";
        audio.volume = 0.7;
        audioRef.current = audio;

        try {
          await audio.play();
        } catch {
          audioRef.current = null;
        }
      }
    },
    [isSessionActive, sounds, stopAudio],
  );

  useEffect(() => {
    if (!isSessionActive) {
      clearSessionInterval();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => {
      clearSessionInterval();
    };
  }, [clearSessionInterval, isSessionActive]);

  useEffect(() => {
    if (!isSessionActive || remainingSeconds > 0) {
      return;
    }

    stopAudio();
    clearSessionInterval();
    setIsSessionActive(false);
    onSessionComplete?.();
  }, [clearSessionInterval, isSessionActive, onSessionComplete, remainingSeconds, stopAudio]);

  useEffect(() => {
    return () => {
      clearSessionInterval();
      stopAudio();
    };
  }, [clearSessionInterval, stopAudio]);

  const formattedRemainingTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingSeconds]);

  return {
    formattedRemainingTime,
    isSessionActive,
    remainingSeconds,
    selectedSound,
    selectedSoundId,
    selectSound,
    startSession,
    stopSession,
    toggleSession,
  };
}