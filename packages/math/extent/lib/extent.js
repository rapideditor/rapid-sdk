import { geoMetersToLat, geoMetersToLon } from '@ideditor/geo';

export function Extent(min, max) {
  if (!(this instanceof Extent)) {
    return new Extent(min, max);
  } else if (min instanceof Extent) {
    return min;
  } else if (min && min.length === 2 && min[0].length === 2 && min[1].length === 2) {
    this[0] = min[0];
    this[1] = min[1];
  } else {
    this[0] = min || [Infinity, Infinity];
    this[1] = max || min || [-Infinity, -Infinity];
  }
}

Extent.prototype = new Array(2);

Object.assign(Extent.prototype, {
  equals: function(other) {
    return (
      this[0][0] === other[0][0] &&
      this[0][1] === other[0][1] &&
      this[1][0] === other[1][0] &&
      this[1][1] === other[1][1]
    );
  },

  extend: function(other) {
    if (!(other instanceof Extent)) other = new Extent(other);
    return Extent(
      [Math.min(other[0][0], this[0][0]), Math.min(other[0][1], this[0][1])],
      [Math.max(other[1][0], this[1][0]), Math.max(other[1][1], this[1][1])]
    );
  },

  _extend: function(other) {
    this[0][0] = Math.min(other[0][0], this[0][0]);
    this[0][1] = Math.min(other[0][1], this[0][1]);
    this[1][0] = Math.max(other[1][0], this[1][0]);
    this[1][1] = Math.max(other[1][1], this[1][1]);
  },

  area: function() {
    return Math.abs((this[1][0] - this[0][0]) * (this[1][1] - this[0][1]));
  },

  center: function() {
    return [(this[0][0] + this[1][0]) / 2, (this[0][1] + this[1][1]) / 2];
  },

  rectangle: function() {
    return [this[0][0], this[0][1], this[1][0], this[1][1]];
  },

  bbox: function() {
    return { minX: this[0][0], minY: this[0][1], maxX: this[1][0], maxY: this[1][1] };
  },

  polygon: function() {
    return [
      [this[0][0], this[0][1]],
      [this[0][0], this[1][1]],
      [this[1][0], this[1][1]],
      [this[1][0], this[0][1]],
      [this[0][0], this[0][1]]
    ];
  },

  contains: function(other) {
    if (!(other instanceof Extent)) other = new Extent(other);
    return (
      other[0][0] >= this[0][0] &&
      other[0][1] >= this[0][1] &&
      other[1][0] <= this[1][0] &&
      other[1][1] <= this[1][1]
    );
  },

  intersects: function(other) {
    if (!(other instanceof Extent)) other = new Extent(other);
    return (
      other[0][0] <= this[1][0] &&
      other[0][1] <= this[1][1] &&
      other[1][0] >= this[0][0] &&
      other[1][1] >= this[0][1]
    );
  },

  intersection: function(other) {
    if (!this.intersects(other)) return new Extent();
    return new Extent(
      [Math.max(other[0][0], this[0][0]), Math.max(other[0][1], this[0][1])],
      [Math.min(other[1][0], this[1][0]), Math.min(other[1][1], this[1][1])]
    );
  },

  percentContainedIn: function(other) {
    if (!(other instanceof Extent)) other = new Extent(other);
    var a1 = this.intersection(other).area();
    var a2 = this.area();

    if (a1 === Infinity || a2 === Infinity || a1 === 0 || a2 === 0) {
      return 0;
    } else {
      return a1 / a2;
    }
  },

  padByMeters: function(meters) {
    var dLat = geoMetersToLat(meters);
    var dLon = geoMetersToLon(meters, this.center()[1]);
    return Extent([this[0][0] - dLon, this[0][1] - dLat], [this[1][0] + dLon, this[1][1] + dLat]);
  },

  toParam: function() {
    return this.rectangle().join(',');
  }
});
