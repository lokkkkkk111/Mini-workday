import { buildOrgTree } from '../../model/org.ts';
import type { OrgTreeNode } from '../../model/org.ts';
import type { SupervisoryOrg, Worker } from '../../model/types.ts';

interface OrgTreeProps {
  orgs: SupervisoryOrg[];
  workers: Worker[];
}

export function OrgTree({ orgs, workers }: OrgTreeProps) {
  const roots = buildOrgTree(orgs);

  return (
    <>
      <h2>组织树</h2>
      <ul className="org-tree">
        {roots.map((node) => (
          <OrgTreeNodeView key={node.org.id} node={node} workers={workers} />
        ))}
      </ul>
    </>
  );
}

function OrgTreeNodeView({ node, workers }: { node: OrgTreeNode; workers: Worker[] }) {
  const managerName = node.org.managerWorkerId
    ? workers.find((w) => w.id === node.org.managerWorkerId)?.legalName ?? node.org.managerWorkerId
    : '经理空缺';

  return (
    <li>
      <div className="org-node">
        <span className="org-name">{node.org.name}</span>
        <span className="org-manager">经理：{managerName}</span>
      </div>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <OrgTreeNodeView key={child.org.id} node={child} workers={workers} />
          ))}
        </ul>
      )}
    </li>
  );
}
