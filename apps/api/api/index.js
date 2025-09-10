
const handler = require('./src/index.ts').default || require('./src/index.ts');

// Export for Vercel Node runtime
module.exports = handler;
