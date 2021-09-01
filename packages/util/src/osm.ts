import { utilArrayUnion } from './array';

//
//
//
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

// Generate a css selector for multiple entities
// class1, class2 -> .class1,.class2
//
export function utilEntitySelector(ids: string[]) {
  return ids.length ? '.' + ids.join(',.') : 'nothing';
}

// returns a selector to select entity ids for:
//  - entityIDs passed in
//  - shallow descendant entityIDs for any of those entities that are relations
export function utilEntityOrMemberSelector(ids: string[], graph) {
  let seen = new Set(ids);
  ids.forEach(collectShallowDescendants);
  return utilEntitySelector(Array.from(seen));

  function collectShallowDescendants(id: string) {
    var entity = graph.hasEntity(id);
    if (!entity || entity.type !== 'relation') return;

    (entity.members || []).forEach((member) => seen.add(member.id));
  }
}

// returns a selector to select entity ids for:
//  - entityIDs passed in
//  - deep descendant entityIDs for any of those entities that are relations
export function utilEntityOrDeepMemberSelector(ids: string[], graph) {
  return utilEntitySelector(utilEntityAndDeepMemberIDs(ids, graph));
}

// returns a selector to select entity ids for:
//  - entityIDs passed in
//  - deep descendant entityIDs for any of those entities that are relations
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

// returns a selector to select entity ids for:
//  - deep descendant entityIDs for any of those entities that are relations
export function utilDeepMemberSelector(ids: string[], graph, skipMultipolgonMembers: boolean) {
  let idsSet = new Set(ids);
  let seen = new Set<string>();
  let returners = new Set<string>();
  ids.forEach(collectDeepDescendants);
  return utilEntitySelector(Array.from(returners));

  function collectDeepDescendants(id: string) {
    if (seen.has(id)) return;
    seen.add(id);

    if (!idsSet.has(id)) {
      returners.add(id);
    }

    let entity = graph.hasEntity(id);
    if (!entity || entity.type !== 'relation') return;
    if (skipMultipolgonMembers && entity.isMultipolygon()) return;

    (entity.members || []).forEach((member) => collectDeepDescendants(member.id)); // recurse
  }
}

// returns an Array that is the union of:
//  - nodes for any nodeIDs passed in
//  - child nodes of any wayIDs passed in
//  - descendant member and child nodes of relationIDs passed in
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

//
//
//
type TagDiff = {
  type: string;
  key: string;
  oldVal: any;
  newVal: any;
  display: string;
};

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

//
//
//
export function utilTagText(entity) {
  const obj = (entity && entity.tags) || {};
  return Object.keys(obj)
    .map((k) => `${k}=${obj[k]}`)
    .join(', ');
}
