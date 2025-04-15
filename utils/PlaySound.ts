import {useEffect, useState} from "react";
import {Audio} from "expo-av";

export const useSound = (soundFile: any) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function playSound() {
    try {
      // Unload any existing sound first
      if (sound) {
        await sound.unloadAsync();
      }

      const {sound: newSound} = await Audio.Sound.createAsync(soundFile);
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  async function stopSound() {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      } catch (error) {
        console.error("Error stopping sound:", error);
      }
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return {playSound, stopSound};
};
