import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { RouteItem } from '../types';

const Card = styled.article`
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow);
  overflow: hidden;
`;

const Cover = styled.div<{ image?: string }>`
  height: 170px;
  background: ${({ image }) =>
    image
      ? `linear-gradient(rgba(44, 41, 35, 0.3), rgba(44, 41, 35, 0.3)), url("${image}") center/cover`
      : 'linear-gradient(125deg, #d9e8de 0%, #efe5d8 60%, #f5efe5 100%)'};
`;

const Body = styled.div`
  padding: 16px;
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 1.05rem;
`;

const Desc = styled.p`
  margin: 0 0 12px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const OpenLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-soft);
  color: var(--accent-strong);
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 700;
`;

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU');

export const RouteCard = ({ route }: { route: RouteItem }) => (
  <Card>
    <Cover image={route.photos[0]} />
    <Body>
      <Title>{route.title}</Title>
      <Desc>{route.description || 'Описание пока не добавлено.'}</Desc>
      <Stats>
        <span>★ {route.stats.ratingAverage.toFixed(1)}</span>
        <span>💬 {route.stats.commentsCount}</span>
        <span>{formatDate(route.createdAt)}</span>
      </Stats>
      <OpenLink to={`/routes/${route.id}`}>Открыть маршрут</OpenLink>
    </Body>
  </Card>
);
