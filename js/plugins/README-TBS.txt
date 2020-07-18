==============================
DATABASE NOTES SETTINGS
==============================
The Turn Based Strategy plugin leverages the "Note" boxes found within the database editor to define the various values and settings used by the plugin. These settings are stored in JSON objects, which are defined in the Note boxes.

----------------------------------------------------
Actors
----------------------------------------------------
{
	"handedness": "right"/"left",
	"limbsType": "humanoid"/"quadrupedal"/"winged",
	"proneName": (name of character sprite file),
	"proneIndex": (index of sprite block in sprite file),
	"proneRow": (row of sprites in sprite block)
}

----------------------------------------------------
Classes
----------------------------------------------------
{
	"defenseAbility": (name of unique skill),
	"reflexAbility": (name of unique skill),
	"uniqueSkills": [(array of strings that are unique skill names)],
	"skillPotentials": {
		"meleeAcc": (integer),
		"rangedAcc": (integer),
		"mentalAcc": (integer),
		"physEvade": (integer),
		"tripEvade": (integer),
		"mentalEvade": (integer),
		"manualDex": (integer),
		"perception": (integer),
		(further entries corresponding to unique skills)
	},
	"startingSkills": {
		"meleeAcc": (integer),
		"rangedAcc": (integer),
		"mentalAcc": (integer),
		"physEvade": (integer),
		"tripEvade": (integer),
		"mentalEvade": (integer),
		"manualDex": (integer),
		"perception": (integer),
		(further entries corresponding to unique skills)
	},
	"protection": {(see "Protection" section)},
	"attributes": [
		{
			"name": (string),
			"description": (string),
			"skillRequirements": [(see "Skill Requirement" section)], (THIS IS AN ARRAY OF MORE THAN ONE SKILL REQUIREMENT!!!)
			"strength": (integer),
			"toughness": (integer),
			"movement": (integer)(double the number of squares ingame),
			"reach": (integer)(double the number of squares ingame),
			"incremental": true/false
		}
	]
}

There is a special classs named "UNIVERSAL DEFINITIONS". This class contains attributes that are attainable by any class that has the requisite skills. It also contains a special uniqueSkills array that is an array of objects instead of an array of strings. These objects are used to define the unique skills that other classes refer to. The object is as follows:

{
	"name": (string),
	"displayName": (string),
	"shortDisplayName": (string)
}

"UNIVERSAL DEFINITIONS" class is also used to define further weapon images for attack animations. Add the "userDefinedAttackImages" object to the class' JSON object, which is an array of objects. The object is defined as follows:

{
	"imageName": (string),
	"imageId": (integer)
}

----------------------------------------------------
Skills
----------------------------------------------------
{
	"unlearnable": true/false, (if true, can only be learned if given directly to a Class)
	"action": {(see "Action" section)}
}

----------------------------------------------------
Items
----------------------------------------------------
{
	"actions": [(see "Action" section)] (THIS IS AN ARRAY OF MORE THAN ONE ACTION!!!)
}

----------------------------------------------------
Weapons
----------------------------------------------------
{
	"hands": 1/2,
	"protection": {(see "Protection" section)},
	"actions": [(see "Action" section)] (THIS IS AN ARRAY OF MORE THAN ONE ACTION!!!)
}

----------------------------------------------------
Armors
----------------------------------------------------
{
	"limitedPart": "head"/"torso"/"arms"/"legs", (if this is set, other armor with this same setting cannot be worn with this)
	"protection": {(see "Protection" section)}
}

----------------------------------------------------
Enemies
----------------------------------------------------
{
	"blankDummy": true/false,
	"characterName": (name of character sprite file),
	"characterIndex": (index of sprite block in sprite file),
	"proneName": (name of character sprite file),
	"proneIndex": (index of sprite block in sprite file),
	"proneRow": (row of sprites in sprite block),
	"handedness": "left"/"right",
	"flying": true/false,
	"limbsType": "humanoid"/"quadrupedal"/"winged",
	"defenseAbility": (name of unique skill),
	"reflexAbility": (name of unique skill),
	"uniqueSkills": [(array of strings that are unique skill names)],
	"startingSkills": {
		"meleeAcc": (integer),
		"rangedAcc": (integer),
		"mentalAcc": (integer),
		"physEvade": (integer),
		"tripEvade": (integer),
		"mentalEvade": (integer),
		"manualDex": (integer),
		"perception": (integer),
		(further entries corresponding to unique skills)
	},
	"equipment": {
		"mainHand": (integer) (weapon id),
		"offhand": (integer) (weapon id),
		"accessoryOne": (integer) (armor id),
		"accessoryTwo": (integer) (armor id),
		"accessoryThree": (integer) (armor id),
		"accessoryFour": (integer) (armor id),
		"accessoryFive": (integer) (armor id),
	},
	"attributes": (see Classes)
}

----------------------------------------------------
Protection
----------------------------------------------------
{
	"(part name - see below)": {
		"defense": {
			"solid": (integer),
			"fluid": (integer)
		}
		"armor": {
			"blunt": (integer),
			"cut": (integer),
			"bullet": (integer),
			"fire": (integer),
			"ice": (integer),
			"corrosion": (integer),
			"conducted": (integer)
		}
	}
	"mental": {
		"defense": (integer),
		"armor": (integer)
	}
}

Part name can be "head", "torso", "leftArm", "rightArm", "leftLeg", or "rightLeg". There are also some special options:
"fullBody": Applies defensive statistics to every physical body part.
"arms": Applies defensive statistics to both arms.
"legs": Applies defensive statistics to both legs.
"equippedArm": For weapons, applies defensive statistics to equipped slot.

----------------------------------------------------
Skill Requirements
----------------------------------------------------
{
	"skill": (string),
	"level": (integer)
}

Attributes have an "incremental" boolean. When true, the skillRequirements array is replaced by a single object. This object contains an array of skills, and an integer that defines the skill level increments of the listed skills at which the attribute will be gained multiple times. This is useful for attributes that grow and stack over time, and can be gained across multiple different skills.

{
	"skills": (array of strings that are skill names),
	"increments": (integer)
}

----------------------------------------------------
Action
----------------------------------------------------
{
	"name": (string),
	"type": "attack"/"item"/"technique",
	"intendedTarget": "enemy"/"ally",
	"skipBattleScene": true/false,
        "minorAction": true/false,
	"stressCost": (integer),
	"description": (string),
	"consumesItem": true/false,
	"menuIcon": (integer),
	"attackAndMove": true/false,
	"skillRequirements": [(see "Skill Requirement" section)], (THIS IS AN ARRAY OF MORE THAN ONE SKILL REQUIREMENT!!!)
	"actionGroupName": (string),
	"actionGroupLevel": (integer),
	"hitGroups": [{
		"multiple": (integer),
		"multipleDelay": (integer),
		"accuracyDegradation": (integer),
		"delay": (integer),
		"attackMotion": {
			"motion": "Thrust"/"Swing"/"Missile",
			"image": (image name),
			"castAnimation": (animation name),
			"delayedCastAnimation": (animation name),
			"motionSpeed": (array of integers)
		},
		"secondaryAttackMotion": {
			"motion": "Thrust"/"Swing"/"Missile",
			"image": (image name),
			"castAnimation": (animation name),
			"delayedCastAnimation": (animation name),
			"motionSpeed": (array of integers)
		},
		"hits": [{
			"initialAnimation": (animation name),
			"missAnimation": (animation name),
			"animation": (animation name),
			"ongoingMissAnimation": (animation name),
			"ongoingAnimation": (animation name),
			"secondaryInitialAnimation": (animation name),
			"secondaryMissAnimation": (animation name),
			"secondaryAnimation": (animation name),
			"rangeType": "self"/"melee"/"thrown"/"fired"/"mental",
			"range": (integer)(double the number of squares ingame),
			"aoe": (integer)(double the number of squares ingame),
			"aoeType": "engulf"/"regularHit",
			"arcedTrajectory": true/false,
			"randomTarget": true/false,
                        "targetMobility": true/false,
			"ignoreCenter": true/false,
			"ignoreUserRange": true/false,
                        "evasionPenalty": (integer),
			"ignoreUserAccuracy": true/false,
			"accuracy": (integer),
			"accuracyDropoffDistance": (integer),
			"accuracyPenalty": (integer),
			"ignoreUserStrength": true/false,
                        "abilitySkillUsed": (skill name),
                        "abilitySkill": (integer),
                        "evadedBy": "defense"/"reflex",
			"multiple": (integer),
        		"multipleDelay": (integer),
        		"accuracyDegradation": (integer),
			"usesParts": [
				(entries can be "head", "torso", "mind", "bestLimb", and "equippedOn")
			],
			"damage": {
				"blunt": (integer),
				"cut": (integer),
				"keen": (integer),
				"thrust": (integer),
				"stiletto": (integer),
				"bullet": (integer),
				"fire": (integer),
				"ice": (integer),
				"corrosion": (integer),
				"lightning": (integer),
				"trip": (integer)
			},
			"heal": {
				"damage": (integer),
				"stress": (integer)
			},
			"buffs": [{
				"duration": (integer),
				"iconId": (integer),
				"core": {
					"physEvade": (integer),
					"tripEvade": (integer),
					"mentalEvade": (integer)
				}
			}]
		}]
	}]
}

==============================
EVENT SCRIPT CALLS
==============================
The Turn Based Strategy plugin features get used by way of script calls within regular events. The calls are explained here.

----------------------------------------------------
$gameSystem.addTbsPartyMember(
	forceId,
	partyId,
	startingX,
	startingY,
	surprised,
	label,
	labelType
);

Use this to add a party member to a force before starting a battle. The partyId refers to the member's current position in the party. startingX and startingY determines where on the map the character begins the battle. surprised will cause the member to skip the first round of combat. label is a string that is added after the member's name. if the string "replace" is passed in as the labelType, the label will instead completely replace the member's name.

----------------------------------------------------
$gameSystem.addTbsEnemy(
	forceId,
	enemyId,
	startingX,
	startingY,
	surprised,
	label,
	labelType
);

Use this to add an enemy to a force before starting a battle. startingX and startingY determines where on the map the character begins the battle. surprised will cause the member to skip the first round of combat. label is a string that is added after the enemy's name. if the string "replace" is passed in as the labelType, the label will instead completely replace the enemy's name.

-----------------------------------------------------
$gameSystem.setTbsForceEnemyForce(
	forceId,
	enemyForceId
);

Use this to assign a force as another force's enemy before starting a battle. The force of enemyForceId will be considered an enemy by the force of forceId.

-----------------------------------------------------
$gameSystem.setTbsForceAllyForce(
	forceId,
	allyForceId
);

Use this to assign a force as another force's ally before starting a battle. The force of allyForceId will be considered an ally by the force of forceId.

-----------------------------------------------------
$gameSystem.startTbsBattle(
	resetCameraAfterBattle,
	cursorRegions
);

Starts a turn based strategy battle. Only use after setting everything up as desired with the various battle setup scripts. resetCameraAfterBattle, if set to true when starting a battle after using setCameraFocus() will clear that focus immediately after battle victory, refocusing the camera to the player character. cursorRegions is an array of integers, indicating encounter region tiles on the map. When defined, all battle movement, action ranges, and cursor movement will be contained within the tiles indicated by the regions. It is recommended that these regions be set up so that individual battles take place within a rectangular area.

This function and the ensuing battle will NOT hold up event processing, so it should probably be the last thing to happen in an event.

-----------------------------------------------------
$gameSystem.clearTbsForces();

Clears all previously defined forces. Use this before all other battle setup calls to make sure there isn't any lingering data from previous battles.

-----------------------------------------------------
$gameSystem.setCameraFocus(
	x,
	y,
	speed
);

Forces the camera to focus on a specific point on the map. If other event steps come after this, they will occur while the camera is moving. Use a Wait step to avoid this.

-----------------------------------------------------
$gameSystem.clearCameraFocus(
	resetToPlayer,
	speed
);

Clears the camera focus set up by setCameraFocus(). If resetToPlayer is set to true, the camera will refocus onto the player character.

-----------------------------------------------------
$gameSystem.setTbsActorDamage(
	partyPositionId,
	partName,
	damage
);

Applies damage to a party member's indicated body part. partyPositionId refers to the member's current position in the party. partName is a string and can be "head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg", or "mind".

----------------------------------------------------
$gameSystem.giveItemToParty(
	itemId
);
$gameSystem.giveWeaponToParty(
	itemId
);
$gameSystem.giveArmorToParty(
	itemId
);

Gives an item/weapon/armor to the first member of the party with available space, or nobody if nobody has space.

Keep in mind that the Stash and Key Items utilize the default party inventory, so simply use regular inventory management event commands to manage those.

----------------------------------------------------
$gameSystem.giveItemToActor(
	itemId,
	actorId
);
$gameSystem.giveWeaponToActor(
	itemId,
	actorId
);
$gameSystem.giveArmorToActor(
	itemId,
	actorId
);

Gives an item/weapon/armor to the actor with the given id. Nobody recieves the item if the actor's inventory is full.

This is mostly useful for outfitting actors upon their first appearance.

----------------------------------------------------
$gameSystem.giveItemToPartyMember(
	itemId,
	partyPosition
);
$gameSystem.giveWeaponToPartyMember(
	itemId,
	partyPosition
);
$gameSystem.giveArmorToPartyMember(
	itemId,
	partyPosition
);

Gives an item/weapon/armor to the party member at the given position. Nobody recieves the item if the party member's inventory is full.

-----------------------------------------------------
$gameSystem.equipArmorToActor(
	itemId,
	actorId,
	slotId
);
$gameSystem.equipWeaponToActor(
	itemId,
	actorId,
	slotId
);

Equip a weapon or armor to an equip slot of an actor. If they already have equipment in that slot, it will be placed in their personal inventory. If there isn't room in their personal inventory, then they don't recieve the item at all.

This is mostly useful for outfitting actors upon their first appearance.

-----------------------------------------------------
$gameSystem.getItemReceiver();

Returns the display name of the party member who recieved the item given by the last call of any of the give*To*() and equip*ToActor() functions. If nobody had room to recieve the item, this will return undefined. Use it with a script call in an event IF branch to know how to proceed after attempting to give an item.

-----------------------------------------------------
$gameSystem.giveSkillPointsToParty(
	amount
);

Gives an amount of skill points to the party, as well as an equal amount of respec points. This value is given to each party member. It is not divided amongst them.

-----------------------------------------------------
$gameSystem.addInfoLogWindow(
	text
);

Add a special message window in the upper left of the screen. It stays open for a set period of time and then closes. If another is opened before others have closed, the previous windows will be pushed down to accommodate the new one. The player can keep playing and other events can occur while these windows are open. This can be used to let the player know that they gained or lost something in an unobtrusive manner.

-----------------------------------------------------
$gameSystem.addMessageWindow(
	x,
	y,
	text,
	soundEffect,
	dontWaitOn,
	duration,
	closeable
);

Add a special message window to the screen, centered on the the given window location, with a size based on the text. text is an array of strings, where each string in the array represents a new line in the message window. soundEffect is an object, defined below, that tells what sound effect to play every time the text advances. dontWaitOn determines whether or not the event processing will wait for the window to close before proceeding, and if true the event processing will continue after opening the window. duration, if set to zero or higher, will automatically close the window after that number of frames. Normally, if duration is not set or is less than zero, the window will be closed when the player presses ok or cancel buttons. With a valid duration, player input will no longer close the window. If you wish for the player to still be able to manually close the window even with a valid duration, set closeable to true.

Multiple windows can be opened concurrently, if multiple are called upon with dontWaitOn set to true.

soundEffect:
{
	name, (string, name of a sound effect loaded by rpg maker)
	pan, (integer, -100 to 100, baseline 0)
	pitch, (integer, 25 to 400, baseline 100)
	volume (integer, 0 to 100, baseline 90)
}

------------------------------------------------------
$gameSystem.addAbsoluteMessageWindow(
	stayOnScreen,
	x,
	y,
	text,
	soundEffect,
	dontWaitOn,
	duration,
	closeable
);

Add a special message window to the screen, centered on the given map location, with a size based on the text. stayOnScreen will keep the message window at the edge of the screen, if the map location is currently offscreen. text is an array of strings, where each string in the array represents a new line in the message window. soundEffect is an object, defined above, that tells what sound effect to play every time the text advances. waitOn determines whether or not the event processing will wait for the window to close before proceeding, and if false the event processing will continue after opening the window. duration, if set to zero or higher, will automatically close the window after that number of frames. Normally, if duration is not set or is less than zero, the window will be closed when the player presses ok or cancel buttons. With a valid duration, player input will no longer close the window. If you wish for the player to still be able to manually close the window even with a valid duration, set closeable to true.

Multiple windows can be opened concurrently, if multiple are called upon with dontWaitOn set to true.

------------------------------------------------------
$gameSystem.clearMessageWindows();

Closes all currently open message windows, regardless of their type or settings. Useful if you want to open multiple windows and don't want to specifically coordinate when they all close, or if you just wanna make real sure everything closes at the end of a scene.

------------------------------------------------------
$gameSystem.skillLevelCheck(
	skillName,
	skillLevel
);

Checks to see if any party member has the given skill, at the given level. skillName is the name of a skill, and skillLevel is the level at least one party member has to have the skill at.

------------------------------------------------------
$gameSystem.skillCheck(
	successSkill,
	difficulty,
	abilitySkill,
	abilitySkillLevel
);

Performs a skill check, against the given difficulty, using the party member who has the highest level in the given skill. successSkill is the name of a skill. difficulty is an integer, providing about a 50/50 chance of success against a skill of an equivalent level. abilitySkill and abilitySkillLevel are optional, and similar to the parameters of skillLevelCheck(). Any party member who does not meet the ability skill level check is excluded from the search for the highest successSkill level.

------------------------------------------------------
$gameSystem.setSkillLevel(
	skill,
	level,
	partyPosition
);

Sets the given skill to the given level, for the character at the given partyPosition. Use this to set up skills at the start of the game, or when characters are first introduced.