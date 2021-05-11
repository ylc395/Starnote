import { EditorSelection, Transaction } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import type { BarItem } from '../bar';

export function toggleBold(view: EditorView) {
  const changes = view.state.changeByRange((range) => {
    const { from, to } = range;

    return {
      range: EditorSelection.range(range.from + 2, range.to + 2),
      changes: [
        { from, insert: '**' },
        { from: to, to, insert: '**' },
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
}

export const boldIcon: BarItem = {
  className: 'editor-toolbar-icon editor-toolbar-bold-icon',
  title: 'Bold',
  onClick: toggleBold,
};
