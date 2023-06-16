import express from 'express';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const port = process.env.PORT || 3003;
// Fancy Express Web Server
// All of my "static" web pages are in the public folder
const app = express();
const webServer = app.listen(port);
const io = new Server(webServer);

// https://stackoverflow.com/a/64383997/4982408
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

const dbName = `${__dirname}/database.sqlite`;
const db = new sqlite3.Database(dbName, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
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

// Database initialization.
try {
  // Creating the users table if it does not exist.
  let sqlCreateTable = `CREATE TABLE IF NOT EXISTS keyValueStore (
      key TEXT PRIMARY KEY,
      value TEXT
    );`;
  await db.query(sqlCreateTable, []);

  // Creating the twilio table if it does not exist.
  sqlCreateTable = `CREATE TABLE IF NOT EXISTS twilio (
      smsText TEXT,
      smsTo TEXT,
      smsFrom TEXT
    );`;
  await db.query(sqlCreateTable, []);

  // Creating the generic message table if it does not exist.
  sqlCreateTable = `CREATE TABLE IF NOT EXISTS messages
                    (
                        text TEXT,
                        \`to\`   TEXT,
                        \`from\` TEXT
                    );`;
  await db.query(sqlCreateTable, []);

  // Creating the hosts table if it does not exist.
  sqlCreateTable = `CREATE TABLE IF NOT EXISTS hosts ( 
      name TEXT PRIMARY KEY,
      ip TEXT,
      port TEXT
    );`;
  await db.query(sqlCreateTable, []);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const setKeyValueDb = async (key, value) => {
  let result = false;
  try {
    const sql =
      'INSERT OR REPLACE INTO keyValueStore (key, value) VALUES ($1, $2);';
    await db.query(sql, [key, value]);
    result = true;
  } catch (e) {
    console.error(`Error adding ${key}:${value} to database:`);
    console.error(e.message);
  }
  return result;
};

const getKeyValueDb = async (key) => {
  let result = null;
  try {
    const sql = 'SELECT value FROM keyValueStore WHERE key = ?';
    const value = await db.query(sql, [key]);
    if (value && value.rows && value.rows.length > 0 && value.rows[0].value) {
      result = value.rows[0].value;
    }
    console.log(result);
  } catch (e) {
    console.error(`Error getting ${key} from database:`);
    console.error(e.message);
  }
  return result;
};

const addHostDb = async (name, ip, hostPort) => {
  let result = false;
  try {
    const sql =
      'INSERT OR REPLACE INTO hosts (name, ip, port) VALUES ($1, $2, $3);';
    await db.query(sql, [name, ip, hostPort]);
    result = true;
  } catch (e) {
    console.error(`Error adding host ${name} to database:`);
    console.error(e.message);
  }
  return result;
};

const getHostDb = async (name) => {
  let result = null;
  try {
    const sql = 'SELECT * FROM hosts WHERE name = ?';
    const value = await db.query(sql, [name]);
    if (value && value.rows && value.rows.length > 0 && value.rows[0].name) {
      result = value.rows[0];
    }
  } catch (e) {
    console.error(`Error getting host ${name} from database:`);
    console.error(e.message);
  }
  return result;
};

const getAllHostsDb = async () => {
  let result = null;
  try {
    const sql = 'SELECT * FROM hosts';
    const value = await db.query(sql);
    if (value && value.rows && value.rows.length > 0 && value.rows[0].name) {
      result = value.rows;
    }
  } catch (e) {
    console.error(`Error getting host list from database:`);
    console.error(e.message);
  }
  return result;
};

const addTwilioMessage = async (message) => {
  let result = false;
  try {
    const sql =
      'INSERT INTO twilio (smsText, smsTo, smsFrom) VALUES ($1, $2, $3);';
    await db.query(sql, [message.smsText, message.smsTo, message.smsFrom]);
    result = true;
  } catch (e) {
    console.error(`Error adding Twilio message to database:`);
    console.error(e.message);
  }
  return result;
};

const addMessage = async ({ to, message, from }) => {
  let result = false;
  try {
    const sql =
      'INSERT INTO messages (text, `to`, `from`) VALUES ($1, $2, $3);';
    await db.query(sql, [message, to, from]);
    result = true;
  } catch (e) {
    console.error(`Error adding Twilio message to database:`);
    console.error(e.message);
  }
  return result;
};

const getMessagesTo = async (name) => {
  let result = null;
  try {
    const sql = 'SELECT rowid, * FROM messages WHERE `to` = $1';
    const value = await db.query(sql, [name]);
    result = value;
  } catch (e) {
    console.error(`Error getting messages from database:`);
    console.error(e.message);
  }
  return result;
};

app.disable('x-powered-by'); // Do not volunteer system info!

app.use(express.static(`${__dirname}/public`));

app.use(express.json()); // to support JSON-encoded bodies
app.use(
  express.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  }),
);

const delMessage = async (rowid) => {
  let result = false;
  try {
    const sql = 'DELETE FROM messages WHERE rowid = $1;';
    await db.query(sql, [rowid]);
    result = true;
  } catch (e) {
    console.error(`Error deleting message from database:`);
    console.error(e.message);
  }
  return result;
};

app.disable('x-powered-by'); // Do not volunteer system info!

app.use(express.static(`${__dirname}/public`));

app.use(express.json()); // to support JSON-encoded bodies
app.use(
  express.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  }),
);

const robotSubscribers = new Map();

// with Socket.io!

function socketEmitToId({ emitToId, socketEvent, data }) {
  // emit.to doesn't work to send back to the sender, so we need this special function
  // using io instead of just the socket.
  // per https://socket.io/docs/v3/emit-cheatsheet/
  // WARNING: `socket.to(socket.id).emit()` will NOT work, as it will send to everyone in the room
  // named `socket.id` but the sender. Please use the classic `socket.emit()` instead.
  io.sockets.to(emitToId).emit(socketEvent, data);
}

async function sendOldMessages(name) {
  if (robotSubscribers.has(name)) {
    const robotSubscriber = robotSubscribers.get(name);
    const messages = await getMessagesTo(name);
    if (messages && messages.rows && messages.rows.length > 0) {
      await Promise.all(
        messages.rows.map(async (entry) => {
          await socketEmitToId({
            emitToId: robotSubscriber.id,
            socketEvent: 'oldMessage',
            data: {
              text: entry.text,
              to: entry.to,
              from: entry.from,
            },
          });
          await delMessage(entry.rowid);
        }),
      );
    }
  }
}

const checkBasicPasswordInPostBody = (input) => {
  let password = 'superSecret1234';
  if (
    configData.cloudServer.password &&
    configData.cloudServer.password.length > 0
  ) {
    password = configData.cloudServer.password;
  }
  return input && input === password;
};

async function onNewRobot(data) {
  if (checkBasicPasswordInPostBody(data.password)) {
    const newRobot = new Robot(this.id, data.name);
    robotSubscribers.set(data.name, newRobot);
    io.sockets.emit('welcome');
    console.log(`${data.name} has connected with Socket ID ${this.id}`);
    await sendOldMessages(data.name);
  } else {
    console.log(`${data.name} validation failed`);
    this.disconnect();
  }
}

// eslint-disable-next-line consistent-return
function getMapKeybyValueObjectKey(map, searchKey, searchValue) {
  for (const [key, value] of map.entries()) {
    if (value[searchKey] && value[searchKey] === searchValue) return key;
  }
}

function onClientDisconnect() {
  console.log(`Console has disconnected from Socket ID: ${this.id}`);

  const entryToRemove = getMapKeybyValueObjectKey(
    robotSubscribers,
    'id',
    this.id,
  );

  if (!entryToRemove) {
    console.log('Robot not found.');
    console.log(robotSubscribers);
    return;
  }

  console.log(`${robotSubscribers.get(entryToRemove).name} has disconnected.`);
  robotSubscribers.delete(entryToRemove);
}

io.on('connection', (socket) =>{
  const remoteIp =
    socket.handshake.headers['x-real-ip'] ||
    socket.conn.remoteAddress;
  console.log(`Socket connection started from ${remoteIp}`);

  socket.on('new robot', onNewRobot);
  socket.on('disconnect', onClientDisconnect);
  socket.on('stationData', (data) => {
    socket.broadcast.emit(data);
  })
});

app.use(express.static(`${__dirname}/public`));

async function closeServer() {
  console.log('Shutdown requested. PLEASE BE PATIENT! Working on it...');
  console.log('Closing Database...');
  await db.close();
  process.exit();
}

process.on('SIGINT', async () => {
  await closeServer();
});
