import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Hero = styled.section`
  max-width: 1180px;
  margin: 28px auto;
  padding: 18px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 18px;

  @media (max-width: 991px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  border-radius: 24px;
  border: 1px solid var(--line);
  background: linear-gradient(145deg, #ffffff 0%, #f6f2ea 100%);
  box-shadow: var(--shadow);
  padding: 26px;
`;

const Title = styled.h1`
  margin-top: 0;
  margin-bottom: 10px;
  font-size: clamp(1.6rem, 2vw, 2.4rem);
`;

const Subtitle = styled.p`
  margin: 0 0 16px;
  color: var(--text-secondary);
  max-width: 56ch;
`;

const Button = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 700;
  background: var(--accent);
  color: white;
`;

const List = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: var(--text-secondary);
  display: grid;
  gap: 8px;
`;

export const HomePage = () => (
  <Hero>
    <Panel>
      <Title>Планируйте и публикуйте маршруты по всему миру</Title>
      <Subtitle>
        Создавайте сложные маршруты с несколькими точками, добавляйте фото, делитесь в общем каталоге и сразу
        смотрите путь на OpenStreetMap.
      </Subtitle>
      <Button to="/routes">Перейти к маршрутам</Button>
    </Panel>
    <Panel>
      <h2 style={{ marginTop: 0 }}>Что уже доступно</h2>
      <List>
        <li>Авторизация и регистрация + быстрый вход admin/admin</li>
        <li>Каталог маршрутов с поиском и сортировкой</li>
        <li>Страница деталей: карта, рейтинг и комментарии</li>
        <li>Добавление сложных маршрутов из точки A в B через промежуточные точки</li>
        <li>Загрузка фотографий маршрутов</li>
      </List>
    </Panel>
  </Hero>
);
