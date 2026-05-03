import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Races from './pages/Races';
import Drivers from './pages/Drivers';
import Constructors from './pages/Constructors';
import Circuits from './pages/Circuits';
import Garage from './pages/Garage';
import Prediction from './pages/Prediction';

// ── Auth context ──────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/auth?action=me')
      .then(r => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await axios.post('/api/auth?action=login', { email, password });
    setUser(r.data.user);
    return r.data;
  };

  const register = async (username, email, password) => {
    const r = await axios.post('/api/auth?action=register', { username, email, password });
    setUser(r.data.user);
    return r.data;
  };

  const logout = async () => {
    await axios.post('/api/auth?action=logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Page wrapper with fade transition ────────────────────────────────────────
function PageWrapper({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-in">
      {children}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <PageWrapper>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/races"       element={<Races />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/constructors" element={<Constructors />} />
            <Route path="/circuits" element={<Circuits />} />
            <Route path="/garage" element={<Garage />} />
            <Route path="/prediction"  element={<Prediction />} />
          </Routes>
        </PageWrapper>
      </BrowserRouter>
    </AuthProvider>
  );
}
