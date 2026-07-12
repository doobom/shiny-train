const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts.build = "node -e \"const fs=require('fs'); ['.env','.env.local','.env.production'].forEach(f=>{try{if(fs.existsSync(f)){let c=fs.readFileSync(f,'utf8');c=c.replace(/^\\s*NODE_ENV\\s*=.*$/gm,'');fs.writeFileSync(f,c);}}catch(e){}} )\" && vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs";

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
