import { createContext, useState, useEffect } from "react";
interface AuthContextType{

    user: any;
    loading:boolean;
    login:(userData: any )=>void;
    logout:()=>void;

}
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in by looking for token/user in localStorage
    const storedUser = localStorage.getItem("user");
    
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
   
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
