export const MODOS=[
 {id:'antes-sair',icon:'🎒',label:'Antes de sair',desc:'Itens essenciais antes de pegar a estrada',cor:'#2563eb'},
 {id:'chuva',icon:'🌧️',label:'Chuva',desc:'Preparação para pedalar e acampar molhado',cor:'#0e7490'},
 {id:'noite',icon:'🌙',label:'Noite',desc:'Iluminação, visibilidade e acampamento',cor:'#7c3aed'},
 {id:'manutencao',icon:'🔧',label:'Bike',desc:'Checagem rápida da bicicleta',cor:'#b45309'},
 {id:'emergencia',icon:'🆘',label:'Emergência',desc:'Documentos, saúde e comunicação',cor:'#dc2626'},
];
const check=(id:string,texto:string,dica='')=>({id,texto,dica});
export const VERIFICACOES={
 'antes-sair':{icon:'🎒',titulo:'Antes de sair',cor:'#2563eb',itens:[check('agua','Água abastecida','Saia com água suficiente até o próximo ponto seguro.'),check('luzes','Luzes e celular carregados'),check('pneus','Pressão dos pneus conferida'),check('freios','Freios funcionando'),check('documentos','Documentos e dinheiro protegidos')]},
 chuva:{icon:'🌧️',titulo:'Chuva',cor:'#0e7490',itens:[check('capa','Capa de chuva acessível'),check('eletronicos','Eletrônicos protegidos'),check('freios','Freios testados em baixa velocidade'),check('abrigo','Abrigo seco ou local de parada definido')]},
 noite:{icon:'🌙',titulo:'Noite',cor:'#7c3aed',itens:[check('farol','Farol dianteiro funcionando'),check('traseira','Luz traseira funcionando'),check('refletivos','Refletivos visíveis'),check('rota','Rota e local de descanso definidos')]},
 manutencao:{icon:'🔧',titulo:'Bike',cor:'#b45309',itens:[check('pneus','Pneus sem cortes ou objetos presos'),check('corrente','Corrente limpa e com tensão normal'),check('rodas','Rodas sem folga excessiva'),check('carga','Bagagem presa e equilibrada')]},
 emergencia:{icon:'🆘',titulo:'Emergência',cor:'#dc2626',itens:[check('socorros','Kit de primeiros socorros acessível'),check('contato','Contato de emergência disponível'),check('bateria','Reserva de bateria disponível'),check('localizacao','Alguém sabe sua rota aproximada')]},
};
export const MODOS_PERSISTENTES=new Set(['antes-sair','manutencao']);

