export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  /** Heading level — use "h1" for a page's primary heading. */
  as?: "h1" | "h2";
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading className="mt-2 text-3xl font-bold text-ink sm:text-4xl">{title}</Heading>
      {subtitle && <p className="mt-3 text-ink-muted">{subtitle}</p>}
    </div>
  );
}
