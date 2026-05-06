/**
 * 💭 Common type signatures for the util package
 * @module
 */


/** OSM tags as key-value string pairs */
export type OsmTags = Record<string, string | null | undefined>;

/** Contains results from `utilTagDiff` for diffing old and new tags */
export interface TagDiff {
  type: string;
  key: string;
  oldVal?: string | null | undefined;
  newVal?: string | null | undefined;
  display: string;
};
