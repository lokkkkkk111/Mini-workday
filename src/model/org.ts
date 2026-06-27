import type { ISODate, SupervisoryOrg, Worker } from './types.ts';
import { getWorkerStateAsOf } from './worker.ts';

export interface OrgTreeNode {
  org: SupervisoryOrg;
  children: OrgTreeNode[];
}

// Direct members of an org as of a business date: workers whose version in
// effect on that date sits in this org. Membership lives in
// fields.supervisoryOrgId and changes over time, so we read it through the
// time machine rather than off any fixed version. Not-yet-hired workers
// (no version in effect) are skipped. "Direct" = this org only, not subtree.
export function getDirectMembers(
  workers: Worker[],
  orgId: string,
  asOfDate: ISODate
): Worker[] {
  return workers.filter((w) => {
    const state = getWorkerStateAsOf(w, asOfDate);
    return state?.fields.supervisoryOrgId === orgId;
  });
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
