import { Arguments, CommandBuilder } from "yargs";
import ora from "ora";
import chalk from "chalk";
import sanitize from "sanitize-filename";
import fs from 'fs-extra';
import replace from "replace-in-file";

import { API, GET } from "../../lib/index.js";
import { StoreCreate } from "../../types.js";
import { run } from "../../lib/common.js";
import boxen from "boxen";
import { useEnvironment, useOrganization, useToken } from "../../middleware/index.js";
import { downloadFromGitHub } from "../../lib/download.js";
import {checkPnpmPresence, getFolderName} from "../../lib/util.js";

export const command = "create [name]";
export const desc = "Create a Saleor App template";

export const builder: CommandBuilder<Record<string, never>, StoreCreate> = (_) =>
  _.positional("name", { type: "string", demandOption: true, default: "my-saleor-app" })

export const handler = async (argv: Arguments<StoreCreate>): Promise<void> => {
  await checkPnpmPresence('This Saleor App template')

  const env = await GET(API.Environment, argv) as any;
  const baseURL = `https://${env.domain}`;
  const graphqlURL = `${baseURL}/graphql/`;
  const dashboaardMsg = chalk.blue(`Dashboard - ${baseURL}/dashboard`);
  const gqlMsg = chalk.blue(`GraphQL Playgroud - ${graphqlURL}`);
  console.log(boxen(`${dashboaardMsg}\n${gqlMsg}`, { padding: 1 }));

  const spinner = ora('Downloading...').start();
  const target = await getFolderName(sanitize(argv.name));

  await downloadFromGitHub(`saleor/saleor-app-template`, target)

  process.chdir(target);
  spinner.text = `Creating .env...`;
  await fs.outputFile('.env', `
NEXT_PUBLIC_SALEOR_API_URL=${graphqlURL}
APP_URL=
`)

  spinner.text = `Updating .graphqlrc.yml...`;
  replace.sync({
    files: '.graphqlrc.yml',
    from: /schema:.*/g,
    to: `schema: ${graphqlURL}`
  });

  spinner.text = 'Installing dependencies...';
  await run('pnpm', ['i', '--ignore-scripts'], { cwd: process.cwd() })
  await run('pnpm', ['generate'], { cwd: process.cwd() })
  spinner.succeed('Starting ...\`pnpm run dev\`');

  await run('pnpm', ['run', 'dev'], { stdio: 'inherit', cwd: process.cwd() })
}

export const middlewares = [
  useToken, useOrganization, useEnvironment
]