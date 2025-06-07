import {useEffect, useState, useCallback, useRef} from "react";
import {Audio} from "expo-av";

export const useSound = (soundFile: any) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Initialize sound once when hook mounts or soundFile changes
  useEffect(() => {
    let isCancelled = false;

    const initializeSound = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (sound) {
          await sound.unloadAsync();
        }

        const {sound: newSound} = await Audio.Sound.createAsync(soundFile, {
          shouldPlay: false,
          isLooping: false,
        });

        if (!isCancelled && mountedRef.current) {
          setSound(newSound);

          newSound.setOnPlaybackStatusUpdate((status) => {
            if (mountedRef.current && status.isLoaded) {
              setIsPlaying(status.isPlaying || false);
            }
          });
        } else {
          await newSound.unloadAsync();
        }
      } catch (err) {
        if (!isCancelled && mountedRef.current) {
          setError(err instanceof Error ? err.message : "Failed to load sound");
          console.error("Error initializing sound:", err);
        }
      } finally {
        if (!isCancelled && mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initializeSound();

    return () => {
      isCancelled = true;
    };
  }, [soundFile]);

  const playSound = useCallback(async () => {
    if (!sound || isLoading) return;

    try {
      setError(null);
      await sound.replayAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to play sound");
      console.error("Error playing sound:", err);
    }
  }, [sound, isLoading]);

  const stopSound = useCallback(async () => {
    if (!sound) return;

    try {
      setError(null);
      await sound.stopAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop sound");
      console.error("Error stopping sound:", err);
    }
  }, [sound]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (sound) {
        sound.unloadAsync().catch((err) => {
          console.error("Error during cleanup:", err);
        });
      }
    };
  }, [sound]);

  return {
    playSound,
    stopSound,
    isLoading,
    isPlaying,
    error,
  };
};
