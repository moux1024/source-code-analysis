//jQuery的AMD？CMD实现：使用define来包裹模块，第一个参数是数组，获取依赖的模块，第二个参数是函数方法，将依赖传入
define([
    "./core",
    "./core/access",
    "./data/var/dataPriv",
    "./data/var/dataUser"
], function(jQuery, access, dataPriv, dataUser) {

    //	Implementation Summary
    //
    //	1. Enforce API surface and semantic compatibility with 1.9.x branch
    //	2. Improve the module's maintainability by reducing the storage
    //		paths to a single mechanism.
    //	3. Use the same single mechanism to support "private" and "user" data.
    //	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
    //	5. Avoid exposing implementation details on user objects (eg. expando properties)
    //	6. Provide a clear path for implementation upgrade to WeakMap in 2014

    var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
        rmultiDash = /[A-Z]/g;

    function dataAttr(elem, key, data) {
        var name;

        // If nothing was found internally, try to fetch any
        // data from the HTML5 data-* attribute
        if (data === undefined && elem.nodeType === 1) {//如果未传入data且选择器选中了元素
            name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();//取
            data = elem.getAttribute(name);

            if (typeof data === "string") {
                try {
                    data = data === "true" ? true :
                        data === "false" ? false :
                        data === "null" ? null :

                        // Only convert to a number if it doesn't change the string
                        +data + "" === data ? +data :
                        rbrace.test(data) ? jQuery.parseJSON(data) :
                        data;
                } catch (e) {}

                // Make sure we set the data so it isn't changed later
                dataUser.set(elem, key, data);
            } else {
                data = undefined;
            }
        }
        return data;
    }

    jQuery.extend({
        hasData: function(elem) {
            return dataUser.hasData(elem) || dataPriv.hasData(elem);
            //引用函数：Data构造函数实例dataUser的hasData
            // hasData: function( owner ) {
        	// 	var cache = owner[ this.expando ];// this.expando在Data的构造函数里被赋值为jQuery.expando + Data.uid++,jQuery.expando是个随机数，每次清空内存后会重置，Data.uid会从1开始累加
            //
        	// 	return cache !== undefined && !jQuery.isEmptyObject( cache );
        	// }
        },

        data: function(elem, name, data) {
            return dataUser.access(elem, name, data);
            //引用函数：
            //  access: function( owner, key, value ) {
            //
        		// 以下两种情况:
        		//
        		//   1. key === undefined
        		//   2. ( key && typeof key === "string" ) && value === undefined
        		//
        		// Take the "read" path and allow the get method to determine
        		// which value to return, respectively either:
        		//
        		//   1. The entire cache object
        		//   2. The data stored at the key
        		//
        	// 	if ( key === undefined ||
        	// 			( ( key && typeof key === "string" ) && value === undefined ) ) {
            //
        	// 		return this.get( owner, key );
        	// 	}
            //
        		// When the key is not a string, or both a key and value
        		// are specified, set or extend (existing objects) with either:
        		//
        		//   1. An object of properties
        		//   2. A key and value
        		//
        	// 	this.set( owner, key, value );
                //引用函数：set
                // set: function( owner, data, value ) {
                //         var prop,
                //             cache = this.cache( owner );
                //
                //         // Handle: [ owner, key, value ] args
                //         // Always use camelCase key (gh-2257)
                //         if ( typeof data === "string" ) {
                //             cache[ jQuery.camelCase( data ) ] = value;
                //
                //         // Handle: [ owner, { properties } ] args
                //         } else {
                //
                //             // Copy the properties one-by-one to the cache object
                //             for ( prop in data ) {
                //                 cache[ jQuery.camelCase( prop ) ] = data[ prop ];
                //             }
                //         }
                //         return cache;
                // },
            //
        		// Since the "set" path can have two possible entry points
        		// return the expected data based on which path was taken[*]
        	// 	return value !== undefined ? value : key;
        	// },
        },

        removeData: function(elem, name) {
            dataUser.remove(elem, name);
        },

        // TODO: Now that all calls to _data and _removeData have been replaced
        // with direct calls to dataPriv methods, these can be deprecated.
        _data: function(elem, name, data) {
            return dataPriv.access(elem, name, data);
        },

        _removeData: function(elem, name) {
            dataPriv.remove(elem, name);
        }
    });

    jQuery.fn.extend({//为jq实例添加方法
        data: function(key, value) {
            var i, name, data,
                elem = this[0],
                attrs = elem && elem.attributes;//用&&短路的方式赋值

            // Gets all values
            if (key === undefined) {
                if (this.length) {
                    data = dataUser.get(elem);

                    if (elem.nodeType === 1 && !dataPriv.get(elem, "hasDataAttrs")) {
                        i = attrs.length;
                        while (i--) {

                            // Support: IE11+
                            // The attrs elements can be null (#14894)
                            if (attrs[i]) {
                                name = attrs[i].name;
                                if (name.indexOf("data-") === 0) {
                                    name = jQuery.camelCase(name.slice(5));
                                    dataAttr(elem, name, data[name]);
                                }
                            }
                        }
                        dataPriv.set(elem, "hasDataAttrs", true);
                    }
                }

                return data;
            }

            // Sets multiple values
            if (typeof key === "object") {
                return this.each(function() {
                    dataUser.set(this, key);
                });
            }

            return access(this, function(value) {
                // var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
                // 	var i = 0,
                // 		len = elems.length,
                // 		bulk = key == null;
                //
                // 	// Sets many values
                // 	if ( jQuery.type( key ) === "object" ) {
                // 		chainable = true;
                // 		for ( i in key ) {
                // 			access( elems, fn, i, key[ i ], true, emptyGet, raw );
                // 		}
                //
                // 	// Sets one value
                // 	} else if ( value !== undefined ) {
                // 		chainable = true;
                //
                // 		if ( !jQuery.isFunction( value ) ) {
                // 			raw = true;
                // 		}
                //
                // 		if ( bulk ) {
                //
                // 			// Bulk operations run against the entire set
                // 			if ( raw ) {
                // 				fn.call( elems, value );
                // 				fn = null;
                //
                // 			// ...except when executing function values
                // 			} else {
                // 				bulk = fn;
                // 				fn = function( elem, key, value ) {
                // 					return bulk.call( jQuery( elem ), value );
                // 				};
                // 			}
                // 		}
                //
                // 		if ( fn ) {
                // 			for ( ; i < len; i++ ) {
                // 				fn(
                // 					elems[ i ], key, raw ?
                // 					value :
                // 					value.call( elems[ i ], i, fn( elems[ i ], key ) )
                // 				);
                // 			}
                // 		}
                // 	}
                //
                // 	if ( chainable ) {
                // 		return elems;
                // 	}
                //
                // 	// Gets
                // 	if ( bulk ) {
                // 		return fn.call( elems );
                // 	}
                //
                // 	return len ? fn( elems[ 0 ], key ) : emptyGet;
                // };
                //
                // return access;
                var data, camelKey;

                // The calling jQuery object (element matches) is not empty
                // (and therefore has an element appears at this[ 0 ]) and the
                // `value` parameter was not undefined. An empty jQuery object
                // will result in `undefined` for elem = this[ 0 ] which will
                // throw an exception if an attempt to read a data cache is made.
                if (elem && value === undefined) {

                    // Attempt to get data from the cache
                    // with the key as-is
                    data = dataUser.get(elem, key) ||

                        // Try to find dashed key if it exists (gh-2779)
                        // This is for 2.2.x only
                        dataUser.get(elem, key.replace(rmultiDash, "-$&").toLowerCase());

                    if (data !== undefined) {
                        return data;
                    }

                    camelKey = jQuery.camelCase(key);

                    // Attempt to get data from the cache
                    // with the key camelized
                    data = dataUser.get(elem, camelKey);
                    if (data !== undefined) {
                        return data;
                    }

                    // Attempt to "discover" the data in
                    // HTML5 custom data-* attrs
                    data = dataAttr(elem, camelKey, undefined);
                    if (data !== undefined) {
                        return data;
                    }

                    // We tried really hard, but the data doesn't exist.
                    return;
                }

                // Set the data...
                camelKey = jQuery.camelCase(key);
                this.each(function() {

                    // First, attempt to store a copy or reference of any
                    // data that might've been store with a camelCased key.
                    var data = dataUser.get(this, camelKey);

                    // For HTML5 data-* attribute interop, we have to
                    // store property names with dashes in a camelCase form.
                    // This might not apply to all properties...*
                    dataUser.set(this, camelKey, value);

                    // *... In the case of properties that might _actually_
                    // have dashes, we need to also store a copy of that
                    // unchanged property.
                    if (key.indexOf("-") > -1 && data !== undefined) {
                        dataUser.set(this, key, value);
                    }
                });
            }, null, value, arguments.length > 1, null, true);
        },

        removeData: function(key) {
            return this.each(function() {
                dataUser.remove(this, key);
            });
        }
    });

    return jQuery;
});
