import type MarkdownIt from 'markdown-it';
import type { RenderRule } from 'markdown-it/lib/renderer';
export function sourceMap(md: MarkdownIt) {
  const rules = [
    'paragraph_open',
    'heading_open',
    'image',
    'code_block',
    'fence',
    'blockquote_open',
    'list_item_open',
  ];

  for (const rule of rules) {
    const original = md.renderer.rules[rule];
    const newRule: RenderRule = (tokens, idx, options, env, self) => {
      const token = tokens[idx];

      if (token.map && token.map.length) {
        token.attrSet('data-source-line', String(token.map[0]));
      }

      if (original) {
        return original(tokens, idx, options, env, self);
      } else {
        return self.renderToken(tokens, idx, options);
      }
    };

    md.renderer.rules[rule] = newRule;
  }
}
