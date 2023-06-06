import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sqlite3 from 'sqlite3';
import initDatabase from './utilities/initDatabase.js';

async function storeGamePlayStats({ settings }) {
  // Persistent game play stats in SQLite database.
  // If the database doesn't exist, it will be created.

  // https://stackoverflow.com/a/64383997/4982408
  // eslint-disable-next-line no-underscore-dangle
  const __filename = fileURLToPath(import.meta.url);
  // eslint-disable-next-line no-underscore-dangle
  const __dirname = dirname(__filename);
  const dbName = `${__dirname}/../../gamePlayStats.sqlite`;

  const db = new sqlite3.Database(dbName, (err) => {
    if (err) {
      console.error(err.message);
    }

    if (settings.debug) {
      console.log('Connected to the gamePlayStats database.');
    }
  });

  await initDatabase(db);

  console.log('storeGamePlayStats');
}

export default storeGamePlayStats;
