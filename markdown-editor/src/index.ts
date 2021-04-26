import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { defaultKeymap } from '@codemirror/commands';
import { Subject } from 'rxjs';

export class Editor {
  private readonly view: EditorView;
  private readonly _event$ = new Subject<{ event: 'update'; data: string }>();
  readonly event$ = this._event$.asObservable();

  constructor({ el }: { el: HTMLElement }) {
    this.view = new EditorView({ parent: el });
  }

  setContent(text: string) {
    this.view.setState(
      EditorState.create({
        doc: text,
        extensions: [
          markdown(),
          defaultHighlightStyle,
          keymap.of(defaultKeymap),
          EditorView.updateListener.of((v: ViewUpdate) => {
            if (v.docChanged) {
              const content = v.state.doc.toJSON().join('\n');
              this._event$.next({ event: 'update', data: content });
            }
          }),
        ],
      }),
    );
  }

  destroy() {
    this.view.destroy();
  }

  focus() {
    this.view.focus();
  }
}
