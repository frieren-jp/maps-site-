import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --bg: #f8f6f2;
    --bg-soft: #f1ede6;
    --surface: #ffffff;
    --surface-muted: #faf8f4;
    --line: #e0d9ce;
    --text: #2e2a25;
    --text-secondary: #70675d;
    --accent: #86a58d;
    --accent-strong: #6f9478;
    --accent-soft: #e3efe6;
    --danger: #a05050;
    --radius-lg: 20px;
    --radius-md: 14px;
    --shadow: 0 12px 26px rgba(87, 75, 59, 0.09);
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    margin: 0;
    min-height: 100%;
  }

  body {
    font-family: "Manrope", "Segoe UI", sans-serif;
    color: var(--text);
    background:
      radial-gradient(circle at 0% 0%, #f0e9dd 0%, transparent 46%),
      radial-gradient(circle at 95% 5%, #dce9e0 0%, transparent 37%),
      var(--bg);
    line-height: 1.45;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }
`;
