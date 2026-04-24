import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';

const Wrap = styled.section`
  max-width: 560px;
  margin: 26px auto;
  padding: 0 18px;
`;

const Card = styled.div`
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 22px;
`;

const ToggleRow = styled.div`
  display: inline-flex;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 2px;
  margin-bottom: 14px;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  border: none;
  cursor: pointer;
  border-radius: 999px;
  padding: 8px 13px;
  background: ${({ $active }) => ($active ? 'var(--accent-soft)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--accent-strong)' : 'var(--text-secondary)')};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
`;

const Label = styled.label`
  display: grid;
  gap: 6px;
  color: var(--text-secondary);
  margin-bottom: 12px;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  background: var(--surface-muted);
`;

const Submit = styled.button`
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 11px 14px;
  background: var(--accent);
  color: white;
  font-weight: 700;
  cursor: pointer;
`;

type Mode = 'login' | 'register';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate('/routes');
    } catch (err) {
      setError((err as Error).message || 'Ошибка авторизации');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Wrap>
      <Card>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>{mode === 'login' ? 'Вход' : 'Регистрация'}</h1>
        <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
          Для быстрого теста без сервера: <b>admin / admin</b>
        </p>

        <ToggleRow>
          <ToggleButton type="button" $active={mode === 'login'} onClick={() => setMode('login')}>
            Вход
          </ToggleButton>
          <ToggleButton type="button" $active={mode === 'register'} onClick={() => setMode('register')}>
            Регистрация
          </ToggleButton>
        </ToggleRow>

        <form onSubmit={handleSubmit}>
          <Label>
            Логин
            <Input value={username} onChange={(event) => setUsername(event.target.value)} />
          </Label>
          <Label>
            Пароль
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </Label>

          {error && <div style={{ color: 'var(--danger)', marginBottom: 10 }}>{error}</div>}

          <Submit type="submit" disabled={busy}>
            {busy ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </Submit>
        </form>
      </Card>
    </Wrap>
  );
};
