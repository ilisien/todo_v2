import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic client-side validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // The server responded with an error (e.g., username taken)
        throw new Error(data.message || 'Failed to register. Please try again.');
      }

      // If registration is successful:
      setSuccess('Registration successful! Please log in.');

      // Automatically redirect to the login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000); // 2-second delay

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password (min. 8 characters)"
            required
            autoComplete="new-password"
          />
        </div>
        <button type="submit">Register</button>
      </form>
      
      {/* Display success or error messages */}
      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}

      <p className="redirect-link">
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}