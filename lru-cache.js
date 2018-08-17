(function() {
      'use strict';

      function LRUCacheFactory() {

            function CacheEntry(key, value, prev, next) {
                  this.key = key;
                  this.value = value;
                  this.prev = prev;
                  this.next = next;
            }

            function LRUCache(cacheLimit) {
                  this._size = 0;
                  this._cacheLimit = cacheLimit;
                  this._first = this._last = undefined;
                  this._store = {};
            }

            /**
             * Put <value> into the cache associated with <key>. Returns the entry which was
             * removed to make room for the new entry. Otherwise undefined is returned         
             */
            LRUCache.prototype.put = function(key, value) {
                  var entry = this._store[key];

                  if (entry) {
                        entry.value = value;
                        this._moveToFront(entry);
                        return;
                  }

                  this._store[key] = entry = new CacheEntry(key, value, undefined, undefined);

                  if (this._first) {
                        this._first.next = entry;
                        entry.prev = this._first;
                  } else
                        this._last = entry;

                  this._first = entry;
                  this._size++;
                  if (this._size > this._cacheLimit)
                        return this.purge();
            };

            /**
             * Purge the least recently used (_last) entry from the cache. Returns the
             * removed entry or undefined if the cache was empty
             */
            LRUCache.prototype.purge = function() {
                  var entry = this._last;
                  if (entry) {
                        if (this._last.next) {
                              this._last = this._last.next;
                              this._last.prev = undefined;
                        } else {
                              this._last = undefined;
                              this._first = undefined;
                        }

                        entry.next = entry.prev = undefined;

                        delete this._store[entry.key];
                        this._size--;
                  }

                  return entry;
            };

            /**
             * Get and register recent use of <key>. Returns the value associated with <key>
             * or undefined if not in cache.
             */
            LRUCache.prototype.get = function(key) {
                  var entry = this._getEntry(key);

                  return entry ? entry.value : undefined;
            };

            /**
             * Check if <key> is in the cache without registering recent use. Feasible if
             * you do not want to chage the state of the cache, but only "peek" at it.
             * Returns the entry associated with <key> if found, or undefined if not found.
             */
            LRUCache.prototype.find = function(key) {
                  return this._store[key];
            };

            /**
             * Update the value of entry with <key>. Returns the old value, or undefined if
             * entry was not in the cache.
             */
            LRUCache.prototype.set = function(key, value) {
                  var oldvalue,
                        entry = this._getEntry(key);

                  if (entry) {
                        oldvalue = entry.value;
                        entry.value = value;
                  }

                  return oldvalue;
            };

            /**
             * Remove entry <key> from cache and return its value. Returns undefined if not
             * found.
             */
            LRUCache.prototype.remove = function(key) {
                  var entry = this._store[key];
                  if (!entry)
                        return;

                  delete this._store[entry.key];

                  if (entry.next && entry.prev) {
                        entry.prev.next = entry.next;
                        entry.next.prev = entry.prev;
                  } else if (entry.next) {
                        entry.next.prev = undefined;
                        this._last = entry.next;
                  } else if (entry.prev) {
                        entry.prev.next = undefined;
                        this._first = entry.prev;
                  } else
                        this._last = this._first = undefined;

                  this._size--;

                  return entry.value;
            };

            /** Removes all entries */
            LRUCache.prototype.removeAll = function() {
                  this._last = this._first = undefined;
                  this._size = 0;
                  this._store = {};
            };

            /** Returns a JSON (array) representation */
            LRUCache.prototype.toJSON = function() {
                  var _storeJSON = new Array(this._size),
                        i = 0,
                        entry = this._last;
                  while (entry) {
                        _storeJSON[i++] = {
                              key: entry.key,
                              value: entry.value
                        };
                        entry = entry.next;
                  }

                  return _storeJSON;
            };

            /** Returns a String representation */
            LRUCache.prototype.toString = function() {
                  var _storeStr = '',
                        entry = this._last;

                  while (entry) {
                        _storeStr += String(entry.key) + ':' + entry.value;
                        entry = entry.next;
                        if (entry)
                              _storeStr += ' < ';
                  }

                  return _storeStr;
            };

            /**
             * Return an array containing all keys of entries _stored in the cache object, in
             * arbitrary order.
             */
            LRUCache.prototype.keys = function() {
                  if (typeof Object.keys === 'function')
                        return Object.keys(this._store);

                  var keys = [];
                  for (var k in this._store)
                        keys.push(k);
                  return keys;
            };

            LRUCache.prototype._moveToFront = function(entry) {
                  if (entry === this._first)
                        return;

                  if (entry.next) {
                        if (entry === this._last)
                              this._last = entry.next;

                        entry.next.prev = entry.prev;
                  }

                  if (entry.prev)
                        entry.prev.next = entry.next;

                  entry.next = undefined;
                  entry.prev = this._first;
                  if (this._first)
                        this._first.next = entry;

                  this._first = entry;
            };

            LRUCache.prototype._getEntry = function(key) {
                  var entry = this._store[key];
                  if (entry !== undefined)
                        this._moveToFront(entry);

                  return entry;
            };

            this.newInstance = function(_cacheLimit) {
                  var lruCache = new LRUCache(_cacheLimit);
                  return lruCache;
            };
      }
})();