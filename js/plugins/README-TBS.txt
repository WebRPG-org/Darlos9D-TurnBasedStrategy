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
	}
	"protection": {(see "Protection" section)},
	"attributes": [
		{
			"name": (string),
			"description": (string),
			"skillRequirements": [(see "Skill Requirement" section)], (THIS IS AN ARRAY OF MORE THAN ONE SKILL REQUIREMENT!!!)
			"strengthPercent": (integer),
			"toughness": (integer)
		}
	]
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
	"characterName": (name of character sprite file),
	"characterIndex": (index of sprite block in sprite file),
	"proneName": (name of character sprite file),
	"proneIndex": (index of sprite block in sprite file),
	"proneRow": (row of sprites in sprite block),
	"handedness": "left"/"right",
	"flying": true/false,
	"limbsType": "humanoid"/"quadrupedal"/"winged",
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
	}
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
"equippedArm": For weapons, applies defensive statistics to equipped arm.

----------------------------------------------------
Skill Requirements
----------------------------------------------------
{
	"skill": (string),
	"level": (integer)
}

----------------------------------------------------
Action
----------------------------------------------------
{
	"name": (string),
	"type": "attack"/"item"/"technique",
	"intendedTarget": "enemy"/"ally",
	"skipBattleScene": true/false,
	"stressCost": (integer),
	"description": (string),
	"consumesItem": true/false,
	"menuIcon": (integer),
	"attackAndMove": true/false,
	"skillRequirements": [(see "Skill Requirement" section)], (THIS IS AN ARRAY OF MORE THAN ONE SKILL REQUIREMENT!!!)
	"hitGroups": [{
		"delay": (integer),
		"attackMotion": {
			"motion": "Thrust"/"Swing"/"Missile",
			"image": (image name),
			"castAnimation": (animation name),
			"delayedCastAnimation": (animation name)
		},
		"hits": [{
			"initialAnimation": (animation name),
			"missAnimation": (animation name),
			"animation": (animation name),
			"ongoingAnimation": (animation name),
			"rangeType": "self"/"melee"/"thrown"/"fired"/"mental",
			"range": (integer),
			"aoe": (integer),
			"ignoreCenter": true/false,
			"ignoreUserRange": true/false,
			"accuracyBonus": (integer),
			"multipleHits": (integer),
			"accuracyVariance": (integer),
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
	startingY
);

Use this to add a party member to a force before starting a battle. The partyId refers to the member's current position in the party. startingX and startingY determines where on the map the character begins the battle.

----------------------------------------------------
$gameSystem.addTbsEnemy(
	forceId,
	enemyId,
	startingX,
	startingY,
	label,
	labelType
);

Use this to add an enemy to a force before starting a battle. startingX and startingY determines where on the map the character begins the battle. label is a string that is added after the enemy's name. if the string "replace" is passed in as the labelType, the label will instead completely replace the enemy's name.

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

-----------------------------------------------------
$gameSystem.getItemReceiver();

Returns the display name of the party member who recieved the item given by the last call of giveItemToParty(), giveWeaponToParty(), or giveArmorToParty(). If nobody had room to recieve the item, this will return undefined. Use it with a script call in an event IF branch to know how to proceed after attempting to give an item.

-----------------------------------------------------
$gameSystem.giveSkillPointsToParty(
	amount
);

Gives an amount of skill points to the party, as well as an equal amount of respec points. This value is given to each party member. It is not divided amongst them.

-----------------------------------------------------
$gameSystem.addMessageWindow(
	x,
	y,
	text,
	waitOn,
	duration,
	closeable
);

Add a special message window to the screen, at the given location, with a size based on the text. text is an array of strings, where each string in the array represents a new line in the message window. waitOn determines whether or not the event processing will wait for the window to close before proceeding, and if false the event processing will continue after opening the window. duration, if set to zero or higher, will automatically close the window after that number of frames. Normally, if duration is not set or is less than zero, the window will be closed when the player presses ok or cancel buttons. With a valid duration, player input will no longer close the window. If you wish for the player to still be able to manually close the window even with a valid duration, set closeable to true.

Multiple windows can be opened concurrently, if multiple are called upon with waitOn set to false.

------------------------------------------------------
$gameSystem.addAbsoluteMessageWindow(
	stayOnScreen,
	x,
	y,
	text,
	waitOn,
	duration,
	closeable
);

Add a special message window to the screen, at the given map location, with a size based on the text. stayOnScreen will keep the message window at the edge of the screen, if the map location is currently offscreen. text is an array of strings, where each string in the array represents a new line in the message window. waitOn determines whether or not the event processing will wait for the window to close before proceeding, and if false the event processing will continue after opening the window. duration, if set to zero or higher, will automatically close the window after that number of frames. Normally, if duration is not set or is less than zero, the window will be closed when the player presses ok or cancel buttons. With a valid duration, player input will no longer close the window. If you wish for the player to still be able to manually close the window even with a valid duration, set closeable to true.

Multiple windows can be opened concurrently, if multiple are called upon with waitOn set to false.