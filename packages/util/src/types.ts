/**
 * 💭 Common type signatures for the util package
 * @module
 */

/** Contains results for diffing old and new tags */
export interface TagDiff {
  type: string;
  key: string;
  oldVal: string | null;
  newVal: string | null;
  display: string;
};
