export interface Mark {
  readonly symbol: string;
  readonly type: string; // @see https://github.com/lezer-parser/markdown/blob/e25c643b5c6feea66a97df58008904584683e350/test/spec.ts#L4
  readonly markType?: string; // for some grammar, marks will be treated as a standalone structure
}

export const BOLD = {
  symbol: '**',
  type: 'StrongEmphasis',
  markType: 'EmphasisMark',
};

export const ITALIC = {
  symbol: '*',
  type: 'Emphasis',
};

export const INLINE_CODE = {
  symbol: '`',
  type: 'InlineCode',
};

export const HEADING1 = {
  symbol: '# ',
  type: 'ATXHeading1',
};

export const HEADING2 = {
  symbol: '## ',
  type: 'ATXHeading2',
};

export const HEADING3 = {
  symbol: '### ',
  type: 'ATXHeading3',
};

export const HEADING4 = {
  symbol: '#### ',
  type: 'ATXHeading4',
};

export const HEADING5 = {
  symbol: '##### ',
  type: 'ATXHeading5',
};

export const HEADING6 = {
  symbol: '###### ',
  type: 'ATXHeading6',
};

export const BLOCKQUOTE = {
  symbol: '> ',
  type: 'Blockquote',
};

export const BULLET_LIST = {
  symbol: '+ ',
  type: 'BulletList',
  markType: 'ListItem',
};

export const ORDERED_LIST = {
  symbol: '1. ',
  type: 'OrderedList',
  markType: 'ListItem',
};

/** supported by codemirror `markdownLanguage` parser
 * @see https://github.com/codemirror/lang-markdown/blob/3778e85ca81514d5f768d92095e9c341a8272fa0/src/markdown.ts#L52
 */
export const STRIKE_THROUGH = {
  symbol: '~~',
  type: 'Strikethrough',
};

export const SUPERSCRIPT = {
  symbol: '^',
  type: 'Superscript',
};

export const SUBSCRIPT = {
  symbol: '~',
  type: 'Subscript',
};

export const BLOCK_MARKS: Mark[] = [
  HEADING1,
  HEADING2,
  HEADING3,
  HEADING4,
  HEADING5,
  HEADING6,
  BLOCKQUOTE,
  BULLET_LIST,
  ORDERED_LIST,
];
