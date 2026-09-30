"use strict";
globalThis.OrderOptions=Object.freeze({
 cents(value){const s=String(value??"").trim(),n=Number(s);return /^\d+(\.\d{1,2})?$/.test(s)&&n>0&&Number.isSafeInteger(Math.round(n*100))?Math.round(n*100):null;},
 key(p){return String(p.pageId||p.id||p.name);},
 variants(p){
  const options=Array.isArray(p.options)?p.options:[];
  if(!options.length)return [{...p,id:this.key(p),option_id:"",option_name:""}];
  return options.map(o=>({...p,id:this.key(p),option_id:o.id,option_name:o.name,price:String(o.price??"").trim()===""?p.price:o.price,spec:[p.spec,"選項："+o.name].filter(Boolean).join(" ／ ")}));
 },
 lines(catalog,items){
  if(!Array.isArray(items)||!items.length||items.length>100)throw Error("請選擇 1 至 100 筆商品。");
  const seen=new Set();
  return items.map(i=>{
   if(!i||typeof i.id!=="string"||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>99)throw Error("商品數量需為 1 至 99。");
   const found=catalog.filter(p=>this.key(p)===i.id);if(found.length!==1)throw Error("商品已變更，請重新選購。");
   const p=found[0],optionId=i.option_id??"";if(typeof optionId!=="string")throw Error("請重新選擇商品選項。");
   const variants=this.variants(p),matches=variants.filter(v=>v.option_id===optionId);
   if(matches.length!==1)throw Error("商品「"+p.name+"」的選項已變更，請重新選擇口味或規格。");
   const v=matches[0],price=this.cents(v.price),key=JSON.stringify([i.id,optionId]);
   if(seen.has(key))throw Error("同一商品選項請合併數量。");seen.add(key);
   if(price===null)throw Error("此商品選項請透過官方 LINE 詢價。");
   return {id:i.id,option_id:optionId,option_name:v.option_name,name:p.name,spec:v.spec||"",quantity:i.quantity,unit_price_cents:price};
  });
 }
});


