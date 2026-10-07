const API_TIMEOUT_MS=18000;
const LANGUAGE_KEY="tft-placement-dna:language";
const VALID_PERIODS=new Set(["week","month","set"]);

const copy={
  pt:{
    riotData:"DADOS RIOT",eyebrow:"TFT · PERFIL PESSOAL DE COLOCAÇÃO",
    heroTitle:'O que muda quando você <span>termina bem — ou afunda?</span>',
    heroText:"Compare sua própria amostra de Top 4 e Bottom 4 para encontrar padrões recorrentes de comps, unidades e augments. Correlação pessoal, não tier list.",
    riotId:"Riot ID",server:"Servidor",analyze:"Ler meu Placement DNA",howRead:"COMO O DNA É LIDO",
    top4Label:"Top 4",top4Help:"padrões das melhores partidas",bottom4Label:"Bottom 4",bottom4Help:"padrões das partidas que deram errado",
    difference:"Diferença",differenceHelp:"o que aparece mais em um grupo",loadingTitle:"Consultando seu histórico TFT…",
    loadingText:"Organizando colocações, comps, unidades e augments.",analysis:"PLACEMENT DNA",currentSet:"Set atual",
    games:"Partidas",inSample:"na amostra",average:"Média",placement:"colocação",top4:"Top 4",wins:"Vitórias",
    distributionEyebrow:"DISTRIBUIÇÃO",distributionTitle:"Suas colocações no período",topPatterns:"Quando você termina no Top 4",
    bottomPatterns:"Quando você termina no Bottom 4",level:"Nível médio",gold:"Ouro final médio",comps:"Comps",units:"Unidades",augments:"Augments",
    differenceEyebrow:"DIFERENÇAS DA SUA AMOSTRA",differenceTitle:"O que muda entre seu Top 4 e Bottom 4?",
    causality:"Isto descreve frequência na sua amostra. Não prova que uma comp, unidade ou augment causou a colocação.",
    recentEyebrow:"PARTIDAS",recentTitle:"Histórico usado nesta leitura",ad:"PUBLICIDADE",adNote:"espaço reservado · fora da análise principal",
    disclaimer:"Produto independente. Teamfight Tactics e Riot Games são marcas da Riot Games, Inc.",about:"Sobre",privacy:"Privacidade",terms:"Termos",
    invalid:"Use um Riot ID no formato Nome#TAG.",loading:"Consultando a Riot…",notFound:"Riot ID não encontrado. Confira nome, tag e servidor.",
    rate:"Limite temporário da Riot atingido. Tente novamente em instantes.",error:"Não foi possível consultar o histórico TFT agora.",
    live:"Dados Riot carregados.",stale:"Exibindo o último histórico real armazenado em cache.",empty:"Nenhuma partida TFT encontrada neste período.",
    noPattern:"Ainda não há diferença recorrente suficiente nesta amostra.",topMore:"mais no Top 4",bottomMore:"mais no Bottom 4",
    sample:(g,t,b)=>g+" partidas · "+t+" Top 4 · "+b+" Bottom 4",
    sampleLow:"Amostra pequena",sampleMedium:"Amostra moderada",sampleHigh:"Amostra forte",
    featureComp:"Comp",featureUnit:"Unidade",featureAugment:"Augment",matches:"partidas"
  },
  en:{
    riotData:"RIOT DATA",eyebrow:"TFT · PERSONAL PLACEMENT PROFILE",
    heroTitle:'What changes when you <span>finish high — or crash?</span>',
    heroText:"Compare your own Top 4 and Bottom 4 sample to find recurring patterns in comps, units and augments. Personal correlation, not a tier list.",
    riotId:"Riot ID",server:"Server",analyze:"Read my Placement DNA",howRead:"HOW DNA IS READ",
    top4Label:"Top 4",top4Help:"patterns from your best finishes",bottom4Label:"Bottom 4",bottom4Help:"patterns from games that went poorly",
    difference:"Difference",differenceHelp:"what appears more in one group",loadingTitle:"Checking your TFT history…",
    loadingText:"Organizing placements, comps, units and augments.",analysis:"PLACEMENT DNA",currentSet:"Current set",
    games:"Games",inSample:"in sample",average:"Average",placement:"placement",top4:"Top 4",wins:"Wins",
    distributionEyebrow:"DISTRIBUTION",distributionTitle:"Your placements in this period",topPatterns:"When you finish Top 4",
    bottomPatterns:"When you finish Bottom 4",level:"Average level",gold:"Average final gold",comps:"Comps",units:"Units",augments:"Augments",
    differenceEyebrow:"YOUR SAMPLE DIFFERENCES",differenceTitle:"What changes between your Top 4 and Bottom 4?",
    causality:"This describes frequency in your sample. It does not prove that a comp, unit or augment caused the placement.",
    recentEyebrow:"MATCHES",recentTitle:"History used for this read",ad:"ADVERTISEMENT",adNote:"reserved space · outside the main analysis",
    disclaimer:"Independent product. Teamfight Tactics and Riot Games are trademarks of Riot Games, Inc.",about:"About",privacy:"Privacy",terms:"Terms",
    invalid:"Use a Riot ID in Name#TAG format.",loading:"Checking Riot…",notFound:"Riot ID not found. Check name, tag and server.",
    rate:"Riot is temporarily rate-limiting requests. Try again shortly.",error:"Could not load TFT history right now.",
    live:"Riot data loaded.",stale:"Showing the most recent real history available in cache.",empty:"No TFT matches were found in this period.",
    noPattern:"This sample does not have enough recurring differences yet.",topMore:"more in Top 4",bottomMore:"more in Bottom 4",
    sample:(g,t,b)=>g+" games · "+t+" Top 4 · "+b+" Bottom 4",
    sampleLow:"Small sample",sampleMedium:"Moderate sample",sampleHigh:"Strong sample",
    featureComp:"Comp",featureUnit:"Unit",featureAugment:"Augment",matches:"games"
  }
};

let lang=localStorage.getItem(LANGUAGE_KEY)==="en"?"en":"pt";
let period="month";
let liveMatches=[];
let currentPlayer=null;

const $=selector=>document.querySelector(selector);
const t=key=>copy[lang][key]||key;
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const locale=()=>lang==="pt"?"pt-BR":"en-US";
const fmt=value=>Number(value||0).toLocaleString(locale());
const dec=value=>Number(value||0).toLocaleString(locale(),{minimumFractionDigits:1,maximumFractionDigits:1});

function parseRiotId(value){
  const raw=String(value||"").trim();
  const split=raw.lastIndexOf("#");
  if(split<=0)return null;
  const gameName=raw.slice(0,split).trim();
  const tagLine=raw.slice(split+1).trim();
  if(gameName.length<2||gameName.length>16||tagLine.length<2||tagLine.length>5)return null;
  return {gameName,tagLine};
}
function cleanName(value){
  return String(value||"")
    .replace(/^.*[\\/]/,"")
    .replace(/^TFT\d+_Items?_/i,"")
    .replace(/^TFT_Items?_/i,"")
    .replace(/^TFT\d+_/i,"")
    .replace(/^TFT_?/i,"")
    .replace(/_/g," ")
    .replace(/([a-z])([A-Z])/g,"$1 $2")
    .replace(/\s+/g," ")
    .trim()||"—";
}
function activeTraits(match){
  return (Array.isArray(match.traits)?match.traits:[])
    .filter(trait=>Number(trait?.style||0)>0||Number(trait?.tierCurrent||trait?.tier_current||0)>0)
    .sort((a,b)=>Number(b?.style||b?.tierCurrent||0)-Number(a?.style||a?.tierCurrent||0))
    .map(trait=>cleanName(trait?.name||trait?.traitName||trait))
    .filter(name=>name!=="—");
}
function compLabel(match){
  const traits=activeTraits(match).slice(0,2);
  if(traits.length)return traits.join(" + ");
  const units=(Array.isArray(match.units)?match.units:[]).slice(0,2)
    .map(unit=>cleanName(unit?.characterId||unit?.character_id||unit?.name))
    .filter(name=>name!=="—");
  return units.length?units.join(" + "):(lang==="pt"?"Composição flex":"Flexible board");
}
function unitNames(match){
  return [...new Set((Array.isArray(match.units)?match.units:[])
    .map(unit=>cleanName(unit?.characterId||unit?.character_id||unit?.name))
    .filter(name=>name!=="—"))];
}
function augmentNames(match){
  return [...new Set((Array.isArray(match.augments)?match.augments:[])
    .map(augment=>cleanName(augment?.name||augment?.displayName||augment))
    .filter(name=>name!=="—"))];
}
function matchLevel(match){
  const value=Number(match.level??match.finalLevel??match.final_level??match.participant?.level??0);
  return Number.isFinite(value)&&value>0?value:0;
}
function matchGold(match){
  const value=Number(match.goldLeft??match.gold_left??match.gold??match.participant?.goldLeft??match.participant?.gold_left??0);
  return Number.isFinite(value)&&value>=0?value:null;
}
function validMatches(){
  return liveMatches.filter(match=>{
    const placement=Number(match.placement);
    return placement>=1&&placement<=8;
  });
}
function periodMatches(){
  const rows=validMatches().slice().sort((a,b)=>Number(b.playedAt||0)-Number(a.playedAt||0));
  if(period==="set"){
    const latest=rows.find(match=>Number(match.setNumber)>0);
    return latest?rows.filter(match=>Number(match.setNumber)===Number(latest.setNumber)):rows;
  }
  const days=period==="week"?7:30;
  const cutoff=Date.now()-days*86400000;
  return rows.filter(match=>Number(match.playedAt||0)>=cutoff);
}
function avg(values){
  const valid=values.filter(value=>Number.isFinite(Number(value)));
  return valid.length?valid.reduce((sum,value)=>sum+Number(value),0)/valid.length:null;
}
function frequencyMap(matches,extractor){
  const map=new Map();
  matches.forEach(match=>{
    const values=[...new Set(extractor(match))];
    values.forEach(value=>map.set(value,(map.get(value)||0)+1));
  });
  return map;
}
function topRows(map,limit=5){
  return Array.from(map.entries()).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,limit);
}
function groupStats(matches){
  if(!matches.length)return {games:0,avg:null,avgLevel:null,avgGold:null,comps:[],units:[],augments:[]};
  return {
    games:matches.length,
    avg:avg(matches.map(match=>Number(match.placement))),
    avgLevel:avg(matches.map(match=>matchLevel(match)).filter(Boolean)),
    avgGold:avg(matches.map(match=>matchGold(match)).filter(value=>value!==null)),
    comps:topRows(frequencyMap(matches,match=>[compLabel(match)])),
    units:topRows(frequencyMap(matches,unitNames)),
    augments:topRows(frequencyMap(matches,augmentNames))
  };
}
function allFeatureRates(top,bottom){
  const groups=[
    {type:"featureComp",top:frequencyMap(top,match=>[compLabel(match)]),bottom:frequencyMap(bottom,match=>[compLabel(match)])},
    {type:"featureUnit",top:frequencyMap(top,unitNames),bottom:frequencyMap(bottom,unitNames)},
    {type:"featureAugment",top:frequencyMap(top,augmentNames),bottom:frequencyMap(bottom,augmentNames)}
  ];
  const rows=[];
  groups.forEach(group=>{
    const names=new Set([...group.top.keys(),...group.bottom.keys()]);
    names.forEach(name=>{
      const topCount=group.top.get(name)||0;
      const bottomCount=group.bottom.get(name)||0;
      if(topCount+bottomCount<2)return;
      const topRate=top.length?topCount/top.length:0;
      const bottomRate=bottom.length?bottomCount/bottom.length:0;
      const delta=topRate-bottomRate;
      if(Math.abs(delta)<0.15)return;
      rows.push({type:group.type,name,topCount,bottomCount,topRate,bottomRate,delta});
    });
  });
  return rows.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)||b.topCount+b.bottomCount-(a.topCount+a.bottomCount)).slice(0,8);
}
function confidence(topCount,bottomCount){
  if(topCount>=8&&bottomCount>=8)return {level:"high",label:t("sampleHigh")};
  if(topCount>=4&&bottomCount>=4)return {level:"medium",label:t("sampleMedium")};
  return {level:"low",label:t("sampleLow")};
}
function setStatus(type,message){
  $("#status").className="status"+(type?" "+type:"");
  $("#status").textContent=message||"";
}
function loading(value){
  $("#loading").hidden=!value;
  $("#lookup-form").querySelector("button[type=submit]").disabled=value;
  if(value)setStatus("",t("loading"));
}
function renderList(target,rows,games){
  $(target).innerHTML=rows.length?rows.map(([name,count])=>
    '<div class="pattern-row"><strong>'+esc(name)+'</strong><span>'+fmt(count)+'/'+fmt(games)+'</span></div>'
  ).join(""):'<div class="empty-mini">—</div>';
}
function renderBand(prefix,stats){
  $("#"+prefix+"-games").textContent=String(stats.games);
  $("#"+prefix+"-avg").textContent=stats.avg===null?"—":dec(stats.avg);
  $("#"+prefix+"-level").textContent=stats.avgLevel===null?"—":dec(stats.avgLevel);
  $("#"+prefix+"-gold").textContent=stats.avgGold===null?"—":dec(stats.avgGold);
  renderList("#"+prefix+"-comps",stats.comps,stats.games);
  renderList("#"+prefix+"-units",stats.units,stats.games);
  renderList("#"+prefix+"-augments",stats.augments,stats.games);
}
function renderPlacements(matches){
  const counts=Array(8).fill(0);
  matches.forEach(match=>counts[Number(match.placement)-1]++);
  const max=Math.max(1,...counts);
  $("#placement-chart").innerHTML=counts.map((count,index)=>{
    const height=Math.max(count?12:3,Math.round(count/max*100));
    return '<div class="placement-col"><div class="bar-track"><div class="bar" style="height:'+height+'%"></div></div><strong>'+(index+1)+'º</strong><span>'+count+'</span></div>';
  }).join("");
}
function renderDifferences(rows,topCount,bottomCount){
  const conf=confidence(topCount,bottomCount);
  $("#confidence-badge").className="confidence-badge "+conf.level;
  $("#confidence-badge").textContent=conf.label;
  $("#difference-list").innerHTML=rows.length?rows.map(row=>{
    const direction=row.delta>0?"top":"bottom";
    const label=row.delta>0?t("topMore"):t("bottomMore");
    return '<article class="difference-row '+direction+'"><div><span class="feature-type">'+esc(t(row.type))+'</span><strong>'+esc(row.name)+'</strong></div>'+
      '<div class="rate"><span>Top 4 <b>'+Math.round(row.topRate*100)+'%</b></span><span>Bottom 4 <b>'+Math.round(row.bottomRate*100)+'%</b></span></div>'+
      '<em>'+esc(label)+' · '+Math.round(Math.abs(row.delta)*100)+' pp</em></article>';
  }).join(""):'<div class="empty-difference">'+esc(t("noPattern"))+'</div>';
}
function renderRecent(matches){
  const rows=matches.slice().sort((a,b)=>Number(b.playedAt||0)-Number(a.playedAt||0)).slice(0,12);
  $("#recent-list").innerHTML=rows.length?rows.map(match=>{
    const placement=Number(match.placement);
    const date=match.playedAt?new Date(Number(match.playedAt)).toLocaleDateString(locale(),{day:"2-digit",month:"short"}):"—";
    return '<article class="recent-row"><span class="place '+(placement<=4?"top":"bottom")+'">'+placement+'º</span><div><strong>'+esc(compLabel(match))+'</strong><small>'+esc(date)+(matchLevel(match)?" · Lv "+matchLevel(match):"")+'</small></div></article>';
  }).join(""):'<div class="empty-difference">'+esc(t("empty"))+'</div>';
}
function render(){
  const matches=periodMatches();
  const top=matches.filter(match=>Number(match.placement)<=4);
  const bottom=matches.filter(match=>Number(match.placement)>=5);
  const wins=matches.filter(match=>Number(match.placement)===1).length;
  const average=avg(matches.map(match=>Number(match.placement)));
  const topStats=groupStats(top);
  const bottomStats=groupStats(bottom);
  const differences=allFeatureRates(top,bottom);

  $("#result").hidden=false;
  $("#player-name").textContent=currentPlayer?currentPlayer.gameName+"#"+currentPlayer.tagLine:"—";
  $("#sample-note").textContent=copy[lang].sample(matches.length,top.length,bottom.length);
  $("#metric-games").textContent=String(matches.length);
  $("#metric-avg").textContent=average===null?"—":dec(average);
  $("#metric-top4").textContent=matches.length?Math.round(top.length/matches.length*100)+"%":"—";
  $("#metric-top4-note").textContent=top.length+" "+t("matches");
  $("#metric-wins").textContent=String(wins);
  $("#metric-wins-note").textContent=matches.length?Math.round(wins/matches.length*100)+"%":"—";
  document.querySelectorAll("[data-period]").forEach(button=>button.classList.toggle("active",button.dataset.period===period));

  renderPlacements(matches);
  renderBand("top",topStats);
  renderBand("bottom",bottomStats);
  renderDifferences(differences,top.length,bottom.length);
  renderRecent(matches);
}
function applyLanguage(){
  document.documentElement.lang=lang==="pt"?"pt-BR":"en";
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const value=t(el.dataset.i18n);
    if(typeof value!=="string")return;
    if(value.includes("<span>"))el.innerHTML=value;else el.textContent=value;
  });
  $("#language-toggle").textContent=lang==="pt"?"EN":"PT-BR";
  localStorage.setItem(LANGUAGE_KEY,lang);
  if(currentPlayer)render();
}
function updateUrl(name,tag,platform){
  const url=new URL(location.href);
  url.searchParams.set("riot",name+"#"+tag);
  url.searchParams.set("server",platform);
  url.searchParams.set("period",period);
  url.searchParams.set("lang",lang==="en"?"en":"pt");
  history.replaceState(null,"",url.pathname+"?"+url.searchParams.toString());
}
async function lookup(name,tag,platform){
  const endpoint=window.TFT_PLACEMENT_DNA_BACKEND?.tftProfile;
  if(!endpoint){setStatus("error",t("error"));return;}
  loading(true);$("#result").hidden=true;
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),API_TIMEOUT_MS);
  try{
    const response=await fetch(endpoint,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({gameName:name,tagLine:tag,platform}),signal:controller.signal
    });
    const payload=await response.json().catch(()=>({}));
    const transport=payload._transportError;
    if(!response.ok||transport||payload.error){
      const status=Number(transport?.status||response.status);
      const code=String(transport?.code||payload.error||"");
      if(status===404||code.includes("not_found"))throw {kind:"notFound"};
      if(status===429||code.includes("rate"))throw {kind:"rate"};
      throw {kind:"error"};
    }
    currentPlayer=payload.player||{gameName:name,tagLine:tag};
    liveMatches=Array.isArray(payload.matches)?payload.matches:[];
    updateUrl(name,tag,platform);
    setStatus("success",payload.cacheMeta?.stale?t("stale"):t("live"));
    render();
    $("#result").scrollIntoView({behavior:"smooth",block:"start"});
  }catch(error){
    setStatus("error",t(error?.kind||"error"));
  }finally{
    clearTimeout(timer);loading(false);
  }
}

$("#lookup-form").addEventListener("submit",event=>{
  event.preventDefault();
  const id=parseRiotId($("#riot-id").value);
  if(!id){setStatus("error",t("invalid"));$("#riot-id").focus();return;}
  lookup(id.gameName,id.tagLine,$("#server").value);
});
$("#language-toggle").addEventListener("click",()=>{
  lang=lang==="pt"?"en":"pt";applyLanguage();
  const url=new URL(location.href);url.searchParams.set("lang",lang==="en"?"en":"pt");history.replaceState(null,"",url.pathname+"?"+url.searchParams.toString());
});
document.querySelectorAll("[data-period]").forEach(button=>button.addEventListener("click",()=>{
  period=button.dataset.period;
  if(currentPlayer)updateUrl(currentPlayer.gameName,currentPlayer.tagLine,$("#server").value);
  if(currentPlayer)render();
}));

(function boot(){
  const params=new URLSearchParams(location.search);
  const requested=String(params.get("lang")||"").toLowerCase();
  if(requested==="en")lang="en";
  if(requested==="pt"||requested==="pt-br")lang="pt";
  const requestedPeriod=params.get("period");
  if(VALID_PERIODS.has(requestedPeriod))period=requestedPeriod;
  applyLanguage();
  const riot=parseRiotId(params.get("riot"));
  const server=params.get("server")||"br1";
  if(riot){
    $("#riot-id").value=riot.gameName+"#"+riot.tagLine;
    if(Array.from($("#server").options).some(option=>option.value===server))$("#server").value=server;
    lookup(riot.gameName,riot.tagLine,$("#server").value);
  }
})();
