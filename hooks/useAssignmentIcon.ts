import {useAuthStore} from "@/context";
import {useFetchResponder} from "@/api/users/useFetchResponder";

export const useAssignmentIcon = () => {
  const {user_id} = useAuthStore();
  const {data: responderData} = useFetchResponder(user_id || "");

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
