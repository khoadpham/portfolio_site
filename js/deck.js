(function(){
  var slides=document.querySelectorAll('.slide'),i=0,c=document.getElementById('count'),p=document.getElementById('prev'),n=document.getElementById('next');
  var zoom=document.getElementById('zoom');
  function zoomOpen(){return zoom&&zoom.open}
  function show(k){
    i=Math.max(0,Math.min(slides.length-1,k));
    for(var j=0;j<slides.length;j++)slides[j].classList.toggle('on',j===i);
    c.textContent=(i+1)+' of '+slides.length;
    p.disabled=i===0;n.disabled=i===slides.length-1;
  }
  p.onclick=function(){show(i-1)};n.onclick=function(){show(i+1)};
  document.addEventListener('keydown',function(e){
    if(zoomOpen())return;
    if(e.key===' '&&e.target.closest&&e.target.closest('button'))return;
    if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' ')show(i+1);
    if(e.key==='ArrowLeft'||e.key==='PageUp')show(i-1);
    if(e.key==='Home')show(0);
    if(e.key==='End')show(slides.length-1);
  });
  var x=null;
  document.addEventListener('touchstart',function(e){x=zoomOpen()?null:e.touches[0].clientX},{passive:true});
  document.addEventListener('touchend',function(e){
    if(x===null)return;var d=e.changedTouches[0].clientX-x;
    if(Math.abs(d)>50)show(d<0?i+1:i-1);x=null;
  });
  show(0);
})();

// Full-screen image viewer with pan and zoom
(function(){
  var dlg=document.getElementById('zoom');
  if(!dlg)return;
  var stage=document.getElementById('zoom-stage'),img=document.getElementById('zoom-img'),level=document.getElementById('zoom-level');
  var w=0,h=0,s=1,tx=0,ty=0,minS=1,maxS=4,opener=null;
  var ptrs={},drag=null,pinch=null;

  function fitScale(){return Math.min(stage.clientWidth/w,stage.clientHeight/h)}
  function clamp(){
    var sw=stage.clientWidth,sh=stage.clientHeight,iw=w*s,ih=h*s;
    tx=iw<=sw?(sw-iw)/2:Math.min(0,Math.max(sw-iw,tx));
    ty=ih<=sh?(sh-ih)/2:Math.min(0,Math.max(sh-ih,ty));
  }
  function render(){
    clamp();
    img.style.transform='translate('+tx+'px,'+ty+'px) scale('+s+')';
    level.textContent=Math.round(s*100)+'%';
  }
  // Zoom to scale ns, keeping the stage point (px,py) fixed
  function zoomTo(ns,px,py){
    ns=Math.max(minS,Math.min(maxS,ns));
    if(px===undefined){px=stage.clientWidth/2;py=stage.clientHeight/2}
    tx=px-(px-tx)*ns/s;ty=py-(py-ty)*ns/s;s=ns;render();
  }
  // Fit large images to the screen; never upscale small ones past actual size
  function limits(){minS=Math.min(fitScale(),1);maxS=Math.max(2,minS*4)}
  function fit(){limits();s=minS;tx=0;ty=0;render()}
  function local(e){var r=stage.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}

  function open(btn){
    opener=btn;
    var preview=btn.querySelector('img');
    w=+btn.dataset.width||preview.naturalWidth||+preview.getAttribute('width');
    h=+btn.dataset.height||preview.naturalHeight||+preview.getAttribute('height');
    img.style.width=w+'px';img.style.height=h+'px';
    img.alt=preview.alt;
    img.src=preview.currentSrc||preview.src;
    if(btn.dataset.full){
      var full=new Image();
      full.onload=function(){if(opener===btn)img.src=full.src};
      full.src=btn.dataset.full;
    }
    dlg.showModal();
    fit();
  }
  function close(){dlg.close()}

  // Make every other figure image open in the viewer too
  document.querySelectorAll('figure img').forEach(function(im){
    if(im.closest('.zoom-open'))return;
    var btn=document.createElement('button');
    btn.type='button';btn.className='zoom-open';
    btn.setAttribute('aria-label','Open image full size: '+im.alt);
    im.parentNode.insertBefore(btn,im);btn.appendChild(im);
    var hint=document.createElement('span');hint.className='zoom-hint';hint.textContent='Click to enlarge';btn.appendChild(hint);
  });
  document.querySelectorAll('.zoom-open').forEach(function(btn){
    btn.addEventListener('click',function(){open(btn)});
  });
  dlg.addEventListener('close',function(){ptrs={};drag=pinch=null;if(opener)opener.focus();opener=null});
  document.getElementById('zoom-close').onclick=close;
  document.getElementById('zoom-fit').onclick=fit;
  document.getElementById('zoom-in').onclick=function(){zoomTo(s*1.5)};
  document.getElementById('zoom-out').onclick=function(){zoomTo(s/1.5)};
  window.addEventListener('resize',function(){
    if(!dlg.open)return;
    var rel=s/minS;limits();s=Math.max(minS,Math.min(maxS,minS*rel));render();
  });

  stage.addEventListener('wheel',function(e){
    e.preventDefault();
    var pt=local(e),d=e.deltaMode===1?e.deltaY*16:e.deltaY;
    zoomTo(s*Math.exp(-d*(e.ctrlKey?0.01:0.002)),pt[0],pt[1]);
  },{passive:false});

  stage.addEventListener('dblclick',function(e){
    var pt=local(e);
    zoomTo(s>=maxS*0.99?minS:s*2,pt[0],pt[1]);
  });

  stage.addEventListener('pointerdown',function(e){
    stage.setPointerCapture(e.pointerId);
    ptrs[e.pointerId]=local(e);
    var ids=Object.keys(ptrs);
    if(ids.length===1){drag={x:ptrs[ids[0]][0],y:ptrs[ids[0]][1],tx:tx,ty:ty};stage.classList.add('dragging')}
    if(ids.length===2){
      var a=ptrs[ids[0]],b=ptrs[ids[1]];
      pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),s:s};drag=null;
    }
  });
  stage.addEventListener('pointermove',function(e){
    if(!ptrs[e.pointerId])return;
    ptrs[e.pointerId]=local(e);
    var ids=Object.keys(ptrs);
    if(pinch&&ids.length===2){
      var a=ptrs[ids[0]],b=ptrs[ids[1]];
      zoomTo(pinch.s*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d,(a[0]+b[0])/2,(a[1]+b[1])/2);
    }else if(drag){
      var pt=ptrs[e.pointerId];
      tx=drag.tx+pt[0]-drag.x;ty=drag.ty+pt[1]-drag.y;render();
    }
  });
  function up(e){
    delete ptrs[e.pointerId];
    var ids=Object.keys(ptrs);
    pinch=null;
    if(ids.length===1){drag={x:ptrs[ids[0]][0],y:ptrs[ids[0]][1],tx:tx,ty:ty}}
    else{drag=null;stage.classList.remove('dragging')}
  }
  stage.addEventListener('pointerup',up);
  stage.addEventListener('pointercancel',up);

  dlg.addEventListener('keydown',function(e){
    var step=80,k=e.key;
    if(k==='+'||k==='='){zoomTo(s*1.5)}
    else if(k==='-'||k==='_'){zoomTo(s/1.5)}
    else if(k==='0'){fit()}
    else if(k==='ArrowLeft'){tx+=step;render()}
    else if(k==='ArrowRight'){tx-=step;render()}
    else if(k==='ArrowUp'){ty+=step;render()}
    else if(k==='ArrowDown'){ty-=step;render()}
    else return;
    e.preventDefault();
  });
})();
