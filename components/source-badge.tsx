type SourceBadgeProps = {
  citation: string;
  href: string;
};

export function SourceBadge({ citation, href }: SourceBadgeProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700"
    >
      Source: {citation}
    </a>
  );
}
