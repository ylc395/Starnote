import infoIcon from 'bootstrap-icons/icons/info-square.svg';
import warningIcon from 'bootstrap-icons/icons/exclamation-square.svg';
import errorIcon from 'bootstrap-icons/icons/x-square.svg';
import type { Diagnostic } from '@codemirror/lint';
import type { BarItem } from '../bar';
import { Events as EditorEvents } from '../../editor';
import style from './style.css';

const template = `
<div>
    <span class=${style['lint-status']}>${errorIcon}{{ errorCount }}</span>
    <span class=${style['lint-status']}>${warningIcon}{{ warningCount }}</span>
    <span class=${style['lint-status']}>${infoIcon}{{ infoCount }}</span>
</div>
`;

const groupDiagnostics = (diagnostics: Diagnostic[]) => {
  return {
    info: diagnostics.filter(({ severity }) => severity === 'info'),
    warning: diagnostics.filter(({ severity }) => severity === 'warning'),
    error: diagnostics.filter(({ severity }) => severity === 'error'),
  };
};

export const lintStatus: BarItem = {
  onMounted(view, el, editor) {
    editor.on(EditorEvents.Lint, (diagnostics: Diagnostic[]) => {
      const { info, warning, error } = groupDiagnostics(diagnostics);

      el.innerHTML = template
        .replace('{{ errorCount }}', String(error.length))
        .replace('{{ warningCount }}', String(warning.length))
        .replace('{{ infoCount }}', String(info.length));
    });
  },
};
