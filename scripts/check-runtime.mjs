const major = Number.parseInt(process.versions.node.split('.')[0] ?? '', 10);
const supported = [24, 25];

if (!supported.includes(major)) {
  console.error(`
Unsupported Node.js version: ${process.version}

BriefForge uses the native node:sqlite module, which is available in Node.js:
${supported.join(', ')}

Use Node.js 24 LTS for local development.
`);
  process.exit(1);
}
