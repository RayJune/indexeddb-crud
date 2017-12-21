# indexedDB-CRUD

indexedDB-CRUD packs obscure indexedDB CRUD methods to a really coder-friendly succinct interface.

It supports a configurable key(number type), a storeObject to store your data and CRUE methods to operate indexedDB extremely easy.

This object store can only hold JavaScript objects. The objects must have a property with the same name as the key path.

## Installation

```javascript
npm install indexeddb-crud --save
```

## useage

### import

```javascript
var DB = require('indexeddb-crud');
```

### API

#### init(config, successCallback, failCallback)

* your config's structure should like this (both have name, version and dataDemo{}, and in dataDemo, `you must have a key(number type)`, e.g., in this code key is id):

```javascript
  var config = {  
    name: 'justToDo',
    version: '1',
    key: 'id',
    storeName: 'user',
    initialData = [
      { id: 0, someEvent: 0, finished: true, date: 0 }
    ]
  };
```

* Attention the successCallback is `required`, which is used to initial your eventListeners (when indexedDB opened, it will be called)

e.g.

```javascript
function addEventListeners() {
  querySelector('#test').addEventlistener('click', handleClick, false);
}
function handleClick() {
  console.log('test');
}

DB.init(config, addEventListeners);
```

#### getNewKey()

```javascript
DB.getNewKey();
```

You will need it in addItem().

#### addItem(data, successCallback?, [successCallbackParaArr]?)

* data's structure should match to your config.dataDemo.

e.g.

```javascript
var data = {
  id: DB.getNewKey(),
  someEvent: 'play soccer',
  finished: false,
  userDate: new Date()
};
DB.addItem(data);
```

#### getItem(key, successCallback, [successCallbackParaArr]?)

```javascript
function dosomething(data) {
  console.log(data);
}
DB.getItem(1, dosomething);
// data's value
```

* the key should be a number, which matched to db's id

#### getConditionItem (condition, whether, successCallback, [successCallbackParaArr]?)

```javascript
DB.getConditionItem(whether, condition, successCallback, [successCallbackParaArr]);
```

* whether's value is true or false

* `condition` should be a boolean-condition from DB.config.demo, for example:

```javascript
  var dbConfig = {
    name: 'JustToDo',
    version: '11',
    key: 'id',
    storeName: 'list',
    initialData: [
      { id: 0, event: 0, finished: true, date: 0 }
    ],
  };

DB.getConditionItem('true', key, successCallback);
```

#### getAll(successCallback, [successCallbackParaArr]?)

```javascript
function doSomething(dataArr) {
  console.log(dataArr);
}
DB.getAll(doSomething);
// dataArr's value
```

*  the successCallback and successCallbackParaArr is `optional`, when getAll succeed it will be called

#### updateItem(data, successCallback?, [successCallbackParaArr]?)

```javascript
var changedData = {
  id: 10,
  someEvent: 'play soccer',
  finished: true,
  userDate: new Date()
};
DB.updateItem(changedData);
```

#### removeItem(key, successCallback?, [successCallbackParaArr]?)

```javascript
DB.removeItem(1);
```
* the `key should be a number`, which matched to db's key.

#### clear(successCallback?, [successCallbackParaArr]?)

```javascript
DB.clear();
```

when you want to add a data to list, you will need it to your data.id (auto ++ inside the function)

for example:

```javascript
var newNodeData = {
  id: DB.getNewKey(),
  event: 'do something',
  inished: false
};

DB.addItem(newNodeData);
```

## example

a simple todolist web-app, storage data in indexedDB (use indexeddb-crud): https://github.com/RayJune/JustToDo/blob/gh-pages/src/scripts/main.js

## author

[RayJune](http://rayjune.xyz/about): a CS university student from Fuzhou, Fujian, China

## License

MIT