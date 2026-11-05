import { resolve } from 'node:path';
import { openStore } from './store.mjs';
import { createOriginalStorage } from './originalFiles.mjs';
import { createMaintenance, restoreBackup, verifyBackup } from './maintenance.mjs';

try { process.loadEnvFile(); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const [command, ...args] = process.argv.slice(2);
const option = name => { const index = args.indexOf(name); return index < 0 ? '' : args[index + 1] || ''; };
let store;
try {
  const directory = resolve(process.env.DATA_DIR || '.studio-data');
  if (command === 'restore') {
    const from = option('--from'), to = option('--to');
    if (!from || !to) throw new Error('Use restore --from <backup-folder> --to <new-private-folder>.');
    const result = restoreBackup(from, to);
    store = openStore(resolve(to));
    const files = createOriginalStorage(store, resolve(to));
    const retention = await createMaintenance(store, files, resolve(to)).cleanup();
    console.log(JSON.stringify({ restored: true, ...result, retention, destination: resolve(to) }, null, 2));
  } else if (command === 'verify') {
    if (!option('--from')) throw new Error('Use verify --from <backup-folder>.');
    console.log(JSON.stringify({ verified: true, ...verifyBackup(resolve(option('--from'))) }, null, 2));
  } else if (['backup', 'retention'].includes(command)) {
    store = openStore(directory);
    const files = createOriginalStorage(store, directory);
    const maintenance = createMaintenance(store, files, directory, { backupRoot: process.env.BACKUP_DIR || undefined });
    const result = command === 'backup' ? await maintenance.backup() : await maintenance.cleanup();
    console.log(JSON.stringify({ [command]: result }, null, 2));
  } else throw new Error('Choose backup, verify --from, restore --from --to, or retention.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally { store?.close(); }
