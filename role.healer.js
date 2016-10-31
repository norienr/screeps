const roleHealer = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: o => o.hits < o.hitsMax
        });
        if (target) {
            if (creep.heal(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};

module.exports = roleHealer;
