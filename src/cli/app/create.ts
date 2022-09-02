import boxen from 'boxen';
import chalk from 'chalk';
import { access } from 'fs/promises';
import kebabCase from 'lodash.kebabcase';
import ora, { Ora } from 'ora';
import replace from 'replace-in-file';
import sanitize from 'sanitize-filename';
import { simpleGit } from 'simple-git';
import { Arguments, CommandBuilder } from 'yargs';

import { run } from '../../lib/common.js';
import { downloadFromGitHub } from '../../lib/download.js';
import { checkPnpmPresence } from '../../lib/util.js';
import { StoreCreate } from '../../types.js';

export const command = 'create [name]';
export const desc = 'Create a Saleor App template';

export const builder: CommandBuilder<Record<string, never>, StoreCreate> = (
  _
) =>
  _.positional('name', {
    type: 'string',
    demandOption: true,
    default: 'my-saleor-app',
  });

export const handler = async (argv: Arguments<StoreCreate>): Promise<void> => {
  await checkPnpmPresence('This Saleor App template');

  const target = await getFolderName(sanitize(argv.name));
  const packageName = kebabCase(target);
  const dirMsg = `App directory: ${chalk.blue(target)}`;
  const appMsg = ` Package name: ${chalk.blue(packageName)}`;
  console.log(
    boxen(`${dirMsg}\n${appMsg}`, {
      padding: 1,
      margin: 1,
      borderColor: 'yellow',
    })
  );

  const spinner = ora('Downloading...').start();

  await downloadFromGitHub('saleor/saleor-app-template', target);

  process.chdir(target);

  spinner.text = 'Updating package.json...';
  await replace.replaceInFile({
    files: 'package.json',
    from: /"name": "saleor-app-template".*/g,
    to: `"name": "${packageName}",`,
  });

  await setupGitRepository(spinner);

  spinner.text = 'Installing dependencies...';
  await run('pnpm', ['i', '--ignore-scripts'], { cwd: process.cwd() });
  await run('pnpm', ['generate'], { cwd: process.cwd() });

  spinner.succeed(
    chalk(
      'Your Saleor app is ready in the',
      chalk.yellow(target),
      'directory\n'
    )
  );

  console.log('  To start your application:\n');
  console.log(`    cd ${target}`);
  console.log('    pnpm dev');
};

const getFolderName = async (name: string): Promise<string> => {
  let folderName = name;
  while (await dirExists(folderName)) {
    folderName = folderName.concat('-0');
  }
  return folderName;
};

const dirExists = async (name: string): Promise<boolean> => {
  try {
    await access(name);
    return true;
  } catch (error) {
    return false;
  }
};

export const setupGitRepository = async (spinner: Ora) => {
  spinner.text = 'Setting up the Git repository...'; // eslint-disable-line no-param-reassign
  const git = simpleGit();
  await git.init(['--initial-branch', 'main']);
  await git.add('.');
  await git.commit('Initial commit from Saleor CLI');
};
