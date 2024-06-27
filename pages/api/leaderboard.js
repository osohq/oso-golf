'use strict';

import leaderboard from '../../backend/leaderboard';

export default async function handler(req, res) {
  try {
    const result = await leaderboard();

    return res.status(200).json(result);
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
}
