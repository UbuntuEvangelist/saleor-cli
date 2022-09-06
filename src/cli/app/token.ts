import boxen from 'boxen';
import Debug from 'debug';
import Enquirer from 'enquirer';
import got from 'got';
import { print } from 'graphql';
import { Arguments } from 'yargs';

import { AppTokenCreate } from '../../generated/graphql.js';
import { SaleorAppList } from '../../graphql/SaleorAppList.js';
import { Config } from '../../lib/config.js';
import { getEnvironmentGraphqlEndpoint } from '../../lib/environment.js';
import { getAppsFromResult, printContext } from '../../lib/util.js';
import {
  useEnvironment,
  useOrganization,
  useToken,
} from '../../middleware/index.js';
import { Options } from '../../types.js';

const debug = Debug('saleor-cli:app:token');

export const command = 'token';
export const desc = 'Create a Saleor App token';

export const handler = async (argv: Arguments<Options>) => {
  debug(`command arguments: ${JSON.stringify(argv, null, 2)}`);

  const { organization, environment } = argv;

  printContext(organization, environment);

  const endpoint = await getEnvironmentGraphqlEndpoint(argv);
  debug(`Saleor endpoint: ${endpoint}`);
  const headers = await Config.getBearerHeader();

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

  const choices = apps.map(({ node }: any) => ({
    name: node.name,
    value: node.id,
    hint: node.id,
  }));

  const { app } = await Enquirer.prompt<{ app: string }>({
    type: 'autocomplete',
    name: 'app',
    choices,
    message: 'Select a Saleor App (start typing) ',
  });

  debug(`Creating auth token for ${app}`);
  try {
    const authToken = await createAppToken(endpoint, app);
    console.log();
    console.log(boxen(`Your Token: ${authToken}`, { padding: 1 }));
  } catch (error) {
    console.log(error);
  }

  process.exit(0);
};

export const createAppToken = async (url: string, app: string) => {
  const headers = await Config.getBearerHeader();

  const { data }: any = await got
    .post(url, {
      headers,
      json: {
        query: print(AppTokenCreate),
        variables: { app },
      },
    })
    .json();

  const {
    appTokenCreate: { authToken },
  } = data;
  return authToken;
};

export const middlewares = [useToken, useOrganization, useEnvironment];
