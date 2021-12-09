// external
import { Extent } from '@id-sdk/math';
import { utilArrayUnion, utilUnicodeCharsTruncated } from '@id-sdk/util';

// internal
import { StrictTags, LooseTags, osmIsInterestingTag, osmToStrictTags } from './tags';


let nextNumber: Record<string, number> = {};

/**
 *
 */
export class Entity {
  readonly type: string;
  readonly id: string;
  readonly v: number;         // internal version
  readonly version?: number;  // osm version
  readonly visible: boolean;  // osm visible
  readonly tags: StrictTags;


  constructor(props?: Entity | Record<string, any>) {
    props = Object.assign({}, props);

    this.type = props.type || 'entity';

    if (!nextNumber[this.type]) {
      nextNumber[this.type] = 0;
    }

    const num = --nextNumber[this.type];
    const c = this.type[0];
    this.id = props.id || `${c}${num}`;  // OSM id: 'n-1', 'w-1', etc

    this.v = (props.v || 0) + 1;
    this.version = props.version;
    this.visible = (props.visible !== false);

    if (props.tags instanceof Map) {
      this.tags = new Map(props.tags);
    } else {
      this.tags = osmToStrictTags(props.tags);
    }
  }


  // Convenience methods for dealing with ids
  static id = {
    fromOSM: (type: string, id: string): string => type[0] + id,
    toOSM: (id: string): string => id.slice(1)
  };

  // A function suitable for use as the second argument to d3.selection#data().
  static key(entity: Entity): string {
    return entity.id + 'v' + entity.v;
  }

  //   _deprecatedTagValuesByKey;
  // Entity.deprecatedTagValuesByKey = function(dataDeprecated) {
  //     if (!_deprecatedTagValuesByKey) {
  //         _deprecatedTagValuesByKey = {};
  //         dataDeprecated.forEach(function(d) {
  //             var oldKeys = Object.keys(d.old);
  //             if (oldKeys.length === 1) {
  //                 var oldKey = oldKeys[0];
  //                 var oldValue = d.old[oldKey];
  //                 if (oldValue !== '*') {
  //                     if (!_deprecatedTagValuesByKey[oldKey]) {
  //                         _deprecatedTagValuesByKey[oldKey] = [oldValue];
  //                     } else {
  //                         _deprecatedTagValuesByKey[oldKey].push(oldValue);
  //                     }
  //                 }
  //             }
  //         });
  //     }
  //     return _deprecatedTagValuesByKey;
  // };

  // initialize(sources) {
  //   for (var i = 0; i < sources.length; ++i) {
  //     const source = sources[i];
  //     for (const prop in source) {
  //       if (Object.prototype.hasOwnProperty.call(source, prop)) {
  //         if (source[prop] === undefined) {
  //           delete this[prop];
  //         } else {
  //           this[prop] = source[prop];
  //         }
  //       }
  //     }
  //   }
  //   if (!this.id && this.type) {
  //     this.id = Entity.id(this.type);
  //   }
  //   if (!this.hasOwnProperty('visible')) {
  //     this.visible = true;
  //   }
  //   return this;
  // }

  copy(graph: any, copies?: object): Entity {
    copies = copies || {};
    if (copies[this.id]) return copies[this.id];

    const props = Object.assign({}, this, { id: undefined, user: undefined, version: undefined });
    const copy = new Entity(props);
    copies[this.id] = copy;
    return copy;
  }

  osmId(): string {
    return Entity.id.toOSM(this.id);
  }

  isNew(): boolean {
    return parseInt(this.osmId(), 10) < 0;
  }

  update(props: Record<string, any>): Entity {
    return new Entity(Object.assign({}, this, props));
  }

// belongs in util?  maybe there already?
  mergeTags(other: LooseTags): Entity {
    let tags: StrictTags = osmToStrictTags(other);
    let merged: StrictTags = new Map(this.tags);  // copy
    let changed: boolean = false;

    for (const [k, v] of tags) {
      const ours: string = (merged.get(k) || '');
      const theirs: string = (v || '');
      if (!ours) {
        changed = true;
        merged.set(k, theirs);
      } else if (ours !== theirs) {
        changed = true;
        merged.set(k, utilUnicodeCharsTruncated(
          utilArrayUnion(ours.split(/;\s*/), theirs.split(/;\s*/)).join(';'),
          255 // avoid exceeding character limit; see also services/osm.js -> maxCharsForTagValue()
        ));
      }
    }
    return changed ? this.update({ tags: merged }) : this;
  }

  extent(graph?: any): Extent {
    return new Extent();
  }

  intersects(extent, graph): boolean {
    return this.extent(graph).intersects(extent);
  }

// barely used?
  // hasNonGeometryTags(): boolean {
  //   return Object.keys(this.tags).some((k) => k !== 'area');
  // }

  // hasParentRelations(graph): boolean {
  //   return graph.parentRelations(this).length > 0;
  // }

  hasInterestingTags(): boolean {
    return [...this.tags.keys()].some(osmIsInterestingTag);
  }

  isHighwayIntersection(graph: any): boolean {
    return false;
  }

  isDegenerate(): boolean {
    return true;
  }

  // deprecatedTags(dataDeprecated) {
  //   const tags = this.tags;

  //   // if there are no tags, none can be deprecated
  //   if (Object.keys(tags).length === 0) return [];

  //   var deprecated = [];
  //   dataDeprecated.forEach(function (d) {
  //     var oldKeys = Object.keys(d.old);
  //     if (d.replace) {
  //       var hasExistingValues = Object.keys(d.replace).some(function (replaceKey) {
  //         if (!tags[replaceKey] || d.old[replaceKey]) return false;
  //         var replaceValue = d.replace[replaceKey];
  //         if (replaceValue === '*') return false;
  //         if (replaceValue === tags[replaceKey]) return false;
  //         return true;
  //       });
  //       // don't flag deprecated tags if the upgrade path would overwrite existing data - #7843
  //       if (hasExistingValues) return;
  //     }
  //     var matchesDeprecatedTags = oldKeys.every(function (oldKey) {
  //       if (!tags[oldKey]) return false;
  //       if (d.old[oldKey] === '*') return true;
  //       if (d.old[oldKey] === tags[oldKey]) return true;

  //       var vals = tags[oldKey].split(';').filter(Boolean);
  //       if (vals.length === 0) {
  //         return false;
  //       } else if (vals.length > 1) {
  //         return vals.indexOf(d.old[oldKey]) !== -1;
  //       } else {
  //         if (tags[oldKey] === d.old[oldKey]) {
  //           if (d.replace && d.old[oldKey] === d.replace[oldKey]) {
  //             var replaceKeys = Object.keys(d.replace);
  //             return !replaceKeys.every(function (replaceKey) {
  //               return tags[replaceKey] === d.replace[replaceKey];
  //             });
  //           } else {
  //             return true;
  //           }
  //         }
  //       }
  //       return false;
  //     });

  //     if (matchesDeprecatedTags) {
  //       deprecated.push(d);
  //     }
  //   });

  //   return deprecated;
  // }
}
