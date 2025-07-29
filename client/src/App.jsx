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