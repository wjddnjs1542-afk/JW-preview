
(function () {
  'use strict';
  const $=id=>document.getElementById(id);
  const modal=$('sajuModal'),form=$('sajuForm'),birth=$('birth'),birthTime=$('birthTime'),concern=$('concern');
  const errorBox=$('errorBox'),result=$('result');
  let calendar='solar',gender='male',lastContext=null;

  function openModal(){modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
  function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
  function setCalendar(value){
    calendar=value;
    $('solarBtn').classList.toggle('on',value==='solar');
    $('lunarBtn').classList.toggle('on',value==='lunar');
    $('leapRow').classList.toggle('show',value==='lunar');
  }
  function setGender(value){
    gender=value;
    $('maleBtn').classList.toggle('on',value==='male');
    $('femaleBtn').classList.toggle('on',value==='female');
  }
  function showError(message){errorBox.textContent=message;errorBox.classList.add('show')}
  function clearError(){errorBox.classList.remove('show');errorBox.textContent=''}

  function formatInput(){
    const digits=birth.value.replace(/\D/g,'').slice(0,8);
    if(digits.length<=4)birth.value=digits;
    else if(digits.length<=6)birth.value=`${digits.slice(0,4)}-${digits.slice(4)}`;
    else birth.value=`${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6)}`;
  }

  function timeLabel(h){
    const map={0:'23:00~01:00',1:'01:00~03:00',3:'03:00~05:00',5:'05:00~07:00',7:'07:00~09:00',9:'09:00~11:00',11:'11:00~13:00',13:'13:00~15:00',15:'15:00~17:00',17:'17:00~19:00',19:'19:00~21:00',21:'21:00~23:00'};
    return h<0?'출생시간 모름':map[h];
  }

  function applyFortune(a,birthData){
    const seed=(birthData.y*372+birthData.m*31+birthData.d+new Date().getDate())%100;
    const score=72+(seed%23);
    const by={
      목:['오늘은 미뤄둔 일을 시작하기 좋습니다.','여러 일을 동시에 벌이는 것','작은 결과물 하나를 남겨보세요.'],
      화:['말과 행동이 빨라지는 날입니다.','감정적으로 바로 답하는 것','중요한 말은 한 번 적고 보내세요.'],
      토:['흐트러진 것을 정리하면 마음도 편해집니다.','걱정을 오래 붙잡는 것','일정이나 지출 하나를 정리하세요.'],
      금:['판단이 또렷해지는 날입니다.','완벽하게 하다 늦어지는 것','불필요한 일 하나를 덜어내세요.'],
      수:['대화 속에서 답을 찾기 좋은 날입니다.','혼자 추측하는 것','궁금한 것은 직접 물어보세요.']
    }[a.strong];
    $('score').textContent=score;
    $('emoji').textContent=score>=88?'✨':score>=80?'🌿':'🍵';
    $('meter').style.width=score+'%';
    $('fortuneText').textContent=by[0];
    $('dailyChance').textContent=a.strong==='목'?'새로운 시작':a.strong==='화'?'표현과 설득':a.strong==='토'?'정리와 안정':a.strong==='금'?'검토와 결정':'정보와 대화';
    $('dailyCaution').textContent=by[1];
    $('dailyAction').textContent=by[2];
  }

  function renderResult(calc,a,birthData,h){
    $('yearPillar').textContent=calc.year;$('yearKorean').textContent=calc.yearKo;
    $('monthPillar').textContent=calc.month;$('monthKorean').textContent=calc.monthKo;
    $('dayPillar').textContent=calc.day;$('dayKorean').textContent=calc.dayKo;
    $('hourPillar').textContent=calc.hour||'미상';$('hourKorean').textContent=calc.hourKo||'시간 필요';
    $('dateInfo').textContent=`양력 ${birthData.y}년 ${birthData.m}월 ${birthData.d}일 · ${timeLabel(h)} · 한국 표준시 기준`;
    $('dayMaster').textContent=`일간 · ${a.dayGan}${a.dayElement}`;
    $('animal').textContent=`띠 · ${window.BokData.ANIMALS[calc.yearIndex%12]}`;
    $('strengthTag').textContent=`강약 · ${a.strength.grade}`;
    const reading=window.BokReading.render(a,concern.value,Boolean(calc.hour));
    $('hookLine').textContent=reading.hook;
    $('readingBody').innerHTML=reading.html;
    $('closingCard').innerHTML=`<h4>${reading.closing.title}</h4>${reading.closing.paras.map(p=>`<p>${p}</p>`).join('')}`;
    result.classList.add('show');
    applyFortune(a,birthData);
    setTimeout(()=>result.scrollIntoView({behavior:'smooth',block:'start'}),50);
  }

  function submitSaju(event){
    event.preventDefault();
    clearError();
    try{
      if(calendar==='lunar')throw new Error('음력 변환은 안정화 후 다시 열겠습니다. 현재는 양력으로 입력해주세요.');
      const birthData=window.BokEngine.parseBirth(birth.value);
      const h=Number(birthTime.value);
      const calc=window.BokEngine.calculate(birthData.y,birthData.m,birthData.d,h);
      const analysis=window.BokEngine.analyze(calc);
      renderResult(calc,analysis,birthData,h);
      lastContext={calc,analysis,birthData,h};
    }catch(err){
      showError(err instanceof Error?err.message:String(err));
    }
  }

  function showToday(){
    if(!lastContext){openModal();showError('먼저 내 사주를 조회해주세요.');return}
    applyFortune(lastContext.analysis,lastContext.birthData);
  }


  function toast(message){
    let el=document.querySelector('.toast');
    if(!el){el=document.createElement('div');el.className='toast';document.body.appendChild(el);}
    el.textContent=message;el.classList.add('show');
    clearTimeout(window.__bokToast);window.__bokToast=setTimeout(()=>el.classList.remove('show'),1600);
  }
  function resultText(){
    const title=$('hookLine').textContent.trim();
    const body=$('readingBody').innerText.trim();
    const close=$('closingCard').innerText.trim();
    return `복을 읽다\n\n${title}\n\n${body}\n\n${close}`;
  }
  async function copyResult(){
    if(!result.classList.contains('show')){toast('먼저 사주를 조회해주세요.');return;}
    try{await navigator.clipboard.writeText(resultText());toast('결과를 복사했습니다.');}
    catch{toast('복사에 실패했습니다.');}
  }
  async function shareResult(){
    if(!result.classList.contains('show')){toast('먼저 사주를 조회해주세요.');return;}
    const data={title:'복을 읽다',text:resultText(),url:location.href};
    try{
      if(navigator.share)await navigator.share(data);
      else{await navigator.clipboard.writeText(resultText()+'\n'+location.href);toast('공유할 내용을 복사했습니다.');}
    }catch(err){if(err&&err.name!=='AbortError')toast('공유에 실패했습니다.');}
  }
  function newReading(){
    result.classList.remove('show');
    clearError();
    form.scrollIntoView({behavior:'smooth',block:'start'});
  }


  function handleReaction(e){
    const btn=e.target.closest('[data-reaction]');
    if(!btn)return;
    document.querySelectorAll('[data-reaction]').forEach(x=>x.classList.remove('selected'));
    btn.classList.add('selected');
    try{localStorage.setItem('bok-reading-reaction',btn.dataset.reaction);}catch{}
    $('reactionThanks').textContent='고맙습니다. 첫 공개판을 다듬는 데 참고하겠습니다.';
  }

  function init(){
    $('today').textContent=`${new Date().getMonth()+1}월 ${new Date().getDate()}일`;
    $('openSajuBtn').addEventListener('click',openModal);
    $('navSajuBtn').addEventListener('click',openModal);
    $('closeSajuBtn').addEventListener('click',closeModal);
    modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
    $('todayFortuneBtn').addEventListener('click',showToday);
    $('navFortuneBtn').addEventListener('click',showToday);
    $('dreamBtn').addEventListener('click',()=>alert('꿈해몽은 다음 버전에서 열립니다.'));
    $('solarBtn').addEventListener('click',()=>setCalendar('solar'));
    $('lunarBtn').addEventListener('click',()=>setCalendar('lunar'));
    $('maleBtn').addEventListener('click',()=>setGender('male'));
    $('femaleBtn').addEventListener('click',()=>setGender('female'));
    birth.addEventListener('input',formatInput);
    concern.addEventListener('input',()=>{$('concernCount').textContent=concern.value.length});
    form.addEventListener('submit',submitSaju);
    $('copyResultBtn').addEventListener('click',copyResult);
    $('shareResultBtn').addEventListener('click',shareResult);
    $('newReadingBtn').addEventListener('click',newReading);
    $('reactionBox').addEventListener('click',handleReaction);

    if(new URLSearchParams(location.search).get('autotest')==='1'){
      openModal();
      birth.value='1987-03-23';
      birthTime.value='13';
      concern.value='경제적 상황이 나아질까요 돈많고싶어요';
      form.requestSubmit();
      document.body.dataset.autotest=result.classList.contains('show')?'passed':'failed';
    }
  }

  window.addEventListener('DOMContentLoaded',init);
})();
