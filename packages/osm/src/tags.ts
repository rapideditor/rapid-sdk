
// "Strict" tags are stored in a `Map` to avoid key conflicts with
// reserved JavaScript keywords like `__proto__` and `constructor`
export type StrictTags = Map<string, string | undefined>;

// Tags are often stored and passed around in plain Object pairs:
// e.g. `{ highway: 'residential', surface: 'paved' }`
// "Loose" tags are for any value that might be an Object, or might be a Strict tag Map.
export type LooseTags = Record<string, string | undefined>;

// `KeepDiscard` Objects represent a keeplist/discardlist of tags.
// A closed way with a tag (k, v) is assumed to be an area `if k in L && !(v in L[k])` (see iD.osmWay#isArea()).
// In other words, the keys of `L` form the keeplist, and the subkeys form the discardlist
// {
//   "areaKeys": {
//     …
//     "landuse": { },         // `landuse=*` is assumed to be an area…
//     "leisure": {            // `leisure=*` is assumed to be an area, except…
//       "slipway": true,      //    `leisure=slipway` is a line
//       "track": true         //    `leisure=track` is a line
//     },
//     …
//   }
// }
export type KeepDiscard = Record<string, Record<string, boolean | string> >;

//
//
export function osmIsInterestingTag(key: string): boolean {
  return (
    key !== 'attribution' &&
    key !== 'created_by' &&
    key !== 'source' &&
    key !== 'odbl' &&
    key.indexOf('source:') !== 0 &&
    key.indexOf('source_ref') !== 0 && // purposely exclude colon
    key.indexOf('tiger:') !== 0
  );
}

//
//
export let osmAreaKeys: KeepDiscard = {};
export function osmSetAreaKeys(value: KeepDiscard) {
  osmAreaKeys = value;
}

//
// returns an object with the tag from `tags` that implies an area geometry, if any
export function osmTagSuggestingArea(other: LooseTags): LooseTags | null {
  let tags: StrictTags;
  if (other instanceof Map) {
    tags = other;
  } else if (other instanceof Object) {
    tags = new Map(Object.entries(other));
  } else {
    return null;
  }

  if (tags.get('area') === 'yes') return { area: 'yes' };
  if (tags.get('area') === 'no') return null;

  // `highway` and `railway` are typically linear features, but there
  // are a few exceptions that should be treated as areas, even in the
  // absence of a proper `area=yes` or `areaKeys` tag.. see #4194
  let lineKeys: KeepDiscard = {
    highway: {
      rest_area: true,
      services: true
    },
    railway: {
      roundhouse: true,
      station: true,
      traverser: true,
      turntable: true,
      wash: true
    }
  };

  let returnTags: LooseTags = {};
  for (const k of tags) {
    const v: string = tags.get(k) || '';
    if ((k in osmAreaKeys) && !(v in osmAreaKeys[k])) {
      returnTags[k] = v;
      return returnTags;
    }
    if ((k in lineKeys) && (v in lineKeys[k])) {
      returnTags[k] = v;
      return returnTags;
    }
  }
  return null;
}


// Tags that indicate a node can be a standalone point
// e.g. { amenity: { bar: true, parking: true, ... } ... }
export let osmPointTags: KeepDiscard = {};
export function osmSetPointTags(value: KeepDiscard) {
  osmPointTags = value;
}
// Tags that indicate a node can be part of a way
// e.g. { amenity: { parking: true, ... }, highway: { stop: true ... } ... }
export let osmVertexTags: KeepDiscard = {};
export function osmSetVertexTags(value: KeepDiscard) {
  osmVertexTags = value;
}

//
//
export interface NodeGeometriesResult {
  point?: boolean;
  vertex?: boolean;
}
export function osmNodeGeometriesForTags(nodeTags: LooseTags): NodeGeometriesResult {
  let geometries: NodeGeometriesResult = {};
  for (let key in nodeTags) {
    if (osmPointTags[key] && (osmPointTags[key]['*'] || osmPointTags[key][nodeTags[key]])) {
      geometries.point = true;
    }
    if (osmVertexTags[key] && (osmVertexTags[key]['*'] || osmVertexTags[key][nodeTags[key]])) {
      geometries.vertex = true;
    }
    // break early if both are already supported
    if (geometries.point && geometries.vertex) break;
  }
  return geometries;
}

export let osmOneWayTags: KeepDiscard = {
  aerialway: {
    chair_lift: true,
    drag_lift: true,
    'j-bar': true,
    magic_carpet: true,
    mixed_lift: true,
    platter: true,
    rope_tow: true,
    't-bar': true,
    zip_line: true
  },
  highway: {
    motorway: true
  },
  junction: {
    circular: true,
    roundabout: true
  },
  man_made: {
    goods_conveyor: true,
    'piste:halfpipe': true
  },
  'piste:type': {
    downhill: true,
    sled: true,
    yes: true
  },
  waterway: {
    canal: true,
    ditch: true,
    drain: true,
    fish_pass: true,
    river: true,
    stream: true,
    tidal_channel: true
  }
};

// solid and smooth surfaces akin to the assumed default road surface in OSM
export let osmPavedTags: KeepDiscard = {
  surface: {
    paved: true,
    asphalt: true,
    concrete: true,
    'concrete:lanes': true,
    'concrete:plates': true
  },
  tracktype: {
    grade1: true
  }
};

// solid, if somewhat uncommon surfaces with a high range of smoothness
export let osmSemipavedTags: KeepDiscard = {
  surface: {
    cobblestone: true,
    'cobblestone:flattened': true,
    unhewn_cobblestone: true,
    sett: true,
    paving_stones: true,
    metal: true,
    wood: true
  }
};

export let osmRightSideIsInsideTags: KeepDiscard = {
  natural: {
    cliff: true,
    coastline: 'coastline'
  },
  barrier: {
    retaining_wall: true,
    kerb: true,
    guard_rail: true,
    city_wall: true
  },
  man_made: {
    embankment: true
  },
  waterway: {
    weir: true
  }
};

// "highway" tag values for pedestrian or vehicle right-of-ways that make up the routable network
// (does not include `raceway`)
export let osmRoutableHighwayTagValues: Record<string, boolean> = {
  motorway: true,
  trunk: true,
  primary: true,
  secondary: true,
  tertiary: true,
  residential: true,
  motorway_link: true,
  trunk_link: true,
  primary_link: true,
  secondary_link: true,
  tertiary_link: true,
  unclassified: true,
  road: true,
  service: true,
  track: true,
  living_street: true,
  bus_guideway: true,
  path: true,
  footway: true,
  cycleway: true,
  bridleway: true,
  pedestrian: true,
  corridor: true,
  steps: true
};
// "highway" tag values that generally do not allow motor vehicles
export let osmPathHighwayTagValues: Record<string, boolean> = {
  path: true,
  footway: true,
  cycleway: true,
  bridleway: true,
  pedestrian: true,
  corridor: true,
  steps: true
};

// "railway" tag values representing existing railroad tracks (purposely does not include 'abandoned')
export let osmRailwayTrackTagValues: Record<string, boolean> = {
  rail: true,
  light_rail: true,
  tram: true,
  subway: true,
  monorail: true,
  funicular: true,
  miniature: true,
  narrow_gauge: true,
  disused: true,
  preserved: true
};

// "waterway" tag values for line features representing water flow
export let osmFlowingWaterwayTagValues: Record<string, boolean> = {
  canal: true,
  ditch: true,
  drain: true,
  fish_pass: true,
  river: true,
  stream: true,
  tidal_channel: true
};
