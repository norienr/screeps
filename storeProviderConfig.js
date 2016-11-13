module.exports = {
    memoryObject: Memory,
    storePropertyName: 'actionStore',
    reducer: 'actionReducer', //should point to already defined property so that store can use it
    action_types: {
        MOVE_TO: 'MOVE_TO'
    },
    actors: {
        SQUAD: 'SQUAD'
    }
};
