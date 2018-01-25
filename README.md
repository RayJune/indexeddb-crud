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

**Only you open it, you can use these synchronous&asynchronous API**.

### synchronous API:

* getLength(storeName?)
* getNewKey(storeName?)

### asynchronous API

get:

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

DB.open(config, addEvents);
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

#### addItem(data, successCallback?, storeName?)

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
DB.addItem(data, null, storeName);
```

#### getItem(key, successCallback?, storeName?)

```javascript
function doSomething(data) {
  console.log(data);
}

// If you have only 1 objectSotre, suggest use the default storeName 
DB.getItem(1, doSomething);

// or pass storeName explicitly
var storeName = 'list';
DB.getItem(1, doSomething, storeName);
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
        { id: 0, event: 'JustDemo', finished: true } // just for demo, not actual use
      ]
    }
  ]
};

// If you have only 1 objectSotre, suggest use the default storeName 
DB.getConditionItem('finished', false, doSomething);

// or pass storeName explicitly
var storeName = 'list';
DB.getConditionItem('finished', false, doSomething,storeName);
```

#### getAll(successCallback?, storeName?)

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

#### removeItem(key, successCallback?, storeName?)

* the **key should be number type**, which matched to db's key.

```javascript
// If you have only 1 objectSotre, suggest use the default storeName 
DB.removeItem(1, doSomething);

// or pass storeName explicitly
var storeName = 'list';
DB.removeItem(1, doSomething, storeName);
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
        { id: 0, event: 'JustDemo', finished: true } // just for demo, not actual use
      ]
    }
  ]
};

// If you have only 1 objectSotre, suggest use the default storeName 
DB.removeConditionItem('true', successCallback);

// or pass storeName explicitly
var storeName = 'list';
DB.removeConditionItem('true', successCallback, storeName);
```

#### clear(successCallback?, storeName?)

```javascript
// If you have only 1 objectSotre, suggest use the default storeName
DB.clear(doSomething);

// or pass storeName explicitly
var storeName = 'list';
DB.clear(doSomething, storeName);
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
        { id: 0, event: 'JustDemo', finished: true } // just for demo, not actual use
      ]
    }
  ]
};

// If you have only 1 objectSotre, suggest use the default storeName
DB.updateItem(newData, doSomething);

// or pass storeName explicitly
var storeName = 'list';
DB.updateItem(newData, doSomething, storeName);
```

## example

a simple todolist web-app, storage data in indexedDB (use indexeddb-crud to handler 2 different objectStores): https://github.com/RayJune/JustToDo/blob/gh-pages/src/scripts/main.js

## author

[RayJune](http://rayjune.xyz/about): a CS university student from Fuzhou, Fujian, China

## License

MIT