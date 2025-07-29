import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import TodoApp from './TodoApp.jsx';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage.jsx';
import { setLogout } from './axiosInstance.js';
import { useEffect } from 'react';
import PrefsButton from './PrefsButton.jsx';

function App() {
  const { token, logout } = useAuth();

  useEffect(() => {
    setLogout(logout);

  }, [logout]);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/preferences', {
        headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`},
      })
        .then((res) => res.json())
        .then((data) => {
          const root = document.documentElement;

          root.style.setProperty('--bkg-color', data.bkg_color || '#242424');
          root.style.setProperty('--but-color', data.but_color || '#242424');
          root.style.setProperty('--txt-color', data.txt_color || '#ffffff');
          root.style.setProperty('--lnk-color', data.lnk_color || '#646cff');
          root.style.setProperty('--wrn-color', data.wrn_color || '#000000');
          root.style.setProperty('--err-color', data.err_color || '#000000');
          root.style.setProperty('--scs-color', data.scs_color || '#000000');
        })
        .catch((err) => console.error('Failed to load preferences:', err));
    }
  }, [token]);

  return (
    <div className="app-container">
      {token && <button onClick={logout}>log out</button>}
      {token && <PrefsButton token={token} />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/" 
          element={
            token ? <TodoApp token={token} /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </div>
  );
}
export default App;