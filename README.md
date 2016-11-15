##Screeps

Version: _0.1.0_

-------
#####Flags to control squads

Each squad should be represented by unique color — _Main flag color_.

Secondary color represents action to be taken by the squad with main color.

| Main color      | Secondary color  | Description |
|:-----------|:----------:|:------------:|
| squad color     | COLOR_YELLOW| Spawn and command this squad to locate near the flag|
| squad color      | COLOR_GREEN| Command this squad to locate near the flag|
| squad color      | COLOR_RED  | Make this squad attack the position where the secondary flag is placed |
| squad color      | COLOR_WHITE| Make this squad retreat to the first spawn in Game.spawns(not to position of the retreat flag) |
