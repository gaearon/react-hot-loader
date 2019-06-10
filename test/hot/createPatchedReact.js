const { writeFileSync, readFileSync, readdirSync, statSync, mkdirSync } = require('fs');
const {
  default: { patch },
} = require('../../webpack');

const copyFile = (source, dest) => {
  const data = readFileSync(source).toString();
  const patchedData = patch(data);
  writeFileSync(dest, patchedData || data);
};

const copy = (source, target) => {
  const list = readdirSync(source);
  for (const i of list) {
    const sourceFile = `${source}/${i}`;
    const targetFile = `${target}/${i}`;

    const stat = statSync(sourceFile);
    if (stat.isDirectory()) {
      mkdirSync(`${target}/${i}`);
      copy(sourceFile, targetFile);
    } else {
      copyFile(sourceFile, targetFile);
    }
  }
};

const TARGET = `${__dirname}/react-dom`;

mkdirSync(TARGET);

copy('./node_modules/react-dom/', TARGET);
