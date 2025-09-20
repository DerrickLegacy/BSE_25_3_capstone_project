// lint.js
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

const { ESLint } = require('eslint');

(async function main() {
  const chalk = await import('chalk');
  try {
    const eslint = new ESLint({
      extensions: ['.js', '.jsx'],
    });

    const results = await eslint.lintFiles(['client/src', 'server.js']); // Add more dirs as needed
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);

    const errorCount = results.reduce(
      (sum, res) => sum + res.errorCount + res.warningCount,
      0
    );

    if (errorCount > 0) {
      console.log(resultText);
      process.exit(1);
    } else {
      //   console.log('✔ No problems found');
      console.log(chalk.default.green('✔ No problems found'));
    }
  } catch (err) {
    console.error(chalk.default.red('❌ ESLint failed:'), err);
    process.exit(1);
  }
})();
