import {
  EditorSelection,
  EditorState,
  SelectionRange,
  Transaction,
} from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import type { BarItem } from '../bar';
import * as MARKS from './mark';

function inlineRangeToggler(
  range: SelectionRange,
  mark: MARKS.Mark,
  tree: MARKS.SyntaxTree,
) {
  const { from, to } = range;
  const node = tree.resolve(from);

  if (MARKS.isMarkOf(node, mark)) {
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
  { symbol, isFence, type }: MARKS.Mark,
  tree: MARKS.SyntaxTree,
  view: EditorView,
) {
  const firstLine = view.state.doc.lineAt(range.from);
  const lastLine = view.state.doc.lineAt(range.to);
  const changes = [];
  const newRange = { from: range.from, to: range.to };

  for (let i = firstLine.number; i <= lastLine.number; i++) {
    const line = view.state.doc.line(i);
    const blockMark = MARKS.getBlockMark(tree, line.from);

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

function toggle(mark: MARKS.Mark) {
  return function (view: EditorView) {
    const toggle = mark.isBlock ? blockRangeToggler : inlineRangeToggler;
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

const syntaxTreeCache = new WeakMap<EditorState, MARKS.SyntaxTree>();
function updateIconStatus(mark: MARKS.Mark): BarItem['onUpdate'] {
  return function (update, itemEl) {
    if (!syntaxTreeCache.has(update.state)) {
      syntaxTreeCache.set(update.state, syntaxTree(update.state));
    }

    const { from } = update.state.selection.main;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const node = syntaxTreeCache.get(update.state)!.resolve(from);
    const CHECKED_CLASS_NAME = 'editor-toolbar-item-checked';

    if (MARKS.isMarkOf(node, mark)) {
      itemEl.classList.add(CHECKED_CLASS_NAME);
    } else {
      itemEl.classList.remove(CHECKED_CLASS_NAME);
    }
  };
}

function getTogglerIcon(mark: MARKS.Mark): BarItem {
  return {
    className: `editor-toolbar-icon editor-toolbar-${mark.title.toLowerCase()}-icon`,
    title: mark.title,
    onClick: toggle(mark),
    onUpdate: updateIconStatus(mark),
  };
}

export const boldIcon = getTogglerIcon(MARKS.BOLD);
export const italicIcon = getTogglerIcon(MARKS.ITALIC);
export const codeIcon = getTogglerIcon(MARKS.CODE);

/** supported by codemirror `markdownLanguage` parser
 * @see https://github.com/codemirror/lang-markdown/blob/3778e85ca81514d5f768d92095e9c341a8272fa0/src/markdown.ts#L52
 */
export const strikeThroughIcon = getTogglerIcon(MARKS.STRIKE_THROUGH);
export const superscriptIcon = getTogglerIcon(MARKS.SUPERSCRIPT);
export const subscriptIcon = getTogglerIcon(MARKS.SUBSCRIPT);
export const heading1Icon = getTogglerIcon(MARKS.HEADER1);
export const blockquoteIcon = getTogglerIcon(MARKS.BLOCKQUOTE);
