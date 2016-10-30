const roleMelee = {

    /** @param {Creep} creep **/
    run: function (creep) {
        const target = _.filter(creep.room.findClosestByRange(FIND_HOSTILE_CREEPS),
            c => enemy.owner.username !== 'Source Keeper');
        if (target) {
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};

module.exports = roleMelee;
