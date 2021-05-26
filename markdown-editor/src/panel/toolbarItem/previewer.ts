import layoutSplit from 'bootstrap-icons/icons/layout-split.svg';
import type { BarItem } from '../bar';
export const togglePreviewButton: BarItem = {
  htmlContent: layoutSplit,
  title: 'toggle layout',
  onClick: (view, el, editor) => {
    editor.toggleLayout();
  },
};
