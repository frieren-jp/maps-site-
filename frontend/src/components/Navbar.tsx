import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
  background: rgba(248, 246, 242, 0.88);
  border-bottom: 1px solid var(--line);
`;

const Inner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const Brand = styled(NavLink)`
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--accent-strong);
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LinkItem = styled(NavLink)`
  padding: 8px 12px;
  border-radius: 999px;
  color: var(--text-secondary);
  transition: 0.2s ease;

  &:hover {
    background: var(--surface);
    color: var(--text);
  }

  &.active {
    background: var(--accent-soft);
    color: var(--accent-strong);
    font-weight: 700;
  }
`;

const UserBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--line);
`;

const LogoutButton = styled.button`
  border: none;
  background: var(--surface-muted);
  border-radius: 10px;
  padding: 6px 10px;
  cursor: pointer;
  color: var(--text-secondary);

  &:hover {
    color: var(--text);
  }
`;

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Header>
      <Inner>
        <Brand to="/">Route Finder</Brand>
        <Nav>
          <LinkItem to="/">Главная</LinkItem>
          <LinkItem to="/routes">Маршруты</LinkItem>
          {!user && <LinkItem to="/login">Вход</LinkItem>}
          {user && (
            <UserBadge>
              <span>{user.username}</span>
              <LogoutButton onClick={handleLogout}>Выйти</LogoutButton>
            </UserBadge>
          )}
        </Nav>
      </Inner>
    </Header>
  );
};
