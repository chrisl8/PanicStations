import esMain from 'es-main';

function formatGridText({ text, columns, rows }) {
  const lines = [];
  for (let i = 0; i < rows; i++) {
    lines[i] = '';
  }
  let line = 0;
  let backtracking = false;
  let noSpaces = false;
  for (let i = 0; i < text.length; i++) {
    if (line < rows) {
      // For Testing
      // if (line === 0) {
      //   console.log(
      //     i,
      //     line,
      //     lines[line].length,
      //     columns,
      //     backtracking,
      //     noSpaces,
      //     text[i],
      //     lines[line],
      //   );
      // }
      if (lines[line].length < columns - 1 && !backtracking && !noSpaces) {
        lines[line] = `${lines[line]}${text[i]}`;
      } else if (text[i + 1] === ' ') {
        lines[line] = `${lines[line]}${text[i]}`;
        i++;
        noSpaces = false;
        backtracking = false;
        line++;
      } else if (noSpaces) {
        lines[line] = `${lines[line]}${text[i]}`;
        if (lines[line].length === columns) {
          line++;
        }
      } else {
        lines[line] = lines[line].slice(0, -1);
        backtracking = true;
        i -= 2;
        if (i < 0) {
          i = 0;
          noSpaces = true;
        }
      }
    }
  }

  // Center each line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] !== '') {
      // Indent FIRST line if it is 19 characters long
      if (i === 0 && lines[i].length === columns - 1) {
        lines[i] = ` ${lines[i]}`;
      }

      if (lines[i].length < columns - 1) {
        let spaces = '';
        while (spaces.length < (columns - lines[i].length) / 2) {
          spaces = `${spaces} `;
        }
        lines[i] = `${spaces}${lines[i]}`;
      }
    }
  }

  // If the total number of lines is 2 less than rows, bump it down a row
  // NOTE: Works great for 4 row screen, for taller screens this should probably be improved to center top to bottom better
  if (
    lines.length > 2 &&
    lines[lines.length - 1] === '' &&
    lines[lines.length - 2] === ''
  ) {
    lines[lines.length - 2] = lines[lines.length - 3];
    if (lines.length > 3) {
      lines[lines.length - 3] = lines[lines.length - 4];
    }
    lines[0] = '';
  }

  // For Testing
  // lines[lines.length] = '12345678901234567890';

  return lines;
}

export default formatGridText;

if (esMain(import.meta)) {
  if (process.argv.length < 4) {
    console.log(
      'You must provide text and the columns and rows of your display:',
    );
    console.log(`node formatGridText 'Hello World!' 20 4`);
    process.exit();
  }
  console.log(
    formatGridText({
      text: process.argv[2],
      columns: Number(process.argv[3]),
      rows: Number(process.argv[4]),
    }),
  );
}
