import { JsonConverter } from '..';

describe('osm/converter/', () => {
  describe('jsonConverter', () => {
    const fs = require('fs')
    fs.readFile('./payload.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      let converter = new JsonConverter();
      converter.convert(data, ({ }, entities) => {
        it('construct entities and check id', () => {
          expect(entities.filter(entity => entity.type === 'node').length).toBe(4);
          expect(entities.filter(entity => entity.type === 'way').length).toBe(2);
          expect(entities.filter(entity => entity.type === 'relation').length).toBe(1);
        })
      });
    });
  });
})
