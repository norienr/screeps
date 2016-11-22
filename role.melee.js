const roleMelee = {

    /** @param {Creep} creep **/
    run: function (creep) {
        const targets = _.filter(creep.room.find(FIND_HOSTILE_CREEPS),
            c => c.owner.username !== 'Source Keeper');
        if (targets.length) {
            const target = creep.pos.findClosestByRange(targets);
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};

module.exports = roleMelee;
