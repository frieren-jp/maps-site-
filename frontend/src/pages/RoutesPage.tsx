import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Loader } from '../components/Loader';
import { RouteCard } from '../components/RouteCard';
import { RouteForm } from '../components/RouteForm';
import { useAuth } from '../hooks/useAuth';
import { useRoutes } from '../hooks/useRoutes';
import { routesApi } from '../services/api';

const Page = styled.section`
  max-width: 1180px;
  margin: 22px auto;
  padding: 0 18px 28px;
  display: grid;
  gap: 16px;
`;

const Controls = styled.div`
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface);
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 10px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--surface-muted);
`;

const Select = styled.select`
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--surface-muted);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1199px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`;

export const RoutesPage = () => {
  const { user, token } = useAuth();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { routes, loading, error, reload } = useRoutes(search, sort);

  const topRoutes = useMemo(() => routes.slice(0, 30), [routes]);

  const handleCreateRoute = async (payload: Parameters<typeof routesApi.createRoute>[0]) => {
    if (!token) {
      setFormError('Для публикации маршрута нужен вход в аккаунт.');
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await routesApi.createRoute(payload, token);
      await reload();
    } catch (err) {
      setFormError((err as Error).message || 'Ошибка публикации маршрута');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <header>
        <h1 style={{ marginBottom: 8 }}>Каталог маршрутов</h1>
        <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
          Ищите маршруты по миру, открывайте детали, комментируйте и ставьте оценки.
        </p>
      </header>

      {user ? (
        <RouteForm
          busy={busy}
          onUploadPhoto={(file) => routesApi.uploadPhoto(file, token || '')}
          onSubmit={handleCreateRoute}
        />
      ) : (
        <div style={{ color: 'var(--text-secondary)' }}>
          Войдите в аккаунт, чтобы публиковать маршруты, комментарии и оценки.
        </div>
      )}
      {formError && <div style={{ color: 'var(--danger)' }}>{formError}</div>}

      <Controls>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по названию или описанию"
        />
        <Select value={sort} onChange={(event) => setSort(event.target.value as 'newest' | 'oldest')}>
          <option value="newest">Сначала новые</option>
          <option value="oldest">Сначала старые</option>
        </Select>
      </Controls>

      {loading && <Loader />}
      {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}

      {!loading && topRoutes.length === 0 && <div>Маршруты не найдены.</div>}

      <Grid>
        {topRoutes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </Grid>
    </Page>
  );
};
