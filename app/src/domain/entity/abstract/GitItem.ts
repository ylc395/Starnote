import { Ref } from '@vue/reactivity';

export type GitStatusMark = 'M' | 'R' | 'A' | 'D' | 'none';
export const GIT_STATUS_MARKS = ['M', 'R', 'A', 'D', 'none'] as const;
export interface GitItem {
  gitStatus: Ref<{
    mode: GitStatusMark;
    from: string | null;
  }>;
}
