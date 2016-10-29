const Config = require('config');
const roleBuilder = require('role.builder');
const roleTransporter = require('role.transporter');

var MODULE = (function (module) {

    module.locateLvl2ContainerPos = function (room, spawn) {
        const x1 = spawn.pos.x - 3;
        const x2 = spawn.pos.x + 3;
        const y1 = spawn.pos.y - 3;
        const y2 = spawn.pos.y + 3;
        const posArr = room.lookForAtArea(LOOK_TERRAIN, y1, x1, y2, x2, true);
        const filtered = _.filter(posArr, p => p.terrain === 'plain' &&
        p.x != spawn.pos.x && p.y != spawn.pos.y && p.x != spawn.pos.x - 1 && p.y != spawn.pos.y - 1 &&
        p.x != spawn.pos.x + 1 && p.y != spawn.pos.y + 1);
        let positions = [];
        _.forEach(filtered, f => positions.push(new RoomPosition(f.x, f.y, room.name)));
        if (positions.length) {
            const sources = room.find(FIND_SOURCES);
            const source = spawn.pos.findClosestByPath(sources);
            const res = source.pos.findClosestByPath(positions);
            return res;
        } else {
            return false;
        }
    };

    module.hasTransporterAssigned = function (room, container) {
        console.log('l->>>>' + _.filter(room.find(FIND_MY_CREEPS),
                creep => creep.memory.role === Config.ROLE_TRANSPORTER &&
                creep.memory.containerId != undefined &&
                creep.memory.containerId === container.id).length);
        return _.filter(room.find(FIND_MY_CREEPS),
            creep => creep.memory.role === Config.ROLE_TRANSPORTER &&
            creep.memory.containerId != undefined &&
            creep.memory.containerId === container.id).length;
    };

    module.findUnassignedContainer = function (creep) {
        const conts = _.filter(creep.room.find(FIND_STRUCTURES),
            c => c.structureType === STRUCTURE_CONTAINER && !module.hasTransporterAssigned(creep.room, c));
        if (conts.length > 1) {
            return creep.pos.findClosestByRange(conts);
        }
        return conts;
    };

    module.initTransporter = function (creep) {
        if (creep.memory.containerId === undefined) {
            const conts = module.findUnassignedContainer(creep);
            if (conts.length) {
                creep.memory.containerId = conts[0].id;
            } else {
                roleBuilder.run(creep);
            }
        } else if (creep.memory.containerLvl2Id === undefined) {
            roleBuilder.run(creep);
        } else {
            roleTransporter.run(creep);
        }

        if (creep.memory.containerInited === undefined) {
            const srcNum = creep.room.find(FIND_SOURCES).length;
            const spawns = _.filter(creep.room.find(FIND_MY_STRUCTURES),
                s => s.structureType === STRUCTURE_SPAWN &&
                (s.memory.containersNum === undefined || s.memory.containersNum < srcNum));
            if (spawns.length) {
                const container = module.locateLvl2ContainerPos(creep.room, spawns[0]);
                if (container) {
                    const res = creep.room.createConstructionSite(container.x, container.y,
                        STRUCTURE_CONTAINER);

                    if (res === OK) {
                        if (spawns[0].memory.containersNum === undefined) {
                            spawns[0].memory.containersNum = 0;
                            creep.memory.containerInited = true;
                        }
                        spawns[0].memory.containersNum++;
                    } else {
                        console.log(`cannot build lvl2 container: ${res}`);
                    }
                }
            }
        }
    };

    return module;
})(MODULE || {});

module.exports = MODULE;
