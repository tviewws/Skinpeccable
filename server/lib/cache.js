// Simple in-memory TTL cache. A keyed cache holds several entries that share
// one expiry; an unkeyed cache holds a single value.
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

  set(...args) {
    if (this.keyed) {
      const [key, value] = args;
      this.data[key] = value;
    } else {
      this.data = args[0];
    }
    this.expiresAt = Date.now() + this.ttl;
  }
}

module.exports = { TtlCache };
