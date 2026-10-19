/* =====================================================================
   HS · Assistência e loja Apple — configuração e catálogo
   Único arquivo a editar para trocar contatos, preços e estoque.
   PREÇOS E ESTOQUE SÃO DE DEMONSTRAÇÃO. O único preço confirmado é a
   troca de tela do iPhone XR/11 por R$ 199,99 (post de 11/08/2026).
   ===================================================================== */

window.HS = {

  nome: 'HS',
  assinatura: 'Assistência e loja Apple',
  instagram: 'hsacessorios_oficial',

  whats: {
    vendas:     { numero: '5571988205258', visivel: '(71) 98820-5258', rotulo: 'iPhones e acessórios' },
    assistencia:{ numero: '5571993794078', visivel: '(71) 99379-4078', rotulo: 'Assistência técnica' }
  },

  endereco: {
    rua: 'Rua Sérgio de Carvalho, 28 · Loja 06',
    ref: 'Galeria Tenaz (Ed. Ônix)',
    bairro: 'Federação · Salvador-BA · 40230-680',
    maps: 'https://www.google.com/maps/search/?api=1&query=Rua+S%C3%A9rgio+de+Carvalho+28+Federa%C3%A7%C3%A3o+Salvador',
    embed: 'https://maps.google.com/maps?q=Rua%20S%C3%A9rgio%20de%20Carvalho%2028%20Federa%C3%A7%C3%A3o%20Salvador&output=embed'
  },

  // A CONFIRMAR: sábado vem de um destaque antigo.
  horario: [['Segunda a sexta', '9h às 18h'], ['Sábado', '9h às 13h'], ['Domingo', 'Fechado']],

  numeros: { anos: 10, consertos: '10 mil', notaGoogle: '4,6', avaliacoes: 56, seguidores: '16 mil' },

  desconto: 100,
  validadeCupomDias: 7,
  garantiaServicoDias: 90,     // CDC, art. 26 — serviço em produto durável
  garantiaSeminovoMeses: 6,    // A CONFIRMAR com a HS
  parcelasMax: 12,
  jurosParcela: 0.0249,        // A CONFIRMAR: taxa repassada na maquininha

  /* ---- Linhas de iPhone (fichas técnicas oficiais da Apple) ---------- */
  linhas: {
    'iPhone 11':         { ano: 2019, tela: '6,1" Liquid Retina (LCD)', chip: 'A13 Bionic', cameras: 2, cam: 'Dupla 12 MP (grande-angular e ultra-angular)', conector: 'Lightning', g5: false, magsafe: false, island: false, hz: 60, extra: 'Modo Noite' },
    'iPhone 12':         { ano: 2020, tela: '6,1" Super Retina XDR (OLED)', chip: 'A14 Bionic', cameras: 2, cam: 'Dupla 12 MP', conector: 'Lightning', g5: true, magsafe: true, island: false, hz: 60, extra: 'Ceramic Shield' },
    'iPhone 12 Pro Max': { ano: 2020, tela: '6,7" Super Retina XDR (OLED)', chip: 'A14 Bionic', cameras: 3, cam: 'Tripla 12 MP + LiDAR', conector: 'Lightning', g5: true, magsafe: true, island: false, hz: 60, extra: 'ProRAW', pro: true },
    'iPhone 13':         { ano: 2021, tela: '6,1" Super Retina XDR (OLED)', chip: 'A15 Bionic', cameras: 2, cam: 'Dupla 12 MP', conector: 'Lightning', g5: true, magsafe: true, island: false, hz: 60, extra: 'Modo Cinema' },
    'iPhone 13 Pro Max': { ano: 2021, tela: '6,7" Super Retina XDR com ProMotion', chip: 'A15 Bionic', cameras: 3, cam: 'Tripla 12 MP + LiDAR', conector: 'Lightning', g5: true, magsafe: true, island: false, hz: 120, extra: 'Macro', pro: true },
    'iPhone 14':         { ano: 2022, tela: '6,1" Super Retina XDR (OLED)', chip: 'A15 Bionic', cameras: 2, cam: 'Dupla 12 MP', conector: 'Lightning', g5: true, magsafe: true, island: false, hz: 60, extra: 'Detecção de acidente' },
    'iPhone 14 Pro Max': { ano: 2022, tela: '6,7" com ProMotion e Sempre Ativa', chip: 'A16 Bionic', cameras: 3, cam: 'Principal 48 MP + ultra + tele 3x', conector: 'Lightning', g5: true, magsafe: true, island: true, hz: 120, extra: 'Dynamic Island', pro: true },
    'iPhone 15':         { ano: 2023, tela: '6,1" Super Retina XDR (OLED)', chip: 'A16 Bionic', cameras: 2, cam: 'Principal 48 MP + ultra', conector: 'USB-C', g5: true, magsafe: true, island: true, hz: 60, extra: 'Dynamic Island' },
    'iPhone 15 Pro':     { ano: 2023, tela: '6,1" com ProMotion e Sempre Ativa', chip: 'A17 Pro', cameras: 3, cam: 'Principal 48 MP + ultra + tele 3x', conector: 'USB-C (USB 3)', g5: true, magsafe: true, island: true, hz: 120, extra: 'Titânio e botão de Ação', pro: true },
    'iPhone 15 Pro Max': { ano: 2023, tela: '6,7" com ProMotion e Sempre Ativa', chip: 'A17 Pro', cameras: 3, cam: 'Principal 48 MP + ultra + tele 5x', conector: 'USB-C (USB 3)', g5: true, magsafe: true, island: true, hz: 120, extra: 'Titânio e botão de Ação', pro: true },
    'iPhone 16':         { ano: 2024, tela: '6,1" Super Retina XDR (OLED)', chip: 'A18', cameras: 2, cam: 'Fusion 48 MP + ultra', conector: 'USB-C', g5: true, magsafe: true, island: true, hz: 60, extra: 'Controle da Câmera' },
    'iPhone 16 Pro':     { ano: 2024, tela: '6,3" com ProMotion e Sempre Ativa', chip: 'A18 Pro', cameras: 3, cam: 'Fusion 48 MP + ultra 48 MP + tele 5x', conector: 'USB-C (USB 3)', g5: true, magsafe: true, island: true, hz: 120, extra: 'Controle da Câmera', pro: true },
    'iPhone 16 Pro Max': { ano: 2024, tela: '6,9" com ProMotion e Sempre Ativa', chip: 'A18 Pro', cameras: 3, cam: 'Fusion 48 MP + ultra 48 MP + tele 5x', conector: 'USB-C (USB 3)', g5: true, magsafe: true, island: true, hz: 120, extra: 'Controle da Câmera', pro: true },
    'iPhone 17 Pro Max': { ano: 2025, tela: '6,9" com ProMotion e Sempre Ativa', chip: 'A19 Pro', cameras: 3, cam: 'Três câmeras Fusion 48 MP (tele 4x)', conector: 'USB-C (USB 3)', g5: true, magsafe: true, island: true, hz: 120, extra: 'Corpo em alumínio unibody', pro: true }
  },

  cores: {
    'Preto': '#1d1d1f', 'Branco': '#f1efe9', 'Azul': '#3d5a80', 'Azul-pacífico': '#2f4f63', 'Grafite': '#4a4a4c',
    'Meia-noite': '#232a31', 'Estelar': '#efe6da', 'Roxo': '#b9a6d3', 'Rosa': '#f2c9cf', 'Verde': '#a7c0a2',
    'Titânio natural': '#b8b2a7', 'Titânio preto': '#3a3a3c', 'Titânio deserto': '#c8ad8f', 'Laranja-cósmico': '#d9773b', 'Dourado': '#e6d2b0', 'Vermelho': '#b0212c'
  },

  /* ---- Seminovos à venda (ESTOQUE DE DEMONSTRAÇÃO) ------------------ */
  // condicao: 'vitrine' (sem marcas) · 'excelente' (marcas mínimas) · 'muito-bom' (marcas leves)
  aparelhos: [
    { id: 'i17pm-256-laranja', modelo: 'iPhone 17 Pro Max', gb: 256, cor: 'Laranja-cósmico', condicao: 'vitrine',  bateria: 100, preco: 9899, selo: 'Lançamento' },
    { id: 'i16pm-256-deserto', modelo: 'iPhone 16 Pro Max', gb: 256, cor: 'Titânio deserto', condicao: 'excelente', bateria: 94, preco: 7299, selo: 'Mais procurado' },
    { id: 'i16p-128-preto',    modelo: 'iPhone 16 Pro',     gb: 128, cor: 'Titânio preto',   condicao: 'excelente', bateria: 96, preco: 6299 },
    { id: 'i16-128-verde',     modelo: 'iPhone 16',         gb: 128, cor: 'Verde',           condicao: 'vitrine',  bateria: 100, preco: 4999 },
    { id: 'i15pm-256-natural', modelo: 'iPhone 15 Pro Max', gb: 256, cor: 'Titânio natural', condicao: 'excelente', bateria: 90, preco: 5999 },
    { id: 'i15p-128-preto',    modelo: 'iPhone 15 Pro',     gb: 128, cor: 'Titânio preto',   condicao: 'muito-bom', bateria: 88, preco: 4699 },
    { id: 'i15-128-rosa',      modelo: 'iPhone 15',         gb: 128, cor: 'Rosa',            condicao: 'excelente', bateria: 91, preco: 3899 },
    { id: 'i14pm-256-roxo',    modelo: 'iPhone 14 Pro Max', gb: 256, cor: 'Roxo',            condicao: 'excelente', bateria: 87, preco: 4599 },
    { id: 'i14-128-meia',      modelo: 'iPhone 14',         gb: 128, cor: 'Meia-noite',      condicao: 'muito-bom', bateria: 86, preco: 2999 },
    { id: 'i13pm-128-azul',    modelo: 'iPhone 13 Pro Max', gb: 128, cor: 'Azul',            condicao: 'muito-bom', bateria: 85, preco: 3599 },
    { id: 'i13-128-estelar',   modelo: 'iPhone 13',         gb: 128, cor: 'Estelar',         condicao: 'excelente', bateria: 90, preco: 2699, selo: 'Primeiro iPhone' },
    { id: 'i12-128-azul',      modelo: 'iPhone 12',         gb: 128, cor: 'Azul',            condicao: 'muito-bom', bateria: 86, preco: 1999 },
    { id: 'i12pm-256-grafite', modelo: 'iPhone 12 Pro Max', gb: 256, cor: 'Grafite',         condicao: 'muito-bom', bateria: 84, preco: 2899 },
    { id: 'i11-64-branco',     modelo: 'iPhone 11',         gb: 64,  cor: 'Branco',          condicao: 'excelente', bateria: 88, preco: 1599, selo: 'Menor preço' }
  ],

  condicoes: {
    'vitrine':   { nome: 'Vitrine',   resumo: 'Sem marcas de uso. Parece novo.' },
    'excelente': { nome: 'Excelente', resumo: 'Marcas mínimas, só visíveis de perto.' },
    'muito-bom': { nome: 'Muito bom', resumo: 'Marcas leves de uso na lateral ou na tela.' }
  },

  /* ---- Assistência: tabela por modelo (VALORES DE DEMONSTRAÇÃO) ----- */
  servicos: [
    { id: 'tela',    nome: 'Troca de tela',            prazo: 'no mesmo dia', icone: 'tela' },
    { id: 'bateria', nome: 'Troca de bateria',         prazo: 'em até 1 hora', icone: 'bateria' },
    { id: 'traseira',nome: 'Vidro traseiro',           prazo: 'em até 24 horas', icone: 'traseira' },
    { id: 'camera',  nome: 'Câmera traseira',          prazo: 'no mesmo dia', icone: 'camera' },
    { id: 'conector',nome: 'Conector de carga',        prazo: 'em até 2 horas', icone: 'conector' },
    { id: 'faceid',  nome: 'Face ID',                  prazo: 'em até 3 dias úteis', icone: 'faceid' },
    { id: 'placa',   nome: 'Reparo em placa',          prazo: 'após diagnóstico', icone: 'placa' },
    { id: 'agua',    nome: 'Contato com líquido',      prazo: 'após diagnóstico', icone: 'agua' }
  ],
  modelosAssistencia: ['iPhone 17 Pro Max','iPhone 17 Pro','iPhone 17','iPhone 16 Pro Max','iPhone 16 Pro','iPhone 16','iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15',
    'iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14','iPhone 13 Pro Max','iPhone 13 Pro','iPhone 13','iPhone 12 Pro Max','iPhone 12','iPhone 11 Pro Max','iPhone 11','iPhone XR','iPhone XS Max','iPhone X','iPhone SE (2ª/3ª ger.)','iPhone 8 / 8 Plus'],

  // tabela-base de demonstração por geração; 'XR/11 tela' é o preço real da promoção
  precoServico: function (modelo, servico) {
    if ((modelo === 'iPhone XR' || modelo === 'iPhone 11') && servico === 'tela') return { valor: 199.99, promo: true };
    if (servico === 'placa' || servico === 'agua') return { valor: null };
    var g = (modelo.match(/iPhone (\d+)/) || [0, 9])[1] | 0;
    if (/XR|XS|X$|SE|8/.test(modelo)) g = 9;
    var pro = /Pro/.test(modelo), max = /Max|Plus/.test(modelo);
    var base = { tela: 260, bateria: 180, traseira: 220, camera: 240, conector: 170, faceid: 380 }[servico];
    var fator = 1 + Math.max(0, g - 9) * 0.32 + (pro ? 0.28 : 0) + (max ? 0.12 : 0);
    return { valor: Math.round(base * fator / 10) * 10 - 0.01 };
  },

  /* ---- Avaliação de troca (TABELA DE DEMONSTRAÇÃO) ------------------- */
  // valor de entrada para aparelho em bom estado, bateria ≥ 85%, 128 GB
  troca: {
    'iPhone 17 Pro Max': 6900, 'iPhone 17 Pro': 6000, 'iPhone Air': 5200, 'iPhone 17': 4300,
    'iPhone 16 Pro Max': 5000, 'iPhone 16 Pro': 4300, 'iPhone 16 Plus': 3500, 'iPhone 16': 3200, 'iPhone 16e': 2600,
    'iPhone 15 Pro Max': 3900, 'iPhone 15 Pro': 3300, 'iPhone 15 Plus': 2700, 'iPhone 15': 2400,
    'iPhone 14 Pro Max': 3000, 'iPhone 14 Pro': 2600, 'iPhone 14 Plus': 2000, 'iPhone 14': 1800,
    'iPhone 13 Pro Max': 2300, 'iPhone 13 Pro': 2000, 'iPhone 13': 1500, 'iPhone 13 mini': 1200,
    'iPhone 12 Pro Max': 1700, 'iPhone 12 Pro': 1450, 'iPhone 12': 1100, 'iPhone 12 mini': 850,
    'iPhone 11 Pro Max': 1150, 'iPhone 11 Pro': 950, 'iPhone 11': 800, 'iPhone XR': 550, 'iPhone XS / XS Max': 600, 'iPhone SE': 450
  },
  trocaAjustes: {
    gb: { 64: -0.06, 128: 0, 256: 0.08, 512: 0.14, 1024: 0.2 },
    estado: { perfeito: 0.05, bom: 0, marcas: -0.12, trincado: -0.35 },
    bateria: { alta: 0, media: -0.08, baixa: -0.15 }
  },

  acessorios: [
    { id: 'magsafe-clear', cat: 'capas', nome: 'Capa MagSafe transparente', det: 'Anel magnético, cantos reforçados', preco: 10, promo: true, img: 'capa-azul.png', compat: 'iPhone 11 ao 17' },
    { id: 'silicone-coracao', cat: 'capas', nome: 'Capa de silicone corações', det: 'Toque macio, várias cores', preco: 39.9, img: 'capas-coracao.png', compat: 'iPhone 11 ao 16' },
    { id: 'capa-couro', cat: 'capas', nome: 'Capa couro sintético MagSafe', det: 'Acabamento premium', preco: 89.9, compat: 'iPhone 13 ao 17' },
    { id: 'pelicula-3d', cat: 'peliculas', nome: 'Película de vidro 3D', det: 'Cobre a tela toda · aplicação grátis', preco: 35, compat: 'Todos os modelos' },
    { id: 'pelicula-priv', cat: 'peliculas', nome: 'Película de privacidade', det: 'Ninguém lê sua tela de lado', preco: 59.9, compat: 'Todos os modelos' },
    { id: 'pelicula-camera', cat: 'peliculas', nome: 'Protetor de câmera', det: 'Lente em vidro temperado', preco: 29.9, compat: 'iPhone 11 ao 17' },
    { id: 'fonte-20w', cat: 'energia', nome: 'Fonte USB-C 20W', det: 'Carga rápida: 50% em ~30 min', preco: 89, compat: 'iPhone 8 em diante' },
    { id: 'cabo-c', cat: 'energia', nome: 'Cabo USB-C 1 m', det: 'Trançado, reforçado', preco: 39, compat: 'iPhone 15 em diante' },
    { id: 'cabo-l', cat: 'energia', nome: 'Cabo USB-C para Lightning', det: 'Para iPhone até o 14', preco: 45, compat: 'iPhone 8 ao 14' },
    { id: 'powerbank', cat: 'energia', nome: 'Carregador portátil 10.000 mAh', det: 'MagSafe · cerca de 2 cargas completas', preco: 149, compat: 'iPhone 12 em diante' },
    { id: 'caixa-som', cat: 'audio', nome: 'Caixa de som Bluetooth', det: 'À prova d’água, 12 h de bateria', preco: 179, compat: 'Qualquer celular' },
    { id: 'fone-bt', cat: 'audio', nome: 'Fone Bluetooth in-ear', det: 'Estojo com carga, cancelamento passivo', preco: 129, compat: 'Qualquer celular' }
  ],
  categoriasAcessorios: { capas: 'Capas', peliculas: 'Películas', energia: 'Carregadores e cabos', audio: 'Áudio' },

  supabaseUrl: '',
  supabaseKey: ''
};
