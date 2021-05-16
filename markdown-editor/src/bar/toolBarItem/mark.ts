import { syntaxTree } from '@codemirror/language';
import type { EditorView } from '@codemirror/view';
import {
  EditorSelection,
  EditorState,
  SelectionRange,
  Transaction,
} from '@codemirror/state';
import type { BarItem } from '../bar';

interface Mark {
  readonly title: string;
  readonly symbol: string;
  readonly type: string; // @see https://github.com/lezer-parser/markdown/blob/e25c643b5c6feea66a97df58008904584683e350/test/spec.ts#L4
  readonly markType?: string; // for some grammar, marks will be treated as a standalone structure
}

const BOLD = {
  title: 'Bold',
  symbol: '**',
  type: 'StrongEmphasis',
  markType: 'EmphasisMark',
};

const ITALIC = {
  title: 'Italic',
  symbol: '*',
  type: 'Emphasis',
};

const CODE = {
  title: 'Inline Code',
  symbol: '`',
  type: 'InlineCode',
};

const STRIKE_THROUGH = {
  title: 'Strikethrough',
  symbol: '~~',
  type: 'Strikethrough',
};

const SUPERSCRIPT = {
  title: 'Superscript',
  symbol: '^',
  type: 'Superscript',
};

const SUBSCRIPT = {
  title: 'Subscript',
  symbol: '~',
  type: 'Subscript',
};

const HEADER1 = {
  title: 'Heading1',
  symbol: '# ',
  type: 'ATXHeading1',
};

const HEADER2 = {
  title: 'Heading2',
  symbol: '## ',
  type: 'ATXHeading2',
};

const HEADER3 = {
  title: 'Heading3',
  symbol: '### ',
  type: 'ATXHeading3',
};

const HEADER4 = {
  title: 'Heading4',
  symbol: '#### ',
  type: 'ATXHeading4',
};

const HEADER5 = {
  title: 'Heading5',
  symbol: '##### ',
  type: 'ATXHeading5',
};

const HEADER6 = {
  title: 'Heading6',
  symbol: '###### ',
  type: 'ATXHeading6',
};

const BLOCKQUOTE = {
  title: 'Blockquote',
  symbol: '> ',
  type: 'Blockquote',
};

const BULLET_LIST = {
  title: 'Bullet List',
  symbol: '+ ',
  type: 'BulletList',
  markType: 'ListItem',
};

const ORDERED_LIST = {
  title: 'Ordered List',
  symbol: '1. ',
  type: 'OrderedList',
  markType: 'ListItem',
};

const BLOCK_MARKS: Mark[] = [HEADER1, BLOCKQUOTE, BULLET_LIST, ORDERED_LIST];

type SyntaxTree = ReturnType<typeof syntaxTree>;
type SyntaxNode = ReturnType<SyntaxTree['resolve']>;
function isMarkOf(node: SyntaxNode, mark: Mark) {
  return (
    node.type.is(mark.type) || node.type.is(mark.markType || `${mark.type}Mark`)
  );
}

function inlineRangeToggler(
  range: SelectionRange,
  mark: Mark,
  tree: SyntaxTree,
) {
  const { from, to } = range;
  const node = tree.resolve(from);

  if (isMarkOf(node, mark)) {
    const { firstChild, lastChild } = node.type.is(mark.type)
      ? node
      : node.parent || {};

    // firstChild and lastChild will be grammar marks, such as **
    if (!firstChild || !lastChild) {
      throw new Error(
        'No firstChild or lastChild. This is a editor internal bug. Please open an issue to report',
      );
    }

    const startMarkLength = firstChild.to - firstChild.from;

    // remove marks
    return {
      range: EditorSelection.range(
        from - startMarkLength,
        to - startMarkLength,
      ),
      changes: [
        { from: firstChild.from, to: firstChild.to, insert: '' },
        { from: lastChild.from, to: lastChild.to, insert: '' },
      ],
    };
  }

  // add marks
  return {
    range: EditorSelection.range(
      from + mark.symbol.length,
      to + mark.symbol.length,
    ),
    changes: [
      { from, insert: mark.symbol },
      { from: to, to, insert: mark.symbol },
    ],
  };
}

function blockRangeToggler(
  range: SelectionRange,
  { symbol, type }: Mark,
  tree: SyntaxTree,
  view: EditorView,
) {
  const firstLine = view.state.doc.lineAt(range.from);
  const lastLine = view.state.doc.lineAt(range.to);
  const changes = [];
  const newRange = { from: range.from, to: range.to };

  for (let i = firstLine.number; i <= lastLine.number; i++) {
    const line = view.state.doc.line(i);
    const blockMark = getBlockMark(tree, line.from);

    if (blockMark) {
      changes.push({
        from: line.from,
        to: line.from + blockMark.symbol.length,
        insert: '',
      });

      if (i === firstLine.number) {
        newRange.from -= blockMark.symbol.length;
      }

      newRange.to -= blockMark.symbol.length;

      if (blockMark.type === type) {
        continue;
      }
    }

    if (i === firstLine.number) {
      newRange.from += symbol.length;
    }

    newRange.to += symbol.length;
    changes.push({
      from: line.from,
      insert: symbol,
    });
  }

  return {
    range: EditorSelection.range(newRange.from, newRange.to),
    changes,
  };
}

function toggle(mark: Mark) {
  return function (view: EditorView) {
    const toggle = BLOCK_MARKS.includes(mark)
      ? blockRangeToggler
      : inlineRangeToggler;
    const tree = syntaxTree(view.state);
    const changes = view.state.changeByRange((range) =>
      toggle(range, mark, tree, view),
    );

    const update = view.state.update(changes, {
      scrollIntoView: true,
      // @see https://discuss.codemirror.net/t/keymap-for-bold-text-in-lang-markdown/3150/5
      annotations: Transaction.userEvent.of('input'),
    });

    view.dispatch(update);
    view.focus();
  };
}

const syntaxTreeCache = new WeakMap<EditorState, SyntaxTree>();
function updateIconStatus(mark: Mark): BarItem['onUpdate'] {
  return function (update, itemEl) {
    if (!syntaxTreeCache.has(update.state)) {
      syntaxTreeCache.set(update.state, syntaxTree(update.state));
    }

    const { from } = update.state.selection.main;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const node = syntaxTreeCache.get(update.state)!.resolve(from);
    const CHECKED_CLASS_NAME = 'editor-toolbar-item-checked';

    if (isMarkOf(node, mark)) {
      itemEl.classList.add(CHECKED_CLASS_NAME);
    } else {
      itemEl.classList.remove(CHECKED_CLASS_NAME);
    }
  };
}

function getBlockMark(tree: SyntaxTree, lineFrom: number) {
  for (const mark of BLOCK_MARKS) {
    const node = tree.resolve(lineFrom + mark.symbol.length);

    if (node.type.is(mark.type)) {
      return mark;
    }

    if (mark.markType && node.type.is(mark.markType)) {
      if (node.parent && node.parent.type.is(mark.type)) {
        return mark;
      }
    }
  }

  return null;
}

function getCommonTogglerIcon(mark: Mark): BarItem {
  return {
    className: `editor-toolbar-icon editor-toolbar-${mark.type.toLowerCase()}-icon`,
    title: mark.title,
    onClick: toggle(mark),
    onUpdate: updateIconStatus(mark),
  };
}

export const boldIcon = getCommonTogglerIcon(BOLD);
export const italicIcon = getCommonTogglerIcon(ITALIC);
export const codeIcon = getCommonTogglerIcon(CODE);
export const heading1Icon = getCommonTogglerIcon(HEADER1);
export const heading2Icon = getCommonTogglerIcon(HEADER2);
export const heading3Icon = getCommonTogglerIcon(HEADER3);
export const heading4Icon = getCommonTogglerIcon(HEADER4);
export const heading5Icon = getCommonTogglerIcon(HEADER5);
export const heading6Icon = getCommonTogglerIcon(HEADER6);
export const blockquoteIcon = getCommonTogglerIcon(BLOCKQUOTE);
export const bulletListIcon = getCommonTogglerIcon(BULLET_LIST);
export const orderedListIcon = getCommonTogglerIcon(ORDERED_LIST);

/** supported by codemirror `markdownLanguage` parser
 * @see https://github.com/codemirror/lang-markdown/blob/3778e85ca81514d5f768d92095e9c341a8272fa0/src/markdown.ts#L52
 */
export const strikeThroughIcon = getCommonTogglerIcon(STRIKE_THROUGH);
export const superscriptIcon = getCommonTogglerIcon(SUPERSCRIPT);
export const subscriptIcon = getCommonTogglerIcon(SUBSCRIPT);
