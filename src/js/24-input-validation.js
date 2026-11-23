/* Rosewood Library Session 7: pure, testable input validation and duplicate review.
  No reader notes, IDs or progress are transmitted to any external service. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.RosewoodCustom=api;})(typeof window!=='undefined'?window:globalThis,function(root){
 'use strict';
 const PATHS=new Set(['discworld','completed_fantasy_arc','philosophy','nonfiction_research','standalone_literature_fantasy','other']);
 const trim=(v,max,label,required=false)=>{const s=String(v??'').trim();if(required&&!s)throw Error(label+' is required.');if(s.length>max)throw Error(label+' is too long (maximum '+max+' characters).');if(/[\u0000-\u0008\u000B-\u001F\u007F]/.test(s))throw Error(label+' includes unsupported control characters.');return s;};
 const normalize=v=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
 function positive(v,label,maximum){if(v===null||v===undefined||v==='')return null;const n=Number(v);if(!Number.isSafeInteger(n)||n<1||n>maximum)throw Error(label+' must be a whole number from 1 to '+maximum+'.');return n;}
 function safeCoverURL(value){const s=trim(value,2048,'Cover URL');if(!s)return null;let u;try{u=new URL(s);}catch(_){throw Error('Cover URL must be a full HTTPS address.');}
  if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash||!u.hostname.includes('.')||/^(?:localhost|\d+(?:\.\d+){3}|\[.*\])$/i.test(u.hostname)||/\.(?:local|localhost|internal|test|invalid)$/i.test(u.hostname))throw Error('Use a public HTTPS image URL without credentials, custom ports or fragments.');
  if(!/\.(?:png|jpe?g|webp|gif|avif)(?:$|\?)/i.test(u.pathname+u.search)&&!/^covers\.openlibrary\.org$/i.test(u.hostname))throw Error('Cover URL must point to an image file or Open Library cover.');
  return u.toString();
 }
 function isbn(value){const s=trim(value,26,'ISBN').replace(/[\s-]/g,'').toUpperCase();if(!s)return null;
  if(/^\d{13}$/.test(s)){const sum=s.split('').reduce((a,d,i)=>a+Number(d)*(i%2?3:1),0);if(sum%10!==0)throw Error('ISBN-13 check digit is invalid.');return s;}
  if(/^\d{9}[\dX]$/.test(s)){const total=s.split('').reduce((a,d,i)=>a+(10-i)*(d==='X'?10:Number(d)),0);if(total%11!==0)throw Error('ISBN-10 check digit is invalid.');return s;}
  throw Error('Enter a valid ISBN-10 or ISBN-13, or leave it blank.');
 }
 function validateInput(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Book details are missing.');
  const title=trim(raw.title,240,'Title',true),author=trim(raw.author,240,'Author',true);
  const pathway=String(raw.pathway||'other');if(!PATHS.has(pathway))throw Error('Choose a valid reading pathway.');
  if(typeof raw.goodreads_eligible!=='boolean')throw Error('Choose whether this book is Goodreads-eligible.');
  const genre=trim(raw.genre,100,'Genre'),series_name=trim(raw.series_name,240,'Series name'),notes=trim(raw.notes,12000,'Notes');
  const series_position=positive(raw.series_position,'Series number',9999),pages=positive(raw.pages,'Pages',100000),audio_minutes_1x=positive(raw.audio_minutes_1x,'Audio duration',100000);
  const isbn_value=isbn(raw.isbn),url=safeCoverURL(raw.cover_url);
  const cover_override=url?{url,source:'user_supplied_url',edition_verified:false}:isbn_value?{url:`https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn_value)}-M.jpg?default=false`,source:'user_supplied_isbn',edition_verified:false}:null;
  return {title,author,pathway,goodreads_eligible:raw.goodreads_eligible,genre,series_name,series_position,pages,audio_minutes_1x,notes,isbn:isbn_value,cover_override};
 }
 function duplicates(book,planned,custom,editingId=null){const key=normalize(book.title)+'::'+normalize(book.author);return [...planned,...custom].filter(b=>b.id!==editingId&&normalize(b.title)+'::'+normalize(b.author)===key).map(b=>({id:b.id,title:b.title,author:b.author,origin:b.id.startsWith('rosewood-custom-')?'added book':'original 104'}));}
 function newId(){const c=root.crypto;if(c?.randomUUID)return 'rosewood-custom-'+c.randomUUID();if(c?.getRandomValues){const bytes=new Uint8Array(16);c.getRandomValues(bytes);return 'rosewood-custom-'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');}throw Error('Secure book ID generation is unavailable on this device. No book was saved.');}
 function toRecord(details,id,created_at,previous=null){const b={id,title:details.title,author:details.author,pathway:details.pathway,goodreads_eligible:details.goodreads_eligible,series_arc_id:previous?.series_arc_id??null,pages:details.pages,audio_minutes_1x:details.audio_minutes_1x,created_at,custom_profile:previous?.custom_profile??'',genre:details.genre,series_name:details.series_name,series_position:details.series_position,notes:details.notes,isbn:details.isbn,cover_override:details.cover_override,updated_at:new Date().toISOString()};return b;}
 return Object.freeze({PATHS,normalize,positive,safeCoverURL,isbn,validateInput,duplicates,newId,toRecord});
});
