/* =====================================================================
   HS · Assistência Apple — configuração
   Único arquivo a editar para trocar contatos, preços e catálogo.
   ===================================================================== */

window.HS = {

  nome:   'HS',
  slogan: 'Assistência e loja Apple na Federação',
  instagram: 'hsacessorios_oficial',

  // WhatsApp do link da bio, conferido em 16/10/2026.
  whats: {
    acessorios: { numero: '5571988205258', visivel: '(71) 98820-5258' },
    manutencao: { numero: '5571993794078', visivel: '(71) 99379-4078' }
  },

  endereco: {
    linha1: 'Rua Sérgio de Carvalho, 28 · Loja 06',
    linha2: 'Galeria Tenaz (Ed. Ônix) · Federação, Salvador-BA',
    maps:   'https://www.google.com/maps/search/?api=1&query=Rua+S%C3%A9rgio+de+Carvalho+28+Federa%C3%A7%C3%A3o+Salvador'
  },

  // A CONFIRMAR: o horário de sábado vem de um destaque antigo.
  horario: [['Seg a sex', '9h às 18h'], ['Sábado', '9h às 13h']],

  // Desconto dado a quem se cadastra (o preço de vitrine já embute esse valor).
  desconto: 100,
  validadeCupomDias: 7,

  // Lista usada no cadastro e no CRM.
  modelos: [
    'iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone Air', 'iPhone 17',
    'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16', 'iPhone 16e',
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini',
    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini',
    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
    'iPhone XR', 'iPhone XS / XS Max', 'iPhone X', 'iPhone SE',
    'iPhone 8 ou anterior', 'Android'
  ],

  /* ---- Vitrine -------------------------------------------------------
     PREÇOS DE EXEMPLO: trocar pela tabela real da HS antes de publicar.
     O único preço confirmado é a tela do XR/11 (post de 11/08/2026).
  -------------------------------------------------------------------- */
  aparelhos: [
    { modelo: 'iPhone 16 Pro Max', det: '256 GB · seminovo · bateria 92%',  preco: 7299, selo: 'Mais procurado' },
    { modelo: 'iPhone 15 Pro',     det: '128 GB · seminovo · bateria 89%',  preco: 4899 },
    { modelo: 'iPhone 14 Pro Max', det: '256 GB · seminovo · bateria 87%',  preco: 4599 },
    { modelo: 'iPhone 13',         det: '128 GB · seminovo · bateria 90%',  preco: 2699, selo: 'Primeiro iPhone' },
    { modelo: 'iPhone 12',         det: '128 GB · seminovo · bateria 86%',  preco: 1999 },
    { modelo: 'iPhone 11',         det: '64 GB · seminovo · bateria 88%',   preco: 1599 }
  ],

  servicos: [
    { nome: 'Troca de tela',            det: 'iPhone XR e 11', preco: 199.99, promo: true },
    { nome: 'Troca de bateria',         det: 'Todos os modelos', preco: null },
    { nome: 'Face ID e biometria',      det: 'Reparo em placa', preco: null },
    { nome: 'Conector de carga',        det: 'Não carrega ou carrega mal', preco: null },
    { nome: 'Câmera e vidro traseiro',  det: 'Todos os modelos', preco: null },
    { nome: 'Reparo em placa',          det: 'Defeitos crônicos, não liga', preco: null }
  ],

  acessorios: [
    { nome: 'Capa MagSafe transparente', det: 'Várias cores', preco: 10, img: 'img/capa-azul.png', promo: true },
    { nome: 'Capas de silicone',         det: 'Coleção corações', preco: null, img: 'img/capas-coracao.png' },
    { nome: 'Carregador portátil 10.000 mAh', det: 'Até 2 cargas no Pro Max', preco: null, img: null },
    { nome: 'Películas',                 det: 'Vidro 3D e privacidade', preco: null, img: null }
  ],

  // Enquanto vazio, roda em MODO DEMONSTRAÇÃO (dados só no navegador).
  supabaseUrl: '',
  supabaseKey: ''
};
