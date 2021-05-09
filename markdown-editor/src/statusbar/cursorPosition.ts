import type { EditorState, Text } from '@codemirror/state';
import type { StatusbarItem } from './bar';

function getLineAndCol(pos: number, doc: Text) {
  const line = doc.lineAt(pos).number;
  let passedChar = 0;

  for (let i = 1; i < line; i++) {
    const l = doc.line(i);
    passedChar += l.length + 1; // 1 means line break
  }

  return { line, col: pos - passedChar };
}

function getPosition(state: EditorState) {
  const pos = state.selection.main.head;
  const { line, col } = getLineAndCol(pos, state.doc);

  return `${line}:${col}`;
}

export function cursorPosition(): StatusbarItem {
  return {
    className: 'editor-statusbar-cursor-position',
    onMounted(view, itemEl) {
      itemEl.textContent = getPosition(view.state);
    },
    onUpdate(update, view, itemEl) {
      itemEl.textContent = getPosition(update.state);
    },
  };
}
