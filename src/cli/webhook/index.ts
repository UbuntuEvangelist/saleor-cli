import {
  useAppConfig,
  useAvailabilityChecker,
  useInstanceConnector,
} from '../../middleware/index.js';
import * as create from './create.js';
import * as edit from './edit.js';
import * as list from './list.js';
import * as update from './update.js';

export default function (_: any) {
  _.command([list, create, edit, update])
    .middleware([useAppConfig, useInstanceConnector, useAvailabilityChecker])
    .demandCommand(1, 'You need at least one command before moving on');
}
