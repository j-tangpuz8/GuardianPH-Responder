import {useAuth} from "@/context/AuthContext";
import {useFetchResponder} from "@/api/users/useFetchResponder";

export const useAssignmentIcon = () => {
  const {authState} = useAuth();
  const {data: responderData} = useFetchResponder(authState?.user_id || "");

  switch (responderData?.assignment) {
    case "ambulance":
      return require("@/assets/images/AMBU.png");
    case "firetruck":
      return require("@/assets/images/Fire.png");
    case "police":
      return require("@/assets/images/Crime.png");
    default:
      return require("@/assets/images/AMBU.png");
  }
};
