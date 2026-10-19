/* =====================================================================
   HS — comportamento comum do site (menu, WhatsApp, vitrine, ícones)
   ===================================================================== */
(function () {
  var C = window.HS, R = HSDB.dinheiro;
  var RAIZ = document.body.getAttribute('data-raiz') || '';

  /* ---- ícones (traço 1.8, 24×24) ------------------------------------ */
  var P = {
    tela: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M9 6l6 6M10 13l4 4"/>',
    bateria: '<rect x="3" y="7" width="16" height="10" rx="2.5"/><path d="M21 10.5v3M7 10v4M10.5 10v4"/>',
    traseira: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><rect x="8.3" y="4.8" width="5" height="5" rx="1.6"/>',
    camera: '<path d="M4 8h3l1.6-2.5h6.8L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.4"/>',
    conector: '<path d="M9 2v5M15 2v5M7 7h10v4a5 5 0 0 1-10 0zM12 16v6"/>',
    faceid: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M9 9.5v1M15 9.5v1M12 9.5v3.5h-1M9.5 15.5a3.5 3.5 0 0 0 5 0"/>',
    placa: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    agua: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    escudo: '<path d="M12 3l7 3v5.5c0 4.3-3 7.8-7 9.5-4-1.7-7-5.2-7-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    troca: '<path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5"/>',
    selo: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 7 5-2.5 5 2.5-1.5-7M9.5 9l1.7 1.7L14.5 7.5"/>',
    comparar: '<rect x="3" y="4" width="7" height="16" rx="2"/><rect x="14" y="4" width="7" height="16" rx="2"/>',
    lupa: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    relogio: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    capa: '<rect x="5.5" y="2.5" width="13" height="19" rx="3.5"/><circle cx="12" cy="12" r="3.2"/>',
    loja: '<path d="M4 9.5L5.5 4h13L20 9.5M4 9.5h16M4 9.5V20h16V9.5M9.5 20v-5h5v5"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    cartao: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>',
    pix: '<path d="M12 3l9 9-9 9-9-9z"/><path d="M8.5 12h7"/>',
    pessoa: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.3-4 4.4-6 8-6s6.7 2 8 6"/>',
    estrela: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>',
    presente: '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8.5h14V12M12 8v12.5M12 8S10.5 3.5 8 4.5 9 8 12 8zM12 8s1.5-4.5 4-3.5S15 8 12 8z"/>',
    zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    caixa: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
    fone: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.5"/>'
  };
  function ic(nome, tam) { return '<svg width="' + (tam || 22) + '" height="' + (tam || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[nome] || '') + '</svg>'; }
  var WA = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>';

  /* ---- ilustração do iPhone (traseira, sem marca da Apple) --------- */
  function iphone(modelo, cor, larg) {
    var info = (C.linhas || {})[modelo] || {}, hex = (C.cores || {})[cor] || '#2a2a2c';
    var tres = info.cameras === 3 || /Pro/.test(modelo), diag = /1[3-9]/.test(modelo) && !tres;
    var claro = parseInt(hex.slice(1, 3), 16) > 180;
    var mod = claro ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.09)';
    var lente = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 2.2) + '" fill="#2b2b2e"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#0d0f14"/><circle cx="' + (x - r * .3) + '" cy="' + (y - r * .3) + '" r="' + (r * .28) + '" fill="#3c4a63" opacity=".8"/>'; };
    var cams = tres ? lente(48, 47, 10) + lente(48, 79, 10) + lente(76, 63, 10) + '<circle cx="76" cy="40" r="4" fill="#efe7c8" opacity=".85"/>'
      : diag ? lente(46, 45, 10) + lente(72, 71, 10) + '<circle cx="74" cy="43" r="4" fill="#efe7c8" opacity=".85"/>'
      : lente(48, 46, 10) + lente(48, 76, 10) + '<circle cx="73" cy="61" r="4" fill="#efe7c8" opacity=".85"/>';
    return '<svg viewBox="0 0 200 400" width="' + (larg || 160) + '" role="img" aria-label="Ilustração do ' + modelo + ' ' + cor + '">' +
      '<defs><linearGradient id="b' + hex.slice(1) + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs>' +
      '<rect x="10" y="6" width="180" height="388" rx="34" fill="' + hex + '"/>' +
      '<rect x="10" y="6" width="180" height="388" rx="34" fill="url(#b' + hex.slice(1) + ')"/>' +
      '<rect x="12.5" y="8.5" width="175" height="383" rx="32" fill="none" stroke="rgba(255,255,255,.18)"/>' +
      '<rect x="24" y="22" width="' + (tres ? 76 : 70) + '" height="' + (tres ? 82 : 76) + '" rx="22" fill="' + mod + '" stroke="rgba(255,255,255,.12)"/>' + cams +
      '<rect x="190" y="110" width="3" height="46" rx="1.5" fill="' + hex + '" opacity=".8"/></svg>';
  }

  function nomeCondicao(c) { return (C.condicoes[c] || {}).nome || c; }
  function bolaCor(cor) { return '<span class="bola" style="background:' + ((C.cores || {})[cor] || '#555') + ';box-shadow:0 0 0 1px rgba(255,255,255,.25)"></span>'; }

  function cartaoProduto(a) {
    var por = a.preco - C.desconto;
    return '<a class="produto" href="' + RAIZ + 'iphone/aparelho.html?id=' + a.id + '">' +
      '<div class="vitrine">' + (a.selo ? '<span class="selo">' + a.selo + '</span>' : '') + iphone(a.modelo, a.cor, 120) + '</div>' +
      '<div class="info"><h3>' + a.modelo + '</h3><span class="det">' + a.gb + ' GB · ' + a.cor + '</span>' +
      '<div class="chips"><span class="chip">' + nomeCondicao(a.condicao) + '</span><span class="chip">' + ic('bateria', 14) + ' ' + a.bateria + '%</span></div>' +
      '<div class="preco"><s>' + R(a.preco, true) + '</s><strong>' + R(por, true) + '</strong><span><span class="cupom">com cupom HS</span> · ou 12x de ' + R(HSDB.parcela(a.preco)) + '</span></div></div></a>';
  }

  /* ---- menu --------------------------------------------------------- */
  document.querySelectorAll('.nav > li > button').forEach(function (b) {
    var li = b.parentNode;
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var ab = li.classList.contains('aberto');
      document.querySelectorAll('.nav > li.aberto').forEach(function (x) { x.classList.remove('aberto'); x.firstElementChild.setAttribute('aria-expanded', 'false'); });
      if (!ab) { li.classList.add('aberto'); b.setAttribute('aria-expanded', 'true'); }
    });
    li.addEventListener('mouseenter', function () { if (matchMedia('(hover:hover)').matches) { li.classList.add('aberto'); b.setAttribute('aria-expanded', 'true'); } });
    li.addEventListener('mouseleave', function () { if (matchMedia('(hover:hover)').matches) { li.classList.remove('aberto'); b.setAttribute('aria-expanded', 'false'); } });
  });
  document.addEventListener('click', function () { document.querySelectorAll('.nav > li.aberto').forEach(function (x) { x.classList.remove('aberto'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { document.querySelectorAll('.nav > li.aberto').forEach(function (x) { x.classList.remove('aberto'); }); fecharGaveta(); } });
  var gav = document.querySelector('.gaveta-menu');
  function fecharGaveta() { if (gav) { gav.classList.remove('aberta'); document.body.style.overflow = ''; } }
  document.querySelectorAll('[data-abrir-menu]').forEach(function (b) { b.onclick = function () { gav.classList.add('aberta'); document.body.style.overflow = 'hidden'; }; });
  if (gav) gav.addEventListener('click', function (e) { if (e.target === gav || e.target.closest('[data-fechar-menu]')) fecharGaveta(); });

  // marca a seção atual no menu e na subnavegação
  var secao = document.body.getAttribute('data-secao');
  if (secao) document.querySelectorAll('.nav > li[data-secao="' + secao + '"]').forEach(function (li) { li.classList.add('atual'); });
  var pagina = document.body.getAttribute('data-pagina');
  if (pagina) document.querySelectorAll('[data-pag="' + pagina + '"]').forEach(function (a) { a.setAttribute('aria-current', 'page'); });

  /* ---- WhatsApp: <a data-wa="vendas|assistencia" data-msg="..."> ---- */
  function preencherWA(raiz) {
    (raiz || document).querySelectorAll('[data-wa]').forEach(function (a) {
      var w = C.whats[a.dataset.wa] || C.whats.vendas;
      a.href = HSDB.wa(w.numero, a.dataset.msg || 'Olá, HS! Vim pelo site.'); a.target = '_blank'; a.rel = 'noopener';
    });
  }
  preencherWA();

  function toast(txt) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = txt; document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('on'); });
    setTimeout(function () { t.classList.remove('on'); setTimeout(function () { t.remove(); }, 300); }, 2600);
  }
  function param(n) { return new URLSearchParams(location.search).get(n); }

  window.HSUI = { ic: ic, WA: WA, iphone: iphone, cartaoProduto: cartaoProduto, nomeCondicao: nomeCondicao, bolaCor: bolaCor, preencherWA: preencherWA, toast: toast, param: param, raiz: RAIZ };
})();
