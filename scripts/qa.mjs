import fs from "node:fs";

const required=[
  "index.html","style.css","app.js","backend-config.js",
  "sobre.html","privacidade.html","termos.html","robots.txt","sitemap.xml"
];
for(const file of required){
  if(!fs.existsSync(file))throw new Error("Missing required file: "+file);
}
const html=fs.readFileSync("index.html","utf8");
for(const marker of ['id="lookup-form"','id="placement-chart"','id="difference-list"','src="backend-config.js"','src="app.js"']){
  if(!html.includes(marker))throw new Error("Missing index invariant: "+marker);
}
const backend=fs.readFileSync("backend-config.js","utf8");
if(!backend.includes("riot-legacy-tft-profile"))throw new Error("Expected gamer TFT backend.");
const app=fs.readFileSync("app.js","utf8");
for(const marker of ["allFeatureRates","groupStats","confidence","compLabel"]){
  if(!app.includes(marker))throw new Error("Missing analysis invariant: "+marker);
}
console.log("TFT Placement DNA static QA passed.");
