async function initDatabase(db) {
  async function addOrUpdateTable({ tableName, columns }) {
    try {
      let createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
      let needComma;
      for (const [key, value] of Object.entries(columns)) {
        if (needComma) {
          createTableQuery = `${createTableQuery},`;
        }
        createTableQuery = `${createTableQuery} ${key} ${value}`;
        needComma = true;
      }
      createTableQuery = `${createTableQuery})`;
      await db.query(createTableQuery, []);
      const tableInfo = await db.query(`PRAGMA table_info(${tableName})`, []);
      // Add any missing columns to existing tables.
      for (const [key, value] of Object.entries(columns)) {
        if (tableInfo.rows.findIndex((x) => x.name === key) === -1) {
          console.log(`Adding ${key} column to ${tableName} table.`);
          // eslint-disable-next-line no-await-in-loop
          await db.query(
            `ALTER TABLE ${tableName} ADD COLUMN ${key} ${value}`,
            [],
          );
        }
      }
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  }

  // Database initialization.
  // Creating the games table if it does not exist.
  await addOrUpdateTable({
    tableName: 'games',
    columns: {
      timestamp: 'INTEGER',
      startedTime: 'INTEGER',
      endTime: 'INTEGER',
      score: 'INTEGER',
    },
  });

  // Creating the gamePlayStats table if it does not exist.
  await addOrUpdateTable({
    tableName: 'gamePlayStats',
    columns: {
      gamesRowId: 'TEXT',
      timestamp: 'INTEGER',
      station: 'TEXT',
      input: 'TEXT',
      timeElapsed: 'INTEGER',
      success: 'INTEGER DEFAULT 0',
    },
  });
}

export default initDatabase;
