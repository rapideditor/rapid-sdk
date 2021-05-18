import { Entity, Node, Relation, Way} from '..';

describe('osm/model', () => {
  describe('entity.constructor', () => {
    let defaultProperties = {
      visible: true,
      version: 1,
      changeset: 10,
      user: "user",
      uid: "1"
    }
    let entities = [];

    entities.push(new Node({
      id: "n1",
      timestamp: new Date().toUTCString(),
      ...defaultProperties
    }));

    entities.push(new Node({
      id: "n2",
      timestamp: new Date().toUTCString(),
      ...defaultProperties
    }));

    entities.push(new Way({
      id: "w1",
      visible: true,
      version: 2,
      changeset: 15,
      timestamp: new Date().toUTCString(),
      user: "user2",
      uid: "2",
      tags: {
        highway: "residential",
        'name:sr': "Милош"
      },
      nodes: ['n1', 'n2']
    })
    );

    entities.push(new Relation({
      id: "r1",
      visible: true,
      version: 1,
      changeset: 15,
      timestamp: new Date().toUTCString(),
      user: "user2",
      uid: "2",
      tags: {
        restriction: "no_left_turn",
        'name:sr': "Милош"
      },
      members: [
        { "type": "way", "ref": 1, "role": "from" },
        { "type": "way", "ref": 1, "role": "to" }
      ]
    })
    );

    it('construct entities and check id', () => {
      entities.forEach(entity => {
        expect(Entity.idFromOsm(entity.id, entity.type) <= 2);
      })  
    });

    it('construct entities and check type counts', () => {
      expect(entities.filter(entity => entity.type === 'node').length === 2)
      expect(entities.filter(entity => entity.type === 'way').length === 1)
      expect(entities.filter(entity => entity.type === 'relation').length === 1)
    });
  });
});
