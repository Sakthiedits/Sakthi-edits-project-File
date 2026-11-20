#!/usr/bin/env node
/**
 * Generate admin password hash for Sakthiedits
 * Usage: node scripts/generate-hash.js
 */

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function main() {
  console.log('\n=== Sakthiedits Admin Password Hash Generator ===\n');

  const password = await question('Enter admin password: ');
  if (!password || password.length < 8) {
    console.error('Error: Password must be at least 8 characters');
    rl.close();
    process.exit(1);
  }

  const secret = await question('Enter SESSION_SECRET (or press Enter to generate one): ');
  const sessionSecret = secret || crypto.randomBytes(32).toString('hex');

  const hash = crypto.createHash('sha256').update(`${password}:${sessionSecret}`).digest('hex');

  console.log('\n=== Values for worker/.dev.vars ===\n');
  if (!secret) {
    console.log(`SESSION_SECRET=${sessionSecret}`);
  }
  console.log(`ADMIN_PASSWORD_HASH=sha256:${hash}`);
  console.log('\n=== For production (wrangler secrets) ===');
  console.log('Run: npx wrangler secret put ADMIN_PASSWORD_HASH');
  if (!secret) {
    console.log('Run: npx wrangler secret put SESSION_SECRET');
  }
  console.log(`\nPaste when prompted: sha256:${hash}`);
  console.log('\n⚠️  Keep these values secure. Never commit to git.');

  rl.close();
}

main().catch(console.error);
