import { EditorSelection, EditorState, Transaction } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import type { BarItem } from '../bar';
import * as CONSTANTS from './constants';

function toggleInline({ mark, type }: CONSTANTS.InlineMark) {
  return function (view: EditorView) {
    const tree = syntaxTree(view.state);
    const changes = view.state.changeByRange((range) => {
      const { from, to, empty } = range;
      const { type: nodeType, firstChild, lastChild } = tree.resolve(from);

      if (nodeType.is(type)) {
        if (!firstChild || !lastChild) {
          throw new Error(
            'No firstChild or lastChild. This is a editor internal bug. Please open an issue to report',
          );
        }

        const startMarkLength = firstChild.to - firstChild.from;
        const endMarkLength = lastChild.to - lastChild.from;

        return {
          range: empty
            ? EditorSelection.range(
                from - startMarkLength,
                to - startMarkLength,
              )
            : EditorSelection.range(
                firstChild.from,
                lastChild.from - endMarkLength,
              ),
          changes: [
            { from: firstChild.from, to: firstChild.to, insert: '' },
            { from: lastChild.from, to: lastChild.to, insert: '' },
          ],
        };
      }

      return {
        range: EditorSelection.range(from + mark.length, to + mark.length),
        changes: [
          { from, insert: mark },
          { from: to, to, insert: mark },
        ],
      };
    });

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

const syntaxTreeCache = new WeakMap<
  EditorState,
  ReturnType<typeof syntaxTree>
>();
function updateIconStatus(type: string): BarItem['onUpdate'] {
  return function (update, itemEl) {
    if (!syntaxTreeCache.has(update.state)) {
      syntaxTreeCache.set(update.state, syntaxTree(update.state));
    }

    const { from } = update.state.selection.main;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { type: nodeType } = syntaxTreeCache.get(update.state)!.resolve(from);
    const CHECKED_CLASS_NAME = 'editor-toolbar-item-checked';

    if (nodeType.is(type)) {
      itemEl.classList.add(CHECKED_CLASS_NAME);
    } else {
      itemEl.classList.remove(CHECKED_CLASS_NAME);
    }
  };
}

function getInlineIcon({ title, mark, type }: CONSTANTS.InlineMark): BarItem {
  return {
    className: `editor-toolbar-icon editor-toolbar-${title.toLowerCase()}-icon`,
    title,
    onClick: toggleInline({ title, mark, type }),
    onUpdate: updateIconStatus(type),
  };
}

export const boldIcon = getInlineIcon(CONSTANTS.BOLD);
export const italicIcon = getInlineIcon(CONSTANTS.ITALIC);
export const codeIcon = getInlineIcon(CONSTANTS.CODE);

/** supported by codemirror `markdownLanguage` parser
 * @see https://github.com/codemirror/lang-markdown/blob/3778e85ca81514d5f768d92095e9c341a8272fa0/src/markdown.ts#L52
 */
export const strikeThroughIcon = getInlineIcon(CONSTANTS.STRIKE_THROUGH);
export const superscriptIcon = getInlineIcon(CONSTANTS.SUPERSCRIPT);
export const subscriptIcon = getInlineIcon(CONSTANTS.SUBSCRIPT);
