import type { Text } from '@codemirror/text';
import type { BarItem } from '../bar';

const pattern = /[a-zA-Z0-9_\u0392-\u03c9\u00c0-\u00ff\u0600-\u06ff\u0400-\u04ff]+|[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/g;

// https://github.com/yuehu/word-count/blob/master/index.js
function countWord(data: string) {
  const m = data.match(pattern);
  let count = 0;
  if (!m) {
    return 0;
  }
  for (let i = 0; i < m.length; i++) {
    if (m[i].charCodeAt(0) >= 0x4e00) {
      count += m[i].length;
    } else {
      count += 1;
    }
  }
  return count;
}

function countDoc(doc: Text) {
  let count = 0;
  const iter = doc.iter();
  while (!iter.next().done) {
    count += countWord(iter.value);
  }
  return `words: ${count}`;
}

export const wordCounter: BarItem = {
  className: 'editor-statusbar-word-counter',
  onMounted(view, itemEl) {
    itemEl.textContent = countDoc(view.state.doc);
  },
  onUpdate(update, itemEl) {
    if (update.docChanged) {
      itemEl.textContent = countDoc(update.state.doc);
    }
  },
};
