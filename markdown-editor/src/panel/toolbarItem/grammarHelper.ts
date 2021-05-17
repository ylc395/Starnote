import { syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import * as commands from '../../command';
import * as MARKS from '../..//command/marks';
import type { Command } from '@codemirror/view';
import type { BarItem } from '@/panel/bar';

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

function icon(mark: MARKS.Mark, title: string, action: Command): BarItem {
  return {
    className: `editor-toolbar-icon editor-toolbar-${mark.type}-icon`,
    title: title,
    onClick: action,
    onUpdate: updateIconStatus(mark),
  };
}

export const boldIcon = icon(MARKS.BOLD, 'toggle Bold', commands.toggleBold);
export const italicIcon = icon(
  MARKS.ITALIC,
  'toggle Italic',
  commands.toggleItalic,
);
export const codeIcon = icon(
  MARKS.INLINE_CODE,
  'toggle Inline Code',
  commands.toggleInlineCode,
);
export const heading1Icon = icon(
  MARKS.HEADING1,
  'toggle Heading1',
  commands.toggleHeading1,
);
export const heading2Icon = icon(
  MARKS.HEADING2,
  'toggle Heading2',
  commands.toggleHeading2,
);
export const heading3Icon = icon(
  MARKS.HEADING3,
  'toggle Heading3',
  commands.toggleHeading3,
);
export const heading4Icon = icon(
  MARKS.HEADING4,
  'toggle Heading4',
  commands.toggleHeading4,
);
export const heading5Icon = icon(
  MARKS.HEADING5,
  'toggle Heading',
  commands.toggleHeading5,
);
export const heading6Icon = icon(
  MARKS.HEADING6,
  'toggle Heading6',
  commands.toggleHeading6,
);
export const blockquoteIcon = icon(
  MARKS.BLOCKQUOTE,
  'toggle Blockquote',
  commands.toggleBlockquote,
);
export const bulletListIcon = icon(
  MARKS.BULLET_LIST,
  'toggle Bullet List',
  commands.toggleBulletList,
);
export const orderedListIcon = icon(
  MARKS.ORDERED_LIST,
  'toggle Ordered List',
  commands.toggleOrderedList,
);

export const taskIcon = icon(
  MARKS.TASK,
  'toggle task item',
  commands.toggleTask,
);

export const strikeThroughIcon = icon(
  MARKS.STRIKE_THROUGH,
  'toggle Strike Through',
  commands.toggleStrikeThrough,
);
export const superscriptIcon = icon(
  MARKS.SUPERSCRIPT,
  'toggle Superscript',
  commands.toggleSuperscript,
);
export const subscriptIcon = icon(
  MARKS.SUBSCRIPT,
  'toggle Subscript',
  commands.toggleSubscript,
);

export const linkIcon = icon(MARKS.LINK, 'insert Link', commands.insertLink);

export const imageIcon = icon(
  MARKS.IMAGE,
  'insert Image',
  commands.insertImage,
);

export const horizontalLineIcon = icon(
  MARKS.HORIZONTAL_LINE,
  'insert horizontal line',
  commands.insertHorizontalLine,
);
