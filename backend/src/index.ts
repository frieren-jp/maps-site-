import app from './app';
import { initializeDatabase } from './utils/db';

const PORT = Number(process.env.PORT || 5000);

const start = async () => {
  try {
    await initializeDatabase();
    console.log('Database schema initialized');
  } catch (error) {
    console.error('Database initialization failed. API will still start.', error);
  }

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

void start();
