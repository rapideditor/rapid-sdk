import { Entity } from '../src/index';
import { Extent } from '@id-sdk/math';

describe('Entity', () => {

  describe('constructor', () => {
    it('constructs an Entity', () => {
      const e = new Entity();
      expect(e).toBeInstanceOf(Entity);
      expect(e.type).toBe('entity');
    });

    describe('id', () => {
      it('generates unique ids', () => {
        const e1 = new Entity();
        const e2 = new Entity();
        expect(e1.id).not.toBe(e2.id);
      });

      it('constructs Entity with given id', () => {
        const e = new Entity({ id: 'eTest' });
        expect(e.id).toBe('eTest');
      });
    });

    describe('v', () => {
      it('constructs Entity internal version to 1 if unspecified', () => {
        const e = new Entity();
        expect(e.v).toBe(1);
      });

      it('increments Entity internal version if specified', () => {
        const e = new Entity({ v: 10 });
        expect(e.v).toBe(11);
      });
    });

    describe('visible', () => {
      it('constructs Entity as visible, default to true unless passed explicit false', () => {
        const e1 = new Entity();
        const e2 = new Entity({ visible: 'whatever' });
        const e3 = new Entity({ visible: undefined });
        const e4 = new Entity({ visible: null });
        const e5 = new Entity({ visible: false });
        expect(e1.visible).toBeTrue();
        expect(e2.visible).toBeTrue();
        expect(e3.visible).toBeTrue();
        expect(e4.visible).toBeTrue();
        expect(e5.visible).toBeFalse();
      });
    });

    describe('tags', () => {
      it('constructs Entity with no tags by default', () => {
        const e = new Entity();
        const tags = e.tags;
        expect(tags).toBeInstanceOf(Map);
        expect(tags.size).toBe(0);
      });

      it('constructs Entity with tags passed as Object', () => {
        const t = { foo: 'bar' };
        const e = new Entity({ tags: t });
        const tags = e.tags;
        expect(tags).toBeInstanceOf(Map);
        expect(tags.get('foo')).toBe('bar');
      });

      it('constructs Entity with tags passed as Map', () => {
        const t = new Map().set('foo', 'bar');
        const e = new Entity({ tags: t });
        const tags = e.tags;
        expect(tags).toBeInstanceOf(Map);
        expect(tags.get('foo')).toBe('bar');
      });
    });

    describe('copy constructor', () => {
      it('constructs Entity from another Entity', () => {
        const e1 = new Entity({ id: 'e123', visible: false, tags: { foo: 'bar'} });
        expect(e1.v).toBe(1);

        const e2 = new Entity(e1);
        expect(e2).toBeInstanceOf(Entity);
        expect(e2).not.toBe(e1);
        expect(e2.id).toBe('e123');
        expect(e2.v).toBe(2);
        expect(e2.visible).toBe(false);
        expect(e2.tags.get('foo')).toBe('bar');
      });
    });

  });

//   it('returns a subclass of the appropriate type', () => {
//     expect(Entity({ type: 'node' })).be.an.instanceOf(iD.osmNode);
//     expect(Entity({ type: 'way' })).be.an.instanceOf(iD.osmWay);
//     expect(Entity({ type: 'relation' })).be.an.instanceOf(iD.osmRelation);
//     expect(Entity({ id: 'n1' })).be.an.instanceOf(iD.osmNode);
//     expect(Entity({ id: 'w1' })).be.an.instanceOf(iD.osmWay);
//     expect(Entity({ id: 'r1' })).be.an.instanceOf(iD.osmRelation);
//   });

  describe('static .id', () => {
    describe('.fromOSM', () => {
      it('returns a ID string unique across entity types', () => {
        expect(Entity.id.fromOSM('node', '1')).toBe('n1');
      });
    });
    describe('.toOSM', () => {
      it('reverses fromOSM', () => {
        expect(Entity.id.toOSM(Entity.id.fromOSM('node', '1'))).toBe('1');
      });
    });
  });

  describe('static .key', () => {
    it('returns an identifier that combines the id and internal version', () => {
      const e = new Entity({ id: 'e123' });
      expect(Entity.key(e)).toBe('e123v1');
    });
  });

  describe('#copy', () => {
    it('returns a new Entity', () => {
      const e1 = new Entity({ id: 'n' });
      const e2 = e1.copy(null, {});
      expect(e2).toBeInstanceOf(Entity);
      expect(e2).not.toBe(e1);
    });

    it("works without 'copies' argument", () => {
      const e1 = new Entity({ id: 'n' });
      const e2 = e1.copy(null);
      expect(e2).toBeInstanceOf(Entity);
      expect(e2).not.toBe(e1);
    });

    it('adds the new Entity to input object', () => {
      let copies = {};
      const e1 = new Entity({ id: 'n' });
      const e2 = e1.copy(null, copies);
      expect(Object.keys(copies)).toHaveLength(1);
      expect(copies.n).toBe(e2);
    });

    it('returns an existing copy in input object', () => {
      let copies = {};
      const e1 = new Entity({ id: 'n' });
      const e2 = e1.copy(null, copies);
      const e3 = e1.copy(null, copies);
      expect(Object.keys(copies)).toHaveLength(1);
      expect(e2).toBe(e3);
    });

    it("resets 'id', 'user', and 'version' properties", () => {
      let copies = {};
      const e = new Entity({ id: 'n', version: 10, user: 'user' });
      e.copy(null, copies);
      expect(copies.n.isNew()).toBeTruthy();
      expect(copies.n.version).toBeUndefined();
      expect(copies.n.user).toBeUndefined();
    });

    it('copies tags', () => {
      let copies = {};
      const e = new Entity({ id: 'n', tags: { foo: 'foo' } });
      e.copy(null, copies);
      expect(copies.n.tags).toEqual(e.tags);
    });
  });

  describe('#osmId', () => {
    it('returns the numeric OSM id as a string', () => {
      expect(new Entity({ id: 'w1234' }).osmId()).toBe('1234');
      expect(new Entity({ id: 'n1234' }).osmId()).toBe('1234');
      expect(new Entity({ id: 'r1234' }).osmId()).toBe('1234');
    });
  });

  describe('#isNew', () => {
    it('returns true if the OSM id is negative', () => {
      expect(new Entity({ id: 'n-1234' }).isNew()).toBeTrue();
      expect(new Entity({ id: 'n1234' }).isNew()).toBeFalse();
    });
  });

  describe('#update', () => {
    it('returns a new Entity', () => {
      const e1 = new Entity();
      const e2 = e1.update({});
      expect(e2).toBeInstanceOf(Entity);
      expect(e2).not.toBe(e1);
    });

    it('updates the specified attributes', () => {
      const tags = new Map().set('foo', 'bar');
      const e = new Entity().update({ tags: tags });
      expect(e.tags).toEqual(tags);
    });

    it('preserves existing attributes', () => {
      const e = new Entity({ id: 'w1' }).update({});
      expect(e.id).toBe('w1');
    });

    it("doesn't modify the input", () => {
      const props1 = { tags: { foo: 'bar' } };
      const props2 = props1;
      new Entity().update(props1);
      expect(props1).toBe(props2);
    });

    it("doesn't copy prototype properties", () => {
      const e = new Entity().update({});
      expect(e.hasOwnProperty('update')).toBeFalsy();
    });

    it('increments v', () => {
      const e1 = new Entity()
      expect(e1.v).toBe(1);
      const e2 = e1.update({});
      expect(e2.v).toBe(2);
    });
  });

  describe('#mergeTags', () => {
    it('returns self if unchanged', () => {
      const e1 = new Entity({ tags: { a: 'a' } });
      const e2 = e1.mergeTags({ a: 'a' });
      expect(e2).toBe(e1);
    });

    it('returns self if passed bad argument', () => {
      const e = new Entity({ tags: { a: 'a' } });
      expect(e.mergeTags({})).toBe(e);
      expect(e.mergeTags()).toBe(e);
      expect(e.mergeTags(null)).toBe(e);
      expect(e.mergeTags(5)).toBe(e);
      expect(e.mergeTags([])).toBe(e);
    });

    it('returns a new Entity if changed', () => {
      const e1 = new Entity({ tags: { a: 'a' } });
      const e2 = e1.mergeTags({ a: 'b' });
      expect(e2 instanceof Entity).toBeTrue();
      expect(e2).not.toBe(e1);
    });

    it('merges tags passed as Object', () => {
      const e1 = new Entity({ tags: { a: 'a' } });
      const e2 = e1.mergeTags({ b: 'b' });
      const tags = e2.tags;
      expect(tags).toBeInstanceOf(Map);
      expect(tags.get('a')).toBe('a');
      expect(tags.get('b')).toBe('b');
    });

    it('merges tags passed as Map', () => {
      const e1 = new Entity({ tags: { a: 'a' } });
      const e2 = e1.mergeTags(new Map().set('b', 'b'));
      const tags = e2.tags;
      expect(tags).toBeInstanceOf(Map);
      expect(tags.get('a')).toBe('a');
      expect(tags.get('b')).toBe('b');
    });

    it('coaxes undefined and null to empty string', () => {
      const e = new Entity();
      expect(e.mergeTags({ a: undefined }).tags.get('a')).toBe('');
      expect(e.mergeTags({ a: null }).tags.get('a')).toBe('');
    });

    it('combines conflicting tags with semicolons', () => {
      const e1 = new Entity({ tags: { a: 'a' } });
      const e2 = e1.mergeTags({ a: 'b' });
      const tags = e2.tags;
      expect(tags).toBeInstanceOf(Map);
      expect(tags.get('a')).toBe('a;b');
    });

    it('combines combined tags', () => {
      const e1 = new Entity({ tags: { a: 'a;b' } });
      const e2 = new Entity({ tags: { a: 'b' } });

      const e3 = e1.mergeTags(e2.tags);
      expect(e3.tags).toBeInstanceOf(Map);
      expect(e3.tags.get('a')).toBe('a;b');

      const e4 = e2.mergeTags(e1.tags);
      expect(e4.tags).toBeInstanceOf(Map);
      expect(e4.tags.get('a')).toBe('b;a');
    });

    it('combines combined tags with whitespace', () => {
      const e1 = new Entity({ tags: { a: 'a; b' } });
      const e2 = new Entity({ tags: { a: 'b' } });

      const e3 = e1.mergeTags(e2.tags);
      expect(e3.tags).toBeInstanceOf(Map);
      expect(e3.tags.get('a')).toBe('a;b');

      const e4 = e2.mergeTags(e1.tags);
      expect(e4.tags).toBeInstanceOf(Map);
      expect(e4.tags.get('a')).toBe('b;a');
    });
  });

  describe('#extent', () => {
    it('returns a default Extent', () => {
      const e = new Entity();
      const extent = e.extent();
      expect(extent).toBeInstanceOf(Extent);
      expect(extent.min).toStrictEqual([Infinity, Infinity]);
      expect(extent.max).toStrictEqual([-Infinity, -Infinity]);
    });
  });

  describe('#intersects', () => {
    it('intersects the default Extent', () => {
      const e = new Entity();
      expect(e.intersects(new Extent([0, 0]))).toBeFalsy();
    });
  });


//   describe('#hasNonGeometryTags', () => {
//     it('returns false for an entity without tags', () => {
//       var node = iD.osmNode();
//       expect(node.hasNonGeometryTags()).to.equal(false);
//     });

//     it('returns true for an entity with tags', () => {
//       var node = iD.osmNode({ tags: { foo: 'bar' } });
//       expect(node.hasNonGeometryTags()).to.equal(true);
//     });

//     it('returns false for an entity with only an area=yes tag', () => {
//       var node = iD.osmNode({ tags: { area: 'yes' } });
//       expect(node.hasNonGeometryTags()).to.equal(false);
//     });
//   });

//   describe('#hasParentRelations', () => {
//     it('returns true for an entity that is a relation member', () => {
//       var node = iD.osmNode();
//       var relation = iD.osmRelation({ members: [{ id: node.id }] });
//       var graph = iD.coreGraph([node, relation]);
//       expect(node.hasParentRelations(graph)).to.equal(true);
//     });

//     it('returns false for an entity that is not a relation member', () => {
//       var node = iD.osmNode();
//       var graph = iD.coreGraph([node]);
//       expect(node.hasParentRelations(graph)).to.equal(false);
//     });
//   });

//   describe('#deprecatedTags', () => {
//     var deprecated = [
//       { old: { highway: 'no' } },
//       { old: { amenity: 'toilet' }, replace: { amenity: 'toilets' } },
//       { old: { speedlimit: '*' }, replace: { maxspeed: '$1' } },
//       { old: { man_made: 'water_tank' }, replace: { man_made: 'storage_tank', content: 'water' } },
//       { old: { amenity: 'gambling', gambling: 'casino' }, replace: { amenity: 'casino' } }
//     ];

//     it('returns none if entity has no tags', () => {
//       expect(Entity().deprecatedTags(deprecated)).toBe([]);
//     });

//     it('returns none when no tags are deprecated', () => {
//       expect(Entity({ tags: { amenity: 'toilets' } }).deprecatedTags(deprecated)).toBe([]);
//     });

//     it('returns 1:0 replacement', () => {
//       expect(Entity({ tags: { highway: 'no' } }).deprecatedTags(deprecated)).toBe([
//         { old: { highway: 'no' } }
//       ]);
//     });

//     it('returns 1:1 replacement', () => {
//       expect(Entity({ tags: { amenity: 'toilet' } }).deprecatedTags(deprecated)).toBe([
//         { old: { amenity: 'toilet' }, replace: { amenity: 'toilets' } }
//       ]);
//     });

//     it('returns 1:1 wildcard', () => {
//       expect(Entity({ tags: { speedlimit: '50' } }).deprecatedTags(deprecated)).toBe([
//         { old: { speedlimit: '*' }, replace: { maxspeed: '$1' } }
//       ]);
//     });

//     it('returns 1:2 total replacement', () => {
//       expect(Entity({ tags: { man_made: 'water_tank' } }).deprecatedTags(deprecated)).toBe([
//         { old: { man_made: 'water_tank' }, replace: { man_made: 'storage_tank', content: 'water' } }
//       ]);
//     });

//     it('returns 1:2 partial replacement', () => {
//       expect(
//         iD
//           .osmEntity({ tags: { man_made: 'water_tank', content: 'water' } })
//           .deprecatedTags(deprecated)
//       ).toBe([
//         { old: { man_made: 'water_tank' }, replace: { man_made: 'storage_tank', content: 'water' } }
//       ]);
//     });

//     it('returns 2:1 replacement', () => {
//       expect(
//         iD
//           .osmEntity({ tags: { amenity: 'gambling', gambling: 'casino' } })
//           .deprecatedTags(deprecated)
//       ).toBe([
//         { old: { amenity: 'gambling', gambling: 'casino' }, replace: { amenity: 'casino' } }
//       ]);
//     });
//   });

  describe('#hasInterestingTags', () => {
    it('returns false if the entity has no tags', () => {
      const e = new Entity();
      expect(e.hasInterestingTags()).toBeFalse();
    });

    it("returns true if the entity has tags other than 'attribution', 'created_by', 'source', 'odbl' and tiger tags", () => {
      const e = new Entity({ tags: { foo: 'bar' } });
      expect(e.hasInterestingTags()).toBeTrue();
    });

    it('return false if the entity has only uninteresting tags', () => {
      const e = new Entity({ tags: { source: 'Bing' } });
      expect(e.hasInterestingTags()).toBeFalse();
    });

    it('return false if the entity has only tiger tags', () => {
      const e = new Entity({ tags: { 'tiger:source': 'blah', 'tiger:foo': 'bar' } });
      expect(e.hasInterestingTags()).toBeFalse();
    });
  });

  describe('#isHighwayIntersection', () => {
    it('returns false', () => {
      const e = new Entity();
      expect(e.isHighwayIntersection()).toBeFalse();
    });
  });

  describe('#isDegenerate', () => {
    it('returns true', () => {
      const e = new Entity();
      expect(e.isDegenerate()).toBeTrue();
    });
  });

});
