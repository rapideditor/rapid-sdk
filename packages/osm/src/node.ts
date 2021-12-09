// external
import { Extent, Vec2, vecAngle } from '@id-sdk/math';
import { utilArrayUniq } from '@id-sdk/util';

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

  // Inspect tags and geometry to determine which direction(s) this node/vertex points
  directions(graph: any, projection: any): Array<number> {
    const that = this;
    let val: string;

    // which tag to use?
    if (that.isHighwayIntersection(graph) && (that.tags.get('stop') || '').toLowerCase() === 'all') {
      // all-way stop tag on a highway intersection
      val = 'all';
    } else {
      // generic direction tag
      val = (that.tags.get('direction') || '').toLowerCase();

      // look for a better suffix-style direction tag
      const re = /:direction$/i;
      const keys = [...that.tags.keys()];
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (re.test(k)) {
          val = (that.tags.get(k) || '').toLowerCase();
          break;
        }
      }
    }

    if (val === '') return [];

    const cardinal = {
      north: 0,
      n: 0,
      northnortheast: 22,
      nne: 22,
      northeast: 45,
      ne: 45,
      eastnortheast: 67,
      ene: 67,
      east: 90,
      e: 90,
      eastsoutheast: 112,
      ese: 112,
      southeast: 135,
      se: 135,
      southsoutheast: 157,
      sse: 157,
      south: 180,
      s: 180,
      southsouthwest: 202,
      ssw: 202,
      southwest: 225,
      sw: 225,
      westsouthwest: 247,
      wsw: 247,
      west: 270,
      w: 270,
      westnorthwest: 292,
      wnw: 292,
      northwest: 315,
      nw: 315,
      northnorthwest: 337,
      nnw: 337
    };

    const values = val.split(';');
    let results: Array<number> = [];

    values.forEach(v => {
      // swap cardinal for numeric directions
      if (cardinal[v] !== undefined) {
        v = cardinal[v];
      }

      // numeric direction - just add to results
      if (v !== '' && !isNaN(+v)) {
        results.push(+v);
        return;
      }

      // string direction - inspect parent ways
      const lookBackward =
        that.tags.get('traffic_sign:backward') || v === 'backward' || v === 'both' || v === 'all';
      const lookForward =
        that.tags.get('traffic_sign:forward') || v === 'forward' || v === 'both' || v === 'all';

      if (!lookForward && !lookBackward) return;

      let nodeIDs = {};
      graph.parentWays(that).forEach(parent => {
        const nodes: Array<string> = parent.nodes;
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i] === that.id) {
            // match current entity
            if (lookForward && i > 0) {
              nodeIDs[nodes[i - 1]] = true; // look back to prev node
            }
            if (lookBackward && i < nodes.length - 1) {
              nodeIDs[nodes[i + 1]] = true; // look ahead to next node
            }
          }
        }
      });

      const a = projection(that.loc);
      Object.keys(nodeIDs).forEach(nodeID => {
        const b = projection(graph.entity(nodeID).loc);
        // +90 because vecAngle returns angle from X axis, not Y (north)
        const ang = (vecAngle(a, b) * 180 / Math.PI) + 90;
        results.push(ang);
      });
    });

    return utilArrayUniq(results) as Array<number>;
  }


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
        return parents.some(parent => {
          return parent.geometry(graph) === 'line' && parent.hasInterestingTags();
        });

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
