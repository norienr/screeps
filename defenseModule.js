const Config = require('config');

const defenseModule = (function () {
  const o = {
    getTowers: function (roomName) {
      return Game.rooms[roomName].find(
        FIND_MY_STRUCTURES, {
          filter: {structureType: STRUCTURE_TOWER}
        });
    },
    hasDamagedStructs: function (roomName) {
      return Game.rooms[roomName].find(
        FIND_STRUCTURES, {
          filter: (structure) => structure.hits < structure.hitsMax
        }).length;
    },
    getClosestDamagedStructs: function (tower) {
      return tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
      });
    },
    doRepair: function (tower, closestDamagedStructure) {
      if (typeof closestDamagedStructure !== 'undefined') {
        if (tower.repair(closestDamagedStructure) === OK) {
          Memory.lastRepair[tower.id] = Game.time;
        }
      }
    },
    attackThreats: function (tower, targets) {
      let threat = targets[0];
      for (let i in targets) {
        let numOfTicks1 = targets[i].hits / (this.getPotentialDamage(tower, targets[i]) - this.getPotentialHeal(targets[i], targets));
        let numOfTicks2 = threat.hits / (this.getPotentialDamage(tower, threat) - this.getPotentialHeal(threat, targets));
        if (numOfTicks1 > 0 && numOfTicks1 < numOfTicks2) {
          threat = targets[i];
        }
      }
      console.log('potential damage: ', this.getPotentialDamage(tower, threat) - this.getPotentialHeal(threat, targets));
      console.log(threat.hits / (this.getPotentialDamage(tower, threat) - this.getPotentialHeal(threat, targets)));
      tower.attack(threat);
    },
    getPotentialDamage: function (tower, target) {
      const range = tower.pos.getRangeTo(target.pos);
      if (range <= 5)
        return 600;
      else if (range >= 20)
        return 150;
      else
        return 600 - (range - 5) * 30;
    },
    getPotentialHeal: function (target, targets) {
      const closestHealer = _.filter(target.pos.findInRange(targets, 3),
        c => c.getActiveBodyparts(HEAL) > 0);
      let potentialHeal = target.getActiveBodyparts(HEAL) * 12;
      if (closestHealer.length) {
        for (let i in closestHealer) {
          if (target.pos.getRangeTo(closestHealer[i].pos) == 1)
            potentialHeal = +closestHealer[i].getActiveBodyparts(HEAL) * 12;
          else if (target.pos.getRangeTo(closestHealer[i].pos) > 1)
            potentialHeal = +closestHealer[i].getActiveBodyparts(HEAL) * 4;
        }
      }
      return potentialHeal;
    }
  };

  const publicAPI = {
    run: function (roomName) {

      if (Memory.lastRepair === undefined) {
        Memory.lastRepair = {};
      }

      const targets = _.filter(Game.rooms[roomName].find(FIND_HOSTILE_CREEPS),
        c => c.owner.username !== 'Source Keeper');

      if (targets.length) {
        Game.rooms[roomName].memory.underAttack = true;
      } else {
        Game.rooms[roomName].memory.underAttack = false;
      }

      let towers;
      if ((towers = o.getTowers(roomName)).length) {
        if (targets.length) {
          towers.forEach(
            tower => o.attackThreats(tower, targets));
        } else if (o.hasDamagedStructs(roomName)) {
          _.forEach(towers, (tower) => {
            if (typeof Memory.lastRepair[tower.id] === 'undefined') {
              Memory.lastRepair[tower.id] = 0;
            }
            if (Game.time > (Memory.lastRepair[tower.id] + Config.TOWER_ATTACK_INTERVAL)) {
              o.doRepair(tower, o.getClosestDamagedStructs(tower));
            }
          });
        }
      }


    }
  };

  return publicAPI;
})();

module.exports = defenseModule;
