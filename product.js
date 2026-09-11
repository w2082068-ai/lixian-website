"use strict";
const $=id=>document.getElementById(id);
let photos=[],selected=0,zoom=1,productName="",loadVersion=0;
const box=$("lightbox"), main=$("main-photo");
function changeZoom(value){zoom=Math.min(3,Math.max(1,value));$("zoom-photo").style.width=(zoom*100)+"%";$("zoom-photo").style.height=(zoom*100)+"%";$("zoom-value").textContent=Math.round(zoom*100)+"%";$("zoom-out").disabled=zoom<=1;$("zoom-in").disabled=zoom>=3;}
function updateLightbox(){changeZoom(1);$("zoom-photo").src=photos[selected];$("zoom-photo").alt=productName+"，第 "+(selected+1)+" 張照片";$("lightbox-count").textContent=(selected+1)+" / "+photos.length;$("zoom-area").scrollTo(0,0);}
function showPhoto(index){
  if(!photos.length)return;
  selected=(index+photos.length)%photos.length;
  const img=document.createElement("img");img.src=photos[selected];img.alt=productName+"，第 "+(selected+1)+" 張照片";
  main.disabled=false;main.replaceChildren(img);
  img.addEventListener("error",()=>{if(selected===index || main.contains(img)){main.textContent="這張照片暫時無法顯示，請選擇其他照片。";main.disabled=true;}},{once:true});
  $("photo-count").textContent=(selected+1)+" / "+photos.length;
  Array.from($("thumbnails").children).forEach((button,i)=>button.setAttribute("aria-pressed",String(i===selected)));
  if(box.open)updateLightbox();
}
function render(product){
  productName=product.name;document.title=productName+"｜儷鮮嚴選";
  document.querySelector('meta[name="description"]').content=[product.name,product.spec,product.description].filter(Boolean).join("，").slice(0,160);
  $("name").textContent=product.name;$("spec").textContent=product.spec||"";
  $("category").textContent=product.category;$("category").href="./?category="+encodeURIComponent(product.category);
  const price=Catalog.price(product.price);$("price").textContent=price;$("price").classList.toggle("ask",price==="價格請洽 LINE");
  $("description").textContent=typeof product.description==="string" && product.description.trim()?product.description:"商品詳細資訊歡迎透過官方 LINE 洽詢。";
  photos=Catalog.photos(product);selected=0;$("thumbnails").replaceChildren();
  photos.forEach((src,i)=>{const button=document.createElement("button");button.type="button";button.className="thumbnail";button.setAttribute("aria-label","查看第 "+(i+1)+" 張照片");button.setAttribute("aria-pressed",String(i===0));const img=document.createElement("img");img.src=src;img.alt="";img.loading="lazy";img.addEventListener("error",()=>{button.textContent=String(i+1);},{once:true});button.append(img);button.addEventListener("click",()=>showPhoto(i));$("thumbnails").append(button);});
  for(const id of ["previous","next","lightbox-previous","lightbox-next"])$(id).disabled=photos.length<2;
  document.querySelector(".gallery-tools").hidden=photos.length<2;$("thumbnails").hidden=photos.length<2;$("photo-tip").hidden=!photos.length;
  if(photos.length)showPhoto(0);else{main.textContent="商品照片準備中";main.disabled=true;}
  $("status").hidden=true;$("product").hidden=false;
}
async function load(){
 const version=++loadVersion;$("status").hidden=false;$("status").textContent="商品載入中…";$("error").hidden=true;$("product").hidden=true;
 try{
  const id=new URLSearchParams(location.search).get("id");
  if(!id){showError("請先從商品列表選擇要查看的商品。",false);return;}
  const response=await fetch("./products.json",{cache:"no-cache"});if(!response.ok)throw Error("load");
  const products=await response.json();if(!Array.isArray(products))throw Error("data");if(version!==loadVersion)return;
  const matches=products.filter(p=>p && (Catalog.key(p)===id || (!p.pageId && p.name===id)));
  if(matches.length!==1){showError("此商品可能已下架或連結已變更，請返回商品列表查看。",false);return;}
  if(typeof matches[0].name!=="string" || typeof matches[0].category!=="string")throw Error("data");render(matches[0]);
 }catch(_){if(version===loadVersion)showError("商品資料暫時無法載入，請重試或聯絡官方 LINE。",true);}
}
function showError(message,retry){$("status").hidden=true;$("error").hidden=false;$("error-message").textContent=message;$("retry").hidden=!retry;document.title="商品資訊｜儷鮮嚴選";}
$("retry").addEventListener("click",load);
$("previous").addEventListener("click",()=>showPhoto(selected-1));$("next").addEventListener("click",()=>showPhoto(selected+1));
$("lightbox-previous").addEventListener("click",()=>showPhoto(selected-1));$("lightbox-next").addEventListener("click",()=>showPhoto(selected+1));
main.addEventListener("click",()=>{if(!photos.length)return;box.showModal();document.body.style.overflow="hidden";updateLightbox();$("close-lightbox").focus();});
$("close-lightbox").addEventListener("click",()=>box.close());box.addEventListener("close",()=>{document.body.style.overflow="";main.focus();});
box.addEventListener("click",event=>{if(event.target===box)box.close();});
box.addEventListener("keydown",event=>{if(event.key==="ArrowRight"){event.preventDefault();showPhoto(selected+1);}if(event.key==="ArrowLeft"){event.preventDefault();showPhoto(selected-1);}});
$("zoom-in").addEventListener("click",()=>changeZoom(zoom+.5));$("zoom-out").addEventListener("click",()=>changeZoom(zoom-.5));
load();
