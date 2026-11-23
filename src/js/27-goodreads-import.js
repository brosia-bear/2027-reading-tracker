/* Session 14 supplemental user-initiated Goodreads CSV importer. No OAuth, sync or network.
  Preserve original columns as private metadata; never overwrite canonical 104 titles. */
(function(root){'use strict';
const HEADERS=['Book Id','Title','Author','Author l-f','Additional Authors','ISBN','ISBN13','My Rating','Publisher','Binding','Number of Pages','Year Published','Original Publication Year','Date Read','Date Added','Bookshelves','Bookshelves with positions','Exclusive Shelf','My Review','Spoiler','Private Notes','Read Count','Owned Copies'];
function csvParse(text){if(typeof text!=='string'||text.length>10*1024*1024)throw Error('CSV must be a text file no larger than 10 MB');const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}else if(c==='"'){if(cell!=='')throw Error('Unexpected quote in CSV');quoted=true;}else if(c===','){row.push(cell);cell='';}else if(c==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}else if(c==='\r'&&text[i+1]==='\n'){}else cell+=c;}
 if(quoted)throw Error('Unclosed quotation mark in CSV');if(row.length||cell){row.push(cell);rows.push(row)};return rows.filter(r=>r.some(c=>c.trim()));}
const norm=t=>String(t||'').normalize('NFKC').replace(/\s*\([^()]*,\s*#\d+(?:\.\d+)?\)\s*$/,'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
function rows(text){const data=csvParse(text);if(!data.length)throw Error('Goodreads CSV is empty');const headers=data.shift().map(x=>x.replace(/^\uFEFF/,'').trim());for(const h of HEADERS)if(!headers.includes(h))throw Error('Missing Goodreads column: '+h);
 const list=data.map((cells,i)=>{if(cells.length!==headers.length)throw Error('CSV row '+(i+2)+' has unexpected column count');const out={};for(const h of HEADERS)out[h]=String(cells[headers.indexOf(h)]??'').slice(0,50000);return out;});if(list.length>2000)throw Error('Maximum 2,000 books per import');return list;}
const validId=s=>/^\d{1,15}$/.test(String(s));
const goodreadsDate=s=>{if(!/^\d{4}\/\d\d\/\d\d$/.test(s))return null;const d=s.replaceAll('/','-');return new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d?d:null;};
function preview(csv,planned,custom){const list=rows(csv);const origin=new Set(planned.map(b=>norm(b.title)+'|'+norm(b.author)));const known=new Set(custom.map(b=>b.id));const records=[],seen=new Set(),skipped=[];
 for(const row of list){const grId=row['Book Id'].trim(),key=norm(row.Title)+'|'+norm(row.Author);if(!validId(grId)||!row.Title.trim()||!row.Author.trim()){skipped.push({title:row.Title,why:'Missing Goodreads ID/title/author'});continue;}
 const id='rosewood-custom-goodreads-'+grId;if(seen.has(id)){skipped.push({title:row.Title,why:'Repeated Goodreads ID in CSV'});continue;}seen.add(id);
 if(origin.has(key)){skipped.push({title:row.Title,why:'Matches protected original 104; existing catalog/progress untouched'});continue;}
 if(known.has(id)){skipped.push({title:row.Title,why:'Already imported; nothing overwritten'});continue;}
 if(custom.some(b=>norm(b.title)+'|'+norm(b.author)===key)){skipped.push({title:row.Title,why:'Already on personal shelf; review manually'});continue;}
 records.push({id,row});}
 return {records,skipped,input_count:list.length,new_count:records.length,read_count:records.filter(({row})=>row['Exclusive Shelf']==='read'&&goodreadsDate(row['Date Read'])).length,matching_plan:skipped.filter(s=>s.why.includes('protected')).length};}
function bookFrom(record){const {id,row}=record;const num=s=>/^\d+$/.test(String(s||'').trim())&&Number(s)>0?Number(s):null;const b={id,title:row.Title.trim().slice(0,240),author:row.Author.trim().slice(0,240),pathway:'other',goodreads_eligible:true,series_arc_id:null,pages:num(row['Number of Pages']),audio_minutes_1x:null,created_at:new Date().toISOString(),custom_profile:'Imported from an explicitly selected Goodreads CSV. Original metadata preserved below; no automatic Goodreads sync.',goodreads_data:row};
 const m=row.Title.match(/\(([^()]*)\s*,\s*#(\d+)(?:\.\d+)?\)\s*$/);if(m){b.series_name=m[1];const position=Number(m[2]);if(Number.isInteger(position)&&position>=1&&position<=9999)b.series_position=position;}
 const isbn=String(row.ISBN||'').replace(/^="?(.*?)"?$/,'$1').trim(),isbn13=String(row.ISBN13||'').replace(/^="?(.*?)"?$/,'$1').trim();const clean=/^(?:\d{13}|\d{9}[\dX])$/;b.isbn=clean.test(isbn13)?isbn13:clean.test(isbn)?isbn:null;
 return b;
}
function progressFrom(row){const date=goodreadsDate(row['Date Read']);if(row['Exclusive Shelf']!=='read'||!date)return null;
 const rating=Number(row['My Rating']);return {status:'finished',percent:100,started_at:null,finished_at:date,pages_read:null,audio_minutes_elapsed_1x:null,method:'unspecified',rating_quarter_stars:rating>=0.25&&rating<=5&&Number.isInteger(rating*4)?rating:null,notes:'',review:String(row['My Review']||'').slice(0,20000),goodreads_eligible:true,is_reread:false,reread_allowed:false};}
const api={HEADERS,csvParse,norm,rows,preview,bookFrom,progressFrom,goodreadsDate};root.RosewoodGoodreads=Object.freeze(api);if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
