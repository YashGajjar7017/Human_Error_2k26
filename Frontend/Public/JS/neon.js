// small helpers for neon UI
document.addEventListener('DOMContentLoaded', function(){
  // apply subtle animated glow to inputs on focus
  document.querySelectorAll('.glass-input, .glass-select').forEach(el=>{
    el.addEventListener('focus', ()=> el.style.boxShadow = '0 8px 30px rgba(155,89,255,0.08)');
    el.addEventListener('blur', ()=> el.style.boxShadow = 'none');
  });
});
