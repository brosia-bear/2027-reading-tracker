(function(root){'use strict';
 const valid=(x,ids)=>{if(x===undefined)return true;if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).some(id=>!ids.includes(id)||typeof x[id]!=='boolean'))throw Error('Series review must contain only confirmed yes/no choices');return true;};
 const count=(seeds,choices)=>{const yes=seeds.filter(s=>choices?.[s.id]===true).length,no=seeds.filter(s=>choices?.[s.id]===false).length;return {yes,no,unreviewed:seeds.length-yes-no};};
 const api={valid,count};root.RosewoodSeriesReview=Object.freeze(api);if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
