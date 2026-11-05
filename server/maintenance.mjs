import { DatabaseSync, backup as sqliteBackup } from 'node:sqlite';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync, rmSync, unlinkSync, openSync, closeSync, renameSync } from 'node:fs';
import { resolve, join, sep, basename } from 'node:path';
import { createHash, createDecipheriv, randomBytes } from 'node:crypto';
import { readBusinessRules } from './businessRules.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const idPattern = /^aln-backup-\d{14}-[a-f0-9]{8}$/;
const within = (path, parent) => resolve(path).startsWith(resolve(parent) + sep);
function safeRemoveTemporary(path, parent) {
  if (!within(path, parent) || !/^(?:\.partial-|restore-check-)[a-f0-9]+$/.test(basename(path))) throw new Error('Refusing to remove an unverified maintenance path.');
  rmSync(path, { recursive: true, force: true });
}
function assertPrivate(path) {
  for (const folder of ['public', 'dist', 'node_modules', '.git', '.codex', '.agents']) if (resolve(path) === resolve(folder) || within(path, folder)) throw new Error('Maintenance storage must be outside website/public and source-control folders.');
}
function validateDatabase(file, key) {
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    if (db.prepare('PRAGMA quick_check').get().quick_check !== 'ok') throw new Error('Database integrity check failed.');
    const decrypt = value => { const bytes = Buffer.from(value, 'base64'), cipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(0, 12)); cipher.setAuthTag(bytes.subarray(12, 28)); JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]).toString()); };
    for (const row of db.prepare('SELECT access_secret AS secret FROM orders UNION ALL SELECT secret FROM gateway_settings').all()) decrypt(row.secret);
    return { orders: db.prepare('SELECT count(*) AS n FROM orders').get().n, files: db.prepare('SELECT count(*) AS n FROM order_files WHERE purged_at IS NULL').get().n };
  } finally { db.close(); }
}
export function verifyBackup(snapshot) {
  const manifest = JSON.parse(readFileSync(join(snapshot, 'manifest.json'), 'utf8'));
  if (manifest.schema !== 1 || !idPattern.test(manifest.id) || !Array.isArray(manifest.files)) throw new Error('Unsupported backup manifest.');
  for (const file of manifest.files) {
    if (!/^(?:studio\.sqlite|master\.key|originals\/[a-f0-9]{32}\.bin)$/.test(file.path)) throw new Error('Unsafe backup entry.');
    const path = resolve(snapshot, file.path);
    if (!within(path, snapshot) || sha(readFileSync(path)) !== file.sha256) throw new Error('Backup checksum verification failed.');
  }
  if (!manifest.files.some(file => file.path === 'master.key') || !manifest.files.some(file => file.path === 'studio.sqlite')) throw new Error('Backup needs both the database and its matching key.');
  const key = readFileSync(join(snapshot, 'master.key'));
  if (key.length !== 32) throw new Error('Backup encryption key is invalid.');
  const counts = validateDatabase(join(snapshot, 'studio.sqlite'), key);
  if (counts.files !== manifest.files.filter(file => file.path.startsWith('originals/')).length) throw new Error('Backup original-file inventory is incomplete.');
  return { id: manifest.id, createdAt: manifest.createdAt, ...counts, bytes: manifest.files.reduce((sum, file) => sum + file.bytes, 0) };
}
export async function createBackup(directory, backupRoot = resolve(directory, 'backups')) {
  directory = resolve(directory); backupRoot = resolve(backupRoot); assertPrivate(backupRoot);
  mkdirSync(backupRoot, { recursive: true, mode: 0o700 });
  const id = `aln-backup-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}-${randomBytes(4).toString('hex')}`;
  const temporary = join(backupRoot, `.partial-${randomBytes(8).toString('hex')}`), destination = join(backupRoot, id);
  mkdirSync(temporary, { mode: 0o700 });
  let source;
  try {
    source = new DatabaseSync(join(directory, 'studio.sqlite'), { readOnly: true });
    await sqliteBackup(source, join(temporary, 'studio.sqlite')); source.close(); source = null;
    copyFileSync(join(directory, 'master.key'), join(temporary, 'master.key'));
    const snapshot = new DatabaseSync(join(temporary, 'studio.sqlite'));
    let files;
    try { snapshot.exec('PRAGMA journal_mode=DELETE; DELETE FROM sessions;'); files = snapshot.prepare('SELECT id,bytes,sha256 FROM order_files WHERE purged_at IS NULL').all(); } finally { snapshot.close(); }
    mkdirSync(join(temporary, 'originals'), { mode: 0o700 });
    for (const file of files) {
      if (!/^[a-f0-9]{32}$/.test(file.id)) throw new Error('Invalid original-file inventory.');
      const bytes = readFileSync(join(directory, 'originals', `${file.id}.bin`));
      if (bytes.length !== file.bytes || sha(bytes) !== file.sha256) throw new Error('An original file failed its integrity check.');
      writeFileSync(join(temporary, 'originals', `${file.id}.bin`), bytes, { flag: 'wx', mode: 0o600 });
    }
    const entries = ['studio.sqlite', 'master.key', ...files.map(file => `originals/${file.id}.bin`)].map(path => { const bytes = readFileSync(join(temporary, path)); return { path, bytes: bytes.length, sha256: sha(bytes) }; });
    const retentionDb = new DatabaseSync(join(temporary, 'studio.sqlite'), { readOnly: true });
    let retentionDays; try { const current=readBusinessRules(retentionDb).retention.backupDays; const previous=retentionDb.prepare("SELECT min(json_extract(data,'$.retention.backupDays')) AS n FROM orders").get().n; retentionDays=Math.min(current,previous||current); } finally { retentionDb.close(); }
    writeFileSync(join(temporary, 'manifest.json'), JSON.stringify({ schema: 1, id, createdAt: new Date().toISOString(), retentionDays, files: entries }, null, 2), { mode: 0o600, flag: 'wx' });
    verifyBackup(temporary);
    if (!within(temporary, backupRoot) || !within(destination, backupRoot) || !idPattern.test(basename(destination)) || existsSync(destination)) throw new Error('Unsafe backup destination.');
    renameSync(temporary, destination);
    return verifyBackup(destination);
  } finally { source?.close(); safeRemoveTemporary(temporary, backupRoot); }
}
export function restoreBackup(snapshot, destination) {
  snapshot = resolve(snapshot); destination = resolve(destination); assertPrivate(destination);
  if (existsSync(destination) || within(destination, snapshot)) throw new Error('Restore needs a new, empty destination path. Existing data is never overwritten.');
  const verified = verifyBackup(snapshot), manifest = JSON.parse(readFileSync(join(snapshot, 'manifest.json'), 'utf8'));
  mkdirSync(destination, { recursive: true, mode: 0o700 }); mkdirSync(join(destination, 'originals'), { mode: 0o700 });
  for (const path of ['manifest.json', ...manifest.files.map(file => file.path)]) copyFileSync(join(snapshot, path), join(destination, path));
  verifyBackup(destination);
  return verified;
}
export function restoreDrill(snapshot, backupRoot) {
  const target = join(resolve(backupRoot), `restore-check-${randomBytes(8).toString('hex')}`);
  try { const result = restoreBackup(snapshot, target); return { ...result, verifiedAt: new Date().toISOString(), restored: true }; }
  finally { if (existsSync(target)) safeRemoveTemporary(target, backupRoot); }
}
export function createMaintenance(store, originals, directory, { backupRoot = resolve(directory, 'backups') } = {}) {
  directory = resolve(directory); backupRoot = resolve(backupRoot); assertPrivate(backupRoot);
  let busy = false, pending = Promise.resolve();
  const list = () => existsSync(backupRoot) ? readdirSync(backupRoot).filter(id => idPattern.test(id) && existsSync(join(backupRoot, id, 'manifest.json'))).sort().reverse().map(id => { const data = JSON.parse(readFileSync(join(backupRoot, id, 'manifest.json'), 'utf8')); return { id, createdAt: data.createdAt, bytes: data.files.reduce((sum, file) => sum + file.bytes, 0), retentionDays:data.retentionDays||30, fileCount: data.files.filter(file => file.path.startsWith('originals/')).length }; }) : [];
  async function exclusive(fn) {
    if (busy) throw new Error('Maintenance is already running. Please wait.');
    const lock = join(directory, '.maintenance.lock');
    let fd;
    try { fd = openSync(lock, 'wx', 0o600); } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let owner;
      try { owner = JSON.parse(readFileSync(lock, 'utf8')); } catch { /* Legacy / incomplete locks need an operator check. */ }
      let alive = true;
      if (Number.isSafeInteger(owner?.pid) && owner.pid > 0) {
        try { process.kill(owner.pid, 0); } catch (cause) { if (cause.code === 'ESRCH') alive = false; }
      }
      if (alive) throw new Error('Another maintenance process is running. Check the server before removing a stale maintenance lock.');
      unlinkSync(lock);
      fd = openSync(lock, 'wx', 0o600);
    }
    writeFileSync(fd, JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }));
    busy = true;
    let finish;
    pending = new Promise(resolve => { finish = resolve; });
    try { return await fn(); } finally { closeSync(fd); try { unlinkSync(lock); } finally { busy = false; finish(); } }
  }
  function redact(value) {
    if (typeof value === 'string' && /^(data:image|blob:)/.test(value)) return '';
    if (Array.isArray(value)) return value.map(redact);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redact(item)]));
    return value;
  }
  function removeOrderFiles(order, reason) {
    if (['printing','ready','dispatched'].includes(order.status)) throw new Error('Resolve the active production/delivery stage before deleting working files.');
    if (order.legalHold) throw new Error('This order is on a retention hold. Review it before deleting files.');
    const removed = originals.purge(order.reference, reason), clean = redact(order);
    clean.filesPurgedAt = new Date().toISOString();
    clean.history.push({ title: 'Working print files removed', note: reason, at: clean.filesPurgedAt });
    store.save(clean); return removed;
  }
  function clean(now = new Date()) {
    const rules = readBusinessRules(store.db); let filesRemoved = 0, backupsRemoved = 0;
    for (const row of store.db.prepare("SELECT data FROM orders WHERE json_extract(data,'$.status')='delivered'").all()) {
      const order = JSON.parse(row.data), delivered = order.deliveredAt || order.history.filter(event => event.status === 'delivered').at(-1)?.at;
      if (!delivered || order.legalHold || order.filesPurgedAt || order.requests?.some(request => !['resolved', 'declined'].includes(request.status))) continue;
      if (now - new Date(delivered) >= (order.retention?.workingDaysAfterDelivery || rules.retention.workingDaysAfterDelivery) * 86400000) filesRemoved += removeOrderFiles(order, 'Delivered-order file retention period completed.');
    }
    for (const snapshot of list()) if (now - new Date(snapshot.createdAt) >= Math.min(snapshot.retentionDays,rules.retention.backupDays) * 86400000) {
      const target = resolve(backupRoot, snapshot.id);
      if (!within(target, backupRoot) || !idPattern.test(basename(target))) throw new Error('Unsafe backup cleanup path.');
      rmSync(target, { recursive: true }); backupsRemoved++;
    }
    return { filesRemoved, backupsRemoved, checkedAt: now.toISOString() };
  }
  return { list, busy: () => busy, idle: () => pending,
    backup: () => exclusive(async () => { clean(); const result = await createBackup(directory, backupRoot); store.audit(null, 'Private backup created and verified', 'maintenance'); return result; }),
    verify: id => exclusive(() => { if (!idPattern.test(id)) throw new Error('Choose a valid backup.'); const result = restoreDrill(join(backupRoot, id), backupRoot); writeFileSync(join(backupRoot, 'last-restore-check.json'), JSON.stringify(result), { mode: 0o600 }); return result; }),
    cleanup: now => exclusive(() => clean(now)),
    deleteApproved: order => exclusive(() => removeOrderFiles(order, 'Customer file-deletion request approved by the studio.')),
    status: () => ({ backups: list().slice(0, 20), lastRestoreCheck: existsSync(join(backupRoot, 'last-restore-check.json')) ? JSON.parse(readFileSync(join(backupRoot, 'last-restore-check.json'), 'utf8')) : null, retention: readBusinessRules(store.db).retention, busy }),
  };
}
