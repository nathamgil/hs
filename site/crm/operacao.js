/* =====================================================================
   CRM HS — Assistência (ordens de serviço) e Estoque (seminovos, peças,
   avaliação de troca)
   ===================================================================== */
(function () {
  var C = HS, $ = CRM.$, $$ = CRM.$$, esc = CRM.esc, R = CRM.R, R0 = CRM.R0, HOJE = CRM.HOJE;
  var ST = [['recebido', 'Recebido'], ['diagnóstico', 'Diagnóstico'], ['aguardando aprovação', 'Aguardando aprovação'], ['aguardando peça', 'Aguardando peça'], ['em reparo', 'Em reparo'], ['pronto', 'Pronto'], ['entregue', 'Entregue']];
  var CHECK = [['tela', 'Tela e toque'], ['faceid', 'Face ID'], ['cameras', 'Câmeras'], ['botoes', 'Botões'], ['audio', 'Áudio'], ['carga', 'Carga'], ['wifi', 'Wi-Fi e sinal']];
  var SERV = {}; C.servicos.forEach(function (s) { SERV[s.id] = s.nome; });
  function atrasada(o) { return o.status !== 'entregue' && o.status !== 'pronto' && new Date(o.prevista) < HOJE; }
  function msgPronto(c, o) { return 'Oi, ' + CRM.primeiro(c.nome) + '! Aqui é da HS. Seu ' + o.modelo + ' (OS ' + o.num + ') está pronto ✅ Valor: ' + R(o.valor) + '. Pode retirar na Galeria Tenaz, seg a sex 9h–18h e sáb 9h–13h. Garantia de 90 dias.'; }
  function msgOrc(c, o) { return 'Oi, ' + CRM.primeiro(c.nome) + '! Aqui é da HS. Diagnóstico do seu ' + o.modelo + ' (OS ' + o.num + '): ' + o.defeito.toLowerCase() + '. Serviço: ' + (SERV[o.servico] || o.servico) + ', valor ' + R(o.valor) + ', pronto até ' + CRM.data(o.prevista) + '. Posso seguir?'; }

  /* ================= ASSISTÊNCIA ================= */
  var modoOS = 'quadro';
  CRM.telas.assistencia = function (el) {
    var db = CRM.db, abertas = db.os.filter(function (o) { return o.status !== 'entregue'; });
    var mes = db.os.filter(function (o) { return o.status === 'entregue' && CRM.noMes(o.entregue); });
    var fat = mes.reduce(function (s, o) { return s + o.valor; }, 0), custo = mes.reduce(function (s, o) { return s + (o.custoPecas || 0); }, 0);
    var ent = db.os.filter(function (o) { return o.entregue; });
    var tm = ent.length ? ent.reduce(function (s, o) { return s + (new Date(o.entregue) - new Date(o.entrada)) / 864e5; }, 0) / ent.length : 0;
    var porServ = {}; db.os.filter(function (o) { return CRM.dias(o.entrada) < 90; }).forEach(function (o) { var n = SERV[o.servico] || o.servico; porServ[n] = (porServ[n] || 0) + 1; });
    el.innerHTML = '<div class="cab"><div><h1>Assistência</h1><p>Ordens de serviço da bancada. Arraste entre as etapas; o cliente acompanha pelo site com o número da OS.</p></div><div class="acoes"><button class="btn btn-sec" data-modo>' + (modoOS === 'quadro' ? 'Ver em lista' : 'Ver em quadro') + '</button><button class="btn btn-pri" data-nova-os>+ Nova OS</button></div></div>' +
      '<div class="grade g4 mb"><div class="kpi"><span>Na bancada</span><strong>' + abertas.length + '</strong><small>' + abertas.filter(function (o) { return o.status === 'pronto'; }).length + ' prontos para retirar</small></div>' +
      '<div class="kpi"><span>Atrasadas</span><strong style="color:' + (abertas.filter(atrasada).length ? 'var(--vermelho)' : 'inherit') + '">' + abertas.filter(atrasada).length + '</strong><small>passaram do prazo prometido</small></div>' +
      '<div class="kpi"><span>Serviços no mês</span><strong>' + CRM.Rk(fat) + '</strong><small>' + mes.length + ' entregues · margem ' + CRM.pct(fat ? 1 - custo / fat : 0) + '</small></div>' +
      '<div class="kpi"><span>Tempo médio de reparo</span><strong>' + tm.toFixed(1).replace('.', ',') + ' dias</strong><small>da entrada à entrega</small></div></div>';
    if (modoOS === 'quadro') {
      el.innerHTML += '<div class="quadro" id="q-os">' + ST.map(function (s) {
        var g = db.os.filter(function (o) { return o.status === s[0]; }).sort(function (a, b) { return b.num - a.num; }); if (s[0] === 'entregue') g = g.slice(0, 8);
        return '<section class="coluna" data-st="' + s[0] + '"><header><b>' + s[1] + ' · ' + g.length + '</b></header>' + g.map(function (o) {
          var c = CRM.cli(o.clienteId) || { nome: '—' };
          return '<article class="cartao-k" draggable="true" data-id="' + o.id + '"><strong>OS ' + o.num + ' · ' + esc(o.modelo) + '</strong><div class="meta-k">' + esc(c.nome) + '<br>' + esc(o.defeito) + '</div><div class="pe-k">' + (atrasada(o) ? '<span class="selo s-vermelho">atrasada</span>' : o.status !== 'entregue' ? '<span class="selo s-cinza">até ' + CRM.data(o.prevista) + '</span>' : '<span class="selo s-verde">garantia</span>') + '<span class="val">' + R0(o.valor) + '</span></div></article>';
        }).join('') + '</section>';
      }).join('') + '</div>';
    } else {
      el.innerHTML += '<div class="tabela-wrap"><table><thead><tr><th>OS</th><th>Entrada</th><th>Cliente</th><th>Aparelho</th><th>Defeito</th><th>Status</th><th>Prazo</th><th class="num">Valor</th><th class="num">Margem</th></tr></thead><tbody>' +
        db.os.slice().sort(function (a, b) { return b.num - a.num; }).slice(0, 100).map(function (o) { var c = CRM.cli(o.clienteId) || { nome: '—' }; return '<tr class="click" data-os="' + o.id + '"><td><b>' + o.num + '</b></td><td>' + CRM.data(o.entrada) + '</td><td>' + esc(c.nome) + '</td><td>' + esc(o.modelo) + '</td><td>' + esc(o.defeito) + '</td><td><span class="selo ' + (o.status === 'pronto' ? 's-verde' : o.status === 'entregue' ? 's-cinza' : atrasada(o) ? 's-vermelho' : 's-amarelo') + '">' + o.status + '</span></td><td>' + CRM.data(o.prevista) + '</td><td class="num">' + R(o.valor) + '</td><td class="num">' + CRM.pct(o.valor ? 1 - (o.custoPecas || 0) / o.valor : 0) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    }
    el.innerHTML += '<div class="card" style="margin-top:14px"><h2>Serviços mais feitos</h2><p class="sub">Últimos 90 dias · quantidade de OS</p>' + CRM.barrasH(Object.keys(porServ).map(function (k) { return [k, porServ[k]]; }).sort(function (a, b) { return b[1] - a[1]; })) + '</div>';
    el.onclick = function (e) {
      if (e.target.closest('[data-modo]')) { modoOS = modoOS === 'quadro' ? 'lista' : 'quadro'; return CRM.telas.assistencia(el); }
      if (e.target.closest('[data-nova-os]')) return CRM.novo.os();
      var k = e.target.closest('.cartao-k,[data-os]'); if (k) CRM.abrir.os(k.dataset.id || k.dataset.os);
    };
    $$('#q-os .cartao-k', el).forEach(function (k) { k.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', k.dataset.id); k.classList.add('arrastando'); }); k.addEventListener('dragend', function () { k.classList.remove('arrastando'); }); });
    $$('#q-os .coluna', el).forEach(function (col) {
      col.addEventListener('dragover', function (e) { e.preventDefault(); col.classList.add('alvo'); });
      col.addEventListener('dragleave', function () { col.classList.remove('alvo'); });
      col.addEventListener('drop', function (e) { e.preventDefault(); mudarStatus(e.dataTransfer.getData('text/plain'), col.dataset.st); CRM.telas.assistencia(el); });
    });
  };
  function mudarStatus(id, st, nota) {
    var o = CRM.db.os.filter(function (x) { return x.id === id; })[0]; if (!o || o.status === st) return;
    o.status = st; o.historico.push({ data: new Date().toISOString(), status: st, nota: nota || '' });
    if (st === 'em reparo' || st === 'pronto' || st === 'entregue') o.aprovado = true;
    if (st === 'entregue') { o.entregue = new Date().toISOString(); o.garantiaAte = HSDB.addDias(o.entregue, C.garantiaServicoDias); }
    CRM.salvar(); CRM.toast('OS ' + o.num + ' → ' + st + (st === 'pronto' ? '. Avise o cliente.' : ''));
  }
  CRM.abrir.os = function (id) {
    var o = CRM.db.os.filter(function (x) { return x.id === id; })[0]; if (!o) return;
    var c = CRM.cli(o.clienteId) || { nome: '—', whats: '' }, margem = o.valor ? 1 - (o.custoPecas || 0) / o.valor : 0;
    var corpo = '<div class="filtros">' + (o.status === 'pronto' ? CRM.wa(c.whats, msgPronto(c, o), 'Avisar que está pronto', '') : '') + (o.status === 'aguardando aprovação' || o.status === 'diagnóstico' ? CRM.wa(c.whats, msgOrc(c, o), 'Enviar orçamento', '') : '') +
      '<button class="btn btn-sec" data-termo>Imprimir termo</button><button class="btn btn-sec" data-cli>Ver cliente</button></div>' +
      '<div class="card mb"><h2>Etapa</h2><div class="filtros" style="margin:.6rem 0 0">' + ST.map(function (s) { return '<button class="chip" data-st="' + s[0] + '" aria-pressed="' + (o.status === s[0]) + '">' + s[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="grade g2 mb"><div class="card"><h2>Aparelho</h2><dl class="dados" style="margin-top:.5rem"><dt>Modelo</dt><dd>' + esc(o.modelo) + (o.cor ? ' · ' + esc(o.cor) : '') + '</dd><dt>IMEI</dt><dd>' + (o.imei || '—') + '</dd><dt>Defeito</dt><dd>' + esc(o.defeito) + '</dd><dt>Serviço</dt><dd>' + (SERV[o.servico] || o.servico) + '</dd><dt>Bateria</dt><dd>' + (o.bateriaSaude ? o.bateriaSaude + '%' + (o.bateriaSaude < 80 ? ' <span class="selo s-amarelo">oferecer troca</span>' : '') : '—') + '</dd><dt>Senha</dt><dd>' + (o.senhaInformada ? 'informada pelo cliente' : 'não informada') + '</dd></dl></div>' +
      '<div class="card"><h2>Valores</h2><div class="form" style="margin-top:.5rem"><div><label>Valor do serviço</label><input id="o-valor" value="' + o.valor + '" inputmode="decimal"></div><div><label>Custo das peças</label><input id="o-custo" value="' + (o.custoPecas || 0) + '" inputmode="decimal"></div><div><label>Prazo</label><input type="date" id="o-prazo" value="' + o.prevista.slice(0, 10) + '"></div><div><label>Técnico</label><select id="o-tec">' + CRM.db.usuarios.map(function (u) { return '<option value="' + u.id + '"' + (u.id === o.tecnico ? ' selected' : '') + '>' + u.nome + '</option>'; }).join('') + '</select></div>' +
      '<div class="inteiro" style="font-size:.88rem">Margem: <b>' + R(o.valor - (o.custoPecas || 0)) + '</b> (' + CRM.pct(margem) + ') · ' + (o.aprovado ? '<span class="selo s-verde">aprovado pelo cliente</span>' : '<span class="selo s-amarelo">aguardando aprovação</span>') + '</div><div class="inteiro"><button class="btn btn-pri" id="o-salvar">Salvar valores</button></div></div></div></div>' +
      '<div class="card mb"><h2>Checklist de entrada</h2><p class="sub">O que funcionava quando o aparelho chegou. Protege a loja e o cliente.</p><div class="checks">' + CHECK.map(function (k) { return '<label><input type="checkbox" data-ck="' + k[0] + '"' + (o.checklist[k[0]] ? ' checked' : '') + '> ' + k[1] + '</label>'; }).join('') + '</div></div>' +
      (o.garantiaAte ? '<div class="oferta mb"><div><b>Garantia</b> até ' + CRM.data(o.garantiaAte) + (new Date(o.garantiaAte) > HOJE ? ' · ativa' : ' · encerrada') + '</div></div>' : '') +
      '<div class="card"><h2>Histórico</h2><div class="tempo" style="margin-top:.6rem">' + o.historico.slice().reverse().map(function (h) { return '<div><b>' + h.status + '</b>' + (h.nota ? ' · ' + esc(h.nota) : '') + '<small>' + CRM.data(h.data, true) + '</small></div>'; }).join('') + '</div></div>';
    var g = CRM.gaveta('OS ' + o.num + ' · ' + esc(o.modelo), esc(c.nome) + ' · entrou ' + CRM.quando(o.entrada), corpo);
    g.querySelector('.corpo').onclick = function (e) {
      var s = e.target.closest('[data-st]'); if (s) { mudarStatus(o.id, s.dataset.st); CRM.recarregar(); return CRM.abrir.os(o.id); }
      if (e.target.closest('[data-cli]')) return CRM.abrir.cliente(o.clienteId);
      if (e.target.closest('[data-termo]')) return termo(o, c);
    };
    g.querySelector('.corpo').onchange = function (e) { var k = e.target.dataset.ck; if (k) { o.checklist[k] = e.target.checked; CRM.salvar(); } };
    $('#o-salvar', g).onclick = function () {
      o.valor = parseFloat($('#o-valor', g).value.replace(',', '.')) || o.valor; o.custoPecas = parseFloat($('#o-custo', g).value.replace(',', '.')) || 0;
      o.prevista = new Date($('#o-prazo', g).value + 'T18:00').toISOString(); o.tecnico = $('#o-tec', g).value; CRM.salvar(); CRM.toast('OS salva'); CRM.recarregar(); CRM.abrir.os(o.id);
    };
  };
  function termo(o, c) {
    var w = window.open('', '_blank'); if (!w) return CRM.toast('Libere pop-ups para imprimir');
    w.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>OS ' + o.num + '</title><style>body{font:14px/1.5 system-ui,sans-serif;max-width:720px;margin:30px auto;color:#111}h1{font-size:20px;margin:0}table{width:100%;border-collapse:collapse;margin:14px 0}td{border:1px solid #ccc;padding:6px 8px}.ass{margin-top:60px;display:flex;gap:40px}.ass div{flex:1;border-top:1px solid #000;padding-top:4px;text-align:center}small{color:#555}</style></head><body>' +
      '<h1>HS · Assistência e loja Apple</h1><small>' + C.endereco.rua + ' · ' + C.endereco.ref + ' · ' + C.endereco.bairro + ' · ' + C.whats.assistencia.visivel + '</small><h2>Ordem de serviço nº ' + o.num + '</h2>' +
      '<table><tr><td><b>Cliente</b></td><td>' + esc(c.nome) + ' · ' + CRM.fone(c.whats) + '</td></tr><tr><td><b>Aparelho</b></td><td>' + esc(o.modelo) + ' · IMEI ' + (o.imei || '—') + '</td></tr><tr><td><b>Defeito relatado</b></td><td>' + esc(o.defeito) + '</td></tr><tr><td><b>Serviço</b></td><td>' + (SERV[o.servico] || o.servico) + '</td></tr><tr><td><b>Valor</b></td><td>' + R(o.valor) + '</td></tr><tr><td><b>Entrada / prazo</b></td><td>' + CRM.data(o.entrada, true) + ' · até ' + CRM.data(o.prevista) + '</td></tr></table>' +
      '<b>Checklist de entrada</b><table>' + CHECK.map(function (k) { return '<tr><td>' + k[1] + '</td><td>' + (o.checklist[k[0]] ? 'Funcionando' : 'Com defeito / não testado') + '</td></tr>'; }).join('') + '</table>' +
      '<p><small>Garantia de ' + C.garantiaServicoDias + ' dias sobre o serviço executado (CDC, art. 26), não cobrindo queda, líquido ou violação do lacre. Aparelhos não retirados em 90 dias após o aviso estão sujeitos às regras da loja. Acompanhe em hs/assistencia/acompanhar com o número desta OS.</small></p>' +
      '<div class="ass"><div>Cliente</div><div>HS</div></div><script>print()<\/script></body></html>');
    w.document.close();
  }
  CRM.novo.os = function (clienteId) {
    var db = CRM.db;
    var g = CRM.gaveta('Nova ordem de serviço', 'Entrada do aparelho na bancada', '<div class="form"><div class="inteiro"><label>Cliente</label><select id="no-cli">' + db.clientes.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome); }).map(function (c) { return '<option value="' + c.id + '"' + (c.id === clienteId ? ' selected' : '') + '>' + esc(c.nome) + ' · ' + CRM.apAtual(c).modelo + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Serviço</label><select id="no-serv">' + C.servicos.map(function (s) { return '<option value="' + s.id + '">' + s.nome + '</option>'; }).join('') + '</select></div><div><label>Valor (tabela)</label><input id="no-val" inputmode="decimal"></div>' +
      '<div class="inteiro"><label>Defeito relatado pelo cliente</label><input id="no-def" placeholder="Ex.: caiu e a tela trincou, touch funciona"></div><div><label>Saúde da bateria (%)</label><input id="no-bat" inputmode="numeric"></div><div><label>Prazo</label><input type="date" id="no-prazo" value="' + HSDB.addDias(new Date().toISOString(), 1).slice(0, 10) + '"></div>' +
      '<div class="inteiro"><label>Checklist de entrada (marque o que funciona)</label><div class="checks">' + CHECK.map(function (k) { return '<label><input type="checkbox" data-ck="' + k[0] + '" checked> ' + k[1] + '</label>'; }).join('') + '</div></div>' +
      '<div class="inteiro checks"><label><input type="checkbox" id="no-senha"> Cliente informou a senha</label><label><input type="checkbox" id="no-termo" checked> Termo assinado</label></div><div class="inteiro"><button class="btn btn-pri" id="no-ok">Abrir OS</button></div></div>');
    function preco() { var c = CRM.cli($('#no-cli', g).value), p = C.precoServico(CRM.apAtual(c).modelo, $('#no-serv', g).value); $('#no-val', g).value = p.valor ? p.valor.toFixed(2).replace('.', ',') : ''; }
    $('#no-cli', g).onchange = preco; $('#no-serv', g).onchange = preco; preco();
    $('#no-ok', g).onclick = function () {
      var c = CRM.cli($('#no-cli', g).value), a = CRM.apAtual(c), ck = {}; $$('[data-ck]', g).forEach(function (x) { ck[x.dataset.ck] = x.checked; });
      var agora = new Date().toISOString();
      var o = { id: HSDB.uid('o'), num: Math.max.apply(null, db.os.map(function (x) { return x.num; })) + 1, clienteId: c.id, modelo: a.modelo, cor: a.cor, imei: a.imei, servico: $('#no-serv', g).value, defeito: $('#no-def', g).value || SERV[$('#no-serv', g).value],
        checklist: ck, bateriaSaude: +$('#no-bat', g).value || null, senhaInformada: $('#no-senha', g).checked, termo: $('#no-termo', g).checked, aprovado: false,
        valor: parseFloat(($('#no-val', g).value || '0').replace(/\./g, '').replace(',', '.')) || 0, custoPecas: 0, tecnico: 'u3', status: 'recebido', entrada: agora, prevista: new Date($('#no-prazo', g).value + 'T18:00').toISOString(), entregue: null,
        historico: [{ data: agora, status: 'recebido', nota: 'Aparelho recebido com checklist de entrada.' }] };
      db.os.push(o); CRM.salvar(); CRM.toast('OS ' + o.num + ' aberta'); CRM.ir('assistencia'); CRM.abrir.os(o.id);
    };
  };

  /* ================= ESTOQUE ================= */
  CRM.telas.estoque = function (el, aba) {
    aba = aba || 'seminovos'; var db = CRM.db, est = db.estoque;
    var disp = est.aparelhos.filter(function (x) { return x.status !== 'vendido'; });
    var capital = disp.reduce(function (s, x) { return s + (x.custo || 0); }, 0), potencial = disp.reduce(function (s, x) { return s + (x.preco || 0) - (x.custo || 0); }, 0);
    var baixo = est.pecas.filter(function (p) { return p.qtd < p.minimo; });
    var idade = disp.length ? disp.reduce(function (s, x) { return s + CRM.dias(x.entrada); }, 0) / disp.length : 0;
    el.innerHTML = '<div class="cab"><div><h1>Estoque</h1><p>Seminovos com custo, margem e dias parado; peças com estoque mínimo; avaliação de troca no balcão.</p></div></div>' +
      '<div class="grade g4 mb"><div class="kpi"><span>Seminovos disponíveis</span><strong>' + disp.length + '</strong><small>' + disp.filter(function (x) { return x.status === 'reservado'; }).length + ' reservados</small></div><div class="kpi"><span>Capital parado</span><strong>' + CRM.Rk(capital) + '</strong><small>custo dos aparelhos em estoque</small></div>' +
      '<div class="kpi"><span>Lucro potencial</span><strong>' + CRM.Rk(potencial) + '</strong><small>se vender tudo pelo preço de vitrine</small></div><div class="kpi"><span>Idade média</span><strong>' + Math.round(idade) + ' dias</strong><small>' + baixo.length + ' peças abaixo do mínimo</small></div></div>' +
      '<div class="abas">' + [['seminovos', 'Seminovos'], ['pecas', 'Peças (' + est.pecas.length + ')'], ['troca', 'Avaliar troca']].map(function (x) { return '<button class="aba" data-aba="' + x[0] + '" aria-selected="' + (aba === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div><div id="est-corpo"></div>';
    var corpo = $('#est-corpo', el);
    if (aba === 'seminovos') {
      corpo.innerHTML = '<div class="tabela-wrap"><table><thead><tr><th>Aparelho</th><th>IMEI</th><th>Condição</th><th class="num">Bateria</th><th class="num">Custo</th><th class="num">Preço</th><th class="num">Margem</th><th class="num">Dias</th><th>Status</th><th>Origem</th></tr></thead><tbody>' +
        est.aparelhos.slice().sort(function (a, b) { return (a.status === 'vendido') - (b.status === 'vendido') || CRM.dias(b.entrada) - CRM.dias(a.entrada); }).map(function (x) {
          var d = CRM.dias(x.entrada), m = x.preco ? (x.preco - C.desconto - x.custo) / (x.preco - C.desconto) : 0;
          return '<tr class="click" data-ap="' + x.id + '"' + (x.status === 'vendido' ? ' style="opacity:.5"' : '') + '><td><b>' + esc(x.modelo) + '</b><span class="sub-td">' + x.gb + ' GB · ' + esc(x.cor) + '</span></td><td style="font-family:ui-monospace,monospace;font-size:.8rem">' + (x.imei || '—') + '</td><td>' + ((C.condicoes[x.condicao] || {}).nome || x.condicao) + '</td><td class="num">' + (x.bateria ? x.bateria + '%' : '—') + '</td><td class="num">' + R0(x.custo) + '</td><td class="num">' + (x.preco ? R0(x.preco) : '—') + '</td><td class="num">' + (x.preco ? CRM.pct(m) : '—') + '</td>' +
            '<td class="num"><span class="selo ' + (x.status === 'vendido' ? 's-cinza' : d > 45 ? 's-vermelho' : d > 25 ? 's-amarelo' : 's-verde') + '">' + d + 'd</span></td><td>' + x.status + '</td><td>' + x.origem + '</td></tr>';
        }).join('') + '</tbody></table></div><p class="sub" style="margin-top:8px">Margem calculada sobre o preço com o cupom de R$ ' + C.desconto + '. Vermelho: mais de 45 dias parado, hora de baixar o preço ou anunciar.</p>';
    }
    if (aba === 'pecas') {
      var val = est.pecas.reduce(function (s, p) { return s + p.qtd * p.custo; }, 0);
      corpo.innerHTML = '<div class="filtros"><span style="color:var(--cinza);font-size:.88rem">Valor em peças: <b>' + R0(val) + '</b></span><button class="btn btn-sec" id="pedido" style="margin-left:auto"' + (baixo.length ? '' : ' disabled') + '>Gerar pedido de reposição (' + baixo.length + ')</button></div>' +
        '<div class="tabela-wrap"><table><thead><tr><th>SKU</th><th>Peça</th><th>Compatível</th><th>Estoque</th><th class="num">Custo</th><th>Fornecedor</th><th></th></tr></thead><tbody>' +
        est.pecas.map(function (p, i) { var ok = p.qtd >= p.minimo; return '<tr><td style="font-family:ui-monospace,monospace;font-size:.8rem">' + p.sku + '</td><td><b>' + esc(p.desc) + '</b></td><td>' + esc(p.compat) + '</td><td><span class="selo ' + (ok ? 's-verde' : 's-vermelho') + '">' + p.qtd + ' un.</span> <small style="color:var(--cinza)">mín. ' + p.minimo + '</small></td><td class="num">' + R0(p.custo) + '</td><td>' + esc(p.fornecedor) + '</td><td style="white-space:nowrap"><button class="btn btn-sec btn-p" data-p="' + i + '" data-d="-1">−</button> <button class="btn btn-sec btn-p" data-p="' + i + '" data-d="1">+</button></td></tr>'; }).join('') + '</tbody></table></div>';
      var pb = $('#pedido', el); if (pb) pb.onclick = function () {
        var txt = 'Pedido HS · ' + new Date().toLocaleDateString('pt-BR') + '\n' + baixo.map(function (p) { return '- ' + p.desc + ' (' + p.sku + '): ' + (p.minimo * 2 - p.qtd) + ' un.'; }).join('\n');
        try { navigator.clipboard.writeText(txt); CRM.toast('Pedido copiado. É só colar no WhatsApp do fornecedor.'); } catch (e) { alert(txt); }
      };
    }
    if (aba === 'troca') {
      corpo.innerHTML = '<div class="col-2-1"><div class="card"><h2>Avaliar aparelho no balcão</h2><p class="sub">Mesma tabela do site. Ajuste depois do teste.</p><div class="form"><div class="inteiro"><label>Modelo</label><select id="t-mod">' + Object.keys(C.troca).map(function (m) { return '<option>' + m + '</option>'; }).join('') + '</select></div>' +
        '<div><label>GB</label><select id="t-gb"><option>64</option><option selected>128</option><option>256</option><option>512</option><option>1024</option></select></div><div><label>Estado</label><select id="t-est"><option value="perfeito">Perfeito</option><option value="bom" selected>Bom</option><option value="marcas">Com marcas</option><option value="trincado">Trincado</option></select></div>' +
        '<div><label>Bateria</label><select id="t-bat"><option value="alta">85% ou mais</option><option value="media">80–84%</option><option value="baixa">abaixo de 80%</option></select></div><div><label>IMEI</label><input id="t-imei" inputmode="numeric" maxlength="15"></div>' +
        '<div class="inteiro checks"><label><input type="checkbox" id="t-icloud" checked> iCloud desvinculado</label><label><input type="checkbox" id="t-imeiok" checked> IMEI regular</label></div></div></div>' +
        '<div class="card"><h2>Resultado</h2><div id="t-res" style="margin-top:.6rem"></div></div></div>';
      var calc = function () {
        var r = HSDB.avaliarTroca($('#t-mod', el).value, +$('#t-gb', el).value, $('#t-est', el).value, $('#t-bat', el).value), ok = $('#t-icloud', el).checked && $('#t-imeiok', el).checked;
        $('#t-res', el).innerHTML = !ok ? '<div class="alerta vermelho"><span><b>Não comprar</b>Aparelho com iCloud ativo ou IMEI irregular não entra no estoque.</span></div>' :
          '<div style="font-size:.85rem;color:var(--cinza)">Faixa de entrada</div><div style="font-size:1.7rem;font-weight:800">' + R0(r.min) + ' – ' + R0(r.max) + '</div><p class="sub">Revenda sugerida após revisão: ~' + R0(r.medio * 1.32) + '</p><button class="btn btn-pri" id="t-ok">Registrar entrada no estoque</button>';
        var b = $('#t-ok', el); if (b) b.onclick = function () { db.estoque.aparelhos.push({ id: HSDB.uid('e'), modelo: $('#t-mod', el).value, gb: +$('#t-gb', el).value, cor: '—', imei: $('#t-imei', el).value, condicao: $('#t-est', el).value === 'perfeito' ? 'excelente' : 'muito-bom', bateria: null, preco: Math.round(r.medio * 1.32 / 10) * 10 - 1, custo: r.medio, entrada: new Date().toISOString(), status: 'em revisão', origem: 'troca' }); CRM.salvar(); CRM.toast('Aparelho entrou no estoque como "em revisão"'); CRM.ir('estoque'); };
      };
      corpo.onchange = calc; calc();
    }
    el.onclick = function (e) {
      var a = e.target.closest('[data-aba]'); if (a) return CRM.ir('estoque', a.dataset.aba);
      var p = e.target.closest('[data-p]'); if (p) { var pc = est.pecas[p.dataset.p]; pc.qtd = Math.max(0, pc.qtd + +p.dataset.d); CRM.salvar(); return CRM.telas.estoque(el, 'pecas'); }
      var ap = e.target.closest('[data-ap]'); if (ap) editarAparelho(ap.dataset.ap);
    };
  };
  function editarAparelho(id) {
    var x = CRM.db.estoque.aparelhos.filter(function (a) { return a.id === id; })[0];
    var g = CRM.gaveta(esc(x.modelo) + ' ' + x.gb + ' GB', 'Em estoque há ' + CRM.dias(x.entrada) + ' dias · ' + x.origem, '<div class="form"><div><label>Preço de vitrine</label><input id="e-preco" value="' + x.preco + '" inputmode="decimal"></div><div><label>Custo</label><input id="e-custo" value="' + x.custo + '" inputmode="decimal"></div><div><label>Status</label><select id="e-st">' + ['em revisão', 'disponível', 'reservado', 'vendido'].map(function (s) { return '<option' + (s === x.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div><div><label>Bateria (%)</label><input id="e-bat" value="' + (x.bateria || '') + '"></div><div class="inteiro"><label>IMEI</label><input id="e-imei" value="' + (x.imei || '') + '"></div><div class="inteiro"><button class="btn btn-pri" id="e-ok">Salvar</button></div></div>');
    $('#e-ok', g).onclick = function () { x.preco = +$('#e-preco', g).value || x.preco; x.custo = +$('#e-custo', g).value || x.custo; x.status = $('#e-st', g).value; x.bateria = +$('#e-bat', g).value || null; x.imei = $('#e-imei', g).value; CRM.salvar(); CRM.toast('Aparelho salvo'); CRM.ir('estoque'); };
  }
})();
