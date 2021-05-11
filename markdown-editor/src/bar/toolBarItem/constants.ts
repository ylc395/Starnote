export interface InlineMark {
  readonly title: string;
  readonly mark: string;
  readonly type: string;
}

export const BOLD = {
  title: 'Bold',
  mark: '**',
  type: 'StrongEmphasis',
} as const;
export const ITALIC = {
  title: 'Italic',
  mark: '*',
  type: 'Emphasis',
} as const;

export const CODE = {
  title: 'Code',
  mark: '`',
  type: 'InlineCode',
} as const;

export const STRIKE_THROUGH = {
  title: 'Strikethrough',
  mark: '~~',
  type: 'Strikethrough',
} as const;

export const SUPERSCRIPT = {
  title: 'Superscript',
  mark: '^',
  type: 'Superscript',
};

export const SUBSCRIPT = {
  title: 'Subscript',
  mark: '~',
  type: 'Subscript',
};
