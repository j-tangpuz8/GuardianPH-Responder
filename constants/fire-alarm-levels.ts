export const FIRE_ALARM_LEVELS = {
  "FIRST ALARM": {
    subheading: "(2-3 Houses - 4 Fire Trucks)",
    color: "white",
  },
  "SECOND ALARM": {
    subheading: "(4-5 Houses - 8 Fire Trucks)",
    color: "white",
  },
  "THIRD ALARM": {
    subheading: "(6-7 Houses or High Rise Bldg - 12 Fire Trucks)",
    color: "white",
  },
  "FOURTH ALARM": {
    subheading: "(8-9 Houses or High Rise Bldg - 16 Fire Trucks)",
    color: "white",
  },
  "FIFTH ALARM": {
    subheading: "(10-11 Houses or High Rise Bldg - 20 Fire Trucks)",
    color: "white",
  },
  "TASK FORCE ALPHA": {
    subheading: "(12x12 Houses - 24 Fire Trucks)",
    color: "white",
  },
  "TASK FORCE BRAVO": {
    subheading: "(15x15 Houeses - 28 Fire Trucks)",
    color: "white",
  },
  "TASK FORCE CHARLIE": {
    subheading: "(Affecting Significant Part of Area - 32 Fire Trucks)",
    color: "white",
  },
  "TASK FORCE DELTA": {
    subheading: "(Affecting Significan Part of Area - 36 Fire Trucks)",
    color: "white",
  },
  "GENERAL ALARM": {
    subheading: "(Affecting Major Part of Area - 80 Fire Trucks)",
    color: "white",
  },
  "UNDER CONTROL": {
    subheading: "(Decreasing Fire Risk)",
    color: "yellow",
  },
  "FIRE OUT": {
    subheading: "(Fire has been neutralized)",
    color: "green",
  },
};

export const FIRE_ALARM_LEVELS_ARRAY = Object.entries(FIRE_ALARM_LEVELS).map(
  ([key, value]) => ({
    key,
    subheading: value.subheading,
    color: value.color,
  })
);
