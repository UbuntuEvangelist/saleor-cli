import Debug from 'debug';
import { Arguments, CommandBuilder } from 'yargs';

import { doSaleorAppInstall } from '../../lib/common.js';
import { obfuscateArgv, printContext } from '../../lib/util.js';
import {
  useAppConfig,
  useAvailabilityChecker,
  useInstanceConnector,
} from '../../middleware/index.js';
import { Options } from '../../types.js';

const debug = Debug('saleor-cli:app:install');

export const command = 'install';
export const desc = 'Install a Saleor App by URL';

export const builder: CommandBuilder = (_) =>
  _.option('via-dashboard', {
    type: 'boolean',
    default: false,
  })
    .option('app-name', {
      demandOption: false,
      type: 'string',
      desc: 'Application name',
    })
    .option('manifest-URL', {
      demandOption: false,
      type: 'string',
      desc: 'Application Manifest URL',
    });

export const handler = async (argv: Arguments<Options>) => {
  debug('command arguments: %O', obfuscateArgv(argv));

  const { organization, environment } = argv;

  printContext(organization, environment);

  await doSaleorAppInstall(argv);

  process.exit(0);
};

export const middlewares = [
  useAppConfig,
  useInstanceConnector,
  useAvailabilityChecker,
];
