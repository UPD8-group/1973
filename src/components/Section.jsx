export default function Section({ id, num, name, heading, children }) {
  return (
    <section className="section" id={id}>
      <p className="eyebrow">
        {num} · {name}
      </p>
      <h2 className="section-heading">{heading}</h2>
      {children}
    </section>
  )
}
