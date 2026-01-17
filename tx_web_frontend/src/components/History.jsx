export default function History({ history, onReplay }) {
  return (
    <div className="history">
      {history.map((h, i) => (
        <span key={i} onClick={() => onReplay(i)}>
          {h.result === "tai" ? "T" : "X"}
        </span>
      ))}
    </div>
  );
}
