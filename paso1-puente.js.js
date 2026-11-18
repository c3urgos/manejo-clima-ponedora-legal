// PASO 1 B-LIGERA - 17-11-2026 - Manejo Clima Ponedora
// Archivo: paso1-puente.js
// Qué hace: anula anuncios web y pago externo, y deja el puente a la app nativa.
// Cómo usarlo:
// 1) Sube este archivo a GitHub, al mismo repo manejo-clima-ponedora-legal, al lado de index.html
// 2) En index.html, justo antes de </body>, agrega esta línea:
//    <script src="paso1-puente.js"></script>
// 3) En index.html, borra el bloque de anuncios del <head>
// 4) En index.html, borra las 2 líneas var MP_MENSUAL y var MP_ANUAL
// 5) En index.html, cambia el texto "Compra segura con Google Play" por "Compra segura con Google Play"
// Si haces solo 1) y 2), el puente ya funciona aunque no borres 3) y 4), porque este archivo los anula. Pero 3) es obligatorio para que no quede anuncios dentro de la app.
(function(){
  // 1) Anular anuncios web: no cargar más anuncios web
  try{
    document.querySelectorAll('script[src*="googlesyndication"], script[src*="adsbygoogle"]').forEach(function(s){ s.remove(); });
    window.adsbygoogle = [];
    delete window.ADMOB_IDS;
  }catch(e){}

  // 2) Estado Premium: solo lo decide la app nativa (Play Billing) o lo que ya estaba guardado.
  // NO activar Premium por ?pago=exitoso (ese era el retorno de pago externo y ya no existe).
  // Si la URL trae ?pago=..., la limpiamos sin activar nada.
  try{
    var params = new URLSearchParams(window.location.search);
    if(params.has('pago')){
      var clean = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', clean);
    }
  }catch(e){}

  // 3) Puente web -> nativo
  window.MCP_pendingInterstitialCallback = null;
  window.onNativeInterstitialClosed = function(){
    var cb = window.MCP_pendingInterstitialCallback;
    window.MCP_pendingInterstitialCallback = null;
    try{ if(typeof cb === 'function') cb(); }catch(e){}
  };
  window.MCP_buyPremium = function(productId){
    try{
      if(window.AndroidBilling && typeof window.AndroidBilling.buy === 'function'){
        window.AndroidBilling.buy(productId);
        return true;
      }
    }catch(e){}
    alert('Compra disponible en la app de Google Play.\nAbre Manejo Clima Ponedora desde Google Play para suscribirte a Premium.');
    return false;
  };
  window.MCP_setPremiumFromNative = function(activo){
    try{ localStorage.setItem('premium_activo', activo ? 'true' : 'false'); }catch(e){}
    try{ if(typeof mostrarEstadoPremium === 'function') mostrarEstadoPremium(); }catch(e){}
    try{ window.MCP_applyPremiumUI(); }catch(e){}
  };
  window.MCP_applyPremiumUI = function(){
  try{
    var isNative = !!(window.AndroidAds || window.AndroidBilling || window.Android);
    var isPremium = false;
    try{ isPremium = localStorage.getItem('premium_activo') === 'true' || localStorage.getItem('pp_premium') === 'true'; }catch(e){}
    var ids = ['banner-inferior-real','caja-banner','admob-banner-container'];
    for(var i = 0; i < ids.length; i++){
      var el = document.getElementById(ids[i]);
      if(!el) continue;
      if(isNative || isPremium){ el.style.display = 'none'; }
      else { el.style.display = ''; }
    }
  }catch(e){}
};

  // 4) Botones Premium -> Google Play (NO pago externo). Anula irPremium / activarPremium viejos.
  window.irPremium = function(tipo){
    var productId = tipo === 'anual' ? 'premium_anual_30000' : 'premium_mensual_2990';
    window.MCP_buyPremium(productId);
  };
  window.activarPremium = function(){ window.irPremium('mensual'); };
  window.revisarPremium = function(){
    var activo = false;
    try{ activo = localStorage.getItem('premium_activo') === 'true'; }catch(e){}
    if(activo){ alert('Premium activo ✅ Sin anuncios + Pronóstico del Clima y Recomendaciones 7 días'); }
    else { alert('Aún no está activo. Si ya pagaste en Google Play, espera unos segundos, cierra y vuelve a abrir la app. Si sigue sin activarse, revisa en Google Play > Pagos y suscripciones > Suscripciones.'); }
  };

  // 5) Intersticial Caja 2 -> SDK nativo. Anula la ventana falsa de "ANUNCIO REAL".
  // Si hay app nativa: pide el intersticial real y espera a que la app nativa avise que se cerró.
  // Si NO hay app nativa (navegador): NO muestra anuncio falso, sigue directo a actualizar clima.
  window.showInterstitialAdV365 = function(callback){
    try{
      if(window.AndroidAds && typeof window.AndroidAds.showInterstitial === 'function'){
        window.MCP_pendingInterstitialCallback = (typeof callback === 'function') ? callback : null;
        window.AndroidAds.showInterstitial();
        // Seguridad: si la app nativa no avisa en 8s, seguir igual para no trabar la app.
        setTimeout(function(){
          if(window.MCP_pendingInterstitialCallback){
            var cb = window.MCP_pendingInterstitialCallback;
            window.MCP_pendingInterstitialCallback = null;
            try{ if(typeof cb === 'function') cb(); }catch(e){}
          }
        }, 8000);
        return;
      }
    }catch(e){}
    try{ if(typeof callback === 'function') callback(); }catch(e){}
  };

  // 6) Al cargar, ocultar la caja de banner falsa.
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', window.MCP_applyPremiumUI);
  } else {
    window.MCP_applyPremiumUI();
  }
  setTimeout(window.MCP_applyPremiumUI, 1000);
  setTimeout(window.MCP_applyPremiumUI, 3000);
})();
