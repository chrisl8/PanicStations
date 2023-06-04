import fs from 'fs';
import JSON5 from 'json5';

const readObjectFromFile = (path) =>
  new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        console.log(`Error reading ${path} file.`);
        resolve(null);
      } else {
        try {
          const parsed = JSON5.parse(data);
          resolve(parsed);
        } catch (e) {
          console.error(
            `File ${path} exists, but is not valid JSON5. This is a fatal error. Please fix the file and try again.`,
          );
          console.error('Filename:', path);
          console.error(e);
          reject(e);
        }
      }
    });
  });

export default readObjectFromFile;
