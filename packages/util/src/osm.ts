import { utilArrayUnion } from './array';

/**
 * Cleans tags
 * @param tags
 * @returns
 */
export function utilCleanTags(tags: object): object {
  const result = {};
  for (const [k,v] of Object.entries(tags)) {
    if (!k) continue;
    if (v !== undefined) {
      result[k] = _cleanValue(k, v);
    }
  }

  return result;

  function _keepSpaces(k) {
    return /_hours|_times|:conditional$/.test(k);
  }
  function _skip(k) {
    return /^(description|note|fixme|inscription)$/.test(k);
  }
  function _cleanValue(k, v) {
    if (_skip(k)) return v;

    let cleaned = v
      .split(';')
      .map(str => str.trim())
      .join(_keepSpaces(k) ? '; ' : ';');

    // The code below is not intended to validate websites and emails.
    // It is only intended to prevent obvious copy-paste errors. (#2323)
    // clean website- and email-like tags
    if (k.indexOf('website') !== -1 || k.indexOf('email') !== -1 || cleaned.indexOf('http') === 0) {
      cleaned = cleaned.replace(/[\u200B-\u200F\uFEFF]/g, ''); // strip LRM and other zero width chars
    }

    return cleaned;
  }
}


/** Returns an Array of entityIDs for the given entity and any descendants
 * - entityIDs passed in
 * - deep descendant entityIDs for any of those entities that are relations
 * @param ids
 * @param graph
 * @returns
 */
export function utilEntityAndDeepMemberIDs(ids: string[], graph): string[] {
  const seen = new Set<string>();
  ids.forEach(collectDeepDescendants);
  return Array.from(seen);

  function collectDeepDescendants(id: string) {
    if (seen.has(id)) return;
    seen.add(id);

    const entity = graph.hasEntity(id);
    if (!entity || entity.type !== 'relation') return;

    (entity.members || []).forEach((member) => collectDeepDescendants(member.id)); // recurse
  }
}


/**  Returns an Array that is the union of:
 * - nodes for any nodeIDs passed in
 * - child nodes of any wayIDs passed in
 * - descendant member and child nodes of relationIDs passed in
 * @param ids
 * @param graph
 * @returns
 */
export function utilGetAllNodes(ids: string[], graph): object[] {
  const seen = new Set<string>();
  const nodes = new Set<object>();

  ids.forEach(collectNodes);
  return Array.from(nodes);

  function collectNodes(id: string) {
    if (seen.has(id)) return;
    seen.add(id);

    const entity = graph.hasEntity(id);
    if (!entity) return;

    if (entity.type === 'node') {
      nodes.add(entity);
    } else if (entity.type === 'way') {
      (entity.nodes || []).forEach(collectNodes); // recurse
    } else {
      (entity.members || []).forEach((member) => collectNodes(member.id as string)); // recurse
    }
  }
}


/** Contains results for diffing old and new tags */
export interface TagDiff {
  type: string;
  key: string;
  oldVal: string | null;
  newVal: string | null;
  display: string;
}

/** Performs tag diff between old and new tags
 * @param oldTags
 * @param newTags
 * @returns the resulting diff
 */
export function utilTagDiff(oldTags: object, newTags: object): TagDiff[] {
  const tagDiff: TagDiff[] = [];
  const keys = utilArrayUnion(Object.keys(oldTags), Object.keys(newTags)).sort() as string[];
  keys.forEach(k => {
    const oldVal = oldTags[k];
    const newVal = newTags[k];

    if ((oldVal || oldVal === '') && (newVal === undefined || newVal !== oldVal)) {
      tagDiff.push({
        type: '-',
        key: k,
        oldVal: oldVal,
        newVal: newVal,
        display: `- ${k}=${oldVal}`
      });
    }
    if ((newVal || newVal === '') && (oldVal === undefined || newVal !== oldVal)) {
      tagDiff.push({
        type: '+',
        key: k,
        oldVal: oldVal,
        newVal: newVal,
        display: `+ ${k}=${newVal}`
      });
    }
  });
  return tagDiff;
}

export function utilTagText(entity): string {
  const obj = entity?.tags ?? {};
  return Object.keys(obj)
    .map(k => `${k}=${obj[k]}`)
    .join(', ');
}
