const API = {
  async request(path, options={}) {
    const headers={...(options.headers||{})};
    if(options.body && !(options.body instanceof FormData)) headers['Content-Type']='application/json';
    const response=await fetch(`/api${path}`,{credentials:'same-origin',...options,headers});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||'Something went wrong. Please try again.');
    return data;
  },
  get(path){return this.request(path)},
  post(path,body){return this.request(path,{method:'POST',body:body instanceof FormData?body:JSON.stringify(body)})},
  put(path,body){return this.request(path,{method:'PUT',body:JSON.stringify(body)})},
  patch(path,body){return this.request(path,{method:'PATCH',body:JSON.stringify(body)})},
  delete(path){return this.request(path,{method:'DELETE'})}
};
window.API=API;
