# indexedDB-CRUD

indexedDB-CRUD packs complex indexedDB CRUD methods to a really coder-friendly simple interface

It supports a `fixed keypath: id` (number), and CRUE methods to easy-operate indexedDB.

## Installation

npm i -D indexeddb-crud 

## use

### import

```javascript
var myDB = require('indexeddb-crud');
```

### API

#### init

```javascript
myDB.init(dbConfig, initCallback);
```

* your dbConfig's structure should like this:

```javascript
  var dbConfig = {  
    name: 'justToDo',
    version: '1'
  };
  dbConfig.dataDemo = { 
    id: 0,
    userEvent: 0,
    finished: true,
    date: 0
  };
```

* about the callback suggest you input a function to initial your eventListeners (when indexedDB opened, it will be called)

#### createOneData

```javascript
myDB.createOneData(newData, callback, [callbackParaArr]);
```

* the callback and callbackParaArr is `optional`, when createOneData succeed it will be called

#### retrieveOneData

```javascript
myDB.retrieveOneData(index, callback, [callbackParaArr]);
```

* the index should be a number, which matched to db's id

* the callback and callbackParaArr is `optional`, when retrieveOneData succeed it will be called

#### retrieveDataWhetherDone

```javascript
myDB.retrieveDataWhetherDone(whether, key, callback, [callbackParaArr]);
```

* whether's value is true or false

* `key` should be a boolean-condition from myDB.config.demo, for example:

```javascript
 var dbConfig = {  
    name: 'justToDo',
    version: '1'
  };
  dbConfig.dataDemo = { 
    id: 0,
    userEvent: 0,
    finished: true,
    date: 0
  };

myDB.retrieveDataWhetherDone('true', key, callback);
```

*  the callback and callbackParaArr is `optional`, when retrieveDataWhetherDone succeed it will be called

#### retrieveAllData

```javascript
myDB.retrieveAllData(callback, [callbackParaArr]);
```

*  the callback and callbackParaArr is `optional`, when retrieveAllData succeed it will be called

#### updateOneDate

```javascript
myDB.updateOneDate(changedData, callback, [callbackParaArr]);
```

* the callback and callbackParaArr is `optional`, when updateOneDate succeed it will be called

#### deleteOneData

```javascript
myDB.deleteOneData(index, callback, [callbackParaArr]);
```
* the index should be a number, the index should be a number, which matched to db's id

* the callback and callbackParaArr is `optional`, when deleteOneData succeed it will be called

#### deleteAllData

```javascript
myDB.deleteAllData(callback, [callbackParaArr]);
```
* the callback and callbackParaArr is `optional`, when deleteAllData succeed it will be called

#### getPresentId

```javascript
myDB.getPresentId();
```

when you want to add a data to list, you will need it to your data.id

for example:

```javascript
var newNodeData = {
      id: myDB.getPresentId()++,
      userEvent: 'do something',
      finished: false
    };

myDB.createOneData(newNodeData);
```

## example

[a simple todolist web-app, storage data to indexedDB (using indexedDB-CRUD)](https://github.com/RayJune/JustToDo): https://github.com/RayJune/JustToDo

## author

[RayJune](http://rayjune.xyz/about): a CS university student from Fujian, China

## License

MIT