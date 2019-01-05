const glob = require('glob');
const { parse } = require('graphql/language/parser');
const fs = require('fs');

glob('src/**/*.gql', (err, files) => {
  if (err) {
    console.log(`Globbing error: ${err.message}`);
    process.exit(1);
  } else {
    files.forEach((file) => {
      const inputData = fs.readFileSync(file, 'utf8');
      const data = JSON.stringify(parse(inputData));
      const outFileName = file.replace('src', 'dist').replace('.gql', '.js');
      fs.writeFileSync(outFileName, data, 'utf8');
    });
  }
});
