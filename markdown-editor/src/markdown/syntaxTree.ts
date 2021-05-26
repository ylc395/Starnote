import { EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import * as MARKS from './marks';

export type SyntaxTree = ReturnType<typeof syntaxTree>;
export type SyntaxNode = ReturnType<SyntaxTree['resolve']>;

const syntaxTreeCache = new WeakMap<EditorState, SyntaxTree>();
function getSyntaxTreeOfState(state: EditorState) {
  if (!syntaxTreeCache.has(state)) {
    syntaxTreeCache.set(state, syntaxTree(state));
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return syntaxTreeCache.get(state)!;
}

export function getNodeAt(
  state: EditorState,
  pos: number,
  side: -1 | 0 | 1 = 0,
) {
  return getSyntaxTreeOfState(state).resolve(pos, side);
}

export function isMarkOf(node: SyntaxNode, { type, markType }: MARKS.Mark) {
  if (node.type.is(type)) {
    return true;
  }

  if (markType && node.type.is(markType)) {
    if (node.parent && node.parent.type.is(type)) {
      return true;
    }

    if (node.parent?.type.is('ListItem')) {
      const grandParent = node.parent.parent;

      if (grandParent?.type.is(type)) {
        return true;
      }
    }
  }

  return node.type.is(`${type}Mark`);
}

const BLOCK_MARKS = Object.values(MARKS).filter((mark) => mark.isBlock);
export function getBlockMark(state: EditorState, pos: number) {
  const lineStart = state.doc.lineAt(pos).from;
  const node = getSyntaxTreeOfState(state).resolve(lineStart, 1);

  for (const mark of BLOCK_MARKS) {
    if (isMarkOf(node, mark)) {
      return mark;
    }
  }

  return null;
}
