import socket from 'socket.io-client';
import esMain from 'es-main';
import isEqual from 'lodash/isEqual.js';

class ServerConnection {
  /**
   * Connect to a Panic Stations Server for multi-console play.
   * @param {Object} settings
   * @param {Function} messageHandler
   */
  constructor({ settings, messageHandler }) {
    this.remoteServer = `${settings.server.service}://${settings.server.fqdn}:${settings.server.port}`;
    this.messageHandler = messageHandler;
    this.sentData = new Map();
  }

  start() {
    this.socket = socket(this.remoteServer);
    this.socket.on('connect', () => {
      console.log('Connected to Server.');
      this.messageHandler({
        event: 'connect',
      });
      this.socket.emit('newConsole', {
        uuid: 1234,
      });
    });
    this.socket.on('event', (data) => {
      // Use this for testing any incoming event you want to.
      // Create more specific "events" when you know what you want to do.
      this.messageHandler({
        event: 'event',
        data,
      });
    });
    this.socket.on('stationData', (data) => {
      this.messageHandler({
        event: 'stationData',
        data,
      });
    });
    this.socket.on('disconnect', () => {
      this.sentData.clear(); // Avoid memory leaks.
      this.messageHandler({
        event: 'disconnect',
      });
    });
  }

  sendIndividualStationData({ stationData }) {
    if (
      this.socket.connected &&
      (!this.sentData.has(stationData.uuid) ||
        !isEqual(this.sentData.get(stationData.uuid), stationData))
    ) {
      this.socket.emit('stationData', stationData);
      this.sentData.set(stationData.uuid, stationData);
    }
  }

  sendAllStationData({ settings }) {
    console.log('TODO!');
  }
}

export default ServerConnection;

if (esMain(import.meta)) {
  console.log('.');
  const socketServerSubscriber = new ServerConnection({
    settings: { server: { service: 'http', fqdn: '127.0.0.1', port: 3003 } },
    messageHandler: console.log,
  });
  socketServerSubscriber.start();
}
