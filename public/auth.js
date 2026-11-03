(function(){
  var A=window.hatchable&&window.hatchable.auth;
  var form=document.getElementById('auth-form'), email=document.getElementById('email'), code=document.getElementById('code'), wrap=document.getElementById('code-wrap'), button=document.getElementById('auth-submit'), message=document.getElementById('auth-message');
  var step='email';
  function say(text,err){message.textContent=text||'';message.className='msg'+(err?' err':'');}
  function nextPath(){var raw=new URLSearchParams(location.search).get('next')||'/';return raw.charAt(0)==='/'&&raw.charAt(1)!=='/'&&!raw.includes('\\')?raw:'/';}
  if(!A){say('Authentication is unavailable. Refresh the page and try again.',true);button.disabled=true;return;}
  // Session status is also checked by the inline bootstrap on the login page.
  form.addEventListener('submit',async function(e){e.preventDefault();button.disabled=true;say('');try{if(step==='email'){var address=email.value.trim().toLowerCase();if(!address){say('Enter a valid email address.',true);return;}await A.startLogin({email:address});step='code';wrap.classList.remove('hidden');email.readOnly=true;button.textContent='Verify and sign in →';code.required=true;code.focus();say('A sign-in code has been sent. Check your email.');}else{var result=await A.verifyCode({email:email.value.trim().toLowerCase(),code:code.value.trim()});if(result&&result.user){location.replace(nextPath());return;}say('That code could not be verified. Try again.',true);}}catch(err){say(err&&err.message?err.message:'Sign-in failed. Check your details and try again.',true);}finally{button.disabled=false;}});
})();