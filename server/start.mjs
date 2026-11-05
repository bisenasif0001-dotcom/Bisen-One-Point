import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { createStudioService } from './app.mjs';
import { createStaticHandler } from './static.mjs';
import { access } from 'node:fs/promises';

try{process.loadEnvFile();}catch(error){if(error.code!=='ENOENT')throw error;}
await access(resolve('dist/index.html'));
const api=createStudioService({directory:process.env.DATA_DIR||resolve('.studio-data'),production:true});
const serve=createStaticHandler({publicOrigin:process.env.PUBLIC_ORIGIN,indexable:process.env.SITE_INDEXABLE==='true'});
await api.maintenance.cleanup();
const backupHours=Math.max(1,Number(process.env.BACKUP_INTERVAL_HOURS)||24);
async function keepRecoveryCopy(){
  if(api.maintenance.busy())return;
  const latest=api.maintenance.list()[0];
  if(!latest||Date.now()-new Date(latest.createdAt)>=backupHours*3600000){try{await api.maintenance.backup();console.log('Private studio backup verified.');}catch{console.error('Studio backup failed. Review the private storage and run a restore check.');}}
}
await keepRecoveryCopy();
const maintenanceTimer=setInterval(()=>{if(!api.maintenance.busy())api.maintenance.cleanup().then(keepRecoveryCopy).catch(()=>console.error('Studio retention check failed. Review maintenance in the studio panel.'));},3600000);
maintenanceTimer.unref();
const server=createServer((req,res)=>api.handler(req,res,()=>serve(req,res)));
server.listen(Number(process.env.PORT)||3000,process.env.HOST||'127.0.0.1',()=>console.log(`AL-NOOR studio server ready on port ${Number(process.env.PORT)||3000}`));
function close(){clearInterval(maintenanceTimer);server.close(()=>{api.close();process.exit(0);});}
process.on('SIGTERM',close);process.on('SIGINT',close);
