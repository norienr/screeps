var initializeLink = function(creep) {
    
    if(creep.room.storage) {
	    let storage = creep.room.storage;

	    let storLink = storage.pos.findInRange(FIND_MY_STRUCTURES, 2, 
			{filter: {structureType: STRUCTURE_LINK}})[0];
		
		if(storLink) {
		    let link_id = storLink.id;
		    
		    //Initializing id of Storage Link in creep's memory
		    creep.memory.linkId = link_id;
		}
		else {
		    //No storage link present
		    return -1;
		}
	 }
	 else {
	     //No storage present
	     return -1;
	 }
}

var withdrawEnergyFromLink = function(creep, id) {
	let link = Game.getObjectById(id);
	
	if(creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
		creep.moveTo(link);    
	}

}

var transferToStorage = function(creep) {
    const storage = creep.room.storage;

	if(storage) {
		if(creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(storage);    
		}
	}
    
}

var transferToStructures = function(creep) {	
    const terminal = creep.room.terminal;
	
	if(terminal) {
	    
	    //Transferring to Terminal
		if(terminal.store[RESOURCE_ENERGY] < 50000) {
		    
			if(creep.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(terminal);    
			}
		}
		else {
		    //There is a terminal, but it has enough energy, so
		    //Transferring to Storage
        	transferToStorage(creep);
		}
	}
	else {
	    //There is no terminal, so
	    //Transferring to Storage
    	transferToStorage(creep);
	    
	}
	
}


var doRun = function(creep) {
	
	//Initializing Storage Link and Storage in creep's memory
	if(!creep.memory.linkId) {
	    if(initializeLink(creep) == -1) {
	        creep.say("No st or lnk");
	    }
	}
	
	if(creep.memory.linkId) {
    	if(creep.carry.energy < creep.carryCapacity) {
    	    withdrawEnergyFromLink(creep, creep.memory.linkId);
    	}
    	else 
    	    transferToStructures(creep);
	}
}


module.exports = {
	run: doRun
};