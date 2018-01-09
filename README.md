# indexedDB-CRUD

indexedDB-CRUD packs obscure indexedDB CRUD methods to a really friendly succinct interface.

It supports a configurable key(number type), a storeObject to store your data and CRUE methods to operate indexedDB extremely easily.

If you want to operate **one or more indexedDB objectStore**, just `new` it, and *you'll get a indexedDB-crud handler* for this objectStore.

Keep in mind that indexedDB object store can *only hold JavaScript objects*. The objects *must have a property with the same name as the key path*.

## Installation

```javascript
npm install indexeddb-crud --save
```

## API Overview

### first step

```javascript
var DB = require('indexeddb-crud');

var fooDBHandler = new(config, successCallback?, failCallback?); // handler foo objectStore
var barDBHandler = new(config, successCallback?, failCallback?); // handler bar objectStore
```

### common

* getLength()
* getNewKey()

get:

* getItem(key, successCallback?)
* getConditionItem(condition, whether, successCallback?)
* getAll(successCallback?)

add:

* addItem(data, successCallback?)

remove:

* removeItem(key, successCallback?)
* removeConditionItem(condition, whether, successCallback?)
* clear(successCallback?)

update:

* updateItem(newData, successCallback?)

## usage

### import

```javascript
var fooDBHandler = require('indexeddb-crud');
```

### API

#### open(config, successCallback?, failCallback?)

* your config's structure should like this (both have name, version and dataDemo{}, and in dataDemo, `you must have a key(number type)`, in this following code key is id)
* initialData is *Optional*, and it's a array object.

```javascript
var config = {  
  name: 'JustToDo',
  version: '1',
  key: 'id',
  storeName: 'user',
  initialData = {[
    { id: 0, someEvent: 0, finished: true, date: 0 }
  ]}
};
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

#### getLength()

```javascript
var randomIndex = Math.floor(DB.getLength() * Math.random());
```

#### getNewKey()

```javascript
fooDBHandler.getNewKey();
```

You will need it in `addItem()`.

#### addItem(data, successCallback?)

* data's structure should at least contains number type key.

e.g.

```javascript
var data = { 
  id: fooDBHandler.getNewKey(), 
  event: 'play soccer', 
  finished: false 
};
fooDBHandler.addItem(data);
```

#### getItem(key, successCallback?)

```javascript
function dosomething(data) {
  console.log(data);
}
fooDBHandler.getItem(1, dosomething);
// data's value
```

* the key should be a number, which matched to db's id

#### getConditionItem(condition, whether, successCallback?)

```javascript
fooDBHandler.getConditionItem(condition, whether, successCallback?);
```

* whether is Boolean
* `condition` should be a boolean-condition, for example:

```javascript
var dbConfig = {
  name: 'JustToDo',
  version: '11',
  key: 'id',
  storeName: 'list',
  initialData: [
    { id: 0, event: 0, finished: true, date: 0 }
  ]
};

fooDBHandler.getConditionItem('true', key, successCallback);
```

#### getAll(successCallback?)

```javascript
function doSomething(dataArr) {
  console.log(dataArr);
}
fooDBHandler.getAll(doSomething);
// dataArr's value
```

#### removeItem(key, successCallback?)

* the **key should be number type**, which matched to db's key.

```javascript
fooDBHandler.removeItem(1);
```

#### removeConditionItem(condition, whether, successCallback?)

```javascript
fooDBHandler.removeConditionItem(condition, whether, successCallback?);
```

* whether is Boolean
* `condition` should be a boolean-condition, for example:

```javascript
var dbConfig = {
  name: 'JustToDo',
  version: '11',
  key: 'id',
  storeName: 'list',
  initialData: [
    { id: 0, event: 0, finished: true, date: 0 }
  ]
};

fooDBHandler.removeConditionItem('true', key, successCallback);
```

#### clear(successCallback?)

```javascript
fooDBHandler.clear();
```

#### updateItem(newData, successCallback?)

```javascript
var newData = {
  id: 10,
  someEvent: 'play soccer',
  finished: true,
  userDate: new Date()
};
fooDBHandler.updateItem(newData);
```

## example

a simple todolist web-app, storage data in indexedDB (use indexeddb-crud): https://github.com/RayJune/JustToDo/blob/gh-pages/src/scripts/main.js

## author

[RayJune](http://rayjune.xyz/about): a CS university student from Fuzhou, Fujian, China

## License

MIT