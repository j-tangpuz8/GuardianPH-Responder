const getEmergencyIcon = (type: string) => {
  switch (type) {
    case "Medical":
      return require("@/assets/images/AMBU.png");
    case "Police":
      return require("@/assets/images/Crime.png");
    case "Fire":
      return require("@/assets/images/Fire.png");
    case "General":
      return require("@/assets/images/Call.png");
    default:
      return require("@/assets/images/Call.png");
  }
};

const getIncidentTypeColor = (type: string) => {
  switch (type) {
    case "Medical":
      return "#3498db";
    case "Fire":
      return "#FF6B6B";
    case "Police":
      return "#4a4a4a";
    case "General":
      return "#2ecc71";
    default:
      return "#2ecc71";
  }
};

export default {
  getEmergencyIcon,
  getIncidentTypeColor,
};
