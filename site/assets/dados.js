/* =====================================================================
   HS — camada de dados compartilhada pelo site e pelo CRM.
   Em modo demonstração tudo fica no localStorage deste navegador.
   ===================================================================== */
(function () {
  var CHAVE = 'hs_db_v3';
  var HOJE = new Date();

  function uid(p) { return (p || 'x') + Math.random().toString(36).slice(2, 9); }
  function diasAtras(n) { var d = new Date(HOJE); d.setDate(d.getDate() - n); return d.toISOString(); }
  function soDigitos(s) { return String(s || '').replace(/\D/g, ''); }

  /* ---- Qualificação do cadastro --------------------------------------
     Soma pontos pelo que a pessoa respondeu. Quente ≥ 6, morno ≥ 3.
  -------------------------------------------------------------------- */
  function pontuar(l) {
    var p = 0;
    if (l.interesse === 'comprar') p += 2;
    if (l.interesse === 'conserto') p += 3;          // conserto quase sempre fecha
    if (l.pagamento === 'pix') p += 3;
    if (l.pagamento === 'cartao') p += 2;
    if (l.pagamento === 'troca') p += 3;             // já é cliente Apple: upgrade
    if (l.prazo === 'semana') p += 3;
    if (l.prazo === 'mes') p += 1;
    if (l.prazo === 'pesquisando') p -= 1;
    if (l.email) p += 1;
    return p;
  }
  function temperatura(p) { return p >= 6 ? 'quente' : p >= 3 ? 'morno' : 'frio'; }

  /* ---- Base de exemplo (só na demonstração) ------------------------ */
  function semear() {
    var nomes = ['Ana Paula Santos','Bruno Oliveira','Camila Reis','Diego Matos','Eduarda Lima','Felipe Araújo',
      'Gabriela Souza','Henrique Costa','Isabela Nunes','João Victor Alves','Karina Menezes','Lucas Ferreira',
      'Mariana Rocha','Natália Cerqueira','Otávio Bastos','Paula Andrade','Rafael Teixeira','Sabrina Pinho',
      'Thiago Cardoso','Vanessa Moura','Wesley Santana','Yasmin Carvalho','André Brito','Beatriz Quadros',
      'Caio Nascimento','Daniela Pires','Everton Silva','Fernanda Lopes','Gustavo Ramos','Helena Barreto',
      'Igor Sampaio','Juliana Freitas','Leonardo Dantas','Marcela Viana','Nicolas Prado','Priscila Galvão',
      'Renan Batista','Simone Aragão','Tainá Conceição','Vinícius Leal'];
    var mods = ['iPhone 11','iPhone 12','iPhone 13','iPhone 14 Pro Max','iPhone 13 Pro Max','iPhone 15','iPhone XR',
      'iPhone 14','iPhone 12 Pro Max','iPhone 15 Pro Max','iPhone 16 Pro','Android','iPhone 13','iPhone 14 Pro Max','Android'];
    var cores = ['Preto','Branco','Azul','Grafite','Roxo','Dourado','Titânio natural'];
    var consertos = [['Troca de tela',380],['Troca de bateria',260],['Conector de carga',180],['Face ID',450],['Vidro traseiro',300]];
    var acess = [['Capa MagSafe',40],['Película 3D',35],['Carregador 20W',89],['Carregador portátil 10.000 mAh',149],['Cabo USB-C',39]];
    var db = { clientes: [], leads: [], os: [], importados: [] };

    nomes.forEach(function (n, i) {
      var m = mods[i % mods.length];
      var desde = 120 + (i * 53) % 1100;              // há quanto tempo tem o aparelho
      var tel = '55719' + (81000000 + (i * 791993) % 18999999);
      var mes = (i * 5) % 12, dia = 1 + (i * 7) % 27;
      var nasc = '19' + (80 + i % 19) + '-' + String(mes + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
      if (i % 6 === 0) nasc = '1995-' + String(HOJE.getMonth() + 1).padStart(2, '0') + '-' + String(5 + i % 20).padStart(2, '0');
      var c = {
        id: uid('c'), nome: n, whats: tel, email: n.split(' ')[0].toLowerCase().normalize('NFD').replace(/[^a-z]/g, '') + '@email.com',
        nasc: nasc, origem: ['Instagram','Indicação','Passou na loja','Google','Tráfego'][i % 5],
        criado: diasAtras(desde + 10), tags: [], obs: '',
        aparelhos: [{ id: uid('a'), modelo: m, cor: cores[i % cores.length], gb: [64,128,256][i % 3], desde: diasAtras(desde), atual: true }],
        historico: []
      };
      if (i % 4 === 0) c.aparelhos.push({ id: uid('a'), modelo: 'iPhone ' + (8 + i % 3), cor: 'Preto', gb: 64, desde: diasAtras(desde + 700), atual: false });
      if (i % 3 === 0) c.historico.push({ id: uid('h'), data: diasAtras(desde), tipo: 'compra', desc: 'Comprou ' + m + ' na HS', valor: 2500 + (i % 7) * 600 });
      var k = consertos[i % consertos.length];
      if (i % 2 === 0) c.historico.push({ id: uid('h'), data: diasAtras(Math.max(15, desde - 90)), tipo: 'conserto', desc: k[0], valor: k[1] });
      var a = acess[i % acess.length];
      c.historico.push({ id: uid('h'), data: diasAtras(Math.max(5, desde - 30 - i)), tipo: 'acessorio', desc: a[0], valor: a[1] });
      if (i % 7 === 0) c.tags.push('VIP');
      db.clientes.push(c);
    });

    var leadsEx = [
      ['Marcos Vinícius','iPhone 12','comprar','iPhone 15 Pro Max','troca','semana',0,'novo'],
      ['Larissa Gomes','iPhone 11','comprar','iPhone 14 Pro Max','pix','semana',0,'novo'],
      ['Pedro Henrique','iPhone 13 Pro','conserto','','pix','semana',1,'em conversa'],
      ['Jéssica Almeida','Android','comprar','iPhone 13','cartao','mes',1,'em conversa'],
      ['Rodrigo Pacheco','iPhone XR','conserto','','cartao','semana',2,'novo'],
      ['Aline Moreira','iPhone 14','acessorios','','pix','mes',2,'negociando'],
      ['Matheus Lisboa','Android','comprar','iPhone 16 Pro','cartao','pesquisando',3,'novo'],
      ['Carla Ribeiro','iPhone 13','comprar','iPhone 16 Pro Max','troca','mes',3,'negociando'],
      ['Tiago Mendes','Android','comprar','iPhone 11','cartao','pesquisando',4,'perdido'],
      ['Renata Fonseca','iPhone 15','conserto','','pix','semana',5,'comprou'],
      ['Davi Guimarães','iPhone 11','comprar','iPhone 13','cartao','mes',6,'em conversa'],
      ['Letícia Prado','Android','comprar','iPhone 12','cartao','pesquisando',8,'novo']
    ];
    leadsEx.forEach(function (x, i) {
      var l = { id: uid('l'), criado: diasAtras(x[6]), nome: x[0], whats: '55719' + (91000000 + i * 377711), email: i % 3 ? x[0].split(' ')[0].toLowerCase().normalize('NFD').replace(/[^a-z]/g,'') + '@email.com' : '',
        modelo_atual: x[1], interesse: x[2], modelo_desejado: x[3], pagamento: x[4], prazo: x[5],
        cupom: 'HS100-' + (4100 + i * 37), status: x[7], origem: i % 2 ? 'Anúncio Meta' : 'Instagram' };
      l.score = pontuar(l); l.temp = temperatura(l.score);
      db.leads.push(l);
    });

    var defeitos = [['Tela quebrada',380],['Não carrega',180],['Bateria viciada',260],['Face ID parou',450],['Câmera tremendo',320],['Molhou, não liga',550],['Vidro traseiro',300],['Tela quebrada',420]];
    var stOS = ['recebido','em reparo','em reparo','pronto','pronto','recebido','entregue','em reparo'];
    defeitos.forEach(function (d, i) {
      var c = db.clientes[i * 4];
      db.os.push({ id: uid('o'), num: 1240 + i, clienteId: c.id, modelo: c.aparelhos[0].modelo, defeito: d[0], valor: d[1],
        status: stOS[i], entrada: diasAtras(i % 4), prevista: diasAtras(-(1 + i % 3)) });
    });
    return db;
  }

  function ler() {
    try {
      var s = localStorage.getItem(CHAVE);
      if (s) return JSON.parse(s);
    } catch (e) {}
    var db = semear(); gravar(db); return db;
  }
  function gravar(db) { try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch (e) {} }

  function gerarCupom() { return 'HS100-' + Math.floor(1000 + Math.random() * 9000); }

  function novoCadastro(dados) {
    var db = ler();
    var l = Object.assign({ id: uid('l'), criado: new Date().toISOString(), status: 'novo', origem: 'Site', cupom: gerarCupom() }, dados);
    l.whats = soDigitos(l.whats); if (l.whats.length <= 11) l.whats = '55' + l.whats;
    l.score = pontuar(l); l.temp = temperatura(l.score);
    db.leads.unshift(l); gravar(db);
    return l;
  }

  window.HSDB = {
    ler: ler, gravar: gravar, uid: uid, novoCadastro: novoCadastro, pontuar: pontuar, temperatura: temperatura,
    soDigitos: soDigitos,
    zerar: function () { try { localStorage.removeItem(CHAVE); } catch (e) {} return ler(); },
    dinheiro: function (v) { return v == null ? '' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); },
    wa: function (numero, msg) { return 'https://wa.me/' + soDigitos(numero) + '?text=' + encodeURIComponent(msg || ''); }
  };
})();
