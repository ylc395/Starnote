import { EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

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
