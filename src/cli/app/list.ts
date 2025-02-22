import { CliUx } from '@oclif/core';
import chalk from 'chalk';
import Debug from 'debug';
import got from 'got';
import { Arguments } from 'yargs';

import { SaleorAppList } from '../../graphql/SaleorAppList.js';
import { Config } from '../../lib/config.js';
import {
  formatDateTime,
  getAppsFromResult,
  obfuscateArgv,
} from '../../lib/util.js';
import {
  useAppConfig,
  useAvailabilityChecker,
  useInstanceConnector,
} from '../../middleware/index.js';
import { Options } from '../../types.js';

const { ux: cli } = CliUx;

const debug = Debug('saleor-cli:app:list');

export const command = 'list';
export const desc = 'List installed Saleor Apps for an environment';

export const handler = async (argv: Arguments<Options>) => {
  debug('command arguments: %O', obfuscateArgv(argv));

  const headers = await Config.getBearerHeader();

  const { instance } = argv;
  const endpoint = `${instance}/graphql/`;
  debug(`Saleor endpoint: ${endpoint}`);

  debug('Fetching Saleor Apps');
  const { data }: any = await got
    .post(endpoint, {
      headers,
      json: {
        query: SaleorAppList,
        variables: {},
      },
    })
    .json();

  const apps = getAppsFromResult(data);

  const collection: any[] = apps.map(({ node }: any) => ({ ...node }));

  if (argv.json) {
    console.log(JSON.stringify(collection, null, 2));
    return;
  }

  cli.table(collection, {
    id: {
      header: 'ID',
      minWidth: 2,
      get: ({ id }) => chalk.gray(id),
    },
    name: {
      header: 'Name',
      minWidth: 2,
      get: ({ name }) => chalk.cyan(name),
    },
    type: {
      header: 'URL',
      get: ({ type }) => chalk.yellow(type),
    },
    isActive: {
      header: 'Active?',
      minWidth: 2,
      get: ({ isActive }) => (isActive ? chalk.green('Yes') : chalk.red('No')),
    },
    webhooks: {
      header: 'Webhooks #',
      minWidth: 2,
      get: ({ webhooks }) => (webhooks as string[]).length,
    },
    created: {
      header: 'Created',
      minWidth: 2,
      get: ({ created }) => chalk.gray(formatDateTime(created)),
    },
  });

  process.exit(0);
};

export const middlewares = [
  useAppConfig,
  useInstanceConnector,
  useAvailabilityChecker,
];
