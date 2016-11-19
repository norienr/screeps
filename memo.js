let M = (function () {
    let obj = {};

    obj.init = function () {
        if (typeof Memory.memo === 'undefined') {
            console.log('init');
            Memory.memo = {};
        }
    };

    obj.memorize = function (v) {
        if (typeof Memory.memo[v.name] !== 'undefined') {
            return;
        }

        if (typeof v === 'object') {
            Memory.memo[v.name] = Object.assign({}, v);
        } else {
            Memory.memo[v.name] = v;
        }
    };

    obj.memo = function (v) {
        return Memory.memo[v.name];
    };

    return obj;

})();

module.exports = M;
