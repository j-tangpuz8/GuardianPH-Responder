import {useEffect, useState, useCallback, useRef} from "react";
import {Audio} from "expo-av";

let audioModeConfigured = false;

const configureAudioMode = async () => {
  if (audioModeConfigured) {
    console.log("Audio mode already configured");
    return;
  }

  try {
    console.log("Configuring audio mode...");
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });
    audioModeConfigured = true;
    console.log("Audio mode configured successfully");
  } catch (error) {
    console.error("Failed to configure audio mode:", error);
    throw error;
  }
};

export const useSound = (soundFile: any) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const initializeSound = async () => {
      try {
        console.log("Starting sound initialization...", {soundFile});
        setIsLoading(true);
        setError(null);
        setIsReady(false);

        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }

        loadingTimeoutRef.current = setTimeout(() => {
          if (!isCancelled && mountedRef.current) {
            console.warn("Sound loading timeout after 10 seconds");
            setError("Sound loading timeout");
            setIsLoading(false);
          }
        }, 10000);

        await configureAudioMode();

        if (sound) {
          console.log("Unloading previous sound...");
          await sound.unloadAsync();
        }

        console.log("Creating new sound...");
        const {sound: newSound} = await Audio.Sound.createAsync(soundFile, {
          shouldPlay: false,
          isLooping: false,
          volume: 1.0,
        });

        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }

        if (!isCancelled && mountedRef.current) {
          console.log("Sound created successfully, setting up...");
          setSound(newSound);
          setIsReady(true);

          newSound.setOnPlaybackStatusUpdate((status) => {
            if (mountedRef.current && status.isLoaded) {
              setIsPlaying(status.isPlaying || false);
              if (status.isPlaying) {
                console.log("Sound is now playing");
              }
            }
          });

          console.log("Sound initialization complete and ready");
        } else {
          console.log("Component unmounted, cleaning up sound");
          await newSound.unloadAsync();
        }
      } catch (err) {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }

        if (!isCancelled && mountedRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load sound";
          console.error("Error initializing sound:", err);
          setError(errorMessage);
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
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [soundFile]);

  const playSound = useCallback(async () => {
    console.log("PlaySound called:", {
      hasSound: !!sound,
      isLoading,
      isReady,
      error,
    });

    if (!sound || isLoading || !isReady) {
      console.warn("Sound not ready:", {
        hasSound: !!sound,
        isLoading,
        isReady,
        error,
      });
      return;
    }

    try {
      setError(null);
      console.log("Attempting to play sound...");
      await sound.replayAsync();
      console.log("Sound played successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to play sound";
      setError(errorMessage);
      console.error("Error playing sound:", err);
    }
  }, [sound, isLoading, isReady]);

  const stopSound = useCallback(async () => {
    if (!sound) return;

    try {
      setError(null);
      console.log("Stopping sound...");
      await sound.stopAsync();
      console.log("Sound stopped successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to stop sound";
      setError(errorMessage);
      console.error("Error stopping sound:", err);
    }
  }, [sound]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
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
    isReady,
    error,
  };
};
