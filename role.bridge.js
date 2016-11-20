var initializeStorageWithLink = function(creep) {
    
    if(creep.room.storage) {
	    var storage = creep.room.storage;
	    var storage_id = storage.id;
	    
	    
	    var storLink = storage.pos.findInRange(FIND_MY_STRUCTURES, 2, 
			{filter: {structureType: STRUCTURE_LINK}})[0];
		
		if(storLink) {
		    var link_id = storLink.id;
		    
		    //Initializing ids of Storage and Storage Link in creep's memory
		    creep.memory.storageId = storage_id;
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
	
	var link = Game.getObjectById(id);
	
	if(creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
		creep.moveTo(link);    
	}
	else if(creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_ENOUGH_RESOURCES) {
		//creep.say("No resources");
	}
}

var getIdOfTerminal = function(creep) {

	if(creep.room.terminal) {
	    return creep.room.terminal.id;
	}
	else return -1;
	
}

var transferToStorage = function(creep) {
    
    var stor_id = creep.memory.storageId;

	if(stor_id) {
		var storage = Game.getObjectById(stor_id);
		
		//console.log("Trans To stor: "+creep.transfer(storage, RESOURCE_ENERGY));
		
		if(creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(storage);    
		}
	}
	else {
		//creep.say("No stor");
	}
    
}

var transferToStructures = function(creep) {	
    var term_id = creep.memory.terminalId;
	
	if(term_id) {
	    
	    //Transferring to Terminal
		var terminal = Game.getObjectById(term_id);
		
		if(terminal.store[RESOURCE_ENERGY] < 50000) {
		    
		    //console.log("Trans To term: "+creep.transfer(terminal, RESOURCE_ENERGY));
		    
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
	if(!creep.memory.storageId && !creep.memory.linkId) {
	    if(initializeStorageWithLink(creep) == -1) {
	        creep.say("No st or lnk");
	    }
	}
	
	if(!creep.memory.terminalId) {
		var terminalId = getIdOfTerminal(creep);
		
		if(terminalId != -1) {
			creep.memory.terminalId = terminalId;
		}
		else {
			//creep.say("fail termId");
		}
	}
	
	if(creep.carry.energy < creep.carryCapacity) {
	    withdrawEnergyFromLink(creep, creep.memory.linkId);
	}
	else 
	    transferToStructures(creep);
}


module.exports = {
	run: doRun
};