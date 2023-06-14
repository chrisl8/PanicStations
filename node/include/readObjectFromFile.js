import fs from 'fs';
import JSON5 from 'json5';

const readObjectFromFile = (path) =>
  new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(new Error(`Error reading ${path} file.`))
      } else {
        try {
          const parsed = JSON5.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`File ${path} exists, but is not valid JSON5. This is a fatal error. Please fix the file and try again.\nError:\n${e}`));
        }
      }
    });
  });

export default readObjectFromFile;
