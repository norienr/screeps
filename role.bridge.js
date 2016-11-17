var getIdOfStorageLink = function(creep) {
	
	var storage = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: {structureType: STRUCTURE_STORAGE}
    });
	
	if(storage) {
		var storLink = storage.pos.findInRange(FIND_MY_STRUCTURES, 2, 
			{filter: {structureType: STRUCTURE_LINK}})[0];
		if(storLink) {
			return storLink.id;
		}
		else {
			//creep.say("No str link");
			return -1;
		}
	}
	else {
		//creep.say("No stor");
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

	var room = creep.room;
	if(room) {
		var terminal = creep.room.terminal;
		if(terminal) {
			return terminal.id;
		}
		else return -1;
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


var getIdOfStorage = function(creep) {
	var storage = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: {structureType: STRUCTURE_STORAGE}
    });
	
	if(storage) {
	    //console.log("stor id: "+storage.id);
		return storage.id;
	}
	else {
		return -1;
	}
}


var doRun = function(creep) {
	
	//Initializing Storage Link and Storage in creep's memory
	if(!creep.memory.linkId) {
		var linkId = getIdOfStorageLink(creep);
		
		if(linkId != -1) {
			creep.memory.linkId = linkId;
		}
		else {
			creep.say("Fail linkId");
		}
	}

	if(!creep.memory.storageId) {
		var storageId = getIdOfStorage(creep);
		
		if(storageId != -1) {
			creep.memory.storageId = storageId;
		}
		else {
			creep.say("Fail storId");
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