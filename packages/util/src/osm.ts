import { utilArrayUnion } from './array';

/**
 * Cleans tags
 * @param tags
 * @returns
 */
export function utilCleanTags(tags) {
  let out = {};
  for (const k in tags) {
    if (!k) continue;
    const v = tags[k];
    if (v !== undefined) {
      out[k] = cleanValue(k, v);
    }
  }

  return out;

  function cleanValue(k, v) {
    function keepSpaces(k) {
      return /_hours|_times|:conditional$/.test(k);
    }
    function skip(k) {
      return /^(description|note|fixme)$/.test(k);
    }

    if (skip(k)) return v;

    let cleaned = v
      .split(';')
      .map((str) => str.trim())
      .join(keepSpaces(k) ? '; ' : ';');

    // The code below is not intended to validate websites and emails.
    // It is only intended to prevent obvious copy-paste errors. (#2323)
    // clean website- and email-like tags
    if (k.indexOf('website') !== -1 || k.indexOf('email') !== -1 || cleaned.indexOf('http') === 0) {
      cleaned = cleaned.replace(/[\u200B-\u200F\uFEFF]/g, ''); // strip LRM and other zero width chars
    }

    return cleaned;
  }
}


/** Returns an array of entityIDs for the given entity and any descendants
 * - entityIDs passed in
 * - deep descendant entityIDs for any of those entities that are relations
 * @param ids
 * @param graph
 * @returns
 */
export function utilEntityAndDeepMemberIDs(ids: string[], graph) {
  const seen = new Set<string>();
  ids.forEach(collectDeepDescendants);
  return Array.from(seen);

  function collectDeepDescendants(id: string) {
    if (seen.has(id)) return;
    seen.add(id);

    let entity = graph.hasEntity(id);
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
export function utilGetAllNodes(ids: string[], graph) {
  const seen = new Set<string>();
  const nodes = new Set();

  ids.forEach(collectNodes);
  return Array.from(nodes);

  function collectNodes(id: string) {
    if (seen.has(id)) return;
    seen.add(id);

    let entity = graph.hasEntity(id);
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

type TagDiff = {
  type: string;
  key: string;
  oldVal: any;
  newVal: any;
  display: string;
};

/** Performs tag diff between old and new tags
 * @param oldTags
 * @param newTags
 * @returns the resulting diff
 */
export function utilTagDiff(oldTags, newTags) {
  let tagDiff: TagDiff[] = [];
  const keys = utilArrayUnion(Object.keys(oldTags), Object.keys(newTags)).sort() as string[];
  keys.forEach((k) => {
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

export function utilTagText(entity) {
  const obj = (entity && entity.tags) || {};
  return Object.keys(obj)
    .map((k) => `${k}=${obj[k]}`)
    .join(', ');
}
