// external
// import { geoAngle } from '@id-sdk/geo';
import { Extent } from '@id-sdk/extent';
import { utilArrayUniq } from '@id-sdk/util';
import { Vec2 } from '@id-sdk/vector';

// internal
import { Entity } from './entity';


/**
 *
 */
export class Node extends Entity {
  readonly loc: Vec2;

  constructor(props?: Node | Record<string, any>) {
    props = Object.assign({ type: 'node' }, props);
    super(props);

    this.loc = props.loc || [9999, 9999];
  }


  geometry(graph: any): string {
    const that = this;
    return graph.transient(that, 'geometry', () => {
      return graph.isPoi(that) ? 'point' : 'vertex';
    });
  }

  extent(graph?: any): Extent {
    return new Extent(this.loc);
  }

  update(props: Record<string, any>): Node {
    return new Node(Object.assign({}, this, props));
  }

  move(loc: Vec2): Node {
    return this.update({ loc: loc });
  }

  isDegenerate(): boolean {
    return !(
      Array.isArray(this.loc) &&
      this.loc.length === 2 &&
      this.loc[0] >= -180 &&
      this.loc[0] <= 180 &&
      this.loc[1] >= -90 &&
      this.loc[1] <= 90
    );
  }

//   // Inspect tags and geometry to determine which direction(s) this node/vertex points
//   directions: function (graph, projection) {
//     var val;
//     var i;

//     // which tag to use?
//     if (this.isHighwayIntersection(graph) && (this.tags.stop || '').toLowerCase() === 'all') {
//       // all-way stop tag on a highway intersection
//       val = 'all';
//     } else {
//       // generic direction tag
//       val = (this.tags.direction || '').toLowerCase();

//       // better suffix-style direction tag
//       var re = /:direction$/i;
//       var keys = Object.keys(this.tags);
//       for (i = 0; i < keys.length; i++) {
//         if (re.test(keys[i])) {
//           val = this.tags[keys[i]].toLowerCase();
//           break;
//         }
//       }
//     }

//     if (val === '') return [];

//     var cardinal = {
//       north: 0,
//       n: 0,
//       northnortheast: 22,
//       nne: 22,
//       northeast: 45,
//       ne: 45,
//       eastnortheast: 67,
//       ene: 67,
//       east: 90,
//       e: 90,
//       eastsoutheast: 112,
//       ese: 112,
//       southeast: 135,
//       se: 135,
//       southsoutheast: 157,
//       sse: 157,
//       south: 180,
//       s: 180,
//       southsouthwest: 202,
//       ssw: 202,
//       southwest: 225,
//       sw: 225,
//       westsouthwest: 247,
//       wsw: 247,
//       west: 270,
//       w: 270,
//       westnorthwest: 292,
//       wnw: 292,
//       northwest: 315,
//       nw: 315,
//       northnorthwest: 337,
//       nnw: 337
//     };

//     var values = val.split(';');
//     var results = [];

//     values.forEach(function (v) {
//       // swap cardinal for numeric directions
//       if (cardinal[v] !== undefined) {
//         v = cardinal[v];
//       }

//       // numeric direction - just add to results
//       if (v !== '' && !isNaN(+v)) {
//         results.push(+v);
//         return;
//       }

//       // string direction - inspect parent ways
//       var lookBackward =
//         this.tags['traffic_sign:backward'] || v === 'backward' || v === 'both' || v === 'all';
//       var lookForward =
//         this.tags['traffic_sign:forward'] || v === 'forward' || v === 'both' || v === 'all';

//       if (!lookForward && !lookBackward) return;

//       var nodeIds = {};
//       graph.parentWays(this).forEach(function (parent) {
//         var nodes = parent.nodes;
//         for (i = 0; i < nodes.length; i++) {
//           if (nodes[i] === this.id) {
//             // match current entity
//             if (lookForward && i > 0) {
//               nodeIds[nodes[i - 1]] = true; // look back to prev node
//             }
//             if (lookBackward && i < nodes.length - 1) {
//               nodeIds[nodes[i + 1]] = true; // look ahead to next node
//             }
//           }
//         }
//       }, this);

//       Object.keys(nodeIds).forEach(function (nodeId) {
//         // +90 because geoAngle returns angle from X axis, not Y (north)
//         results.push(geoAngle(this, graph.entity(nodeId), projection) * (180 / Math.PI) + 90);
//       }, this);
//     }, this);

//     return utilArrayUniq(results);
//   },

  isEndpoint(graph: any): boolean {
    const that = this;
    return graph.transient(that, 'isEndpoint', () => {
      return graph.parentWays(that)
        .some(parent => !parent.isClosed() && !!parent.affix(that.id));
    });
  }

  isConnected(graph: any): boolean {
    const that = this;
    return graph.transient(that, 'isConnected', () => {
      const parents = graph.parentWays(that);

      if (parents.length > 1) {    // vertex is connected to multiple parent ways
        for (let i in parents) {
          if (parents[i].geometry(graph) === 'line' && parents[i].hasInterestingTags()) {
            return true;
          }
        }

      } else if (parents.length === 1) {
        const way = parents[0];
        let nodes = way.nodes.slice();  // copy
        if (way.isClosed()) {
          nodes.pop();
        } // ignore connecting node if closed

        // return true if vertex appears multiple times (way is self intersecting)
        return nodes.indexOf(that.id) !== nodes.lastIndexOf(that.id);
      }

      return false;
    });
  }

  parentIntersectionWays(graph: any) {
    const that = this;
    return graph.transient(that, 'parentIntersectionWays', () => {
      return graph.parentWays(that).filter(parent => {
        return (
          (parent.tags.has('highway') ||
            parent.tags.has('waterway') ||
            parent.tags.has('railway') ||
            parent.tags.has('aeroway')) &&
          parent.geometry(graph) === 'line'
        );
      });
    });
  }

  isIntersection(graph: any): boolean {
    return this.parentIntersectionWays(graph).length > 1;
  }

  isHighwayIntersection(graph: any): boolean {
    const that = this;
    return graph.transient(that, 'isHighwayIntersection', () => {
      return (
        graph.parentWays(that).filter(parent => {
          return parent.tags.has('highway') && parent.geometry(graph) === 'line';
        }).length > 1
      );
    });
  }

  isOnAddressLine(graph: any): boolean {
    const that = this;
    return graph.transient(that, 'isOnAddressLine', () => {
      return graph.parentWays(that).some(parent => {
        return parent.tags.has('addr:interpolation') && parent.geometry(graph) === 'line';
      });
    });
  }

  asJXON(changeset_id?: string): any {
    const that = this;
    let result = {
      node: {
        '@id': that.osmId(),
        '@lon': that.loc[0],
        '@lat': that.loc[1],
        '@version': that.version || 0,
        tag: [...that.tags.entries()].map(pair => ({ keyAttributes: { k: pair[0], v: pair[1] }}) )
      }
    };
    if (changeset_id) {
      result.node['@changeset'] = changeset_id;
    }
    return result;
  }

  asGeoJSON() {
    return {
      type: 'Point',
      coordinates: this.loc
    };
  }

// });
}
