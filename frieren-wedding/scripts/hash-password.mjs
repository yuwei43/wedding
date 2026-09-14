import { randomBytes, scryptSync } from 'node:crypto';

const args = process.argv.slice(2);
const password = args.find((argument) => argument !== '--' && argument !== '--env');

if (!password) {
  console.error('Usage: pnpm admin:hash -- [--env] your-password');
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const hash = `scrypt$${salt}$${scryptSync(password, salt, 32).toString('hex')}`;
// Next expands $variables in .env files, including quoted values.
console.log(args.includes('--env') ? `ADMIN_PASSWORD_HASH=${hash.replaceAll('$', '\\$')}` : hash);
