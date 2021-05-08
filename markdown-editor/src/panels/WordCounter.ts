import type { Text } from '@codemirror/text';
import type { Panel } from '@codemirror/panel';
import { EditorView } from '@codemirror/view';
import { showPanel } from '@codemirror/panel';

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

function wordCountPanel(view: EditorView): Panel {
  const dom = document.createElement('div');
  dom.textContent = countWords(view.state.doc);
  return {
    dom,
    update(update) {
      if (update.docChanged) dom.textContent = countWords(update.state.doc);
    },
  };
}

export function wordCounter() {
  return showPanel.of(wordCountPanel);
}
