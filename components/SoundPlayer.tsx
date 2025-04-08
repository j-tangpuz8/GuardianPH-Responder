import React, {useEffect, useState} from "react";
import {Audio} from "expo-av";
import {useCheckIn} from "@/context/CheckInContext";
import {Platform} from "react-native";

interface SoundPlayerProps {
  soundType: string;
  play: boolean;
}

const SoundPlayer: React.FC<SoundPlayerProps> = ({soundType, play}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const {isOnline} = useCheckIn();

  useEffect(() => {
    let isMounted = true;

    const loadAndPlaySound = async () => {
      // First, handle cleanup if needed
      if (!play || !isOnline) {
        if (sound) {
          try {
            await sound.stopAsync();
            await sound.unloadAsync();
            if (isMounted) setSound(null);
          } catch (error) {
            console.error("Error stopping sound:", error);
          }
        }
        return;
      }

      try {
        // Set audio mode first - this is important
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false, // Use speaker
        });

        // Clean up existing sound
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          if (isMounted) setSound(null);
        }

        // Determine which sound file to use
        let soundAsset;
        console.log("Loading sound for type:", soundType); // Debug log
        switch (soundType?.toLowerCase()) { // Add lowercase and null check
          case "medical":
            soundAsset = require("@/assets/sounds/ambulance.mp3");
            break;
          case "fire":
            soundAsset = require("@/assets/sounds/fire.mp3");
            break;
          case "police":
            soundAsset = require("@/assets/sounds/police.mp3");
            break;
          default:
            console.log("Using default sound for type:", soundType);
            soundAsset = require("@/assets/sounds/general.mp3");
        }

        // Create and play the sound
        console.log("Creating sound...");
        const {sound: newSound} = await Audio.Sound.createAsync(
          soundAsset,
          { isLooping: true, volume: 1.0 }
        );
        
        console.log("Sound created, playing...");
        if (isMounted) {
          setSound(newSound);
          await newSound.playAsync();
          console.log("Sound playing");
        } else {
          await newSound.unloadAsync();
        }
      } catch (error) {
        console.error("Error loading or playing sound:", error);
      }
    };

    // Use setTimeout to ensure we're on the main thread
    setTimeout(loadAndPlaySound, 0);

    return () => {
      isMounted = false;
      if (sound) {
        sound
          .stopAsync()
          .then(() => sound.unloadAsync())
          .catch((error) =>
            console.error("Error cleaning up sound on unmount:", error)
          );
      }
    };
  }, [soundType, play, isOnline, sound]);

  return null;
};

export default SoundPlayer;
