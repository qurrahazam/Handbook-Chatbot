import type { ReactNode } from "react";

const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBER = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^(#{1,4})\s+(.*)$/;

const STRONG = { fontWeight: 600, color: "#1c1917" } as const;
const EMPHASIS = { fontStyle: "italic" as const, color: "#57534e" };
const CODE = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "0.86em",
  background: "#f5f5f4",
  border: "1px solid #e7e5e4",
  padding: "1px 5px",
  borderRadius: 5,
  color: "#0f766e",
};
const PARAGRAPH = { margin: "0 0 10px", lineHeight: 1.7 };
const CODE_BLOCK = {
  margin: "0 0 10px",
  padding: "10px 12px",
  background: "#f5f5f4",
  border: "1px solid #e7e5e4",
  borderRadius: 8,
  overflowX: "auto" as const,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 12.5,
  lineHeight: 1.6,
  color: "#292524",
};

function inline(text: string, keyBase: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_)/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));

    const token = match[0];
    const key = `${keyBase}-${match.index}`;

    if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push(<strong key={key} style={STRONG}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={key} style={CODE}>{token.slice(1, -1)}</code>);
    } else {
      nodes.push(<em key={key} style={EMPHASIS}>{token.slice(1, -1)}</em>);
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function consumeList(lines: string[], start: number, ordered: boolean) {
  const marker = ordered ? NUMBER : BULLET;
  const items: string[][] = [];
  let index = start;
  let current: string[] | null = null;

  while (index < lines.length) {
    const line = lines[index];
    const matched = line.match(marker);

    if (matched) {
      current = [matched[1]];
      items.push(current);
      index += 1;
      continue;
    }

    if (!line.trim()) {
      const next = lines[index + 1] ?? "";
      if (marker.test(next)) {
        index += 1;
        continue;
      }
      break;
    }

    if (current) {
      current.push(line);
      index += 1;
      continue;
    }

    break;
  }

  return { items, next: index };
}

function renderList(
  items: string[][],
  ordered: boolean,
  depth: number,
  key: string,
): ReactNode {
  const children = items.map((content, position) => {
    const [head, ...rest] = content;
    const nested = rest.filter((line) => BULLET.test(line) || NUMBER.test(line));
    const trailing = rest
      .filter((line) => line.trim() && !BULLET.test(line) && !NUMBER.test(line))
      .map((line) => line.trim())
      .join(" ");
    const itemKey = `${key}-${position}`;

    return (
      <li key={itemKey} style={{ margin: "0 0 6px", lineHeight: 1.7 }}>
        {inline(head ?? "", `${itemKey}-h`)}
        {trailing ? <> {inline(trailing, `${itemKey}-t`)}</> : null}
        {nested.length > 0 && depth < 3 ? (
          <div style={{ marginTop: 4 }}>{blocks(nested, depth + 1)}</div>
        ) : null}
      </li>
    );
  });

  if (ordered) {
    return (
      <ol
        key={key}
        className="md-list"
        style={{ margin: "0 0 10px", paddingLeft: 22, fontVariantNumeric: "tabular-nums" }}
      >
        {children}
      </ol>
    );
  }

  return (
    <ul key={key} className="md-list" style={{ margin: "0 0 10px", paddingLeft: 20 }}>
      {children}
    </ul>
  );
}

function blocks(lines: string[], depth = 0): ReactNode[] {
  const out: ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim().startsWith("```")) {
      const buffer: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        buffer.push(lines[index]);
        index += 1;
      }
      index += 1;
      out.push(
        <pre key={`b${key++}`} style={CODE_BLOCK}>
          {buffer.join("\n")}
        </pre>,
      );
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      out.push(
        <div
          key={`b${key++}`}
          className="serif"
          style={{ fontSize: 15, fontWeight: 500, color: "#1c1917", margin: "2px 0 8px" }}
        >
          {inline(heading[2], `h${key}`)}
        </div>,
      );
      index += 1;
      continue;
    }

    const isBullet = BULLET.test(line);
    const isNumber = !isBullet && NUMBER.test(line);

    if (isBullet || isNumber) {
      const { items, next } = consumeList(lines, index, isNumber);
      out.push(renderList(items, isNumber, depth, `b${key++}`));
      index = next;
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !HEADING.test(lines[index]) &&
      !BULLET.test(lines[index]) &&
      !NUMBER.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }

    out.push(
      <p key={`b${key++}`} style={PARAGRAPH}>
        {inline(paragraph.join(" "), `p${key}`)}
      </p>,
    );
  }

  return out;
}

export default function Markdown({ text }: { text: string }) {
  return <div>{blocks(text.replace(/\r\n/g, "\n").split("\n"))}</div>;
}