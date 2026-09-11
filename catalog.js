"use strict";
window.Catalog = Object.freeze({
  key(product) { return String(product.pageId || product.id || product.name || ""); },
  url(product) { return "./product.html?id=" + encodeURIComponent(this.key(product)); },
  image(value) {
    if(typeof value !== "string" || !value.trim()) return "";
    try { const url=new URL(value,document.baseURI); return ["http:","https:"].includes(url.protocol)?url.href:""; } catch (_) { return ""; }
  },
  photos(product) {
    const extra=Array.isArray(product.images)?product.images:[];
    return [...new Set([product.image,...extra].map(value=>this.image(value)).filter(Boolean))];
  },
  price(value) {
    const raw=String(value??"").trim(), amount=Number(raw);
    return raw!=="" && Number.isFinite(amount) && amount>=0 ? "NT$ "+amount.toLocaleString("zh-TW") : "價格請洽 LINE";
  }
});
