import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const res = await api.post('/auth/register', formData);
        login(res.data.token, res.data.role);
      } else {
        // For login, only send username/password so role isn't accidentally enforced
        const { username, password } = formData;
        const res = await api.post('/auth/login', { username, password });
        login(res.data.token, res.data.role);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Request failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-4">{isRegister ? 'Register' : 'Login'}</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border mb-4"
          required
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-4"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        {isRegister && (
          <select
            className="w-full p-2 border mb-4"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select>
        )}
        <button className="w-full bg-blue-500 text-white p-2 rounded mb-3">
          {isRegister ? 'Create account' : 'Login'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => { setIsRegister(prev => !prev); setError(''); }}
            className="text-sm text-blue-500 underline"
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
