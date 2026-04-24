import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Loader } from '../components/Loader';
import { MapView } from '../components/MapView';
import { useAuth } from '../hooks/useAuth';
import { routesApi } from '../services/api';
import type { RouteDetails } from '../types';

const Page = styled.section`
  max-width: 1180px;
  margin: 22px auto;
  padding: 0 18px 28px;
  display: grid;
  gap: 16px;
`;

const Card = styled.article`
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 16px;
`;

const PointList = styled.ol`
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 7px;
  color: var(--text-secondary);
`;

const CommentList = styled.div`
  display: grid;
  gap: 8px;
`;

const CommentCard = styled.div`
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-muted);
  padding: 10px;
`;

const Textarea = styled.textarea`
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  background: var(--surface-muted);
  min-height: 84px;
  resize: vertical;
`;

const Button = styled.button`
  border: none;
  border-radius: 10px;
  padding: 9px 12px;
  cursor: pointer;
  background: var(--accent);
  color: white;
  font-weight: 700;
`;

const StarRow = styled.div`
  display: flex;
  gap: 6px;
  margin: 10px 0;
`;

const StarButton = styled.button<{ active: boolean }>`
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 6px 10px;
  cursor: pointer;
  background: ${({ active }) => (active ? 'var(--accent-soft)' : 'var(--surface-muted)')};
  color: ${({ active }) => (active ? 'var(--accent-strong)' : 'var(--text-secondary)')};
`;

const formatDate = (iso: string) => new Date(iso).toLocaleString('ru-RU');

export const RouteDetailPage = () => {
  const { id = '' } = useParams();
  const { token, user } = useAuth();
  const [route, setRoute] = useState<RouteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);
  const [busy, setBusy] = useState(false);

  const loadRoute = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await routesApi.getRouteById(id);
      setRoute(data);
    } catch (err) {
      setError((err as Error).message || 'Не удалось загрузить маршрут');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoute();
  }, [id]);

  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !route) {
      setError('Нужен вход для комментариев');
      return;
    }

    setBusy(true);
    try {
      await routesApi.addComment(route.id, comment, token);
      setComment('');
      await loadRoute();
    } catch (err) {
      setError((err as Error).message || 'Ошибка отправки комментария');
    } finally {
      setBusy(false);
    }
  };

  const submitRating = async () => {
    if (!token || !route) {
      setError('Нужен вход для оценки маршрутов');
      return;
    }
    setBusy(true);
    try {
      await routesApi.rateRoute(route.id, selectedRating, token);
      await loadRoute();
    } catch (err) {
      setError((err as Error).message || 'Ошибка отправки оценки');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <Loader />
      </Page>
    );
  }

  if (error || !route) {
    return (
      <Page>
        <div style={{ color: 'var(--danger)' }}>{error || 'Маршрут не найден'}</div>
      </Page>
    );
  }

  return (
    <Page>
      <Card>
        <h1 style={{ marginTop: 0 }}>{route.title}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{route.description}</p>
        <div style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
          Рейтинг: {route.stats.ratingAverage.toFixed(1)} ({route.stats.ratingCount}) • Комментарии:{' '}
          {route.stats.commentsCount}
        </div>
        <MapView points={route.points} />
      </Card>

      <Card>
        <h2 style={{ marginTop: 0 }}>Точки маршрута</h2>
        <PointList>
          {route.points.map((point, index) => (
            <li key={`${point.lat}-${point.lng}-${index}`}>
              {point.name || `Точка ${index + 1}`} — {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
            </li>
          ))}
        </PointList>
      </Card>

      <Card>
        <h2 style={{ marginTop: 0 }}>Оценки и комментарии</h2>

        {user ? (
          <>
            <div style={{ color: 'var(--text-secondary)' }}>Ваша оценка</div>
            <StarRow>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarButton key={star} active={star <= selectedRating} onClick={() => setSelectedRating(star)}>
                  {star}
                </StarButton>
              ))}
              <Button type="button" onClick={submitRating} disabled={busy}>
                Отправить оценку
              </Button>
            </StarRow>

            <form onSubmit={submitComment}>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Напишите комментарий"
              />
              <div style={{ marginTop: 8 }}>
                <Button type="submit" disabled={busy || comment.trim().length < 2}>
                  Добавить комментарий
                </Button>
              </div>
            </form>
          </>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Войдите в аккаунт, чтобы оценивать и комментировать.</p>
        )}

        <CommentList>
          {route.comments.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>Комментариев пока нет.</div>}
          {route.comments.map((item) => (
            <CommentCard key={item.id}>
              <div style={{ fontWeight: 700 }}>{item.username}</div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{formatDate(item.createdAt)}</div>
              <div>{item.comment}</div>
            </CommentCard>
          ))}
        </CommentList>
      </Card>
    </Page>
  );
};
