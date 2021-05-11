import { EditorSelection, Transaction } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import type { BarItem } from '../bar';

function escapeForReg(str: string) {
  const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  const reHasRegExpChar = new RegExp(reRegExpChar.source);

  return str && reHasRegExpChar.test(str)
    ? str.replace(reRegExpChar, '\\$&')
    : str;
}

function toggleInline(mark: string) {
  return function (view: EditorView) {
    const markLength = mark.length;
    const reg = new RegExp(`^${escapeForReg(mark)}.*${escapeForReg(mark)}$`);
    const changes = view.state.changeByRange((range) => {
      const { from, to } = range;
      const selectedText = view.state.sliceDoc(
        from - markLength,
        to + markLength,
      );

      if (reg.test(selectedText)) {
        return {
          range: EditorSelection.range(from - markLength, to - markLength),
          changes: [
            { from: from - markLength, to: from, insert: '' },
            { from: to, to: to + markLength, insert: '' },
          ],
        };
      }

      return {
        range: EditorSelection.range(from + markLength, to + markLength),
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

function getInlineIcon(title: string, mark: string): BarItem {
  return {
    className: `editor-toolbar-icon editor-toolbar-${title.toLowerCase()}-icon`,
    title,
    onClick: toggleInline(mark),
  };
}

export const boldIcon = getInlineIcon('Bold', '**');
export const italicIcon = getInlineIcon('Italic', '*');
export const codeIcon = getInlineIcon('Code', '`');

/** supported by codemirror `markdownLanguage` parser
 * @see https://github.com/codemirror/lang-markdown/blob/3778e85ca81514d5f768d92095e9c341a8272fa0/src/markdown.ts#L52
 */
export const strikeThroughIcon = getInlineIcon('StrikeThrough', '~~');
export const superscript = getInlineIcon('Superscript', '^');
export const subscript = getInlineIcon('Subscript', '~');
