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

// Returns a single object containing the tags of all the given entities.
// Example:
// {
//   highway: 'service',
//   service: 'parking_aisle'
// }
//           +
// {
//   highway: 'service',
//   service: 'driveway',
//   width: '3'
// }
//           =
// {
//   highway: 'service',
//   service: [ 'driveway', 'parking_aisle' ],
//   width: [ '3', undefined ]
// }
export function utilCombinedTags(entityIDs: [string], graph) {
  let tags = {};
  let tagCounts = {};
  let allKeys: Set<string> = new Set();

  const entities = entityIDs.map((entityID) => graph.hasEntity(entityID)).filter(Boolean);

  // gather the aggregate keys
  entities.forEach((entity) => {
    const keys = Object.keys(entity.tags).filter(Boolean);
    keys.forEach((key) => allKeys.add(key));
  });

  entities.forEach((entity) => {
    allKeys.forEach((k) => {
      let v = entity.tags[k]; // purposely allow `undefined`

      if (!tags.hasOwnProperty(k)) {
        // first value, set as raw
        tags[k] = v;
      } else {
        if (!Array.isArray(tags[k])) {
          if (tags[k] !== v) {
            // first alternate value, replace single value with array
            tags[k] = [tags[k], v];
          }
        } else {
          // type is array
          if (tags[k].indexOf(v) === -1) {
            // subsequent alternate value, add to array
            tags[k].push(v);
          }
        }
      }

      let tagHash = `${k}=${v}`;
      if (!tagCounts[tagHash]) tagCounts[tagHash] = 0;
      tagCounts[tagHash] += 1;
    });
  });

  for (let k in tags) {
    if (!Array.isArray(tags[k])) continue;

    // sort values by frequency then alphabetically
    tags[k] = tags[k].sort((val1, val2) => {
      const key = k;
      const count2 = tagCounts[key + '=' + val2];
      const count1 = tagCounts[key + '=' + val1];
      if (count2 !== count1) return count2 - count1;
      if (val2 && val1) return val1.localeCompare(val2);
      return val1 ? 1 : -1;
    });
  }

  return tags;
}

//
//
//
export function utilEntityRoot(entityType) {
  return {
    node: 'n',
    way: 'w',
    relation: 'r'
  }[entityType];
}

//
//
//
export function utilEntitySelector(ids) {
  return ids.length ? '.' + ids.join(',.') : 'nothing';
}

// returns an selector to select entity ids for:
//  - entityIDs passed in
//  - shallow descendant entityIDs for any of those entities that are relations
export function utilEntityOrMemberSelector(ids, graph) {
  let seen = new Set(ids);
  ids.forEach(collectShallowDescendants);
  return utilEntitySelector(Array.from(seen));

  function collectShallowDescendants(id) {
    var entity = graph.hasEntity(id);
    if (!entity || entity.type !== 'relation') return;

    (entity.members || []).forEach((member) => seen.add(member.id));
  }
}

// returns an selector to select entity ids for:
//  - entityIDs passed in
//  - deep descendant entityIDs for any of those entities that are relations
export function utilEntityOrDeepMemberSelector(ids, graph) {
  return utilEntitySelector(utilEntityAndDeepMemberIDs(ids, graph));
}

// returns an selector to select entity ids for:
//  - entityIDs passed in
//  - deep descendant entityIDs for any of those entities that are relations
export function utilEntityAndDeepMemberIDs(ids, graph) {
  let seen = new Set();
  ids.forEach(collectDeepDescendants);
  return Array.from(seen);

  function collectDeepDescendants(id) {
    if (seen.has(id)) return;
    seen.add(id);

    let entity = graph.hasEntity(id);
    if (!entity || entity.type !== 'relation') return;

    (entity.members || []).forEach((member) => collectDeepDescendants(member.id)); // recurse
  }
}

// returns an selector to select entity ids for:
//  - deep descendant entityIDs for any of those entities that are relations
export function utilDeepMemberSelector(ids, graph, skipMultipolgonMembers) {
  let idsSet = new Set(ids);
  let seen = new Set();
  let returners = new Set();
  ids.forEach(collectDeepDescendants);
  return utilEntitySelector(Array.from(returners));

  function collectDeepDescendants(id) {
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
export function utilGetAllNodes(ids, graph) {
  let seen = new Set();
  let nodes = new Set();

  ids.forEach(collectNodes);
  return Array.from(nodes);

  function collectNodes(id) {
    if (seen.has(id)) return;
    seen.add(id);

    let entity = graph.hasEntity(id);
    if (!entity) return;

    if (entity.type === 'node') {
      nodes.add(entity);
    } else if (entity.type === 'way') {
      (entity.nodes || []).forEach(collectNodes); // recurse
    } else {
      (entity.members || []).forEach((member) => collectNodes(member.id)); // recurse
    }
  }
}

//
//
//
type TagDiff = {
  type: string,
  key: string,
  oldVal: any,
  newVal: any,
  display: string
};

export function utilTagDiff(oldTags, newTags) {
  let tagDiff: TagDiff[] = [];
  const keys = utilArrayUnion(Object.keys(oldTags), Object.keys(newTags)).sort() as [string];
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
