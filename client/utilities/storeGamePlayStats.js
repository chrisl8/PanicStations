import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sqlite3 from 'sqlite3';
import initDatabase from './initDatabase.js';

async function storeGamePlayStats({ settings, gamePlayStats }) {
  // Persistent game play stats in SQLite database.
  // If the database doesn't exist, it will be created.

  if (settings.debug) {
    console.log(gamePlayStats);
  }

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

  // eslint-disable-next-line func-names
  db.query = function (sql, params) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.all(sql, params, (error, rows) => {
        if (error) reject(error);
        else resolve({ rows });
      });
    });
  };

  // eslint-disable-next-line func-names
  db.insert = function (sql, params) {
    const that = this;
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line func-names
      that.run(sql, params, function (error) {
        // Must not use arrow function to preserve this
        if (error) reject(error);
        else resolve({ lastID: this.lastID });
      });
    });
  };

  await initDatabase(db);

  let gameId;
  try {
    gameId = await db.insert(
      'INSERT INTO games (timestamp, startedTime, endTime, score) VALUES ($1, $2, $3, $4);',
      [
        Date.now(),
        gamePlayStats.startedTime,
        gamePlayStats.endTime,
        gamePlayStats.score,
      ],
    );
  } catch (e) {
    console.error('Error adding game to stats database:');
    console.error(e.message);
  }

  if (gameId && gameId.lastID) {
    await Promise.all(
      gamePlayStats.gamePlayStats.map(async (entry) => {
        try {
          await db.insert(
            'INSERT INTO gamePlayStats (timestamp, gamesRowId, station, input, timeElapsed, success) VALUES ($1, $2, $3, $4, $5, $6);',
            [
              Date.now(),
              gameId.lastID,
              entry.station,
              entry.input,
              entry.timeElapsed,
              entry.success,
            ],
          );
        } catch (e) {
          console.error('Error adding game stat database:');
          console.error(e.message);
        }
      }),
    );
  }

  await db.close();
}

export default storeGamePlayStats;
