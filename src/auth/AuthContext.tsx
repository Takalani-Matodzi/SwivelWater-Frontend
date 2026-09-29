import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  employeeRole?: string;
  employeeNumber?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token"),
  );

  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("authUser");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "authUser",
        JSON.stringify(user),
      );

      localStorage.setItem("userId", user.userId);
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role);

      if (user.employeeRole) {
        localStorage.setItem(
          "employeeRole",
          user.employeeRole,
        );
      } else {
        localStorage.removeItem("employeeRole");
      }

      if (user.employeeNumber) {
        localStorage.setItem(
          "employeeNumber",
          user.employeeNumber,
        );
      } else {
        localStorage.removeItem("employeeNumber");
      }
    } else {
      localStorage.removeItem("authUser");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("employeeRole");
      localStorage.removeItem("employeeNumber");
    }
  }, [user]);

  function login(
    newToken: string,
    newUser: AuthUser,
  ) {
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}