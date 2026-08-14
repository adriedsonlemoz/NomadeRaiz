import { APP_VERSION } from '../config/app';
export const APP_VERSAO=APP_VERSION;
export const APP_ANO=2026;
export const PIX_CHAVE='adriedson@outlook.com';

export const CATEGORIES=[
 {id:'mobilidade',label:'Bike & Mobilidade',icon:'🚲'},
 {id:'abrigo',label:'Abrigo',icon:'🏕️'},
 {id:'cozinha',label:'Cozinha',icon:'🍳'},
 {id:'agua',label:'Água',icon:'💧'},
 {id:'energia',label:'Energia',icon:'⚡'},
 {id:'ferramentas',label:'Ferramentas',icon:'🧰'},
 {id:'seguranca',label:'Segurança',icon:'🦺'},
 {id:'vestuario',label:'Vestuário',icon:'👕'},
 {id:'higiene',label:'Higiene & Saúde',icon:'🩹'},
];
const seed=(id,name,categoryId,priority='medio',quantity=1,price=0,notes='')=>({id,name,categoryId,priority,quantity,price,notes,status:'pendente'});
export const SEED_ITEMS=[
 seed('camara','Câmara de ar reserva','mobilidade','urgente',2),seed('remendo','Kit de remendos','ferramentas','urgente',1),
 seed('bomba','Bomba de ar','ferramentas','urgente',1),seed('multitool','Multitool / jogo de chaves','ferramentas','urgente',1),
 seed('espátula','Espátulas de pneu','ferramentas','medio',2),seed('elo','Elo rápido da corrente','ferramentas','medio',2),
 seed('barraca','Barraca','abrigo','urgente',1),seed('isolante','Isolante térmico','abrigo','medio',1),seed('capa-chuva','Capa de chuva','vestuario','medio',1),
 seed('garrafa','Garrafa / reservatório de água','agua','urgente',2),seed('filtro-agua','Filtro ou purificador de água','agua','medio',1),
 seed('powerbank','Power bank','energia','medio',1),seed('painel-solar','Painel solar','energia','baixo',1),seed('lanterna','Lanterna','seguranca','urgente',1),
 seed('luz-bike','Luzes da bicicleta','seguranca','urgente',1),seed('colete','Colete refletivo','seguranca','urgente',1),seed('capacete','Capacete','seguranca','urgente',1),
 seed('primeiros-socorros','Kit de primeiros socorros','higiene','urgente',1),seed('fogareiro','Fogareiro','cozinha','medio',1),seed('panela','Panela/caneca','cozinha','baixo',1),
];
export const MINIMOS_SUGERIDOS={camara:1,remendo:1,elo:1,garrafa:1,'primeiros-socorros':1};

export const MODOS=[
 {id:'antes-sair',icon:'🎒',label:'Antes de sair',desc:'Itens essenciais antes de pegar a estrada',cor:'#2563eb'},
 {id:'chuva',icon:'🌧️',label:'Chuva',desc:'Preparação para pedalar e acampar molhado',cor:'#0e7490'},
 {id:'noite',icon:'🌙',label:'Noite',desc:'Iluminação, visibilidade e acampamento',cor:'#7c3aed'},
 {id:'manutencao',icon:'🔧',label:'Bike',desc:'Checagem rápida da bicicleta',cor:'#b45309'},
 {id:'emergencia',icon:'🆘',label:'Emergência',desc:'Documentos, saúde e comunicação',cor:'#dc2626'},
];
const check=(id,texto,dica='')=>({id,texto,dica});
export const VERIFICACOES={
 'antes-sair':{icon:'🎒',titulo:'Antes de sair',cor:'#2563eb',itens:[check('agua','Água abastecida','Saia com água suficiente até o próximo ponto seguro.'),check('luzes','Luzes e celular carregados'),check('pneus','Pressão dos pneus conferida'),check('freios','Freios funcionando'),check('documentos','Documentos e dinheiro protegidos')]},
 chuva:{icon:'🌧️',titulo:'Chuva',cor:'#0e7490',itens:[check('capa','Capa de chuva acessível'),check('eletronicos','Eletrônicos protegidos'),check('freios','Freios testados em baixa velocidade'),check('abrigo','Abrigo seco ou local de parada definido')]},
 noite:{icon:'🌙',titulo:'Noite',cor:'#7c3aed',itens:[check('farol','Farol dianteiro funcionando'),check('traseira','Luz traseira funcionando'),check('refletivos','Refletivos visíveis'),check('rota','Rota e local de descanso definidos')]},
 manutencao:{icon:'🔧',titulo:'Bike',cor:'#b45309',itens:[check('pneus','Pneus sem cortes ou objetos presos'),check('corrente','Corrente limpa e com tensão normal'),check('rodas','Rodas sem folga excessiva'),check('carga','Bagagem presa e equilibrada')]},
 emergencia:{icon:'🆘',titulo:'Emergência',cor:'#dc2626',itens:[check('socorros','Kit de primeiros socorros acessível'),check('contato','Contato de emergência disponível'),check('bateria','Reserva de bateria disponível'),check('localizacao','Alguém sabe sua rota aproximada')]},
};
export const MODOS_PERSISTENTES=new Set(['antes-sair','manutencao']);

export const CLIMAS=['☀️','⛅','☁️','🌧️','⛈️','🌬️'];
export const TIPOS_PONTO=[{id:'agua',icon:'💧',label:'Água'},{id:'mercado',icon:'🛒',label:'Mercado'},{id:'camping',icon:'⛺',label:'Camping'},{id:'saude',icon:'🏥',label:'Saúde'},{id:'oficina',icon:'🔧',label:'Oficina'},{id:'outro',icon:'📍',label:'Outro'}];
export const TIPOS_VIAGEM=[{id:'cicloviagem',icon:'🚲',label:'Cicloviagem'},{id:'camping',icon:'🏕️',label:'Camping'},{id:'bate-volta',icon:'🧭',label:'Bate-volta'},{id:'longa',icon:'🛣️',label:'Longa duração'}];
export const AUTONOMIA_TABS=[{id:'resumo',icon:'📊',label:'Resumo'},{id:'bike',icon:'🚲',label:'Bike'},{id:'comida',icon:'🍱',label:'Comida'},{id:'agua',icon:'💧',label:'Água'},{id:'energia',icon:'⚡',label:'Energia'},{id:'dinheiro',icon:'💰',label:'Dinheiro'},{id:'peso',icon:'⚖️',label:'Peso'},{id:'custo',icon:'🧾',label:'Custo'}];

export const ALIMENTOS_CONFIG=[
 {id:'arroz',nome:'Arroz',icone:'🍚',unidades:[{id:'kg',label:'kg',precoPadrao:7,consumoDiarioPadrao:.2}]},
 {id:'aveia',nome:'Aveia',icone:'🥣',unidades:[{id:'kg',label:'kg',precoPadrao:14,consumoDiarioPadrao:.12}]},
 {id:'macarrao',nome:'Macarrão',icone:'🍝',unidades:[{id:'pct',label:'pacote',precoPadrao:5,consumoDiarioPadrao:.5},{id:'kg',label:'kg',precoPadrao:10,consumoDiarioPadrao:.2}]},
 {id:'sardinha',nome:'Sardinha / proteína',icone:'🥫',unidades:[{id:'un',label:'un.',precoPadrao:7,consumoDiarioPadrao:1}]},
 {id:'castanhas',nome:'Castanhas / amendoim',icone:'🥜',unidades:[{id:'kg',label:'kg',precoPadrao:24,consumoDiarioPadrao:.1}]},
];

export const DICAS=[
 {id:'agua',icon:'💧',titulo:'Nunca dependa de um único ponto de água',texto:'Mantenha sempre uma pequena reserva e reabasteça antes de ficar no limite.'},
 {id:'peso',icon:'⚖️',titulo:'Menos peso significa mais autonomia',texto:'Revise a bagagem e elimine duplicações. Itens leves que resolvem vários problemas têm prioridade.'},
 {id:'carga',icon:'🎒',titulo:'Distribua a carga na bicicleta',texto:'Mantenha itens pesados baixos e equilibrados entre os lados para preservar dirigibilidade.'},
 {id:'chuva',icon:'🌧️',titulo:'Proteja primeiro eletrônicos e roupa seca',texto:'Sacos internos independentes funcionam como segunda barreira contra chuva e condensação.'},
 {id:'rota',icon:'🗺️',titulo:'Tenha rota offline',texto:'Baixe mapas e anote pontos importantes antes de ficar sem sinal.'},
];
export const CHANGELOG=[
 {versao:'1.0.6',data:'14/08/2026',mudancas:[
  'Planejamento, Diário de Campo e Pontos de Apoio migrados para TypeScript/TSX',
  'Formulários de diário e pontos agora usam contratos tipados compartilhados com o estado persistente',
  'Status do planejamento, tipos de viagem, clima, filtros de pontos e avaliações ganharam tipos explícitos',
  'Importação de backups agora normaliza clima, tipo de ponto e avaliação para valores válidos',
  'Proteções estruturais ampliadas; quantidade de arquivos JSX restante caiu de 16 para 10',
 ]},
 {versao:'1.0.5',data:'14/08/2026',mudancas:[
  'Calculadora e Equipamentos migrados de JSX/JavaScript para TypeScript/TSX',
  'Formulários, propriedades e eventos dessas telas agora possuem contratos de tipos explícitos',
  'Totais de equipamentos e cálculos de alimentação foram centralizados nos services, removendo lógica duplicada da interface',
  'Proteções estruturais ampliadas; quantidade de arquivos JSX restante caiu de 32 para 16',
 ]},
 {versao:'1.0.4',data:'14/08/2026',mudancas:[
  'Extras, Dicas, Exportação e Sobre migrados de JSX para TypeScript/TSX',
  'Modais de dica, apoio e contato agora possuem contratos de propriedades explícitos',
  'Fluxos de backup/importação e QR Code ganharam tipagem sem alterar o comportamento existente',
  'Proteções estruturais ampliadas para impedir o retorno de páginas JSX já migradas',
 ]},
 {versao:'1.0.3',data:'14/08/2026',mudancas:[
  'Base compartilhada da interface migrada de JSX para TypeScript/TSX',
  'App, layouts, hooks e componentes comuns agora possuem contratos de tipos explícitos',
  'Barrels de componentes e layouts migrados para TypeScript com exportação de tipos públicos',
  'Migração preparada para continuar pelas páginas de negócio sem alterar o comportamento atual',
 ]},
 {versao:'1.0.2',data:'11/08/2026',mudancas:[
  'Identidade visual e nome padronizados como Nomade Raiz em todo o app',
  'Página Sobre renovada com versão atual, tecnologias e histórico de mudanças',
  'Ícones em marca-d’água restaurados nos quadros de verificações da tela inicial',
  'README, .gitignore e metadados do GitHub adicionados e padronizados',
  'Checagem automática garante que versão, README e changelogs permaneçam sincronizados',
 ]},
 {versao:'1.0.1',data:'11/08/2026',mudancas:[
  'IndexedDB com Dexie e migração automática',
  'Backup completo e versionado',
  'Versão do app sincronizada com package.json',
  'Componentes visuais básicos e checagens estruturais',
 ]},
 {versao:'1.0.0',data:'11/08/2026',mudancas:[
  'Checklist de equipamentos e verificações rápidas',
  'Planejamento de autonomia',
  'Manual da bicicleta e diário de campo',
  'Funcionamento offline no navegador',
 ]},
];

export const AREAS_BIKE=[{id:'rodas',icone:'🛞',label:'Rodas e pneus'},{id:'transmissao',icone:'⛓️',label:'Transmissão'},{id:'freios',icone:'🛑',label:'Freios'},{id:'estrutura',icone:'🚲',label:'Estrutura'}];
const peca=(id,area,icone,nome,nivel,funcao,problemasComuns,manutencao,comoResolver)=>({id,area,icone,nome,nivel,funcao,problemasComuns,manutencao,comoResolver});
export const PECAS_BIKE=[
 peca('pneu','rodas','🛞','Pneu','basico','Faz contato com o solo e absorve parte das irregularidades.',['Furo','Corte','Baixa pressão'],'Inspecione cortes e calibre regularmente.',['Remova a roda se necessário.','Use espátulas para retirar um lado do pneu.','Repare/troque a câmara e remonte sem beliscar.']),
 peca('camara','rodas','⭕','Câmara de ar','basico','Mantém o pneu inflado.',['Furo','Válvula danificada'],'Carregue ao menos uma reserva.',['Localize o furo.','Aplique remendo ou substitua a câmara.','Confira o interior do pneu antes de montar.']),
 peca('corrente','transmissao','⛓️','Corrente','intermediario','Transmite a força dos pedais para a roda.',['Corrente seca','Elo quebrado','Queda da corrente'],'Limpe e lubrifique sem excesso.',['Remova o elo danificado.','Instale um elo rápido compatível.','Teste as marchas com a roda suspensa.']),
 peca('cambio','transmissao','⚙️','Câmbio traseiro','intermediario','Move a corrente entre os pinhões.',['Marcha pulando','Câmbio desalinhado'],'Evite pancadas e confira a gancheira.',['Cheque cabo e gancheira.','Ajuste tensão do cabo em pequenos passos.','Teste todos os pinhões.']),
 peca('vbrake','freios','🛑','V-brake','basico','Reduz a velocidade pressionando sapatas contra o aro.',['Sapata pegando','Freio fraco'],'Mantenha aro e sapatas limpos.',['Centralize os braços.','Alinhe as sapatas no aro.','Ajuste a tensão do cabo.']),
 peca('movimento','estrutura','🔩','Movimento central','avancado','Permite a rotação do pedivela.',['Estalo','Folga','Rolamento áspero'],'Evite lavagem com jato direto.',['Confirme se a folga vem do pedivela.','Aperte conforme o sistema.','Substitua o movimento se houver dano interno.']),
];
export const PROBLEMAS_ESTRADA=[
 {id:'furo',icone:'🛞',nome:'Pneu furado',causas:['Espinho ou vidro','Baixa pressão','Câmara beliscada'],ferramentas:['Espátulas','Bomba','Remendo ou câmara'],solucaoTemporaria:'Troque a câmara ou aplique um remendo e calibre com pressão moderada.',solucaoDefinitiva:'Retire o objeto causador, confira a fita de aro e substitua componentes danificados.'},
 {id:'corrente-quebrou',icone:'⛓️',nome:'Corrente quebrou',causas:['Desgaste','Troca de marcha sob carga','Elo danificado'],ferramentas:['Multitool com extrator','Elo rápido'],solucaoTemporaria:'Remova o elo danificado e feche a corrente com elo rápido compatível.',solucaoDefinitiva:'Avalie desgaste da corrente e relação; substitua se necessário.'},
 {id:'freio-pegando',icone:'🛑',nome:'Freio pegando',causas:['Roda desalinhada','Freio descentrado','Sapata fora de posição'],ferramentas:['Chave Allen','Chave de fenda'],solucaoTemporaria:'Centralize o freio ou alivie levemente o cabo para liberar a roda.',solucaoDefinitiva:'Alinhe roda e sapatas e faça regulagem completa.'},
 {id:'parafuso-solto',icone:'🔩',nome:'Parafuso soltando',causas:['Vibração','Torque inadequado'],ferramentas:['Multitool'],solucaoTemporaria:'Reaperte com cuidado, sem exceder o torque.',solucaoDefinitiva:'Revise rosca, arruelas e aplique trava-rosca apropriado quando indicado.'},
];
export const GLOSSARIO_BIKE=[{id:'cassete',termo:'Cassete',definicao:'Conjunto de pinhões na roda traseira.'},{id:'gancheira',termo:'Gancheira',definicao:'Peça que liga o câmbio traseiro ao quadro.'},{id:'pedivela',termo:'Pedivela',definicao:'Conjunto das alavancas onde os pedais são instalados.'},{id:'movimento-central',termo:'Movimento central',definicao:'Rolamentos/eixo que permitem o pedivela girar no quadro.'},{id:'talão',termo:'Talão do pneu',definicao:'Borda do pneu que encaixa no aro.'}];
export const KIT_MINIMO_FERRAMENTAS=[{id:'bomba',icone:'💨',nome:'Bomba de ar',motivo:'Recuperar pressão após remendo ou troca de câmara.'},{id:'remendo',icone:'🩹',nome:'Kit de remendos',motivo:'Reparar furos sem gastar a câmara reserva.'},{id:'multitool',icone:'🔧',nome:'Multitool',motivo:'Apertos e regulagens básicas na estrada.'},{id:'espátula',icone:'🪛',nome:'Espátulas de pneu',motivo:'Facilitam a retirada do pneu.'},{id:'elo',icone:'⛓️',nome:'Elo rápido',motivo:'Recuperar uma corrente quebrada.'}];
export const KIT_FERRAMENTA_PARA_ITEM={bomba:'bomba',remendo:'remendo',multitool:'multitool',espátula:'espátula',elo:'elo'};
export const EQUIPAMENTOS_SEGURANCA_IDS=['capacete','luz-bike','colete','primeiros-socorros'];
export const EQUIPAMENTO_PARA_MANUAL={camara:{tipo:'peca',id:'camara'},remendo:{tipo:'problema',id:'furo'},multitool:{tipo:'peca',id:'corrente'},bomba:{tipo:'peca',id:'pneu'}};
