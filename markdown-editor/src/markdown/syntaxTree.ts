import { EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import type { Mark } from './marks';
import { BLOCK_MARKS } from './marks';

export type SyntaxTree = ReturnType<typeof syntaxTree>;
export type SyntaxNode = ReturnType<SyntaxTree['resolve']>;

const syntaxTreeCache = new WeakMap<EditorState, SyntaxTree>();
export function getSyntaxTreeOfState(state: EditorState) {
  if (!syntaxTreeCache.has(state)) {
    syntaxTreeCache.set(state, syntaxTree(state));
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return syntaxTreeCache.get(state)!;
}

export function isMarkOf(node: SyntaxNode, mark: Mark) {
  return (
    node.type.is(mark.type) ||
    (mark.markType &&
      node.type.is(mark.markType) &&
      node.parent &&
      node.parent.type.is(mark.type)) ||
    node.type.is(`${mark.type}Mark`)
  );
}

export function getBlockMark(tree: SyntaxTree, lineFrom: number) {
  const node = tree.resolve(lineFrom, 1);
  for (const mark of BLOCK_MARKS) {
    if (isMarkOf(node, mark)) {
      return mark;
    }
  }

  return null;
}
