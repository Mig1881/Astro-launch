import { createContext, useReducer, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { getToken, meRequest } from '../auth/authApi';
import type { User } from '../types';

// 1. Añadimos 'user' a nuestro estado
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
}

// 2. Añadimos la acción 'SET_USER'
type AuthAction =
  | { type: 'LOGIN'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User };

const initialState: AuthState = {
  token: getToken(),
  isAuthenticated: !!getToken(),
  user: null, // Arranca vacío hasta que la API nos responda
};

interface AuthContextProps {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, token: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, token: null, user: null, isAuthenticated: false };
    case 'SET_USER':
      return { ...state, user: action.payload }; // Guardamos el usuario
    default:
      return state;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 3. El Efecto Secundario ahora maneja localStorage y pide los datos del usuario
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
      
      // Pedimos los datos del usuario a la API silenciosamente
      meRequest(state.token)
        .then((userData) => {
          dispatch({ type: 'SET_USER', payload: userData });
        })
        .catch(() => {
          // Si el token caducó o es inválido, forzamos un logout de seguridad
          dispatch({ type: 'LOGOUT' }); 
        });
    } else {
      localStorage.removeItem('token');
    }
  }, [state.token]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};