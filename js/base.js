/* QUIM300: base compartida de los resúmenes interactivos.
   Navegación por bloques, ajuste de ecuaciones al ancho, gráficos SVG,
   regresión lineal y motor de autoevaluación. */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s);};
var el=function(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
var QUIM={$:$,el:el};

/* ---------- Formato numérico (coma decimal) ---------- */
QUIM.fmt=function(x,sig){return Number(x.toPrecision(sig||3)).toString().replace('.',',');};
QUIM.sci=function(x,d){
  var s=x.toExponential(d==null?2:d).split('e'),e=parseInt(s[1],10);
  return s[0].replace('.',',')+' &times; 10<sup>'+String(e).replace('-','&minus;')+'</sup>';
};
QUIM.tick=function(v){return Number(v.toPrecision(6)).toString().replace('.',',').replace('-','−');};

/* ---------- MathJax síncrono para salidas dinámicas ---------- */
/* Devuelve el SVG de una expresión (ya renderizado) o, si MathJax aún no cargó, \( ... \) para que lo procese el typeset inicial. */
QUIM.m=function(tex){
  if(window.MathJax&&MathJax.tex2svg){try{return MathJax.tex2svg(tex).outerHTML;}catch(e){}}
  return '\\('+tex+'\\)';
};
/* Número a TeX con coma decimal y notación científica fuera de [1e-3, 1e5) */
QUIM.tn=function(x,sig){
  sig=sig||3;var v=Number(x.toPrecision(sig));if(v===0)return '0';
  var a=Math.abs(v);
  if(a<1e-3||a>=1e5){var e=Math.floor(Math.log(a)/Math.LN10+1e-12),mm=Number((v/Math.pow(10,e)).toPrecision(sig));
    return String(mm).replace('.','{,}')+'\\times10^{'+e+'}';}
  return String(v).replace('.','{,}');
};

/* Marcas de eje "bonitas": devuelve valores entre min y max con paso 1, 2 o 5 por potencia de 10 */
QUIM.nice=function(min,max,n){
  var span=max-min,raw=span/(n||5),p=Math.pow(10,Math.floor(Math.log(raw)/Math.LN10)),f=raw/p;
  var step=(f<1.5?1:f<3.5?2:f<7.5?5:10)*p,out=[],v=Math.ceil(min/step-1e-9)*step,k=0;
  while(v<=max+step*1e-9&&k++<50){out.push(Math.abs(v)<step*1e-9?0:Number(v.toPrecision(12)));v+=step;}
  return out;
};

/* ---------- Regresión lineal ---------- */
QUIM.regress=function(xs,ys){
  var n=xs.length,sx=0,sy=0,sxx=0,sxy=0,syy=0,i;
  for(i=0;i<n;i++){sx+=xs[i];sy+=ys[i];sxx+=xs[i]*xs[i];sxy+=xs[i]*ys[i];syy+=ys[i]*ys[i];}
  var m=(n*sxy-sx*sy)/(n*sxx-sx*sx),b=(sy-m*sx)/n;
  var r=(n*sxy-sx*sy)/Math.sqrt((n*sxx-sx*sx)*(n*syy-sy*sy));
  return {m:m,b:b,r2:r*r};
};

/* ---------- Ecuaciones: tipografía y ajuste al ancho ---------- */
function fitFormulas(){
  [].forEach.call(document.querySelectorAll('.formula'),function(f){
    var c=f.querySelector('mjx-container'),s=c&&c.querySelector('svg');
    if(!s||!f.clientWidth)return;
    c.style.zoom=1;
    var cs=getComputedStyle(f),avail=f.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),w=s.getBoundingClientRect().width;
    if(w>avail)c.style.zoom=Math.max(0.5,avail/w).toFixed(3);
  });
}
QUIM.fit=fitFormulas;
QUIM.typeset=function(node){
  if(window.MathJax&&MathJax.typesetPromise)MathJax.typesetPromise([node||document.body]).then(fitFormulas);
};
window.addEventListener('resize',fitFormulas);
window.addEventListener('load',function(){if(window.MathJax&&MathJax.startup)MathJax.startup.promise.then(fitFormulas);});

/* ---------- Gráficos SVG ---------- */
QUIM.chart=function(svg,o){
  var W=o.W||560,H=o.H||320,L=o.l!=null?o.l:66,R=o.r!=null?o.r:26,T=o.t!=null?o.t:20,B=o.b!=null?o.b:54;
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  var x0=o.x[0],x1=o.x[1],y0=o.y[0],y1=o.y[1],INK='#59627a';
  var X=function(v){return L+(v-x0)/(x1-x0)*(W-L-R);};
  var Y=function(v){return H-B-(v-y0)/(y1-y0)*(H-T-B);};
  var P=function(x,y){return X(x).toFixed(1)+' '+Y(y).toFixed(1);};
  var xf=o.xf||QUIM.tick,yf=o.yf||QUIM.tick,h='';
  (o.yt||[]).forEach(function(v){
    h+='<line x1="'+L+'" y1="'+Y(v)+'" x2="'+(W-R)+'" y2="'+Y(v)+'" stroke="#e6eaf3"/>'+
       '<line x1="'+(L-5)+'" y1="'+Y(v)+'" x2="'+L+'" y2="'+Y(v)+'" stroke="'+INK+'"/>'+
       '<text x="'+(L-9)+'" y="'+(Y(v)+4)+'" text-anchor="end" font-size="13" fill="'+INK+'">'+yf(v)+'</text>';});
  (o.xt||[]).forEach(function(v){
    h+=(o.xgrid?'<line x1="'+X(v)+'" y1="'+T+'" x2="'+X(v)+'" y2="'+(H-B)+'" stroke="#e6eaf3"/>':'')+
       '<line x1="'+X(v)+'" y1="'+(H-B)+'" x2="'+X(v)+'" y2="'+(H-B+5)+'" stroke="'+INK+'"/>'+
       '<text x="'+X(v)+'" y="'+(H-B+20)+'" text-anchor="middle" font-size="13" fill="'+INK+'">'+xf(v)+'</text>';});
  h+='<line x1="'+L+'" y1="'+(H-B)+'" x2="'+(W-R)+'" y2="'+(H-B)+'" stroke="'+INK+'" stroke-width="1.5"/>'+
     '<line x1="'+L+'" y1="'+T+'" x2="'+L+'" y2="'+(H-B)+'" stroke="'+INK+'" stroke-width="1.5"/>';
  if(o.xl)h+='<text x="'+((L+W-R)/2)+'" y="'+(H-8)+'" text-anchor="middle" font-size="14" fill="'+INK+'">'+o.xl+'</text>';
  if(o.yl)h+='<text transform="translate(17 '+((T+H-B)/2)+') rotate(-90)" text-anchor="middle" font-size="14" fill="'+INK+'">'+o.yl+'</text>';
  var api={X:X,Y:Y,W:W,H:H,L:L,R:R,T:T,B:B};
  api.add=function(s){h+=s;return api;};
  api.path=function(pts,c,w,dash){
    var d='',pen=false;
    pts.forEach(function(p){
      var ok=isFinite(p[1])&&p[1]>=y0-1e-9&&p[1]<=y1+1e-9&&p[0]>=x0-1e-9&&p[0]<=x1+1e-9;
      if(ok){d+=(pen?'L':'M')+P(p[0],p[1]);pen=true;}else pen=false;});
    h+='<path d="'+d+'" fill="none" stroke="'+(c||'#1f5fbf')+'" stroke-width="'+(w||3)+'" stroke-linejoin="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
    return api;};
  api.fn=function(f,a,b,n,c,w,dash){
    var pts=[],i;for(i=0;i<=n;i++){var x=a+(b-a)*i/n;pts.push([x,f(x)]);}
    return api.path(pts,c,w,dash);};
  api.line=function(xa,ya,xb,yb,c,w,dash){
    h+='<line x1="'+X(xa).toFixed(1)+'" y1="'+Y(ya).toFixed(1)+'" x2="'+X(xb).toFixed(1)+'" y2="'+Y(yb).toFixed(1)+'" stroke="'+(c||INK)+'" stroke-width="'+(w||1.5)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
    return api;};
  api.dots=function(pts,c,r){
    pts.forEach(function(p){h+='<circle cx="'+X(p[0]).toFixed(1)+'" cy="'+Y(p[1]).toFixed(1)+'" r="'+(r||4.5)+'" fill="'+(c||'#1f5fbf')+'" stroke="#fff" stroke-width="1.5"/>';});
    return api;};
  api.text=function(x,y,t,op){
    op=op||{};
    h+='<text x="'+(X(x)+(op.dx||0)).toFixed(1)+'" y="'+(Y(y)+(op.dy||0)).toFixed(1)+'" font-size="'+(op.s||14)+'" fill="'+(op.c||INK)+'"'+(op.a?' text-anchor="'+op.a+'"':'')+(op.w?' font-weight="'+op.w+'"':'')+'>'+t+'</text>';
    return api;};
  api.done=function(){svg.innerHTML=h;return api;};
  return api;
};

/* ---------- Inicialización de la página ---------- */
QUIM.init=function(cfg){
  var secs=cfg.sections,order=secs.map(function(s){return s.id;}),titles={};
  secs.forEach(function(s,i){titles[s.id]=(i+1)+'. '+s.title;});
  if(cfg.quiz){order.push('quiz');titles.quiz='Autoevaluación';}
  var PDFI='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M4 17v3h16v-3"/></svg>';

  /* barra lateral */
  var menu=secs.map(function(s,i){return '<a href="#'+s.id+'" data-id="'+s.id+'"><span class="badge">'+(i+1)+'</span>'+s.title+'</a>';}).join('');
  if(cfg.quiz)menu+='<a href="#quiz" data-id="quiz" class="qz"><span class="badge">&#9998;</span>Autoevaluación</a>';
  $('#side').innerHTML='<a class="home" href="index.html">&larr; Todas las actividades</a>'+
    '<div class="brand"><b>'+cfg.title+'</b><small>'+cfg.subtitle+'</small></div><nav id="menu">'+menu+'</nav>'+
    (cfg.pdf?'<a class="pdfbtn" href="'+cfg.pdf+'" download>'+PDFI+'<span>Descargar resumen en PDF</span></a>':'');
  $('#topbar').innerHTML='<button id="burger" type="button" aria-label="Abrir menú" aria-expanded="false">&#9776;</button><span id="tbTitle"></span>'+
    (cfg.pdf?'<a class="pdfbtn" href="'+cfg.pdf+'" download aria-label="Descargar resumen en PDF">'+PDFI+'<span>PDF</span></a>':'');
  var main=$('main');
  var pt=el('div','print-only ptitle','<small>Universidad Andrés Bello &middot; Fisicoquímica Aplicada QUIM300</small><h1>'+cfg.title+'</h1><p>'+cfg.subtitle+'</p>');
  main.insertBefore(pt,main.firstChild);
  var pager=el('nav');pager.id='pager';pager.setAttribute('aria-label','Navegación entre bloques');main.appendChild(pager);
  [].forEach.call(document.querySelectorAll('main > section.card'),function(s){s.classList.add('view');s.hidden=true;});

  function show(id){
    [].forEach.call(document.querySelectorAll('.view'),function(v){v.hidden=(v.id!==id);});
    [].forEach.call(document.querySelectorAll('#menu a'),function(a){var on=a.dataset.id===id;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    $('#tbTitle').textContent=titles[id];
    var i=order.indexOf(id),p=order[i-1],n=order[i+1];
    pager.innerHTML=(p?'<a href="#'+p+'">&larr; '+titles[p]+'</a>':'<span></span>')+(n?'<a href="#'+n+'">'+titles[n]+' &rarr;</a>':'<span></span>');
    document.body.classList.remove('open');$('#burger').setAttribute('aria-expanded','false');
    window.scrollTo(0,0);
    fitFormulas();
  }
  function route(){var h=(location.hash||'').slice(1);show(order.indexOf(h)<0?order[0]:h);}
  $('#burger').addEventListener('click',function(){var o=document.body.classList.toggle('open');this.setAttribute('aria-expanded',o?'true':'false');});
  $('#scrim').addEventListener('click',function(){document.body.classList.remove('open');});

  if(cfg.quiz)buildQuizEngine(cfg,main,pager);
  if(cfg.ready)cfg.ready();
  window.addEventListener('hashchange',route);
  route();
};

/* ---------- Autoevaluación ---------- */
function buildQuizEngine(cfg,main,pager){
  var TOPICS=cfg.quiz.topics,VF=cfg.quiz.vf||[],SU=cfg.quiz.su||[],CALC=cfg.quiz.calc||[];
  var TOTAL=VF.length+SU.length+CALC.length,results={};
  var qv=el('div','view');qv.id='quiz';qv.hidden=true;
  qv.innerHTML='<div class="status" role="status"><span id="st"></span><span id="pt"></span><div class="grow"><div id="bar"><i></i></div></div><button class="btn sec" id="reset" type="button">Reiniciar</button></div>'+
    '<h4 style="margin-top:18px">Verdadero o falso</h4><div id="vf"></div>'+
    '<h4 style="margin-top:26px">Selección única</h4><div id="su"></div>'+
    '<h4 style="margin-top:26px">Cálculos</h4><div id="calc"></div>'+
    '<section class="card" style="margin-top:24px"><h3>Resultados por tema</h3><ul id="topics"></ul></section>';
  main.insertBefore(qv,pager);
  var fmt=QUIM.fmt;

  function mark(id,topic,ok){results[id]={t:topic,ok:ok};updateStatus();}
  function updateStatus(){
    var ids=Object.keys(results),hits=ids.filter(function(k){return results[k].ok;}).length;
    $('#st').textContent='Respondidas '+ids.length+' de '+TOTAL;
    $('#pt').textContent='Aciertos '+hits;
    $('#bar i').style.width=(ids.length/TOTAL*100)+'%';
    var cnt={},ans={},okc={};
    [VF,SU,CALC].forEach(function(arr){arr.forEach(function(q){cnt[q.t]=(cnt[q.t]||0)+1;});});
    ids.forEach(function(k){var t=results[k].t;ans[t]=(ans[t]||0)+1;if(results[k].ok)okc[t]=(okc[t]||0)+1;});
    var h='';
    Object.keys(TOPICS).forEach(function(t){
      var a=ans[t]||0,o=okc[t]||0,n=cnt[t]||0,extra='';
      if(a===n&&o<n)extra=' &middot; <a href="'+TOPICS[t].a+'">Repasar bloque</a>';
      h+='<li><span>'+TOPICS[t].n+'</span><span>'+(a?o+' de '+n+' correctas'+(a<n?' ('+a+' respondidas)':''):'sin responder')+extra+'</span></li>';
    });
    $('#topics').innerHTML=h;
  }
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function tsFb(fb){QUIM.typeset(fb);}

  function buildVF(){
    var box=$('#vf');box.innerHTML='';
    VF.forEach(function(q,i){
      var card=el('div','q','<span class="tag">V/F '+(i+1)+'</span><p class="qt">'+q.q+'</p><div class="tf"><button type="button" data-v="1">Verdadero</button><button type="button" data-v="0">Falso</button></div><div class="fb" hidden aria-live="polite"></div>');
      var btns=[].slice.call(card.querySelectorAll('button')),fb=card.querySelector('.fb');
      btns.forEach(function(b){b.addEventListener('click',function(){
        var val=b.dataset.v==='1',ok=(val===q.ans);
        btns.forEach(function(x){x.disabled=true;});
        b.classList.add(ok?'correct':'wrong');
        if(!ok)btns.filter(function(x){return (x.dataset.v==='1')===q.ans;})[0].classList.add('reveal');
        fb.hidden=false;fb.className='fb '+(ok?'ok':'bad');
        fb.innerHTML='<b>'+(ok?'Correcto.':'Incorrecto.')+'</b> La afirmación es '+(q.ans?'verdadera':'falsa')+'.<p>'+q.exp+'</p>';tsFb(fb);
        mark('vf'+i,q.t,ok);
      });});
      box.appendChild(card);
    });
  }
  function buildSU(){
    var box=$('#su');box.innerHTML='';
    SU.forEach(function(q,i){
      var opts=shuffle(q.o),L='ABCD';
      var card=el('div','q','<span class="tag">SELECCIÓN ÚNICA '+(i+1)+'</span><p class="qt">'+q.q+'</p><div class="opts"></div><div class="fb" hidden aria-live="polite"></div>');
      var wrap=card.querySelector('.opts'),fb=card.querySelector('.fb'),btns=[];
      opts.forEach(function(o,j){
        var b=el('button',null,'<span class="ltr">'+L[j]+'.</span><span>'+o.x+'</span>');b.type='button';btns.push(b);
        b.addEventListener('click',function(){
          btns.forEach(function(x){x.disabled=true;});
          var ok=!!o.ok,right=opts.filter(function(p){return p.ok;})[0],ri=opts.indexOf(right);
          b.classList.add(ok?'correct':'wrong');
          if(!ok)btns[ri].classList.add('reveal');
          fb.hidden=false;fb.className='fb '+(ok?'ok':'bad');
          fb.innerHTML=ok?'<b>Correcto.</b><p>'+o.w+'</p>':'<b>Incorrecto.</b><p>'+o.w+'</p><p><b>Respuesta correcta: '+L[ri]+'.</b> '+right.w+'</p>';tsFb(fb);
          mark('su'+i,q.t,ok);
        });
        wrap.appendChild(b);
      });
      box.appendChild(card);
    });
  }
  /* Lista desplegable propia: admite MathJax en las opciones (un <select> nativo no) */
  function makeDropdown(opts){
    var wrap=el('div','dd'),btn=el('button','ddb','<span class="ddv">Unidades</span><span class="ddc" aria-hidden="true">&#9662;</span>'),
        ul=el('ul','ddl');
    btn.type='button';btn.setAttribute('aria-haspopup','listbox');btn.setAttribute('aria-expanded','false');
    ul.setAttribute('role','listbox');ul.hidden=true;
    var dd={el:wrap,value:'',btn:btn};
    opts.forEach(function(t,j){
      var li=el('li',null,'\\( '+t+' \\)');li.setAttribute('role','option');li.setAttribute('tabindex','-1');li.dataset.v=j;
      li.addEventListener('click',function(){pick(j,li);});
      li.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(j,li);}
        else if(e.key==='ArrowDown'){e.preventDefault();(li.nextSibling||ul.firstChild).focus();}
        else if(e.key==='ArrowUp'){e.preventDefault();(li.previousSibling||ul.lastChild).focus();}
        else if(e.key==='Escape'){close(true);}
      });
      ul.appendChild(li);
    });
    function open(){ul.hidden=false;btn.setAttribute('aria-expanded','true');}
    function close(focus){ul.hidden=true;btn.setAttribute('aria-expanded','false');if(focus)btn.focus();}
    function pick(j,li){
      dd.value=String(j);
      btn.querySelector('.ddv').innerHTML=li.innerHTML;
      [].forEach.call(ul.children,function(c){c.setAttribute('aria-selected',c===li?'true':'false');});
      close(true);
    }
    btn.addEventListener('click',function(){if(ul.hidden)open();else close(false);});
    btn.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();open();ul.firstChild.focus();}});
    document.addEventListener('click',function(e){if(!wrap.contains(e.target))close(false);});
    dd.disable=function(){btn.disabled=true;close(false);};
    wrap.appendChild(btn);wrap.appendChild(ul);
    return dd;
  }
  function buildCALC(){
    var box=$('#calc');box.innerHTML='';
    CALC.forEach(function(q,i){
      if(q.pre)box.appendChild(el('div','data',q.pre));
      var card=el('div','q','<span class="tag">CÁLCULO '+(i+1)+'</span><p class="qt">'+q.q+'</p><div class="calc-row"><input type="text" inputmode="decimal" autocomplete="off" placeholder="'+(q.ph||'ej. 2,5')+'" aria-label="Respuesta numérica"><span class="uslot">'+(q.unit?'<span class="unit">\\( '+q.unit+' \\)</span>':'')+'</span><button type="button" class="btn">Comprobar</button><button type="button" class="btn sec">Ver solución</button></div><div class="fb" hidden aria-live="polite"></div>');
      var inp=card.querySelector('input'),bs=card.querySelectorAll('button.btn'),chk=bs[0],sol=bs[1],fb=card.querySelector('.fb');
      var dd=null,tries=0,done=false,tol=q.tol||0.02;
      if(q.uopts){dd=makeDropdown(q.uopts);card.querySelector('.uslot').appendChild(dd.el);}
      function finish(){done=true;inp.disabled=true;chk.disabled=true;sol.disabled=true;if(dd)dd.disable();}
      function ansTex(){return q.ansTex||(QUIM.tn(q.ans)+(q.unit?'\\ '+q.unit:''));}
      function check(){
        if(done)return;
        var v=parseFloat(inp.value.replace(',','.'));
        if(isNaN(v)){fb.hidden=false;fb.className='fb info';fb.innerHTML='Ingrese un valor numérico.';return;}
        if(dd&&dd.value===''){fb.hidden=false;fb.className='fb info';fb.innerHTML='Seleccione las unidades.';return;}
        tries++;
        var numOk=Math.abs(v-q.ans)<=tol*Math.abs(q.ans),unitOk=!dd||dd.value===String(q.uok);
        var ok=numOk&&unitOk;
        if(ok){
          fb.hidden=false;fb.className='fb ok';
          fb.innerHTML='<b>Correcto'+(tries>1?' (tras '+tries+' intentos)':'')+'.</b><div class="sol">'+q.sol+'</div>';tsFb(fb);
          finish();
          if(!(('calc'+i) in results))mark('calc'+i,q.t,tries===1);
        }else{
          fb.hidden=false;fb.className='fb bad';
          var given=QUIM.tn(v)+(dd?'\\ '+q.uopts[+dd.value]:(q.unit?'\\ '+q.unit:''));
          fb.innerHTML='<b>Incorrecto.</b> '+(numOk?'El valor numérico es correcto, pero las unidades no.':'Respuesta ingresada: \\( '+given+' \\).')+'<p>Pista: '+q.hint+'</p>';tsFb(fb);
          if(!(('calc'+i) in results))mark('calc'+i,q.t,false);
        }
      }
      chk.addEventListener('click',check);
      inp.addEventListener('keydown',function(e){if(e.key==='Enter')check();});
      sol.addEventListener('click',function(){
        if(done)return;
        fb.hidden=false;fb.className='fb info';fb.innerHTML='<b>Solución.</b><div class="sol">'+q.sol+'</div><p>Respuesta: \\( '+ansTex()+' \\)</p>';tsFb(fb);
        finish();
        if(!(('calc'+i) in results))mark('calc'+i,q.t,false);
      });
      box.appendChild(card);
    });
  }
  function build(){
    results={};buildVF();buildSU();buildCALC();updateStatus();
    if(window.MathJax&&MathJax.typesetPromise)MathJax.typesetPromise([qv]);
  }
  $('#reset').addEventListener('click',function(){build();window.scrollTo(0,0);});
  build();
}

window.QUIM=QUIM;
})();
