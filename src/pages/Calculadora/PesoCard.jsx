import { parseNum } from "../../utils/format";
import { montarLinhasPeso, calcPeso } from "../../services/calculator.service";
import { CATEGORIES } from "../../constants";

function PesoRow({ item, linha, onChange, T }) {
  const qtd   = linha?.qtd ?? String(item.quantity);
  const kg    = linha?.kg ?? "";
  const total = parseNum(qtd) * parseNum(kg);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6,
      background:T.white, border:`1px solid ${T.border}`, borderRadius:10, padding:"7px 9px" }}>
      <span style={{ flex:1, minWidth:0, color:T.textMain, fontSize:12,
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</span>
      <input type="number" min="0" value={qtd} onChange={e=>onChange({ qtd:e.target.value })}
        style={{ width:34, padding:"4px 4px", border:`1px solid ${T.border}`, borderRadius:6,
          fontSize:11, textAlign:"center", background:T.blueLight, outline:"none" }}/>
      <span style={{ fontSize:9.5, color:T.textMuted, flexShrink:0 }}>×</span>
      <input type="number" min="0" step="0.1" placeholder="0" value={kg} onChange={e=>onChange({ kg:e.target.value })}
        style={{ width:44, padding:"4px 4px", border:`1px solid ${T.border}`, borderRadius:6,
          fontSize:11, textAlign:"right", background:T.blueLight, outline:"none" }}/>
      <span style={{ fontSize:9, color:T.textMuted, flexShrink:0 }}>kg</span>
      <span style={{ width:46, textAlign:"right", fontSize:10.5, fontWeight:700, flexShrink:0,
        color: total>0 ? T.blue : T.textMuted }}>{total>0 ? `${total.toFixed(1)}kg` : "—"}</span>
    </div>
  );
}


export function PesoCard({ pesoData, setPesoData, items, T }) {
  const linhasPorId = montarLinhasPeso(items, pesoData);
  const r = calcPeso(linhasPorId);
  const update = (id, patch) => setPesoData(p => ({ ...p, [id]: { ...p[id], ...patch } }));

  // Agrupado pelas mesmas categorias usadas no restante do app — sem rolagem
  // interna: a tela toda rola normalmente, sem uma caixinha de scroll dentro dela.
  const grupos = CATEGORIES
    .map(cat => ({ cat, itens: items.filter(i => i.categoryId === cat.id) }))
    .filter(g => g.itens.length > 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ background:r.acimaDoLimite?T.urgBg:T.doneBg,
        border:`1.5px solid ${r.acimaDoLimite?T.urgBorder:T.doneBorder}`, borderRadius:14,
        padding:"14px", textAlign:"center" }}>
        <p style={{ color:r.acimaDoLimite?T.urgColor:T.doneCheck, fontSize:26, fontWeight:900, margin:0 }}>
          {r.total.toFixed(1)} kg</p>
        <p style={{ color:r.acimaDoLimite?T.urgColor:T.doneCheck, fontSize:12, fontWeight:700, margin:"2px 0 0" }}>
          peso total da bagagem</p>
        {r.acimaDoLimite && (
          <p style={{ color:T.urgColor, fontSize:11, margin:"8px 0 0" }}>
            ⚠️ Acima do limite recomendado ({r.limite} kg)</p>
        )}
      </div>
      <p style={{ color:T.textMuted, fontSize:11, margin:0 }}>
        Quantidade e peso vêm pré-preenchidos com os dados do seu inventário — ajuste como quiser.</p>
      {grupos.map(g => (
        <div key={g.cat.id}>
          <p style={{ color:T.textSub, fontSize:10.5, fontWeight:800, letterSpacing:"0.08em",
            textTransform:"uppercase", margin:"0 0 6px", display:"flex", alignItems:"center", gap:5 }}>
            <span>{g.cat.icon}</span>{g.cat.label}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {g.itens.map(it => (
              <PesoRow key={it.id} item={it} linha={pesoData[it.id]} T={T}
                onChange={patch=>update(it.id, patch)}/>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
