import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
`;

const Dot = styled.span`
  width: 18px;
  height: 18px;
  border: 3px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const Loader = ({ label = 'Загрузка...' }: { label?: string }) => (
  <Wrap>
    <Dot />
    <span>{label}</span>
  </Wrap>
);
