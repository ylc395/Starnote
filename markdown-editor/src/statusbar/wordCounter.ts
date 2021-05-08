import type { Text } from '@codemirror/text';
import type { StatusbarItem } from '../types';

function countWords(doc: Text) {
  let count = 0;
  const iter = doc.iter();
  while (!iter.next().done) {
    let inWord = false;
    for (let i = 0; i < iter.value.length; i++) {
      const word = /\w/.test(iter.value[i]);
      if (word && !inWord) count++;
      inWord = word;
    }
  }
  return `Word count: ${count}`;
}

export function wordCounter(): StatusbarItem {
  return {
    className: 'editor-statusbar-word-counter',
    onInitialize(view, itemEl) {
      itemEl.textContent = countWords(view.state.doc);
    },
    onUpdate(update, view, itemEl) {
      if (update.docChanged) itemEl.textContent = countWords(update.state.doc);
    },
  };
}
