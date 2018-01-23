# indexedDB-CRUD

indexedDB-CRUD packs obscure indexedDB CRUD methods to a really friendly succinct interface. And offer **multi-objectStore CRUD handler**.

If you want to operate **one or more indexedDB objectStore**, just `DB.open(config, openSuccessCallback)`, and *you'll get a indexedDB-crud handler* when its `openSuccessCallback` finished.

Hope you keep in mind that:

* `config`'s **format should be correct**
* if you not input `storeName` explicitly in API, your config's first `sotreName` will be the **default storeName**
* indexedDB object store can *only hold JavaScript objects*. The objects *must have a property with the same name as the key path*

## Installation

```npm scripts
npm install indexeddb-crud --save
```

## API Overview

### first step

* open(config, openSuccessCallback, openFailCallback)

### common

get:

* getLength(storeName?)
* getNewKey(storeName?)

* getItem(key, successCallback?, storeName?)
* getConditionItem(condition, whether, successCallback?, storeName?)
* getAll(successCallback?, storeName?)

add:

* addItem(data, successCallback?, storeName?)

remove:

* removeItem(key, successCallback?, storeName?)
* removeConditionItem(condition, whether, successCallback?, storeName?)
* clear(successCallback?, storeName?)

update:

* updateItem(newData, successCallback?, storeName?)

## usage

### import

```javascript
var DB = require('indexeddb-crud');

// or ES6
import DB from 'indexeddb-crud';
```

### API

#### open(config, successCallback?, failCallback?)

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
        ...(must have key property, number type)
      ]
    },
    ...
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
        { id: 0, event: 'JustDemo', finished: true, date: 0 } // just for demo, not actual use
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
        { id: 1, event: 'JustDemo', finished: true, date: 0 }
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

DB.open(config, addEvents);
```

#### getLength(storeName?)

```javascript
var storeName = 'list';
var randomIndex = Math.floor(DB.getLength(storeName) * Math.random());
// or use the default storeName
var randomIndex = Math.floor(DB.getLength() * Math.random());
```

#### getNewKey(storeName?)

```javascript
var storeName = 'list';
DB.getNewKey(storeName);
// or use the default storeName
DB.getNewKey();
```

You will need it in `addItem()`.

#### addItem(data, successCallback?, storeName?)

* data's structure should at least contains number type key.

e.g.

```javascript
var data = { 
  id: DB.getNewKey(storeName), 
  event: 'play soccer', 
  finished: false 
};
var storeName = 'list';
DB.addItem(data, null, storeName);
// or use the default storeName
DB.addItem(data);
```

#### getItem(key, successCallback?, storeName?)

```javascript
function doSomething(data) {
  console.log(data);
}
var storeName = 'list';
DB.getItem(1, doSomething, storeName);
// or use the default storeName
DB.getItem(1, doSomething);
```

* the key should be a number, which matched to db's id

#### getConditionItem(condition, whether, successCallback?, storeName?)

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
        { id: 0, event: 'JustDemo', finished: true, date: 0 } // just for demo, not actual use
      ]
    }
  ]
};
var storeName = 'list';
DB.getConditionItem('finished', false, doSomething,storeName);
// or use the default storeName
DB.getConditionItem('finished', false, doSomething);
```

#### getAll(successCallback?, storeName?)

```javascript
function doSomething(dataArr) {
  console.log(dataArr);
}
var storeName = 'list';
DB.getAll(doSomething, storeName);
// or use the default storeName
DB.getAll(doSomething);
```

#### removeItem(key, successCallback?, storeName?)

* the **key should be number type**, which matched to db's key.

```javascript
var storeName = 'list';
DB.removeItem(1, doSomething, storeName);
// or use the default storeName
DB.removeItem(1, doSomething);
```

#### removeConditionItem(condition, whether, successCallback?, storeName?)

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
        { id: 0, event: 'JustDemo', finished: true, date: 0 } // just for demo, not actual use
      ]
    }
  ]
};
var storeName = 'list';
DB.removeConditionItem('true', successCallback, storeName);
// or use the default storeName
DB.removeConditionItem('true', successCallback);
```

#### clear(successCallback?, storeName?)

```javascript
var storeName = 'list';
DB.clear(doSomething, storeName);
// or use the default storeName
DB.clear(doSomething);
```

#### updateItem(newData, successCallback?, storeName?)

```javascript
var DBConfig = {
  name: 'JustToDo',
  version: '23',
  storeConfig: [
    {
      storeName: 'list',
      key: 'id',
      initialData: [
        { id: 0, event: 'JustDemo', finished: true, date: 0 } // just for demo, not actual use
      ]
    }
  ]
};
var storeName = 'list';
DB.updateItem(newData, doSomething, storeName);
// or use the default storeName
DB.updateItem(newData, doSomething);
```

## example

a simple todolist web-app, storage data in indexedDB (use indexeddb-crud to handler 2 different objectStores): https://github.com/RayJune/JustToDo/blob/gh-pages/src/scripts/main.js

## author

[RayJune](http://rayjune.xyz/about): a CS university student from Fuzhou, Fujian, China

## License

MIT