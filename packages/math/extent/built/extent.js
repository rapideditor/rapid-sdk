import { geoMetersToLat, geoMetersToLon } from '@ideditor/geo';
var Extent = /** @class */ (function() {
  function Extent(otherOrMin, max) {
    this.min = [Infinity, Infinity];
    this.max = [-Infinity, -Infinity];
    var min;
    if (otherOrMin instanceof Extent) {
      min = otherOrMin.min;
      max = otherOrMin.max;
    } else {
      min = otherOrMin;
    }
    if (min && min.length === 2) {
      this.min[0] = min[0];
      this.min[1] = min[1];
      if (!max) max = min;
    }
    if (max && max.length === 2) {
      this.max[0] = max[0];
      this.max[1] = max[1];
    }
  }
  Extent.prototype.equals = function(other) {
    if (!(other instanceof Extent)) other = new Extent(other);
    return (
      this.min[0] === other.min[0] &&
      this.min[1] === other.min[1] &&
      this.max[0] === other.max[0] &&
      this.max[1] === other.max[1]
    );
  };
  Extent.prototype.extend = function(other) {
    if (!(other instanceof Extent)) other = new Extent(other);
    return new Extent(
      [Math.min(other.min[0], this.min[0]), Math.min(other.min[1], this.min[1])],
      [Math.max(other.max[0], this.max[0]), Math.max(other.max[1], this.max[1])]
    );
  };
  Extent.prototype.area = function() {
    return Math.abs((this.max[0] - this.min[0]) * (this.max[1] - this.min[1]));
  };
  Extent.prototype.center = function() {
    return [(this.min[0] + this.max[0]) / 2, (this.min[1] + this.max[1]) / 2];
  };
  Extent.prototype.rectangle = function() {
    return [this.min[0], this.min[1], this.max[0], this.max[1]];
  };
  Extent.prototype.bbox = function() {
    return { minX: this.min[0], minY: this.min[1], maxX: this.max[0], maxY: this.max[1] };
  };
  Extent.prototype.polygon = function() {
    return [
      [this.min[0], this.min[1]],
      [this.min[0], this.max[1]],
      [this.max[0], this.max[1]],
      [this.max[0], this.min[1]],
      [this.min[0], this.min[1]]
    ];
  };
  Extent.prototype.contains = function(other) {
    if (!(other instanceof Extent)) other = new Extent(other);
    return (
      other.min[0] >= this.min[0] &&
      other.min[1] >= this.min[1] &&
      other.max[0] <= this.max[0] &&
      other.max[1] <= this.max[1]
    );
  };
  Extent.prototype.intersects = function(other) {
    if (!(other instanceof Extent)) other = new Extent(other);
    return (
      other.min[0] <= this.max[0] &&
      other.min[1] <= this.max[1] &&
      other.max[0] >= this.min[0] &&
      other.max[1] >= this.min[1]
    );
  };
  Extent.prototype.intersection = function(other) {
    if (!this.intersects(other)) return new Extent();
    return new Extent(
      [Math.max(other.min[0], this.min[0]), Math.max(other.min[1], this.min[1])],
      [Math.min(other.max[0], this.max[0]), Math.min(other.max[1], this.max[1])]
    );
  };
  Extent.prototype.percentContainedIn = function(other) {
    if (!(other instanceof Extent)) other = new Extent(other);
    var a1 = this.intersection(other).area();
    var a2 = this.area();
    if (a1 === Infinity || a2 === Infinity || a1 === 0 || a2 === 0) {
      return 0;
    } else {
      return a1 / a2;
    }
  };
  Extent.prototype.padByMeters = function(meters) {
    var dLat = geoMetersToLat(meters);
    var dLon = geoMetersToLon(meters, this.center()[1]);
    return new Extent(
      [this.min[0] - dLon, this.min[1] - dLat],
      [this.max[0] + dLon, this.max[1] + dLat]
    );
  };
  Extent.prototype.toParam = function() {
    return this.rectangle().join(',');
  };
  return Extent;
})();
export { Extent };
