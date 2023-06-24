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

  /**
   * Send individual Station Data to Server
   * @param {Object} stationData
   */
  sendIndividualStationData({ stationData }) {
    // Make a serializable clone of only the specific data we need
    let data = {
      inputs: stationData.inputs,
      uuid: stationData.uuid,
      armed: stationData.armed,
      done: stationData.done,
      displayName: stationData.displayName,
      newInput: stationData.newInput,
    };
    data = JSON.parse(JSON.stringify(data));
    if (
      this.socket.connected &&
      (!this.sentData.has(data.uuid) ||
        !isEqual(this.sentData.get(data.uuid), data))
    ) {
      this.sentData.set(data.uuid, data);
      this.socket.emit('stationData', data);
    }
  }

  sendAllStationData({ settings }) {
    if (this.socket.connected) {
      for (const [, value] of Object.entries(settings.stations)) {
        this.sendIndividualStationData({ stationData: value });
      }
    }
  }
}

export default ServerConnection;

if (esMain(import.meta)) {
  const socketServerSubscriber = new ServerConnection({
    settings: { server: { service: 'http', fqdn: '127.0.0.1', port: 3003 } },
    messageHandler: (data) => {
      console.log(data);
      // if (data.data && data.data.inputs && data.data.inputs.length > 0) {
      //   console.log(data.data.inputs[1]);
      // }
    },
  });
  socketServerSubscriber.start();
}
