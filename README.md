# indexedDB-CRUD

indexedDB-CRUD packs obscure indexedDB CRUD methods to a really coder-friendly succinct interface.

It supports a configurable key(number type), a storeObject to store your data and CRUE methods to operate indexedDB extremely easily.

This object store can only hold JavaScript objects. The objects must have a property with the same name as the key path.

## Installation

```javascript
npm install indexeddb-crud --save
```

## usage

### import

```javascript
var DB = require('indexeddb-crud');
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

#### length()

```javascript
var randomIndex = Math.floor(DB.length * Math.random());
```

#### getNewKey()

```javascript
DB.getNewKey();
```

You will need it in `addItem()`.

#### addItem(data, successCallback?)

* data's structure should at least contains number type key.

e.g.

```javascript
var data = { 
  id: DB.getNewKey(), 
  event: 'play soccer', 
  finished: false 
};
DB.addItem(data);
```

#### getItem(key, successCallback)

```javascript
function dosomething(data) {
  console.log(data);
}
DB.getItem(1, dosomething);
// data's value
```

* the key should be a number, which matched to db's id

#### getConditionItem(condition, whether, successCallback)

```javascript
DB.getConditionItem(condition, whether, successCallback);
```

* whether's value is true or false
* `condition` should be a boolean-condition from `DB.config.demo`, for example:

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

DB.getConditionItem('true', key, successCallback);
```

#### getAll(successCallback?)

```javascript
function doSomething(dataArr) {
  console.log(dataArr);
}
DB.getAll(doSomething);
// dataArr's value
```

#### updateItem(newData, successCallback?)

```javascript
var newData = {
  id: 10,
  someEvent: 'play soccer',
  finished: true,
  userDate: new Date()
};
DB.updateItem(newData);
```

#### removeItem(key, successCallback?)

* the **key should be number type**, which matched to db's key.

```javascript
DB.removeItem(1);
```

#### clear(successCallback?)

```javascript
DB.clear();
```

## example

a simple todolist web-app, storage data in indexedDB (use indexeddb-crud): https://github.com/RayJune/JustToDo/blob/gh-pages/src/scripts/main.js

## author

[RayJune](http://rayjune.xyz/about): a CS university student from Fuzhou, Fujian, China

## License

MIT