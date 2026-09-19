const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '..', 'generated', 'prisma', 'index.ts');
fs.writeFileSync(target, "export * from './client';\n", 'utf8');
console.log('[fix-prisma-barrel] wrote', target);
