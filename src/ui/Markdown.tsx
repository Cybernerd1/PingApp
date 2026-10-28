import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';

/**
 * Minimal markdown renderer for chat bubbles — no native dependency.
 * Supports: **bold**, *italic* / _italic_, `inline code`, ``` fenced code
 * blocks, # / ## / ### headings, - / * / • bullets, 1. numbered lists and
 * > quotes. Everything else renders as plain paragraphs.
 */

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'numbers'; items: string[] }
  | { kind: 'code'; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'para'; text: string };

function parseBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) body.push(lines[i++]);
      i++; // closing fence (or end of input)
      blocks.push({ kind: 'code', text: body.join('\n') });
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      blocks.push({ kind: 'heading', level: h[1].length, text: h[2] });
      i++;
      continue;
    }

    // Bullet list
    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*•]\s+/, ''));
      blocks.push({ kind: 'bullets', items });
      continue;
    }

    // Numbered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ''));
      blocks.push({ kind: 'numbers', items });
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''));
      blocks.push({ kind: 'quote', text: body.join(' ') });
      continue;
    }

    // Blank line → skip; otherwise accumulate a paragraph.
    if (!line.trim()) {
      i++;
      continue;
    }
    const body: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*[-*•]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^#{1,3}\s+/.test(lines[i]) &&
      !lines[i].trimStart().startsWith('```')
    ) {
      body.push(lines[i++]);
    }
    if (body.length) blocks.push({ kind: 'para', text: body.join('\n') });
  }
  return blocks;
}

/** Inline **bold**, *italic*, _italic_ and `code` as nested <Text>. */
function renderInline(text: string, base: object, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(_[^_\n]+_)|(`[^`\n]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(<Text key={`${keyPrefix}-t${k++}`} style={base}>{text.slice(last, m.index)}</Text>);
    const tok = m[0];
    if (tok.startsWith('**')) {
      nodes.push(<Text key={`${keyPrefix}-b${k++}`} style={[base, styles.bold]}>{tok.slice(2, -2)}</Text>);
    } else if (tok.startsWith('`')) {
      nodes.push(<Text key={`${keyPrefix}-c${k++}`} style={[base, styles.code]}>{tok.slice(1, -1)}</Text>);
    } else {
      nodes.push(<Text key={`${keyPrefix}-i${k++}`} style={[base, styles.italic]}>{tok.slice(1, -1)}</Text>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(<Text key={`${keyPrefix}-t${k++}`} style={base}>{text.slice(last)}</Text>);
  return nodes;
}

export const Markdown: React.FC<{ text: string; color?: string }> = ({ text, color = Colors.ink }) => {
  const blocks = React.useMemo(() => parseBlocks(text), [text]);
  return (
    <View>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'heading':
            return (
              <Text key={i} style={[styles.heading, b.level === 1 && styles.h1, b.level === 2 && styles.h2, { color }]}>
                {renderInline(b.text, {}, `h${i}`)}
              </Text>
            );
          case 'code':
            return (
              <View key={i} style={styles.codeBlock}>
                <Text style={styles.code}>{b.text}</Text>
              </View>
            );
          case 'quote':
            return (
              <View key={i} style={styles.quote}>
                <Text style={[styles.body, { color }]}>
                  {renderInline(b.text, {}, `q${i}`)}
                </Text>
              </View>
            );
          case 'bullets':
          case 'numbers':
            return (
              <View key={i}>
                {b.items.map((item, j) => (
                  <View key={j} style={styles.li}>
                    <Text style={[styles.marker, { color }]}>{b.kind === 'bullets' ? '•' : `${j + 1}.`}</Text>
                    <Text style={[styles.body, styles.liText, { color }]}>{renderInline(item, {}, `l${i}-${j}`)}</Text>
                  </View>
                ))}
              </View>
            );
          default:
            return (
              <Text key={i} style={[styles.body, { color }]}>
                {renderInline(b.text, {}, `p${i}`)}
              </Text>
            );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  body: { ...Typography.body },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  code: { fontFamily: 'monospace', fontSize: 13 },
  codeBlock: {
    backgroundColor: 'rgba(18,16,22,0.06)',
    borderRadius: Radius.small,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 4,
    alignSelf: 'stretch',
  },
  heading: { ...Typography.bodyStrong, fontWeight: '700', marginTop: 6, marginBottom: 2 },
  h1: { fontSize: 17 },
  h2: { fontSize: 16 },
  quote: { borderLeftWidth: 3, borderLeftColor: 'rgba(18,16,22,0.15)', paddingLeft: 10, marginVertical: 4 },
  li: { flexDirection: 'row', gap: 8, marginVertical: 2, alignItems: 'flex-start' },
  liText: { flex: 1 },
  marker: { ...Typography.body, lineHeight: 21 },
});
