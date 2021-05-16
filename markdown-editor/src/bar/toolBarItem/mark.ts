import { syntaxTree } from '@codemirror/language';

export interface Mark {
  readonly title: string;
  readonly symbol: string;
  readonly type: string; // @see https://github.com/lezer-parser/markdown/blob/e25c643b5c6feea66a97df58008904584683e350/test/spec.ts#L4
  readonly markType?: string;
  readonly isBlock: boolean;
  readonly isFence?: boolean;
}

export const BOLD = {
  title: 'Bold',
  symbol: '**',
  type: 'StrongEmphasis',
  markType: 'EmphasisMark',
  isBlock: false,
} as const;

export const ITALIC = {
  title: 'Italic',
  symbol: '*',
  type: 'Emphasis',
  isBlock: false,
} as const;

export const CODE = {
  title: 'InlineCode',
  symbol: '`',
  type: 'InlineCode',
  isBlock: false,
} as const;

export const STRIKE_THROUGH = {
  title: 'Strikethrough',
  symbol: '~~',
  type: 'Strikethrough',
  isBlock: false,
} as const;

export const SUPERSCRIPT = {
  title: 'Superscript',
  symbol: '^',
  type: 'Superscript',
  isBlock: false,
};

export const SUBSCRIPT = {
  title: 'Subscript',
  symbol: '~',
  type: 'Subscript',
  isBlock: false,
};

export const HEADER1 = {
  title: 'Heading1',
  symbol: '# ',
  type: 'ATXHeading1',
  isBlock: true,
};

export const BLOCKQUOTE = {
  title: 'Blockquote',
  symbol: '> ',
  type: 'Blockquote',
  isBlock: true,
};

export type SyntaxTree = ReturnType<typeof syntaxTree>;
export type SyntaxNode = ReturnType<SyntaxTree['resolve']>;
export function isMarkOf(node: SyntaxNode, mark: Mark) {
  return (
    node.type.is(mark.type) || node.type.is(mark.markType || `${mark.type}Mark`)
  );
}

export function getBlockMark(tree: SyntaxTree, lineFrom: number) {
  const blockMarks = [HEADER1, BLOCKQUOTE];

  for (const mark of blockMarks) {
    const node = tree.resolve(lineFrom + mark.symbol.length);

    if (node.type.is(mark.type)) {
      return mark;
    }
  }

  return null;
}
