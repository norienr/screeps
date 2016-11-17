##Screeps

Version: _0.1.0_

-------
#####Flags to control squads

Squads can be controlled by flags. 
Each squad is identified by the first color of a spawn flag. If multiple spawn flags with the same main color were spawned, they will be considered as a one squad unit.
The second flag color defines an action to be taken by a specific squad, which is identified by the main color of this flag.
There are currently supported only 4 actions: SPAWN, MOVE_TO, ATTACK, RETREAT.

| Main color      | Secondary color  | Description |
|:-----------|:----------:|:------------:|
| squad color     | COLOR_YELLOW| Spawn and command this squad to locate near the flag|
| squad color      | COLOR_GREEN| Command this squad to locate near the flag|
| squad color      | COLOR_RED  | Make this squad attack the position where the secondary flag is placed |
| squad color      | COLOR_WHITE| Make this squad retreat to the first spawn in Game.spawns(not to position of the retreat flag) |
