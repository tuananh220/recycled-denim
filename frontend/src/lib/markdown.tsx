/**
 * Tiny markdown renderer — supports headings, paragraphs, lists, bold, italic,
 * blockquotes, and links. Enough for blog/FAQ content without pulling in a parser.
 */
import { ReactNode } from 'react';

function inline(text: string): ReactNode {
  // bold + italic + links — applied in order
  const parts: ReactNode[] = [];
  let rest = text;
  let key = 0;
  const patterns: { regex: RegExp; render: (m: RegExpMatchArray) => ReactNode }[] = [
    { regex: /\*\*(.+?)\*\*/, render: (m) => <strong key={key++}>{m[1]}</strong> },
    { regex: /\*(.+?)\*/, render: (m) => <em key={key++}>{m[1]}</em> },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/, render: (m) => <a key={key++} href={m[2]} className="underline hover:text-denim-rust">{m[1]}</a> },
  ];
  while (rest.length) {
    let matched = false;
    for (const { regex, render } of patterns) {
      const m = rest.match(regex);
      if (m && m.index !== undefined) {
        if (m.index > 0) parts.push(rest.slice(0, m.index));
        parts.push(render(m));
        rest = rest.slice(m.index + m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) { parts.push(rest); break; }
  }
  return parts;
}

export function Markdown({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="prose-fashion space-y-5">
      {blocks.map((block, i) => {
        if (block.startsWith('# ')) return <h1 key={i} className="font-sans text-4xl md:text-5xl mt-8">{inline(block.slice(2))}</h1>;
        if (block.startsWith('## ')) return <h2 key={i} className="font-sans text-3xl mt-10">{inline(block.slice(3))}</h2>;
        if (block.startsWith('### ')) return <h3 key={i} className="font-sans text-2xl mt-8">{inline(block.slice(4))}</h3>;
        if (block.startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-2 border-denim-rust pl-6 italic text-xl font-sans text-foreground/80">
              {inline(block.slice(2))}
            </blockquote>
          );
        }
        // Ordered list
        if (/^\d+\.\s/.test(block)) {
          return (
            <ol key={i} className="list-decimal pl-6 space-y-2">
              {block.split('\n').map((li, j) => <li key={j}>{inline(li.replace(/^\d+\.\s/, ''))}</li>)}
            </ol>
          );
        }
        // Unordered list
        if (block.startsWith('- ') || block.startsWith('* ')) {
          return (
            <ul key={i} className="list-disc pl-6 space-y-2">
              {block.split('\n').map((li, j) => <li key={j}>{inline(li.replace(/^[-*]\s/, ''))}</li>)}
            </ul>
          );
        }
        return <p key={i} className="leading-relaxed text-foreground/80">{inline(block)}</p>;
      })}
    </div>
  );
}
