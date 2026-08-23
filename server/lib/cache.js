class TtlCache {
  constructor(ttl, keyed = false) {
    this.ttl = ttl;
    this.keyed = keyed;
    this.data = keyed ? {} : null;
    this.expiresAt = 0;
  }

  get(key) {
    if (Date.now() >= this.expiresAt) return null;
    return this.keyed ? this.data[key] || null : this.data;
  }

  set(key, value) {
    if (this.keyed) {
      this.data[key] = value;
    } else {
      this.data = key;
    }
    this.expiresAt = Date.now() + this.ttl;
  }
}

module.exports = { TtlCache };
