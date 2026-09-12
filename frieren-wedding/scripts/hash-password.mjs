import { randomBytes, scryptSync } from 'node:crypto';

const password = process.argv.slice(2).find((argument) => argument !== '--');

if (!password) {
  console.error('Usage: pnpm admin:hash -- your-password');
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
console.log(`scrypt$${salt}$${scryptSync(password, salt, 32).toString('hex')}`);
