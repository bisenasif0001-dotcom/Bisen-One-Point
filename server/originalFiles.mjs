import { mkdirSync, writeFileSync, readFileSync, unlinkSync, existsSync, statfsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { randomBytes, createHash } from 'node:crypto';
import { ApiError, cleanText } from './pricing.mjs';
import { ORDER_FILE_RULES } from '../src/data/orderFiles.js';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export function fileType(bytes) {
  if (bytes.length > 3 && bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return 'image/jpeg';
  if (bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (bytes.length > 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (bytes.length > 5 && bytes.toString('ascii', 0, 5) === '%PDF-') return 'application/pdf';
  return '';
}
export function createOriginalStorage(store, directory, { maxStorageBytes = 5 * 1024 ** 3 } = {}) {
  const root = resolve(directory, 'originals');
  mkdirSync(root, { recursive: true, mode: 0o700 });
  const { db, transaction, get, save, audit } = store;
  const location = id => { if (!/^[a-f0-9]{32}$/.test(id)) throw new ApiError(404, 'File not found.'); const path = resolve(root, `${id}.bin`); if (!path.startsWith(root + sep)) throw new ApiError(404, 'File not found.'); return path; };
  const list = reference => db.prepare('SELECT id,name,mime,bytes,label,source_id AS sourceId,kind,case_id AS caseId,created,purged_at AS purgedAt FROM order_files WHERE reference=? ORDER BY created').all(reference);
  function add(reference, bytes, { name, label = '', sourceId = '', kind = 'original', caseId = '' }) {
    // Control characters and path separators must never reach a download filename.
    // eslint-disable-next-line no-control-regex
    name = cleanText(name, 180).replace(/[\\/\x00-\x1f\x7f]/g, '_'); label = cleanText(label, 240); sourceId = cleanText(sourceId, 100);
    const mime = fileType(bytes), extensions = { 'image/jpeg': /\.jpe?g$/i, 'image/png': /\.png$/i, 'image/webp': /\.webp$/i, 'application/pdf': /\.pdf$/i };
    if (!bytes.length || bytes.length > ORDER_FILE_RULES.maxFileBytes) throw new ApiError(413, 'Choose a non-empty original file up to 20 MB.');
    if (!mime || !extensions[mime].test(name)) throw new ApiError(400, 'Use an actual JPG, PNG, WebP or PDF file with a matching filename.');
    if (!['original', 'proof', 'evidence'].includes(kind)) throw new ApiError(400, 'Choose a supported file purpose.');
    const sha256 = digest(bytes);
    return transaction(() => {
      const duplicate = db.prepare('SELECT id FROM order_files WHERE reference=? AND sha256=? AND name=? AND label=? AND kind=? AND case_id=? AND purged_at IS NULL').get(reference, sha256, name, label, kind, caseId);
      if (duplicate) return { file: list(reference).find(file => file.id === duplicate.id), duplicate: true };
      const totals = db.prepare('SELECT count(*) AS count,coalesce(sum(bytes),0) AS bytes FROM order_files WHERE reference=? AND purged_at IS NULL').get(reference);
      if (totals.count >= ORDER_FILE_RULES.maxFiles || totals.bytes + bytes.length > ORDER_FILE_RULES.maxOrderBytes) throw new ApiError(413, 'This order has reached its file limit. Contact the studio for a larger batch.');
      const stored = db.prepare('SELECT coalesce(sum(bytes),0) AS bytes FROM order_files WHERE purged_at IS NULL').get().bytes;
      const disk = statfsSync(root);
      if (stored + bytes.length > maxStorageBytes || Number(disk.bavail) * Number(disk.bsize) < bytes.length + 256 * 1024 ** 2) throw new ApiError(507, 'File storage is full. Please contact the studio to share this file another way.');
      const id = randomBytes(16).toString('hex'), path = location(id), created = new Date().toISOString();
      writeFileSync(path, bytes, { flag: 'wx', mode: 0o600 });
      try {
        db.prepare('INSERT INTO order_files(id,reference,name,mime,bytes,sha256,label,source_id,kind,case_id,created) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id, reference, name, mime, bytes.length, sha256, label, sourceId, kind, caseId, created);
        const order = get(reference).order;
        if (kind === 'original') order.filesReviewed = false;
        delete order.filesPurgedAt;
        order.history.push({ title: kind === 'proof' ? 'Studio proof uploaded' : kind === 'evidence' ? 'Support evidence received' : 'Original file received', note: label || name, at: created });
        save(order); audit(reference, `${kind} file stored (${bytes.length} bytes)`, kind === 'proof' ? 'studio' : 'customer');
      } catch (error) { unlinkSync(path); throw error; }
      return { file: list(reference).find(file => file.id === id), duplicate: false };
    });
  }
  function download(reference, id) {
    const file = db.prepare('SELECT * FROM order_files WHERE id=? AND reference=? AND purged_at IS NULL').get(id, reference);
    if (!file || !existsSync(location(id))) throw new ApiError(404, 'This file is unavailable or has reached its retention period.');
    const bytes = readFileSync(location(id));
    if (bytes.length !== file.bytes || digest(bytes) !== file.sha256) throw new ApiError(409, 'File integrity check failed. Contact the studio.');
    return { file, bytes };
  }
  function purge(reference, reason) {
    const files = db.prepare('SELECT id FROM order_files WHERE reference=? AND purged_at IS NULL').all(reference);
    // IDs are server-generated; every unlink is confined to this private originals directory.
    for (const file of files) { const path = location(file.id); if (existsSync(path)) unlinkSync(path); db.prepare('UPDATE order_files SET purged_at=? WHERE id=?').run(new Date().toISOString(), file.id); }
    if (files.length) audit(reference, `Working files removed: ${reason}`, 'maintenance');
    return files.length;
  }
  return { root, list, add, download, purge };
}
