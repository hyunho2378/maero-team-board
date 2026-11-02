export default function PageHead({ title, sub, children }) {
  return (
    <header className="page-head">
      <div style={{ minWidth: 0 }}>
        {sub && <p className="t-footnote secondary w-semibold">{sub}</p>}
        <h1 className={String(title).length > 14 ? 't-title1' : 't-largeTitle'}>{title}</h1>
      </div>
      {children && <div className="actions">{children}</div>}
    </header>
  );
}
