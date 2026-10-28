document.addEventListener('DOMContentLoaded',()=>{
 const form=document.querySelector('[data-auth-form]');if(!form)return;
 form.addEventListener('submit',async e=>{e.preventDefault();const out=form.querySelector('[data-message]');out.textContent='';try{const data=Object.fromEntries(new FormData(form));const route=form.dataset.authForm==='register'?'/auth/register':'/auth/login';await API.post(route,data);location.href=new URLSearchParams(location.search).get('next')|| (data.email?.toLowerCase().includes('owner')?'/admin.html':'/my-bookings.html');}catch(err){out.textContent=err.message;out.className='notice error';}});
});
