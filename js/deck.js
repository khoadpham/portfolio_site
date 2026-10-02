(function(){
  var slides=document.querySelectorAll('.slide'),i=0,c=document.getElementById('count'),p=document.getElementById('prev'),n=document.getElementById('next');
  function show(k){
    i=Math.max(0,Math.min(slides.length-1,k));
    for(var j=0;j<slides.length;j++)slides[j].classList.toggle('on',j===i);
    c.textContent=(i+1)+' of '+slides.length;
    p.disabled=i===0;n.disabled=i===slides.length-1;
  }
  p.onclick=function(){show(i-1)};n.onclick=function(){show(i+1)};
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' ')show(i+1);
    if(e.key==='ArrowLeft'||e.key==='PageUp')show(i-1);
    if(e.key==='Home')show(0);
    if(e.key==='End')show(slides.length-1);
  });
  var x=null;
  document.addEventListener('touchstart',function(e){x=e.touches[0].clientX},{passive:true});
  document.addEventListener('touchend',function(e){
    if(x===null)return;var d=e.changedTouches[0].clientX-x;
    if(Math.abs(d)>50)show(d<0?i+1:i-1);x=null;
  });
  show(0);
})();
