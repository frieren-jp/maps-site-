import { Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { Navbar } from './components/Navbar';
import { useAuth } from './hooks/useAuth';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteDetailPage } from './pages/RouteDetailPage';
import { RoutesPage } from './pages/RoutesPage';

const AppShell = styled.div`
  min-height: 100vh;
`;

const PageMain = styled.main`
  min-height: calc(100vh - 64px);
`;

const ProtectedLoginPage = () => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/routes" replace />;
  }
  return <LoginPage />;
};

export default function App() {
  return (
    <AppShell>
      <Navbar />
      <PageMain>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<ProtectedLoginPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/routes/:id" element={<RouteDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageMain>
    </AppShell>
  );
}
