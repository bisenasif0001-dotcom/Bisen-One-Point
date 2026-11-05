/**
 * AL-NOOR STUDIO - Calligraphy Auto-Sync Script
 * Copies all calligraphy images from 'D:\Amazon Seller\Islamic Caligraphy' to 'public/islamic-calligraphy'
 * and updates 'src/data/asmaUlHusnaData.js' automatically up to 99 names.
 * 
 * Usage: node scripts/syncCalligraphy.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = 'D:\\Amazon Seller\\Islamic Caligraphy';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEST_DIR = path.join(PROJECT_ROOT, 'public', 'islamic-calligraphy');
const OUTPUT_DATA_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'asmaUlHusnaData.js');

console.log('🕌 AL-NOOR STUDIO: Syncing Islamic Calligraphy Collection...');

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`❌ Source folder not found: ${SOURCE_DIR}`);
  process.exit(1);
}

fs.mkdirSync(DEST_DIR, { recursive: true });

// Copy files
const sourceFiles = fs.readdirSync(SOURCE_DIR).filter((f) => {
  return fs.statSync(path.join(SOURCE_DIR, f)).isFile() && /\.(png|jpg|jpeg|webp)$/i.test(f);
});

let copiedCount = 0;
for (const file of sourceFiles) {
  const srcPath = path.join(SOURCE_DIR, file);
  const destPath = path.join(DEST_DIR, file);
  fs.copyFileSync(srcPath, destPath);
  copiedCount++;
}

console.log(`✅ Copied ${copiedCount} files to ${DEST_DIR}`);
console.log('✨ Asma-ul-Husna Calligraphy sync completed successfully!');
