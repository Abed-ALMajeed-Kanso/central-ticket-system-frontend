import api from "../connectors/api";
import { ProfileData } from "../../types/profileData";


const login = async (email: string, password: string, rememberMe: boolean, 
  setUser: (user: ProfileData | null) => void) => {
    try {
    const res = await api.post(
      "/auth/login",
      { email, password, rememberMe }, 
      { withCredentials: true } 
    );

    if (res.status === 200) {
      const profile: ProfileData = res.data;
      setUser(profile);

      return { success: true, data: res.data };
    } else {
      return { success: false, message: "Invalid credentials" };
    }

    } catch (err: any) {
      return {
        success: false,
        message:
        err?.response?.data?.message || "Incorrect password or email.",
      };
    }
  };

const logout = async (setUser: (user: ProfileData | null) => void) => {
  try {
  const res = await api.post(
    "/auth/logout",
    {},
  );

  if (res.status === 200) {
    setUser(null);
    return { success: true, message: res.data || "Logged out successfully." };
  } else {
    return { success: false, message: "Logout failed" };
  }


  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "Logout failed. Please try again." };
  }
};

const checkAccessToken = async () => {
  try {
  const res = await api.get("/auth/verify");

  if (res.status === 200) {
    return { 
      success: true, 
      message: "Token is valid" 
    };
  } else {
    return { 
      success: false, 
      message: "Invalid token" 
    };
  }

  } catch (error: any) {
    return {
    success: false,
    message: error?.response?.data || "Invalid token",
    };
  }
}

const refreshAccessToken = async () => {

  try {
    const res = await api.post("/auth/refresh");

    if (res.status === 200) {
      return { 
        success: true, 
        message: "Access token refreshed" 
      };
    } else {
      return { 
        success: false, 
        message: "Unable to refresh token" 
      };
    }

  } catch (error: any) {
      return {
      success: false,
      message: error?.response?.data || "Unable to refresh token",
      };
  }
};

const updateProfile = async (
  data: Partial<ProfileData>,
  currentUser: ProfileData,
  setUser: (user: ProfileData | null) => void
) => {
  try {

    const { role, ...rest } = data;
    const payload = {
      ...rest
    };

    const res = await api.put(`/users`, payload);

    if (res.status === 200) {
      const updatedProfile: ProfileData = res.data;
      setUser(updatedProfile);
      return { success: true, data: updatedProfile };
    } else {
      return { success: false, message: "Update failed" };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "Update failed",
    };
  }
};

export { login, logout, updateProfile, checkAccessToken, refreshAccessToken };