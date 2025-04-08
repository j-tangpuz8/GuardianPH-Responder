import {useState, useEffect} from "react";
import {useAuth} from "@/context/AuthContext";

interface UserInfo {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
}

export const useGetUserInfo = () => {
  const {authState} = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!authState?.user_id) {
        setLoading(false);
        setError("No user ID found");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/users/${authState.user_id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserInfo(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch user info"
        );
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [authState?.user_id]);

  return {userInfo, loading, error};
};
