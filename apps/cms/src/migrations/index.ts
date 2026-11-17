import * as migration_20261006_222620 from './20261006_222620';
import * as migration_20261007_000324 from './20261007_000324';
import * as migration_20261009_120000 from './20261009_120000';
import * as migration_20261015_020120 from './20261015_020120';
import * as migration_20261021_012754 from './20261021_012754';
import * as migration_20261024_221333_add_site_copy_globals from './20261024_221333_add_site_copy_globals';
import * as migration_20261028_200006 from './20261028_200006';
import * as migration_20261117_161338 from './20261117_161338';
import * as migration_20261117_171957 from './20261117_171957';
import * as migration_20261117_222641 from './20261117_222641';

export const migrations = [
  {
    up: migration_20261006_222620.up,
    down: migration_20261006_222620.down,
    name: '20261006_222620',
  },
  {
    up: migration_20261007_000324.up,
    down: migration_20261007_000324.down,
    name: '20261007_000324',
  },
  {
    up: migration_20261009_120000.up,
    down: migration_20261009_120000.down,
    name: '20261009_120000',
  },
  {
    up: migration_20261015_020120.up,
    down: migration_20261015_020120.down,
    name: '20261015_020120',
  },
  {
    up: migration_20261021_012754.up,
    down: migration_20261021_012754.down,
    name: '20261021_012754',
  },
  {
    up: migration_20261024_221333_add_site_copy_globals.up,
    down: migration_20261024_221333_add_site_copy_globals.down,
    name: '20261024_221333_add_site_copy_globals',
  },
  {
    up: migration_20261028_200006.up,
    down: migration_20261028_200006.down,
    name: '20261028_200006',
  },
  {
    up: migration_20261117_161338.up,
    down: migration_20261117_161338.down,
    name: '20261117_161338',
  },
  {
    up: migration_20261117_171957.up,
    down: migration_20261117_171957.down,
    name: '20261117_171957',
  },
  {
    up: migration_20261117_222641.up,
    down: migration_20261117_222641.down,
    name: '20261117_222641'
  },
];
