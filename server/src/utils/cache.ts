import NodeCache from 'node-cache';

// Initialize cache with 1 hour (3600 seconds) standard TTL
export const analysisCache = new NodeCache({ stdTTL: 3600 });
