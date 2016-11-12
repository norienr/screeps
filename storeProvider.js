const conf = require('./storeProviderConfig');

module.exports = (function () {
    let obj = {};

    let memoryObject = conf.memoryObject;
    let storePropertyName = conf.storePropertyName;

    const INIT_ACTION = 'INIT';

    /**
     * Creates a distributed state action store that holds the action state tree.
     * The store data can only be changed through dispatchers.
     */
    obj.createStore = function (reducer) {

        if (typeof reducer !== 'function') {
            throw new Error('Reducer must be a function.');
        }

        if (typeof memoryObject[storePropertyName] !== 'undefined') {
            throw new Error('Store is already initialized or storePropertyName is already used.');
        }

        if (typeof reducer !== 'function') {
            throw new Error('Reducer must be a function.');
        }

        memoryObject[storePropertyName] = {currentState: {type: INIT_ACTION}};
        memoryObject[storePropertyName] = reducer;
    };

    obj.storeIsInitialized = function () {
        return typeof memoryObject[storePropertyName] !== 'undefined';
    };

    obj.getState = function () {
        if (typeof memoryObject[storePropertyName] === 'undefined') {
            throw new Error('Store is not initialized');
        }

        return memoryObject[storePropertyName].currentState;
    };

    obj.dispatch = function (action) {
        if (typeof memoryObject[storePropertyName] === 'undefined') {
            throw new Error('Store is not initialized');
        }

        if (typeof action.type !== 'string') {
            throw new Error('Action must be a string.');
        }

        memoryObject[storePropertyName].currentState =
            memoryObject[storePropertyName].currentReducer(memoryObject[storePropertyName].currentState, action);

        return action;
    };

    obj.replaceReducer = function (nextReducer) {
        if (typeof memoryObject[storePropertyName] === 'undefined') {
            throw new Error('Store is not initialized');
        }

        if (typeof nextReducer !== 'function') {
            throw new Error('Reducer must be a function.')
        }

        memoryObject[storePropertyName].currentReducer = nextReducer;
    };

    return obj;

})();
