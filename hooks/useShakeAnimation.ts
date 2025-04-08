import {useRef, useEffect} from "react";
import {Animated, Easing} from "react-native";

export const useShakeAnimation = (isActive: boolean) => {
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const startShake = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    if (isActive) {
      startShake();
    } else {
      shakeAnimation.setValue(0);
    }
  }, [isActive]);

  const interpolatedTranslateX = shakeAnimation.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [1, -1, -3, 3, 1, -1, -3, 3, -1, 1, 1],
  });

  const interpolatedTranslateY = shakeAnimation.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [1, -2, 0, 2, -1, 2, 1, 1, -1, 2, -2],
  });

  const interpolatedRotate = shakeAnimation.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [
      "0deg",
      "-1deg",
      "1deg",
      "0deg",
      "1deg",
      "-1deg",
      "0deg",
      "-1deg",
      "1deg",
      "0deg",
      "-1deg",
    ],
  });

  return {
    transform: [
      {translateX: interpolatedTranslateX},
      {translateY: interpolatedTranslateY},
      {rotate: interpolatedRotate},
    ],
  };
};
