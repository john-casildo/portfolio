export function SectionHeading({id, tag, title}: {id: string; tag: string; title: string}) {
  return (
    <div>
      <p aria-hidden="true" className="inline-block -rotate-2 font-tag text-xl">{tag}</p>
      <h2 id={`${id}-title`} className="red-shadow font-display text-5xl leading-none md:text-6xl">{title}</h2>
    </div>
  );
}
