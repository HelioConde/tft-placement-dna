(() => {
  "use strict";
  const I=12000,V="version.json",P="__v";
  if(new Set(["localhost","127.0.0.1","::1"]).has(location.hostname))return;
  let current=null,checking=false,reloading=false;
  async function read(){
    const response=await fetch(V+"?_="+Date.now(),{cache:"no-store",credentials:"same-origin"});
    if(!response.ok)throw new Error("version-"+response.status);
    const payload=await response.json();
    return String(payload?.sha||payload?.version||"").trim();
  }
  function notice(){
    if(document.getElementById("live-update-notice"))return;
    const el=document.createElement("div");el.id="live-update-notice";el.setAttribute("role","status");el.setAttribute("aria-live","polite");
    el.textContent="Nova versão publicada. Atualizando automaticamente…";
    Object.assign(el.style,{position:"fixed",left:"50%",bottom:"18px",transform:"translateX(-50%)",zIndex:"2147483647",padding:"10px 14px",borderRadius:"999px",background:"#101722",color:"#fff",font:"600 12px system-ui",boxShadow:"0 10px 35px rgba(0,0,0,.3)"});
    document.body.appendChild(el);
  }
  async function refresh(next){
    if(reloading)return;reloading=true;notice();
    try{if("caches"in window){const keys=await caches.keys();await Promise.allSettled(keys.map(key=>caches.delete(key)));}}catch{}
    await new Promise(resolve=>setTimeout(resolve,650));
    const url=new URL(location.href);url.searchParams.set(P,next.slice(0,16)||Date.now().toString());location.replace(url.toString());
  }
  async function check(){
    if(checking||reloading)return;checking=true;
    try{const next=await read();if(!next)return;if(current===null)current=next;else if(next!==current)await refresh(next);}catch{}finally{checking=false;}
  }
  const url=new URL(location.href);if(url.searchParams.has(P)){url.searchParams.delete(P);history.replaceState(null,"",url.pathname+url.search+url.hash);}
  check();setInterval(check,I);addEventListener("focus",check);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")check();});
})();
