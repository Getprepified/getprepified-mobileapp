import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../utils/apiClient";
import { Logger } from "../utils/logger";

const API_URL = apiClient.defaults.baseURL;

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  parentCode?: string;
  schoolId?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: User }>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      Logger.info("🔄 Loading stored authentication data");
      const storedToken = await AsyncStorage.getItem("userToken");
      const storedUser = await AsyncStorage.getItem("userData");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        Logger.info("✅ Stored authentication data loaded successfully");
      } else {
        Logger.info("ℹ️ No stored authentication data found");
      }
    } catch (error) {
      Logger.error("❌ Error loading stored authentication data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!token) {
      Logger.warn("⚠️ No token available for fetching user data");
      return;
    }

    try {
      Logger.info("🔄 Fetching user data from API");
      const startTime = Date.now();

      const response = await apiClient.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const duration = Date.now() - startTime;
      Logger.logResponse(
        "GET",
        `${API_URL}/users/me`,
        response.status,
        response.data,
        duration
      );

      setUser(response.data);
      await AsyncStorage.setItem("userData", JSON.stringify(response.data));
      Logger.info("✅ User data fetched and stored successfully");
    } catch (error: any) {
      Logger.logError("GET", `${API_URL}/users/me`, error);
      if (error.response?.status === 401) {
        Logger.warn("🔐 Token expired, logging out user");
        await logout();
      }
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User }> => {
    try {
      setIsLoading(true);
      Logger.info("🔄 Starting login process", { email });

      const startTime = Date.now();
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });

      const duration = Date.now() - startTime;
      Logger.logResponse(
        "POST",
        `${API_URL}/login`,
        response.status,
        response.data,
        duration
      );

      const { token: authToken, user: userData } = response.data;

      if (authToken && userData) {
        setToken(authToken);
        setUser(userData);

        // Store in AsyncStorage
        await AsyncStorage.setItem("userToken", authToken);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        Logger.info("✅ Login successful", {
          userId: userData._id,
          userRole: userData.role,
        });

        // Fetch fresh user data to ensure we have the latest information
        await fetchUserData();

        return { success: true, user: userData };
      } else {
        Logger.error("❌ Login response missing token or user data");
        return { success: false };
      }
    } catch (error: any) {
      Logger.logError("POST", `${API_URL}/login`, error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      Logger.info("🔄 Starting registration process", {
        email: userData.email,
        role: userData.role,
      });

      const startTime = Date.now();
      const response = await apiClient.post("/api/auth/register", userData);

      const duration = Date.now() - startTime;
      Logger.logResponse(
        "POST",
        `${API_URL}/register`,
        response.status,
        response.data,
        duration
      );

      const { token: authToken, user: newUser } = response.data;

      if (authToken && newUser) {
        setToken(authToken);
        setUser(newUser);

        // Store in AsyncStorage
        await AsyncStorage.setItem("userToken", authToken);
        await AsyncStorage.setItem("userData", JSON.stringify(newUser));

        Logger.info("✅ Registration successful", {
          userId: newUser._id,
          userRole: newUser.role,
        });

        // Fetch fresh user data to ensure we have the latest information
        await fetchUserData();

        return true;
      } else {
        Logger.error("❌ Registration response missing token or user data");
        return false;
      }
    } catch (error: any) {
      Logger.logError("POST", `${API_URL}/register`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      Logger.info("🔄 Logging out user");

      // Clear state first
      setUser(null);
      setToken(null);

      // Clear AsyncStorage
      await AsyncStorage.multiRemove(["userToken", "userData"]);

      Logger.info("✅ Logout successful");
    } catch (error) {
      Logger.error("❌ Error during logout", error);
      throw error; // Re-throw so the caller can handle it
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    fetchUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
