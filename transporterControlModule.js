const Config = require('config');
const roleBuilder = require('role.builder');
const roleTransporter = require('role.transporter');

var MODULE = (function (module) {

    module.locateLvl2ContainerPos = function (creep, spawn) {
        const x1 = spawn.pos.x - 3;
        const x2 = spawn.pos.x + 3;
        const y1 = spawn.pos.y - 3;
        const y2 = spawn.pos.y + 3;
        const posArr = creep.room.lookForAtArea(LOOK_TERRAIN, y1, x1, y2, x2, true);
        const filtered = _.filter(posArr, p => p.terrain === 'plain' &&
        p.x != spawn.pos.x && p.y != spawn.pos.y && p.x != spawn.pos.x - 1 && p.y != spawn.pos.y - 1 &&
        p.x != spawn.pos.x + 1 && p.y != spawn.pos.y + 1);
        let positions = [];
        _.forEach(filtered, f => positions.push(new RoomPosition(f.x, f.y, creep.room.name)));
        if (positions.length) {
            return positions;
        } else {
            return false;
        }
    };

    module.siteHasTransporter = function (room, site) {
        return _.filter(room.find(FIND_MY_CREEPS),
            creep => creep.memory.role === Config.ROLE_TRANSPORTER &&
            creep.memory.siteId != undefined &&
            creep.memory.siteId === site.id).length;
    };

    module.containerHasTransporter = function (room, container) {
        return _.filter(room.find(FIND_MY_CREEPS),
            creep => creep.memory.role === Config.ROLE_TRANSPORTER &&
            creep.memory.containerId != undefined &&
            creep.memory.containerId === container.id).length;
    };

    module.findUnassignedContainer = function (creep) {
        const conts = _.filter(creep.room.find(FIND_STRUCTURES),
            c => c.structureType === STRUCTURE_CONTAINER && !module.containerHasTransporter(creep.room, c));
        if (conts.length > 1) {
            return creep.pos.findClosestByRange(conts);
        }
        return 0;
    };

    module.findUnassignedSite = function (creep) {
        const sites = _.filter(creep.room.find(FIND_CONSTRUCTION_SITES),
            c => !module.siteHasTransporter(creep.room, c) && _.filter(creep.room.memory.containers,
                c2 => c2.siteId === c.id).length);
        console.log('slength:' + creep.name + ' as ' + sites.length);
        if (sites.length > 1) {
            return creep.pos.findClosestByRange(sites);
        } else if (sites.length === 1) {
            return sites[0];
        }
        return 0;
    };

    module.initTransporter = function (creep) {
        if (creep.memory.containerId === undefined) {
            const cont = module.findUnassignedContainer(creep);
            if (cont != 0) {
                creep.memory.containerId = cont.id;
            } else {
                if (creep.memory.siteId === undefined) {
                    const site = module.findUnassignedSite(creep);
                    if (site != 0) {
                        creep.memory.siteId = site.id;
                    }
                } else {
                    roleBuilder.run(creep, Game.getObjectById(creep.memory.siteId));
                }
            }
        } else {
            roleTransporter.run(creep);
        }

        if (creep.memory.containerInited === undefined) {
            const srcNum = _.filter(creep.room.find(FIND_MY_CREEPS),
                s => s.memory.role === Config.ROLE_TRANSPORTER).length;
            const spawns = _.filter(creep.room.find(FIND_MY_STRUCTURES),
                s => s.structureType === STRUCTURE_SPAWN &&
                (s.memory.containersNum === undefined || s.memory.containersNum < srcNum));
            if (spawns.length) {
                const containers = module.locateLvl2ContainerPos(creep, spawns[0]);
                if (containers.length) {
                    let id = 0;
                    if (creep.memory.containerId !== undefined) {
                        id = creep.memory.containerId;
                    } else if (creep.memory.siteId !== undefined) {
                        id = creep.memory.siteId;
                    }
                    if (id != 0) {
                        const to = Game.getObjectById(id);
                        const container = to.pos.findClosestByPath(containers);
                        console.log('cont:'+JSON.stringify(container));
                        const res = creep.room.createConstructionSite(container.x, container.y,
                            STRUCTURE_CONTAINER);
                        if (res === OK) {
                            if (spawns[0].memory.containersNum === undefined) {
                                spawns[0].memory.containersNum = 0;
                            }
                            creep.memory.containerInited = true;
                            spawns[0].memory.containersNum++;
                        } else {
                            console.log(`cannot build lvl2 container: ${res}`);
                        }
                    } else {
                        console.log('neither id assigned to transporter');
                    }
                }
            }
        }
    };

    return module;
})(MODULE || {});

module.exports = MODULE;
