import * as migration_20261104_171856_initial from './20261104_171856_initial';
import * as migration_20261104_180000_seed_topics from './20261104_180000_seed_topics';
import * as migration_20261104_192029_remove_generate_slug from './20261104_192029_remove_generate_slug';
import * as migration_20261104_200716_add_media_object_key from './20261104_200716_add_media_object_key';

export const migrations = [
  {
    up: migration_20261104_171856_initial.up,
    down: migration_20261104_171856_initial.down,
    name: '20261104_171856_initial',
  },
  {
    up: migration_20261104_180000_seed_topics.up,
    down: migration_20261104_180000_seed_topics.down,
    name: '20261104_180000_seed_topics',
  },
  {
    up: migration_20261104_192029_remove_generate_slug.up,
    down: migration_20261104_192029_remove_generate_slug.down,
    name: '20261104_192029_remove_generate_slug',
  },
  {
    up: migration_20261104_200716_add_media_object_key.up,
    down: migration_20261104_200716_add_media_object_key.down,
    name: '20261104_200716_add_media_object_key'
  },
];
