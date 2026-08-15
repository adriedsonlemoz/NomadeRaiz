import {
  AREAS_BIKE,
  GLOSSARIO_BIKE,
  KIT_MINIMO_FERRAMENTAS,
  PECAS_BIKE,
  PROBLEMAS_ESTRADA,
} from '../../constants/manualBike';
import type { BikePiece, BikeProblem } from '../../types';
import type { TrackedTool } from './useManualBikeData';

interface Props {
  habilidades: string[];
  kitComStatus: TrackedTool[];
  kitPossui: number;
  kitRastreado: number;
  onPiece: (piece: BikePiece) => void;
  onProblem: (problem: BikeProblem) => void;
  onGlossary: () => void;
}

const levelIcon = (level: BikePiece['nivel']) => level === 'basico' ? '🟢' : level === 'intermediario' ? '🟡' : '🔴';

export function ManualOverview({ habilidades, kitComStatus, kitPossui, kitRastreado, onPiece, onProblem, onGlossary }: Props) {
  return <>
    {AREAS_BIKE.map(area => <div key={area.id} className="nr-content-card">
      <p className="nr-kicker nr-kicker--inline"><span>{area.icone}</span>{area.label}</p>
      <div className="nr14-154d3a4a">
        {PECAS_BIKE.filter(piece => piece.area === area.id).map(piece => {
          const domina = habilidades.includes(`peca:${piece.id}`);
          return <button key={piece.id} onClick={()=>onPiece(piece)} className="nr14-9dc12c95">
            {domina && <span className="nr14-1ddf32ab">✅</span>}
            <span className="nr14-b9199e22">{piece.icone}</span><span className="nr14-0d11d303">{piece.nome}</span><span className="nr14-fb2957a3">{levelIcon(piece.nivel)}</span>
          </button>;
        })}
      </div>
    </div>)}

    <div className="nr-content-card"><p className="nr-kicker nr-kicker--inline"><span>🛠️</span>Problemas na Estrada</p><div className="nr14-52b85aca">{PROBLEMAS_ESTRADA.map(problem => {
      const domina = habilidades.includes(`problema:${problem.id}`);
      return <button key={problem.id} onClick={()=>onProblem(problem)} className="nr14-2bdd60b0"><span className="nr14-ab31c751">{problem.icone}</span><span className="nr14-73d30916">{problem.nome}</span>{domina && <span className="nr14-cf2935d4">✅</span>}</button>;
    })}</div></div>

    <button onClick={onGlossary} className="nr-content-card nr-manual-glossary-card"><span className="nr14-b9199e22">📖</span><div className="nr14-5cdd8f67"><p className="nr14-61833899">Glossário de Termos</p><p className="nr14-898c52fb">{GLOSSARIO_BIKE.length} termos técnicos explicados de forma simples</p></div></button>

    <div className="nr-content-card"><p className="nr-kicker nr-kicker--inline"><span>🧰</span>Kit Mínimo de Ferramentas</p><div className="nr14-f0a2bbc1">{KIT_MINIMO_FERRAMENTAS.map(tool => <div key={tool.id} className="nr14-0bc9a3c5"><span className="nr14-ab31c751">{tool.icone}</span><div className="nr14-5cdd8f67"><p className="nr14-06ace684">{tool.nome}</p><p className="nr14-d7fd0d80">{tool.motivo}</p></div></div>)}</div></div>

    <div className="nr-content-card"><p className="nr-kicker nr-kicker--inline"><span>🎒</span>Antes de Sair</p><p className="nr14-2bc02a92">Cruza o kit mínimo com o que já está marcado no seu checklist.</p><div className="nr14-073471ee"><span className="nr14-1d84ead7">Já confirmados</span><span className="nr14-3316d511">{kitPossui}/{kitRastreado} rastreados</span></div><div className="nr14-14b4b58a">{kitComStatus.map(tool => <div key={tool.id} className="nr-tool-status" data-status={tool.status ?? 'nao-rastreado'}><span className="nr14-ed31fa53">{tool.icone}</span><span className="nr14-c1e6c9e6">{tool.nome}</span><span className="nr-tool-status__state">{tool.status==='comprado'?'✅ Tenho':tool.status==='pendente'?'⚠️ Falta':'— Não rastreado'}</span></div>)}</div></div>
  </>;
}
