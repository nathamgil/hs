/* =====================================================================
   HS — camada de dados compartilhada pelo site e pelo CRM.
   Em modo demonstração tudo fica no localStorage deste navegador e nasce
   com uma base de exemplo (≈ 4 meses de operação inventada, mas plausível).
   Ao ligar o Supabase, só este arquivo muda.
   ===================================================================== */
(function () {
  var CHAVE = 'hs_db_v8';
  var C = window.HS || {};
  var AGORA = new Date();

  /* ---- utilitários --------------------------------------------------- */
  var semente = 20261016;
  function rnd() { semente |= 0; semente = semente + 0x6D2B79F5 | 0; var t = Math.imul(semente ^ semente >>> 15, 1 | semente); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function entre(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function uid(p) { return (p || 'x') + Math.random().toString(36).slice(2, 9); }
  function diasAtras(n, h) { var d = new Date(AGORA); d.setDate(d.getDate() - n); d.setHours(h == null ? entre(9, 17) : h, entre(0, 59), 0, 0); if (d > AGORA) d = new Date(AGORA.getTime() - entre(20, 180) * 6e4); return d.toISOString(); }
  function soDigitos(s) { return String(s || '').replace(/\D/g, ''); }
  function addDias(iso, n) { var d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString(); }
  function imei() { var s = '35'; for (var i = 0; i < 13; i++) s += entre(0, 9); return s; }

  /* ---- pontuação do lead (site e CRM usam a mesma regra) ------------- */
  function pontuar(l) {
    var p = 0;
    if (l.interesse === 'comprar') p += 2;
    if (l.interesse === 'conserto') p += 3;
    if (l.interesse === 'troca') p += 3;
    if (l.pagamento === 'pix') p += 3;
    if (l.pagamento === 'cartao') p += 2;
    if (l.pagamento === 'troca') p += 3;
    if (l.prazo === 'semana') p += 3;
    if (l.prazo === 'mes') p += 1;
    if (l.prazo === 'pesquisando') p -= 1;
    if (l.email) p += 1;
    if (l.troca && l.troca.valor) p += 1;
    return p;
  }
  function temperatura(p) { return p >= 6 ? 'quente' : p >= 3 ? 'morno' : 'frio'; }

  /* ---- base de exemplo ---------------------------------------------- */
  var PRIMEIROS = ['Ana','Bruno','Camila','Diego','Eduarda','Felipe','Gabriela','Henrique','Isabela','João Victor','Karina','Lucas','Mariana','Natália','Otávio','Paula','Rafael','Sabrina','Thiago','Vanessa','Wesley','Yasmin','André','Beatriz','Caio','Daniela','Everton','Fernanda','Gustavo','Helena','Igor','Juliana','Leonardo','Marcela','Nicolas','Priscila','Renan','Simone','Tainá','Vinícius','Alana','Matheus','Larissa','Pedro','Jéssica','Rodrigo','Aline','Davi','Letícia','Carla','Marcos','Tiago','Renata','Luana','Rogério','Patrícia','Elton','Cíntia','Murilo','Bianca'];
  var SOBRENOMES = ['Santos','Oliveira','Reis','Matos','Lima','Araújo','Souza','Costa','Nunes','Alves','Menezes','Ferreira','Rocha','Cerqueira','Bastos','Andrade','Teixeira','Pinho','Cardoso','Moura','Santana','Carvalho','Brito','Quadros','Nascimento','Pires','Silva','Lopes','Ramos','Barreto','Sampaio','Freitas','Dantas','Viana','Prado','Galvão','Batista','Aragão','Conceição','Leal'];
  var BAIRROS = ['Federação','Ondina','Rio Vermelho','Garcia','Engenho Velho da Federação','Barra','Graça','Brotas','Vasco da Gama','Cabula','Pituba','Amaralina','Canela','Campo Grande','Nazaré'];
  var ORIGENS = ['Instagram','Indicação','Passou na loja','Google','Anúncio Meta','Site'];
  var MODELOS_CLI = ['iPhone 11','iPhone 11','iPhone 12','iPhone 12','iPhone 13','iPhone 13','iPhone 13 Pro Max','iPhone 14','iPhone 14 Pro Max','iPhone 14 Pro Max','iPhone 15','iPhone 15 Pro','iPhone 15 Pro Max','iPhone 16','iPhone 16 Pro Max','iPhone XR','iPhone 12 Pro Max','Android','Android'];
  var CORES = ['Preto','Branco','Azul','Grafite','Roxo','Meia-noite','Estelar','Titânio natural','Rosa','Verde'];
  var DEFEITOS = [['tela','Tela quebrada'],['tela','Touch falhando'],['bateria','Bateria descarregando rápido'],['bateria','Bateria inchada'],['conector','Não carrega'],['faceid','Face ID indisponível'],['camera','Câmera tremendo'],['traseira','Vidro traseiro trincado'],['agua','Caiu na água, não liga'],['placa','Reinicia sozinho']];
  var ACESS = [['Capa MagSafe transparente',10,4],['Película de vidro 3D',35,6],['Fonte USB-C 20W',89,38],['Carregador portátil 10.000 mAh',149,72],['Cabo USB-C 1 m',39,12],['Capa de silicone corações',39.9,11],['Película de privacidade',59.9,14],['Caixa de som Bluetooth',179,88]];
  var PECAS = [
    ['TEL-11','Tela iPhone 11 / XR (incell)','iPhone 11, XR',62,8,4],['TEL-12','Tela iPhone 12 / 12 Pro (OLED)','iPhone 12',138,5,3],['TEL-13','Tela iPhone 13 (OLED)','iPhone 13',176,4,3],
    ['TEL-14PM','Tela iPhone 14 Pro Max (OLED)','iPhone 14 Pro Max',410,1,2],['TEL-15','Tela iPhone 15 (OLED)','iPhone 15',360,2,2],['BAT-11','Bateria iPhone 11','iPhone 11',58,9,5],
    ['BAT-12','Bateria iPhone 12 / 12 Pro','iPhone 12',64,6,4],['BAT-13','Bateria iPhone 13','iPhone 13',72,3,4],['BAT-14PM','Bateria iPhone 14 Pro Max','iPhone 14 Pro Max',96,2,3],
    ['CON-L','Flex conector Lightning','iPhone 11 ao 14',28,12,5],['CON-C','Flex conector USB-C','iPhone 15 ao 17',46,4,3],['VID-T','Vidro traseiro (laser)','iPhone 12 ao 15',35,10,4]
  ];

  function semear() {
    semente = 20261016;
    var db = { versao: 5, criadoEm: AGORA.toISOString(), clientes: [], vendas: [], os: [], leads: [], tarefas: [], importados: [],
      estoque: { aparelhos: [], pecas: [] }, campanhas: [], automacoes: [], avaliacoes: [], conversas: [],
      usuarios: [{ id: 'u1', nome: 'Dono', papel: 'Dono', iniciais: 'DN' }, { id: 'u2', nome: 'Sócia', papel: 'Sócia', iniciais: 'SC' }, { id: 'u3', nome: 'Técnico', papel: 'Técnico', iniciais: 'TC' }],
      metas: { receita: 65000, iphones: 12, consertos: 20, cadastros: 35 } };

    /* clientes */
    for (var i = 0; i < 64; i++) {
      var nome = PRIMEIROS[i % PRIMEIROS.length] + ' ' + SOBRENOMES[(i * 7) % SOBRENOMES.length];
      var desde = entre(90, 1300), m = pick(MODELOS_CLI);
      var nasc = (1975 + entre(0, 28)) + '-' + String(entre(1, 12)).padStart(2, '0') + '-' + String(entre(1, 28)).padStart(2, '0');
      if (i % 9 === 0) nasc = '1994-' + String(AGORA.getMonth() + 1).padStart(2, '0') + '-' + String(entre(1, 28)).padStart(2, '0');
      var c = {
        id: 'c' + (1000 + i), nome: nome, whats: '55719' + (80000000 + entre(0, 19999999)),
        email: i % 4 === 3 ? '' : nome.split(' ')[0].toLowerCase().normalize('NFD').replace(/[^a-z]/g, '') + '.' + nome.split(' ')[1].toLowerCase().normalize('NFD').replace(/[^a-z]/g, '') + '@email.com',
        nasc: nasc, bairro: pick(BAIRROS), origem: pick(ORIGENS), criado: diasAtras(desde + entre(0, 30)), tags: [],
        optin: { whats: rnd() > 0.08, email: rnd() > 0.3 }, indicadoPor: null, obs: '',
        aparelhos: [{ id: uid('a'), modelo: m, gb: pick([64, 128, 128, 256]), cor: pick(CORES), imei: m === 'Android' ? '' : imei(), desde: diasAtras(desde), atual: true, compradoNaHS: rnd() > 0.55 }]
      };
      if (rnd() > 0.7) c.aparelhos.push({ id: uid('a'), modelo: pick(['iPhone 8','iPhone X','iPhone XR','iPhone 11']), gb: 64, cor: 'Preto', imei: imei(), desde: diasAtras(desde + 700), atual: false, compradoNaHS: false });
      if (i > 5 && rnd() > 0.82) c.indicadoPor = 'c' + (1000 + entre(0, i - 1));
      db.clientes.push(c);
    }

    /* vendas (≈ 120 dias) */
    var num = 3100;
    for (var d = 120; d >= 0; d--) {
      var qtd = entre(1, 4);
      for (var k = 0; k < qtd; k++) {
        var cl = pick(db.clientes), r = rnd(), v = { id: uid('v'), num: num++, data: diasAtras(d), clienteId: cl.id, itens: [], pagamento: pick(['pix','pix','cartao','cartao','dinheiro']), parcelas: 1, vendedor: pick(['u1','u2']), origem: cl.origem };
        if (r < 0.2) {
          var ap = pick(C.aparelhos || [{ modelo: 'iPhone 13', gb: 128, preco: 2699 }]);
          var preco = ap.preco - C.desconto, custo = Math.round(ap.preco * 0.79);
          v.itens.push({ tipo: 'aparelho', desc: ap.modelo + ' ' + ap.gb + ' GB seminovo', qtd: 1, valor: preco, custo: custo });
          if (rnd() > 0.4) { v.pagamento = 'troca'; v.trocaValor = entre(6, 25) * 100; }
          if (v.pagamento === 'cartao') v.parcelas = pick([6, 10, 12]);
          if (rnd() > 0.5) { var a2 = pick(ACESS); v.itens.push({ tipo: 'acessorio', desc: a2[0], qtd: 1, valor: a2[1], custo: a2[2] }); }
        } else {
          var a = pick(ACESS), n = entre(1, 2);
          v.itens.push({ tipo: 'acessorio', desc: a[0], qtd: n, valor: a[1] * n, custo: a[2] * n });
        }
        db.vendas.push(v);
      }
    }

    /* ordens de serviço */
    var osNum = 1180, st = ['entregue'];
    for (var o = 0; o < 96; o++) {
      var dd = Math.floor(o * 1.25), cli = pick(db.clientes), apar = cli.aparelhos[0];
      if (apar.modelo === 'Android') continue;
      var df = pick(DEFEITOS), preco2 = (C.precoServico ? C.precoServico(apar.modelo, df[0]).valor : 300) || entre(25, 60) * 10;
      var status = dd > 6 ? 'entregue' : pick(['recebido','diagnóstico','aguardando aprovação','aguardando peça','em reparo','em reparo','pronto','pronto']);
      var entrada = diasAtras(dd);
      var os = { id: uid('o'), num: osNum++, clienteId: cli.id, modelo: apar.modelo, cor: apar.cor, imei: apar.imei, servico: df[0], defeito: df[1],
        checklist: { tela: df[0] !== 'tela', faceid: df[0] !== 'faceid', cameras: df[0] !== 'camera', botoes: true, audio: rnd() > 0.1, carga: df[0] !== 'conector', wifi: true },
        bateriaSaude: entre(71, 95), senhaInformada: rnd() > 0.3, termo: true, aprovado: status !== 'recebido' && status !== 'diagnóstico' && status !== 'aguardando aprovação',
        valor: preco2, custoPecas: Math.round(preco2 * (0.28 + rnd() * 0.15)), tecnico: 'u3', status: status,
        entrada: entrada, prevista: addDias(entrada, df[0] === 'faceid' ? 3 : 1), entregue: status === 'entregue' ? addDias(entrada, entre(0, 3)) : null,
        historico: [{ data: entrada, status: 'recebido', nota: 'Aparelho recebido com checklist de entrada.' }] };
      if (status === 'entregue') { os.historico.push({ data: addDias(entrada, 0), status: 'em reparo', nota: '' }, { data: os.entregue, status: 'entregue', nota: 'Garantia de 90 dias.' }); os.garantiaAte = addDias(os.entregue, 90); }
      else if (status !== 'recebido') os.historico.push({ data: addDias(entrada, 0), status: status, nota: status === 'aguardando peça' ? 'Peça pedida ao fornecedor.' : '' });
      db.os.push(os);
    }

    /* estoque de seminovos (o que está no site + alguns reservados/vendidos) */
    (C.aparelhos || []).forEach(function (a, i) {
      db.estoque.aparelhos.push({ id: a.id, modelo: a.modelo, gb: a.gb, cor: a.cor, imei: imei(), condicao: a.condicao, bateria: a.bateria, preco: a.preco, custo: Math.round(a.preco * (0.74 + rnd() * 0.08)),
        entrada: diasAtras(entre(2, 58)), status: i === 3 ? 'reservado' : 'disponível', origem: rnd() > 0.5 ? 'troca' : 'compra' });
    });
    PECAS.forEach(function (p) { db.estoque.pecas.push({ sku: p[0], desc: p[1], compat: p[2], custo: p[3], qtd: p[4], minimo: p[5], fornecedor: pick(['Distribuidora SP','Fornecedor local']) }); });

    /* leads */
    var ETAPAS = ['novo','novo','novo','em contato','em contato','proposta','proposta','ganho','ganho','perdido'];
    var MOTIVOS = ['Achou mais barato','Sem limite no cartão','Desistiu da troca','Não respondeu mais'];
    var CAMPS = ['Upgrade · 12 e 13 → 15/16','Conserto · antes e depois','Remarketing · base antiga','Seminovos · vitrine'];
    for (var L = 0; L < 34; L++) {
      var nomeL = PRIMEIROS[(L * 3 + 11) % PRIMEIROS.length] + ' ' + SOBRENOMES[(L * 5 + 3) % SOBRENOMES.length];
      var interesse = pick(['comprar','comprar','troca','conserto','conserto','acessorios']);
      var atual = pick(['iPhone 11','iPhone 12','iPhone 13','iPhone XR','iPhone 14','Android','Android']);
      var l = { id: uid('l'), criado: diasAtras(Math.floor(L * 0.9), entre(8, 23)), nome: nomeL, whats: '55719' + (90000000 + entre(0, 9999999)),
        email: rnd() > 0.35 ? nomeL.split(' ')[0].toLowerCase().normalize('NFD').replace(/[^a-z]/g, '') + '@email.com' : '',
        interesse: interesse, modelo_atual: atual, modelo_desejado: interesse === 'comprar' || interesse === 'troca' ? pick(['iPhone 15','iPhone 15 Pro Max','iPhone 16 Pro Max','iPhone 14 Pro Max','iPhone 13']) : '',
        pagamento: interesse === 'troca' ? 'troca' : interesse === 'comprar' ? pick(['pix','cartao','cartao','troca']) : pick(['pix','cartao']), prazo: pick(['semana','semana','mes','pesquisando']),
        cupom: 'HS100-' + (4100 + L * 37), status: L < 4 ? 'novo' : pick(ETAPAS), origem: pick(['Anúncio Meta','Anúncio Meta','Instagram','Site','Google']),
        dono: pick(['u1','u2']), primeiraResposta: entre(3, 240), notas: [] };
      if (l.origem === 'Anúncio Meta') l.campanha = pick(CAMPS);
      if (interesse === 'troca' && atual !== 'Android') { var base = (C.troca || {})[atual] || 900; l.troca = { modelo: atual, gb: 128, estado: 'bom', bateria: 'media', valor: Math.round(base * 0.92 / 10) * 10 }; }
      l.valorEstimado = interesse === 'conserto' ? entre(18, 45) * 10 : interesse === 'acessorios' ? entre(4, 15) * 10 : entre(25, 75) * 100;
      if (l.status === 'perdido') l.motivoPerda = pick(MOTIVOS);
      if (l.status !== 'ganho' && l.status !== 'perdido') l.proximaAcao = { data: addDias(AGORA.toISOString(), entre(-1, 3)), desc: pick(['Mandar fotos do aparelho','Retornar com simulação de parcelas','Confirmar visita na loja','Enviar orçamento do conserto']) };
      l.score = pontuar(l); l.temp = temperatura(l.score);
      db.leads.push(l);
    }

    /* tarefas */
    [['Ligar para confirmar retirada da OS', 0], ['Pedir avaliação no Google aos entregues de ontem', 0], ['Repor películas 3D (estoque baixo)', 1], ['Postar antes e depois da semana', 1], ['Conferir saldo da conta de anúncios', 2]]
      .forEach(function (t, i) { db.tarefas.push({ id: uid('t'), titulo: t[0], data: addDias(AGORA.toISOString(), t[1]), feita: false, dono: i % 2 ? 'u2' : 'u1' }); });

    /* campanhas da Meta (DEMONSTRAÇÃO, entram de verdade ao conectar a conta) */
    [['Upgrade · 12 e 13 → 15/16','Cadastros',1240,38400,1210,96,31,6,6*4800],
     ['Conserto · antes e depois','Mensagens',780,29100,980,71,40,24,24*310],
     ['Remarketing · base antiga','Cadastros',310,9800,420,44,15,5,5*1900],
     ['Seminovos · vitrine','Cadastros',650,21700,690,51,12,3,3*3900]]
      .forEach(function (c, i) { db.campanhas.push({ id: 'cp' + i, nome: c[0], objetivo: c[1], status: i === 3 ? 'pausada' : 'ativa', investimento: c[2], impressoes: c[3], cliques: c[4], cadastros: c[5], quentes: c[6], vendas: c[7], receita: c[8] }); });

    /* automações (réguas) */
    [['Aparelho pronto','OS muda para "pronto"','WhatsApp com valor e horário de retirada',true,88,81,74],
     ['Pedir avaliação no Google','2 dias depois da entrega','WhatsApp com link da avaliação',true,73,29,21],
     ['Cadastro quente sem resposta','15 min sem resposta','Alerta no CRM para o dono',true,41,41,19],
     ['Upgrade aos 24 meses','Aparelho completa 2 anos','Oferta de troca com avaliação',true,37,12,4],
     ['Garantia acabando','10 dias antes do fim da garantia','Revisão grátis na loja',false,0,0,0],
     ['Aniversário','No dia do aniversário','Película de presente',true,19,11,7],
     ['Bateria abaixo de 80%','Checklist da OS marca bateria < 80%','Oferta de troca de bateria',true,26,14,9],
     ['Cupom vencendo','Dia 6 do cupom sem compra','Lembrete de que expira amanhã',true,58,22,8]]
      .forEach(function (a, i) { db.automacoes.push({ id: 'au' + i, nome: a[0], gatilho: a[1], acao: a[2], ativa: a[3], disparos: a[4], respostas: a[5], conversoes: a[6] }); });

    /* avaliações (Google e NPS) */
    var textos = [[5,'Atendimento excelente, trocaram a tela do meu 13 no mesmo dia.'],[5,'Preço justo e explicaram tudo antes de mexer.'],[4,'Ótimo serviço, só demorou um pouco mais que o combinado.'],[5,'Comprei meu primeiro iPhone aqui. Super recomendo!'],[3,'Bom serviço, mas tive que ligar para saber se estava pronto.'],[5,'Honestos. Disseram que não precisava trocar a placa.'],[5,'Mudaram de endereço mas continuam top.'],[4,'Capa e película com preço bom.']];
    textos.forEach(function (t, i) { var cl = db.clientes[i * 5]; db.avaliacoes.push({ id: uid('r'), data: diasAtras(i * 6 + 1), clienteId: cl.id, nota: t[0], canal: i % 3 === 2 ? 'NPS' : 'Google', texto: t[1], respondida: i % 2 === 0 }); });

    /* conversas da IA no WhatsApp (DEMONSTRAÇÃO do agente) */
    db.conversas = [
      { id: 'cv1', nome: 'Marcos Vinícius', whats: '5571991234567', status: 'aguardando humano', temp: 'quente', inicio: diasAtras(0, 22), resumo: 'Quer trocar o 12 (128 GB, bateria 84%) no 15 Pro Max. Paga a diferença no Pix esta semana.',
        msgs: [['cliente','Boa noite, vocês pegam iPhone na troca?','22:41'],['ia','Boa noite! Pegamos sim 😊 Qual é o seu modelo e quantos GB ele tem?','22:41'],['cliente','12 de 128','22:42'],['ia','Perfeito. Em Ajustes > Bateria > Saúde, qual porcentagem aparece? E ele tem alguma trinca ou marca?','22:42'],['cliente','84%, sem trinca','22:44'],['ia','Ótimo estado! Pela nossa tabela ele entra por volta de R$ 1.000. Qual iPhone você quer levar?','22:44'],['cliente','15 pro max','22:45'],['ia','Temos o 15 Pro Max 256 GB Titânio natural, bateria 90%. A diferença fica em torno de R$ 4.900 no Pix, já com o cupom de R$ 100. Você pretende fechar quando?','22:45'],['cliente','essa semana','22:46'],['ia','Fechado! Vou deixar separado e o pessoal da loja te chama amanhã às 9h para confirmar. Pode ser?','22:46']] },
      { id: 'cv2', nome: 'Rodrigo Pacheco', whats: '5571998765432', status: 'IA atendendo', temp: 'morno', inicio: diasAtras(0, 15), resumo: 'Tela do XR quebrada. Recebeu o orçamento de R$ 199,99, vai passar amanhã.',
        msgs: [['cliente','Quanto fica a tela do XR?','15:02'],['ia','A troca de tela do iPhone XR está em promoção: R$ 199,99, pronta no mesmo dia e com 90 dias de garantia. O touch está funcionando?','15:02'],['cliente','funciona sim, só trincou','15:03'],['ia','Então é só a troca da tela. Quer reservar um horário? Amanhã temos às 10h e às 14h.','15:03']] },
      { id: 'cv3', nome: 'Letícia Prado', whats: '5571992223344', status: 'encerrada', temp: 'frio', inicio: diasAtras(1, 11), resumo: 'Pesquisando preço de iPhone 11, sem previsão. Recebeu cupom e foi para nutrição.',
        msgs: [['cliente','qual o valor do iphone 11?','11:20'],['ia','O iPhone 11 64 GB seminovo, bateria 88%, sai por R$ 1.499 com o cupom de cadastro, ou 12x no cartão. Você pretende comprar quando?','11:20'],['cliente','to só olhando por enquanto','11:24'],['ia','Sem problema! Te mandei o link do cupom, ele vale 7 dias. Qualquer dúvida é só chamar 😊','11:24']] },
      { id: 'cv4', nome: 'Aline Moreira', whats: '5571993334455', status: 'aguardando humano', temp: 'quente', inicio: diasAtras(0, 10), resumo: 'iPhone 14 caiu na água. Pediu avaliação urgente, já está a caminho da loja.',
        msgs: [['cliente','meu iphone caiu na piscina e não liga, socorro','10:05'],['ia','Calma! Não tente carregar nem ligar o aparelho. Qual o modelo?','10:05'],['cliente','14','10:06'],['ia','Traga ainda hoje: com líquido, quanto antes melhor. Fazemos o diagnóstico sem custo. Estamos na Galeria Tenaz, Federação, até as 18h. Já avisei a equipe que você está vindo.','10:06']] }
    ];
    return db;
  }

  function ler() {
    try { var s = localStorage.getItem(CHAVE); if (s) return JSON.parse(s); } catch (e) {}
    var db = semear(); gravar(db); return db;
  }
  function gravar(db) { try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch (e) {} }
  function gerarCupom() { return 'HS100-' + Math.floor(1000 + Math.random() * 9000); }

  function novoLead(dados) {
    var db = ler();
    var l = Object.assign({ id: uid('l'), criado: new Date().toISOString(), status: 'novo', origem: 'Site', cupom: gerarCupom(), notas: [], primeiraResposta: null }, dados);
    l.whats = soDigitos(l.whats); if (l.whats.length <= 11) l.whats = '55' + l.whats;
    l.score = pontuar(l); l.temp = temperatura(l.score);
    l.valorEstimado = l.interesse === 'conserto' ? 300 : l.interesse === 'acessorios' ? 80 : 4000;
    db.leads.unshift(l); gravar(db);
    return l;
  }

  function buscarOS(num, finalTel) {
    var db = ler(), n = parseInt(soDigitos(num), 10), f = soDigitos(finalTel).slice(-4);
    var os = db.os.filter(function (o) { return o.num === n; })[0];
    if (!os) return null;
    var c = db.clientes.filter(function (x) { return x.id === os.clienteId; })[0];
    if (!c || c.whats.slice(-4) !== f) return null;
    return { os: os, primeiroNome: c.nome.split(' ')[0] };
  }

  function avaliarTroca(modelo, gb, estado, bateria) {
    var base = (C.troca || {})[modelo]; if (!base) return null;
    var aj = C.trocaAjustes;
    var v = base * (1 + (aj.gb[gb] || 0) + (aj.estado[estado] || 0) + (aj.bateria[bateria] || 0));
    var meio = Math.round(v / 10) * 10;
    return { min: Math.round(meio * 0.92 / 10) * 10, max: Math.round(meio * 1.04 / 10) * 10, medio: meio };
  }

  window.HSDB = {
    ler: ler, gravar: gravar, uid: uid, novoLead: novoLead, novoCadastro: novoLead, buscarOS: buscarOS, avaliarTroca: avaliarTroca,
    pontuar: pontuar, temperatura: temperatura, soDigitos: soDigitos, addDias: addDias,
    zerar: function () { try { localStorage.removeItem(CHAVE); } catch (e) {} return ler(); },
    dinheiro: function (v, semCentavos) { return v == null ? '' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: semCentavos ? 0 : 2, maximumFractionDigits: semCentavos ? 0 : 2 }); },
    parcela: function (v) { var n = C.parcelasMax || 12, i = C.jurosParcela || 0; return i ? v * i / (1 - Math.pow(1 + i, -n)) : v / n; },
    wa: function (numero, msg) { return 'https://wa.me/' + soDigitos(numero) + '?text=' + encodeURIComponent(msg || ''); }
  };
})();
