import { startServer } from './server.js';
import { initMongoDB } from '../src/db/initMongoDB.js';

const runServer = async () => {
  await initMongoDB();

  startServer();
};
runServer();
