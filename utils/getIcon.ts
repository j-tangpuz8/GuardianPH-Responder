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

export default getEmergencyIcon;
