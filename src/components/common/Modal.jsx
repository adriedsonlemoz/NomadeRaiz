export function ModalBase({ onClose, header, children, T }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:70, background:"rgba(0,0,0,.55)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 18px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:400, maxHeight:"82vh",
        background:T.white, borderRadius:20, overflow:"hidden", display:"flex", flexDirection:"column",
        boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ background:T.navy, padding:"16px 18px 14px", flexShrink:0 }}>{header}</div>
        <div style={{ padding:"16px 18px", overflowY:"auto", display:"flex", flexDirection:"column", gap:14 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
