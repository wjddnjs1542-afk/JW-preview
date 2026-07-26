
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
    const clean=[...new Set((items||[]).filter(Boolean))];
    if(!clean.length)return '';
    return `<details class="evidence"><summary>왜 이렇게 읽었나요?</summary><div class="evidence-body">${clean.map(esc).join(' · ')}</div></details>`;
  }

  function section(index,title,paras,basis,hit=''){
    return `<section class="reading-section"><span class="reading-num">${index}</span><h4>${esc(title)}</h4>${paras.map(p=>`<p>${esc(p)}</p>`).join('')}${hit?`<div class="fact-hit">${esc(hit)}</div>`:''}${evidence(basis)}</section>`;
  }

  function hook(a,c){
    if(['money','business'].includes(c.id)){
      if(a.wealthHeavy&&['신약','중약'].includes(a.strength.grade))return '돈밭은 넓은데, 내 통장은 왜 자꾸 숨이 찰까요?';
      if(a.outputToWealth)return '돈 냄새는 잘 맡습니다. 이제 진짜 내 돈으로 바꿀 차례예요.';
      return '머릿속에서는 이미 부자인데, 현실은 왜 자꾸 딴소리를 할까요?';
    }
    if(c.id==='study')return '합격이 궁금한데, 사주는 먼저 당신의 공부 습관부터 들춰냅니다.';
    if(c.id==='career')return '일은 잘하는데, 왜 내 일만 자꾸 늘어날까요?';
    if(c.id==='love')return '마음은 깊은데, 표현은 왜 늘 한 박자 늦을까요?';
    if(c.id==='family')return '가족을 챙기다 보니, 내 마음은 자꾸 뒤로 밀렸습니다.';
    if(c.id==='relationship')return '사람 보는 눈은 빠른데, 인간관계는 왜 늘 숙제일까요?';
    if(c.id==='health')return '의지는 버티는데, 몸은 이미 쉬고 싶다고 말하고 있습니다.';
    if(a.dayGan==='辛')return '겉은 차분한데, 속에서는 작은 것까지 다 보고 있습니다.';
    return '겉으로 보이는 모습보다 속에 훨씬 많은 생각을 품고 있습니다.';
  }

  function concernBlock(a,c,weakDay,tg1,tg2){
    const commonBasis=[tg1,tg2,a.strength.grade,a.hasTime?'시주 포함':'삼주 기준'];
    const map={
      study:{
        title:'자격증과 시험, 결과보다 먼저 보이는 건 당신의 공부 방식입니다',
        paras:[
          '합격이 궁금한 마음은 당연합니다. 다만 지금 사주만으로 “붙는다, 떨어진다”를 단정하는 것은 조심해야 합니다.',
          '대신 어떤 방식으로 공부할 때 점수가 오르고, 시험 직전에 어디서 흔들리기 쉬운지는 꽤 분명하게 읽을 수 있습니다.',
          a.outputToWealth?'당신은 읽기만 할 때보다 직접 문제를 풀고, 배운 내용을 말이나 글로 설명할 때 기억이 오래 남습니다.':'당신은 내용을 이해한 뒤 자기 방식으로 다시 정리해야 실력이 안정되는 편입니다.',
          weakDay?'시험이 가까워질수록 공부 시간을 무작정 늘리기보다 수면과 집중력을 지키는 것이 중요합니다. 체력이 떨어지면 아는 문제도 놓치기 쉽습니다.':'시험 직전에는 새로운 내용을 더 넣기보다 이미 공부한 내용을 빠르게 반복하는 편이 좋습니다.',
          '공부 범위를 계속 넓히기보다 기출문제에서 반복해서 틀리는 부분을 줄이는 것이 합격 가능성을 높이는 현실적인 방법입니다.'
        ],
        hit:'결론: 운에 기대기보다 기출·오답·실전 연습을 반복할수록 강해지는 타입입니다.',
        basis:[...commonBasis,'인성·식상 흐름']
      },
      money:{
        title:'돈이 없어서만 불안한 게 아닙니다. 더 나아질 가능성을 계속 찾고 있습니다',
        paras:[
          '돈을 벌고 싶은 마음도 크고, 돈이 될 만한 기회도 비교적 빨리 보는 편입니다.',
          a.wealthHeavy?'문제는 기회가 보일 때마다 이것저것 함께 잡으려 한다는 점입니다. 돈보다 시간과 체력이 먼저 빠질 수 있습니다.':'재물은 큰 한 번보다 꾸준히 쌓는 방식이 더 잘 맞습니다.',
          a.outputToWealth?'특히 지식, 기술, 경험을 눈에 보이는 결과물로 만들 때 수입과 연결되기 좋습니다.':'수입을 늘리더라도 이미 잘하는 일에서 출발해야 오래 갑니다.',
          '지금은 대박을 찾기보다 수입 하나를 오래 유지하고, 새는 돈 하나를 확실히 막는 편이 효과적입니다.'
        ],
        hit:a.wealthHeavy&&weakDay?'돈복이 없는 게 아니라, 들어온 돈을 붙잡는 힘을 키우는 중입니다.':'돈은 감보다 습관에서 더 크게 남습니다.',
        basis:[a.wealthHeavy?'재성 강세':'재성 흐름',weakDay?'재다신약 경향':null,a.outputToWealth?'식상생재':null]
      },
      business:{
        title:'부업운은 아이디어 개수보다, 하나를 끝내는 힘에서 갈립니다',
        paras:[
          '새로운 수익 아이디어를 발견하고 기획하는 감각은 살아 있습니다.',
          '다만 좋은 아이디어가 계속 생기면 하나를 완성하기 전에 다음 것으로 넘어갈 수 있습니다.',
          '본업을 바로 버리기보다 작은 기능이나 상품을 먼저 공개하고, 실제 사용자가 돈을 내는지 확인하는 방식이 안전합니다.',
          a.outputToWealth?'당신은 지식·기술·경험을 계산기, 자료, 콘텐츠, 서비스처럼 반복 판매 가능한 형태로 바꾸는 것이 잘 맞습니다.':'완전히 새로운 분야보다 지금 가진 실무 경험을 상품으로 바꾸는 편이 유리합니다.'
        ],
        hit:'부업은 “더 좋은 아이디어”보다 “첫 결제까지 완주한 아이디어”가 이깁니다.',
        basis:[a.outputToWealth?'식상생재 흐름':null,a.wealthHeavy?'재성 강세':null,tg1,tg2]
      },
      career:{
        title:'이직할까 말까보다, 지금 일이 나를 키우는지부터 봐야 합니다',
        paras:[
          '답답함만으로 회사를 옮기면 비슷한 문제를 다른 회사에서도 다시 만날 수 있습니다.',
          '전문성이 더 쌓이는지, 결정권이 커지는지, 보상이 실제로 좋아지는지를 따로 비교해야 합니다.',
          '사주상 문제를 찾고 고치는 역할, 기준을 세우는 역할, 결과물을 남기는 일에서 강점이 잘 드러납니다.',
          a.officerHeavy?'책임과 압박이 생기면 집중력이 오르지만, 늘 긴장으로 버티면 소진되기 쉽습니다.':'시키는 대로만 반복하는 일보다 판단이 필요한 일이 더 잘 맞습니다.'
        ],
        hit:'직함보다 “내 실력이 남는 자리인가”를 먼저 보세요.',
        basis:[a.officerHeavy?'관성 강세':null,tg1,tg2,`${a.strong} 기운 강세`]
      },
      love:{
        title:'마음이 없는 게 아니라, 표현이 늦어서 오해가 생기기 쉽습니다',
        paras:[
          '상대의 표정과 말투는 빠르게 읽지만, 내 마음은 충분히 정리한 뒤에야 말하려는 편입니다.',
          '그래서 상대는 기다리다가 지치거나, 갑자기 결론을 통보받았다고 느낄 수 있습니다.',
          '정답을 말하려 하기보다 지금 서운한 점이나 원하는 것을 한 문장 먼저 말하는 것이 좋습니다.',
          '잘 맞는 사람은 감정을 몰아붙이지 않고, 서로의 영역을 존중하면서 대화를 기다려주는 사람입니다.'
        ],
        hit:'좋은 관계는 상대를 잘 읽는 능력보다, 내 마음을 제때 말하는 용기에서 시작됩니다.',
        basis:[a.dayGan==='辛'?'신금의 예민함':null,tg1,tg2]
      },
      family:{
        title:'가족의 짐까지 다 들면, 결국 아무도 편하지 않습니다',
        paras:[
          '가족 일에서 책임을 먼저 떠안고, 내 불편은 나중으로 미루기 쉽습니다.',
          '도와주는 마음은 크지만 역할과 돈의 경계가 없으면 서운함이 쌓일 수 있습니다.',
          '가족을 위해서라도 내가 할 수 있는 범위와 할 수 없는 범위를 먼저 정하는 것이 필요합니다.',
          '혼자 해결한 뒤 알리는 것보다, 처음부터 역할을 나누는 편이 관계를 오래 지켜줍니다.'
        ],
        hit:'가족을 사랑하는 것과 모든 책임을 혼자 지는 것은 다른 일입니다.',
        basis:[tg1,tg2,a.officerHeavy?'관성 강세':null]
      },
      relationship:{
        title:'사람 보는 눈은 빠른데, 말끝이 너무 정확할 때가 있습니다',
        paras:[
          '상대가 무엇을 숨기고 있는지, 분위기가 왜 달라졌는지 빠르게 알아차립니다.',
          '그 능력은 큰 장점이지만 가까운 관계에서는 분석보다 공감이 먼저일 때 훨씬 잘 통합니다.',
          '맞는 말을 하더라도 상대가 들을 수 있는 속도로 말해야 내 의도가 제대로 전달됩니다.',
          a.relations.length?'혼자 끙끙거릴 때보다 믿을 만한 사람과 함께 움직일 때 일이 더 잘 풀리는 편입니다.':'넓은 관계보다 깊게 믿을 수 있는 몇 사람이 더 중요합니다.'
        ],
        hit:'사람을 정확히 보는 눈은 강점입니다. 다만 정확한 말이 항상 따뜻한 말은 아닙니다.',
        basis:[a.dayGan==='辛'?'신금의 예민함':null,...a.relations,a.strength.root.label]
      },
      health:{
        title:'정신력으로 버티는 것도 체력이 있을 때 이야기입니다',
        paras:[
          '압박이 커질수록 쉬지 않고 버티려는 경향이 있습니다.',
          '하지만 피로가 쌓이면 판단력과 감정 조절이 함께 떨어질 수 있습니다.',
          '생활 리듬이 무너지면 평소보다 예민해지고, 작은 일에도 에너지를 많이 쓰게 됩니다.',
          '사주는 질병 진단이 아닙니다. 실제 증상은 의료진에게 확인하고 수면·식사·운동 시간을 먼저 고정하세요.'
        ],
        hit:'지금 필요한 건 의지를 더 짜내는 일이 아니라, 몸이 회복할 시간을 지키는 일입니다.',
        basis:[a.strength.grade,`${a.strong} 기운 강세`,`${a.weak} 기운 보완`]
      }
    };
    return map[c.id]||null;
  }

  function coreSections(a,c,weakDay,tg1,tg2){
    const sections=[];
    const coreParas=a.dayGan==='辛'
      ?['깔끔하고 기준이 분명한 편입니다.','남들이 그냥 지나치는 작은 실수나 어색한 분위기도 빨리 알아챕니다.','그래서 일을 잘한다는 말을 듣지만, 가까운 사람에게는 예민하게 보일 때도 있습니다.','속으로는 많은 생각을 하면서도 겉으로는 괜찮은 척 정리하는 경우가 많습니다.']
      :['처음에는 차분하고 자기 할 일을 잘하는 사람으로 보입니다.','그런데 속으로는 작은 말과 분위기까지 오래 생각하는 편입니다.','괜찮다고 말해놓고 혼자 정리하는 시간이 길었을 수 있습니다.','사람들이 보는 모습보다 실제 내면의 고민이 훨씬 많은 편입니다.'];
    if(weakDay)coreParas.push('약해서가 아닙니다. 한꺼번에 감당하려는 일이 많은 편입니다.');
    sections.push({
      title:'겉보다 속에서 생각이 훨씬 많은 사람입니다',
      paras:coreParas,
      hit:'겉은 침착한데, 머릿속 회의는 쉽게 끝나지 않는 사람입니다.',
      basis:[`${a.dayGan} 일간`,a.strength.grade,tg1,tg2,a.hasTime?'시주 포함':'삼주 기준']
    });

    let moneyTitle='돈은 버는 것보다 남기는 쪽에서 차이가 납니다';
    let moneyParas;
    if(a.wealthHeavy&&weakDay){
      moneyTitle='돈 욕심은 있는데, 이상하게 돈은 잘 안 모입니다';
      moneyParas=['돈이 될 만한 기회는 잘 보지만 여러 가능성을 동시에 잡으려 할 수 있습니다.','그러면 돈보다 시간과 체력이 먼저 빠지고, 벌어도 남는 돈이 적어질 수 있습니다.','큰돈을 한 번에 노리기보다 잘하는 일 하나를 오래 돈이 되게 만드는 쪽이 맞습니다.','돈을 벌기 위한 계획과 돈을 지키기 위한 규칙을 따로 가져야 합니다.'];
    }else if(a.outputToWealth){
      moneyTitle='아는 것과 만드는 것이 결국 돈이 됩니다';
      moneyParas=['아는 것, 만드는 것, 설명하는 것을 돈으로 바꾸는 힘이 있습니다.','기술이나 경험을 한 번 만들고 여러 번 팔 수 있는 형태로 바꾸면 좋습니다.','새로운 일을 더 찾기보다 이미 잘하는 일을 더 쉽게 파는 방법이 빠릅니다.','실력은 결과물로 남길 때 비로소 재물이 됩니다.'];
    }else{
      moneyParas=['돈은 한 번의 큰 행운보다 꾸준히 쌓는 방식이 더 잘 맞습니다.','기분에 따라 쓰거나 시작하면 흐름이 흔들릴 수 있습니다.','생각하지 않아도 돈이 남는 자동저축 같은 방법부터 만들어두는 게 좋습니다.','돈과 관련된 결정은 하루만 늦춰도 실수가 크게 줄어듭니다.'];
    }
    sections.push({title:moneyTitle,paras:moneyParas,hit:'당신에게 돈은 운보다 관리 방식에서 더 크게 남습니다.',basis:[a.wealthHeavy?'재성 강세':'재성 흐름',weakDay?'재다신약 경향':null,a.outputToWealth?'식상생재':null]});

    const workParas=a.outputToWealth
      ?['아이디어만 내는 것보다 실제 결과물로 만들 때 운이 살아납니다.','기획, 분석, 설계, 글, 기술처럼 실력을 눈에 보이게 만드는 일이 잘 맞습니다.','부업도 완전히 새로운 분야보다 지금 잘하는 일을 작게 상품으로 만드는 쪽이 유리합니다.','한 번 만들고 여러 번 활용할 수 있는 구조를 생각하면 성과가 커집니다.']
      :['새로운 일을 이해하고 정리하는 속도는 빠른 편입니다.','시키는 대로만 반복하는 일보다 문제를 찾고 고치는 일에서 실력이 드러납니다.','다만 잘하니까 일이 계속 몰릴 수 있습니다. 다 받아주면 결국 본인만 지칩니다.','시작하기 전에 어디까지 하면 끝인지 정해두는 편이 좋습니다.'];
    sections.push({title:a.outputToWealth?'아는 것과 만드는 것이 결국 돈이 되는 사람입니다':'일은 잘하는데, 여러 일을 한꺼번에 떠안는 편입니다',paras:workParas,hit:'잘하는 사람이 되는 것보다, 잘한 일이 내 자산으로 남게 만드는 것이 중요합니다.',basis:[a.outputToWealth?'식상생재 흐름':null,a.officerHeavy?'관성 강세':null,`${a.strong} 기운 강세`]});

    const relParas=['상대가 어떤 기분인지, 말에 숨은 뜻이 무엇인지 빨리 알아차립니다.','그런데 본인 마음은 참다가 결론만 짧게 말할 때가 있습니다.','그래서 가까운 사람은 “왜 진작 말하지 않았어?”라고 느낄 수 있습니다.','결론을 말하기 전에 서운했던 이유를 한 문장만 먼저 말해보세요.'];
    if(a.relations.length)relParas.push('혼자 끙끙거릴 때보다 믿을 만한 사람과 함께 움직일 때 일이 더 잘 풀립니다.');
    sections.push({title:'사람을 잘 보지만, 속마음은 늦게 말하는 편입니다',paras:relParas,hit:'사람을 보는 눈은 빠르지만, 내 마음을 보여주는 속도는 느린 편입니다.',basis:[a.dayGan==='辛'?'신금의 예민함':null,...a.relations,a.strength.root.label]});

    const balanceParas=[
      `${a.strong} 기운을 많이 쓰는 만큼, ${a.weak} 기운이 맡는 역할은 의식적으로 보완하는 편이 좋습니다.`,
      '부족한 기운을 성격처럼 억지로 만들 필요는 없습니다. 그 기능을 가진 사람, 일정표, 체크리스트, 환경을 빌리면 됩니다.',
      '삶이 꼬일 때는 강점을 더 세게 밀어붙이기보다, 반대 방식으로 한 번만 확인하는 것이 효과적입니다.',
      '당신은 성격을 바꿔야 하는 사람이 아니라, 강점을 쓸 장소와 약점을 보완할 도구를 고르면 되는 사람입니다.'
    ];
    sections.push({title:'운을 바꾸는 방법은 성격을 고치는 게 아닙니다',paras:balanceParas,hit:'강점으로 시작하고, 마무리할 때는 다른 관점을 빌리세요.',basis:[`${a.strong} 강세`,`${a.weak} 보완`,a.strength.grade]});

    return sections;
  }

  function render(a,concernText,hasTime){
    const c=classify(concernText);
    const tg1=a.tenGods[0],tg2=a.tenGods[1];
    const weakDay=['신약','중약'].includes(a.strength.grade);
    const oneLine=['money','business'].includes(c.id)
      ?(a.wealthHeavy&&weakDay?'돈복이 없는 게 아니라, 들어온 돈을 내 것으로 만드는 힘을 키우는 중입니다.':'잘하는 일을 돈으로 바꿀수록 운이 살아나는 사람입니다.')
      :(a.dayGan==='辛'?'남들이 놓치는 작은 차이를 먼저 알아보는 사람입니다.':'겉보다 속에서 생각이 더 많은 사람입니다.');

    const blocks=[];
    const focused=concernBlock(a,c,weakDay,tg1,tg2);
    if(focused)blocks.push(focused);
    blocks.push(...coreSections(a,c,weakDay,tg1,tg2));

    const intro=c.text
      ?`<div class="concern-quote">“${esc(c.text)}”라는 고민을 중심으로 읽었습니다.</div><div class="reading-intro">고민을 적어주신 만큼 일반적인 성격 풀이로 끝내지 않고, 현재 질문과 사주의 흐름이 어디에서 만나는지 함께 풀었습니다.</div>`
      :`<div class="reading-intro">한두 문장으로 단정하지 않고, 성격·돈·일·관계·균형을 차례대로 읽었습니다.</div>`;

    const html=`${c.text?`<div class="concern-badge show">💬 ${esc(c.label)} 중심 풀이</div>`:''}${intro}<div class="one-line">${esc(oneLine)}</div>${blocks.map((b,i)=>section(i+1,b.title,b.paras,b.basis,b.hit)).join('')}`;
    const closing={
      title:'마지막으로, 이 사주가 당신에게 해주고 싶은 말',
      paras:[
        weakDay?'당신이 약해서 힘들었던 것이 아니라, 한 번에 너무 많은 것을 감당하려 했기 때문에 지쳤을 가능성이 큽니다.':'당신은 자기 힘으로 방향을 만들 수 있는 사람입니다. 다만 강한 기준이 스스로를 몰아붙이는 압박이 되지 않도록 해야 합니다.',
        '지금까지 반복된 문제도 성격의 결함이라기보다, 같은 강점을 같은 방식으로 너무 오래 쓴 결과일 수 있습니다.',
        '앞으로는 더 세게 밀어붙이기보다, 하나를 끝내고 하나를 남기는 선택을 해보세요. 그 순간부터 운은 막연한 기대가 아니라 실제 변화로 보이기 시작합니다.'
      ]
    };
    return {category:c,hook:hook(a,c),html,closing};
  }

  window.BokReading={render,classify};
})();
