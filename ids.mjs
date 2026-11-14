let sequence=0;
// Layer IDs identify local artwork; they are not credentials. randomUUID is
// restricted to secure contexts, while phones reach the LAN preview over HTTP.
export function createLayerId(source=globalThis.crypto){
 if(typeof source?.randomUUID==='function')return source.randomUUID();
 if(typeof source?.getRandomValues==='function'){
  const bytes=source.getRandomValues(new Uint8Array(16));
  bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
 }
 return `layer-${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2,10)}`;
}
