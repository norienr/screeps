const {memoryObject, storePropertyName, reducer} = require('./storeProviderConfig');

module.exports = (function () {
    let obj = {};

    /**
     * Creates a distributed state action store that holds the action state tree.
     * The store data can only be changed through dispatchers.
     *
     * Reducer should already be defined in the config file.
     */
    obj.createStore = function () {

        if (typeof memoryObject[storePropertyName] !== 'undefined') {
            throw new Error('Store is already initialized or storePropertyName is already used.');
        }

        if (typeof memoryObject[reducer] !== 'function') {
            throw new Error('Reducer must be a function.');
        }

        memoryObject[storePropertyName] = {};
        memoryObject[storePropertyName].currentState = {strategies: []};
    };

    obj.storeIsInitialized = function () {
        return typeof memoryObject[storePropertyName] !== 'undefined';
    };

    /**
     * State represents actions that should be done now.
     *
     */
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
            memoryObject[reducer](memoryObject[storePropertyName].currentState, action);

        return action;
    };

    return obj;

})();
