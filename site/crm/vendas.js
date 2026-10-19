/* =====================================================================
   CRM HS — Início, Leads (funil), Clientes (360°) e Vendas (caixa rápido)
   ===================================================================== */
(function () {
  var C = HS, $ = CRM.$, $$ = CRM.$$, esc = CRM.esc, R = CRM.R, R0 = CRM.R0, HOJE = CRM.HOJE;
  var ROT = { comprar: 'Comprar iPhone', troca: 'Troca', conserto: 'Conserto', acessorios: 'Acessórios' };
  var PAG = { pix: 'Pix', cartao: 'Cartão', troca: 'Troca + diferença', dinheiro: 'Dinheiro' };
  var PRAZO = { semana: 'esta semana', mes: 'este mês', pesquisando: 'pesquisando' };
  var ETAPAS = [['novo', 'Novo'], ['em contato', 'Em contato'], ['proposta', 'Proposta'], ['ganho', 'Ganho'], ['perdido', 'Perdido']];
  var MOTIVOS = ['Achou mais barato', 'Sem limite no cartão', 'Desistiu da troca', 'Não respondeu mais', 'Comprou em outro lugar', 'Outro'];

  function receitaPeriodo(filtro) {
    var db = CRM.db, v = 0, custo = 0, n = 0, iph = 0;
    db.vendas.forEach(function (x) { if (filtro(x.data)) { v += CRM.totalVenda(x); custo += CRM.custoVenda(x); n++; iph += x.itens.filter(function (i) { return i.tipo === 'aparelho'; }).length; } });
    var os = db.os.filter(function (o) { return o.status === 'entregue' && filtro(o.entregue); });
    os.forEach(function (o) { v += o.valor; custo += o.custoPecas || 0; });
    return { receita: v, custo: custo, vendas: n, iphones: iph, consertos: os.length };
  }

  /* ================= INÍCIO ================= */
  CRM.telas.inicio = function (el) {
    var db = CRM.db, dia = HOJE.getDate(), diasMes = new Date(HOJE.getFullYear(), HOJE.getMonth() + 1, 0).getDate(), ritmo = dia / diasMes;
    var mes = receitaPeriodo(function (d) { return CRM.noMes(d); });
    var ant = receitaPeriodo(function (d) { var x = new Date(d); return CRM.noMes(d, 1) && x.getDate() <= dia; });
    var cad = db.leads.filter(function (l) { return CRM.noMes(l.criado); }).length;
    var varR = ant.receita ? (mes.receita - ant.receita) / ant.receita : 0;
    var margem = mes.receita ? 1 - mes.custo / mes.receita : 0;
    var quentes = db.leads.filter(function (l) { return l.status === 'novo' && l.temp === 'quente'; });
    var atrasadas = db.os.filter(function (o) { return o.status !== 'entregue' && o.status !== 'pronto' && new Date(o.prevista) < HOJE; });
    var h = HOJE.getHours(), eu = CRM.eu();
    function meta(nome, atual, alvo, fmt) {
      var proj = atual / ritmo, ok = proj >= alvo;
      return '<div class="meta"><div class="topo-meta"><span>' + nome + '</span><b>' + fmt(atual) + ' <small>de ' + fmt(alvo) + '</small></b></div>' +
        '<div class="barra" title="Linha dourada: onde deveria estar hoje"><i style="width:' + Math.min(100, atual / alvo * 100) + '%"></i><em style="left:' + (ritmo * 100) + '%"></em></div>' +
        '<small>No ritmo atual fecha o mês em <b class="' + (ok ? 'var-pos' : 'var-neg') + '">' + fmt(proj) + '</b> ' + (ok ? '· meta batida' : '· faltam ' + fmt(Math.max(0, alvo - proj))) + '</small></div>';
    }
    var serie = []; for (var i = 29; i >= 0; i--) { var d = new Date(HOJE); d.setDate(d.getDate() - i); var ds = d.toDateString(); serie.push({ rotulo: d.getDate() === 1 || i % 5 === 0 ? d.getDate() + '/' + (d.getMonth() + 1) : '', dica: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }), valor: receitaPeriodo(function (x) { return new Date(x).toDateString() === ds; }).receita, destaque: i === 0 }); }

    var agenda = [];
    db.tarefas.filter(function (t) { return !t.feita && CRM.dias(t.data) >= 0; }).forEach(function (t) { agenda.push('<div class="linha"><input type="checkbox" data-tarefa="' + t.id + '" style="width:18px;height:18px;accent-color:#16161A"><div class="info"><strong>' + esc(t.titulo) + '</strong><span>Tarefa · ' + CRM.usuario(t.dono).nome + '</span></div></div>'); });
    db.leads.filter(function (l) { return l.proximaAcao && CRM.dias(l.proximaAcao.data) >= 0 && l.status !== 'ganho' && l.status !== 'perdido'; }).slice(0, 6).forEach(function (l) { agenda.push('<div class="linha"><span class="av">' + CRM.iniciais(l.nome) + '</span><div class="info"><strong>' + esc(l.nome) + ' <span class="selo s-' + l.temp + '">' + l.temp + '</span></strong><span>' + esc(l.proximaAcao.desc) + ' · ' + (CRM.dias(l.proximaAcao.data) > 0 ? '<b class="var-neg">atrasado</b>' : 'hoje') + '</span></div><button class="btn btn-sec btn-p" data-lead="' + l.id + '">Abrir</button></div>'); });
    db.os.filter(function (o) { return o.status === 'pronto'; }).forEach(function (o) { var c = CRM.cli(o.clienteId); agenda.push('<div class="linha"><span class="ic-linha s-verde">' + CRM.icone('assistencia') + '</span><div class="info"><strong>Avisar retirada · OS ' + o.num + '</strong><span>' + esc(c.nome) + ' · ' + o.modelo + ' · ' + R(o.valor) + '</span></div>' + CRM.wa(c.whats, 'Oi, ' + CRM.primeiro(c.nome) + '! Aqui é da HS. Seu ' + o.modelo + ' (OS ' + o.num + ') está pronto ✅ Valor: ' + R(o.valor) + '. Pode retirar na Galeria Tenaz, seg a sex 9h–18h e sáb 9h–13h.', 'Avisar') + '</div>'); });

    el.innerHTML = '<div class="cab"><div><h1>' + (h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite') + ', ' + eu.nome + '</h1><p>' + HOJE.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · dia ' + dia + ' de ' + diasMes + '</p></div></div>' +
      '<div class="grade g4 mb">' +
        '<div class="kpi"><span>Faturamento do mês</span><strong>' + CRM.Rk(mes.receita) + '</strong><small><span class="' + (varR >= 0 ? 'var-pos' : 'var-neg') + '">' + (varR >= 0 ? '▲ ' : '▼ ') + CRM.pct(Math.abs(varR)) + '</span> vs. mesmo período do mês passado</small></div>' +
        '<div class="kpi"><span>Margem bruta</span><strong>' + CRM.pct(margem) + '</strong><small>' + CRM.Rk(mes.receita - mes.custo) + ' de lucro bruto</small></div>' +
        '<div class="kpi"><span>Leads quentes sem resposta</span><strong style="color:' + (quentes.length ? 'var(--vermelho)' : 'inherit') + '">' + quentes.length + '</strong><small>meta: responder em até 15 min</small></div>' +
        '<div class="kpi"><span>OS atrasadas</span><strong style="color:' + (atrasadas.length ? 'var(--vermelho)' : 'inherit') + '">' + atrasadas.length + '</strong><small>' + db.os.filter(function (o) { return o.status !== 'entregue'; }).length + ' aparelhos na bancada</small></div>' +
      '</div>' +
      '<div class="col-2-1 mb"><div class="card"><h2>Metas de ' + HOJE.toLocaleDateString('pt-BR', { month: 'long' }) + '<a class="acao" href="#config/metas">Editar metas</a></h2><p class="sub">A linha dourada mostra onde vocês deveriam estar hoje para bater a meta.</p><div class="grade g2" style="gap:18px">' +
        meta('Faturamento', mes.receita, db.metas.receita, CRM.Rk) + meta('iPhones vendidos', mes.iphones, db.metas.iphones, function (v) { return Math.round(v); }) +
        meta('Consertos entregues', mes.consertos, db.metas.consertos, function (v) { return Math.round(v); }) + meta('Cadastros no site', cad, db.metas.cadastros, function (v) { return Math.round(v); }) + '</div></div>' +
        '<div class="card"><h2>Alertas</h2><p class="sub">O que precisa de atenção agora.</p><div id="lista-alertas"></div></div></div>' +
      '<div class="col-2-1"><div class="card"><h2>Faturamento por dia<a class="acao" href="#relatorios">Relatórios</a></h2><p class="sub">Últimos 30 dias · vendas + consertos entregues</p>' + CRM.barras(serie, { titulo: 'Faturamento por dia', altura: 210 }) + '</div>' +
        '<div class="card"><h2>Agenda de hoje</h2><p class="sub">Tarefas, retornos combinados e retiradas.</p><div class="lista">' + (agenda.join('') || '<div class="vazio">Nada pendente.</div>') + '</div></div></div>';

    var todos = CRM.alertas(), vistos = {}, al = todos.filter(function (a) { vistos[a.t.split(' ')[0]] = (vistos[a.t.split(' ')[0]] || 0) + 1; return vistos[a.t.split(' ')[0]] <= 2; }); CRM._alertasInicio = al;
    $('#lista-alertas').innerHTML = al.slice(0, 6).map(function (a, i) { return '<button class="alerta ' + a.tipo + '" data-ai="' + i + '" style="width:100%;text-align:left"><span><b>' + a.t + '</b>' + esc(a.d) + '</span></button>'; }).join('') + (todos.length > 6 ? '<p class="sub">+ ' + (todos.length - Math.min(6, al.length)) + ' no sino lá em cima</p>' : '') || '<div class="vazio">Tudo em dia.</div>';
    el.onclick = function (e) {
      var a = e.target.closest('[data-ai]'); if (a) return CRM._alertasInicio[a.dataset.ai].ir();
      var l = e.target.closest('[data-lead]'); if (l) return CRM.abrir.lead(l.dataset.lead);
    };
    el.onchange = function (e) { var t = e.target.dataset.tarefa; if (!t) return; db.tarefas.filter(function (x) { return x.id === t; })[0].feita = true; CRM.salvar(); e.target.closest('.linha').style.opacity = .4; CRM.toast('Tarefa concluída'); };
  };

  /* ================= LEADS ================= */
  var fLead = { temp: '', origem: '', dono: '' };
  function msgLead(l) {
    var n = CRM.primeiro(l.nome);
    if (l.interesse === 'conserto') return 'Oi, ' + n + '! Aqui é da HS. Vi seu cadastro (cupom ' + l.cupom + '). O que está acontecendo com o seu ' + l.modelo_atual + '? Me manda uma foto que eu já te passo o orçamento.';
    if (l.interesse === 'acessorios') return 'Oi, ' + n + '! Aqui é da HS. Separei opções de capa e película para o seu ' + l.modelo_atual + '. Quer ver as fotos?';
    if (l.troca && l.troca.valor) return 'Oi, ' + n + '! Aqui é da HS. Vi sua avaliação: seu ' + l.troca.modelo + ' entra por cerca de ' + R0(l.troca.valor) + ' no ' + (l.modelo_desejado || 'iPhone novo') + '. Quer passar na loja para confirmar? Seu cupom é ' + l.cupom + '.';
    return 'Oi, ' + n + '! Aqui é da HS. Vi seu cadastro (cupom ' + l.cupom + ', R$ 100 OFF). ' + (l.modelo_desejado ? 'Tenho o ' + l.modelo_desejado + ' aqui. ' : '') + 'Quer que eu te mande fotos e as condições?';
  }
  function sla(l) {
    if (l.status === 'novo') { var min = Math.round((HOJE - new Date(l.criado)) / 6e4); return '<span class="sla ' + (min > 15 ? 'ruim' : 'ok') + '">⏱ sem resposta ' + CRM.quando(l.criado).replace('há ', 'há ') + '</span>'; }
    return l.primeiraResposta != null ? '<span class="sla ' + (l.primeiraResposta > 15 ? 'ruim' : 'ok') + '">respondido em ' + (l.primeiraResposta < 60 ? l.primeiraResposta + ' min' : Math.round(l.primeiraResposta / 60) + ' h') + '</span>' : '';
  }
  CRM.telas.leads = function (el) {
    var db = CRM.db;
    var origens = {}; db.leads.forEach(function (l) { origens[l.origem] = 1; });
    var ls = db.leads.filter(function (l) { return (!fLead.temp || l.temp === fLead.temp) && (!fLead.origem || l.origem === fLead.origem) && (!fLead.dono || l.dono === fLead.dono); });
    var abertos = ls.filter(function (l) { return l.status !== 'ganho' && l.status !== 'perdido'; });
    var ganhos = ls.filter(function (l) { return l.status === 'ganho'; }).length, perdidos = ls.filter(function (l) { return l.status === 'perdido'; }).length;
    var resp = ls.filter(function (l) { return l.primeiraResposta != null; });
    var tmr = resp.length ? resp.reduce(function (s, l) { return s + l.primeiraResposta; }, 0) / resp.length : 0;
    el.innerHTML = '<div class="cab"><div><h1>Leads</h1><p>Cadastros do site, avaliações de troca e conversas do anúncio. Arraste o cartão para mudar de etapa.</p></div><div class="acoes"><button class="btn btn-pri" data-novo-lead>+ Novo lead</button></div></div>' +
      '<div class="grade g4 mb"><div class="kpi"><span>Em aberto</span><strong>' + abertos.length + '</strong><small>' + R0(abertos.reduce(function (s, l) { return s + (l.valorEstimado || 0); }, 0)) + ' em negociação</small></div>' +
      '<div class="kpi"><span>Taxa de conversão</span><strong>' + CRM.pct(ganhos / Math.max(1, ganhos + perdidos)) + '</strong><small>' + ganhos + ' ganhos · ' + perdidos + ' perdidos</small></div>' +
      '<div class="kpi"><span>Tempo médio de 1ª resposta</span><strong>' + (tmr < 60 ? Math.round(tmr) + ' min' : (tmr / 60).toFixed(1).replace('.', ',') + ' h') + '</strong><small>meta: até 15 min</small></div>' +
      '<div class="kpi"><span>Quentes em aberto</span><strong>' + abertos.filter(function (l) { return l.temp === 'quente'; }).length + '</strong><small>pontuação ≥ 6 no formulário</small></div></div>' +
      '<div class="filtros"><span style="font-size:.8rem;color:var(--cinza);font-weight:700">Temperatura</span>' + [['', 'Todas'], ['quente', 'Quentes'], ['morno', 'Mornos'], ['frio', 'Frios']].map(function (t) { return '<button class="chip" data-ft="' + t[0] + '" aria-pressed="' + (fLead.temp === t[0]) + '">' + t[1] + '</button>'; }).join('') +
      '<select class="sel" id="f-origem"><option value="">Todas as origens</option>' + Object.keys(origens).map(function (o) { return '<option' + (fLead.origem === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>' +
      '<select class="sel" id="f-dono"><option value="">Todos os responsáveis</option>' + db.usuarios.slice(0, 2).map(function (u) { return '<option value="' + u.id + '"' + (fLead.dono === u.id ? ' selected' : '') + '>' + u.nome + '</option>'; }).join('') + '</select></div>' +
      '<div class="quadro" id="quadro">' + ETAPAS.map(function (e) {
        var g = ls.filter(function (l) { return l.status === e[0]; }).sort(function (a, b) { return b.score - a.score || (a.criado < b.criado ? 1 : -1); });
        if (e[0] === 'ganho' || e[0] === 'perdido') g = g.slice(0, 12);
        return '<section class="coluna" data-etapa="' + e[0] + '"><header><b>' + e[1] + ' · ' + g.length + '</b><span>' + R0(g.reduce(function (s, l) { return s + (l.valorEstimado || 0); }, 0)) + '</span></header>' + g.map(function (l) {
          return '<article class="cartao-k" draggable="true" data-id="' + l.id + '"><strong>' + esc(l.nome) + '</strong><div class="meta-k">' + ROT[l.interesse] + (l.modelo_desejado ? ' → <b>' + esc(l.modelo_desejado) + '</b>' : '') + '<br>Tem ' + esc(l.modelo_atual) + ' · ' + PAG[l.pagamento] + ' · ' + PRAZO[l.prazo] + (l.campanha ? '<br>📣 ' + esc(l.campanha) : '') + (l.motivoPerda ? '<br><b>Motivo:</b> ' + esc(l.motivoPerda) : '') + '</div>' +
            '<div class="pe-k"><span class="selo s-' + l.temp + '">' + l.temp + '</span><span class="selo s-cinza">' + esc(l.origem) + '</span><span class="val">' + R0(l.valorEstimado) + '</span></div><div class="pe-k" style="margin-top:6px">' + sla(l) + '<span class="av" style="width:24px;height:24px;font-size:.62rem;margin-left:auto" title="' + CRM.usuario(l.dono).nome + '">' + CRM.usuario(l.dono).iniciais + '</span></div></article>';
        }).join('') + '</section>';
      }).join('') + '</div>';
    el.onclick = function (ev) {
      var b = ev.target.closest('[data-ft]'); if (b) { fLead.temp = b.dataset.ft; return CRM.telas.leads(el); }
      if (ev.target.closest('[data-novo-lead]')) return CRM.novo.lead();
      var c = ev.target.closest('.cartao-k'); if (c) CRM.abrir.lead(c.dataset.id);
    };
    $('#f-origem').onchange = function () { fLead.origem = this.value; CRM.telas.leads(el); };
    $('#f-dono').onchange = function () { fLead.dono = this.value; CRM.telas.leads(el); };
    // arrastar e soltar
    var arr = null;
    $$('.cartao-k', el).forEach(function (k) {
      k.addEventListener('dragstart', function (e) { arr = k.dataset.id; k.classList.add('arrastando'); e.dataTransfer.setData('text/plain', arr); });
      k.addEventListener('dragend', function () { k.classList.remove('arrastando'); $$('.coluna', el).forEach(function (c) { c.classList.remove('alvo'); }); });
    });
    $$('.coluna', el).forEach(function (col) {
      col.addEventListener('dragover', function (e) { e.preventDefault(); col.classList.add('alvo'); });
      col.addEventListener('dragleave', function () { col.classList.remove('alvo'); });
      col.addEventListener('drop', function (e) { e.preventDefault(); moverLead(e.dataTransfer.getData('text/plain') || arr, col.dataset.etapa, function () { CRM.telas.leads(el); }); });
    });
  };
  function moverLead(id, etapa, depois) {
    var l = CRM.db.leads.filter(function (x) { return x.id === id; })[0]; if (!l || l.status === etapa) return;
    if (etapa === 'perdido') {
      var m = prompt('Por que perdeu este lead?\n\n' + MOTIVOS.map(function (x, i) { return (i + 1) + '. ' + x; }).join('\n') + '\n\nDigite o número:', '1');
      if (!m) return; l.motivoPerda = MOTIVOS[(+m - 1)] || MOTIVOS[5];
    }
    if (l.status === 'novo' && l.primeiraResposta == null) l.primeiraResposta = Math.max(1, Math.round((HOJE - new Date(l.criado)) / 6e4));
    l.status = etapa; l.notas = l.notas || []; l.notas.unshift({ data: new Date().toISOString(), txt: 'Movido para "' + etapa + '"', autor: CRM.eu().id });
    if (etapa === 'ganho') { virarCliente(l); CRM.toast('Ganho! ' + CRM.primeiro(l.nome) + ' virou cliente.'); }
    CRM.salvar(); if (depois) depois();
  }
  function virarCliente(l) {
    var c = CRM.db.clientes.filter(function (c) { return HSDB.soDigitos(c.whats) === HSDB.soDigitos(l.whats); })[0];
    if (!c) {
      c = { id: 'c' + Date.now(), nome: l.nome, whats: l.whats, email: l.email || '', nasc: l.nasc || '', bairro: '', origem: l.origem, criado: new Date().toISOString(), tags: [], optin: { whats: l.optin !== false, email: !!l.email }, obs: 'Veio do lead ' + l.cupom,
        aparelhos: l.modelo_atual ? [{ id: HSDB.uid('a'), modelo: l.modelo_atual, gb: (l.troca || {}).gb || 128, cor: '', imei: '', desde: new Date().toISOString(), atual: true, compradoNaHS: false }] : [] };
      CRM.db.clientes.unshift(c);
    }
    l.clienteId = c.id; return c;
  }
  CRM.abrir.lead = function (id) {
    var l = CRM.db.leads.filter(function (x) { return x.id === id; })[0]; if (!l) return;
    var corpo = '<div class="filtros">' + CRM.wa(l.whats, msgLead(l), 'Chamar no WhatsApp', '') + (l.clienteId ? '<button class="btn btn-sec" data-ver-cli>Ver cliente</button>' : '<button class="btn btn-sec" data-virar>Virar cliente</button>') + '</div>' +
      '<div class="grade g2 mb"><div class="card"><h2>Interesse</h2><dl class="dados mt"><dt>Quer</dt><dd><b>' + ROT[l.interesse] + '</b>' + (l.modelo_desejado ? ' · ' + esc(l.modelo_desejado) : '') + '</dd><dt>Tem hoje</dt><dd>' + esc(l.modelo_atual) + '</dd><dt>Pagamento</dt><dd>' + PAG[l.pagamento] + '</dd><dt>Prazo</dt><dd>' + PRAZO[l.prazo] + '</dd><dt>Valor estimado</dt><dd>' + R0(l.valorEstimado) + '</dd><dt>Pontuação</dt><dd>' + l.score + ' · <span class="selo s-' + l.temp + '">' + l.temp + '</span></dd></dl></div>' +
      '<div class="card"><h2>Origem e contato</h2><dl class="dados"><dt>WhatsApp</dt><dd>' + CRM.fone(l.whats) + '</dd><dt>E-mail</dt><dd>' + (esc(l.email) || '—') + '</dd><dt>Origem</dt><dd>' + esc(l.origem) + '</dd>' + (l.campanha ? '<dt>Campanha</dt><dd>' + esc(l.campanha) + '</dd>' : '') + '<dt>Cupom</dt><dd>' + l.cupom + '</dd><dt>Entrou</dt><dd>' + CRM.data(l.criado, true) + '</dd><dt>Responsável</dt><dd><select class="sel" id="l-dono" style="min-height:32px">' + CRM.db.usuarios.slice(0, 2).map(function (u) { return '<option value="' + u.id + '"' + (u.id === l.dono ? ' selected' : '') + '>' + u.nome + '</option>'; }).join('') + '</select></dd></dl></div></div>' +
      (l.troca ? '<div class="oferta mb"><div><b>Avaliação de troca:</b> ' + esc(l.troca.modelo) + ' ' + l.troca.gb + ' GB · estado ' + l.troca.estado + ' · bateria ' + l.troca.bateria + '</div><div>Valor estimado no site: <b>' + R0(l.troca.valor) + '</b> (confirmar na loja)</div></div>' : '') +
      '<div class="card mb"><h2>Etapa e próxima ação</h2><div class="form" style="margin-top:.6rem"><div><label>Etapa</label><select id="l-etapa">' + ETAPAS.map(function (e) { return '<option value="' + e[0] + '"' + (e[0] === l.status ? ' selected' : '') + '>' + e[1] + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Quando</label><input type="date" id="l-quando" value="' + (l.proximaAcao ? l.proximaAcao.data.slice(0, 10) : '') + '"></div><div class="inteiro"><label>Próxima ação</label><input id="l-acao" value="' + esc(l.proximaAcao ? l.proximaAcao.desc : '') + '" placeholder="Ex.: mandar vídeo do aparelho"></div>' +
      '<div class="inteiro"><button class="btn btn-pri" id="l-salvar">Salvar</button></div></div></div>' +
      '<div class="card"><h2>Notas e histórico</h2><div class="form" style="grid-template-columns:1fr auto;margin:.6rem 0 1rem"><input id="l-nota" placeholder="Escreva uma nota…"><button class="btn btn-sec" id="l-add">Adicionar</button></div><div class="tempo">' +
      ((l.notas || []).map(function (n) { return '<div>' + esc(n.txt) + '<small>' + CRM.data(n.data, true) + ' · ' + CRM.usuario(n.autor).nome + '</small></div>'; }).join('') + '<div>Lead criado pelo ' + esc(l.origem) + '<small>' + CRM.data(l.criado, true) + '</small></div>') + '</div></div>';
    var g = CRM.gaveta(esc(l.nome), ROT[l.interesse] + ' · ' + l.status, corpo);
    $('#l-salvar', g).onclick = function () {
      var et = $('#l-etapa', g).value; l.dono = $('#l-dono', g).value;
      l.proximaAcao = $('#l-acao', g).value ? { data: new Date(($('#l-quando', g).value || new Date().toISOString().slice(0, 10)) + 'T12:00').toISOString(), desc: $('#l-acao', g).value } : null;
      CRM.salvar(); if (et !== l.status) moverLead(l.id, et); CRM.toast('Lead atualizado'); CRM.recarregar(); CRM.abrir.lead(l.id);
    };
    $('#l-add', g).onclick = function () { var t = $('#l-nota', g).value.trim(); if (!t) return; l.notas = l.notas || []; l.notas.unshift({ data: new Date().toISOString(), txt: t, autor: CRM.eu().id }); CRM.salvar(); CRM.abrir.lead(l.id); };
    var vc = $('[data-ver-cli]', g); if (vc) vc.onclick = function () { CRM.abrir.cliente(l.clienteId); };
    var vr = $('[data-virar]', g); if (vr) vr.onclick = function () { var c = virarCliente(l); CRM.salvar(); CRM.abrir.cliente(c.id); };
  };
  CRM.novo.lead = function () {
    var g = CRM.gaveta('Novo lead', 'Contato do balcão, telefone ou Direct', '<div class="form"><div class="inteiro"><label>Nome</label><input id="n-nome"></div><div><label>WhatsApp</label><input id="n-whats" inputmode="tel"></div><div><label>Origem</label><select id="n-origem"><option>Passou na loja</option><option>Instagram</option><option>Indicação</option><option>Google</option><option>Telefone</option></select></div>' +
      '<div><label>Interesse</label><select id="n-int"><option value="comprar">Comprar iPhone</option><option value="troca">Troca</option><option value="conserto">Conserto</option><option value="acessorios">Acessórios</option></select></div><div><label>Aparelho atual</label><input id="n-atual" list="dl-mod"></div>' +
      '<div><label>Quer levar</label><input id="n-quer" list="dl-mod"></div><div><label>Prazo</label><select id="n-prazo"><option value="semana">Esta semana</option><option value="mes">Este mês</option><option value="pesquisando">Pesquisando</option></select></div>' +
      '<div><label>Pagamento</label><select id="n-pag"><option value="pix">Pix</option><option value="cartao">Cartão</option><option value="troca">Troca</option></select></div><div class="inteiro"><button class="btn btn-pri" id="n-salvar">Criar lead</button></div></div><datalist id="dl-mod">' + Object.keys(C.troca).concat(['Android']).map(function (m) { return '<option>' + m + '</option>'; }).join('') + '</datalist>');
    $('#n-salvar', g).onclick = function () {
      if (!$('#n-nome', g).value.trim()) return CRM.toast('Escreva o nome');
      var l = HSDB.novoLead({ nome: $('#n-nome', g).value.trim(), whats: $('#n-whats', g).value, origem: $('#n-origem', g).value, interesse: $('#n-int', g).value, modelo_atual: $('#n-atual', g).value, modelo_desejado: $('#n-quer', g).value, prazo: $('#n-prazo', g).value, pagamento: $('#n-pag', g).value, dono: CRM.eu().id });
      CRM.db = HSDB.ler(); CRM.contadores(); CRM.ir('leads'); CRM.abrir.lead(l.id);
    };
  };

  /* ================= CLIENTES ================= */
  var fCli = { seg: '', q: '', modelo: '', optin: false };
  CRM.telas.clientes = function (el) {
    var db = CRM.db, resumos = {}; db.clientes.forEach(function (c) { resumos[c.id] = CRM.resumoCliente(c); });
    var cont = {}; db.clientes.forEach(function (c) { cont[resumos[c.id].segmento] = (cont[resumos[c.id].segmento] || 0) + 1; });
    var mods = {}; db.clientes.forEach(function (c) { var m = CRM.apAtual(c).modelo; mods[m] = (mods[m] || 0) + 1; });
    var q = fCli.q.toLowerCase(), d = HSDB.soDigitos(fCli.q);
    var ls = db.clientes.filter(function (c) {
      var r = resumos[c.id];
      if (fCli.seg && r.segmento !== fCli.seg) return false;
      if (fCli.modelo && CRM.apAtual(c).modelo !== fCli.modelo) return false;
      if (fCli.optin && !(c.optin || {}).whats) return false;
      if (q && c.nome.toLowerCase().indexOf(q) < 0 && !(d.length >= 4 && (c.whats.indexOf(d) >= 0 || c.aparelhos.some(function (a) { return (a.imei || '').indexOf(d) >= 0; })))) return false;
      return true;
    }).sort(function (a, b) { return resumos[b.id].gasto - resumos[a.id].gasto; });
    CRM._clientesFiltrados = ls;
    el.innerHTML = '<div class="cab"><div><h1>Clientes</h1><p>Cada cliente com os aparelhos, o histórico e o segmento calculado pela recência, frequência e valor das compras.</p></div><div class="acoes"><button class="btn btn-sec" id="exp-cli">Exportar para a Meta (.csv)</button><button class="btn btn-pri" data-novo-cli>+ Novo cliente</button></div></div>' +
      '<div class="filtros">' + [''].concat(Object.keys(CRM.SEG)).map(function (s) { return '<button class="chip" data-seg="' + s + '" aria-pressed="' + (fCli.seg === s) + '">' + (s || 'Todos') + '<span class="n">' + (s ? cont[s] || 0 : db.clientes.length) + '</span></button>'; }).join('') + '</div>' +
      '<div class="filtros"><input class="busca" id="busca-cli" placeholder="Nome, telefone ou IMEI" value="' + esc(fCli.q) + '"><select class="sel" id="f-mod"><option value="">Todos os aparelhos</option>' + Object.keys(mods).sort().map(function (m) { return '<option' + (fCli.modelo === m ? ' selected' : '') + ' value="' + m + '">' + m + ' (' + mods[m] + ')</option>'; }).join('') + '</select>' +
      '<label style="display:flex;align-items:center;gap:.4rem;font-size:.85rem;font-weight:600"><input type="checkbox" id="f-optin"' + (fCli.optin ? ' checked' : '') + '> Só quem aceita WhatsApp (LGPD)</label><span style="margin-left:auto;color:var(--cinza);font-size:.85rem">' + ls.length + ' clientes</span></div>' +
      '<div class="tabela-wrap"><table><thead><tr><th>Cliente</th><th>Aparelho atual</th><th>Segmento</th><th class="num">Gasto total</th><th class="num">Interações</th><th>Última visita</th><th>Origem</th></tr></thead><tbody>' +
      ls.slice(0, 120).map(function (c) {
        var r = resumos[c.id], a = CRM.apAtual(c);
        return '<tr class="click" data-cli="' + c.id + '"><td><strong>' + esc(c.nome) + '</strong>' + (c.optin && !c.optin.whats ? ' <span class="selo s-cinza" title="Não aceita mensagens">sem opt-in</span>' : '') + '<span class="sub-td">' + CRM.fone(c.whats) + ' · ' + esc(c.bairro || '') + '</span></td><td><span class="ap">' + esc(a.modelo) + '</span><span class="sub-td">há ' + CRM.quando(a.desde).replace('há ', '') + '</span></td><td><span class="selo ' + CRM.SEG[r.segmento] + '">' + r.segmento + '</span></td><td class="num"><b>' + R0(r.gasto) + '</b></td><td class="num">' + r.interacoes + '</td><td>' + CRM.quando(r.ultima) + '</td><td>' + esc(c.origem) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    el.onclick = function (e) {
      var s = e.target.closest('[data-seg]'); if (s) { fCli.seg = s.dataset.seg; return CRM.telas.clientes(el); }
      if (e.target.closest('[data-novo-cli]')) return CRM.novo.cliente();
      var tr = e.target.closest('[data-cli]'); if (tr) CRM.abrir.cliente(tr.dataset.cli);
    };
    var t; $('#busca-cli').oninput = function () { var v = this.value; clearTimeout(t); t = setTimeout(function () { fCli.q = v; CRM.telas.clientes(el); var b = $('#busca-cli'); b.focus(); b.setSelectionRange(v.length, v.length); }, 250); };
    $('#f-mod').onchange = function () { fCli.modelo = this.value; CRM.telas.clientes(el); };
    $('#f-optin').onchange = function () { fCli.optin = this.checked; CRM.telas.clientes(el); };
    $('#exp-cli').onclick = function () { CRM.csvMeta('hs-clientes.csv', ls.filter(function (c) { return !c.optin || c.optin.whats; })); };
  };
  CRM.csvMeta = function (nome, lista) {
    var csv = 'phone,email,fn,ln,ct,st,country\n' + lista.map(function (c) { var p = String(c.nome || '').split(' '); return [HSDB.soDigitos(c.whats), c.email || '', p[0], p.slice(1).join(' '), 'salvador', 'ba', 'br'].join(','); }).join('\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = nome; a.click();
    CRM.toast(lista.length + ' contatos exportados (só quem aceitou mensagens)');
  };
  CRM.abrir.cliente = function (id, aba) {
    var c = CRM.cli(id); if (!c) return; var r = CRM.resumoCliente(c), a = CRM.apAtual(c); aba = aba || 'resumo';
    var indicou = CRM.db.clientes.filter(function (x) { return x.indicadoPor === c.id; });
    var linha = r.vendas.map(function (v) { return { data: v.data, t: 'Compra #' + v.num + ' · ' + R(CRM.totalVenda(v)), d: v.itens.map(function (i) { return i.desc; }).join(', ') + ' · ' + PAG[v.pagamento] }; })
      .concat(r.os.map(function (o) { return { data: o.entrada, t: 'OS ' + o.num + ' · ' + o.defeito, d: o.modelo + ' · ' + o.status + ' · ' + R(o.valor), os: o.id }; })).sort(function (x, y) { return x.data < y.data ? 1 : -1; });
    var abas = [['resumo', 'Resumo'], ['aparelhos', 'Aparelhos (' + c.aparelhos.length + ')'], ['historico', 'Histórico (' + linha.length + ')'], ['dados', 'Dados e LGPD']];
    var corpo = '<div class="cabeca-cli"><span class="av">' + CRM.iniciais(c.nome) + '</span><div><span class="selo ' + CRM.SEG[r.segmento] + '">' + r.segmento + '</span> ' + (c.tags || []).map(function (t) { return '<span class="selo s-ouro">' + esc(t) + '</span>'; }).join(' ') + '<div style="color:var(--cinza);font-size:.85rem;margin-top:.2rem">' + CRM.fone(c.whats) + ' · cliente ' + CRM.quando(c.criado) + '</div></div></div>' +
      '<div class="numeros-cli"><div><small>Gasto total (LTV)</small><b>' + R0(r.gasto) + '</b></div><div><small>Compras</small><b>' + r.vendas.length + '</b></div><div><small>Consertos</small><b>' + r.os.length + '</b></div><div><small>Ticket médio</small><b>' + R0(r.ticket) + '</b></div></div>' +
      '<div class="filtros">' + CRM.wa(c.whats, 'Oi, ' + CRM.primeiro(c.nome) + '! Aqui é da HS.', 'WhatsApp', '') + '<button class="btn btn-sec" data-acao="os">+ Ordem de serviço</button><button class="btn btn-sec" data-acao="venda">+ Venda</button></div>' +
      '<div class="abas">' + abas.map(function (x) { return '<button class="aba" data-aba="' + x[0] + '" aria-selected="' + (aba === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>';
    if (aba === 'resumo') {
      var of = CRM.ofertas(c);
      corpo += (of.length ? '<div class="oferta mb"><div style="font-weight:800">O que oferecer agora</div>' + of.map(function (x) { return '<div>' + x + '</div>'; }).join('') + '</div>' : '') +
        '<div class="card mb"><h2>Aparelho atual</h2><p class="sub">' + esc(a.modelo) + (a.gb ? ' · ' + a.gb + ' GB' : '') + (a.cor ? ' · ' + a.cor : '') + ' · desde ' + CRM.data(a.desde) + (a.compradoNaHS ? ' · <b>comprado na HS</b>' : '') + '</p></div>' +
        '<div class="card"><h2>Últimas interações</h2><div class="tempo" style="margin-top:.6rem">' + (linha.slice(0, 4).map(function (x) { return '<div><b>' + x.t + '</b><small>' + CRM.data(x.data) + ' · ' + esc(x.d) + '</small></div>'; }).join('') || '<div>Sem registros ainda.</div>') + '</div></div>';
    }
    if (aba === 'aparelhos') {
      corpo += c.aparelhos.map(function (x) {
        var gar = x.compradoNaHS ? HSDB.addDias(x.desde, 30 * C.garantiaSeminovoMeses) : null;
        return '<div class="card mb"><h2>' + esc(x.modelo) + ' ' + (x.atual ? '<span class="selo s-ouro">atual</span>' : '<span class="selo s-cinza">antigo</span>') + (x.atual ? '' : '<button class="btn btn-sec btn-p acao" data-atual="' + x.id + '" style="margin-left:auto">Tornar atual</button>') + '</h2>' +
          '<dl class="dados" style="margin-top:.5rem"><dt>Armazenamento</dt><dd>' + (x.gb ? x.gb + ' GB' : '—') + '</dd><dt>Cor</dt><dd>' + (esc(x.cor) || '—') + '</dd><dt>IMEI</dt><dd>' + (x.imei || '—') + '</dd><dt>Desde</dt><dd>' + CRM.data(x.desde) + ' (' + CRM.quando(x.desde) + ')</dd><dt>Comprado na HS</dt><dd>' + (x.compradoNaHS ? 'Sim' : 'Não') + '</dd>' +
          (gar ? '<dt>Garantia HS</dt><dd>' + (new Date(gar) > HOJE ? '<span class="selo s-verde">ativa até ' + CRM.data(gar) + '</span>' : 'encerrada em ' + CRM.data(gar)) + '</dd>' : '') + '</dl></div>';
      }).join('') +
        '<div class="card"><h2>Adicionar aparelho</h2><div class="form" style="margin-top:.6rem"><div class="inteiro"><label>Modelo</label><input id="ap-mod" list="dl-ap"></div><div><label>GB</label><select id="ap-gb"><option>64</option><option selected>128</option><option>256</option><option>512</option></select></div><div><label>Cor</label><input id="ap-cor"></div><div class="inteiro"><label>IMEI</label><input id="ap-imei" inputmode="numeric" maxlength="15"></div><div class="inteiro"><button class="btn btn-pri" id="ap-salvar">Salvar como aparelho atual</button></div></div><datalist id="dl-ap">' + Object.keys(C.troca).concat(['Android']).map(function (m) { return '<option>' + m + '</option>'; }).join('') + '</datalist></div>';
    }
    if (aba === 'historico') corpo += '<div class="card"><div class="tempo">' + (linha.map(function (x) { return '<div' + (x.os ? ' data-os="' + x.os + '" style="cursor:pointer"' : '') + '><b>' + x.t + '</b><small>' + CRM.data(x.data, true) + ' · ' + esc(x.d) + '</small></div>'; }).join('') || '<div>Sem registros.</div>') + '</div></div>';
    if (aba === 'dados') {
      var ind = c.indicadoPor ? CRM.cli(c.indicadoPor) : null;
      corpo += '<div class="card mb"><h2>Cadastro</h2><div class="form" style="margin-top:.6rem"><div class="inteiro"><label>Nome</label><input id="d-nome" value="' + esc(c.nome) + '"></div><div><label>WhatsApp</label><input id="d-whats" value="' + CRM.fone(c.whats) + '"></div><div><label>E-mail</label><input id="d-email" value="' + esc(c.email) + '"></div><div><label>Aniversário</label><input type="date" id="d-nasc" value="' + (c.nasc || '') + '"></div><div><label>Bairro</label><input id="d-bairro" value="' + esc(c.bairro || '') + '"></div>' +
        '<div class="inteiro"><label>Etiquetas (separe por vírgula)</label><input id="d-tags" value="' + esc((c.tags || []).join(', ')) + '"></div><div class="inteiro"><label>Observações</label><textarea id="d-obs">' + esc(c.obs || '') + '</textarea></div><div class="inteiro"><button class="btn btn-pri" id="d-salvar">Salvar</button></div></div></div>' +
        '<div class="card mb"><h2>Consentimento (LGPD)</h2><p class="sub">Registre o que o cliente aceitou. Quem não aceitou fica fora das campanhas e da exportação.</p><div class="checks"><label><input type="checkbox" id="o-w"' + ((c.optin || {}).whats ? ' checked' : '') + '> Mensagens no WhatsApp</label><label><input type="checkbox" id="o-e"' + ((c.optin || {}).email ? ' checked' : '') + '> E-mail</label></div></div>' +
        '<div class="card"><h2>Indicações</h2><dl class="dados" style="margin-top:.5rem"><dt>Indicado por</dt><dd>' + (ind ? '<a href="#" data-cli-link="' + ind.id + '" style="text-decoration:underline">' + esc(ind.nome) + '</a>' : '—') + '</dd><dt>Indicou</dt><dd>' + (indicou.length ? indicou.map(function (x) { return '<a href="#" data-cli-link="' + x.id + '" style="text-decoration:underline">' + esc(x.nome) + '</a>'; }).join(', ') : 'ninguém ainda') + '</dd></dl></div>';
    }
    var g = CRM.gaveta(esc(c.nome), esc(a.modelo) + ' · ' + r.segmento, corpo);
    g.querySelector('.corpo').onclick = function (e) {
      var b = e.target.closest('[data-aba]'); if (b) return CRM.abrir.cliente(id, b.dataset.aba);
      var at = e.target.closest('[data-atual]'); if (at) { c.aparelhos.forEach(function (x) { x.atual = x.id === at.dataset.atual; }); CRM.salvar(); return CRM.abrir.cliente(id, 'aparelhos'); }
      var ac = e.target.closest('[data-acao]'); if (ac) return CRM.novo[ac.dataset.acao](c.id);
      var o = e.target.closest('[data-os]'); if (o) return CRM.abrir.os(o.dataset.os);
      var l = e.target.closest('[data-cli-link]'); if (l) { e.preventDefault(); return CRM.abrir.cliente(l.dataset.cliLink); }
    };
    var s = $('#ap-salvar', g); if (s) s.onclick = function () { if (!$('#ap-mod', g).value) return; c.aparelhos.forEach(function (x) { x.atual = false; }); c.aparelhos.unshift({ id: HSDB.uid('a'), modelo: $('#ap-mod', g).value, gb: +$('#ap-gb', g).value, cor: $('#ap-cor', g).value, imei: $('#ap-imei', g).value, desde: new Date().toISOString(), atual: true, compradoNaHS: false }); CRM.salvar(); CRM.abrir.cliente(id, 'aparelhos'); };
    var ds = $('#d-salvar', g); if (ds) ds.onclick = function () {
      c.nome = $('#d-nome', g).value.trim() || c.nome; var w = HSDB.soDigitos($('#d-whats', g).value); c.whats = w.length <= 11 ? '55' + w : w; c.email = $('#d-email', g).value; c.nasc = $('#d-nasc', g).value; c.bairro = $('#d-bairro', g).value;
      c.tags = $('#d-tags', g).value.split(',').map(function (x) { return x.trim(); }).filter(Boolean); c.obs = $('#d-obs', g).value; c.optin = { whats: $('#o-w', g).checked, email: $('#o-e', g).checked };
      CRM.salvar(); CRM.toast('Cliente salvo'); CRM.recarregar(); CRM.abrir.cliente(id, 'dados');
    };
  };
  CRM.novo.cliente = function () {
    var g = CRM.gaveta('Novo cliente', '', '<div class="form"><div class="inteiro"><label>Nome</label><input id="nc-nome"></div><div><label>WhatsApp</label><input id="nc-w" inputmode="tel"></div><div><label>Aniversário</label><input type="date" id="nc-nasc"></div><div><label>Aparelho atual</label><input id="nc-mod" list="dl-nc"></div><div><label>Origem</label><select id="nc-or"><option>Passou na loja</option><option>Instagram</option><option>Indicação</option><option>Google</option><option>Anúncio Meta</option></select></div>' +
      '<div class="inteiro checks"><label><input type="checkbox" id="nc-opt" checked> Aceita receber mensagens no WhatsApp</label></div><div class="inteiro"><button class="btn btn-pri" id="nc-ok">Salvar cliente</button></div></div><datalist id="dl-nc">' + Object.keys(C.troca).concat(['Android']).map(function (m) { return '<option>' + m + '</option>'; }).join('') + '</datalist>');
    $('#nc-ok', g).onclick = function () {
      var nome = $('#nc-nome', g).value.trim(); if (!nome) return CRM.toast('Escreva o nome');
      var w = HSDB.soDigitos($('#nc-w', g).value); if (w.length <= 11) w = '55' + w;
      var c = { id: 'c' + Date.now(), nome: nome, whats: w, email: '', nasc: $('#nc-nasc', g).value, bairro: '', origem: $('#nc-or', g).value, criado: new Date().toISOString(), tags: [], optin: { whats: $('#nc-opt', g).checked, email: false }, obs: '',
        aparelhos: $('#nc-mod', g).value ? [{ id: HSDB.uid('a'), modelo: $('#nc-mod', g).value, gb: 128, cor: '', imei: '', desde: new Date().toISOString(), atual: true }] : [] };
      CRM.db.clientes.unshift(c); CRM.salvar(); CRM.abrir.cliente(c.id);
    };
  };

  /* ================= VENDAS ================= */
  var fVendas = 30;
  CRM.telas.vendas = function (el) {
    var db = CRM.db;
    var ls = db.vendas.filter(function (v) { return CRM.dias(v.data) < fVendas; }).sort(function (a, b) { return a.data < b.data ? 1 : -1; });
    var tot = ls.reduce(function (s, v) { return s + CRM.totalVenda(v); }, 0), custo = ls.reduce(function (s, v) { return s + CRM.custoVenda(v); }, 0);
    var porPag = {}; ls.forEach(function (v) { porPag[v.pagamento] = (porPag[v.pagamento] || 0) + CRM.totalVenda(v); });
    var porTipo = { aparelho: 0, acessorio: 0 }; ls.forEach(function (v) { v.itens.forEach(function (i) { porTipo[i.tipo] = (porTipo[i.tipo] || 0) + i.valor; }); });
    el.innerHTML = '<div class="cab"><div><h1>Vendas</h1><p>Aparelhos e acessórios. Os consertos ficam na Assistência.</p></div><div class="acoes"><button class="btn btn-pri" data-nova-venda>+ Nova venda</button></div></div>' +
      '<div class="filtros">' + [7, 30, 90].map(function (n) { return '<button class="chip" data-per="' + n + '" aria-pressed="' + (fVendas === n) + '">Últimos ' + n + ' dias</button>'; }).join('') + '</div>' +
      '<div class="grade g4 mb"><div class="kpi"><span>Faturamento</span><strong>' + CRM.Rk(tot) + '</strong><small>' + ls.length + ' vendas</small></div><div class="kpi"><span>Ticket médio</span><strong>' + R0(ls.length ? tot / ls.length : 0) + '</strong></div>' +
      '<div class="kpi"><span>Margem bruta</span><strong>' + CRM.pct(tot ? 1 - custo / tot : 0) + '</strong><small>' + CRM.Rk(tot - custo) + '</small></div><div class="kpi"><span>iPhones vendidos</span><strong>' + ls.reduce(function (s, v) { return s + v.itens.filter(function (i) { return i.tipo === 'aparelho'; }).length; }, 0) + '</strong><small>' + CRM.Rk(porTipo.aparelho) + ' em aparelhos</small></div></div>' +
      '<div class="col-2-1 mb"><div class="tabela-wrap"><table><thead><tr><th>#</th><th>Data</th><th>Cliente</th><th>Itens</th><th>Pagamento</th><th class="num">Total</th><th class="num">Margem</th></tr></thead><tbody>' +
      ls.slice(0, 80).map(function (v) { var c = CRM.cli(v.clienteId) || { nome: 'Balcão' }, t = CRM.totalVenda(v); return '<tr class="click" data-cli="' + v.clienteId + '"><td>' + v.num + '</td><td>' + CRM.data(v.data, true) + '</td><td>' + esc(c.nome) + '</td><td>' + v.itens.map(function (i) { return esc(i.desc) + (i.qtd > 1 ? ' ×' + i.qtd : ''); }).join('<br>') + '</td><td>' + PAG[v.pagamento] + (v.parcelas > 1 ? ' ' + v.parcelas + 'x' : '') + (v.trocaValor ? '<span class="sub-td">entrada ' + R0(v.trocaValor) + '</span>' : '') + '</td><td class="num"><b>' + R(t) + '</b></td><td class="num">' + CRM.pct(t ? 1 - CRM.custoVenda(v) / t : 0) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div><div class="card mb"><h2>Por forma de pagamento</h2><p class="sub">Período selecionado</p>' + CRM.barrasH(Object.keys(porPag).map(function (k) { return [PAG[k], porPag[k]]; }).sort(function (a, b) { return b[1] - a[1]; }), CRM.Rk) + '</div>' +
      '<div class="card"><h2>Por categoria</h2><p class="sub">Aparelhos × acessórios</p>' + CRM.barrasH([['Aparelhos', porTipo.aparelho], ['Acessórios', porTipo.acessorio]], CRM.Rk) + '</div></div></div>';
    el.onclick = function (e) {
      var p = e.target.closest('[data-per]'); if (p) { fVendas = +p.dataset.per; return CRM.telas.vendas(el); }
      if (e.target.closest('[data-nova-venda]')) return CRM.novo.venda();
      var tr = e.target.closest('[data-cli]'); if (tr && CRM.cli(tr.dataset.cli)) CRM.abrir.cliente(tr.dataset.cli, 'historico');
    };
  };
  CRM.novo.venda = function (clienteId) {
    var db = CRM.db, itens = [];
    var disp = db.estoque.aparelhos.filter(function (x) { return x.status !== 'vendido'; });
    var g = CRM.gaveta('Nova venda', 'Caixa rápido', '<div class="form"><div class="inteiro"><label>Cliente</label><select id="v-cli"><option value="">Venda de balcão (sem cadastro)</option>' + db.clientes.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome); }).map(function (c) { return '<option value="' + c.id + '"' + (c.id === clienteId ? ' selected' : '') + '>' + esc(c.nome) + ' · ' + CRM.fone(c.whats) + '</option>'; }).join('') + '</select></div>' +
      '<div class="inteiro"><label>Adicionar seminovo do estoque</label><select id="v-ap"><option value="">—</option>' + disp.map(function (x) { return '<option value="' + x.id + '">' + x.modelo + ' ' + x.gb + ' GB ' + x.cor + ' · ' + R0(x.preco - C.desconto) + (x.status === 'reservado' ? ' (reservado)' : '') + '</option>'; }).join('') + '</select></div>' +
      '<div class="inteiro"><label>Adicionar acessório</label><select id="v-ac"><option value="">—</option>' + C.acessorios.map(function (a, i) { return '<option value="' + i + '">' + a.nome + ' · ' + R(a.preco) + '</option>'; }).join('') + '</select></div>' +
      '<div class="inteiro"><div class="tabela-wrap"><table><tbody id="v-itens"></tbody></table></div></div>' +
      '<div><label>Pagamento</label><select id="v-pag"><option value="pix">Pix</option><option value="cartao">Cartão</option><option value="dinheiro">Dinheiro</option><option value="troca">Troca + diferença</option></select></div><div><label>Parcelas</label><select id="v-parc">' + [1, 2, 3, 6, 10, 12].map(function (n) { return '<option>' + n + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Aparelho recebido na troca</label><input id="v-tm" list="dl-v" placeholder="Opcional"></div><div><label>Valor da entrada (R$)</label><input id="v-tv" inputmode="decimal" placeholder="0"></div>' +
      '<div class="inteiro"><div class="oferta" id="v-total"></div></div><div class="inteiro"><button class="btn btn-pri" id="v-ok">Registrar venda</button></div></div><datalist id="dl-v">' + Object.keys(C.troca).map(function (m) { return '<option>' + m + '</option>'; }).join('') + '</datalist>');
    function desenhar() {
      $('#v-itens', g).innerHTML = itens.map(function (i, k) { return '<tr><td>' + esc(i.desc) + '</td><td class="num">' + R(i.valor) + '</td><td style="width:40px"><button class="btn btn-sec btn-p" data-rm="' + k + '">×</button></td></tr>'; }).join('') || '<tr><td class="vazio">Nenhum item ainda.</td></tr>';
      var t = itens.reduce(function (s, i) { return s + i.valor; }, 0), tv = parseFloat(($('#v-tv', g).value || '0').replace(/\./g, '').replace(',', '.')) || 0;
      $('#v-total', g).innerHTML = '<div>Total dos itens: <b>' + R(t) + '</b></div>' + (tv ? '<div>Entrada do aparelho: <b>− ' + R(tv) + '</b></div>' : '') + '<div style="font-size:1.05rem">A receber: <b>' + R(Math.max(0, t - tv)) + '</b></div>';
    }
    $('#v-ap', g).onchange = function () { var x = disp.filter(function (a) { return a.id === this.value; }, this)[0]; if (!x) return; itens.push({ tipo: 'aparelho', desc: x.modelo + ' ' + x.gb + ' GB seminovo', qtd: 1, valor: x.preco - C.desconto, custo: x.custo, estoqueId: x.id }); this.value = ''; desenhar(); };
    $('#v-ac', g).onchange = function () { var a = C.acessorios[this.value]; if (!a) return; itens.push({ tipo: 'acessorio', desc: a.nome, qtd: 1, valor: a.preco, custo: Math.round(a.preco * 0.42) }); this.value = ''; desenhar(); };
    $('#v-tv', g).oninput = desenhar;
    $('#v-itens', g).onclick = function (e) { var b = e.target.closest('[data-rm]'); if (b) { itens.splice(+b.dataset.rm, 1); desenhar(); } };
    $('#v-ok', g).onclick = function () {
      if (!itens.length) return CRM.toast('Adicione pelo menos um item');
      var cid = $('#v-cli', g).value, tv = parseFloat(($('#v-tv', g).value || '0').replace(/\./g, '').replace(',', '.')) || 0;
      var v = { id: HSDB.uid('v'), num: Math.max.apply(null, db.vendas.map(function (x) { return x.num; })) + 1, data: new Date().toISOString(), clienteId: cid || null, itens: itens, pagamento: $('#v-pag', g).value, parcelas: +$('#v-parc', g).value, vendedor: CRM.eu().id, trocaValor: tv || undefined };
      db.vendas.push(v);
      itens.forEach(function (i) { if (i.estoqueId) { var x = db.estoque.aparelhos.filter(function (a) { return a.id === i.estoqueId; })[0]; x.status = 'vendido'; x.vendidoEm = v.data;
        var c = CRM.cli(cid); if (c) { c.aparelhos.forEach(function (a) { a.atual = false; }); c.aparelhos.unshift({ id: HSDB.uid('a'), modelo: x.modelo, gb: x.gb, cor: x.cor, imei: x.imei, desde: v.data, atual: true, compradoNaHS: true }); } } });
      var tm = $('#v-tm', g).value; if (tm) db.estoque.aparelhos.push({ id: HSDB.uid('e'), modelo: tm, gb: 128, cor: '—', imei: '', condicao: 'muito-bom', bateria: null, preco: 0, custo: tv, entrada: v.data, status: 'em revisão', origem: 'troca' });
      CRM.salvar(); CRM.toast('Venda #' + v.num + ' registrada'); CRM.ir('vendas');
    };
    desenhar();
  };
})();
