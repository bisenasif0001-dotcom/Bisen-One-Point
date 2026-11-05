import { createStudioService } from './app.mjs';

export default function studioApiPlugin(){
  let api;
  const dispose=()=>{if(api){api.close();api=null;}};
  return {name:'alnoor-studio-api',configureServer(server){
    api=createStudioService({production:false,directory:process.env.DATA_DIR||undefined});
    const service=api;
    server.middlewares.use((req,res,next)=>service.handler(req,res,next));
    server.httpServer?.once('close',dispose);
  },closeBundle:dispose};
}
