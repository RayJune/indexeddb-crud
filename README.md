# indexedDB-CRUD

indexedDB-CRUD packs obscure indexedDB CRUD methods to a really coder-friendly succinct interface.

It supports a configurable key(number type), a storeObject to store your data and CRUE methods to operate indexedDB extremely easy.

## Installation

```javascript
npm install indexeddb-crud --save-dev
```

## useage

### import

```javascript
var myDB = require('indexeddb-crud');
```

### API

#### init(dbConfig, callback)

* your dbConfig's structure should like this (both have name, version and dataDemo{}, and in dataDemo, `you must have a key(number type)`, e.g., in this code key is id):

```javascript
  var dbConfig = {  
    name: 'justToDo',
    version: '1',
    key: 'id',
    storeName: 'user'
  };
  dbConfig.dataDemo = { 
    id: 0,
    someEvent: 0,
    finished: true,
    date: 0
  };
```

* Attention the callback is `required`, which is used to initial your eventListeners (when indexedDB opened, it will be called)

e.g.

```javascript
function addEventListeners() {
  querySelector('#test').addEventlistener('click', handleClick, false);
}
function handleClick() {
  console.log('test');
}

myDB.init(dbConfig, addEventListeners);
```

#### getNewDataKey()

```javascript
myDB.getNewDataKey();
```

You will need it in add().

#### add(newData, callback?, [callbackParaArr]?)

* newData's structure should match to your dbConfig.dataDemo.

e.g.

```javascript
var newData = {
  id: DB.getNewDataKey(),
  someEvent: 'play soccer',
  finished: false,
  userDate: new Date()
};
myDB.add(newData);
```

#### get(key, callback, [callbackParaArr]?)

```javascript
function dosomething(data) {
  console.log(data);
}
myDB.get(1, dosomething);
// data's value
```

* the key should be a number, which matched to db's id

#### getWhether (whether, condition, callback, [callbackParaArr]?)

```javascript
myDB.getWhether(whether, condition, callback, [callbackParaArr]);
```

* whether's value is true or false

* `condition` should be a boolean-condition from myDB.config.demo, for example:

```javascript
var dbConfig = {  
  name: 'JustToDo',
  version: '1',
  key: 'id',
  storeName: 'user' 
};
dbConfig.dataDemo = { 
  id: 0,
  event: 0,
  finished: true,
  date: 0
};

myDB.getWhether('true', key, callback);
```

#### getAll(callback, [callbackParaArr]?)

```javascript
function doSomething(dataArr) {
  console.log(dataArr);
}
myDB.getAll(doSomething);
// dataArr's value
```

*  the callback and callbackParaArr is `optional`, when getAll succeed it will be called

#### update(changedData, callback?, [callbackParaArr]?)

```javascript
var changedData = {
  id: 10,
  someEvent: 'play soccer',
  finished: true,
  userDate: new Date()
};
myDB.update(changedData);
```

#### delete(key, callback?, [callbackParaArr]?)

```javascript
myDB.delete(1);
```
* the `key should be a number`, which matched to db's key.

#### clear(callback?, [callbackParaArr]?)

```javascript
myDB.clear();
```

when you want to add a data to list, you will need it to your data.id (auto ++ inside the function)

for example:

```javascript
var newNodeData = {
  id: myDB.getNewDataKey(),
  event: 'do something',
  inished: false
};

myDB.add(newNodeData);
```

## example

a simple todolist web-app, storage data in indexedDB (use indexeddb-crud): https://github.com/RayJune/JustToDo/blob/gh-pages/src/scripts/main.js

## author

[RayJune](http://rayjune.xyz/about): a CS university student from Fuzhou, Fujian, China

## License

MIT