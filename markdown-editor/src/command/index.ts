import { syntaxTree } from '@codemirror/language';
import type { EditorView, Command } from '@codemirror/view';
import {
  EditorSelection,
  SelectionRange,
  Transaction,
} from '@codemirror/state';
import * as MARKS from './marks';

export type SyntaxTree = ReturnType<typeof syntaxTree>;
type SyntaxNode = ReturnType<SyntaxTree['resolve']>;

export function isMarkOf(node: SyntaxNode, mark: MARKS.Mark) {
  return (
    node.type.is(mark.type) ||
    (mark.markType &&
      node.type.is(mark.markType) &&
      node.parent &&
      node.parent.type.is(mark.type)) ||
    node.type.is(`${mark.type}Mark`)
  );
}

function getBlockMark(tree: SyntaxTree, lineFrom: number) {
  for (const mark of MARKS.BLOCK_MARKS) {
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

function toggleInlineRange(
  range: SelectionRange,
  mark: MARKS.Mark,
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

function toggleBlockRange(
  range: SelectionRange,
  { symbol, type }: MARKS.Mark,
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

function insert(
  range: SelectionRange,
  { symbol, newLine }: MARKS.Mark,
  tree: SyntaxTree,
  view: EditorView,
) {
  const line = view.state.doc.lineAt(range.from);

  return {
    range,
    changes: {
      from: newLine ? line.to : range.to,
      insert: newLine ? `\n${symbol}\n` : symbol,
    },
  };
}

function toggle(mark: MARKS.Mark): Command {
  return function (view: EditorView) {
    const toggle = MARKS.TO_INSERT_MARKS.includes(mark)
      ? insert
      : MARKS.BLOCK_MARKS.includes(mark)
      ? toggleBlockRange
      : toggleInlineRange;
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

    return true;
  };
}

export const toggleBold = toggle(MARKS.BOLD);
export const toggleItalic = toggle(MARKS.ITALIC);
export const toggleInlineCode = toggle(MARKS.INLINE_CODE);
export const toggleHeading1 = toggle(MARKS.HEADING1);
export const toggleHeading2 = toggle(MARKS.HEADING2);
export const toggleHeading3 = toggle(MARKS.HEADING3);
export const toggleHeading4 = toggle(MARKS.HEADING4);
export const toggleHeading5 = toggle(MARKS.HEADING5);
export const toggleHeading6 = toggle(MARKS.HEADING6);
export const toggleBlockquote = toggle(MARKS.BLOCKQUOTE);
export const toggleBulletList = toggle(MARKS.BULLET_LIST);
export const toggleOrderedList = toggle(MARKS.ORDERED_LIST);
export const toggleTask = toggle(MARKS.TASK);
export const toggleStrikeThrough = toggle(MARKS.STRIKE_THROUGH);
export const toggleSuperscript = toggle(MARKS.SUPERSCRIPT);
export const toggleSubscript = toggle(MARKS.SUBSCRIPT);
export const insertLink = toggle(MARKS.LINK);
export const insertImage = toggle(MARKS.IMAGE);
export const insertHorizontalLine = toggle(MARKS.HORIZONTAL_LINE);
