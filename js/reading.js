
(function () {
  'use strict';
  const D=window.BokData;
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function classify(text){
    const clean=String(text||'').trim();
    if(!clean)return {id:'general',label:'전체 사주',text:''};
    let best={id:'general',label:'현재 고민',text:clean,score:0};
    D.CONCERNS.forEach(rule=>{
      const score=rule.words.reduce((n,w)=>n+(clean.includes(w)?1:0),0);
      if(score>best.score)best={...rule,text:clean,score};
    });
    return best;
  }

  function evidence(items){
    const clean=items.filter(Boolean);
    return `<details class="evidence"><summary>왜 이렇게 읽었나요?</summary><div class="evidence-body">${clean.map(esc).join(' · ')}</div></details>`;
  }

  function section(title,paras,basis){
    return `<section class="reading-section"><h4>${esc(title)}</h4>${paras.map(p=>`<p>${esc(p)}</p>`).join('')}${evidence(basis)}</section>`;
  }

  function hook(a,c){
    if(['money','business'].includes(c.id)){
      if(a.wealthHeavy&&['신약','중약'].includes(a.strength.grade))return '돈밭은 넓은데, 내 통장은 왜 자꾸 숨이 찰까요?';
      if(a.outputToWealth)return '돈 냄새는 잘 맡습니다. 이제 진짜 내 돈으로 바꿀 차례예요.';
      return '머릿속에서는 이미 부자인데, 현실은 왜 자꾸 딴소리를 할까요?';
    }
    if(c.id==='career')return '일은 잘하는데, 왜 내 일만 자꾸 늘어날까요?';
    if(c.id==='love')return '마음은 깊은데, 표현은 왜 늘 한 박자 늦을까요?';
    if(c.id==='relationship')return '사람 보는 눈은 빠른데, 인간관계는 왜 늘 숙제일까요?';
    if(a.dayGan==='辛')return '겉은 차분한데, 속에서는 작은 것까지 다 보고 있습니다.';
    return '겉으로 보이는 모습보다 속에 더 많은 생각을 품고 있습니다.';
  }

  function render(a,concernText,hasTime){
    const c=classify(concernText);
    const tg1=a.tenGods[0],tg2=a.tenGods[1];
    const weakDay=['신약','중약'].includes(a.strength.grade);

    const oneLine=['money','business'].includes(c.id)
      ?(a.wealthHeavy&&weakDay?'돈복이 없는 게 아니라, 들어온 돈을 내 것으로 만드는 힘을 키우는 중입니다.':'잘하는 일을 돈으로 바꿀수록 운이 살아나는 사람입니다.')
      :(a.dayGan==='辛'?'남들이 놓치는 작은 차이를 먼저 알아보는 사람입니다.':'겉보다 속에서 생각이 더 많은 사람입니다.');

    const blocks=[];

    if(c.text){
      const concernSections={
        study:{
          title:'자격증 합격운, 운보다 먼저 보이는 건 공부 방식입니다',
          paras:[
            '자격증이나 시험을 앞두면 결과가 나올 때까지 마음이 계속 시험장에 가 있는 편입니다.',
            '이 사주는 이해하고 정리하는 힘은 있지만, 준비가 부족하다고 느끼면 시작과 마무리가 늦어질 수 있습니다.',
            '합격 가능성을 높이는 방법은 공부 범위를 넓히는 것이 아니라, 기출문제에서 자주 틀리는 부분을 반복해서 줄이는 것입니다.',
            a.outputToWealth?'배운 내용을 직접 써보고 설명할 때 기억이 오래 남습니다. 문제를 풀고 해설을 말로 설명하는 방식이 잘 맞습니다.':'읽기만 하는 공부보다 문제를 풀고 바로 채점하는 방식이 더 잘 맞습니다.',
            weakDay?'시험 직전에는 무리해서 공부 시간을 늘리기보다 수면과 집중력을 지키는 것이 중요합니다. 체력이 떨어지면 아는 문제도 놓치기 쉽습니다.':'시험 직전에는 새로운 내용을 더 넣기보다, 이미 공부한 내용을 빠르게 다시 보는 편이 좋습니다.',
            '현재 엔진은 대운·세운과 실제 시험 날짜까지 계산하지 않기 때문에 합격·불합격을 단정하지는 않습니다. 다만 사주상 공부를 결과로 연결하려면 반복, 마감, 실전 연습이 핵심입니다.'
          ],
          basis:[tg1,tg2,'인성·식상 흐름',a.strength.grade,hasTime?'시주 포함':'삼주 기준']
        },
        money:{
          title:'지금 돈 고민이 커진 이유부터 보입니다',
          paras:[
            '돈이 부족해서만 불안한 것이 아니라, 더 나아질 가능성을 계속 찾고 있기 때문에 마음이 쉬지 못합니다.',
            '기회가 보일 때마다 잡고 싶어지지만, 여러 방향으로 돈과 시간을 나누면 실제로 남는 것이 줄어들 수 있습니다.',
            '지금은 큰 한 번보다 수입 하나를 오래 유지하고, 지출 하나를 확실히 줄이는 방식이 더 잘 맞습니다.'
          ],
          basis:[a.wealthHeavy?'재성 강세':'재성 흐름',weakDay?'재다신약 경향':null,a.outputToWealth?'식상생재':null]
        },
        business:{
          title:'부업운은 아이디어보다 완성 여부에서 갈립니다',
          paras:[
            '새로운 수익 아이디어를 떠올리는 힘은 있습니다.',
            '다만 좋은 아이디어가 계속 생기면 하나를 끝내기 전에 다음 것으로 넘어갈 수 있습니다.',
            '한 기능을 실제로 공개하고, 누가 쓰는지 확인하고, 첫 결제를 받는 데까지 가야 부업운이 현실이 됩니다.'
          ],
          basis:[a.outputToWealth?'식상생재 흐름':null,a.wealthHeavy?'재성 강세':null,tg1,tg2]
        },
        career:{
          title:'이직 여부보다, 지금 일이 나를 키우는지가 더 중요합니다',
          paras:[
            '답답함만으로 회사를 옮기면 비슷한 문제를 다시 만날 수 있습니다.',
            '전문성이 더 쌓이는지, 결정권이 커지는지, 보상이 실제로 좋아지는지를 따로 비교해야 합니다.',
            '사주상 문제를 찾고 고치는 역할에서 강점이 잘 드러나므로, 단순 반복보다 판단이 필요한 일이 더 잘 맞습니다.'
          ],
          basis:[a.officerHeavy?'관성 강세':null,tg1,tg2,`${a.strong} 기운 강세`]
        },
        love:{
          title:'연애 고민은 마음이 없어서가 아니라, 표현이 늦어서 생기기 쉽습니다',
          paras:[
            '상대의 반응은 빠르게 읽지만, 내 마음은 충분히 정리한 뒤에야 말하려는 편입니다.',
            '그래서 상대는 기다리다가 지치거나, 갑자기 결론을 통보받았다고 느낄 수 있습니다.',
            '정답을 말하려 하지 말고 지금 서운한 점이나 원하는 것을 한 문장 먼저 말하는 것이 좋습니다.'
          ],
          basis:[a.dayGan==='辛'?'신금의 예민함':null,tg1,tg2]
        },
        health:{
          title:'지금은 정신력보다 몸의 신호를 먼저 봐야 합니다',
          paras:[
            '압박이 커지면 쉬지 않고 버티려는 경향이 있습니다.',
            '하지만 피로가 쌓이면 판단력과 감정 조절이 함께 떨어질 수 있습니다.',
            '사주는 생활 리듬을 보는 참고일 뿐입니다. 실제 증상은 의료진에게 확인하고, 수면과 식사 시간을 먼저 고정하세요.'
          ],
          basis:[a.strength.grade,`${a.strong} 기운 강세`,`${a.weak} 기운 보완`]
        }
      };
      const focused=concernSections[c.id];
      if(focused)blocks.push(section(focused.title,focused.paras,focused.basis));
    }

    const coreParas=a.dayGan==='辛'
      ?['깔끔하고 기준이 분명한 편입니다.','남들이 그냥 지나치는 작은 실수나 어색한 분위기도 빨리 알아챕니다.','그래서 일을 잘한다는 말을 듣지만, 가까운 사람에게는 예민하게 보일 때도 있습니다.']
      :['처음에는 차분하고 자기 할 일을 잘하는 사람으로 보입니다.','그런데 속으로는 작은 말과 분위기까지 오래 생각하는 편입니다.','괜찮다고 말해놓고 혼자 정리하는 시간이 길었을 수 있습니다.'];
    if(weakDay)coreParas.push('약해서가 아닙니다. 한꺼번에 감당하려는 일이 많은 편입니다.');
    blocks.push(section('겉보다 속에서 생각이 훨씬 많은 사람입니다',coreParas,[`${a.dayGan} 일간`,a.strength.grade,tg1,tg2,hasTime?'시주 포함':'삼주 기준']));

    let moneyTitle='돈은 버는 것보다 남기는 쪽에서 차이가 납니다';
    let moneyParas;
    if(a.wealthHeavy&&weakDay){
      moneyTitle='돈 욕심은 있는데, 이상하게 돈은 잘 안 모입니다';
      moneyParas=['돈을 벌고 싶은 마음도 크고, 돈이 될 만한 기회도 비교적 빨리 보는 편입니다.','문제는 기회가 보일 때마다 이것저것 함께 잡으려 한다는 점입니다.','그러면 돈보다 시간과 체력이 먼저 빠지고, 벌어도 남는 돈이 적을 수 있습니다.','한 번에 크게 벌기보다, 잘하는 일 하나를 오래 돈이 되게 만드는 쪽이 맞습니다.'];
    }else if(a.outputToWealth){
      moneyTitle='아는 것과 만드는 것이 결국 돈이 됩니다';
      moneyParas=['아는 것, 만드는 것, 설명하는 것을 돈으로 바꾸는 힘이 있습니다.','기술이나 경험을 한 번 만들고 여러 번 팔 수 있는 형태로 바꾸면 좋습니다.','새로운 일을 더 찾기보다, 이미 잘하는 일을 더 쉽게 파는 방법이 빠릅니다.'];
    }else{
      moneyParas=['돈은 한 번의 큰 행운보다 꾸준히 쌓는 방식이 더 잘 맞습니다.','기분에 따라 쓰거나 시작하면 흐름이 흔들릴 수 있습니다.','생각하지 않아도 돈이 남는 자동저축 같은 방법부터 만들어두는 게 좋습니다.'];
    }
    blocks.push(section(moneyTitle,moneyParas,[a.wealthHeavy?'재성 강세':'재성 흐름',weakDay?'재다신약 경향':null,a.outputToWealth?'식상생재':null]));

    const workParas=a.outputToWealth
      ?['아이디어만 내는 것보다 실제 결과물로 만들 때 운이 살아납니다.','기획, 분석, 설계, 글, 기술처럼 실력을 눈에 보이게 만드는 일이 잘 맞습니다.','부업도 완전히 새로운 분야보다, 지금 잘하는 일을 작게 상품으로 만드는 쪽이 유리합니다.']
      :['새로운 일을 이해하고 정리하는 속도는 빠른 편입니다.','시키는 대로만 반복하는 일보다, 문제를 찾고 고치는 일에서 실력이 드러납니다.','다만 잘하니까 일이 계속 몰릴 수 있습니다. 다 받아주면 결국 본인만 지칩니다.'];
    blocks.push(section(a.outputToWealth?'아는 것과 만드는 것이 결국 돈이 되는 사람입니다':'일은 잘하는데, 여러 일을 한꺼번에 떠안는 편입니다',workParas,[a.outputToWealth?'식상생재 흐름':null,a.officerHeavy?'관성 강세':null,`${a.strong} 기운 강세`]));

    const relParas=['상대가 어떤 기분인지, 말에 숨은 뜻이 무엇인지 빨리 알아차립니다.','그런데 본인 마음은 참다가 결론만 짧게 말할 때가 있습니다.','그래서 가까운 사람은 “왜 진작 말하지 않았어?”라고 느낄 수 있습니다.'];
    if(a.relations.length)relParas.push('혼자 끙끙거릴 때보다, 믿을 만한 사람과 함께 움직일 때 일이 더 잘 풀립니다.');
    blocks.push(section('사람을 잘 보지만, 속마음은 늦게 말하는 편입니다',relParas,[a.dayGan==='辛'?'신금의 예민함':null,...a.relations,a.strength.root.label]));

    const actionBy={
      money:['이번 달에는 새 투자 하나보다, 새는 돈 하나를 먼저 막아보세요.','수입이 생기면 남은 돈을 모으지 말고, 먼저 떼어놓는 게 좋습니다.'],
      business:['부업 아이디어를 더 찾기보다, 지금 가진 아이디어 하나를 실제로 완성해보세요.','작게 올리고 누가 쓰는지 확인한 뒤 다음 기능을 붙이세요.'],
      career:['내가 반드시 잘해야 하는 일 하나를 정하세요.','성과를 말로만 남기지 말고 숫자나 결과물로 기록해두세요.'],
      love:['상대가 알아주기를 기다리지 말고, 오늘 마음 하나만 직접 말해보세요.','결론보다 지금 느끼는 감정을 한 문장 먼저 말해보세요.'],
      family:['가족 일을 전부 혼자 책임지려 하지 말고, 이번 주에 역할 하나를 나눠보세요.','도움과 희생의 경계를 미리 정하는 것이 좋습니다.'],
      relationship:['상대의 뜻을 혼자 추측하지 말고, 궁금한 것을 한 번 직접 물어보세요.','맞는 말을 하는 것보다 부드럽게 전하는 데 집중해보세요.'],
      health:['잠을 줄여 버티지 말고, 이번 주 수면 시간을 먼저 고정해보세요.','몸의 증상은 사주로 판단하지 말고 의료진에게 확인하세요.'],
      study:['합격 여부만 계속 떠올리기보다, 남은 기간에 점수를 올릴 부분을 세 개로 줄여보세요.','새 교재를 더 사기보다 기출문제와 오답을 반복하는 편이 좋습니다.'],
      general:['새로운 일을 하나 더 시작하기보다, 이미 벌인 일 하나를 끝내보세요.','완벽하게 하려 하지 말고, 끝까지 하는 쪽을 선택하세요.']
    };
    blocks.push(section('지금 필요한 건 거창한 변화가 아닙니다',actionBy[c.id]||actionBy.general,[a.tags[0]||'오행과 십성의 균형']));

    return {
      category:c,
      hook:hook(a,c),
      html:`${c.text?`<div class="concern-badge show">💬 ${esc(c.label)} 중심 풀이</div>`:''}<div class="one-line">${esc(oneLine)}</div>${blocks.join('')}`
    };
  }

  window.BokReading={render,classify};
})();
