export function Icon({ name, small }: { name: string; small?: boolean }) {
  return (
    <svg className={small ? "q-i q-i--sm" : "q-i"} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}

/** Dots that show up only if the wait lasts (see .waiting in app.css). */
export function Waiting() {
  return (
    <span className="q-typing waiting" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
