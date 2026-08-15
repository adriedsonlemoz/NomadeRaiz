import type { BikeGlossaryTerm, BikePiece, BikeProblem } from '../../types';

interface Props {
  busca: string;
  pecas: readonly BikePiece[];
  problemas: readonly BikeProblem[];
  termos: readonly BikeGlossaryTerm[];
  onPiece: (piece: BikePiece) => void;
  onProblem: (problem: BikeProblem) => void;
}

export function ManualSearchResults({ busca, pecas, problemas, termos, onPiece, onProblem }: Props) {
  return <>
    {pecas.length > 0 && <div className="nr-content-card"><p className="nr-kicker nr-kicker--inline"><span>🔧</span>Peças</p><div className="nr14-14b4b58a">{pecas.map(piece => <button key={piece.id} onClick={()=>onPiece(piece)} className="nr14-83b61668"><span className="nr14-1444c6ea">{piece.icone}</span><span className="nr14-27cafde6">{piece.nome}</span></button>)}</div></div>}
    {problemas.length > 0 && <div className="nr-content-card"><p className="nr-kicker nr-kicker--inline"><span>🛠️</span>Problemas na Estrada</p><div className="nr14-14b4b58a">{problemas.map(problem => <button key={problem.id} onClick={()=>onProblem(problem)} className="nr14-2a009a80"><span className="nr14-1444c6ea">{problem.icone}</span><span className="nr14-27cafde6">{problem.nome}</span></button>)}</div></div>}
    {termos.length > 0 && <div className="nr-content-card"><p className="nr-kicker nr-kicker--inline"><span>📖</span>Glossário</p><div className="nr14-a56c85e3">{termos.map(term => <div key={term.id}><p className="nr14-7a890bdd">{term.termo}</p><p className="nr14-372251a3">{term.definicao}</p></div>)}</div></div>}
    {!pecas.length && !problemas.length && !termos.length && <p className="nr14-ff232a15">Nada encontrado para "{busca}".</p>}
  </>;
}
