import { Entity, Node } from '../src/index';
import { Extent } from '@id-sdk/extent';

const DEFAULT = [9999, 9999];
const HIGHPOINT = [-74.66155, 41.32095];


class MockGraph {
  constructor(entities) {
    entities = entities || [];
    this._entities = {};
    this._parentWays = {};

    entities.forEach(entity => {
      // add entity
      this._entities[entity.id] = entity;

      // add parent ways
      (entity.nodes || []).forEach(nodeID => {
        if (!this._parentWays[nodeID]) {
          this._parentWays[nodeID] = new Set();
        }
        this._parentWays[nodeID].add(entity);
      });
    });
  }
  transient(entity, key, fn) {
    return fn.call(entity);
  }
  parentWays(entity) {
    return Array.from(this._parentWays[entity.id] || []);
  }
  entity(id) {
    return this._entities[id];
  }
  isPoi(entity) {
    return (this.parentWays(entity).length === 0);
  }
}

class MockWay extends Entity {
  constructor(props) {
    props = Object.assign({ type: 'way' }, props);
    super(props);
    this.nodes = (props.nodes || []);
  }
  geometry() {
    return (this.tags.get('area') === 'yes') ? 'area' : 'line';
  }
  first() {
    return this.nodes[0];
  }
  last() {
    return this.nodes[this.nodes.length - 1];
  }
  isClosed() {
    return this.nodes.length > 1 && this.first() === this.last();
  }
  affix(nodeID) {
    if (this.first() === nodeID) return 'prefix';
    if (this.last() === nodeID) return 'suffix';
  }
}


describe('Node', () => {

  describe('constructor', () => {
    it('constructs a Node', () => {
      const n = new Node();
      expect(n).toBeInstanceOf(Node);
      expect(n.type).toBe('node');
      expect(n.loc).toStrictEqual(DEFAULT);
    });

    describe('loc', () => {
      it('constructs Node with given loc', () => {
        const n = new Node({ loc: HIGHPOINT });
        expect(n.loc).toStrictEqual(HIGHPOINT);
      });
    });
  });

  describe('#geometry', () => {
    it("returns 'vertex' if the node is a member of any way", () => {
      const node = new Node();
      const way = new MockWay({ nodes: [node.id] });
      const graph = new MockGraph([node, way]);
      expect(node.geometry(graph)).toBe('vertex');
    });

    it("returns 'point' if the node is not a member of any way", () => {
      const node = new Node();
      const graph = new MockGraph([node]);
      expect(node.geometry(graph)).toBe('point');
    });
  });

  describe('#extent', () => {
    it('returns a default Extent if no loc', () => {
      const n = new Node();
      const extent = n.extent();
      expect(extent).toBeInstanceOf(Extent);
      expect(extent.min).toStrictEqual(DEFAULT);
      expect(extent.max).toStrictEqual(DEFAULT);
    });

    it('returns an Extent for the given loc', () => {
      const n = new Node({ loc: HIGHPOINT });
      const extent = n.extent();
      expect(extent).toBeInstanceOf(Extent);
      expect(extent.min).toStrictEqual(HIGHPOINT);
      expect(extent.max).toStrictEqual(HIGHPOINT);
    });
  });

  describe('#update', () => {
    it('returns a new Node', () => {
      const n1 = new Node();
      const n2 = n1.update({});
      expect(n2).toBeInstanceOf(Node);
      expect(n2).not.toBe(n1);
    });

    it('updates the specified attributes', () => {
      const tags = new Map().set('foo', 'bar');
      const n = new Node().update({ tags: tags });
      expect(n.tags).toEqual(tags);
    });

    it('preserves existing attributes', () => {
      const n = new Node({ id: 'n1111' }).update({});
      expect(n.id).toBe('n1111');
    });

    it("doesn't modify the input", () => {
      const props1 = { tags: { foo: 'bar' } };
      const props2 = props1;
      new Node().update(props1);
      expect(props1).toBe(props2);
    });

    it("doesn't copy prototype properties", () => {
      const n = new Node().update({});
      expect(n.hasOwnProperty('update')).toBeFalsy();
    });

    it('increments v', () => {
      const n1 = new Node()
      expect(n1.v).toBe(1);
      const n2 = n1.update({});
      expect(n2.v).toBe(2);
    });
  });

  describe('#move', () => {
    it('returns a new Node with the given loc', () => {
      const n1 = new Node({ id: 'n1234' });
      const n2 = n1.move(HIGHPOINT);

      expect(n2).toBeInstanceOf(Node);
      expect(n2).not.toBe(n1);

      expect(n1.id).toBe('n1234');
      expect(n2.id).toBe('n1234');

      expect(n1.loc).toStrictEqual(DEFAULT);
      expect(n2.loc).toStrictEqual(HIGHPOINT);

      expect(n1.v).toBe(1);
      expect(n2.v).toBe(2);
    });
  });

  describe('#isDegenerate', () => {
    it('returns true if node has invalid loc', () => {
      expect(new Node().isDegenerate()).toBeTrue();
      expect(new Node({ loc: '' }).isDegenerate()).toBeTrue();
      expect(new Node({ loc: [] }).isDegenerate()).toBeTrue();
      expect(new Node({ loc: [0] }).isDegenerate()).toBeTrue();
      expect(new Node({ loc: [0, 0, 0] }).isDegenerate()).toBeTrue();
      expect(new Node({ loc: [-181, 0] }).isDegenerate()).toBeTrue();
      expect(new Node({ loc: [181, 0] }).isDegenerate()).toBeTrue();
      expect(new Node({ loc: [0, -91] }).isDegenerate()).toBeTrue();
      expect(new Node({ loc: [0, 91] }).isDegenerate()).toBeTrue();
      expect(new Node({ loc: [Infinity, 0] }).isDegenerate()).toBeTrue();
      expect(new Node({ loc: [0, Infinity] }).isDegenerate()).toBeTrue();
      expect(new Node({ loc: [NaN, 0] }).isDegenerate()).toBeTrue();
      expect(new Node({ loc: [0, NaN] }).isDegenerate()).toBeTrue();
    });

    it('returns false if node has valid loc', () => {
      expect(new Node({ loc: [0, 0] }).isDegenerate()).toBeFalse();
      expect(new Node({ loc: [-180, 0] }).isDegenerate()).toBeFalse();
      expect(new Node({ loc: [180, 0] }).isDegenerate()).toBeFalse();
      expect(new Node({ loc: [0, -90] }).isDegenerate()).toBeFalse();
      expect(new Node({ loc: [0, 90] }).isDegenerate()).toBeFalse();
    });
  });



//   describe('#intersects', () => {
//     it('returns true for a node within the given extent', () => {
//       expect(
//         new Node({ loc: [0, 0] }).intersects([
//           [-5, -5],
//           [5, 5]
//         ])
//       ).toBeTrue();
//     });

//     it('returns false for a node outside the given extend', () => {
//       expect(
//         new Node({ loc: [6, 6] }).intersects([
//           [-5, -5],
//           [5, 5]
//         ])
//       ).toBeFalse();
//     });
//   });


  describe('#isEndpoint', () => {
    it('returns true for a node at an endpoint along a linear way', () => {
      const a = new Node({ id: 'a' });
      const b = new Node({ id: 'b' });
      const c = new Node({ id: 'c' });
      const w = new MockWay({ nodes: ['a', 'b', 'c'] });
      const graph = new MockGraph([a, b, c, w]);
      expect(a.isEndpoint(graph)).toBeTrue();   // 'linear way, beginning node'
      expect(b.isEndpoint(graph)).toBeFalse();  // 'linear way, middle node'
      expect(c.isEndpoint(graph)).toBeTrue();   // 'linear way, ending node'
    });

    it('returns false for nodes along a circular way', () => {
      const a = new Node({ id: 'a' });
      const b = new Node({ id: 'b' });
      const c = new Node({ id: 'c' });
      const w = new MockWay({ nodes: ['a', 'b', 'c', 'a'] });
      const graph = new MockGraph([a, b, c, w]);
      expect(a.isEndpoint(graph)).toBeFalse();   // 'circular way, connector node'
      expect(b.isEndpoint(graph)).toBeFalse();   // 'circular way, middle node'
      expect(c.isEndpoint(graph)).toBeFalse();   // 'circular way, ending node'
    });
  });


  describe('#isConnected', () => {
    it('returns true for a node with multiple parent ways, at least one interesting', () => {
      const node = new Node();
      const w1 = new MockWay({ nodes: [node.id] });
      const w2 = new MockWay({ nodes: [node.id], tags: { highway: 'residential' } });
      const graph = new MockGraph([node, w1, w2]);
      expect(node.isConnected(graph)).toBeTrue();
    });

    it('returns false for a node with only area parent ways', () => {
      const node = new Node();
      const w1 = new MockWay({ nodes: [node.id], tags: { area: 'yes' } });
      const w2 = new MockWay({ nodes: [node.id], tags: { area: 'yes' } });
      const graph = new MockGraph([node, w1, w2]);
      expect(node.isConnected(graph)).toBeFalse();
    });

    it('returns false for a node with only uninteresting parent ways', () => {
      const node = new Node();
      const w1 = new MockWay({ nodes: [node.id] });
      const w2 = new MockWay({ nodes: [node.id], tags: { source: 'Bing' } });
      const graph = new MockGraph([node, w1, w2]);
      expect(node.isConnected(graph)).toBeFalse();
    });

    it('returns false for a standalone node on a single parent way', () => {
      const node = new Node();
      const way = new MockWay({ nodes: [node.id] });
      const graph = new MockGraph([node, way]);
      expect(node.isConnected(graph)).toBeFalse();
    });

    it('returns true for a self-intersecting node on a single parent way', () => {
      const a = new Node({ id: 'a' });
      const b = new Node({ id: 'b' });
      const c = new Node({ id: 'c' });
      const w = new MockWay({ nodes: ['a', 'b', 'c', 'b'] });
      const graph = new MockGraph([a, b, c, w]);
      expect(b.isConnected(graph)).toBeTrue();
    });

    it('returns false for the connecting node of a closed way', () => {
      const a = new Node({ id: 'a' });
      const b = new Node({ id: 'b' });
      const c = new Node({ id: 'c' });
      const w = new MockWay({ nodes: ['a', 'b', 'c', 'a'] });
      const graph = new MockGraph([a, b, c, w]);
      expect(a.isConnected(graph)).toBeFalse();
    });
  });


  describe('#parentIntersectionWays', () => {
    it('returns empty array if a node has no parent ways', () => {
      const n = new Node();
      const graph = new MockGraph([n]);
      expect(n.parentIntersectionWays(graph)).toBeArrayOfSize(0);
    });

    it('returns parent way if the node is along a highway, waterway, railway, aeroway', () => {
      const n = new Node();
      const w1 = new MockWay({ id: 'w1', nodes: [n.id], tags: { highway: 'residential' } });
      const w2 = new MockWay({ id: 'w2', nodes: [n.id], tags: { waterway: 'river' } });
      const w3 = new MockWay({ id: 'w3', nodes: [n.id], tags: { railway: 'rail' } });
      const w4 = new MockWay({ id: 'w4', nodes: [n.id], tags: { aeroway: 'taxiway' } });
      const w5 = new MockWay({ id: 'w4', nodes: [n.id], tags: { natural: 'wood' } });
      const graph = new MockGraph([n, w1, w2, w3, w4, w5]);
      expect(n.parentIntersectionWays(graph)).toIncludeAllPartialMembers([
        { id: 'w1' }, { id: 'w2' }, { id: 'w3' }, { id: 'w4' }
      ]);
    });
  });


  describe('#isIntersection', () => {
    it('returns true for a node shared by more than one highway', () => {
      const n = new Node();
      const w1 = new MockWay({ nodes: [n.id], tags: { highway: 'residential' } });
      const w2 = new MockWay({ nodes: [n.id], tags: { highway: 'residential' } });
      const graph = new MockGraph([n, w1, w2]);
      expect(n.isIntersection(graph)).toBeTrue();
    });

    it('returns true for a node shared by more than one waterway', () => {
      const n = new Node();
      const w1 = new MockWay({ nodes: [n.id], tags: { waterway: 'river' } });
      const w2 = new MockWay({ nodes: [n.id], tags: { waterway: 'river' } });
      const graph = new MockGraph([n, w1, w2]);
      expect(n.isIntersection(graph)).toBeTrue();
    });
  });

  describe('#isHighwayIntersection', () => {
    it('returns true for a node shared by more than one highway', () => {
      const n = new Node();
      const w1 = new MockWay({ nodes: [n.id], tags: { highway: 'residential' } });
      const w2 = new MockWay({ nodes: [n.id], tags: { highway: 'residential' } });
      const graph = new MockGraph([n, w1, w2]);
      expect(n.isHighwayIntersection(graph)).toBeTrue();
    });

    it('returns false for a node shared by more than one waterway', () => {
      const n = new Node();
      const w1 = new MockWay({ nodes: [n.id], tags: { waterway: 'river' } });
      const w2 = new MockWay({ nodes: [n.id], tags: { waterway: 'river' } });
      const graph = new MockGraph([n, w1, w2]);
      expect(n.isHighwayIntersection(graph)).toBeFalse();
    });
  });

  describe('#isOnAddressLine', () => {
    it('returns true for a node along an address line', () => {
      const n = new Node();
      const w = new MockWay({ nodes: [n.id], tags: { 'addr:interpolation': 'even' } });
      const graph = new MockGraph([n, w]);
      expect(n.isOnAddressLine(graph)).toBeTrue();
    });

    it('returns false for a node not along an address line', () => {
      const n = new Node();
      const w = new MockWay({ nodes: [n.id], tags: { waterway: 'river' } });
      const graph = new MockGraph([n, w]);
      expect(n.isOnAddressLine(graph)).toBeFalse();
    });
  });


//   describe('#directions', () => {
//     const projection = function (_) {
//       return _;
//     };
//     it('returns empty array if no direction tag', () => {
//       const node1 = new Node({ loc: [0, 0], tags: {} });
//       const graph = new MockGraph([node1]);
//       expect(node1.directions(graph, projection)).to.eql([], 'no direction tag');
//     });

//     it('returns empty array if nonsense direction tag', () => {
//       const node1 = new Node({ loc: [0, 0], tags: { direction: 'blah' } });
//       const node2 = new Node({ loc: [0, 0], tags: { direction: '' } });
//       const node3 = new Node({ loc: [0, 0], tags: { direction: 'NaN' } });
//       const node4 = new Node({ loc: [0, 0], tags: { direction: 'eastwest' } });
//       const graph = new MockGraph([node1, node2, node3, node4]);

//       expect(node1.directions(graph, projection)).to.eql([], 'nonsense direction tag');
//       expect(node2.directions(graph, projection)).to.eql([], 'empty string direction tag');
//       expect(node3.directions(graph, projection)).to.eql([], 'NaN direction tag');
//       expect(node4.directions(graph, projection)).to.eql([], 'eastwest direction tag');
//     });

//     it('supports numeric direction tag', () => {
//       const node1 = new Node({ loc: [0, 0], tags: { direction: '0' } });
//       const node2 = new Node({ loc: [0, 0], tags: { direction: '45' } });
//       const node3 = new Node({ loc: [0, 0], tags: { direction: '-45' } });
//       const node4 = new Node({ loc: [0, 0], tags: { direction: '360' } });
//       const node5 = new Node({ loc: [0, 0], tags: { direction: '1000' } });
//       const graph = new MockGraph([node1, node2, node3, node4, node5]);

//       expect(node1.directions(graph, projection)).to.eql([0], 'numeric 0');
//       expect(node2.directions(graph, projection)).to.eql([45], 'numeric 45');
//       expect(node3.directions(graph, projection)).to.eql([-45], 'numeric -45');
//       expect(node4.directions(graph, projection)).to.eql([360], 'numeric 360');
//       expect(node5.directions(graph, projection)).to.eql([1000], 'numeric 1000');
//     });

//     it('supports cardinal direction tags (test abbreviated and mixed case)', () => {
//       const nodeN1 = new Node({ loc: [0, 0], tags: { direction: 'n' } });
//       const nodeN2 = new Node({ loc: [0, 0], tags: { direction: 'N' } });
//       const nodeN3 = new Node({ loc: [0, 0], tags: { direction: 'north' } });
//       const nodeN4 = new Node({ loc: [0, 0], tags: { direction: 'NOrth' } });

//       const nodeNNE1 = new Node({ loc: [0, 0], tags: { direction: 'nne' } });
//       const nodeNNE2 = new Node({ loc: [0, 0], tags: { direction: 'NnE' } });
//       const nodeNNE3 = new Node({ loc: [0, 0], tags: { direction: 'northnortheast' } });
//       const nodeNNE4 = new Node({ loc: [0, 0], tags: { direction: 'NOrthnorTHEast' } });

//       const nodeNE1 = new Node({ loc: [0, 0], tags: { direction: 'ne' } });
//       const nodeNE2 = new Node({ loc: [0, 0], tags: { direction: 'nE' } });
//       const nodeNE3 = new Node({ loc: [0, 0], tags: { direction: 'northeast' } });
//       const nodeNE4 = new Node({ loc: [0, 0], tags: { direction: 'norTHEast' } });

//       const nodeENE1 = new Node({ loc: [0, 0], tags: { direction: 'ene' } });
//       const nodeENE2 = new Node({ loc: [0, 0], tags: { direction: 'EnE' } });
//       const nodeENE3 = new Node({ loc: [0, 0], tags: { direction: 'eastnortheast' } });
//       const nodeENE4 = new Node({ loc: [0, 0], tags: { direction: 'EAstnorTHEast' } });

//       const nodeE1 = new Node({ loc: [0, 0], tags: { direction: 'e' } });
//       const nodeE2 = new Node({ loc: [0, 0], tags: { direction: 'E' } });
//       const nodeE3 = new Node({ loc: [0, 0], tags: { direction: 'east' } });
//       const nodeE4 = new Node({ loc: [0, 0], tags: { direction: 'EAst' } });

//       const nodeESE1 = new Node({ loc: [0, 0], tags: { direction: 'ese' } });
//       const nodeESE2 = new Node({ loc: [0, 0], tags: { direction: 'EsE' } });
//       const nodeESE3 = new Node({ loc: [0, 0], tags: { direction: 'eastsoutheast' } });
//       const nodeESE4 = new Node({ loc: [0, 0], tags: { direction: 'EAstsouTHEast' } });

//       const nodeSE1 = new Node({ loc: [0, 0], tags: { direction: 'se' } });
//       const nodeSE2 = new Node({ loc: [0, 0], tags: { direction: 'sE' } });
//       const nodeSE3 = new Node({ loc: [0, 0], tags: { direction: 'southeast' } });
//       const nodeSE4 = new Node({ loc: [0, 0], tags: { direction: 'souTHEast' } });

//       const nodeSSE1 = new Node({ loc: [0, 0], tags: { direction: 'sse' } });
//       const nodeSSE2 = new Node({ loc: [0, 0], tags: { direction: 'SsE' } });
//       const nodeSSE3 = new Node({ loc: [0, 0], tags: { direction: 'southsoutheast' } });
//       const nodeSSE4 = new Node({ loc: [0, 0], tags: { direction: 'SOuthsouTHEast' } });

//       const nodeS1 = new Node({ loc: [0, 0], tags: { direction: 's' } });
//       const nodeS2 = new Node({ loc: [0, 0], tags: { direction: 'S' } });
//       const nodeS3 = new Node({ loc: [0, 0], tags: { direction: 'south' } });
//       const nodeS4 = new Node({ loc: [0, 0], tags: { direction: 'SOuth' } });

//       const nodeSSW1 = new Node({ loc: [0, 0], tags: { direction: 'ssw' } });
//       const nodeSSW2 = new Node({ loc: [0, 0], tags: { direction: 'SsW' } });
//       const nodeSSW3 = new Node({ loc: [0, 0], tags: { direction: 'southsouthwest' } });
//       const nodeSSW4 = new Node({ loc: [0, 0], tags: { direction: 'SOuthsouTHWest' } });

//       const nodeSW1 = new Node({ loc: [0, 0], tags: { direction: 'sw' } });
//       const nodeSW2 = new Node({ loc: [0, 0], tags: { direction: 'sW' } });
//       const nodeSW3 = new Node({ loc: [0, 0], tags: { direction: 'southwest' } });
//       const nodeSW4 = new Node({ loc: [0, 0], tags: { direction: 'souTHWest' } });

//       const nodeWSW1 = new Node({ loc: [0, 0], tags: { direction: 'wsw' } });
//       const nodeWSW2 = new Node({ loc: [0, 0], tags: { direction: 'WsW' } });
//       const nodeWSW3 = new Node({ loc: [0, 0], tags: { direction: 'westsouthwest' } });
//       const nodeWSW4 = new Node({ loc: [0, 0], tags: { direction: 'WEstsouTHWest' } });

//       const nodeW1 = new Node({ loc: [0, 0], tags: { direction: 'w' } });
//       const nodeW2 = new Node({ loc: [0, 0], tags: { direction: 'W' } });
//       const nodeW3 = new Node({ loc: [0, 0], tags: { direction: 'west' } });
//       const nodeW4 = new Node({ loc: [0, 0], tags: { direction: 'WEst' } });

//       const nodeWNW1 = new Node({ loc: [0, 0], tags: { direction: 'wnw' } });
//       const nodeWNW2 = new Node({ loc: [0, 0], tags: { direction: 'WnW' } });
//       const nodeWNW3 = new Node({ loc: [0, 0], tags: { direction: 'westnorthwest' } });
//       const nodeWNW4 = new Node({ loc: [0, 0], tags: { direction: 'WEstnorTHWest' } });

//       const nodeNW1 = new Node({ loc: [0, 0], tags: { direction: 'nw' } });
//       const nodeNW2 = new Node({ loc: [0, 0], tags: { direction: 'nW' } });
//       const nodeNW3 = new Node({ loc: [0, 0], tags: { direction: 'northwest' } });
//       const nodeNW4 = new Node({ loc: [0, 0], tags: { direction: 'norTHWest' } });

//       const nodeNNW1 = new Node({ loc: [0, 0], tags: { direction: 'nnw' } });
//       const nodeNNW2 = new Node({ loc: [0, 0], tags: { direction: 'NnW' } });
//       const nodeNNW3 = new Node({ loc: [0, 0], tags: { direction: 'northnorthwest' } });
//       const nodeNNW4 = new Node({ loc: [0, 0], tags: { direction: 'NOrthnorTHWest' } });

//       const graph = new MockGraph([
//         nodeN1,
//         nodeN2,
//         nodeN3,
//         nodeN4,
//         nodeNNE1,
//         nodeNNE2,
//         nodeNNE3,
//         nodeNNE4,
//         nodeNE1,
//         nodeNE2,
//         nodeNE3,
//         nodeNE4,
//         nodeENE1,
//         nodeENE2,
//         nodeENE3,
//         nodeENE4,
//         nodeE1,
//         nodeE2,
//         nodeE3,
//         nodeE4,
//         nodeESE1,
//         nodeESE2,
//         nodeESE3,
//         nodeESE4,
//         nodeSE1,
//         nodeSE2,
//         nodeSE3,
//         nodeSE4,
//         nodeSSE1,
//         nodeSSE2,
//         nodeSSE3,
//         nodeSSE4,
//         nodeS1,
//         nodeS2,
//         nodeS3,
//         nodeS4,
//         nodeSSW1,
//         nodeSSW2,
//         nodeSSW3,
//         nodeSSW4,
//         nodeSW1,
//         nodeSW2,
//         nodeSW3,
//         nodeSW4,
//         nodeWSW1,
//         nodeWSW2,
//         nodeWSW3,
//         nodeWSW4,
//         nodeW1,
//         nodeW2,
//         nodeW3,
//         nodeW4,
//         nodeWNW1,
//         nodeWNW2,
//         nodeWNW3,
//         nodeWNW4,
//         nodeNW1,
//         nodeNW2,
//         nodeNW3,
//         nodeNW4,
//         nodeNNW1,
//         nodeNNW2,
//         nodeNNW3,
//         nodeNNW4
//       ]);

//       expect(nodeN1.directions(graph, projection)).to.eql([0], 'cardinal n');
//       expect(nodeN2.directions(graph, projection)).to.eql([0], 'cardinal N');
//       expect(nodeN3.directions(graph, projection)).to.eql([0], 'cardinal north');
//       expect(nodeN4.directions(graph, projection)).to.eql([0], 'cardinal NOrth');

//       expect(nodeNNE1.directions(graph, projection)).to.eql([22], 'cardinal nne');
//       expect(nodeNNE2.directions(graph, projection)).to.eql([22], 'cardinal NnE');
//       expect(nodeNNE3.directions(graph, projection)).to.eql([22], 'cardinal northnortheast');
//       expect(nodeNNE4.directions(graph, projection)).to.eql([22], 'cardinal NOrthnorTHEast');

//       expect(nodeNE1.directions(graph, projection)).to.eql([45], 'cardinal ne');
//       expect(nodeNE2.directions(graph, projection)).to.eql([45], 'cardinal nE');
//       expect(nodeNE3.directions(graph, projection)).to.eql([45], 'cardinal northeast');
//       expect(nodeNE4.directions(graph, projection)).to.eql([45], 'cardinal norTHEast');

//       expect(nodeENE1.directions(graph, projection)).to.eql([67], 'cardinal ene');
//       expect(nodeENE2.directions(graph, projection)).to.eql([67], 'cardinal EnE');
//       expect(nodeENE3.directions(graph, projection)).to.eql([67], 'cardinal eastnortheast');
//       expect(nodeENE4.directions(graph, projection)).to.eql([67], 'cardinal EAstnorTHEast');

//       expect(nodeE1.directions(graph, projection)).to.eql([90], 'cardinal e');
//       expect(nodeE2.directions(graph, projection)).to.eql([90], 'cardinal E');
//       expect(nodeE3.directions(graph, projection)).to.eql([90], 'cardinal east');
//       expect(nodeE4.directions(graph, projection)).to.eql([90], 'cardinal EAst');

//       expect(nodeESE1.directions(graph, projection)).to.eql([112], 'cardinal ese');
//       expect(nodeESE2.directions(graph, projection)).to.eql([112], 'cardinal EsE');
//       expect(nodeESE3.directions(graph, projection)).to.eql([112], 'cardinal eastsoutheast');
//       expect(nodeESE4.directions(graph, projection)).to.eql([112], 'cardinal EAstsouTHEast');

//       expect(nodeSE1.directions(graph, projection)).to.eql([135], 'cardinal se');
//       expect(nodeSE2.directions(graph, projection)).to.eql([135], 'cardinal sE');
//       expect(nodeSE3.directions(graph, projection)).to.eql([135], 'cardinal southeast');
//       expect(nodeSE4.directions(graph, projection)).to.eql([135], 'cardinal souTHEast');

//       expect(nodeSSE1.directions(graph, projection)).to.eql([157], 'cardinal sse');
//       expect(nodeSSE2.directions(graph, projection)).to.eql([157], 'cardinal SsE');
//       expect(nodeSSE3.directions(graph, projection)).to.eql([157], 'cardinal southsoutheast');
//       expect(nodeSSE4.directions(graph, projection)).to.eql([157], 'cardinal SouthsouTHEast');

//       expect(nodeS1.directions(graph, projection)).to.eql([180], 'cardinal s');
//       expect(nodeS2.directions(graph, projection)).to.eql([180], 'cardinal S');
//       expect(nodeS3.directions(graph, projection)).to.eql([180], 'cardinal south');
//       expect(nodeS4.directions(graph, projection)).to.eql([180], 'cardinal SOuth');

//       expect(nodeSSW1.directions(graph, projection)).to.eql([202], 'cardinal ssw');
//       expect(nodeSSW2.directions(graph, projection)).to.eql([202], 'cardinal SsW');
//       expect(nodeSSW3.directions(graph, projection)).to.eql([202], 'cardinal southsouthwest');
//       expect(nodeSSW4.directions(graph, projection)).to.eql([202], 'cardinal SouthsouTHWest');

//       expect(nodeSW1.directions(graph, projection)).to.eql([225], 'cardinal sw');
//       expect(nodeSW2.directions(graph, projection)).to.eql([225], 'cardinal sW');
//       expect(nodeSW3.directions(graph, projection)).to.eql([225], 'cardinal southwest');
//       expect(nodeSW4.directions(graph, projection)).to.eql([225], 'cardinal souTHWest');

//       expect(nodeWSW1.directions(graph, projection)).to.eql([247], 'cardinal wsw');
//       expect(nodeWSW2.directions(graph, projection)).to.eql([247], 'cardinal WsW');
//       expect(nodeWSW3.directions(graph, projection)).to.eql([247], 'cardinal westsouthwest');
//       expect(nodeWSW4.directions(graph, projection)).to.eql([247], 'cardinal WEstsouTHWest');

//       expect(nodeW1.directions(graph, projection)).to.eql([270], 'cardinal w');
//       expect(nodeW2.directions(graph, projection)).to.eql([270], 'cardinal W');
//       expect(nodeW3.directions(graph, projection)).to.eql([270], 'cardinal west');
//       expect(nodeW4.directions(graph, projection)).to.eql([270], 'cardinal WEst');

//       expect(nodeWNW1.directions(graph, projection)).to.eql([292], 'cardinal wnw');
//       expect(nodeWNW2.directions(graph, projection)).to.eql([292], 'cardinal WnW');
//       expect(nodeWNW3.directions(graph, projection)).to.eql([292], 'cardinal westnorthwest');
//       expect(nodeWNW4.directions(graph, projection)).to.eql([292], 'cardinal WEstnorTHWest');

//       expect(nodeNW1.directions(graph, projection)).to.eql([315], 'cardinal nw');
//       expect(nodeNW2.directions(graph, projection)).to.eql([315], 'cardinal nW');
//       expect(nodeNW3.directions(graph, projection)).to.eql([315], 'cardinal northwest');
//       expect(nodeNW4.directions(graph, projection)).to.eql([315], 'cardinal norTHWest');

//       expect(nodeNNW1.directions(graph, projection)).to.eql([337], 'cardinal nnw');
//       expect(nodeNNW2.directions(graph, projection)).to.eql([337], 'cardinal NnW');
//       expect(nodeNNW3.directions(graph, projection)).to.eql([337], 'cardinal northnorthwest');
//       expect(nodeNNW4.directions(graph, projection)).to.eql([337], 'cardinal NOrthnorTHWest');
//     });

//     it('supports direction=forward', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({ id: 'n2', loc: [0, 0], tags: { direction: 'forward' } });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.eql([270]);
//     });

//     it('supports direction=backward', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({ id: 'n2', loc: [0, 0], tags: { direction: 'backward' } });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.eql([90]);
//     });

//     it('supports direction=both', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({ id: 'n2', loc: [0, 0], tags: { direction: 'both' } });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.have.members([90, 270]);
//     });

//     it('supports direction=all', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({ id: 'n2', loc: [0, 0], tags: { direction: 'all' } });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.have.members([90, 270]);
//     });

//     it('supports traffic_signals:direction=forward', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({
//         id: 'n2',
//         loc: [0, 0],
//         tags: { 'traffic_signals:direction': 'forward' }
//       });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.eql([270]);
//     });

//     it('supports traffic_signals:direction=backward', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({
//         id: 'n2',
//         loc: [0, 0],
//         tags: { 'traffic_signals:direction': 'backward' }
//       });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.eql([90]);
//     });

//     it('supports traffic_signals:direction=both', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({
//         id: 'n2',
//         loc: [0, 0],
//         tags: { 'traffic_signals:direction': 'both' }
//       });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.have.members([90, 270]);
//     });

//     it('supports traffic_signals:direction=all', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({
//         id: 'n2',
//         loc: [0, 0],
//         tags: { 'traffic_signals:direction': 'all' }
//       });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.have.members([90, 270]);
//     });

//     it('supports railway:signal:direction=forward', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({
//         id: 'n2',
//         loc: [0, 0],
//         tags: { 'railway:signal:direction': 'forward' }
//       });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.eql([270]);
//     });

//     it('supports railway:signal:direction=backward', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({
//         id: 'n2',
//         loc: [0, 0],
//         tags: { 'railway:signal:direction': 'backward' }
//       });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.eql([90]);
//     });

//     it('supports railway:signal:direction=both', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({
//         id: 'n2',
//         loc: [0, 0],
//         tags: { 'railway:signal:direction': 'both' }
//       });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.have.members([90, 270]);
//     });

//     it('supports railway:signal:direction=all', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({
//         id: 'n2',
//         loc: [0, 0],
//         tags: { 'railway:signal:direction': 'all' }
//       });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.have.members([90, 270]);
//     });

//     it('supports camera:direction=forward', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({ id: 'n2', loc: [0, 0], tags: { 'camera:direction': 'forward' } });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.eql([270]);
//     });

//     it('supports camera:direction=backward', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({ id: 'n2', loc: [0, 0], tags: { 'camera:direction': 'backward' } });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.eql([90]);
//     });

//     it('supports camera:direction=both', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({ id: 'n2', loc: [0, 0], tags: { 'camera:direction': 'both' } });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.have.members([90, 270]);
//     });

//     it('supports camera:direction=all', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({ id: 'n2', loc: [0, 0], tags: { 'camera:direction': 'all' } });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.have.members([90, 270]);
//     });

//     it('returns directions for an all-way stop at a highway interstction', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({ id: 'n2', loc: [0, 0], tags: { highway: 'stop', stop: 'all' } });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const node4 = new Node({ id: 'n4', loc: [0, -1] });
//       const node5 = new Node({ id: 'n5', loc: [0, 1] });
//       const way1 = new MockWay({
//         id: 'w1',
//         nodes: ['n1', 'n2', 'n3'],
//         tags: { highway: 'residential' }
//       });
//       const way2 = new MockWay({
//         id: 'w2',
//         nodes: ['n4', 'n2', 'n5'],
//         tags: { highway: 'residential' }
//       });
//       const graph = new MockGraph([node1, node2, node3, node4, node5, way1, way2]);
//       expect(node2.directions(graph, projection)).to.have.members([0, 90, 180, 270]);
//     });

//     it('does not return directions for an all-way stop not at a highway interstction', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0], tags: { highway: 'stop', stop: 'all' } });
//       const node2 = new Node({ id: 'n2', loc: [0, 0] });
//       const node3 = new Node({ id: 'n3', loc: [1, 0], tags: { highway: 'stop', stop: 'all' } });
//       const node4 = new Node({ id: 'n4', loc: [0, -1], tags: { highway: 'stop', stop: 'all' } });
//       const node5 = new Node({ id: 'n5', loc: [0, 1], tags: { highway: 'stop', stop: 'all' } });
//       const way1 = new MockWay({
//         id: 'w1',
//         nodes: ['n1', 'n2', 'n3'],
//         tags: { highway: 'residential' }
//       });
//       const way2 = new MockWay({
//         id: 'w2',
//         nodes: ['n4', 'n2', 'n5'],
//         tags: { highway: 'residential' }
//       });
//       const graph = new MockGraph([node1, node2, node3, node4, node5, way1, way2]);
//       expect(node2.directions(graph, projection)).to.eql([]);
//     });

//     it('supports multiple directions delimited by ;', () => {
//       const node1 = new Node({ loc: [0, 0], tags: { direction: '0;45' } });
//       const node2 = new Node({ loc: [0, 0], tags: { direction: '45;north' } });
//       const node3 = new Node({ loc: [0, 0], tags: { direction: 'north;east' } });
//       const node4 = new Node({ loc: [0, 0], tags: { direction: 'n;s;e;w' } });
//       const node5 = new Node({ loc: [0, 0], tags: { direction: 's;wat' } });
//       const graph = new MockGraph([node1, node2, node3, node4, node5]);

//       expect(node1.directions(graph, projection)).to.eql([0, 45], 'numeric 0, numeric 45');
//       expect(node2.directions(graph, projection)).to.eql([45, 0], 'numeric 45, cardinal north');
//       expect(node3.directions(graph, projection)).to.eql([0, 90], 'cardinal north and east');
//       expect(node4.directions(graph, projection)).to.eql([0, 180, 90, 270], 'cardinal n,s,e,w');
//       expect(node5.directions(graph, projection)).to.eql([180], 'cardinal 180 and nonsense');
//     });

//     it('supports mixing textual, cardinal, numeric directions, delimited by ;', () => {
//       const node1 = new Node({ id: 'n1', loc: [-1, 0] });
//       const node2 = new Node({ id: 'n2', loc: [0, 0], tags: { 'camera:direction': 'both;ne;60' } });
//       const node3 = new Node({ id: 'n3', loc: [1, 0] });
//       const way = new MockWay({ nodes: ['n1', 'n2', 'n3'] });
//       const graph = new MockGraph([node1, node2, node3, way]);
//       expect(node2.directions(graph, projection)).to.have.members([90, 270, 45, 60]);
//     });
//   });

// });


  describe('#asJXON', () => {
    it('converts a node to jxon', () => {
      const n = new Node({ id: 'n-1', loc: [-77, 38], tags: { amenity: 'cafe' } });
      expect(n.asJXON()).toStrictEqual({
        node: {
          '@id': '-1',
          '@lon': -77,
          '@lat': 38,
          '@version': 0,
          tag: [{ keyAttributes: { k: 'amenity', v: 'cafe' } }]
        }
      });
    });

    it('includes changeset if provided', () => {
      expect(new Node({ loc: [0, 0] }).asJXON('1234').node['@changeset']).toBe('1234');
    });
  });

  describe('#asGeoJSON', () => {
    it('converts to a GeoJSON Point geometry', () => {
      const n = new Node({ tags: { amenity: 'cafe' }, loc: [1, 2] });
      const json = n.asGeoJSON();
      expect(json.type).toBe('Point');
      expect(json.coordinates).toStrictEqual([1, 2]);
    });
  });

});
