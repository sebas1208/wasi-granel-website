import * as migration_20261006_222620 from './20261006_222620';
import * as migration_20261007_000324 from './20261007_000324';

export const migrations = [
  {
    up: migration_20261006_222620.up,
    down: migration_20261006_222620.down,
    name: '20261006_222620',
  },
  {
    up: migration_20261007_000324.up,
    down: migration_20261007_000324.down,
    name: '20261007_000324'
  },
];
