import infoIcon from 'bootstrap-icons/icons/info-circle.svg';
import warningIcon from 'bootstrap-icons/icons/exclamation-triangle.svg';
import errorIcon from 'bootstrap-icons/icons/x-circle.svg';
import type { Diagnostic } from '@codemirror/lint';
import type { BarItem } from '../bar';
import { Events as EditorEvents } from '../../editor';
import style from './style.module.css';

const groupDiagnostics = (diagnostics: Diagnostic[]) => {
  return {
    info: diagnostics.filter(({ severity }) => severity === 'info'),
    warning: diagnostics.filter(({ severity }) => severity === 'warning'),
    error: diagnostics.filter(({ severity }) => severity === 'error'),
  };
};

export const lintStatus: BarItem = {
  className: 'lint-status-group',
  onMounted(view, el, editor) {
    const countClassName = `${editor.options.classNamePrefix}lint-status-count ${style['lint-status-count']}`;
    const className = `${editor.options.classNamePrefix}lint-status ${style['lint-status']}`;
    const template = `
        <span class="${className}">${errorIcon}<span class="${countClassName}">{{ errorCount }}</span></span>
        <span class="${className}">${warningIcon}<span class="${countClassName}">{{ warningCount }}</span></span>
        <span class="${className}">${infoIcon}<span class="${countClassName}">{{ infoCount }}</span></span>
    `;

    editor.on(EditorEvents.Lint, (diagnostics: Diagnostic[]) => {
      const { info, warning, error } = groupDiagnostics(diagnostics);

      el.innerHTML = template
        .replace('{{ errorCount }}', String(error.length))
        .replace('{{ warningCount }}', String(warning.length))
        .replace('{{ infoCount }}', String(info.length));
    });
  },
};
