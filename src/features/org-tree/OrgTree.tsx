import { useState } from 'react';
import { buildOrgTree, getDirectMembers } from '../../model/org.ts';
import type { OrgTreeNode } from '../../model/org.ts';
import { getWorkerStateAsOf } from '../../model/worker.ts';
import { todayISODate } from '../time-machine/today.ts';
import type { SupervisoryOrg, Worker } from '../../model/types.ts';

interface OrgTreeProps {
  orgs: SupervisoryOrg[];
  workers: Worker[];
}

export function OrgTree({ orgs, workers }: OrgTreeProps) {
  const roots = buildOrgTree(orgs);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const selectedOrg = orgs.find((o) => o.id === selectedOrgId) ?? null;

  return (
    <div className="org-tree-layout">
      <div>
        <h2>组织树</h2>
        <ul className="org-tree">
          {roots.map((node) => (
            <OrgTreeNodeView
              key={node.org.id}
              node={node}
              workers={workers}
              selectedOrgId={selectedOrgId}
              onSelect={setSelectedOrgId}
            />
          ))}
        </ul>
      </div>

      <OrgMembers org={selectedOrg} workers={workers} />
    </div>
  );
}

function OrgTreeNodeView({
  node,
  workers,
  selectedOrgId,
  onSelect,
}: {
  node: OrgTreeNode;
  workers: Worker[];
  selectedOrgId: string | null;
  onSelect: (orgId: string) => void;
}) {
  const managerName = node.org.managerWorkerId
    ? workers.find((w) => w.id === node.org.managerWorkerId)?.legalName ?? node.org.managerWorkerId
    : '经理空缺';

  const isSelected = node.org.id === selectedOrgId;

  return (
    <li>
      <button
        type="button"
        className={`org-node${isSelected ? ' selected' : ''}`}
        onClick={() => onSelect(node.org.id)}
      >
        <span className="org-name">{node.org.name}</span>
        <span className="org-manager">经理：{managerName}</span>
      </button>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <OrgTreeNodeView
              key={child.org.id}
              node={child}
              workers={workers}
              selectedOrgId={selectedOrgId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function OrgMembers({ org, workers }: { org: SupervisoryOrg | null; workers: Worker[] }) {
  if (!org) {
    return (
      <div className="org-members">
        <p className="org-members-hint">点击左侧组织查看直属成员</p>
      </div>
    );
  }

  // Membership is read through the time machine as of today, so a worker shows
  // up under the org their currently-effective version places them in.
  const today = todayISODate();
  const members = getDirectMembers(workers, org.id, today);

  return (
    <div className="org-members">
      <h3>{org.name} · 直属成员</h3>
      {members.length === 0 ? (
        <p className="org-members-hint">该组织当前没有直属成员</p>
      ) : (
        <ul className="org-members-list">
          {members.map((w) => {
            const state = getWorkerStateAsOf(w, today)!;
            return (
              <li key={w.id}>
                <span className="member-name">{w.legalName}</span>
                <span className="member-role">{state.fields.jobProfile}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
