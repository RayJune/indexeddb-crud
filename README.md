# indexedDB-CRUD

indexedDB-CRUD packs obscure indexedDB CRUD methods to a really friendly succinct interface. And offer **multi-objectStore CRUD handler**.

If you want to operate **one or more indexedDB objectStore**, just `DB.open(config).then(successCallback).catch()`, and *you'll get a indexedDB-crud handler* when its `successCallback` finished.

Hope you keep in mind that:

* `config`'s **format should be correct**
* if you not input `storeName` explicitly in API, your config's first `sotreName` will be the **default storeName**
* indexedDB object store can *only hold JavaScript objects*. The objects *must have a property with the same name as the key path*

## Installation

```npm scripts
npm install indexeddb-crud --save

yarn add indexeddb-crud
```

## API Overview

### first step

* [open(config).then().catch()](https://github.com/RayJune/indexeddb-crud#openconfig-successcallback-failcallback)

**Only you open it, you can use these synchronous&asynchronous API**.

### synchronous API:

* [getLength(storeName?)](https://github.com/RayJune/indexeddb-crud#getlengthstorename)
* [getNewKey(storeName?)](https://github.com/RayJune/indexeddb-crud#getlengthstorename)

### asynchronous API

indexeddb-crud support for the ES6 Promises API, so you can use `then` & `catch` carefree.

get:

* [getItem(key, storeName?).then().catch()](https://github.com/RayJune/indexeddb-crud#getitemkey-successcallback-storename)
* [getConditionItem(condition, whether, successCallback?, storeName?)](https://github.com/RayJune/indexeddb-crud#getconditionitemcondition-whether-successcallback-storename)
* [getAll(storeName?).then().catch()](https://github.com/RayJune/indexeddb-crud#getallsuccesscallback-storename)

add:

* [addItem(data, storeName?).then().catch()](https://github.com/RayJune/indexeddb-crud#additemdata-successcallback-storename)

remove:

* [removeItem(key, storeName?).then().catch()](https://github.com/RayJune/indexeddb-crud#removeitemkey-successcallback-storename)
* [removeConditionItem(condition, whether, storeName?).then().catch()](https://github.com/RayJune/indexeddb-crud#removeconditionitemcondition-whether-successcallback-storename)
* [clear(storeName?).then().catch()](https://github.com/RayJune/indexeddb-crud#clearsuccesscallback-storename)

update:

* [updateItem(newData, storeName?).then().catch()](https://github.com/RayJune/indexeddb-crud#updateitemnewdata-successcallback-storename)

## usage

### import

```javascript
var DB = require('indexeddb-crud');

// or ES6
import DB from 'indexeddb-crud';
```

### API

#### open(config).then().catch()

* initialData is *Optional*, and it's a array object
* about initialData, `key = 0` is just for demo, we only use `key >= 1`, so we usually begain at `key = 1`
* your config's structure should like this, `you must have a key(number type)`, in this following code key is id)

```javascript
config = {
  name: '',
  version: '',
  storeConfig: [
    {
      storeName: '',
      key: '',
      storeConfig: [
        // must have key property, number type
      ]
    },
    // one or more storeConfig object
  ]
} 
```

correct config just like this:

```javascript
var DBConfig = {
  name: 'JustToDo',
  version: '23',
  storeConfig: [
    {
      storeName: 'list',
      key: 'id',
      initialData: [
        { id: 0, event: 'JustDemo', finished: true } // just for demo, not actual use
      ]
    }
  ]
};
```

If you need more than 1 ObjectStore:

```javascript
var DBConfig = {
  name: 'JustToDo',
  version: '23',
  storeConfig: [
    {
      storeName: 'list',
      key: 'id',
      initialData: [
        { id: 1, event: 'JustDemo', finished: true }
      ]
    },
    {
      storeName: 'aphorism',
      key: 'id',
      initialData: [
        {
          "id": 1,
          "content": "You're better than that"
        },
        {
          "id": 2,
          "content": "Yesterday You Said Tomorrow"
        }
      ]
    }
  ]
}
```

e.g. successCallback:

```javascript
function addEvents() {
  querySelector('#test').addEventlistener('click', clickHandler, false);
}
function clickHandler() {
  console.log('test');
}

DB.open(config).then(addEvents);
```

#### getLength(storeName?)

```javascript
// If you have only 1 objectSotre, suggest use the default storeName
var randomIndex = Math.floor(DB.getLength() * Math.random());

// or pass storeName explicitly
var storeName = 'list';
var randomIndex = Math.floor(DB.getLength(storeName) * Math.random());
```

#### getNewKey(storeName?)

```javascript
// If you have only 1 objectSotre, suggest use the default storeName
DB.getNewKey();

// or pass storeName explicitly
var storeName = 'list';
DB.getNewKey(storeName);
```

You will need it in `addItem()`.

#### addItem(data, storeName?).then().catch()

* data's structure should at least contains number type key.

e.g.

```javascript
var data = { 
  id: DB.getNewKey(storeName), 
  event: 'play soccer', 
  finished: false 
};

// If you have only 1 objectSotre, suggest use the default storeName
DB.addItem(data);

// or pass storeName explicitly
var storeName = 'list';
DB.addItem(data, storeName);
```

#### getItem(key, storeName?).then().catch()

```javascript
function doSomething(data) {
  console.log(data);
}

// If you have only 1 objectSotre, suggest use the default storeName 
DB.getItem(1).then(doSomething);

// or pass storeName explicitly
var storeName = 'list';
DB.getItem(1, storeName).then(doSomething);
```

* the key should be a number, which matched to db's id

#### getConditionItem(condition, whether, storeName?).then().catch()

* whether is `Boolean` type
* `condition` should be a **boolean-condition**, for example:

```javascript
var DBConfig = {
  name: 'JustToDo',
  version: '23',
  storeConfig: [
    {
      storeName: 'list',
      key: 'id',
      initialData: [
        { id: 0, event: 'JustDemo', finished: true } // just for demo, not actual use
      ]
    }
  ]
};

// If you have only 1 objectSotre, suggest use the default storeName 
DB.getConditionItem('finished', false).then(doSomething);

// or pass storeName explicitly
var storeName = 'list';
DB.getConditionItem('finished', false,storeName).then(doSomething);
```

#### getAll(storeName?)

```javascript
function doSomething(dataArr) {
  console.log(dataArr);
}

// If you have only 1 objectSotre, suggest use the default storeName 
DB.getAll(doSomething);

// or pass storeName explicitly
var storeName = 'list';
DB.getAll(doSomething, storeName);
```

#### removeItem(key, storeName?).then().catch()

* the **key should be number type**, which matched to db's key.

```javascript
// If you have only 1 objectSotre, suggest use the default storeName 
DB.removeItem(1).then(doSomething);

// or pass storeName explicitly
var storeName = 'list';
DB.removeItem(1, storeName).then(doSomething);
```

#### removeConditionItem(condition, whether, storeName?).then().catch()

* whether is Boolean
* `condition` should be a boolean-condition, for example:

```javascript
var DBConfig = {
  name: 'JustToDo',
  version: '23',
  storeConfig: [
    {
      storeName: 'list',
      key: 'id',
      initialData: [
        { id: 0, event: 'JustDemo', finished: true } // just for demo, not actual use
      ]
    }
  ]
};

// If you have only 1 objectSotre, suggest use the default storeName 
DB.removeConditionItem('true').then(successCallback);

// or pass storeName explicitly
var storeName = 'list';
DB.removeConditionItem('true', storeName).then(successCallback);
```

#### clear(storeName?).then().catch()

```javascript
// If you have only 1 objectSotre, suggest use the default storeName
DB.clear().then(doSomething);

// or pass storeName explicitly
var storeName = 'list';
DB.clear(storeName).then(doSomething);
```

#### updateItem(newData, storeName?).then().catch()

```javascript
var DBConfig = {
  name: 'JustToDo',
  version: '23',
  storeConfig: [
    {
      storeName: 'list',
      key: 'id',
      initialData: [
        { id: 0, event: 'JustDemo', finished: true } // just for demo, not actual use
      ]
    }
  ]
};

// If you have only 1 objectSotre, suggest use the default storeName
DB.updateItem(newData).then(doSomething);

// or pass storeName explicitly
var storeName = 'list';
DB.updateItem(newData, storeName).then(doSomething);
```

## example

a simple todolist web-app, storage data in indexedDB (use indexeddb-crud to handler 2 different objectStores): https://github.com/RayJune/JustToDo/blob/gh-pages/src/scripts/main.js

## author

[RayJune](https://www.rayjune.me/about): a CS university student from Fuzhou, Fujian, China

## License

MIT

