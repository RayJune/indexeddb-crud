## v5.0.0

Introduce Promise to asynchronous function, which is good at handling nested callback function(Especially in error handling).

## v4.0.0:

Rewrite code in ES6, offer default storeName to simplify API, especially for single indexedDB objectStore handler(easier to use).

## v3.0.0:

Find it's better to generate the handler as a single object(easier to use) So rewrite code to output a single object instead of a class. Support multiple indexedDB object Handler.

## v2.0.0:

Use class(ES5 class, so prototype) to implement handlers that generate multiple indexedDB object store.

I have to admit that using the ES5 prototype to write a class is very difficult.(Compared to a single object, but each have their own advantages)

## v1.0.0

Implement a more complete single indexedDB object storage handler, support a number of simple and useful API.