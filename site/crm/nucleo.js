/* =====================================================================
   CRM HS — núcleo: estado, utilitários, navegação, permissões, busca,
   alertas, gráficos e gavetas. As telas ficam em vendas.js,
   operacao.js e marketing.js e se registram em CRM.telas.
   ===================================================================== */
(function () {
  var C = window.HS;
  var CRM = window.CRM = { telas: {}, db: HSDB.ler() };
  var $ = CRM.$ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = CRM.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var HOJE = CRM.HOJE = new Date();

  /* ---- utilitários -------------------------------------------------- */
  CRM.salvar = function () { HSDB.gravar(CRM.db); CRM.contadores(); };
  CRM.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  CRM.R = function (v) { return HSDB.dinheiro(v || 0); };
  CRM.R0 = function (v) { return HSDB.dinheiro(Math.round(v || 0), true); };
  CRM.Rk = function (v) { v = v || 0; return v >= 1000 ? 'R$ ' + (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' : CRM.R0(v); };
  CRM.pct = function (v) { return (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'; };
  CRM.dias = function (iso) { return Math.floor((HOJE - new Date(iso)) / 864e5); };
  CRM.data = function (iso, hora) { if (!iso) return '—'; var d = new Date(iso); return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + (hora ? ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''); };
  CRM.quando = function (iso) {
    if (!iso) return '—';
    var ms = HOJE - new Date(iso), min = Math.round(ms / 6e4);
    if (min < 0) { var f = Math.ceil(-ms / 864e5); return f <= 1 ? 'amanhã' : 'em ' + f + ' dias'; }
    if (min < 60) return 'há ' + Math.max(1, min) + ' min';
    var h = Math.round(min / 60); if (h < 24) return 'há ' + h + ' h';
    var d = Math.floor(ms / 864e5); if (d === 1) return 'ontem'; if (d < 30) return 'há ' + d + ' dias';
    var m = Math.round(d / 30); if (m < 12) return 'há ' + m + (m === 1 ? ' mês' : ' meses');
    return 'há ' + (d / 365).toFixed(1).replace('.', ',') + ' anos';
  };
  CRM.fone = function (n) { n = HSDB.soDigitos(n).replace(/^55/, ''); return n.length === 11 ? '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7) : n; };
  CRM.iniciais = function (n) { return String(n || '?').split(' ').filter(Boolean).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase(); };
  CRM.primeiro = function (n) { return String(n || '').split(' ')[0]; };
  CRM.wa = function (numero, msg, txt, cls) { return '<a class="btn btn-wa ' + (cls || 'btn-p') + '" target="_blank" rel="noopener" href="' + HSDB.wa(numero, msg) + '">' + (txt || 'WhatsApp') + '</a>'; };
  CRM.cli = function (id) { return CRM.db.clientes.filter(function (c) { return c.id === id; })[0]; };
  CRM.apAtual = function (c) { return (c.aparelhos || []).filter(function (a) { return a.atual; })[0] || (c.aparelhos || [])[0] || { modelo: '—' }; };
  CRM.usuario = function (id) { return CRM.db.usuarios.filter(function (u) { return u.id === id; })[0] || { nome: '—', iniciais: '?' }; };
  CRM.totalVenda = function (v) { return v.itens.reduce(function (s, i) { return s + i.valor; }, 0); };
  CRM.custoVenda = function (v) { return v.itens.reduce(function (s, i) { return s + (i.custo || 0); }, 0); };
  CRM.noMes = function (iso, offset) { var d = new Date(iso), r = new Date(HOJE.getFullYear(), HOJE.getMonth() - (offset || 0), 1); return d.getFullYear() === r.getFullYear() && d.getMonth() === r.getMonth(); };

  /* ---- visão 360 do cliente ----------------------------------------- */
  CRM.resumoCliente = function (c) {
    var vendas = CRM.db.vendas.filter(function (v) { return v.clienteId === c.id; });
    var os = CRM.db.os.filter(function (o) { return o.clienteId === c.id; });
    var gasto = vendas.reduce(function (s, v) { return s + CRM.totalVenda(v); }, 0) + os.filter(function (o) { return o.status === 'entregue'; }).reduce(function (s, o) { return s + o.valor; }, 0);
    var datas = vendas.map(function (v) { return v.data; }).concat(os.map(function (o) { return o.entrada; })).sort();
    var ultima = datas[datas.length - 1] || c.criado, n = vendas.length + os.length, d = CRM.dias(ultima);
    var seg = CRM.dias(c.criado) < 45 ? 'Novo' : n >= 4 && d < 90 && gasto > 2500 ? 'Campeão' : n >= 3 && d < 180 ? 'Fiel' : d > 365 ? 'Hibernando' : d > 180 ? 'Em risco' : 'Ocasional';
    return { vendas: vendas, os: os, gasto: gasto, ultima: ultima, interacoes: n, segmento: seg, ticket: n ? gasto / n : 0 };
  };
  CRM.SEG = { 'Campeão': 's-preto', 'Fiel': 's-ouro', 'Novo': 's-verde', 'Ocasional': 's-cinza', 'Em risco': 's-amarelo', 'Hibernando': 's-vermelho' };

  /* sugestões de oferta para um cliente (o "próximo melhor passo") */
  CRM.ofertas = function (c) {
    var a = CRM.apAtual(c), s = [], r = CRM.resumoCliente(c);
    if (!a || a.modelo === 'Android') return ['<b>Primeiro iPhone:</b> ofereça um seminovo de entrada com o cupom de R$ 100.'];
    var idade = CRM.dias(a.desde);
    if (idade > 730) s.push('<b>Upgrade:</b> está há ' + (idade / 365).toFixed(1).replace('.', ',') + ' anos com o ' + a.modelo + '. Na tabela, ele entra por ~' + CRM.R0((HSDB.avaliarTroca(a.modelo, a.gb || 128, 'bom', 'media') || { medio: 0 }).medio) + '.');
    if (idade > 540 && !r.os.some(function (o) { return o.servico === 'bateria'; })) s.push('<b>Bateria:</b> nenhuma troca registrada no aparelho atual.');
    if (!r.vendas.some(function (v) { return v.itens.some(function (i) { return /Película/i.test(i.desc); }) && CRM.dias(v.data) < 365; })) s.push('<b>Película:</b> não comprou película no último ano.');
    if (/Pro Max|Plus/.test(a.modelo) && !r.vendas.some(function (v) { return v.itens.some(function (i) { return /portátil/i.test(i.desc); }); })) s.push('<b>Carregador portátil 10.000 mAh:</b> rende cerca de 2 cargas no ' + a.modelo + '.');
    var gar = r.os.filter(function (o) { return o.garantiaAte && new Date(o.garantiaAte) > HOJE; })[0];
    if (gar) s.push('<b>Garantia ativa</b> até ' + CRM.data(gar.garantiaAte) + ' (OS ' + gar.num + ').');
    return s;
  };

  /* ---- alertas (o sino) --------------------------------------------- */
  CRM.alertas = function () {
    var db = CRM.db, a = [];
    db.leads.filter(function (l) { return l.status === 'novo' && l.temp === 'quente' && CRM.dias(l.criado) <= 2; }).forEach(function (l) { a.push({ tipo: 'vermelho', t: 'Lead quente sem resposta', d: l.nome + ' · ' + CRM.quando(l.criado), ir: function () { CRM.abrir.lead(l.id); } }); });
    db.os.filter(function (o) { return o.status !== 'entregue' && o.status !== 'pronto' && new Date(o.prevista) < HOJE; }).forEach(function (o) { a.push({ tipo: 'vermelho', t: 'OS ' + o.num + ' atrasada', d: o.modelo + ' · ' + o.defeito, ir: function () { CRM.abrir.os(o.id); } }); });
    db.estoque.pecas.filter(function (p) { return p.qtd < p.minimo; }).forEach(function (p) { a.push({ tipo: 'amarelo', t: 'Peça abaixo do mínimo', d: p.desc + ' · ' + p.qtd + ' de ' + p.minimo, ir: function () { CRM.ir('estoque', 'pecas'); } }); });
    db.estoque.aparelhos.filter(function (x) { return x.status === 'disponível' && CRM.dias(x.entrada) > 45; }).forEach(function (x) { a.push({ tipo: 'amarelo', t: 'Seminovo parado há ' + CRM.dias(x.entrada) + ' dias', d: x.modelo + ' ' + x.gb + ' GB', ir: function () { CRM.ir('estoque'); } }); });
    db.avaliacoes.filter(function (r) { return r.nota <= 3 && !r.respondida; }).forEach(function (r) { a.push({ tipo: 'azul', t: 'Avaliação ' + r.nota + '★ sem resposta', d: r.canal + ' · ' + CRM.quando(r.data), ir: function () { CRM.ir('avaliacoes'); } }); });
    return a;
  };

  /* ---- gráficos (SVG, uma série, dica ao passar o mouse) ------------- */
  CRM.barras = function (dados, op) {
    op = op || {}; var W = op.largura || 640, H = op.altura || 200, pe = 22, topo = 10, esq = 44;
    var max = Math.max.apply(null, dados.map(function (d) { return d.valor; }).concat([1]));
    var passo = Math.pow(10, Math.floor(Math.log10(max))), lim = Math.ceil(max / passo) * passo, linhas = [0, lim / 2, lim];
    var bw = (W - esq) / dados.length, larg = Math.max(2, bw - 3), fmt = op.formato || CRM.Rk;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + CRM.esc(op.titulo || 'Gráfico') + '">';
    linhas.forEach(function (v) { var y = topo + (H - pe - topo) * (1 - v / lim); s += '<line class="grade-l" x1="' + esq + '" x2="' + W + '" y1="' + y + '" y2="' + y + '"/><text class="eixo" x="' + (esq - 6) + '" y="' + (y + 3) + '" text-anchor="end">' + fmt(v) + '</text>'; });
    dados.forEach(function (d, i) {
      var h = (H - pe - topo) * d.valor / lim, x = esq + i * bw + 1.5, y = H - pe - h;
      s += '<g class="bar" data-i="' + i + '"><rect x="' + (esq + i * bw) + '" y="' + topo + '" width="' + bw + '" height="' + (H - pe - topo) + '" fill="transparent"/>' +
        '<path d="M' + x + ',' + (H - pe) + 'V' + (y + Math.min(4, h)) + 'q0,-' + Math.min(4, h) + ' ' + Math.min(4, larg / 2) + ',-' + Math.min(4, h) + 'H' + (x + larg - Math.min(4, larg / 2)) + 'q' + Math.min(4, larg / 2) + ',0 ' + Math.min(4, larg / 2) + ',' + Math.min(4, h) + 'V' + (H - pe) + 'Z" fill="' + (d.destaque ? '#B8892F' : '#16161A') + '"/></g>';
      if (d.rotulo && (dados.length <= 14 || i % Math.ceil(dados.length / 10) === 0)) s += '<text class="eixo" x="' + (esq + i * bw + bw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + d.rotulo + '</text>';
    });
    s += '</svg>';
    var id = 'g' + Math.random().toString(36).slice(2, 7);
    setTimeout(function () {
      var box = document.getElementById(id); if (!box) return;
      var dica = box.querySelector('.dica');
      box.querySelectorAll('.bar').forEach(function (g) {
        g.addEventListener('mouseenter', function () {
          var d = dados[g.dataset.i], r = g.getBoundingClientRect(), b = box.getBoundingClientRect();
          dica.innerHTML = (d.dica || d.rotulo) + ': <b>' + fmt(d.valor) + '</b>'; dica.style.left = (r.left - b.left + r.width / 2) + 'px'; dica.style.top = (r.top - b.top + 10) + 'px'; dica.style.opacity = 1;
          g.querySelector('path').setAttribute('opacity', .75);
        });
        g.addEventListener('mouseleave', function () { dica.style.opacity = 0; g.querySelector('path').setAttribute('opacity', 1); });
      });
    });
    return '<div class="grafico" id="' + id + '">' + s + '<div class="dica"></div></div>';
  };
  CRM.barrasH = function (lista, fmt) {
    var max = Math.max.apply(null, lista.map(function (x) { return x[1]; }).concat([1]));
    return '<div class="barras-h">' + lista.map(function (x) { return '<div class="bh" title="' + CRM.esc(x[0]) + ': ' + (fmt || String)(x[1]) + '"><span>' + x[0] + '</span><div class="trilho"><i style="width:' + (x[1] / max * 100) + '%"></i></div><b>' + (fmt || String)(x[1]) + '</b></div>'; }).join('') + '</div>';
  };

  /* ---- gaveta, toast ------------------------------------------------ */
  CRM.gaveta = function (titulo, sub, corpo, acoes) {
    var g = $('#gaveta');
    g.innerHTML = '<header><h2>' + titulo + (sub ? '<small>' + sub + '</small>' : '') + '</h2><div class="acoes" style="display:flex;gap:6px">' + (acoes || '') + '</div><button class="fechar" aria-label="Fechar">×</button></header><div class="corpo">' + corpo + '</div>';
    g.classList.add('on'); $('#veu').classList.add('on');
    g.querySelector('.fechar').onclick = CRM.fechar;
    return g;
  };
  CRM.fechar = function () { $('#gaveta').classList.remove('on'); $('#paleta').classList.remove('on'); $('#veu').classList.remove('on'); $('#lateral').classList.remove('aberta'); };
  CRM.toast = function (t) { var e = document.createElement('div'); e.className = 'toast'; e.textContent = t; document.body.appendChild(e); requestAnimationFrame(function () { e.classList.add('on'); }); setTimeout(function () { e.classList.remove('on'); setTimeout(function () { e.remove(); }, 250); }, 2400); };
  CRM.abrir = {}; // preenchido pelos módulos: cliente, lead, os, venda

  /* ---- navegação e permissões --------------------------------------- */
  var IC = {
    inicio: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>', leads: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>', clientes: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c.8-3.4 3.2-5 6-5s5.2 1.6 6 5M16 4.5a3.5 3.5 0 0 1 0 7M18 15c1.7.6 2.7 2.2 3 5"/>',
    vendas: '<path d="M4 4h2l2.4 11h10.2L21 7H7.2"/><circle cx="10" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>', assistencia: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    estoque: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>', campanhas: '<path d="M3 10v4h3l6 4V6L6 10zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
    automacoes: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', inbox: '<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9.5h8M8 12.5h5"/>', avaliacoes: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>',
    relatorios: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', config: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'
  };
  CRM.icone = function (n, t) { return '<svg width="' + (t || 18) + '" height="' + (t || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + (IC[n] || '') + '</svg>'; };
  var MENU = [
    ['Visão geral', [['inicio', 'Início'], ['relatorios', 'Relatórios']]],
    ['Vendas', [['leads', 'Leads'], ['clientes', 'Clientes'], ['vendas', 'Vendas']]],
    ['Operação', [['assistencia', 'Assistência'], ['estoque', 'Estoque']]],
    ['Marketing', [['campanhas', 'Públicos e campanhas'], ['automacoes', 'Automações'], ['avaliacoes', 'Avaliações']]],
    ['Atendimento', [['inbox', 'Caixa de entrada IA']]],
    ['', [['config', 'Configurações']]]
  ];
  var PERM = { u1: null, u2: null, u3: ['assistencia', 'estoque', 'clientes', 'inbox'] }; // null = acesso total
  CRM.eu = function () { var id = 'u1'; try { id = localStorage.getItem('hs_crm_usuario') || 'u1'; } catch (e) {} return CRM.usuario(id); };
  CRM.pode = function (tela) { var p = PERM[CRM.eu().id]; return !p || p.indexOf(tela) >= 0; };
  function montarNav() {
    $('#nav').innerHTML = MENU.map(function (g) {
      var itens = g[1].filter(function (i) { return CRM.pode(i[0]); }); if (!itens.length) return '';
      return '<div class="grupo-nav">' + (g[0] ? '<h6>' + g[0] + '</h6>' : '') + itens.map(function (i) { return '<button class="item-nav" data-tela="' + i[0] + '">' + CRM.icone(i[0]) + i[1] + '<span class="cont" id="cont-' + i[0] + '"></span></button>'; }).join('') + '</div>';
    }).join('');
    $$('#nav [data-tela]').forEach(function (b) { b.onclick = function () { CRM.ir(b.dataset.tela); }; });
    var u = CRM.eu(); $('#av-usuario').textContent = u.iniciais; $('#nome-usuario').textContent = u.nome;
  }
  CRM.ir = function (tela, sub) {
    if (!CRM.telas[tela] || !CRM.pode(tela)) tela = CRM.pode('inicio') ? 'inicio' : 'assistencia';
    CRM.fechar(); CRM.atual = tela;
    $$('#nav [data-tela]').forEach(function (b) { b.setAttribute('aria-current', b.dataset.tela === tela); });
    var el = $('#tela'); el.innerHTML = ''; CRM.telas[tela](el, sub); window.scrollTo(0, 0);
    try { history.replaceState(null, '', '#' + tela + (sub ? '/' + sub : '')); } catch (e) {}
  };
  CRM.recarregar = function () { var s = (location.hash.slice(1) || '').split('/'); CRM.ir(CRM.atual || s[0], s[1]); };
  CRM.contadores = function () {
    var db = CRM.db, set = function (id, n, alerta) { var e = $('#cont-' + id); if (e) { e.textContent = n || ''; e.classList.toggle('alerta', !!alerta); } };
    set('leads', db.leads.filter(function (l) { return l.status === 'novo'; }).length);
    set('assistencia', db.os.filter(function (o) { return o.status === 'pronto'; }).length);
    set('inbox', db.conversas.filter(function (c) { return c.status === 'aguardando humano'; }).length, true);
    set('estoque', db.estoque.pecas.filter(function (p) { return p.qtd < p.minimo; }).length, true);
    var n = CRM.alertas().length; $('#n-alertas').textContent = n || ''; $('#n-alertas').style.display = n ? '' : 'none';
  };

  /* ---- busca global (Ctrl+K) ---------------------------------------- */
  function buscar(q) {
    q = q.trim().toLowerCase(); var d = HSDB.soDigitos(q), db = CRM.db, out = [];
    if (!q) return '<div class="vazio">Digite um nome, telefone, IMEI ou número de OS.</div>';
    var cs = db.clientes.filter(function (c) { return c.nome.toLowerCase().indexOf(q) >= 0 || (d.length >= 4 && c.whats.indexOf(d) >= 0) || (d.length >= 5 && c.aparelhos.some(function (a) { return (a.imei || '').indexOf(d) >= 0; })); }).slice(0, 6);
    if (cs.length) out.push('<h6>Clientes</h6>' + cs.map(function (c) { return '<button data-tipo="cliente" data-id="' + c.id + '"><span class="av">' + CRM.iniciais(c.nome) + '</span><span>' + CRM.esc(c.nome) + '<small>' + CRM.fone(c.whats) + ' · ' + CRM.apAtual(c).modelo + '</small></span></button>'; }).join(''));
    var os = db.os.filter(function (o) { return (d && String(o.num).indexOf(d) === 0) || o.modelo.toLowerCase().indexOf(q) >= 0 && q.length > 5; }).slice(0, 5);
    if (os.length) out.push('<h6>Ordens de serviço</h6>' + os.map(function (o) { return '<button data-tipo="os" data-id="' + o.id + '"><span class="ic-linha s-cinza">' + CRM.icone('assistencia') + '</span><span>OS ' + o.num + ' · ' + o.modelo + '<small>' + o.defeito + ' · ' + o.status + '</small></span></button>'; }).join(''));
    var ls = db.leads.filter(function (l) { return l.nome.toLowerCase().indexOf(q) >= 0 || (d.length >= 4 && l.whats.indexOf(d) >= 0) || l.cupom.toLowerCase() === q; }).slice(0, 5);
    if (ls.length) out.push('<h6>Leads</h6>' + ls.map(function (l) { return '<button data-tipo="lead" data-id="' + l.id + '"><span class="ic-linha s-' + l.temp + '">' + CRM.icone('leads') + '</span><span>' + CRM.esc(l.nome) + '<small>' + l.status + ' · ' + l.temp + ' · ' + l.cupom + '</small></span></button>'; }).join(''));
    return out.join('') || '<div class="vazio">Nada encontrado para “' + CRM.esc(q) + '”.</div>';
  }
  function abrirBusca() { $('#paleta').classList.add('on'); $('#veu').classList.add('on'); $('#paleta-q').value = ''; $('#paleta-res').innerHTML = buscar(''); setTimeout(function () { $('#paleta-q').focus(); }, 30); }

  /* ---- início ------------------------------------------------------- */
  CRM.iniciar = function () {
    montarNav();
    $('#veu').onclick = CRM.fechar;
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); abrirBusca(); }
      if (e.key === 'Escape') { CRM.fechar(); $$('.menu-flut').forEach(function (m) { m.classList.remove('aberto'); }); }
    });
    $('#abrir-busca').onclick = abrirBusca;
    $('#paleta-q').oninput = function () { $('#paleta-res').innerHTML = buscar(this.value); };
    $('#paleta-q').onkeydown = function (e) { if (e.key === 'Enter') { var b = $('#paleta-res button'); if (b) b.click(); } };
    $('#paleta-res').onclick = function (e) { var b = e.target.closest('button[data-tipo]'); if (!b) return; CRM.fechar(); setTimeout(function () { CRM.abrir[b.dataset.tipo](b.dataset.id); }, 60); };
    $('#abrir-menu').onclick = function () { $('#lateral').classList.add('aberta'); $('#veu').classList.add('on'); };

    function menu(btn, caixa, conteudo) {
      $(btn).onclick = function (e) { e.stopPropagation(); var m = $(caixa), ab = m.classList.contains('aberto'); $$('.menu-flut').forEach(function (x) { x.classList.remove('aberto'); }); if (!ab) { m.innerHTML = conteudo(); m.classList.add('aberto'); } };
    }
    document.addEventListener('click', function () { $$('.menu-flut').forEach(function (x) { x.classList.remove('aberto'); }); });
    menu('#btn-novo', '#menu-novo', function () {
      return [['lead', 'Lead', 'Contato que ainda não comprou'], ['cliente', 'Cliente', 'Cadastro com aparelho'], ['os', 'Ordem de serviço', 'Aparelho para a bancada'], ['venda', 'Venda', 'Caixa rápido']]
        .filter(function (x) { return x[0] !== 'venda' && x[0] !== 'lead' || CRM.pode('vendas'); })
        .map(function (x) { return '<button data-novo="' + x[0] + '"><span><b>' + x[1] + '</b><small>' + x[2] + '</small></span></button>'; }).join('');
    });
    $('#menu-novo').onclick = function (e) { var b = e.target.closest('[data-novo]'); if (b && CRM.novo[b.dataset.novo]) CRM.novo[b.dataset.novo](); };
    menu('#btn-alertas', '#menu-alertas', function () {
      var a = CRM.alertas(); CRM._alertas = a;
      return '<div style="padding:8px 10px 4px;font-weight:800">Alertas (' + a.length + ')</div>' + (a.map(function (x, i) { return '<button data-al="' + i + '"><span class="alerta ' + x.tipo + '" style="margin:0;width:100%"><span><b>' + x.t + '</b>' + CRM.esc(x.d) + '</span></span></button>'; }).join('') || '<div class="vazio">Tudo em dia.</div>');
    });
    $('#menu-alertas').onclick = function (e) { var b = e.target.closest('[data-al]'); if (b) { $('#menu-alertas').classList.remove('aberto'); CRM._alertas[b.dataset.al].ir(); } };
    menu('#btn-usuario', '#menu-usuario', function () {
      return '<div style="padding:8px 10px 4px;font-size:.78rem;color:var(--cinza)">Entrar como (permissões de exemplo)</div>' + CRM.db.usuarios.map(function (u) { return '<button data-u="' + u.id + '"><span class="av">' + u.iniciais + '</span><span><b>' + u.nome + '</b><small>' + (PERM[u.id] ? 'Só ' + PERM[u.id].join(', ') : 'Acesso total') + '</small></span></button>'; }).join('');
    });
    $('#menu-usuario').onclick = function (e) { var b = e.target.closest('[data-u]'); if (!b) return; try { localStorage.setItem('hs_crm_usuario', b.dataset.u); } catch (x) {} montarNav(); CRM.contadores(); CRM.ir(CRM.atual); CRM.toast('Entrou como ' + CRM.eu().nome); };
    $('#zerar').onclick = function () { if (confirm('Apagar tudo e voltar aos dados de exemplo?')) { CRM.db = HSDB.zerar(); CRM.contadores(); CRM.ir('inicio'); } };

    window.addEventListener('hashchange', function () { var s = location.hash.slice(1).split('/'); if (s[0] !== CRM.atual) CRM.ir(s[0], s[1]); });
    window.addEventListener('storage', function () { CRM.db = HSDB.ler(); CRM.contadores(); });
    CRM.contadores();
    var s = (location.hash.slice(1) || 'inicio').split('/');
    CRM.ir(s[0], s[1]);
  };
  CRM.novo = {};
})();
