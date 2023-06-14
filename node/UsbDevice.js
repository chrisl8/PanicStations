/* eslint-disable no-param-reassign */
import { promisify } from 'util';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import esMain from 'es-main';

const asyncExec = promisify(exec);

const isWindows = process.platform === 'win32';

class UsbDevice {
  constructor(uniqueDeviceString, stringLocation) {
    this.uniqueDeviceString = uniqueDeviceString;
    // stringLocation tells what line of the udevadm output the uniqueDeviceString is found in.
    // Usually 'product', 'name' or 'manufacturer'
    this.stringLocation = stringLocation;
  }

  async findDeviceName() {
    let deviceName;
    if (isWindows) {
      // https://learn.microsoft.com/en-us/windows-hardware/drivers/devtest/pnputil-command-syntax
      // PnPUtil (PnPUtil.exe) is included in every version of Windows starting with Windows Vista, in the %windir%\system32 directory.
      // Unfortunately:
      // Enumerate all devices on the system. Command available starting in Windows 10 version 1903.
      // /properties flag became available starting in Windows 11 version 21H2
      const { stdout } = await asyncExec(
        'pnputil.exe /enum-devices /class Ports /connected /properties',
      );
      if (stdout) {
        const outputAsArray = String(stdout).split('\n'); // parse Windows device data to find the one we want.
        let possiblePort;
        for (let i = 0; i < outputAsArray.length; i++) {
          if (outputAsArray[i].split(':')[0] === 'Device Description') {
            if (outputAsArray[i].includes('(COM')) {
              possiblePort = outputAsArray[i]
                .trim()
                .split('(')[1]
                .split(')')[0];
            } else {
              possiblePort = null;
            }
          }
          // Use this for finding the strings to add to the config file
          // if (possiblePort === 'COM6') {
          //   console.log(outputAsArray[i]);
          // }
          if (
            possiblePort &&
            outputAsArray[i].includes(this.stringLocation) &&
            outputAsArray[i + 1].trim() === this.uniqueDeviceString
          ) {
            deviceName = possiblePort;
          }
        }
      }
    } else {
      const linuxUsbDeviceList = await this.getLinuxUsbDeviceList();
      const infoDump = await this.getInfoFromDeviceList(linuxUsbDeviceList);
      // Parse Linux USB Device data to find the one we want.
      for (let i = 0; i < infoDump.length; i++) {
        for (let j = 0; j < infoDump[i].deviceInfo.length; j++) {
          if (infoDump[i].deviceInfo[j].includes(this.stringLocation)) {
            const deviceStringLine = infoDump[i].deviceInfo[j].split('=');
            if (deviceStringLine.length > 0) {
              const re = /"/g;
              infoDump[i].deviceString = deviceStringLine[1].replace(re, '');
            }
            break;
          }
        }
        if (infoDump[i].hasOwnProperty('deviceString')) {
          if (infoDump[i].deviceString.includes(this.uniqueDeviceString)) {
            deviceName = `/dev/${infoDump[i].device}`;
            break;
          }
        }
      }
    }
    if (deviceName) {
      return deviceName;
    }
    throw new Error('USB Device Not found.');
  }

  getLinuxUsbDeviceList() {
    return new Promise((resolve, reject) => {
      // all /dev/ttyUSB* and /dev/ttyACM* file names
      fs.readdir('/dev/', (err, list) => {
        if (err) {
          reject(err);
        } else {
          const outputList = [];
          const interestingDeviceNames = ['USB', 'ACM'];
          for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < interestingDeviceNames.length; j++) {
              if (list[i].includes(interestingDeviceNames[j])) {
                outputList.push(list[i]);
              }
            }
          }
          resolve(outputList);
        }
      });
    });
  }

  getInfoFromDeviceList(deviceList) {
    // eslint-disable-next-line arrow-body-style
    const getSingleDeviceInfo = (device) => {
      return new Promise((resolve, reject) => {
        let outputData = '';
        const process = spawn('udevadm', ['info', '-n', `/dev/${device}`]);
        process.stdout.on('data', (data) => {
          outputData += data;
        });
        process.stderr.on('data', (data) => {
          console.log(`stderr: ${data}`);
        });
        process.on('close', (code) => {
          if (code === null || code === 0) {
            const outputAsArray = String(outputData).split('\n');
            resolve({
              device,
              deviceInfo: outputAsArray,
            });
          } else {
            reject(code);
          }
        });
      });
    };
    const allResults = deviceList.map((device) =>
      getSingleDeviceInfo(device).then((deviceInfo) => deviceInfo),
    );
    return Promise.all(allResults);
  }
}

export default UsbDevice;
if (esMain(import.meta)) {
  // Run the function if this is called directly instead of required.
  if (process.argv.length < 4) {
    console.log('You must provide a string to search for,');
    console.log(
      "and the line it is contained in, usually 'product', 'name' or 'manufacturer'.",
    );
    console.log('i.e.');
    console.log(
      'node UsbDevice.js "Numato Lab 1 Channel USB Powered Relay Module" product',
    );
    process.exit();
  }
  const usbDevice = new UsbDevice(process.argv[2], process.argv[3]);
  usbDevice
    .findDeviceName()
    .then((deviceName) => {
      console.log(`${deviceName}`);
    })
    .catch((error) => {
      console.log(`ERROR: ${error.message}`);
      process.exit(1);
    });
}
