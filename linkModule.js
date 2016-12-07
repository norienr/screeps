var linkModule = {
        run: () => {
        for (let roomName in Game.rooms){
            if(!Memory.rooms[roomName].links) {
                Memory.rooms[roomName].links = {};
            }
            var links = Game.rooms[roomName].find(
                FIND_MY_STRUCTURES, {
                    filter: {structureType: STRUCTURE_LINK}
                });
            for (let i in links) {
                var link = links[i];
                if (!Memory.rooms[roomName].links[link.id]) {
                    Memory.rooms[roomName].links[link.id] = {};
                }
                if(!Memory.rooms[roomName].links[link.id].source){
                    var source = link.pos.findInRange(FIND_SOURCES, 5)[0];
                    if(source){
                        Memory.rooms[roomName].links[link.id].source = source.id;
                    }
                    else {
                        Memory.rooms[roomName].links[link.id].storage =
                            Game.rooms[roomName].find(
                            FIND_MY_STRUCTURES, {
                                filter: {structureType: STRUCTURE_STORAGE}
                            })[0].id;
                    }
                }
            }

            var sourceLinks = [];
            for(let l in Memory.rooms[roomName].links){
                if(Memory.rooms[roomName].links[l].storage){
                    var storageLink = Game.getObjectById(Memory.rooms[roomName].links[l].storage);
                    console.log(storageLink);
                }
                else sourceLinks.push(Memory.rooms[roomName].links[l]);
                // console.log(Memory.rooms[roomName].links[l].storage);
            }


            // var storageLink = _.filter(Memory.rooms[roomName].links,{ storage: true } );
            // var sourceLinks;
            if(storageLink.energy < storageLink.energyCapacity * 0.4){
                for(let i in sourceLinks){
                    let sourceLink =  Game.getObjectById(sourceLinks[i]);
                    if(sourceLink.energy > 0){
                        sourceLink.transferEnergy(storageLink);
                        break;
                    }
                }
            }
        }


}

}
;

module.exports = linkModule;
