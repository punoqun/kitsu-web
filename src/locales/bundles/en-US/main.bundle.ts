import { enUS as dateFns } from 'date-fns/locale/en-US';

import { default as kitsu } from '../../translations/en-US.json';
import { type LocaleBundles } from '../../utils/locale';

export default {
  kitsu: kitsu as unknown as LocaleBundles['main']['kitsu'],
  dateFns,
} satisfies LocaleBundles['main'];
