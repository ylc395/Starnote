import type { EditorView, Command } from '@codemirror/view';
import {
  EditorSelection,
  SelectionRange,
  Transaction,
} from '@codemirror/state';
import * as MARKS from './marks';
import { getNodeAt, isMarkOf, getBlockMark } from './syntaxTree';

function toggleInlineRange(
  range: SelectionRange,
  mark: MARKS.Mark,
  view: EditorView,
) {
  const { from, to } = range;
  const node = getNodeAt(view.state, from);

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
  view: EditorView,
) {
  const firstLine = view.state.doc.lineAt(range.from);
  const lastLine = view.state.doc.lineAt(range.to);
  const changes = [];
  const newRange = { from: range.from, to: range.to };

  for (let i = firstLine.number; i <= lastLine.number; i++) {
    const line = view.state.doc.line(i);
    const blockMark = getBlockMark(view.state, line.from);

    if (blockMark) {
      changes.push({
        from: line.from,
        to: line.from + blockMark.symbol.length,
        insert: '',
      });

      let length = blockMark.symbol.length;

      if (i === firstLine.number) {
        length = Math.min(blockMark.symbol.length, range.from - line.from);
        newRange.from -= length;
      }

      newRange.to -= length;

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
    const toggle = mark.isToggleable
      ? mark.isBlock
        ? toggleBlockRange
        : toggleInlineRange
      : insert;
    const changes = view.state.changeByRange((range) =>
      toggle(range, mark, view),
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
