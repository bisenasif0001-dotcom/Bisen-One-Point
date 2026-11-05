import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { createStudioService } from './app.mjs';
import { createStaticHandler } from './static.mjs';

try{process.loadEnvFile();}catch(error){if(error.code!=='ENOENT')throw error;}
const api=createStudioService({directory:process.env.DATA_DIR||resolve('.studio-data'),production:true});
const serve=createStaticHandler({publicOrigin:process.env.PUBLIC_ORIGIN,indexable:process.env.SITE_INDEXABLE==='true'});
const server=createServer((req,res)=>api.handler(req,res,()=>serve(req,res)));
server.listen(Number(process.env.PORT)||3000,process.env.HOST||'127.0.0.1',()=>console.log(`AL-NOOR studio server ready on port ${Number(process.env.PORT)||3000}`));
function close(){server.close(()=>{api.close();process.exit(0);});}
process.on('SIGTERM',close);process.on('SIGINT',close);
