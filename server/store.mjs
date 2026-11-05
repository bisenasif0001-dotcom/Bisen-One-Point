import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, createHash, createCipheriv, createDecipheriv } from 'node:crypto';

export const hash=value=>createHash('sha256').update(String(value)).digest('hex');
export function openStore(directory){
  mkdirSync(directory,{recursive:true,mode:0o700});
  const keyPath=join(directory,'master.key');
  if(!existsSync(keyPath)&&existsSync(join(directory,'studio.sqlite')))throw new Error('Restore the original master.key before opening this studio database.');
  if(!existsSync(keyPath))writeFileSync(keyPath,randomBytes(32),{mode:0o600,flag:'wx'});
  const key=readFileSync(keyPath);
  if(key.length!==32)throw new Error('The studio encryption key is invalid. Restore the original master.key.');
  const db=new DatabaseSync(join(directory,'studio.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS admin(id INTEGER PRIMARY KEY CHECK(id=1),username TEXT NOT NULL,hash TEXT NOT NULL,salt TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS orders(reference TEXT PRIMARY KEY,access_hash TEXT NOT NULL,access_secret TEXT NOT NULL,idempotency TEXT UNIQUE,request_hash TEXT NOT NULL,data TEXT NOT NULL,created TEXT NOT NULL,updated TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS gateway_settings(id INTEGER PRIMARY KEY AUTOINCREMENT,secret TEXT NOT NULL,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS attempts(id TEXT PRIMARY KEY,reference TEXT NOT NULL REFERENCES orders(reference),amount INTEGER NOT NULL,currency TEXT NOT NULL,settings_id INTEGER NOT NULL REFERENCES gateway_settings(id),payment_id TEXT UNIQUE,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS webhook_events(body_hash TEXT PRIMARY KEY,event_id TEXT UNIQUE,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,reference TEXT,action TEXT NOT NULL,actor TEXT NOT NULL,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS business_settings(id INTEGER PRIMARY KEY CHECK(id=1),value TEXT NOT NULL,updated TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS order_files(id TEXT PRIMARY KEY,reference TEXT NOT NULL REFERENCES orders(reference),name TEXT NOT NULL,mime TEXT NOT NULL,bytes INTEGER NOT NULL,sha256 TEXT NOT NULL,label TEXT NOT NULL,source_id TEXT NOT NULL,kind TEXT NOT NULL,case_id TEXT NOT NULL,created TEXT NOT NULL,purged_at TEXT);
    CREATE INDEX IF NOT EXISTS files_by_order ON order_files(reference,created);
    CREATE INDEX IF NOT EXISTS order_updated ON orders(updated DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS attempt_per_settings ON attempts(reference,settings_id);`);
  const encrypt=value=>{const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);const data=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),data]).toString('base64');};
  const decrypt=value=>{const bytes=Buffer.from(value,'base64'),cipher=createDecipheriv('aes-256-gcm',key,bytes.subarray(0,12));cipher.setAuthTag(bytes.subarray(12,28));return JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)),cipher.final()]).toString());};
  const get=reference=>{const row=db.prepare('SELECT * FROM orders WHERE reference=?').get(reference);return row?{row,order:JSON.parse(row.data)}:null;};
  const audit=(reference,action,actor)=>db.prepare('INSERT INTO audit(reference,action,actor,created) VALUES(?,?,?,?)').run(reference,action,actor,new Date().toISOString());
  const save=order=>{order.updatedAt=new Date(Math.max(Date.now(),(Date.parse(order.updatedAt)||0)+1)).toISOString();db.prepare('UPDATE orders SET data=?,updated=? WHERE reference=?').run(JSON.stringify(order),order.updatedAt,order.reference);return order;};
  const transaction=fn=>{db.exec('BEGIN IMMEDIATE');try{const value=fn();db.exec('COMMIT');return value;}catch(error){db.exec('ROLLBACK');throw error;}};
  return {db,encrypt,decrypt,get,save,audit,transaction,close:()=>db.close()};
}
