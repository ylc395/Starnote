import type { Ref } from '@vue/reactivity';

export type GitStatusMark = 'M' | 'R' | 'A' | 'D' | 'unknown';
export interface GitItem {
  gitStatus: Ref<GitStatusMark>;
}
