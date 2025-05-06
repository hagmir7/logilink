import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../utils/api";



const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(false)

  const navigate = useNavigate();

  const login = async (userData) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await api.post('login', userData);

      const { access_token, user } = response.data;

      localStorage.setItem('authToken', access_token);

      localStorage.setItem('user', JSON.stringify(user));

      if (window.electron) {
        await window.electron.login(response.data);
      } else {
        return navigate('/');
      }

    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message)
      setMessage("Nom d'utilisateur/e-mail ou mot de passe invalide.")
    } finally {
      setLoading(false)
    }
  }

  const register = () => {
    console.log("Register");
  }


  return (
    <AuthContext.Provider value={{ login, register, loading, message }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);