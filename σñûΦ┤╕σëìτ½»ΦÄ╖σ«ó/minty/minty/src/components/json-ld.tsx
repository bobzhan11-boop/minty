/** Renders a JSON-LD structured-data <script>. Pass one object or an array. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here (no user HTML); Next injects it verbatim.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
