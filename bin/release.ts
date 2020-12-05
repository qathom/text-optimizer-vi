#!/usr/bin/env ts-node
import util from 'util';
import inquirer from 'inquirer';

const exec = util.promisify(require('child_process').exec);

const { log } = console;

async function execute(command: string) {
  const { stdout, stderr } = await exec(command);
  return stdout || stderr;
}

(async () => {
  try {
    const semVers = ['patch', 'minor', 'major'];

    const { semVer } = await inquirer.prompt({
      type: 'list',
      name: 'semVer',
      message: 'Semver:',
      choices: semVers,
    });

    // Update the version in package.json, create tag
    await execute(`npm version ${semVer} -m "Upgrade to %s"`);

    // Push
    await execute('git push --follow-tags');

    log('Success!');
  } catch (e) {
    log('An error occurred', e);
  }
})();
