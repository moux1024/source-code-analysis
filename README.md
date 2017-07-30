## jQuery.data源码分析
### 结构
#### define  
jQuery的AMD？CMD实现：使用define来包裹模块，第一个参数是数组，获取依赖的模块，第二个参数是函数方法，将依赖传入

#### 参数：  
- jQuery;
- access;
- dataPriv-返回一个jQuery.data的实例;
- dataUser-同上（**区别不明**）;

#### 声明：
- rbrace
- rmultiDash--匹配任意大写字母,用于处理驼峰命名，转为html中的“-”连接
- dataAttr  
 1. 要点1：

#### 实现：
- jQuery.extend()
 1. hasData
```js
hasData: function(elem) {
    return dataUser.hasData(elem) || dataPriv.hasData(elem);
    //引用函数：Data构造函数实例dataUser的hasData
    // hasData: function( owner ) {
    // 	var cache = owner[ this.expando ];// this.expando在Data的构造函数里被赋值为jQuery.expando + Data.uid++,jQuery.expando是个随机数，每次清空内存后会重置，Data.uid会从1开始累加
    //
    // 	return cache !== undefined && !jQuery.isEmptyObject( cache );
    // }
},
```
**不明之处**：dataUser和dataPriv此处有什么区别？  
 2. data
```js
data: function(elem, name, data) {
    return dataUser.access(elem, name, data);
},
```
引用了Data构造函数的实例dataUser的access方法属性：
```js
 access: function( owner, key, value ) {

    // 以下两种情况:

    //   1. key === undefined
    //   2. ( key && typeof key === "string" ) && value === undefined
    //
    // Take the "read" path and allow the get method to determine
    // which value to return, respectively either:
    //
    //   1. The entire cache object
    //   2. The data stored at the key

	if ( key === undefined ||
			( ( key && typeof key === "string" ) && value === undefined ) ) {

		return this.get( owner, key );
	}

    // When the key is not a string, or both a key and value
    // are specified, set or extend (existing objects) with either:
    //
    //   1. An object of properties
    //   2. A key and value

	this.set( owner, key, value );
    // 引用函数：set
    // set: function(  owner, data, value ) {
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

    // Since the "set" path can have two possible entry points
    return the expected data based on which path was taken[*]
	return value !== undefined ? value : key;
},
```

- jQuery.fn.extend()
