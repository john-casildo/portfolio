export function SectionHeading({id, tag, title}: {id: string; tag: string; title: string}) {
  return (
    <div>
      <p aria-hidden="true" className="font-tag text-2xl text-denim">{tag}</p>
      <h2 id={`${id}-title`} className="font-display text-5xl leading-none md:text-6xl">{title}</h2>
    </div>
  );
}
