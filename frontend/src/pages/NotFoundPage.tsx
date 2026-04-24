import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Wrap = styled.section`
  max-width: 760px;
  margin: 40px auto;
  padding: 0 18px;
`;

const Card = styled.div`
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 24px;
  background: var(--surface);
`;

const Back = styled(Link)`
  display: inline-flex;
  margin-top: 10px;
  color: var(--accent-strong);
  font-weight: 700;
`;

export const NotFoundPage = () => (
  <Wrap>
    <Card>
      <h1 style={{ marginTop: 0 }}>Страница не найдена</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Проверьте адрес или вернитесь в каталог маршрутов.</p>
      <Back to="/routes">Перейти к маршрутам</Back>
    </Card>
  </Wrap>
);
