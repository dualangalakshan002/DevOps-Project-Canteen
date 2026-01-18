import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import StaffDashboard from './components/StaffDashboard';
import { AuthContext, AuthProvider } from './context/AuthContext';

const AppRoutes = () => {
  const { isAuthenticated, role } = useContext(AuthContext);

  if (!isAuthenticated) return <Login />;

  if (role === 'student') return <StudentDashboard />;
  if (role === 'staff') return <StaffDashboard />;

  return <Login />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
