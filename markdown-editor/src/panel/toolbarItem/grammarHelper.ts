import { syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import boldIcon from 'bootstrap-icons/icons/type-bold.svg';
import italicIcon from 'bootstrap-icons/icons/type-italic.svg';
import codeIcon from 'bootstrap-icons/icons/code-slash.svg';
import h1Icon from 'bootstrap-icons/icons/type-h1.svg';
import h2Icon from 'bootstrap-icons/icons/type-h2.svg';
import h3Icon from 'bootstrap-icons/icons/type-h3.svg';
import blockquoteIcon from 'bootstrap-icons/icons/blockquote-left.svg';
import ulIcon from 'bootstrap-icons/icons/list-ul.svg';
import olIcon from 'bootstrap-icons/icons/list-ol.svg';
import taskIcon from 'bootstrap-icons/icons/list-task.svg';
import strikethroughIcon from 'bootstrap-icons/icons/type-strikethrough.svg';
import linkIcon from 'bootstrap-icons/icons/link.svg';
import imageIcon from 'bootstrap-icons/icons/image.svg';
import dashIcon from 'bootstrap-icons/icons/dash.svg';
import subtractIcon from 'bootstrap-icons/icons/subtract.svg';
import type { Command } from '@codemirror/view';

import * as commands from '../../command';
import * as MARKS from '../../command/marks';
import type { BarItem } from '@/panel/bar';
import style from '../style.css';

const syntaxTreeCache = new WeakMap<EditorState, commands.SyntaxTree>();
function updateIconStatus(mark: MARKS.Mark): BarItem['onUpdate'] {
  return function (update, itemEl) {
    if (!syntaxTreeCache.has(update.state)) {
      syntaxTreeCache.set(update.state, syntaxTree(update.state));
    }

    const { from } = update.state.selection.main;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const node = syntaxTreeCache.get(update.state)!.resolve(from);
    const CHECKED_CLASS_NAME = 'editor-toolbar-item-checked';

    if (commands.isMarkOf(node, mark)) {
      itemEl.classList.add(CHECKED_CLASS_NAME);
    } else {
      itemEl.classList.remove(CHECKED_CLASS_NAME);
    }
  };
}

function button({
  title,
  action,
  mark,
  icon,
}: {
  mark: MARKS.Mark;
  title: string;
  action: Command;
  icon: string;
}): BarItem {
  return {
    className: style['toolbar-item-button'],
    htmlTag: 'button',
    htmlContent: icon,
    title: title,
    onClick: action,
    onUpdate: updateIconStatus(mark),
  };
}

export const boldButton = button({
  mark: MARKS.BOLD,
  title: 'toggle Bold',
  action: commands.toggleBold,
  icon: boldIcon,
});
export const italicButton = button({
  mark: MARKS.ITALIC,
  title: 'toggle Italic',
  action: commands.toggleItalic,
  icon: italicIcon,
});
export const codeButton = button({
  mark: MARKS.INLINE_CODE,
  title: 'toggle Inline Code',
  action: commands.toggleInlineCode,
  icon: codeIcon,
});
export const heading1Button = button({
  mark: MARKS.HEADING1,
  title: 'toggle Heading1',
  action: commands.toggleHeading1,
  icon: h1Icon,
});
export const heading2Button = button({
  mark: MARKS.HEADING2,
  title: 'toggle Heading2',
  action: commands.toggleHeading2,
  icon: h2Icon,
});
export const heading3Button = button({
  mark: MARKS.HEADING3,
  title: 'toggle Heading3',
  action: commands.toggleHeading3,
  icon: h3Icon,
});
export const heading4Button = button({
  mark: MARKS.HEADING4,
  title: 'toggle Heading4',
  action: commands.toggleHeading4,
  icon: h3Icon,
});
export const heading5Button = button({
  mark: MARKS.HEADING5,
  title: 'toggle Heading',
  action: commands.toggleHeading5,
  icon: h3Icon,
});
export const heading6Button = button({
  mark: MARKS.HEADING6,
  title: 'toggle Heading6',
  action: commands.toggleHeading6,
  icon: h3Icon,
});
export const blockquoteButton = button({
  mark: MARKS.BLOCKQUOTE,
  title: 'toggle Blockquote',
  action: commands.toggleBlockquote,
  icon: blockquoteIcon,
});
export const bulletListButton = button({
  mark: MARKS.BULLET_LIST,
  title: 'toggle Bullet List',
  action: commands.toggleBulletList,
  icon: ulIcon,
});
export const orderedListButton = button({
  mark: MARKS.ORDERED_LIST,
  title: 'toggle Ordered List',
  action: commands.toggleOrderedList,
  icon: olIcon,
});

export const taskButton = button({
  mark: MARKS.TASK,
  title: 'toggle task item',
  action: commands.toggleTask,
  icon: taskIcon,
});

export const strikeThroughButton = button({
  mark: MARKS.STRIKE_THROUGH,
  title: 'toggle Strike Through',
  action: commands.toggleStrikeThrough,
  icon: strikethroughIcon,
});
export const superscriptButton = button({
  mark: MARKS.SUPERSCRIPT,
  title: 'toggle Superscript',
  action: commands.toggleSuperscript,
  icon: subtractIcon,
});
export const subscriptButton = button({
  mark: MARKS.SUBSCRIPT,
  title: 'toggle Subscript',
  action: commands.toggleSubscript,
  icon: subtractIcon,
});

export const linkButton = button({
  mark: MARKS.LINK,
  title: 'insert Link',
  action: commands.insertLink,
  icon: linkIcon,
});

export const imageButton = button({
  mark: MARKS.IMAGE,
  title: 'insert Image',
  action: commands.insertImage,
  icon: imageIcon,
});

export const horizontalLineButton = button({
  mark: MARKS.HORIZONTAL_LINE,
  title: 'insert horizontal line',
  action: commands.insertHorizontalLine,
  icon: dashIcon,
});
