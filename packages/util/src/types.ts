/**
 * 💭 Common type signatures for the util package
 * @module
 */

/**
 * For our purposes, we limit iterables to Arrays and Sets (no Maps, strings, etc.)
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol
 */
export type Iterable<T> = T[] | Set<T>;

/** Allows a single value or an iterable of values (Array or Set). */
export type OneOrMore<T> = T | Iterable<T>;

/** Allows a value to be null or undefined. */
export type Nullable<T> = T | null | undefined;

/** OSM tags as key-value string pairs */
export type OsmTags = Record<string, string>;

/** The parts of an OSM entity that the OSM utilities read */
export interface OsmEntityLike {
  type: string;
  tags?: OsmTags;
  nodes?: string[];
  members?: Array<{ id: string }>;
}

/** The parts of an OSM graph that the OSM utilities read */
export interface OsmGraphLike<E extends OsmEntityLike = OsmEntityLike> {
  hasEntity(id: string): Nullable<E>;
}

/** The object returned by `utilSessionMutex` */
export interface SessionMutex {
  /** Takes the lock if no other session holds it, returns `true` if this session holds it */
  lock(): boolean;
  /** Releases the lock if this session holds it */
  unlock(): void;
  /** Returns `true` if this session holds the lock */
  locked(): boolean;
}

/** Contains results from `utilTagDiff` for diffing old and new tags */
export interface TagDiff {
  type: string;
  key: string;
  oldVal?: string | undefined;
  newVal?: string | undefined;
  display: string;
};
