import studio from '@mongoosejs/studio/backend/next';
import connect from '../../db/connect';

import '../../db/log';
import '../../db/player';

const enabled = !!process.env.MONGOOSE_STUDIO;

export default async function handler(req, res) {
  if (!enabled) {
    throw new Error('Studio disabled');
  }

  await connect();

  await studio()(req, res);
}