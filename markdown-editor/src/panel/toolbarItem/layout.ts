import layoutSplit from 'bootstrap-icons/icons/layout-split.svg';
import fullscreen from 'bootstrap-icons/icons/arrows-fullscreen.svg';
import type { BarItem } from '../bar';
import style from '../style.css';
export const togglePreviewButton: BarItem = {
  htmlContent: layoutSplit,
  title: 'toggle layout',
  onClick(view, el, editor) {
    editor.toggleLayout();
  },
};

export const toggleFullscreen: BarItem = {
  htmlContent: fullscreen,
  title: 'toggle fullscreen',
  onClick(view, el, editor) {
    editor.toggleFullscreen();
    el.classList.toggle(style['toolbar-item-checked']);
  },
};
