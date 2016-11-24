**Screeps**
_______
Version: _0.1.0_

# Roles
## Describing roles behaviours.
###### Bridge

1. Spawned only if there's a Storage and Storage Link present in the room. Configuration: CARRY, CARRY, MOVE;
2. Not spawned till previous one dies;
3. Harvests energy only from Link, which is near to Storage (in the range of 2 squares);
4. If Terminal is present in the room and has less than 50000 of energy creep will transfer energy to this Terminal; 
	1. Otherwise it will transfer energy to Storage.