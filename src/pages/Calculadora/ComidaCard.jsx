import { parseNum, fmt } from "../../utils/format";
import { montarLinhasAlimentacaoInteligente, calcAlimentacaoInteligente } from "../../services/calculator.service";
import { ALIMENTOS_CONFIG } from "../../constants";

function FoodRow({ alimento, linha, onChange, T }) {
  const unidadeId = linha?.unidade ?? alimento.unidades[0].id;
  const unidadeCfg = alimento.unidades.find(u => u.id === unidadeId) ?? alimento.unidades[0];
  const qtd     = linha?.quantidade ?? "";
  const preco   = linha?.preco   ?? String(unidadeCfg.precoPadrao);
  const consumo = linha?.consumo ?? String(unidadeCfg.consumoDiarioPadrao);
  const total   = parseNum(preco) * parseNum(qtd);
  const dias    = (parseNum(qtd) > 0 && parseNum(consumo) > 0) ? Math.floor(parseNum(qtd) / parseNum(consumo)) : null;
  const trocarUnidade = novaUnidade => {
    const cfg = alimento.unidades.find(u => u.id === novaUnidade);
    // ao trocar de unidade, repõe os padrões daquela unidade (preço/consumo digitados
    // eram relativos à unidade anterior e deixariam de fazer sentido)
    onChange({ unidade:novaUnidade, preco:String(cfg.precoPadrao), consumo:String(cfg.consumoDiarioPadrao) });
  };
  return (
    <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 12px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8, gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
          <span style={{ fontSize:17, flexShrink:0 }}>{alimento.icone}</span>
          <span style={{ color:T.textMain, fontWeight:700, fontSize:12.5, minWidth:0,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{alimento.nome}</span>
          {alimento.unidades.length > 1 && (
            <select value={unidadeId} onChange={e=>trocarUnidade(e.target.value)}
              style={{ fontSize:10, border:`1px solid ${T.border}`, borderRadius:6, background:T.blueLight,
                color:T.textSub, padding:"2px 4px", flexShrink:0 }}>
              {alimento.unidades.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          )}
        </div>
        <span style={{ color:T.blue, fontWeight:800, fontSize:13, flexShrink:0 }}>{fmt(total)}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
        <div>
          <p style={{ color:T.textMuted, fontSize:9, margin:"0 0 3px" }}>Qtd. ({unidadeCfg.label})</p>
          <input type="number" min="0" step="0.01" placeholder="0" value={qtd}
            onChange={e=>onChange({ quantidade:e.target.value })}
            style={{ padding:"7px 6px", border:`1.5px solid ${T.border}`, borderRadius:8,
              fontSize:12, color:T.textMain, background:T.blueLight, outline:"none",
              fontFamily:"inherit", width:"100%", boxSizing:"border-box" }}/>
        </div>
        <div>
          <p style={{ color:T.textMuted, fontSize:9, margin:"0 0 3px" }}>Preço/{unidadeCfg.id}</p>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:6, top:"50%", transform:"translateY(-50%)",
              fontSize:9.5, color:T.textMuted, pointerEvents:"none" }}>R$</span>
            <input type="number" min="0" step="0.01" value={preco}
              onChange={e=>onChange({ preco:e.target.value })}
              style={{ padding:"7px 6px 7px 20px", border:`1.5px solid ${T.border}`, borderRadius:8,
                fontSize:12, color:T.textMain, background:T.blueLight, outline:"none",
                fontFamily:"inherit", width:"100%", boxSizing:"border-box" }}/>
          </div>
        </div>
        <div>
          <p style={{ color:T.textMuted, fontSize:9, margin:"0 0 3px" }}>Consumo/dia</p>
          <input type="number" min="0" step="0.01" value={consumo}
            onChange={e=>onChange({ consumo:e.target.value })}
            style={{ padding:"7px 6px", border:`1.5px solid ${T.border}`, borderRadius:8,
              fontSize:12, color:T.textMain, background:T.blueLight, outline:"none",
              fontFamily:"inherit", width:"100%", boxSizing:"border-box" }}/>
        </div>
      </div>
      {dias !== null && (
        <p style={{ color:T.textMuted, fontSize:10, margin:"7px 0 0" }}>
          Dura aproximadamente <b style={{ color:T.blue }}>{dias} dias</b> nesse ritmo de consumo.</p>
      )}
    </div>
  );
}


export function ComidaCard({ alimentos, setAlimentos, T }) {
  const linhas = montarLinhasAlimentacaoInteligente(ALIMENTOS_CONFIG, alimentos);
  const r = calcAlimentacaoInteligente(linhas);
  const update = (id, patch) => setAlimentos(al => ({ ...al, [id]: { ...al[id], ...patch } }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {ALIMENTOS_CONFIG.map(a => (
        <FoodRow key={a.id} alimento={a} linha={alimentos[a.id]} T={T}
          onChange={patch=>update(a.id, patch)}/>
      ))}
      <div style={{ background:T.navy, borderRadius:14, padding:"14px 16px", marginTop:4 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ color:"#7ea3d4", fontSize:11.5 }}>Valor total da alimentação</span>
          <span style={{ color:"#fff", fontWeight:800, fontSize:13 }}>{fmt(r.valorTotal)}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ color:"#7ea3d4", fontSize:11.5 }}>Quantidade total informada</span>
          <span style={{ color:"#fff", fontWeight:800, fontSize:13 }}>{r.quantidadeTotal.toFixed(2).replace(/\.00$/,"")}</span>
        </div>
        {r.valido && r.dias !== null && (
          <div style={{ borderTop:"1px solid rgba(255,255,255,.12)", marginTop:10, paddingTop:10, textAlign:"center" }}>
            <p style={{ color:"#fff", fontSize:24, fontWeight:900, margin:0, lineHeight:1 }}>{r.dias} dias</p>
            <p style={{ color:"#7ea3d4", fontSize:11, margin:"3px 0 0" }}>
              de autonomia alimentar estimada{r.gargalo ? ` — limitado por ${r.gargalo.nome.toLowerCase()}` : ""}</p>
          </div>
        )}
      </div>
    </div>
  );
}
