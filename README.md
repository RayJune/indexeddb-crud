# indexedDB-CRUD

indexedDB-CRUD packs obscure indexedDB CRUD methods to a really friendly succinct interface. And offer **multi-objectStores CRUD handler**.

If you want to operate **one or more indexedDB objectStore**, just `DB.open(config, openSuccessCallback)`, and *you'll get a indexedDB-crud handler* when its `openSuccessCallback` finished.

Hope you keep in mind that:

* `config`'s format should be correct
* indexedDB object store can *only hold JavaScript objects*. The objects *must have a property with the same name as the key path*

## Installation

```npm scripts
npm install indexeddb-crud --save
```

## API Overview

### first step

* open(config, openSuccessCallback, openFailCallback)

* getLength(storeName)
* getNewKey(storeName)

### common

get:

* getItem(storeName, key, successCallback?)
* getConditionItem(storeName, condition, whether, successCallback?)
* getAll(storeName, successCallback?)

add:

* addItem(storeName, data, successCallback?)

remove:

* removeItem(storeName, key, successCallback?)
* removeConditionItem(storeName, condition, whether, successCallback?)
* clear(storeName, successCallback?)

update:

* updateItem(storeName, newData, successCallback?)

## usage

### import

```javascript
var DB = require('indexeddb-crud');
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

#### getLength(storeName)

```javascript
var storeName = 'list';
var randomIndex = Math.floor(DB.getLength(storeName) * Math.random());
```

#### getNewKey(storeName)

```javascript
var storeName = 'list';
DB.getNewKey(storeName);
```

You will need it in `addItem(storeName, )`.

#### addItem(storeName, data, successCallback?)

* data's structure should at least contains number type key.

e.g.

```javascript
var data = { 
  id: DB.getNewKey(storeName), 
  event: 'play soccer', 
  finished: false 
};
var storeName = 'list';
DB.addItem(storeName, data);
```

#### getItem(storeName, key, successCallback?)

```javascript
function dosomething(data) {
  console.log(data);
}
var storeName = 'list';
DB.getItem(storeName, 1, dosomething);
// data's value
```

* the key should be a number, which matched to db's id

#### getConditionItem(storeName, condition, whether, successCallback?)

```javascript
var storeName = 'list';
DB.getConditionItem(storeName, condition, whether, successCallback?);
```

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
DB.getConditionItem(storeName, 'true', key, successCallback);
```

#### getAll(storeName, successCallback?)

```javascript
function doSomething(dataArr) {
  console.log(dataArr);
}
var storeName = 'list';
DB.getAll(storeName, doSomething);
// dataArr's value
```

#### removeItem(storeName, key, successCallback?)

* the **key should be number type**, which matched to db's key.

```javascript
var storeName = 'list';
DB.removeItem(storeName, 1);
```

#### removeConditionItem(storeName, condition, whether, successCallback?)

```javascript
var storeName = 'list';
DB.removeConditionItem(storeName, condition, whether, successCallback?);
```

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
DB.removeConditionItem(storeName, 'true', key, successCallback);
```

#### clear(storeName, successCallback?)

```javascript
var storeName = 'list';
DB.clear(storeName);
```

#### updateItem(storeName, newData, successCallback?)

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
DB.updateItem(storeName, newData);
```

## example

a simple todolist web-app, storage data in indexedDB (use indexeddb-crud to handler 2 different objectStores): https://github.com/RayJune/JustToDo/blob/gh-pages/src/scripts/main.js

## author

[RayJune](http://rayjune.xyz/about): a CS university student from Fuzhou, Fujian, China

## License

MIT