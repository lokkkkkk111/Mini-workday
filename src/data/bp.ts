import type { BPDefinition } from '../model/types.ts';

// "转岗 (Change Job)" 业务流程定义。
// 步骤有序：发起 → 经理审批 → HRBP 审批 → 完成。
// 两级 APPROVAL 体现多级审批；MANAGER = subject 当前所在组织的经理，
// HRBP = 锚定在 subject 所在组织（或其祖先）上的 HRBP（US-2.3 的继承规则）。
// 仅为流程定义数据；发起 / 推进 / UI 在 US-3.2 起实现。
export const changeJobProcess: BPDefinition = {
  id: 'bp-change-job',
  name: '转岗 (Change Job)',
  steps: [
    {
      id: 'step-initiation',
      type: 'INITIATION',
      name: '发起转岗',
    },
    {
      id: 'step-approval-manager',
      type: 'APPROVAL',
      name: '经理审批',
      approverRule: 'MANAGER',
    },
    {
      id: 'step-approval-hrbp',
      type: 'APPROVAL',
      name: 'HRBP 审批',
      approverRule: 'HRBP',
    },
    {
      id: 'step-completion',
      type: 'COMPLETION',
      name: '完成转岗',
    },
  ],
};
