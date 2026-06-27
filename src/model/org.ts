import type { SupervisoryOrg } from './types.ts';

export interface OrgTreeNode {
  org: SupervisoryOrg;
  children: OrgTreeNode[];
}

// Assemble the flat SupervisoryOrg list into a forest based on parentOrgId.
export function buildOrgTree(orgs: SupervisoryOrg[]): OrgTreeNode[] {
  const nodeById = new Map<string, OrgTreeNode>();
  for (const org of orgs) {
    nodeById.set(org.id, { org, children: [] });
  }

  const roots: OrgTreeNode[] = [];
  for (const org of orgs) {
    const node = nodeById.get(org.id)!;
    const parent = org.parentOrgId ? nodeById.get(org.parentOrgId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
