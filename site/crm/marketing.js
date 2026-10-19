/* =====================================================================
   CRM HS — Públicos e campanhas, Automações, Avaliações, Caixa de entrada
   da IA, Relatórios e Configurações
   ===================================================================== */
(function () {
  var C = HS, $ = CRM.$, $$ = CRM.$$, esc = CRM.esc, R = CRM.R, R0 = CRM.R0, HOJE = CRM.HOJE;
  var EX = ' <span class="exemplo">exemplo</span>';

  /* ================= PÚBLICOS E CAMPANHAS ================= */
  var PUB = {
    modelo: { t: 'Novidade para um modelo', d: 'Todos com o modelo escolhido. Ex.: chegou capa nova para o 14 Pro Max.', msg: 'Oi, {nome}! Aqui é da HS. Chegaram capas novas para o seu {modelo} 😍 Quer ver as fotos?', modelo: true, f: function (c, m) { return CRM.apAtual(c).modelo === m; } },
    upgrade: { t: 'Upgrade (aparelho com +2 anos)', d: 'Quem está há mais de 2 anos com o mesmo iPhone. É o público que mais compra.', msg: 'Oi, {nome}! Aqui é da HS. Seu {modelo} já tem uns anos de casa. Quer saber quanto ele vale de entrada num iPhone mais novo? Faço a conta sem compromisso.', f: function (c) { var a = CRM.apAtual(c); return a.modelo !== 'Android' && CRM.dias(a.desde) > 730; } },
    bateria: { t: 'Bateria (+18 meses sem troca)', d: 'Aparelho com mais de um ano e meio e nenhuma troca de bateria registrada.', msg: 'Oi, {nome}! Aqui é da HS. Seu {modelo} está descarregando rápido? Esta semana a troca de bateria tem condição especial para quem já é cliente.', f: function (c) { return CRM.apAtual(c).modelo !== 'Android' && CRM.dias(CRM.apAtual(c).desde) > 540 && !CRM.db.os.some(function (o) { return o.clienteId === c.id && o.servico === 'bateria'; }); } },
    android: { t: 'Primeiro iPhone (usa Android)', d: 'Clientes da assistência ou de acessórios que ainda usam Android.', msg: 'Oi, {nome}! Aqui é da HS. Já pensou em ter seu primeiro iPhone? Temos seminovos revisados com garantia e R$ 100 de desconto para cliente da casa.', f: function (c) { return CRM.apAtual(c).modelo === 'Android'; } },
    garantia: { t: 'Garantia acabando (próx. 15 dias)', d: 'Serviço com garantia vencendo. Convite para revisão grátis.', msg: 'Oi, {nome}! Aqui é da HS. A garantia do serviço no seu {modelo} acaba em breve. Quer passar para uma revisão grátis antes?', f: function (c) { return CRM.db.os.some(function (o) { if (o.clienteId !== c.id || !o.garantiaAte) return false; var d = (new Date(o.garantiaAte) - HOJE) / 864e5; return d > 0 && d <= 15; }); } },
    aniver: { t: 'Aniversariantes do mês', d: 'Mimo de aniversário puxa visita na loja.', msg: 'Oi, {nome}! Aqui é da HS 🎉 Parabéns pelo seu mês! Tem uma película de presente para o seu {modelo}. É só passar na loja.', f: function (c) { return c.nasc && +c.nasc.slice(5, 7) === HOJE.getMonth() + 1; } },
    risco: { t: 'Em risco (sumidos há +6 meses)', d: 'Não voltaram nos últimos 6 meses.', msg: 'Oi, {nome}! Aqui é da HS, agora na Galeria Tenaz (Federação). Faz tempo! Como está o seu {modelo}? Passa aqui para uma revisão grátis.', f: function (c) { var s = CRM.resumoCliente(c).segmento; return s === 'Em risco' || s === 'Hibernando'; } },
    vip: { t: 'Campeões (VIP)', d: 'Quem mais compra e voltou recentemente. Ideal para lançamento e indicação.', msg: 'Oi, {nome}! Aqui é da HS. Você é dos nossos clientes mais especiais 💛 Quando chega novidade para o seu {modelo}, você vê primeiro. E indicando um amigo, os dois ganham película.', f: function (c) { return CRM.resumoCliente(c).segmento === 'Campeão'; } }
  };
  var pubAtual = 'upgrade', abaMk = 'publicos';
  CRM.telas.campanhas = function (el, aba) {
    abaMk = aba || abaMk;
    el.innerHTML = '<div class="cab"><div><h1>Públicos e campanhas</h1><p>Monte o público pelo aparelho e pelo histórico, chame no WhatsApp ou exporte para anunciar só para ele na Meta.</p></div></div>' +
      '<div class="abas">' + [['publicos', 'Públicos'], ['meta', 'Campanhas na Meta'], ['base', 'Base antiga']].map(function (x) { return '<button class="aba" data-aba="' + x[0] + '" aria-selected="' + (abaMk === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div><div id="mk"></div>';
    var mk = $('#mk', el);
    if (abaMk === 'publicos') publicos(mk);
    if (abaMk === 'meta') meta(mk);
    if (abaMk === 'base') base(mk);
    el.onclick = function (e) { var a = e.target.closest('[data-aba]'); if (a) CRM.telas.campanhas(el, a.dataset.aba); };
  };
  function publicos(mk) {
    var db = CRM.db, mods = {}; db.clientes.forEach(function (c) { var m = CRM.apAtual(c).modelo; if (m !== 'Android') mods[m] = (mods[m] || 0) + 1; });
    mk.innerHTML = '<div class="filtros">' + Object.keys(PUB).map(function (k) { return '<button class="chip" data-pub="' + k + '" aria-pressed="' + (pubAtual === k) + '">' + PUB[k].t.split(' (')[0] + '</button>'; }).join('') + '</div>' +
      '<div class="col-2-1"><div class="card"><h2 id="p-t"></h2><p class="sub" id="p-d"></p><div class="filtros" id="p-mod-box"><select class="sel" id="p-mod">' + Object.keys(mods).sort().map(function (m) { return '<option value="' + m + '"' + (m === 'iPhone 14 Pro Max' ? ' selected' : '') + '>' + m + ' (' + mods[m] + ')</option>'; }).join('') + '</select></div><div class="lista" id="p-lista"></div></div>' +
      '<div><div class="card mb"><h2>Mensagem</h2><p class="sub">{nome} e {modelo} são trocados sozinhos.</p><textarea class="txt" id="p-msg"></textarea></div><div class="card"><h2 id="p-qtd"></h2><p class="sub">Só entra quem aceitou receber mensagens (LGPD).</p><button class="btn btn-pri" id="p-csv" style="width:100%">Exportar público para a Meta</button><p class="sub" style="margin-top:8px">No Gerenciador: Públicos › Criar › Lista de clientes. Depois crie um semelhante (lookalike) a partir dele.</p></div></div></div>';
    var lista = [];
    function render() {
      var p = PUB[pubAtual], m = $('#p-mod', mk).value;
      $('#p-t', mk).textContent = p.t; $('#p-d', mk).textContent = p.d; $('#p-mod-box', mk).style.display = p.modelo ? '' : 'none';
      lista = db.clientes.filter(function (c) { return (!c.optin || c.optin.whats) && p.f(c, m); });
      $('#p-qtd', mk).textContent = lista.length + ' pessoas neste público';
      $('#p-lista', mk).innerHTML = lista.slice(0, 40).map(function (c) { var a = CRM.apAtual(c), msg = $('#p-msg', mk).value.replace(/\{nome\}/g, CRM.primeiro(c.nome)).replace(/\{modelo\}/g, a.modelo); return '<div class="linha"><span class="av">' + CRM.iniciais(c.nome) + '</span><div class="info"><strong>' + esc(c.nome) + '</strong><span>' + esc(a.modelo) + ' há ' + CRM.quando(a.desde).replace('há ', '') + ' · ' + CRM.resumoCliente(c).segmento + '</span></div>' + CRM.wa(c.whats, msg, 'Enviar') + '</div>'; }).join('') || '<div class="vazio">Ninguém neste público agora.</div>';
    }
    $('#p-msg', mk).value = PUB[pubAtual].msg;
    mk.onclick = function (e) { var b = e.target.closest('[data-pub]'); if (b) { pubAtual = b.dataset.pub; publicos(mk); } };
    $('#p-mod', mk).onchange = render; $('#p-msg', mk).oninput = render;
    $('#p-csv', mk).onclick = function () { CRM.csvMeta('hs-publico-' + pubAtual + '.csv', lista); };
    render();
  }
  function meta(mk) {
    var cs = CRM.db.campanhas, t = { inv: 0, imp: 0, cli: 0, cad: 0, q: 0, v: 0, r: 0 };
    cs.forEach(function (c) { t.inv += c.investimento; t.imp += c.impressoes; t.cli += c.cliques; t.cad += c.cadastros; t.q += c.quentes; t.v += c.vendas; t.r += c.receita; });
    mk.innerHTML = '<div class="alerta azul"><span><b>Dados de exemplo.</b> Ao conectar a conta de anúncios (Configurações › Integrações), estes números vêm direto da Meta, cruzados com as vendas do CRM, para mostrar o retorno de verdade e não só o custo por lead.</span></div>' +
      '<div class="grade g4 mb"><div class="kpi"><span>Investido (30 dias)' + EX + '</span><strong>' + R0(t.inv) + '</strong></div><div class="kpi"><span>Custo por cadastro</span><strong>' + R(t.inv / t.cad) + '</strong><small>' + t.cad + ' cadastros</small></div><div class="kpi"><span>Custo por lead quente</span><strong>' + R(t.inv / t.q) + '</strong><small>' + t.q + ' quentes</small></div><div class="kpi"><span>Retorno (ROAS)</span><strong>' + (t.r / t.inv).toFixed(1).replace('.', ',') + 'x</strong><small>' + CRM.Rk(t.r) + ' em vendas atribuídas</small></div></div>' +
      '<div class="tabela-wrap mb"><table><thead><tr><th>Campanha</th><th>Status</th><th class="num">Investido</th><th class="num">Cadastros</th><th class="num">Custo/cad.</th><th class="num">Quentes</th><th class="num">Custo/quente</th><th class="num">Vendas</th><th class="num">ROAS</th></tr></thead><tbody>' +
      cs.map(function (c) { return '<tr><td><b>' + esc(c.nome) + '</b><span class="sub-td">Objetivo: ' + c.objetivo + '</span></td><td><span class="selo ' + (c.status === 'ativa' ? 's-verde' : 's-cinza') + '">' + c.status + '</span></td><td class="num">' + R0(c.investimento) + '</td><td class="num">' + c.cadastros + '</td><td class="num">' + R(c.investimento / c.cadastros) + '</td><td class="num">' + c.quentes + '</td><td class="num"><b>' + R(c.investimento / c.quentes) + '</b></td><td class="num">' + c.vendas + '</td><td class="num">' + (c.receita / c.investimento).toFixed(1).replace('.', ',') + 'x</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="grade g2"><div class="card"><h2>Funil dos anúncios' + EX + '</h2><p class="sub">Onde as pessoas ficam pelo caminho</p>' + CRM.barrasH([['Impressões', t.imp], ['Cliques', t.cli], ['Cadastros', t.cad], ['Leads quentes', t.q], ['Vendas', t.v]], function (v) { return v.toLocaleString('pt-BR'); }) + '</div>' +
      '<div class="card"><h2>Leitura rápida</h2><div class="lista" style="margin-top:.4rem"><div class="linha"><div class="info"><strong>Escalar: Conserto · antes e depois</strong><span>Menor custo por lead quente e maior volume de vendas.</span></div></div><div class="linha"><div class="info"><strong>Manter: Upgrade</strong><span>Lead caro, mas é o de maior ticket. Vale pelo ROAS.</span></div></div><div class="linha"><div class="info"><strong>Revisar: Seminovos · vitrine</strong><span>Pausada. Muito curioso, pouco quente: trocar o criativo.</span></div></div></div></div></div>';
  }
  function base(mk) {
    var db = CRM.db, imp = db.importados || (db.importados = []);
    var requal = imp.filter(function (i) { return db.leads.some(function (l) { return HSDB.soDigitos(l.whats) === i.whats; }); });
    var link = location.href.replace(/crm\/.*$/, 'cadastro/');
    mk.innerHTML = '<div class="col-2-1"><div class="card"><h2>1. Cole os contatos antigos</h2><p class="sub">Do celular ou do WhatsApp Business, um por linha: nome, telefone. Repetidos e quem já é cliente ficam de fora.</p><textarea class="txt" id="b-txt" style="min-height:160px;font-family:ui-monospace,monospace" placeholder="Maria Souza, 71 99999-0000&#10;71 98888-1111"></textarea><div class="filtros" style="margin-top:8px"><button class="btn btn-pri" id="b-imp">Importar</button><span id="b-res" style="color:var(--cinza);font-size:.88rem"></span></div></div>' +
      '<div class="card"><h2>2. Requalifique</h2><p class="sub">Mande o link do cupom. Quem responder volta como lead com aparelho e temperatura.</p><div class="grade" style="grid-template-columns:1fr 1fr"><div class="kpi"><span>Na base antiga</span><strong>' + imp.length + '</strong></div><div class="kpi"><span>Recadastrados</span><strong>' + requal.length + '</strong><small>' + CRM.pct(imp.length ? requal.length / imp.length : 0) + '</small></div></div><button class="btn btn-sec" id="b-csv" style="width:100%;margin-top:10px">Exportar para remarketing na Meta</button></div></div>' +
      '<div class="card" style="margin-top:14px"><h2>Contatos importados</h2><div class="lista">' + (imp.slice(0, 60).map(function (i) { var ok = requal.indexOf(i) >= 0; return '<div class="linha"><span class="av">' + (i.nome ? CRM.iniciais(i.nome) : '?') + '</span><div class="info"><strong>' + esc(i.nome || 'Sem nome') + ' ' + (ok ? '<span class="selo s-verde">recadastrou</span>' : '<span class="selo s-cinza">base antiga</span>') + '</strong><span>' + CRM.fone(i.whats) + '</span></div>' + (ok ? '' : CRM.wa(i.whats, 'Oi' + (i.nome ? ', ' + CRM.primeiro(i.nome) : '') + '! Aqui é da HS, agora na Galeria Tenaz (Federação). Estamos atualizando o cadastro e quem se cadastra ganha R$ 100 de desconto: ' + link, 'Mandar cupom')) + '</div>'; }).join('') || '<div class="vazio">Nenhum contato importado ainda.</div>') + '</div></div>';
    $('#b-imp', mk).onclick = function () {
      var n = 0, rep = 0;
      $('#b-txt', mk).value.split(/\n+/).forEach(function (ln) { var tel = (ln.match(/[\d\s()+-]{8,}/) || [''])[0], w = HSDB.soDigitos(tel); if (w.length < 10) return; if (w.length <= 11) w = '55' + w;
        if (imp.some(function (i) { return i.whats === w; }) || db.clientes.some(function (c) { return HSDB.soDigitos(c.whats) === w; })) { rep++; return; }
        imp.push({ whats: w, nome: ln.replace(tel, '').replace(/[,;\t]/g, ' ').trim(), em: new Date().toISOString() }); n++; });
      CRM.salvar(); base(mk); $('#b-res', mk).textContent = n + ' importados' + (rep ? ', ' + rep + ' repetidos ignorados' : '');
    };
    $('#b-csv', mk).onclick = function () { CRM.csvMeta('hs-base-antiga.csv', imp); };
  }

  /* ================= AUTOMAÇÕES ================= */
  var MSG_AUTO = {
    'Aparelho pronto': 'Oi, {nome}! Seu {modelo} (OS {os}) está pronto ✅ Valor: {valor}. Retire na Galeria Tenaz, seg a sex 9h–18h e sáb 9h–13h.',
    'Pedir avaliação no Google': 'Oi, {nome}! Tudo certo com o seu {modelo}? Se puder, conta como foi no Google, ajuda demais a loja: {link}',
    'Cadastro quente sem resposta': '(alerta interno) Lead quente {nome} esperando há 15 min. Responda agora.',
    'Upgrade aos 24 meses': 'Oi, {nome}! Seu {modelo} completou 2 anos. Ele vale entrada num iPhone mais novo. Quer a avaliação?',
    'Garantia acabando': 'Oi, {nome}! A garantia do serviço no seu {modelo} acaba em 10 dias. Quer uma revisão grátis antes?',
    'Aniversário': 'Feliz aniversário, {nome}! 🎉 Tem película de presente para o seu {modelo} esperando na loja.',
    'Bateria abaixo de 80%': 'Oi, {nome}! No diagnóstico vimos que a bateria do seu {modelo} está abaixo de 80%. A troca leva 1 hora. Quer agendar?',
    'Cupom vencendo': 'Oi, {nome}! Seu cupom de R$ 100 vence amanhã. Ainda dá tempo de usar no seu próximo iPhone 😉'
  };
  CRM.telas.automacoes = function (el) {
    var as = CRM.db.automacoes;
    el.innerHTML = '<div class="cab"><div><h1>Automações</h1><p>Réguas que disparam sozinhas a partir do que acontece no CRM. É o pós-venda que hoje não existe.</p></div></div>' +
      '<div class="alerta azul"><span><b>Como funciona.</b> Cada régua tem um gatilho (algo que acontece no CRM) e uma ação (mensagem no WhatsApp oficial ou alerta para a equipe). Os números abaixo são de exemplo e passam a ser reais quando o WhatsApp oficial for conectado.</span></div>' +
      '<div class="grade g2">' + as.map(function (a, i) {
        return '<div class="card"><h2><button class="toggle" role="switch" aria-checked="' + a.ativa + '" data-t="' + i + '" aria-label="Ligar ou desligar"></button>' + esc(a.nome) + '</h2>' +
          '<p class="sub" style="margin-top:.4rem"><b>Quando:</b> ' + esc(a.gatilho) + '<br><b>Faz:</b> ' + esc(a.acao) + '</p>' +
          '<div style="background:#F3F1EA;border-radius:10px;padding:10px 12px;font-size:.85rem;margin-bottom:10px">' + esc(MSG_AUTO[a.nome] || '') + '</div>' +
          '<div class="grade" style="grid-template-columns:repeat(3,1fr);gap:8px"><div><small style="color:var(--cinza)">Disparos' + EX + '</small><div style="font-weight:800">' + a.disparos + '</div></div><div><small style="color:var(--cinza)">Respostas</small><div style="font-weight:800">' + a.respostas + (a.disparos ? ' <small style="color:var(--cinza);font-weight:500">(' + CRM.pct(a.respostas / a.disparos) + ')</small>' : '') + '</div></div><div><small style="color:var(--cinza)">Viraram venda</small><div style="font-weight:800">' + a.conversoes + '</div></div></div></div>';
      }).join('') + '</div>';
    el.onclick = function (e) { var t = e.target.closest('[data-t]'); if (!t) return; var a = as[t.dataset.t]; a.ativa = !a.ativa; CRM.salvar(); t.setAttribute('aria-checked', a.ativa); CRM.toast(a.nome + (a.ativa ? ' ligada' : ' desligada')); };
  };

  /* ================= AVALIAÇÕES ================= */
  CRM.telas.avaliacoes = function (el) {
    var av = CRM.db.avaliacoes.slice().sort(function (a, b) { return a.data < b.data ? 1 : -1; });
    var nps = av.filter(function (a) { return a.canal === 'NPS'; }), prom = nps.filter(function (a) { return a.nota === 5; }).length, det = nps.filter(function (a) { return a.nota <= 3; }).length;
    var entregues = CRM.db.os.filter(function (o) { return o.status === 'entregue' && CRM.dias(o.entregue) <= 7; });
    el.innerHTML = '<div class="cab"><div><h1>Avaliações</h1><p>Reputação no Google e satisfação depois de cada atendimento.</p></div></div>' +
      '<div class="grade g4 mb"><div class="kpi"><span>Nota no Google</span><strong>4,6 ★</strong><small>56 avaliações (público, 16/10/2026)</small></div><div class="kpi"><span>NPS' + EX + '</span><strong>' + Math.round((prom - det) / Math.max(1, nps.length) * 100) + '</strong><small>' + nps.length + ' respostas</small></div>' +
      '<div class="kpi"><span>Sem resposta</span><strong>' + av.filter(function (a) { return !a.respondida; }).length + '</strong><small>responder todas melhora o Google</small></div><div class="kpi"><span>Entregues na semana</span><strong>' + entregues.length + '</strong><small>candidatos a pedir avaliação</small></div></div>' +
      '<div class="col-2-1"><div class="card"><h2>Avaliações recentes' + EX + '</h2><div class="lista">' + av.map(function (a) { var c = CRM.cli(a.clienteId) || { nome: '—' }; return '<div class="linha"><span class="av">' + CRM.iniciais(c.nome) + '</span><div class="info"><strong>' + '★'.repeat(a.nota) + '<span style="color:var(--borda)">' + '★'.repeat(5 - a.nota) + '</span> · ' + esc(c.nome) + ' <span class="selo s-cinza">' + a.canal + '</span></strong><span>“' + esc(a.texto) + '” · ' + CRM.quando(a.data) + '</span></div>' + (a.respondida ? '<span class="selo s-verde">respondida</span>' : '<button class="btn btn-sec btn-p" data-resp="' + a.id + '">Marcar respondida</button>') + '</div>'; }).join('') + '</div></div>' +
      '<div class="card"><h2>Pedir avaliação</h2><p class="sub">Clientes que retiraram o aparelho nos últimos 7 dias.</p><div class="lista">' + (entregues.slice(0, 10).map(function (o) { var c = CRM.cli(o.clienteId); return '<div class="linha"><div class="info"><strong>' + esc(c.nome) + '</strong><span>OS ' + o.num + ' · ' + o.modelo + '</span></div>' + CRM.wa(c.whats, 'Oi, ' + CRM.primeiro(c.nome) + '! Aqui é da HS. Tudo certo com o seu ' + o.modelo + '? Se puder, conta como foi no Google, ajuda muito a loja 💛', 'Pedir') + '</div>'; }).join('') || '<div class="vazio">Ninguém na última semana.</div>') + '</div></div></div>';
    el.onclick = function (e) { var b = e.target.closest('[data-resp]'); if (!b) return; CRM.db.avaliacoes.filter(function (a) { return a.id === b.dataset.resp; })[0].respondida = true; CRM.salvar(); CRM.telas.avaliacoes(el); };
  };

  /* ================= CAIXA DE ENTRADA DA IA ================= */
  var convAtual = null;
  CRM.telas.inbox = function (el) {
    var cv = CRM.db.conversas; convAtual = convAtual || (cv[0] && cv[0].id);
    var c = cv.filter(function (x) { return x.id === convAtual; })[0];
    var ST = { 'aguardando humano': 's-vermelho', 'IA atendendo': 's-verde', 'encerrada': 's-cinza', 'humano': 's-ouro' };
    el.innerHTML = '<div class="cab"><div><h1>Caixa de entrada da IA</h1><p>O agente atende no WhatsApp 24 horas, faz a triagem e chama vocês só quando vale a pena.</p></div></div>' +
      '<div class="alerta azul"><span><b>Conversas de exemplo.</b> Mostram como o agente trabalha: pergunta modelo, estado, bateria e prazo, calcula a troca e passa o lead quente com resumo pronto.</span></div>' +
      '<div class="inbox"><div class="conversas">' + cv.map(function (x) { return '<button class="conv" data-cv="' + x.id + '" aria-current="' + (x.id === convAtual) + '"><strong>' + esc(x.nome) + '<span class="selo ' + ST[x.status] + '">' + x.status + '</span></strong><span>' + esc(x.msgs[x.msgs.length - 1][1]) + '</span><span><span class="selo s-' + x.temp + '" style="margin-top:4px">' + x.temp + '</span> · ' + CRM.quando(x.inicio) + '</span></button>'; }).join('') + '</div>' +
      (c ? '<div class="chat"><header><span class="av">' + CRM.iniciais(c.nome) + '</span><div style="flex:1"><b>' + esc(c.nome) + '</b><div style="font-size:.8rem;color:var(--cinza)">' + CRM.fone(c.whats) + '</div></div>' + (c.status !== 'humano' ? '<button class="btn btn-pri btn-p" data-assumir>Assumir conversa</button>' : '<span class="selo s-ouro">você está atendendo</span>') + '<button class="btn btn-sec btn-p" data-lead>Criar lead</button></header>' +
        '<div class="msgs">' + c.msgs.map(function (m) { return '<div class="msg ' + m[0] + '">' + esc(m[1]) + '<small>' + m[2] + '</small></div>'; }).join('') + '</div>' +
        '<div class="resumo"><b>Resumo da IA:</b> ' + esc(c.resumo) + '</div><footer><input id="cv-txt" placeholder="' + (c.status === 'humano' ? 'Escreva uma mensagem…' : 'Assuma a conversa para responder') + '"' + (c.status === 'humano' ? '' : ' disabled') + '><button class="btn btn-pri" data-enviar' + (c.status === 'humano' ? '' : ' disabled') + '>Enviar</button></footer></div>' : '<div class="vazio">Nenhuma conversa.</div>') + '</div>';
    el.onclick = function (e) {
      var b = e.target.closest('[data-cv]'); if (b) { convAtual = b.dataset.cv; return CRM.telas.inbox(el); }
      if (e.target.closest('[data-assumir]')) { c.status = 'humano'; c.msgs.push(['humano', 'Oi, ' + CRM.primeiro(c.nome) + '! Aqui é da HS, vou continuar seu atendimento 😊', new Date().toTimeString().slice(0, 5)]); CRM.salvar(); return CRM.telas.inbox(el); }
      if (e.target.closest('[data-enviar]')) { var t = $('#cv-txt', el).value.trim(); if (t) { c.msgs.push(['humano', t, new Date().toTimeString().slice(0, 5)]); CRM.salvar(); CRM.telas.inbox(el); } return; }
      if (e.target.closest('[data-lead]')) { var l = HSDB.novoLead({ nome: c.nome, whats: c.whats, origem: 'WhatsApp (IA)', interesse: /troca/i.test(c.resumo) ? 'troca' : /tela|água|bateria/i.test(c.resumo) ? 'conserto' : 'comprar', modelo_atual: '', prazo: c.temp === 'quente' ? 'semana' : 'mes', pagamento: 'pix', notas: [{ data: new Date().toISOString(), txt: 'Resumo da IA: ' + c.resumo, autor: CRM.eu().id }] }); CRM.db = HSDB.ler(); CRM.contadores(); CRM.toast('Lead criado'); CRM.abrir.lead(l.id); }
    };
    var inp = $('#cv-txt', el); if (inp) inp.onkeydown = function (e) { if (e.key === 'Enter') $('[data-enviar]', el).click(); };
  };

  /* ================= RELATÓRIOS ================= */
  CRM.telas.relatorios = function (el) {
    var db = CRM.db, meses = [];
    for (var i = 3; i >= 0; i--) {
      var ref = new Date(HOJE.getFullYear(), HOJE.getMonth() - i, 1), apar = 0, ac = 0, serv = 0;
      db.vendas.forEach(function (v) { if (CRM.noMes(v.data, i)) v.itens.forEach(function (it) { if (it.tipo === 'aparelho') apar += it.valor; else ac += it.valor; }); });
      db.os.forEach(function (o) { if (o.entregue && CRM.noMes(o.entregue, i)) serv += o.valor; });
      meses.push({ nome: ref.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), apar: apar, ac: ac, serv: serv, parcial: i === 0 });
    }
    function mini(campo, titulo) { return '<div class="card"><h2>' + titulo + '</h2><p class="sub">Por mês · o atual está em andamento</p>' + CRM.barras(meses.map(function (m) { return { rotulo: m.nome, valor: m[campo], destaque: m.parcial, dica: m.nome }; }), { altura: 190, largura: 340, titulo: titulo }) + '</div>'; }
    var porOrigem = {}; db.clientes.forEach(function (c) { porOrigem[c.origem] = (porOrigem[c.origem] || 0) + CRM.resumoCliente(c).gasto; });
    var conv = {}; db.leads.forEach(function (l) { var o = conv[l.origem] = conv[l.origem] || { total: 0, ganho: 0, perdido: 0, resp: [] }; o.total++; if (l.status === 'ganho') o.ganho++; if (l.status === 'perdido') o.perdido++; if (l.primeiraResposta != null) o.resp.push(l.primeiraResposta); });
    var mot = {}; db.leads.filter(function (l) { return l.motivoPerda; }).forEach(function (l) { mot[l.motivoPerda] = (mot[l.motivoPerda] || 0) + 1; });
    var mods = {}; db.clientes.forEach(function (c) { var m = CRM.apAtual(c).modelo; mods[m] = (mods[m] || 0) + 1; });
    el.innerHTML = '<div class="cab"><div><h1>Relatórios</h1><p>De onde vem o dinheiro, quem converte e onde os leads se perdem.</p></div><div class="acoes"><button class="btn btn-sec" onclick="print()">Imprimir</button></div></div>' +
      '<div class="grade g3 mb">' + mini('apar', 'Venda de iPhones') + mini('serv', 'Assistência') + mini('ac', 'Acessórios') + '</div>' +
      '<div class="grade g2 mb"><div class="card"><h2>Faturamento por origem do cliente</h2><p class="sub">Soma do que cada cliente já gastou, pela origem do cadastro</p>' + CRM.barrasH(Object.keys(porOrigem).map(function (k) { return [k, porOrigem[k]]; }).sort(function (a, b) { return b[1] - a[1]; }), CRM.Rk) + '</div>' +
      '<div class="card"><h2>Por que os leads se perdem</h2><p class="sub">Motivo registrado ao mover para “Perdido”</p>' + CRM.barrasH(Object.keys(mot).map(function (k) { return [k, mot[k]]; }).sort(function (a, b) { return b[1] - a[1]; })) + '</div></div>' +
      '<div class="grade g2"><div class="tabela-wrap"><table><thead><tr><th>Origem do lead</th><th class="num">Leads</th><th class="num">Ganhos</th><th class="num">Conversão</th><th class="num">1ª resposta</th></tr></thead><tbody>' +
      Object.keys(conv).map(function (k) { var o = conv[k], r = o.resp.length ? o.resp.reduce(function (s, x) { return s + x; }, 0) / o.resp.length : 0; return '<tr><td><b>' + esc(k) + '</b></td><td class="num">' + o.total + '</td><td class="num">' + o.ganho + '</td><td class="num">' + CRM.pct(o.ganho / Math.max(1, o.ganho + o.perdido)) + '</td><td class="num">' + (r ? (r < 60 ? Math.round(r) + ' min' : (r / 60).toFixed(1).replace('.', ',') + ' h') : '—') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="card"><h2>Aparelhos na base</h2><p class="sub">Modelo atual dos clientes: orienta compra de peças e campanhas</p>' + CRM.barrasH(Object.keys(mods).map(function (k) { return [k, mods[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10)) + '</div></div>';
  };

  /* ================= CONFIGURAÇÕES ================= */
  CRM.telas.config = function (el, aba) {
    aba = aba || 'metas'; var db = CRM.db;
    el.innerHTML = '<div class="cab"><div><h1>Configurações</h1><p>Metas, equipe, integrações e dados.</p></div></div><div class="abas">' + [['metas', 'Metas'], ['equipe', 'Equipe e permissões'], ['integracoes', 'Integrações'], ['dados', 'Dados e LGPD']].map(function (x) { return '<button class="aba" data-aba="' + x[0] + '" aria-selected="' + (aba === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div><div id="cf"></div>';
    var cf = $('#cf', el);
    if (aba === 'metas') {
      cf.innerHTML = '<div class="card" style="max-width:620px"><h2>Metas do mês</h2><p class="sub">Usadas na tela Início para calcular a projeção.</p><div class="form"><div><label>Faturamento (R$)</label><input id="m-r" value="' + db.metas.receita + '" inputmode="numeric"></div><div><label>iPhones vendidos</label><input id="m-i" value="' + db.metas.iphones + '" inputmode="numeric"></div><div><label>Consertos entregues</label><input id="m-c" value="' + db.metas.consertos + '" inputmode="numeric"></div><div><label>Cadastros no site</label><input id="m-k" value="' + db.metas.cadastros + '" inputmode="numeric"></div><div class="inteiro"><button class="btn btn-pri" id="m-ok">Salvar metas</button></div></div></div>';
      $('#m-ok', cf).onclick = function () { db.metas = { receita: +$('#m-r', cf).value || 0, iphones: +$('#m-i', cf).value || 0, consertos: +$('#m-c', cf).value || 0, cadastros: +$('#m-k', cf).value || 0 }; CRM.salvar(); CRM.toast('Metas salvas'); CRM.ir('inicio'); };
    }
    if (aba === 'equipe') {
      cf.innerHTML = '<div class="tabela-wrap"><table><thead><tr><th>Pessoa</th><th>Papel</th><th>Início</th><th>Leads</th><th>Clientes</th><th>Vendas</th><th>Assistência</th><th>Estoque</th><th>Marketing</th><th>Config.</th></tr></thead><tbody>' +
        [['Dono', 'Dono', 1, 1, 1, 1, 1, 1, 1, 1], ['Sócia', 'Sócia', 1, 1, 1, 1, 1, 1, 1, 1], ['Técnico', 'Técnico', 0, 0, 1, 0, 1, 1, 0, 0]].map(function (u) { return '<tr><td><b>' + u[0] + '</b></td><td>' + u[1] + '</td>' + u.slice(2).map(function (v) { return '<td>' + (v ? '<span class="selo s-verde">sim</span>' : '<span class="selo s-cinza">não</span>') + '</td>'; }).join('') + '</tr>'; }).join('') +
        '</tbody></table></div><p class="sub" style="margin-top:8px">Troque de pessoa no canto superior direito para ver o CRM como o técnico. Na versão real, cada um entra com o próprio login e tudo fica registrado em nome de quem fez.</p>';
    }
    if (aba === 'integracoes') {
      var I = [['WhatsApp Business oficial (API)', 'Agente de IA, automações e envio pelo próprio CRM. Custo das conversas cobrado pela Meta.', 'a conectar'], ['Meta: pixel e API de conversões', 'Mede cadastros e vendas do site e otimiza os anúncios para o lead que compra.', 'a conectar'], ['Conta de anúncios da Meta', 'Traz investimento e resultado das campanhas para cá.', 'a conectar'], ['Google Meu Negócio', 'Avaliações e cliques em "como chegar".', 'a conectar'], ['Banco de dados (Supabase)', 'Guarda tudo na nuvem com login por pessoa. Hoje, na demonstração, fica só neste navegador.', 'demonstração'], ['Maquininha / Pix', 'Baixa automática das vendas no caixa.', 'opcional']];
      cf.innerHTML = '<div class="grade g2">' + I.map(function (x) { return '<div class="card"><h2>' + x[0] + '<span class="selo ' + (x[2] === 'demonstração' ? 's-amarelo' : 's-cinza') + '" style="margin-left:auto">' + x[2] + '</span></h2><p class="sub" style="margin-top:.4rem">' + x[1] + '</p><button class="btn btn-sec btn-p" disabled>Conectar na implantação</button></div>'; }).join('') + '</div>';
    }
    if (aba === 'dados') {
      var semOpt = db.clientes.filter(function (c) { return c.optin && !c.optin.whats; }).length;
      cf.innerHTML = '<div class="grade g2"><div class="card"><h2>Backup</h2><p class="sub">Baixe todos os dados do CRM em um arquivo.</p><button class="btn btn-sec" id="bk">Baixar backup (.json)</button></div>' +
        '<div class="card"><h2>LGPD</h2><p class="sub">' + semOpt + ' clientes não aceitam mensagens e ficam fora de campanhas e exportações. O pedido de exclusão é feito na ficha do cliente.</p></div>' +
        '<div class="card"><h2>Recomeçar a demonstração</h2><p class="sub">Apaga os testes e volta aos dados de exemplo.</p><button class="btn btn-perigo" id="rz">Recomeçar dados</button></div></div>';
      $('#bk', cf).onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' })); a.download = 'hs-crm-backup.json'; a.click(); };
      $('#rz', cf).onclick = function () { if (confirm('Apagar tudo e voltar aos dados de exemplo?')) { CRM.db = HSDB.zerar(); CRM.contadores(); CRM.ir('inicio'); } };
    }
    el.onclick = function (e) { var a = e.target.closest('[data-aba]'); if (a) CRM.ir('config', a.dataset.aba); };
  };
})();
