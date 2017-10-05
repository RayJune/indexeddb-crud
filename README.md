# indexedDB-CRUD

indexedDB-CRUD packs obscure indexedDB CRUD methods to a really coder-friendly succinct interface.

It supports a configurable key(number type), a storeObject to store your data and CRUE methods to operate indexedDB extremely easy.

## Installation

npm install indexeddb-crud 

## useage

### import

```javascript
var myDB = require('indexeddb-crud');
```

### API

#### init

```javascript
myDB.init(dbConfig, callback);
```

* your dbConfig's structure should like this (both have name, version and dataDemo{}, and in dataDemo, `id is compulsory`):

```javascript
  var dbConfig = {  
    name: 'justToDo',
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
```

* The callback is `compulsory`, which is used to initial your eventListeners (when indexedDB opened, it will be called)

#### add

```javascript
myDB.add(newData, callback, [callbackParaArr]);
```
* newData's structure should equally to your dbConfig.dataDemo.

* the callback and callbackParaArr is `optional`, when add succeed it will be called

#### get

```javascript
myDB.get(key, callback, [callbackParaArr]);
```

* the key should be a number, which matched to db's id

* the callback and callbackParaArr is `optional`, when get succeed it will be called

#### getWhether

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

*  the callback and callbackParaArr is `optional`, when getWhether succeed it will be called

#### getAll

```javascript
myDB.getAll(callback, [callbackParaArr]);
```

*  the callback and callbackParaArr is `optional`, when getAll succeed it will be called

#### update

```javascript
myDB.update(changedData, callback, [callbackParaArr]);
```

* the callback and callbackParaArr is `optional`, when update succeed it will be called

#### delete

```javascript
myDB.delete(key, callback, [callbackParaArr]);
```
* the key should be a number, the key should be a number, which matched to db's id

* the callback and callbackParaArr is `optional`, when delete succeed it will be called

#### deleteAll

```javascript
myDB.deleteAll(callback, [callbackParaArr]);
```
* the callback and callbackParaArr is `optional`, when deleteAll succeed it will be called

#### getKey

```javascript
myDB.getKey();
```

when you want to add a data to list, you will need it to your data.id (auto ++ inside the function)

for example:

```javascript
var newNodeData = {
  id: myDB.getKey(),
  event: 'do something',
  inished: false
};

myDB.add(newNodeData);
```

## example

[a simple todolist web-app, storage data to indexedDB (using indexedDB-CRUD)](https://github.com/RayJune/JustToDo): https://github.com/RayJune/JustToDo

## author

[RayJune](http://rayjune.xyz/about): a CS university student from Fuzhou, Fujian, China

## License

MIT