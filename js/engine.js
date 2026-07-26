
(function () {
  'use strict';
  const D = window.BokData;
  if (!D) throw new Error('BokData가 먼저 로드되지 않았습니다.');

  const stemIndex = ch => D.STEMS.indexOf(ch);
  const utcDay = (y,m,d) => Math.floor(Date.UTC(y,m-1,d)/86400000);
  const ganzhiIndex = (s,b) => {
    for (let i=0;i<60;i+=1) if (i%10===s && i%12===b) return i;
    return 0;
  };
  const pillar = i => D.STEMS[i%10] + D.BRANCHES[i%12];
  const pillarKorean = i => D.KSTEMS[i%10] + D.KBRANCHES[i%12];

  function solarTermUtcMs(year, termIndex){
    const base=Date.UTC(1900,0,6,2,5);
    return base+31556925974.7*(year-1900)+D.SOLAR_TERM_MINUTES[termIndex]*60000;
  }
  function inputUtcMs(y,m,d,h=12){ return Date.UTC(y,m-1,d,h-9,0); }

  function yearPillar(y,m,d,h){
    const input=inputUtcMs(y,m,d,h);
    const lichun=solarTermUtcMs(y,2);
    const sajuYear=input<lichun?y-1:y;
    return ((sajuYear-1984)%60+60)%60;
  }

  function monthPillar(y,m,d,h,yearStem){
    const input=inputUtcMs(y,m,d,h);
    let selected=null;
    for(let yy=y-1;yy<=y;yy+=1){
      for(const item of D.MONTH_JIE){
        const ms=solarTermUtcMs(yy,item.term);
        if(ms<=input && (!selected || ms>selected.ms)) selected={...item,ms};
      }
    }
    const branch=selected.branch;
    const yinStart=((yearStem%5)*2+2)%10;
    const stem=(yinStart+(branch-2+12)%12)%10;
    return {index:ganzhiIndex(stem,branch),term:selected};
  }

  function dayPillar(y,m,d,h){
    let serial=utcDay(y,m,d);
    if(h===23) serial+=1;
    return ((serial-utcDay(2000,1,7))%60+60)%60;
  }

  function hourPillar(dayStem,h){
    if(h<0) return null;
    const branch=Math.floor(((h+1)%24)/2);
    const stem=((dayStem%5)*2+branch)%10;
    return ganzhiIndex(stem,branch);
  }

  function calculate(y,m,d,h){
    const safeHour=h<0?12:h;
    const yIndex=yearPillar(y,m,d,safeHour);
    const month=monthPillar(y,m,d,safeHour,yIndex%10);
    const dIndex=dayPillar(y,m,d,h);
    const hIndex=hourPillar(dIndex%10,h);
    return {
      yearIndex:yIndex,monthIndex:month.index,dayIndex:dIndex,hourIndex:hIndex,
      year:pillar(yIndex),month:pillar(month.index),day:pillar(dIndex),hour:hIndex===null?null:pillar(hIndex),
      yearKo:pillarKorean(yIndex),monthKo:pillarKorean(month.index),dayKo:pillarKorean(dIndex),hourKo:hIndex===null?null:pillarKorean(hIndex),
      term:month.term
    };
  }

  function tenGod(dayStem,otherStem){
    const d=stemIndex(dayStem),o=stemIndex(otherStem);
    const de=Math.floor(d/2),oe=Math.floor(o/2),same=(d%2)===(o%2);
    if(de===oe)return same?'비견':'겁재';
    if((de+1)%5===oe)return same?'식신':'상관';
    if((de+2)%5===oe)return same?'편재':'정재';
    if((oe+1)%5===de)return same?'편인':'정인';
    if((oe+2)%5===de)return same?'편관':'정관';
    return null;
  }

  function tenGodRank(dayGan,pillars){
    const score={비견:0,겁재:0,식신:0,상관:0,편재:0,정재:0,편관:0,정관:0,편인:0,정인:0};
    pillars.forEach((pl,i)=>{
      if(!pl)return;
      if(i!==2){
        const tg=tenGod(dayGan,pl[0]);
        if(tg)score[tg]+=1;
      }
      (D.HIDDEN_STEMS[pl[1]]||[]).forEach(([hs,w])=>{
        const tg=tenGod(dayGan,hs);
        if(tg)score[tg]+=w;
      });
    });
    return Object.entries(score).sort((a,b)=>b[1]-a[1]);
  }

  function weightedElements(pillars){
    const score={목:0,화:0,토:0,금:0,수:0};
    pillars.forEach((pl,i)=>{
      if(!pl)return;
      score[D.ELEMENT_MAP[pl[0]]]+=i===1?1.6:1;
      score[D.ELEMENT_MAP[pl[1]]]+=i===1?1.8:1;
      (D.HIDDEN_STEMS[pl[1]]||[]).forEach(([s,w])=>{
        score[D.ELEMENT_MAP[s]]+=w*(i===1?1.7:1);
      });
    });
    const weights=D.MONTH_WEIGHT[pillars[1][1]];
    Object.keys(score).forEach(k=>score[k]*=weights[k]);
    return score;
  }

  function rooting(dayGan,pillars){
    const dm=D.ELEMENT_MAP[dayGan];
    let score=0;
    const roots=[];
    pillars.forEach((pl,i)=>{
      if(!pl)return;
      const found=(D.HIDDEN_STEMS[pl[1]]||[]).filter(([s])=>D.ELEMENT_MAP[s]===dm);
      if(found.length){
        const weight=found.reduce((sum,[,w])=>sum+w,0);
        score+=weight*(i===1?1.6:i===2?1.35:1);
        roots.push(pl[1]);
      }
    });
    return {score,roots,label:score>=1.8?'통근 강함':score>=0.8?'통근 있음':'통근 약함'};
  }

  function strength(dayGan,pillars,weighted){
    const dm=D.ELEMENT_MAP[dayGan];
    const resource={목:'수',화:'목',토:'화',금:'토',수:'금'}[dm];
    const total=Object.values(weighted).reduce((a,b)=>a+b,0)||1;
    const root=rooting(dayGan,pillars);
    const stems=pillars.filter(Boolean).map(x=>x[0]);
    const supportCount=stems.filter(s=>[dm,resource].includes(D.ELEMENT_MAP[s])).length;
    const supportRatio=((weighted[dm]||0)+(weighted[resource]||0))/total;
    let score=Math.round(50+(supportRatio-.5)*70+root.score*7+(supportCount-2)*4);
    score=Math.max(5,Math.min(95,score));
    const grade=score>=72?'신강':score>=58?'중강':score>=43?'중화':score>=28?'중약':'신약';
    return {score,grade,root};
  }

  function branchRelations(pillars){
    const branches=pillars.filter(Boolean).map(x=>x[1]);
    const has=(a,b)=>branches.includes(a)&&branches.includes(b);
    const labels=[];
    if(has('亥','卯')||has('卯','未')||has('亥','未'))labels.push('목 반합');
    if(has('寅','午')||has('午','戌')||has('寅','戌'))labels.push('화 반합');
    if(has('申','子')||has('子','辰')||has('申','辰'))labels.push('수 반합');
    if(has('巳','酉')||has('酉','丑')||has('巳','丑'))labels.push('금 반합');
    if(has('午','未'))labels.push('오미 육합');
    if(has('子','午')||has('丑','未')||has('寅','申')||has('卯','酉')||has('辰','戌')||has('巳','亥'))labels.push('충');
    return labels;
  }

  function analyze(calc){
    const pillars=[calc.year,calc.month,calc.day,calc.hour];
    const dayGan=calc.day[0];
    const weighted=weightedElements(pillars);
    const ordered=Object.entries(weighted).sort((a,b)=>b[1]-a[1]);
    const rank=tenGodRank(dayGan,pillars);
    const str=strength(dayGan,pillars,weighted);
    const wealthScore=rank.filter(([k])=>['편재','정재'].includes(k)).reduce((s,[,v])=>s+v,0);
    const outputScore=rank.filter(([k])=>['식신','상관'].includes(k)).reduce((s,[,v])=>s+v,0);
    const officerScore=rank.filter(([k])=>['편관','정관'].includes(k)).reduce((s,[,v])=>s+v,0);
    const weak=['신약','중약'].includes(str.grade);
    const wealthHeavy=wealthScore>=2.4||(weak&&wealthScore>=1.7);
    return {
      dayGan,dayElement:D.ELEMENT_MAP[dayGan],
      strong:ordered[0][0],weak:ordered[ordered.length-1][0],
      tenGods:rank.slice(0,2).map(x=>x[0]),
      strength:str,
      relations:branchRelations(pillars),
      wealthHeavy,outputToWealth:outputScore>=1.2&&wealthScore>=1.2,
      officerHeavy:officerScore>=2.1,
      wealthScore,outputScore,officerScore,
      supportType:str.grade,
      hasTime:Boolean(calc.hour),
      monthBranch:calc.month[1],
      tags:[
        wealthHeavy&&weak?'재다신약 경향':null,
        outputScore>=1.2&&wealthScore>=1.2?'식상생재 흐름':null,
        officerScore>=2.1?'관성 강세':null,
        str.root.label,
        ...branchRelations(pillars)
      ].filter(Boolean)
    };
  }

  function parseBirth(value){
    const digits=String(value||'').replace(/\D/g,'');
    if(digits.length!==8)throw new Error('생년월일 8자리를 입력해주세요. 예: 19870323');
    const y=Number(digits.slice(0,4)),m=Number(digits.slice(4,6)),d=Number(digits.slice(6,8));
    const check=new Date(Date.UTC(y,m-1,d));
    if(y<1900||y>2099||check.getUTCFullYear()!==y||check.getUTCMonth()+1!==m||check.getUTCDate()!==d){
      throw new Error('올바른 생년월일인지 확인해주세요.');
    }
    return {y,m,d};
  }

  window.BokEngine={calculate,analyze,parseBirth};
})();
