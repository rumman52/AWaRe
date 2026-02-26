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
      className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
    >
      Source: {citation}
    </a>
  );
}
