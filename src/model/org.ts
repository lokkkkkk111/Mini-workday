import type { ISODate, SupervisoryOrg, Worker } from './types.ts';
import { getWorkerStateAsOf } from './worker.ts';

export interface OrgTreeNode {
  org: SupervisoryOrg;
  children: OrgTreeNode[];
}

// All org ids in the subtree rooted at rootOrgId (the node itself + every
// descendant). Reuses buildOrgTree to assemble the forest, then walks down
// from the matched node — no climbing parentOrgId. Empty set if not found.
// This is how a role anchored to an org "inherits down the whole subtree".
export function getSubtreeOrgIds(orgs: SupervisoryOrg[], rootOrgId: string): Set<string> {
  const root = findNode(buildOrgTree(orgs), rootOrgId);
  const ids = new Set<string>();
  if (!root) return ids;
  const walk = (node: OrgTreeNode) => {
    ids.add(node.org.id);
    node.children.forEach(walk);
  };
  walk(root);
  return ids;
}

function findNode(nodes: OrgTreeNode[], id: string): OrgTreeNode | null {
  for (const node of nodes) {
    if (node.org.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
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
