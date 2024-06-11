'use strict';

import facts from '../../backend/facts';

export default async function handler(req, res) {
  try {
    const result = await facts(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
};