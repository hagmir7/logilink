import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {
    getUser();
    // roles(); 
  }, []);

  const login = async (userData) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("login", userData);
      const { access_token, user } = response.data;
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      const rolesResponse = await api.get("user/permissions");
      const rolesData = rolesResponse.data;
      localStorage.setItem("roles", JSON.stringify(rolesData));
      getUser()
  

      if (window.electron) {
        await window.electron.login(response.data);
      } else {
        if (rolesData.roles?.includes("admin")) {
          return navigate("/home");
        }
        return navigate("/");
      }

    } catch (error) {
      console.log(error);
      
      setMessage("Nom d'utilisateur/e-mail ou mot de passe invalide.");
    } finally {
      setLoading(false);
    }
  };

  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");

      if (!raw || raw === "undefined" || raw === "null") {
        setUser(null);
      } else {
        setUser(JSON.parse(raw));
      }

    } catch (e) {
      setUser(null);
    }

    setAuthLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    getUser();
    if (window.electron) {
      await window.electron.logout();
    } else {
      navigate('/login')
    }
  }


  const roles = (role) => {
    try {
      const rolesData = JSON.parse(localStorage.getItem("roles")) || {};
      const savedRoles = Array.isArray(rolesData.roles) ? rolesData.roles : [];

      const required = Array.isArray(role) ? role : [role];

      return required.some(r => savedRoles.includes(r));
    } catch {
      return false;
    }
  };



  const permissions = (permission) => {
    try {
      const rolesData = JSON.parse(localStorage.getItem("roles"));
      return rolesData?.permissions?.includes(permission);
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ login, loading, message, user, authLoading, roles, permissions, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
