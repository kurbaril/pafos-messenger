#!/usr/bin/env node

/**
 * Database migration script
 * Run: node scripts/migrate.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

const execAsync = promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg) => console.log(`\n${colors.magenta}📌 ${msg}${colors.reset}\n`)
};

async function runCommand(command, cwd = 'packages/backend') {
  log.info(`Running: ${command}`);
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    return true;
  } catch (error) {
    log.error(`Command failed: ${error.message}`);
    return false;
  }
}

async function generatePrisma() {
  step('Generating Prisma client...');
  return await runCommand('npx prisma generate');
}

async function pushSchema() {
  log.warn('This will push the schema to the database (non-destructive)');
  const answer = await question('Continue? (y/N): ');
  
  if (answer.toLowerCase() !== 'y') {
    log.info('Skipped');
    return true;
  }
  
  return await runCommand('npx prisma db push');
}

async function migrateDev() {
  log.warn('This will create a new migration and apply it');
  const name = await question('Migration name (e.g., add_user_fields): ');
  
  if (!name) {
    log.error('Migration name is required');
    return false;
  }
  
  return await runCommand(`npx prisma migrate dev --name ${name}`);
}

async function resetDatabase() {
  log.warn('⚠️  This will DELETE ALL DATA in the database! ⚠️');
  const confirm = await question('Type "DELETE ALL DATA" to confirm: ');
  
  if (confirm !== 'DELETE ALL DATA') {
    log.info('Reset cancelled');
    return false;
  }
  
  return await runCommand('npx prisma migrate reset --force');
}

async function seedDatabase() {
  step('Seeding database...');
  return await runCommand('npx prisma db seed');
}

async function openStudio() {
  step('Opening Prisma Studio...');
  console.log('Prisma Studio will open in your browser. Press Ctrl+C to stop.');
  await runCommand('npx prisma studio');
  return true;
}

async function showHelp() {
  console.log(`
${colors.cyan}PaFos Database Migration Tool${colors.reset}

Usage: node scripts/migrate.js [command]

Commands:
  generate    Generate Prisma client
  push        Push schema to database (non-destructive)
  migrate     Create and apply a new migration
  reset       Reset database (WARNING: deletes all data)
  seed        Seed database with initial data
  studio      Open Prisma Studio
  all         Run all: generate → push
  help        Show this help

Examples:
  node scripts/migrate.js generate
  node scripts/migrate.js migrate
  node scripts/migrate.js studio
  `);
}

async function main() {
  const command = process.argv[2];
  
  if (!command || command === 'help') {
    showHelp();
    process.exit(0);
  }
  
  console.log(`\n${colors.cyan}=== PaFos Database Migration ===${colors.reset}\n`);
  
  let success = false;
  
  switch (command) {
    case 'generate':
      success = await generatePrisma();
      break;
      
    case 'push':
      success = await pushSchema();
      break;
      
    case 'migrate':
      success = await migrateDev();
      break;
      
    case 'reset':
      success = await resetDatabase();
      break;
      
    case 'seed':
      success = await seedDatabase();
      break;
      
    case 'studio':
      success = await openStudio();
      break;
      
    case 'all':
      success = await generatePrisma();
      if (success) success = await pushSchema();
      break;
      
    default:
      log.error(`Unknown command: ${command}`);
      showHelp();
      success = false;
  }
  
  if (success) {
    log.success('Operation completed successfully!');
  } else {
    log.error('Operation failed!');
    process.exit(1);
  }
  
  rl.close();
}

main().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});