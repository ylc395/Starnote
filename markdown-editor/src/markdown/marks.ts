export interface Mark {
  readonly symbol: string;
  readonly type: string; // @see https://github.com/lezer-parser/markdown/blob/e25c643b5c6feea66a97df58008904584683e350/test/spec.ts#L4
  readonly markType?: string; // marks are standalone structures
  readonly newLine?: boolean;
  readonly isBlock?: boolean;
  readonly isToggleable?: boolean;
}

export const BOLD: Mark = {
  symbol: '**',
  type: 'StrongEmphasis',
  markType: 'EmphasisMark',
  isToggleable: true,
};

export const ITALIC: Mark = {
  symbol: '*',
  type: 'Emphasis',
  isToggleable: true,
};

export const INLINE_CODE: Mark = {
  symbol: '`',
  type: 'InlineCode',
  isToggleable: true,
};

export const HEADING1: Mark = {
  symbol: '# ',
  type: 'ATXHeading1',
  markType: 'HeaderMark',
  isBlock: true,
  isToggleable: true,
};

export const HEADING2: Mark = {
  symbol: '## ',
  type: 'ATXHeading2',
  markType: 'HeaderMark',
  isBlock: true,
  isToggleable: true,
};

export const HEADING3: Mark = {
  symbol: '### ',
  type: 'ATXHeading3',
  markType: 'HeaderMark',
  isBlock: true,
  isToggleable: true,
};

export const HEADING4: Mark = {
  symbol: '#### ',
  type: 'ATXHeading4',
  markType: 'HeaderMark',
  isBlock: true,
  isToggleable: true,
};

export const HEADING5: Mark = {
  symbol: '##### ',
  type: 'ATXHeading5',
  markType: 'HeaderMark',
  isBlock: true,
  isToggleable: true,
};

export const HEADING6: Mark = {
  symbol: '###### ',
  type: 'ATXHeading6',
  markType: 'HeaderMark',
  isBlock: true,
  isToggleable: true,
};

export const BLOCKQUOTE: Mark = {
  symbol: '> ',
  type: 'Blockquote',
  markType: 'QuoteMark',
  isBlock: true,
  isToggleable: true,
};

export const BULLET_LIST: Mark = {
  symbol: '+ ',
  type: 'BulletList',
  markType: 'ListMark',
  isBlock: true,
  isToggleable: true,
};

export const ORDERED_LIST: Mark = {
  symbol: '1. ',
  type: 'OrderedList',
  markType: 'ListMark',
  isBlock: true,
  isToggleable: true,
};

export const LINK: Mark = {
  symbol: '[]()',
  type: 'Link',
};

export const IMAGE: Mark = {
  symbol: '![]()',
  type: 'Image',
};

export const HORIZONTAL_LINE: Mark = {
  symbol: '-----',
  type: 'HorizontalRule',
  newLine: true,
};

/** supported by codemirror `markdownLanguage` parser
 * @see https://github.com/codemirror/lang-markdown/blob/3778e85ca81514d5f768d92095e9c341a8272fa0/src/markdown.ts#L52
 */
export const STRIKE_THROUGH: Mark = {
  symbol: '~~',
  type: 'Strikethrough',
  isToggleable: true,
};

export const SUPERSCRIPT: Mark = {
  symbol: '^',
  type: 'Superscript',
  isToggleable: true,
};

export const SUBSCRIPT: Mark = {
  symbol: '~',
  type: 'Subscript',
  isToggleable: true,
};

export const TASK: Mark = {
  symbol: '- [ ] ',
  type: 'Task',
  markType: 'TaskMarker',
  isToggleable: true,
  isBlock: true,
};
