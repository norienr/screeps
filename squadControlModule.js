const storeProvider = require('./storeProvider');

let squadControlModule = (function () {
    let obj = {};

    function controlReducer(state = 0, action) {
        switch (action.type) {
            case 'MOVE_TO':
                console.log('MOVE_TO');
                return ; // TODO
            case 'ATTACK':
                return ; // TODO
            default:
                return state;
        }
    };

    return {
        run: function () {
            if (!storeProvider.storeIsInitialized()) {
                storeProvider.createStore(controlReducer);
            } else {
                storeProvider.dispatch({type: 'MOVE_TO'});
            }


        }
    };

})();

module.exports = squadControlModule;
