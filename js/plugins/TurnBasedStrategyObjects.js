//=============================================================================
// TurnBasedStrategyObjects.js
//=============================================================================

/*:
 *
 * @plugindesc Object handling for a turn based strategy game
 *
 * @author Darlos9D
 *
 * @help
 *
 * This plugin does not provide any commands.
 *
 */
 
(function() {
	//temp
	Game_Temp.prototype.initialize = function() {
		this._isPlaytest = Utils.isOptionValid('test');
		this._commonEventId = 0;
		this._destinationX = null;
		this._destinationY = null;
		this._pendingTbsForces = [];
		this._tbsCharactersToAdd = [];
		this._tbsRangeTilesToAdd = [];
		this._shouldClearTbsCharacters = false;
		this._shouldClearTbsRangeTiles = false;
		this._shouldClearTbsAoeSprites = false;
		this._rangeSpritesExist = false;
		this._tbsAoeSpritesToAdd = [];
		this._tbsDamageSpritesToAdd = [];
		this._shouldClearTbsDamageSprites = false;
		this._damageSpritesExist = false;
		this._itemReceiver = undefined;
		this._evaluatingInterpreter = undefined;
		this._storedInfoWindows = undefined;
		this._storedSuffixWindows = undefined;
	};
	
	Game_Temp.prototype.setEvaluatingInterpreter = function(interpreter) {
		this._evaluatingInterpreter = interpreter;
	};
	
	Game_Temp.prototype.evaluatingInterpreter = function(interpreter) {
		return this._evaluatingInterpreter;
	};
	
	Game_Temp.prototype.clearEvaluatingInterpreter = function(interpreter) {
		this._evaluatingInterpreter = undefined;
	};
	
	Game_Temp.prototype.addTbsPartyMember = function(forceId, partyId, startingX, startingY, surprised, label, labelType) {
		this.makeSureForceExists(forceId, true);
		
		if(!this._pendingTbsForces[forceId].isParty) { return; }
		
		if(!this._pendingTbsForces[forceId].actors) {
			this._pendingTbsForces[forceId].actors = [];
		}
		
		var actor = {};
		actor.id = partyId;
		actor.startingX = startingX;
		actor.startingY = startingY;
		actor.patient = false;
		actor.surprised = surprised;
		actor.label = label;
		actor.labelType = labelType;
		
		this._pendingTbsForces[forceId].actors.push(actor);
	};
	
	Game_Temp.prototype.addTbsEnemy = function(forceId, enemyId, startingX, startingY, patient, surprised, label, labelType) {
		this.makeSureForceExists(forceId, false);
		
		if(this._pendingTbsForces[forceId].isParty) { return; }
		
		if(!this._pendingTbsForces[forceId].actors) {
			this._pendingTbsForces[forceId].actors = [];
		}
		
		var actor = {};
		actor.id = enemyId;
		actor.startingX = startingX;
		actor.startingY = startingY;
		actor.patient = patient;
		actor.surprised = surprised;
		actor.label = label;
		actor.labelType = labelType;
		
		this._pendingTbsForces[forceId].actors.push(actor);
	};
	
	Game_Temp.prototype.setTbsForceEnemyForce = function(forceId, enemyForceId) {
		if(!this._pendingTbsForces[forceId] || forceId === enemyForceId) { return; }
		if(this._pendingTbsForces[forceId].enemyForceIds.indexOf(enemyForceId) === -1) {
			this._pendingTbsForces[forceId].enemyForceIds.push(enemyForceId);
		}
	};
	
	Game_Temp.prototype.setTbsForceAllyForce = function(forceId, allyForceId) {
		if(!this._pendingTbsForces[forceId] || forceId === allyForceId) { return; }
		if(this._pendingTbsForces[forceId].allyForceIds.indexOf(allyForceId) === -1) {
			this._pendingTbsForces[forceId].allyForceIds.push(allyForceId);
		}
	};
	
	Game_Temp.prototype.makeSureForceExists = function(forceId, isParty) {
		if(!this._pendingTbsForces[forceId]) {
			this._pendingTbsForces[forceId] = {};
			this._pendingTbsForces[forceId].isParty = isParty;
			this._pendingTbsForces[forceId].allyForceIds = [];
			this._pendingTbsForces[forceId].enemyForceIds = [];
		}
	};
	
	Game_Temp.prototype.startTbsBattle = function(resetCameraAfterBattle, cursorRegions) {
		$gameMap.setTbsBattleMode(true, resetCameraAfterBattle, cursorRegions);
		this.clearTbsForces();
	};
	
	Game_Temp.prototype.clearTbsForces = function() {
		this._pendingTbsForces = [];
	};
	
	Game_Temp.prototype.pendingTbsForces = function() {
		return this._pendingTbsForces;
	};
	
	Game_Temp.prototype.tbsCharactersToAdd = function() {
		return this._tbsCharactersToAdd;
	};
	
	Game_Temp.prototype.addTbsCharacter = function(character) {
		this._tbsCharactersToAdd.push(character);
	};
	
	Game_Temp.prototype.clearTbsCharactersToAdd = function() {
		this._tbsCharactersToAdd = [];
	};
	
	Game_Temp.prototype.setShouldClearTbsCharacters = function(should) {
		this._shouldClearTbsCharacters = should;
	};
	
	Game_Temp.prototype.shouldClearTbsCharacters = function() {
		return this._shouldClearTbsCharacters;
	};
	
	Game_Temp.prototype.tbsRangeTilesToAdd = function() {
		return this._tbsRangeTilesToAdd;
	};
	
	Game_Temp.prototype.addTbsRangeTile = function(x, y, color) {
		var i;
		for(i = 0; i < this._tbsRangeTilesToAdd.length; i++) {
			if(this._tbsRangeTilesToAdd[i].x == x && this._tbsRangeTilesToAdd[i].y == y) {
				return;
			}
		}
		var tile = {};
		tile.x = x;
		tile.y = y;
		tile.color = color;
		this._tbsRangeTilesToAdd.push(tile);
	};
	
	Game_Temp.prototype.clearTbsRangeTilesToAdd = function() {
		this._tbsRangeTilesToAdd = [];
	};
	
	Game_Temp.prototype.shouldClearTbsRangeTiles = function() {
		return this._shouldClearTbsRangeTiles;
	};
	
	Game_Temp.prototype.setShouldClearTbsRangeTiles = function(should) {
		this._shouldClearTbsRangeTiles = should;
	};
	
	Game_Temp.prototype.setRangedSpritesExist = function(exist) {
		this._rangeSpritesExist = exist;
	};
	
	Game_Temp.prototype.isFreeToMakeRangeTiles = function() {
		return !this._rangeSpritesExist;
	};
	
	Game_Temp.prototype.tbsAoeSpritesToAdd = function() {
		return this._tbsAoeSpritesToAdd;
	};
	
	Game_Temp.prototype.addTbsAoeSprite = function(x, y, isFollowUp) {
		var chara = new Game_Character();
		chara.setStepAnime(true);
		chara.setPriorityType(2);
		chara.setTbsBattleMode(true);
		chara.setPosition(x, y);
		chara.setImage("Cursor", isFollowUp ? 4 : 5);
		this._tbsAoeSpritesToAdd.push(chara);
		return chara;
	};
	
	Game_Temp.prototype.clearTbsAoeSpritesToAdd = function() {
		this._tbsAoeSpritesToAdd = [];
	};
	
	Game_Temp.prototype.shouldClearTbsAoeSprites = function() {
		return this._shouldClearTbsAoeSprites;
	};
	
	Game_Temp.prototype.setShouldClearTbsAoeSprites = function(should) {
		this._shouldClearTbsAoeSprites = should;
	};
	
	Game_Temp.prototype.tbsDamageSpritesToAdd = function() {
		return this._tbsDamageSpritesToAdd;
	};
	
	Game_Temp.prototype.addTbsDamageSprite = function(x, y, position, damage) {
		var sprite = {};
		sprite.x = x;
		sprite.y = y;
		sprite.position = position;
		sprite.damage = damage;
		this._tbsDamageSpritesToAdd.push(sprite);
	};
	
	Game_Temp.prototype.clearTbsDamageSpritesToAdd = function() {
		this._tbsDamageSpritesToAdd = [];
	};
	
	Game_Temp.prototype.shouldClearTbsDamageSprites = function() {
		return this._shouldClearTbsDamageSprites;
	};
	
	Game_Temp.prototype.setShouldClearTbsDamageSprites = function(should) {
		this._shouldClearTbsDamageSprites = should;
	};
	
	Game_Temp.prototype.setDamageSpritesExist = function(exist) {
		this._damageSpritesExist = exist;
	};
	
	Game_Temp.prototype.isFreeToMakeDamageSprites = function() {
		return !this._damageSpritesExist;
	};
	
	Game_Temp.prototype.setItemReceiver = function(receiver) {
		this._itemReceiver = receiver;
	};
	
	Game_Temp.prototype.clearItemReceiver = function() {
		this._itemReceiver = undefined;
	};
	
	Game_Temp.prototype.getItemReceiver = function() {
		return this._itemReceiver;
	};
	
	Game_Temp.prototype.setStoredInfoWindows = function(windows) {
		this._storedInfoWindows = windows;
	};
	
	Game_Temp.prototype.setStoredSuffixWindows = function(windows) {
		this._storedSuffixWindows = windows;
	};
	
	Game_Temp.prototype.storedInfoWindows = function() {
		return this._storedInfoWindows;
	};
	
	Game_Temp.prototype.storedSuffixWindows = function() {
		return this._storedSuffixWindows;
	};
	
	//system
	Game_System.prototype.addTbsPartyMember = function(forceId, partyId, startingX, startingY) {
		$gameTemp.addTbsPartyMember(forceId, partyId, startingX, startingY);
	};
	
	Game_System.prototype.addTbsEnemy = function(forceId, enemyId, startingX, startingY, patient, surprised, label, labelType) {
		$gameTemp.addTbsEnemy(forceId, enemyId, startingX, startingY, patient, surprised, label, labelType);
	};
	
	Game_System.prototype.setTbsForceEnemyForce = function(forceId, enemyForceId) {
		$gameTemp.setTbsForceEnemyForce(forceId, enemyForceId);
	};
	
	Game_System.prototype.setTbsForceAllyForce = function(forceId, allyForceId) {
		$gameTemp.setTbsForceAllyForce(forceId, allyForceId);
	};
	
	Game_System.prototype.startTbsBattle = function(resetCameraAfterBattle, cursorRegions) {
		$gameTemp.startTbsBattle(resetCameraAfterBattle, cursorRegions);
	};
	
	Game_System.prototype.clearTbsForces = function() {
		$gameTemp.clearTbsForces();
	};
	
	Game_System.prototype.setCameraFocus = function(x, y, speed) {
		$gameMap.setCameraFocus(x, y, speed);
	};
	
	Game_System.prototype.clearCameraFocus = function(resetToPlayer, speed) {
		$gameMap.clearCameraFocus(resetToPlayer, speed);
	};
	
	Game_System.prototype.setTbsActorDamage = function(partyPositionId, partName, damage) {
		var battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(partyPositionId));
		battler.setDamage(partName, damage);
	};
	
	Game_System.prototype.giveItemToParty = function(itemId) {
		$gameTemp.clearItemReceiver();
		var i;
		for(i = 0; i < $gameParty.size(); i++) {
			var battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(i));
			if(battler.totalItemCount() < battler.maxItems()) {
				battler.gainItem($dataItems[itemId]);
				$gameTemp.setItemReceiver(battler.displayName());
				break;
			}
		}
	};
	
	Game_System.prototype.giveWeaponToParty = function(itemId) {
		$gameTemp.clearItemReceiver();
		var i;
		for(i = 0; i < $gameParty.size(); i++) {
			var battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(i));
			if(battler.totalItemCount() < battler.maxItems()) {
				battler.gainItem($dataWeapons[itemId]);
				$gameTemp.setItemReceiver(battler.displayName());
				break;
			}
		}
	};
	
	Game_System.prototype.giveArmorToParty = function(itemId) {
		$gameTemp.clearItemReceiver();
		var i;
		for(i = 0; i < $gameParty.size(); i++) {
			var battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(i));
			if(battler.totalItemCount() < battler.maxItems()) {
				battler.gainItem($dataArmors[itemId]);
				$gameTemp.setItemReceiver(battler.displayName());
				break;
			}
		}
	};
	
	Game_System.prototype.giveItemToActor = function(itemId, actorId) {
		$gameTemp.clearItemReceiver();
		var battler = $gameActors.actor(actorId);
		if(battler.totalItemCount() < battler.maxItems()) {
			battler.gainItem($dataItems[itemId]);
			$gameTemp.setItemReceiver(battler.displayName());
		}
	};
	
	Game_System.prototype.giveWeaponToActor = function(itemId, actorId) {
		$gameTemp.clearItemReceiver();
		var battler = $gameActors.actor(actorId);
		if(battler.totalItemCount() < battler.maxItems()) {
			battler.gainItem($dataWeapons[itemId]);
			$gameTemp.setItemReceiver(battler.displayName());
		}
	};
	
	Game_System.prototype.giveArmorToActor = function(itemId, actorId) {
		$gameTemp.clearItemReceiver();
		var battler = $gameActors.actor(actorId);
		if(battler.totalItemCount() < battler.maxItems()) {
			battler.gainItem($dataArmors[itemId]);
			$gameTemp.setItemReceiver(battler.displayName());
		}
	};
	
	Game_System.prototype.giveItemToPartyMember = function(itemId, partyPosition) {
		$gameTemp.clearItemReceiver();
		var battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(partyPosition));
		if(battler.totalItemCount() < battler.maxItems()) {
			battler.gainItem($dataItems[itemId]);
			$gameTemp.setItemReceiver(battler.displayName());
		}
	};
	
	Game_System.prototype.giveWeaponToPartyMember = function(itemId, partyPosition) {
		$gameTemp.clearItemReceiver();
		var battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(partyPosition));
		if(battler.totalItemCount() < battler.maxItems()) {
			battler.gainItem($dataWeapons[itemId]);
			$gameTemp.setItemReceiver(battler.displayName());
		}
	};
	
	Game_System.prototype.giveArmorToPartyMember = function(itemId, partyPosition) {
		$gameTemp.clearItemReceiver();
		var battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(partyPosition));
		if(battler.totalItemCount() < battler.maxItems()) {
			battler.gainItem($dataArmors[itemId]);
			$gameTemp.setItemReceiver(battler.displayName());
		}
	};
	
	Game_System.prototype.getItemReceiver = function() {
		return $gameTemp.getItemReceiver();
	};
	
	Game_System.prototype.equipWeaponToActor = function(itemId, actorId, slotId) {
		$gameTemp.clearItemReceiver();
		var battler = $gameActors.actor(actorId);
		if(battler.giveEquip(slotId, $dataWeapons[itemId])) {
			$gameTemp.setItemReceiver(battler.displayName());
		}
	};
	
	Game_System.prototype.equipArmorToActor = function(itemId, actorId, slotId) {
		$gameTemp.clearItemReceiver();
		var battler = $gameActors.actor(actorId);
		if(battler.giveEquip(slotId, $dataArmors[itemId])) {
			$gameTemp.setItemReceiver(battler.displayName());
		}
	};
	
	Game_System.prototype.giveSkillPointsToParty = function(amount) {
		var i;
		for(i = 0; i < $gameParty.size(); i++) {
			var battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(i));
			battler.adjustSkillXP(amount);
			battler.adjustRespecXP(amount);
		}
	};
	
	Game_System.prototype.addInfoLogWindow = function(text) {
		var interpreter = $gameTemp.evaluatingInterpreter();
		if(interpreter) {
			interpreter.concurrentMessage();
		}
		$gameMap.addInfoLogWindow(text);
	};
	
	Game_System.prototype.addMessageWindow = function(x, y, text, soundEffect, dontWaitOn, duration, closeable) {
		var interpreter = $gameTemp.evaluatingInterpreter();
		if(interpreter) {
			interpreter.concurrentMessage();
		}
		$gameMap.addMessageWindow(false, false, x, y, text, soundEffect, dontWaitOn, duration, closeable);
	};
	
	Game_System.prototype.addAbsoluteMessageWindow = function(stayOnScreen, x, y, text, soundEffect, dontWaitOn, duration, closeable) {
		var interpreter = $gameTemp.evaluatingInterpreter();
		if(interpreter) {
			interpreter.concurrentMessage();
		}
		$gameMap.addMessageWindow(true, stayOnScreen, x, y, text, soundEffect, dontWaitOn, duration, closeable);
	};
	
	Game_System.prototype.clearMessageWindows = function() {
		$gameMap.clearMessageWindows();
	};
	
	Game_System.prototype.skillLevelCheck = function(skillName, skillLevel) {
		var i;
		for(i = 0; i < $gameParty.size(); i++) {
			var battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(i));
			if(battler.totalSkill(skillName) >= skillLevel) {
				return true;
			}
		}
		return false;
	};
	
	Game_System.prototype.skillCheck = function(successSkill, difficulty, abilitySkill, abilitySkillLevel) {
		var userFound = false;
		var highestSuccessSkill = 0;
		var highestAbilitySkill = 0;
		var i;
		for(i = 0; i < $gameParty.size(); i++) {
			var battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(i));
			if(abilitySkill !== undefined 
				&& abilitySkillLevel !== undefined
				&& battler.totalSkill(abilitySkill) < abilitySkillLevel) { continue; }
			userFound = true;
			if(battler.totalSkill(successSkill) > highestSuccessSkill) {
				highestSuccessSkill = battler.totalSkill(successSkill);
				highestAbilitySkill = battler.totalSkill(abilitySkill)
			}
		}
		if(userFound) {
			var skillDice = highestSuccessSkill < highestAbilitySkill ?
				highestAbilitySkill - highestSuccessSkill :
				highestSuccessSkill - highestAbilitySkill;
			var expertDice = highestSuccessSkill < highestAbilitySkill ? highestSuccessSkill : highestAbilitySkill;
			var skillRoll = BattleManager.rollSkillDice(skillDice, expertDice);
			var testRoll = BattleManager.rollTestDice(difficulty);
			return skillRoll.hits > testRoll.misses;
		}
		return false;
	};
	
	Game_System.prototype.setActorSkillLevel = function(skill, level, actorId) {
		var battler = $gameActors.actor(actorId);
		battler.setSkillPoints(skill, level);
	};
	
	Game_System.prototype.setPartyMemberSkillLevel = function(skill, level, partyPosition) {
		var battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(partyPosition));
		battler.setSkillPoints(skill, level);
	};
	
	Game_System.prototype.addActorSkillPoints = function(points, actorId) {
		var battler = $gameActors.actor(actorId);
		battler.adjustSkillXP(points);
		battler.adjustRespecXP(points);
	};
	
	Game_System.prototype.addPartyMemberSkillPoints = function(points, partyPosition) {
		var battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(partyPosition));
		battler.adjustSkillXP(points);
		battler.adjustRespecXP(points);
	};
	
	//item
	Game_Item.prototype.actions = function() {
		if(!this.isWeapon() && !this.isArmor() && !this.isItem()) {
			return [];
		}
		
		var item = this.object();
		
		if(!item) { return []; }
		
		return item.tbsStats.actions;
	};
	
	//party
	Game_Party.prototype.getMemberActorIdByPosition = function(index) {
		return this._actors[index];
	};
	
	//map
	Game_Map.prototype.initialize = function() {
		this._interpreter = new Game_Interpreter();
		this._mapId = 0;
		this._tilesetId = 0;
		this._events = [];
		this._commonEvents = [];
		this._vehicles = [];
		this._displayX = 0;
		this._displayY = 0;
		this._nameDisplay = true;
		this._scrollDirection = 2;
		this._scrollRest = 0;
		this._scrollSpeed = 4;
		this._parallaxName = '';
		this._parallaxZero = false;
		this._parallaxLoopX = false;
		this._parallaxLoopY = false;
		this._parallaxSx = 0;
		this._parallaxSy = 0;
		this._parallaxX = 0;
		this._parallaxY = 0;
		this._battleback1Name = null;
		this._battleback2Name = null;
		this.createVehicles();
		this._tbsLeadCharacter = null;
		this._tbsBattleMode = false;
		this._tbsBattleModeJustChanged = false;
		this._tbsForces = [];
		this._tbsOrderedForces = [];
		this._tbsCurrentTurnForce = -1;
		this._tbsTurnMode = "";
		this._tbsCancelMoveJustEnded = false;
		this._tbsTurnJustStarted = false;
		this._tbsSurpriseRoundJustStarted = false;
		this._tbsRoundJustStarted = false;
		this._tbsCursorFocusX = -1;
		this._tbsCursorFocusY = -1;
		this._sqrtOfTwo = Math.sqrt(2);
		this._shouldOpenActionWindow = false;
		this._tbsMoveTiles = [];
		this._tbsHalfMoveTiles = [];
		this._tbsFullMoveTiles = [];
		this._tbsActionsTiles = [];
		this._tbsSelectedActor = undefined;
		this._tbsManualMoveStartX = -1;
		this._tbsManualMoveStartY = -1;
		this._tbsManualMoveStarted = false;
		this._tbsSelectedActionType = -1;
		this._tbsSelectedAction = undefined;
		this._tbsSelectedActionIndex = -1;
		this._tbsActionTargetLocationX = -1;
		this._tbsActionTargetLocationY = -1;
		this._tbsActionMoveDestinationX = -1;
		this._tbsActionMoveDestinationY = -1;
		this._tbsActionTargetPart = undefined;
		this._tbsBreadcrumbs = [];
		this._tbsInActionBattleScene = false;
		this._cameraFocusX = undefined;
		this._cameraFocusY = undefined;
		this._cameraFocusDirection = undefined;
		this._cameraFocusResetToPlayer = undefined;
		this._resetCameraAfterBattle = undefined;
		this._tbsCursorRegions = [];
		this._mapBgm = undefined;
		this._tileRuns = [];
		this._pendingMessages = [];
		this._closeableMessageWindowsExist = false;
		this._waitingOnMessageWindows = false;
	};
	
	Game_Map.prototype.mapToCanvasX = function(x) {
		var tileWidth = this.tileWidth();
		var originX = this._displayX * tileWidth;
		var canvasX = (x * tileWidth) - originX;
		return canvasX;
	};

	Game_Map.prototype.mapToCanvasY = function(y) {
		var tileHeight = this.tileHeight();
		var originY = this._displayY * tileHeight;
		var canvasY = (y * tileHeight) - originY;
		return canvasY;
	};
	
	Game_Map.prototype.addInfoLogWindow = function(text) {
		if(!text || text.length <= 0) { return; }
		var message = {};
		message.type = "infoLog";
		message.suffix = false;
		message.absolute = false;
		message.stayOnScreen = false;
		message.x = 10;
		message.y = 10;
		message.text = text;
		message.waitOn = false;
		message.duration = 60*4;
		message.closeable = false;
		this._pendingMessages.push(message);
	};
	
	Game_Map.prototype.addMessageWindow = function(absolute, stayOnScreen, x, y, text, soundEffect, dontWaitOn, duration, closeable) {
		if(!text || text.length <= 0) { return; }
		var message = {};
		message.type = "message";
		message.suffix = false;
		message.absolute = absolute;
		message.stayOnScreen = stayOnScreen;
		message.x = x;
		message.y = y;
		message.text = text;
		message.soundEffect = soundEffect;
		message.waitOn = !dontWaitOn;
		message.duration = duration;
		message.closeable = closeable;
		if(!dontWaitOn) { this.setWaitingOnMessageWindows(); }
		this._pendingMessages.push(message);
	};
	
	Game_Map.prototype.clearMessageWindows = function() {
		this._needToClearMessageWindows = true;
	};
	
	Game_Map.prototype.needToClearMessageWindows = function() {
		var returnValue = this._needToClearMessageWindows;
		this._needToClearMessageWindows = false;
		return returnValue;
	};
	
	Game_Map.prototype.addSuffixWindow = function(tbsActor) {
		if(!tbsActor) { return; }
		var suffix = tbsActor.battler.displayNameSuffix();
		if(!suffix) { return; }
		var message = {};
		message.type = "suffix";
		message.suffix = true;
		message.absolute = true;
		message.stayOnScreen = false;
		message.x = tbsActor.chara.x;
		message.y = tbsActor.chara.y;
		message.text = [];
		message.text.push(suffix);
		message.waitOn = false;
		message.duration = -1;
		message.closeable = false;
		message.tbsActor = tbsActor;
		this._pendingMessages.push(message);
	};
	
	Game_Map.prototype.getPendingMessages = function() {
		var returnArray = [];
		this._pendingMessages.forEach(function (message) {
			returnArray.push(message);
		});
		this._pendingMessages = [];
		return returnArray;
	};
	
	Game_Map.prototype.setCloseableMessageWindowsExist = function() {
		this._closeableMessageWindowsExist = true;
	};
	
	Game_Map.prototype.anyCloseableMessageWindows = function() {
		return this._closeableMessageWindowsExist;
	};
	
	Game_Map.prototype.clearCloseableMessageWindows = function() {
		this._closeableMessageWindowsExist = false;
	};
	
	Game_Map.prototype.closeCloseableMessageWindows = function() {
		this._needToCloseCloseableMessageWindows = true;
	};
	
	Game_Map.prototype.needToCloseCloseableMessageWindows = function() {
		var returnValue = this._needToCloseCloseableMessageWindows;
		this._needToCloseCloseableMessageWindows = false;
		return returnValue;
	};
	
	Game_Map.prototype.setWaitingOnMessageWindows = function() {
		this._waitingOnMessageWindows = true;;
	};
	
	Game_Map.prototype.waitingOnMessageWindows = function() {
		return this._waitingOnMessageWindows;
	};
	
	Game_Map.prototype.clearWaitingOnMessageWindows = function() {
		this._waitingOnMessageWindows = false;
	};
	
	Game_Map.prototype.getShouldOpenActionWindow = function() {
		return this._shouldOpenActionWindow;
	};
	
	Game_Map.prototype.clearShouldOpenActionWindow = function() {
		this._shouldOpenActionWindow = false;
	};
	
	Game_Map.prototype.isWaitingOnQueuedActions = function() {
		return (this._tbsQueuedActions && this._tbsQueuedActions.length > 0)
			|| (this._tbsQueuedActionsAtPositions && this._tbsQueuedActionsAtPositions.length > 0);
	};

	Game_Map.prototype.saveBgmAndBgs = function() {
		this._mapBgm = AudioManager.saveBgm();
	};
	
	Game_Map.prototype.replayBgmAndBgs = function() {
		if (this._mapBgm) {
			AudioManager.replayBgm(this._mapBgm);
		} else {
			AudioManager.stopBgm();
		}
	};
	
	Game_Map.prototype.setCameraFocus = function(x, y, speed) {
		if(x === undefined || y === undefined) { return; }
		this._cameraFocusX = x;
		this._cameraFocusY = y;
		this._scrollSpeed = speed;
		this._cameraFocusResetToPlayer = undefined;
	};
	
	Game_Map.prototype.clearCameraFocus = function(resetToPlayer, speed) {
		this._cameraFocusX = undefined;
		this._cameraFocusY = undefined;
		this._cameraFocusResetToPlayer = resetToPlayer;
		this._scrollSpeed = speed;
	};
	
	Game_Map.prototype.getCameraFocus = function() {
		var cFocus = {};
		cFocus.x = this._cameraFocusX;
		cFocus.y = this._cameraFocusY;
		return cFocus;
	};
	
	Game_Map.prototype.getBreadcrumbs = function() {
		return this._tbsBreadcrumbs;
	};
	
	Game_Map.prototype.setBreadcrumbStage = function(stage) {
		this._tbsBreadcrumbs = [];
		switch(stage) {
			case "allDone":
				if(this._tbsActionTargetPart && this._tbsActionTargetPart !== "vital" && this._tbsActionTargetPart !== "mobility") {
					var targetPartBreadcrumb = {};
					targetPartBreadcrumb.text = "";
					switch(this._tbsActionTargetPart) {
						case "head":
							targetPartBreadcrumb.text = "Head";
							break;
						case "torso":
							targetPartBreadcrumb.text = "Torso";
							break;
						case "leftArm":
							targetPartBreadcrumb.text = "Left Arm";
							break;
						case "rightArm":
							targetPartBreadcrumb.text = "Right Arm";
							break;
						case "leftLeg":
							targetPartBreadcrumb.text = "Left Leg";
							break;
						case "rightLeg":
							targetPartBreadcrumb.text = "Right Leg";
							break;
					}
					this._tbsBreadcrumbs.push(targetPartBreadcrumb);
				}
			case "target":
				var targetBreadcrumb = {};
				targetBreadcrumb.text = "";
				if(this._tbsActionTargetLocationX !== -1) {
					var targetActor = this.getTbsActorAtPosition(this._tbsActionTargetLocationX, this._tbsActionTargetLocationY);
					if(targetActor) {
						targetBreadcrumb.text = targetActor.battler.displayName();
					} else {
						targetBreadcrumb.text = this._tbsActionTargetLocationX + ", " + this._tbsActionTargetLocationY;
					}
				}
				this._tbsBreadcrumbs.push(targetBreadcrumb);
			case "action":
				var actionBreadcrumb = {};
				actionBreadcrumb.text = "";
				if(this._tbsSelectedAction) {
					actionBreadcrumb.text = this._tbsSelectedAction.name;
					actionBreadcrumb.action = this._tbsSelectedAction;
				}
				this._tbsBreadcrumbs.push(actionBreadcrumb);
			case "manualMove":
			case "actor":
				var actorBreadcrumb = {};
				actorBreadcrumb.text = "";
				if(this._tbsSelectedActor) {
					actorBreadcrumb.text = this._tbsSelectedActor.battler.displayName();
				}
				this._tbsBreadcrumbs.push(actorBreadcrumb);
			break;
		}
		this._tbsBreadcrumbs.reverse();
		var instructionBreadcrumb = {};
		instructionBreadcrumb.flashing = true;
		switch(stage) {
			case "selectingActor":
				instructionBreadcrumb.text = "Member select...";
				break;
			case "surveying":
				instructionBreadcrumb.text = "Surveying...";
				break;
			case "actor":
				instructionBreadcrumb.text = "Action select...";
				break;
			case "manualMove":
				instructionBreadcrumb.text = "Moving...";
				break;
			case "action":
				instructionBreadcrumb.text = "Targeting...";
				break;
			case "target":
				instructionBreadcrumb.text = "Targeting body parts...";
				break;
		}
		if(instructionBreadcrumb.text) {
			this._tbsBreadcrumbs.push(instructionBreadcrumb);
		}
	};
	
	Game_Map.prototype.setTbsBattleMode = function(modeOn, resetCameraAfterBattle, cursorRegions) {
		var pendingTbsForces = $gameTemp.pendingTbsForces();
		if(this._tbsBattleMode !== modeOn && (!modeOn ||
			(modeOn && pendingTbsForces && pendingTbsForces.length >= 2)))
		{
			this._tbsBattleMode = modeOn;
			if(modeOn) {
				this._resetCameraAfterBattle = resetCameraAfterBattle;
				this._tbsCursorRegions = cursorRegions ? cursorRegions : [];
				this._tbsSurpriseRoundJustStarted = false;
				this._tbsForces = this.createTbsForces(pendingTbsForces);
				this.setTbsTurnMode("setup");
			}
			$gamePlayer.setTbsBattleMode(modeOn);
			this._tbsBattleModeJustChanged = true;
		}
	};
	
	Game_Map.prototype.tbsCursorRegions = function() {
		return this._tbsCursorRegions;
	};
	
	Game_Map.prototype.tbsBattleMode = function() {
		return this._tbsBattleMode;
	};
	
	Game_Map.prototype.tbsTurnMode = function() {
		return this._tbsTurnMode;
	};
	
	Game_Map.prototype.tbsForces = function() {
		return this._tbsForces;
	};
	
	Game_Map.prototype.currentForce = function() {
		return this._tbsForces[this._tbsCurrentTurnForce];
	};
	
	Game_Map.prototype.checkTbsCancelMoveJustEnded = function() {
		var returnValue = this._tbsCancelMoveJustEnded;
		this._tbsCancelMoveJustEnded = false;
		return returnValue;
	};
	
	Game_Map.prototype.checkTbsTurnJustStarted = function() {
		var returnValue = this._tbsTurnJustStarted;
		this._tbsTurnJustStarted = false;
		return returnValue;
	};
	
	Game_Map.prototype.checkTbsSurpriseRoundJustStarted = function() {
		var returnValue = this._tbsSurpriseRoundJustStarted;
		this._tbsSurpriseRoundJustStarted = false;
		return returnValue;
	};
	
	Game_Map.prototype.checkTbsRoundJustStarted = function() {
		var returnValue = this._tbsRoundJustStarted;
		this._tbsRoundJustStarted = false;
		return returnValue;
	};
	
	Game_Map.prototype.setTbsCursorFocus = function(x, y) {
		if($gamePlayer.x === x && $gamePlayer.y === y) {
			return;
		}
		if(this.tbsTurnMode() === "selectActionTarget") {
			this.clearTbsAoeSprites();
		}
		
		this._tbsCursorFocusX = x;
		this._tbsCursorFocusY = y;
	};
	
	Game_Map.prototype.tbsCursorIsFocusing = function() {
		return this._tbsCursorFocusX >= 0 && this._tbsCursorFocusY >= 0;
	};
	
	Game_Map.prototype.clearTbsCursorFocus = function() {
		if($gamePlayer.isMoving()) {
			this._tbsCursorFocusX = $gamePlayer.x;
			this._tbsCursorFocusY = $gamePlayer.y;
		} else {
			this._tbsCursorFocusX = -1;
			this._tbsCursorFocusY = -1;
		}
	};
	
	Game_Map.prototype.focusTbsCursor = function() {
		if(!$gamePlayer.isMoving() && $gamePlayer.x === this._tbsCursorFocusX && $gamePlayer.y === this._tbsCursorFocusY) {
			if(this.tbsTurnMode() === "selectActionTarget" 
				|| this.tbsTurnMode() === "executeAction"
				|| this.tbsTurnMode() === "actionBattleScene") {
				this.spawnTbsAoeSprites();
			}
			
			this.clearTbsCursorFocus();
		}
		
		if(!this.tbsCursorIsFocusing() || $gamePlayer.isMoving()) { return; }
		direction = $gamePlayer.findDirectionTo(this._tbsCursorFocusX, this._tbsCursorFocusY);
		$gamePlayer.moveStraight(direction);
	};
	
	Game_Map.prototype.createTbsForces = function(pendingTbsForces) {
		var forceId = -1;
		var tbsForces = pendingTbsForces.map(function(pendingForce) {
			forceId++;
			return this.createTbsForce(pendingForce, forceId);
		},this);
		return tbsForces;
	};
	
	Game_Map.prototype.createTbsForce = function(pendingTbsForce, forceId) {
		var force = {};
		force.forceId = forceId;
		force.isParty = pendingTbsForce.isParty;
		force.allyForceIds = pendingTbsForce.allyForceIds;
		force.enemyForceIds = pendingTbsForce.enemyForceIds;
		force.actors = [];
		force.initiativeRoll = {};
		force.initiativeRoll.hits = 0;
		force.initiativeRoll.bonuses = 0;
		
		var index = 0;
		pendingTbsForce.actors.forEach(function (pendingActor) {
			var actor = {};
			actor.startingX = pendingActor.startingX;
			actor.startingY = pendingActor.startingY;
			actor.patient = pendingActor.patient;
			actor.forceId = forceId;
			actor.isParty = force.isParty;
			actor.orderNum = index;
			if(force.isParty) {
				actor.battler = $gameActors.actor($gameParty.getMemberActorIdByPosition(pendingActor.id));
				actor.memberPosition = pendingActor.id;
				if(actor.memberPosition === 0) {
					this._tbsLeadCharacter = actor;
				}
			} else {
				actor.battler = new Game_Enemy(pendingActor.id);
				actor.memberPosition = -1;
			}
			if(!actor.battler) { return; }
			if(pendingActor.label !== undefined) {
				if(pendingActor.labelType === "replace") {
					actor.battler.setDisplayName(pendingActor.label);
				} else {
					actor.battler.setDisplayName(actor.battler.nickname() + " " + pendingActor.label);
				}
			}
			
			actor.canActThisRound = !actor.battler.isDown() && !pendingActor.surprised;
			actor.battler.setStress(0);
			actor.battler.setRoundBuffs(0);
			if(pendingActor.surprised) {
				this._tbsSurpriseRoundJustStarted = true;
			}
			
			this.stressFromDamage(actor.battler);
			
			force.actors.push(actor);
			
			this.rollInitiative(actor, force);
			
			index++;
		}, this);
		
		return force;
	};
	
	Game_Map.prototype.stressFromDamage = function(battler) {
		var tough = battler.toughness();
		var damageStress = battler.getDamage("head") >= tough ? 6 : (battler.getDamage("head") >= tough/2 ? 2 : 0)
			+ battler.getDamage("torso") >= tough*2 ? 3 : (battler.getDamage("torso") >= tough ? 1 : 0);
		if(battler.limbsType() === "winged" && battler.isFlying()) {
			damageStress += battler.getDamage("leftLeg") >= tough ? 3 : (battler.getDamage("leftLeg") >= tough/2 ? 1 : 0)
				+ battler.getDamage("rightLeg") >= tough ? 3 : (battler.getDamage("rightLeg") >= tough/2 ? 1 : 0)
				+ battler.getDamage("leftArm") >= tough ? 6 : (battler.getDamage("leftArm") >= tough/2 ? 2 : 0)
				+ battler.getDamage("rightArm") >= tough ? 6 : (battler.getDamage("rightArm") >= tough/2 ? 2 : 0);
		} else if(battler.limbsType() === "quadrupedal") {
			damageStress += battler.getDamage("leftLeg") >= tough ? 3 : (battler.getDamage("leftLeg") >= tough/2 ? 1 : 0)
				+ battler.getDamage("rightLeg") >= tough ? 3 : (battler.getDamage("rightLeg") >= tough/2 ? 1 : 0)
				+ battler.getDamage("leftArm") >= tough ? 3 : (battler.getDamage("leftArm") >= tough/2 ? 1 : 0)
				+ battler.getDamage("rightArm") >= tough ? 3 : (battler.getDamage("rightArm") >= tough/2 ? 1 : 0);
		} else {
			damageStress += battler.getDamage("leftLeg") >= tough ? 6 : (battler.getDamage("leftLeg") >= tough/2 ? 2 : 0)
				+ battler.getDamage("rightLeg") >= tough ? 6 : (battler.getDamage("rightLeg") >= tough/2 ? 2 : 0)
				+ battler.getDamage("leftArm") >= tough ? 3 : (battler.getDamage("leftArm") >= tough/2 ? 1 : 0)
				+ battler.getDamage("rightArm") >= tough ? 3 : (battler.getDamage("rightArm") >= tough/2 ? 1 : 0);
		}
		battler.adjustStress(Math.floor(damageStress-battler.stressRecovery()));
	}
	
	Game_Map.prototype.rollInitiative = function(actor, force) {
		var roundBuffs = actor.battler.roundBuffs();
		actor.battler.setRoundBuffs(0);
		if(actor.canActThisRound) {
			var perception = actor.battler.totalSkill("perception");
			var reflex = actor.battler.reflexSkill();
			var stress = actor.battler.stress();
			var skillDice = perception > reflex ? perception - reflex : reflex - perception;
			var expertDice = perception > reflex ? reflex : perception;
			var buffDice = roundBuffs;
			var debuffDice = stress;
			var initiativeRoll = BattleManager.rollSkillDice(skillDice, expertDice, buffDice);
			var stressRoll = BattleManager.rollTestDice(0, 0, debuffDice);
			initiativeRoll.bonuses += initiativeRoll.rareBonuses * 2;
			initiativeRoll.hits -= stressRoll.misses;
			initiativeRoll.bonuses -= stressRoll.penalties;
			if(initiativeRoll.bonuses > stress) {
				actor.battler.setRoundBuffs(initiativeRoll.bonuses - stress);
			}
			if(initiativeRoll.bonuses > 0) {
				actor.battler.adjustStress(-initiativeRoll.bonuses);
			}
			if(
				force.initiativeRoll === undefined ||
				force.initiativeRoll.hits < initiativeRoll.hits ||
				(force.initiativeRoll.hits == initiativeRoll.hits &&
				force.initiativeRoll.bonuses < initiativeRoll.bonuses)
			) {
				force.initiativeRoll = initiativeRoll;
			}
		}
	};
	
	Game_Map.prototype.spawnTbsCharacters = function() {
		this._tbsForces.forEach(function (force) {
			force.actors.forEach(function (actor) {
				var chara = new Game_Character();
				chara.setStepAnime(true);
				chara.setTbsBattleMode(true);
				chara.setPriorityType(1);
				if(force.isParty) {
					var member = $gamePlayer;
					if(actor.memberPosition > 0) {
						member = $gamePlayer.followers().follower(actor.memberPosition - 1);
					}
					chara.setPosition(member.x, member.y);
					chara.setImage(member.characterName(), member.characterIndex());
				} else {
					var enemy = actor.battler.enemy();
					chara.setPosition(actor.startingX, actor.startingY);
					chara.setImage(enemy.tbsStats.characterName, enemy.tbsStats.characterIndex);
				}
				actor.chara = chara;
				$gameTemp.addTbsCharacter(chara);
			});
		});
	};
	
	Game_Map.prototype.isEventRunning = function() {
		return this._interpreter.isRunning() || this.isAnyEventStarting() ||
			(this._cameraFocusX !== undefined && this._cameraFocusY !== undefined &&
			(this._displayX !== this._cameraFocusX || this._displayY !== this._cameraFocusY));
	};
	
	Game_Map.prototype.update = function(sceneActive) {
		if(this._tbsBattleModeJustChanged) {
			this._tbsBattleModeJustChanged = false;
			if(this._tbsBattleMode) {
				$gamePlayer.hideFollowers();
				$gamePlayer.setThrough(true);
			} else {
				$gamePlayer.showFollowers();
				$gamePlayer.setThrough(false);
				$gameTemp.setShouldClearTbsCharacters(true);
			}
			$gamePlayer.refresh();
		}
		
		this.refreshIfNeeded();
		if (sceneActive) {
			this.updateInterpreter();
		}
		this.updateScroll();
		this.updateEvents();
		this.updateCharacters();
		this.updateVehicles();
		this.updateParallax();
		this.updateTbsBattle();
	};
	
	Game_Map.prototype.updateScroll = function() {
		if (this.isScrolling()) {
			var lastX = this._displayX;
			var lastY = this._displayY;
			this.doScroll(this._scrollDirection, this.scrollDistance());
			if (this._displayX === lastX && this._displayY === lastY) {
				this._scrollRest = 0;
			} else {
				this._scrollRest -= this.scrollDistance();
			}
		} else if(this._cameraFocusResetToPlayer || (this._cameraFocusX !== undefined && this._cameraFocusY !== undefined)) {
			var focusX = this._cameraFocusX;
			var focusY = this._cameraFocusY;
			if(this._cameraFocusResetToPlayer && (this._cameraFocusX === undefined || this._cameraFocusY === undefined)) {
				focusX = $gamePlayer.x - Math.floor($gameMap.screenTileX() / 2);
				focusY = $gamePlayer.y - Math.floor($gameMap.screenTileY() / 2);;
			}
			if(Number.isInteger(this._displayX) && Number.isInteger(this._displayY)) {
				this._cameraFocusDirection = undefined;
				if(this._cameraFocusResetToPlayer && this._displayX == focusX & this._displayY == focusY) {
					this._cameraFocusResetToPlayer = false;
					return;
				}
			}
			if((this._displayX !== focusX || this._displayY !== focusY)
				&& this._cameraFocusDirection === undefined) {
				this._cameraFocusDirection = this.findDirection(this._displayX, this._displayY, focusX, focusY);
			}
			if(this._cameraFocusDirection !== undefined) {
				this.doScroll(this._cameraFocusDirection, this.scrollDistance());
			}
		}
	};
	
	Game_Map.prototype.setDisplayPos = function(x, y) {
		if(this._cameraFocusResetToPlayer || (this._cameraFocusX !== undefined && this._cameraFocusY !== undefined)) { return; }
		if (this.isLoopHorizontal()) {
			this._displayX = x.mod(this.width());
			this._parallaxX = x;
		} else {
			var endX = this.width() - this.screenTileX();
			this._displayX = endX < 0 ? endX / 2 : x.clamp(0, endX);
			this._parallaxX = this._displayX;
		}
		if (this.isLoopVertical()) {
			this._displayY = y.mod(this.height());
			this._parallaxY = y;
		} else {
			var endY = this.height() - this.screenTileY();
			this._displayY = endY < 0 ? endY / 2 : y.clamp(0, endY);
			this._parallaxY = this._displayY;
		}
	};
	
	Game_Map.prototype.doScroll = function(direction, distance) {
		switch (direction) {
		case 2:
			this.scrollDown(distance, true);
			break;
		case 4:
			this.scrollLeft(distance, true);
			break;
		case 6:
			this.scrollRight(distance, true);
			break;
		case 8:
			this.scrollUp(distance, true);
			break;
		}
	};
	
	Game_Map.prototype.scrollDown = function(distance, isEventScroll) {
		if(!isEventScroll
			&& (this._cameraFocusResetToPlayer || (this._cameraFocusX !== undefined && this._cameraFocusY !== undefined)))
		{
			return;
		}
		if (this.isLoopVertical()) {
			this._displayY += distance;
			this._displayY %= $dataMap.height;
			if (this._parallaxLoopY) {
				this._parallaxY += distance;
			}
		} else if (this.height() >= this.screenTileY()) {
			var lastY = this._displayY;
			this._displayY = Math.min(this._displayY + distance,
				this.height() - this.screenTileY());
			this._parallaxY += this._displayY - lastY;
		}
	};

	Game_Map.prototype.scrollLeft = function(distance, isEventScroll) {
		if(!isEventScroll
			&& (this._cameraFocusResetToPlayer || (this._cameraFocusX !== undefined && this._cameraFocusY !== undefined)))
		{
			return;
		}
		if (this.isLoopHorizontal()) {
			this._displayX += $dataMap.width - distance;
			this._displayX %= $dataMap.width;
			if (this._parallaxLoopX) {
				this._parallaxX -= distance;
			}
		} else if (this.width() >= this.screenTileX()) {
			var lastX = this._displayX;
			this._displayX = Math.max(this._displayX - distance, 0);
			this._parallaxX += this._displayX - lastX;
		}
	};

	Game_Map.prototype.scrollRight = function(distance, isEventScroll) {
		if(!isEventScroll
			&& (this._cameraFocusResetToPlayer || (this._cameraFocusX !== undefined && this._cameraFocusY !== undefined)))
		{
			return;
		}
		if (this.isLoopHorizontal()) {
			this._displayX += distance;
			this._displayX %= $dataMap.width;
			if (this._parallaxLoopX) {
				this._parallaxX += distance;
			}
		} else if (this.width() >= this.screenTileX()) {
			var lastX = this._displayX;
			this._displayX = Math.min(this._displayX + distance,
				this.width() - this.screenTileX());
			this._parallaxX += this._displayX - lastX;
		}
	};

	Game_Map.prototype.scrollUp = function(distance, isEventScroll) {
		if(!isEventScroll
			&& (this._cameraFocusResetToPlayer || (this._cameraFocusX !== undefined && this._cameraFocusY !== undefined)))
		{
			return;
		}
		if (this.isLoopVertical()) {
			this._displayY += $dataMap.height - distance;
			this._displayY %= $dataMap.height;
			if (this._parallaxLoopY) {
				this._parallaxY -= distance;
			}
		} else if (this.height() >= this.screenTileY()) {
			var lastY = this._displayY;
			this._displayY = Math.max(this._displayY - distance, 0);
			this._parallaxY += this._displayY - lastY;
		}
	};
	
	Game_Map.prototype.findDirection = function(startX, startY, goalX, goalY) {
		var searchLimit = this.searchLimit();
		var mapWidth = $gameMap.width();
		var nodeList = [];
		var openList = [];
		var closedList = [];
		var start = {};
		var best = start;

		if (startX === goalX && startY === goalY) {
			return 0;
		}

		start.parent = null;
		start.x = startX;
		start.y = startY;
		start.g = 0;
		start.f = $gameMap.distance(start.x, start.y, goalX, goalY);
		nodeList.push(start);
		openList.push(start.y * mapWidth + start.x);

		while (nodeList.length > 0) {
			var bestIndex = 0;
			for (var i = 0; i < nodeList.length; i++) {
				if (nodeList[i].f < nodeList[bestIndex].f) {
					bestIndex = i;
				}
			}

			var current = nodeList[bestIndex];
			var x1 = current.x;
			var y1 = current.y;
			var pos1 = y1 * mapWidth + x1;
			var g1 = current.g;

			nodeList.splice(bestIndex, 1);
			openList.splice(openList.indexOf(pos1), 1);
			closedList.push(pos1);

			if (current.x === goalX && current.y === goalY) {
				best = current;
				goaled = true;
				break;
			}

			if (g1 >= searchLimit) {
				continue;
			}

			for (var j = 0; j < 4; j++) {
				var direction = 2 + j * 2;
				var x2 = $gameMap.roundXWithDirection(x1, direction);
				var y2 = $gameMap.roundYWithDirection(y1, direction);
				var pos2 = y2 * mapWidth + x2;

				if (closedList.contains(pos2)) {
					continue;
				}

				var g2 = g1 + 1;
				var index2 = openList.indexOf(pos2);

				if (index2 < 0 || g2 < nodeList[index2].g) {
					var neighbor;
					if (index2 >= 0) {
						neighbor = nodeList[index2];
					} else {
						neighbor = {};
						nodeList.push(neighbor);
						openList.push(pos2);
					}
					neighbor.parent = current;
					neighbor.x = x2;
					neighbor.y = y2;
					neighbor.g = g2;
					neighbor.f = g2 + $gameMap.distance(x2, y2, goalX, goalY);
					if (!best || neighbor.f - neighbor.g < best.f - best.g) {
						best = neighbor;
					}
				}
			}
		}

		var node = best;
		while (node.parent && node.parent !== start) {
			node = node.parent;
		}

		var deltaX1 = $gameMap.deltaX(node.x, start.x);
		var deltaY1 = $gameMap.deltaY(node.y, start.y);
		if (deltaY1 > 0) {
			return 2;
		} else if (deltaX1 < 0) {
			return 4;
		} else if (deltaX1 > 0) {
			return 6;
		} else if (deltaY1 < 0) {
			return 8;
		}

		var deltaX2 = this.deltaX(start.x, goalX);
		var deltaY2 = this.deltaY(start.y, goalY);
		if (Math.abs(deltaX2) > Math.abs(deltaY2)) {
			return deltaX2 > 0 ? 4 : 6;
		} else if (deltaY2 !== 0) {
			return deltaY2 > 0 ? 8 : 2;
		}

		return 0;
	};
	
	Game_Map.prototype.searchLimit = function() {
		return 12;
	};
	
	Game_Map.prototype.setTbsSelectedActor = function(tbsActor) {
		if(this._tbsSelectedActor != tbsActor) {
			this._tbsSelectedActor = tbsActor;
			this.generateTbsMoveField();
			this.clearTbsRangeSprites();
		}
	};
	
	Game_Map.prototype.getTbsSelectedActor = function() {
		return this._tbsSelectedActor;
	};
	
	Game_Map.prototype.setTbsManualMoveStart = function(x, y) {
		this._tbsManualMoveStartX = x;
		this._tbsManualMoveStartY = y;
	};
	
	Game_Map.prototype.clearTbsManualMoveStart = function() {
		this._tbsManualMoveStartX = -1;
		this._tbsManualMoveStartY = -1;
	};
	
	Game_Map.prototype.setTbsActionTargetLocation = function(x, y) {
		this._tbsActionTargetLocationX = x;
		this._tbsActionTargetLocationY = y;
	};
	
	Game_Map.prototype.clearTbsActionTargetLocation = function() {
		this._tbsActionTargetLocationX = -1;
		this._tbsActionTargetLocationY = -1;
	};
	
	Game_Map.prototype.getTbsActionTargetLocationX = function() {
		return this._tbsActionTargetLocationX;
	};
	
	Game_Map.prototype.getTbsActionTargetLocationY = function() {
		return this._tbsActionTargetLocationY;
	};
	
	Game_Map.prototype.isAnyTbsActionTargets = function(ignoreFollowUpHits) {
		var targetsByHit = this.getTbsActionTargetsByHit();
		var hitGroups = this._tbsSelectedAction.hitGroups;
		var i;
		for(i = 0; i < targetsByHit.length; i++) {
			var j;
			for(j = 0; j < targetsByHit[i].length; j++) {
				var hits = targetsByHit[i];
				if((!ignoreFollowUpHits || hits[j].rangeType !== "followUp") && (targetsByHit[i][j].length > 1
					|| (targetsByHit[i][j].length === 1 && !targetsByHit[i][j][0].battler.blankDummy()))) { return true; }
			}
		}
		return false;
	};
	
	Game_Map.prototype.getTbsActionTargets = function() {
		var targetsByHit = this.getTbsActionTargetsByHit();
		var returnTargets = [];
		targetsByHit.forEach(function (group) {
			group.forEach(function (targets) {
				targets.forEach(function (target) {
					if(returnTargets.indexOf(target) === -1) {
						returnTargets.push(target);
					}
				});
			});
		});
		return returnTargets;
	};
	
	Game_Map.prototype.getTbsActionTargetsByHit = function() {
		var targetsByHit = [];
		if(!this._tbsSelectedAction) { return targetsByHit; }
		var hitGroups = this._tbsSelectedAction.hitGroups;
		if(!hitGroups || hitGroups.length == 0) { return targetsByHit; }
		var centerTarget = this.getTbsActorAtPosition($gamePlayer.x, $gamePlayer.y);
		if(!centerTarget) {
			centerTarget = this._dummyTarget;
			centerTarget.chara.setPosition($gamePlayer.x, $gamePlayer.y);
		}
		var processedHitGroups = BattleManager.processHitGroups(hitGroups);
		processedHitGroups.forEach(function (processedHitGroup) {
			var hitGroup = processedHitGroup.hitGroup;
			var outGroup = [];
			targetsByHit.push(outGroup);
			if(!hitGroup.hits || hitGroup.hits.length == 0) { return; }
			hitGroup.hits.forEach(function (hit) {
				var targets = [];
				if(hit.aoe !== undefined && hit.aoe > 0) {
					var centerPointX = $gamePlayer.x;
					var centerPointY = $gamePlayer.y;
					var aoeRange = hit.aoe / 2;
					var checkBoxRange = Math.ceil(aoeRange);
					var x;
					for(x = centerPointX - checkBoxRange; x <= centerPointX + checkBoxRange; x++) {
						var y;
						for(y = centerPointY - checkBoxRange; y <= centerPointY + checkBoxRange; y++) {
							if(hit.ignoreCenter && x === centerPointX && y === centerPointY) { continue; }
							if(x === centerPointX && y === centerPointY && targets.indexOf(centerTarget) === -1) {
								targets.unshift(centerTarget);
								continue;
							}
							var distance = this.actualDistance(x, y, centerPointX, centerPointY);
							if(distance > aoeRange) {
								continue;
							}
							var target = this.getTbsActorAtPosition(x, y);
							if(!target || targets.indexOf(target) >= 0) {
								continue;
							}
							if(!this.isTrajectoryObstructed(centerPointX, centerPointY, x, y, "thrown", true)) {
								targets.push(target);
							}
						}
					}
				} else {
					targets.push(centerTarget);
				}
				outGroup.push(targets);
			},this);
		},this);
		return targetsByHit;
	};
	
	Game_Map.prototype.spawnTbsAoeSprites = function() {
		if(this._tbsAoeSprites.length > 0 || !this._tbsSelectedAction) { return; }
		var hitGroups = this._tbsSelectedAction.hitGroups;
		if(!hitGroups) { return; }
		hitGroups.forEach(function (hitGroup) {
			if(!hitGroup.hits || hitGroup.hits.length == 0) { return; }
			hitGroup.hits.forEach(function (hit) {
				if(hit.aoe !== undefined && hit.aoe > 0) {
					var centerPointX = $gamePlayer.x;
					var centerPointY = $gamePlayer.y;
					var aoeRange = hit.aoe / 2;
					var checkBoxRange = Math.ceil(aoeRange);
					var x;
					for(x = centerPointX - checkBoxRange ; x <= centerPointX + checkBoxRange; x++) {
						var y;
						for(y = centerPointY - checkBoxRange ; y <= centerPointY + checkBoxRange; y++) {
							if((hit.ignoreCenter && x === centerPointX && y === centerPointY)
								|| this.getExistingTbsTile(x, y, this._tbsAoeSprites)) { continue; }
							var distance = this.actualDistance(x, y, centerPointX, centerPointY);
							if(distance > aoeRange) {
								continue;
							}
							if(!this.isTrajectoryObstructed(centerPointX, centerPointY, x, y, "thrown", true)) {
								this._tbsAoeSprites.push($gameTemp.addTbsAoeSprite(x, y, hit.rangeType === "followUp"));
							}
						}
					}
				}
			},this);
		},this);
	};
	
	Game_Map.prototype.clearTbsAoeSprites = function() {
		$gameTemp.setShouldClearTbsAoeSprites(true);
		this._tbsAoeSprites = [];
	};
	
	Game_Map.prototype.isCursorInActionField = function() {
		var actionTiles = this._tbsActionsTiles[this._tbsSelectedActionIndex];
		if(!actionTiles) { return false; }
		return this.getExistingTbsTile($gamePlayer.x, $gamePlayer.y, actionTiles);
	};
	
	Game_Map.prototype.setTbsSelectedActionType = function(type) {
		if(this._tbsSelectedActionType !== type) {
			this._tbsSelectedActionType = type;
			this.generateTbsActionFields();
		}
		if(type === undefined) {
			this._shouldOpenActionWindow = false;
			this._wasWaitingOnQueuedActions = false;
		}
	};
	
	Game_Map.prototype.setTbsSelectedAction = function(actionInfo, index) {
		if(this._tbsSelectedActionInfo !== actionInfo) {
			this._tbsSelectedAction = actionInfo ? actionInfo.action : undefined;
			this._tbsSelectedActionInfo = actionInfo;
			this._tbsSelectedActionIndex = index;
			if(this.currentForce().isParty) {
				this.clearTbsRangeSprites();
				this.clearTbsAoeSprites();
				if(this.tbsTurnMode() === "selectActionTarget" 
					|| this.tbsTurnMode() === "executeAction"
					|| this.tbsTurnMode() === "actionBattleScene") {
					this.spawnTbsAoeSprites();
				}
			}
		}
	};
	
	Game_Map.prototype.getTbsSelectedActionInfo = function() {
		return this._tbsSelectedActionInfo;
	};
	
	Game_Map.prototype.setTbsActionMoveDestination = function(x, y) {
		this._tbsActionMoveDestinationX = x;
		this._tbsActionMoveDestinationY = y;
	}
	
	Game_Map.prototype.clearTbsActionMoveDestination = function() {
		this._tbsActionMoveDestinationX = -1;
		this._tbsActionMoveDestinationY = -1;
	}
	
	Game_Map.prototype.setTbsActionTargetPart = function(part) {
		this._tbsActionTargetPart = part;
	};
	
	Game_Map.prototype.clearTbsActionTargetPart = function() {
		this._tbsActionTargetPart = undefined;
	};
	
	Game_Map.prototype.getTbsActionTargetPart = function() {
		return this._tbsActionTargetPart;
	};
	
	Game_Map.prototype.getRangedDistance = function() {
		if(this._tbsSelectedActor !== undefined && this._tbsSelectedAction !== undefined
			&& this._tbsActionTargetLocationX !== undefined && this._tbsActionTargetLocationY !== undefined)
		{
			var actorChara = this._tbsSelectedActor.chara;
			var distance = this.actualDistance(actorChara.x, actorChara.y,
				this._tbsActionTargetLocationX, this._tbsActionTargetLocationY);
			return Math.max(0, distance - this._tbsSelectedActor.battler.baseRange()/2);
		}
		return 0;
	};
	
	Game_Map.prototype.setShouldPassTurn = function(should) {
		this._tbsShouldPass = should;
	};
	
	Game_Map.prototype.setTbsTurnMode = function(mode) {
		if(this._tbsBattleMode && this._tbsTurnMode !== mode) {
			var prevMode = this._tbsTurnMode
			this._tbsTurnMode = mode;
			$gamePlayer.setTbsCanMove(false);
			$gamePlayer.setTbsFollowingCharacter(false);
			$gamePlayer.clearCursorMoveField();
			$gamePlayer.setTbsShowCursor(false);
			$gamePlayer.clearMovingCharacter();
			switch(this._tbsTurnMode) {
			case "setup":
				this._tbsCurrentTurnForce = 0;
				this.spawnTbsCharacters();
				this._tbsForces.forEach(function (force) {
					force.actors.forEach(function (actor) {
						this.addSuffixWindow(actor);
					}, this)
				}, this);
				this.saveBgmAndBgs();
				this._tileRuns = this.getTileRuns();
				this.determineForceOrder();
				//$gameTemp.setShouldClearTbsDamageSprites(true);
				break;
			case "selectActorActionType":
				$gamePlayer.setTbsShowCursor(true);
				if(prevMode !== "manualMove" && prevMode !== "cancelMove" && prevMode !=="manualTarget") {
					this.clearTbsRangeSprites();
				}
				if(prevMode === "setup") {
					this._tbsTurnJustStarted = true;
					this._tbsRoundJustStarted = false;
					this._tbsMoveTiles = [];
					this._tbsHalfMoveTiles = [];
					this._tbsFullMoveTiles = [];
					this._tbsActionsTiles = [];
					this.setTbsSelectedActor(undefined);
					this.clearTbsManualMoveStart();
					this.setTbsSelectedActionType(-1);
					this.setTbsSelectedAction(undefined, -1);
					this.clearTbsActionTargetLocation();
					this.clearTbsActionMoveDestination();
					this.clearTbsActionTargetPart();
					this.setBreadcrumbStage("none");
					this._tbsCurEnemyWaitFrames = -1;
					this._tbsEnemyWaitFrames = 15;
					this._tbsCurAfterBtlScnFrames = -1;
					this._tbsAfterBtlScnFrames = 30;
					this._tbsQueuedActions = [];
					this._tbsQueuedActionsAtPositions = [];
					this._tbsShouldPass = false;
					this._tbsAoeSprites = [];
					this._tbsEnemyFadeoutTime = 30;
					this._dummyTarget = {};
					this._dummyTarget.startingX = 0;
					this._dummyTarget.startingY = 0;
					this._dummyTarget.forceId = 0;
					this._dummyTarget.isParty = false;
					this._dummyTarget.orderNum = 0;
					this._dummyTarget.battler = new Game_Enemy(7);
					this._dummyTarget.memberPosition = -1;
					this._dummyTarget.canActThisRound = false;
					this._queuedActionLoops = 0;
					this._queuedActionLimit = 500000;
					var chara = new Game_Character();
					chara.setStepAnime(false);
					chara.setTbsBattleMode(true);
					chara.setPriorityType(1);
					chara.setPosition(0, 0);
					chara.setImage('', 0);
					this._dummyTarget.chara = chara;
					BattleManager.playBattleBgm();
				}
				if(prevMode === "selectActionTarget") {
					this.setTbsSelectedAction(undefined, -1);
					this.clearTbsActionTargetLocation();
					this.clearTbsAoeSprites();
				}
				if(prevMode === "manualMove") {
					this.clearTbsAoeSprites();
					if(this._tbsSelectedActor.movedThisRound) {
						this.generateTbsActionFields();
					}
					var chara = this._tbsSelectedActor.chara;
					this._tbsSelectedActor.movedThisRound = true;
					if(this._tbsManualMoveStartX !== -1
						&& chara.x === this._tbsManualMoveStartX && chara.y === this._tbsManualMoveStartY) {
						this.clearTbsManualMoveStart();
					}
					if(this._tbsAoeSprites.length > 0) {
						this._tbsAoeSprites = [];
						$gameTemp.setShouldClearTbsAoeSprites(true);
					}
				}
				if(prevMode === "cancelMove") {
					this.clearTbsAoeSprites();
					this._tbsSelectedActor.movedThisRound = false;
					this._tbsCancelMoveJustEnded = true;
					if(this._tbsAoeSprites.length > 0) {
						this._tbsAoeSprites = [];
						$gameTemp.setShouldClearTbsAoeSprites(true);
					}
				}
				if(prevMode === "actionBattleScene" || prevMode === "passTurn" || prevMode === "postActionMove") {
					this.tbsNextTurn();
				}
				break;
			case "passTurn":
				this._tbsShouldPass = true;
				break;
			case "survey":
				this.clearTbsRangeSprites();
				$gamePlayer.setTbsShowCursor(true);
				break;
			case "manualMove":
				//$gameTemp.setShouldClearTbsDamageSprites(true);
				if(this.currentForce().isParty) {
					$gamePlayer.setCursorMoveField(this._tbsMoveTiles);
					this.spawnTbsLOSSprites();
				} else {
					$gamePlayer.clearCursorMoveField();
				}
				if(this._tbsManualMoveStartX === -1) {
					var chara = this._tbsSelectedActor.chara;
					this.setTbsManualMoveStart(chara.x, chara.y);
				}
				$gamePlayer.setTbsShowCursor(true);
				this._tbsManualMoveStarted = true;
				this._tbsSelectedActorWasMoving = false;
				this._tbsAoeSprites = [];
				$gameTemp.setShouldClearTbsAoeSprites(true);
				break;
			case "cancelMove":
				//$gameTemp.setShouldClearTbsDamageSprites(true);
				$gamePlayer.setTbsFollowingCharacter(true);
				this.clearTbsAoeSprites();
				break;
			case "selectActionTarget":
				if(prevMode !== "manualTarget") {
					this.clearTbsRangeSprites();
				}
				$gamePlayer.setTbsShowCursor(true);
				if(this.currentForce().isParty) {
					this.clearTbsActionTargetPart();
				}
				break;
			case "manualTarget":
				$gamePlayer.setTbsShowCursor(true);
				this.clearTbsActionTargetPart();
				break;
			case "selectTargetPart":
				$gamePlayer.setTbsShowCursor(true);
				if(prevMode === "manualTarget") {
					this.setTbsActionTargetLocation($gamePlayer.x, $gamePlayer.y);
				}
				break;
			case "executeAction":
				//$gameTemp.setShouldClearTbsDamageSprites(true);
				$gamePlayer.setTbsShowCursor(true);
				this._tbsSelectedActor.canActThisRound = false;
				if(prevMode === "manualTarget") {
					this.setTbsActionTargetLocation($gamePlayer.x, $gamePlayer.y);
				}
				if(this.currentForce().isParty) {
					this.setBreadcrumbStage("allDone");
				}
				break;
			case "actionBattleScene":
				$gamePlayer.setTbsShowCursor(true);
				if(!this._tbsSelectedAction.skipBattleScene && this.isAnyTbsActionTargets(true)) {
					this._tbsInActionBattleScene = true;
				}
				var chara = this._tbsSelectedActor.chara;
				if(chara.x === this._tbsActionTargetLocationX && chara.y === this._tbsActionTargetLocationY) {
					chara.setDirection(2);
				} else {
					chara.turnTowardLocation(this._tbsActionTargetLocationX, this._tbsActionTargetLocationY);
				}
				break;
			case "postActionMove":
				$gamePlayer.setTbsShowCursor(true);
				$gamePlayer.setTbsFollowingCharacter(false);
				break;
			case "victory":
				this._tbsMoveTiles = [];
				this._tbsHalfMoveTiles = [];
				this._tbsFullMoveTiles = [];
				this._tbsActionsTiles = [];
				this.setTbsSelectedActor(undefined);
				this.clearTbsManualMoveStart();
				this.setTbsSelectedActionType(-1);
				this.setTbsSelectedAction(undefined, -1);
				this.clearTbsActionTargetLocation();
				this.clearTbsActionMoveDestination();
				this.clearTbsActionTargetPart();
				this.setBreadcrumbStage("none");
				this._tbsForces.forEach(function (tbsForce) {
					if(tbsForce.isParty) {
						tbsForce.actors.forEach(function (tbsActor) {
							if(tbsActor.suffixWindow) {
								tbsActor.suffixWindow.hide();
								tbsActor.suffixWindow.close();
								tbsActor.suffixWindow == undefined;
							}
							var battler = tbsActor.battler;
							if(battler.getDamage("core") >= battler.toughness()*2) {
								battler.setDamage("core", battler.toughness()*2-1);
							}
							battler.setStress(0);
							battler.setRoundBuffs(0);
							battler.clearTbsBuffs();
							battler.setDisplayName(undefined);
						});
					}
				});
				if(this._resetCameraAfterBattle) {
					this.clearCameraFocus(true, 5);
				}
				this.setTbsCursorFocus(this._tbsLeadCharacter.chara.x, this._tbsLeadCharacter.chara.y);
				this._tbsEnemyPreFadeoutTimer = this._tbsEnemyFadeoutTime;
				this._tbsEnemyFadeoutTimer = this._tbsEnemyFadeoutTime;
				break;
			case "gameOver":
				this._tbsForces.forEach(function (force) {
					force.actors.forEach(function (actor) {
						if(!actor.suffixWindow) { return; }
						actor.suffixWindow.hide();
						actor.suffixWindow.close();
						actor.suffixWindow == undefined;
					}, this)
				}, this);
				this._tbsMoveTiles = [];
				this._tbsHalfMoveTiles = [];
				this._tbsFullMoveTiles = [];
				this._tbsActionsTiles = [];
				this.setTbsSelectedActor(undefined);
				this.clearTbsManualMoveStart();
				this.setTbsSelectedActionType(-1);
				this.setTbsSelectedAction(undefined, -1);
				this.clearTbsActionTargetLocation();
				this.clearTbsActionMoveDestination();
				this.clearTbsActionTargetPart();
				this.setBreadcrumbStage("none");
				this._tbsForces = [];
				this._tbsOrderedForces = [];
				SceneManager.goto(Scene_Gameover);
				break;
			default:
				console.log("INVALID TURN MODE");
			}
			$gamePlayer.refresh();
		}
	};
	
	Game_Map.prototype.tbsNextTurn = function() {
		var anyActive = false;
		var i;
		for(i = 0; i < this._tbsForces.length; i++) {
			var curForce = this._tbsForces[i];
			var j;
			for(j = 0; j < curForce.actors.length; j++) {
				if(curForce.actors[j].canActThisRound) {
					anyActive = true;
					break;
				}
			}
			if(anyActive) { break; }
		}
		this._tbsShouldPass = false;
		
		if(anyActive) {
			var anyActiveInForce = false;
			while(!anyActiveInForce) {
				this.switchToNextForce();
				
				var curForce = this._tbsForces[this._tbsCurrentTurnForce];
				var j;
				for(j = 0; j < curForce.actors.length; j++) {
					if(curForce.actors[j].canActThisRound) {
						anyActiveInForce = true;
						break;
					}
				}
			}
			for(i = 0; i < this._tbsForces.length; i++) {
				var j;
				for(j = 0; j < this._tbsForces[i].actors.length; j++) {
					var battler = this._tbsForces[i].actors[j].battler;
					this._tbsForces[i].actors[j].canActThisRound = battler.isDown()
						? false : this._tbsForces[i].actors[j].canActThisRound;
				}
			}
		} else {
			for(i = 0; i < this._tbsForces.length; i++) {
				this._tbsForces[i].initiativeRoll = {};
				var j;
				for(j = 0; j < this._tbsForces[i].actors.length; j++) {
					var battler = this._tbsForces[i].actors[j].battler;
					this._tbsForces[i].actors[j].canActThisRound = !battler.isDown();
					this._tbsForces[i].actors[j].movedThisRound = false;
					this.stressFromDamage(battler);
					battler.tickTbsBuffs();
					
					this.rollInitiative(this._tbsForces[i].actors[j], this._tbsForces[i]);
				}
			}
			this.determineForceOrder();
			this._tbsRoundJustStarted = true;
		}
		
		this._tbsMoveTiles = [];
		this._tbsHalfMoveTiles = [];
		this._tbsFullMoveTiles = [];
		this._tbsActionsTiles = [];
		this.setTbsSelectedActor(undefined);
		this.clearTbsManualMoveStart();
		this.setTbsSelectedActionType(-1);
		this.setTbsSelectedAction(undefined, -1);
		this.clearTbsActionTargetLocation();
		this.clearTbsActionMoveDestination();
		this.clearTbsActionTargetPart();
		this.setBreadcrumbStage("none");
		this.clearTbsAoeSprites();
		
		this._tbsTurnJustStarted = true;
	};
	
	Game_Map.prototype.determineForceOrder = function() {
		this._tbsOrderedForces = [];
		this._tbsForces.forEach(function (force) {
			this._tbsOrderedForces.push(force);
		}, this);
		this._tbsOrderedForces.sort(function (a, b) {
			if(a.initiativeRoll.hits == b.initiativeRoll.hits) {
				if(a.initiativeRoll.bonuses == b.initiativeRoll.bonuses) {
					return Math.random() >= 0.5 ? 1 : -1;
				}
				return b.initiativeRoll.bonuses - a.initiativeRoll.bonuses;
			}
			return b.initiativeRoll.hits - a.initiativeRoll.hits;
		});
		this._tbsCurrentTurnForce = this._tbsOrderedForces[0].forceId;
	};
	
	Game_Map.prototype.switchToNextForce = function() {
		if(this._tbsMinorAction) {
			this._tbsMinorAction = false;
			return;
		}
		var i;
		for(i = 0; i < this._tbsOrderedForces.length; i++) {
			if(this._tbsOrderedForces[i].forceId == this._tbsCurrentTurnForce) {
				break;
			}
		}
		if(i >= this._tbsOrderedForces.length-1) {
			this._tbsCurrentTurnForce = this._tbsOrderedForces[0].forceId;
		} else {
			this._tbsCurrentTurnForce = this._tbsOrderedForces[i+1].forceId;
		}
	};
	
	Game_Map.prototype.isInActionBattleScene = function() {
		return this._tbsInActionBattleScene;
	};
	
	Game_Map.prototype.setInActionBattleScene = function(inActionBattleScene) {
		this._tbsInActionBattleScene = inActionBattleScene;
	};
	
	Game_Map.prototype.updateCharacters = function() {
		if(this._tbsBattleMode) {
			this._tbsForces.forEach(function (force) {
				force.actors.forEach(function (tbsActor) {
					var battler = tbsActor.battler;
					var isProne = battler.isDown();
					var characterName = "";
					var characterIndex = -1;
					if(isProne) {
						var proneRow = 0;
						if(tbsActor.isParty) {
							var actor = battler.actor();
							characterName = actor.tbsStats.proneName;
							characterIndex = actor.tbsStats.proneIndex;
							proneRow = actor.tbsStats.proneRow;
						} else {
							var enemy = battler.enemy();
							characterName = enemy.tbsStats.proneName;
							characterIndex = enemy.tbsStats.proneIndex;
							proneRow = enemy.tbsStats.proneRow;
						}
						tbsActor.chara.setDirection((proneRow + 1) * 2);
						tbsActor.chara.setPriorityType(0);
					} else {
						if(tbsActor.isParty) {
							characterName = battler.characterName();
							characterIndex = battler.characterIndex();
						} else {
							var enemy = battler.enemy();
							characterName = enemy.tbsStats.characterName;
							characterIndex = enemy.tbsStats.characterIndex;
						}
						tbsActor.chara.setPriorityType(1);
					}
					tbsActor.chara.setImage(characterName, characterIndex);
					tbsActor.chara.update();
				});
			});
			if(this._tbsAoeSprites) {
				this._tbsAoeSprites.forEach(function (sprite) {
					sprite.update();
				});
			}
		}
	};
	
	Game_Map.prototype.updateTbsBattle = function() {
		if(this._tbsBattleMode) {
			this.processQueuedActions();
			switch(this._tbsTurnMode) {
			case "setup":
				this.updateTbsSetup();
				break;
			case "selectActorActionType":
				this.updateTbsSelectActorActionType();
				//this.updateBattlerStatus();
				break;
			case "passTurn":
				this.updateTbsPassTurn();
				break;
			case "survey":
				this.updateTbsSurvey();
				//this.updateBattlerStatus();
				break;
			case "manualMove":
				this.updateTbsManualMove();
				break;
			case "cancelMove":
				this.updateTbsCancelMove();
				break;
			case "selectActionTarget":
				this.updateTbsSelectActionTarget();
				//this.updateBattlerStatus();
				break;
			case "manualTarget":
				this.updateTbsManualTarget();
				//this.updateBattlerStatus();
				break;
			case "selectTargetPart":
				this.updateTbsSelectTargetPart();
				//this.updateBattlerStatus();
				break;
			case "executeAction":
				this.updateTbsExecuteAction();
				break;
			case "actionBattleScene":
				this.updateTbsActionBattleScene();
				break;
			case "postActionMove":
				this.updateTbsPostActionMove();
				break;
			case "victory":
				this.updateTbsVictory();
				break;
			case "gameOver":
				this.updateTbsGameOver();
				break;
			}
		}
	};
	
	Game_Map.prototype.processQueuedActionsAtPositions = function() {
		if(this._queuedActionLoops >= this._queuedActionLimit || !this._tbsQueuedActionsAtPositions || this._tbsQueuedActionsAtPositions.length === 0) { return; }
		
		while(this._queuedActionLoops < this._queuedActionLimit) {
			var actionAtPosition = this._tbsQueuedActionsAtPositions.pop();
			var actionsAtPosition = [];
			actionsAtPosition.push(actionAtPosition);
			var longestRangedActionAtPos = undefined;
			var longestRangedActionAtPosIndex = -1;
			var longestRangedArcedActionAtPos = undefined;
			var longestRangedArcedActionAtPosIndex = -1;
			
			var i;
			for(i = this._tbsQueuedActionsAtPositions.length - 1; i >= 0; i--) {
				var curActionAtPosition = this._tbsQueuedActionsAtPositions[i];
				if(
					curActionAtPosition.x != actionAtPosition.x ||
					curActionAtPosition.y != actionAtPosition.y
				) {
					continue;
				}
				
				actionsAtPosition.push(curActionAtPosition);
				this._tbsQueuedActionsAtPositions.splice(i, 1);
				
				if(
					curActionAtPosition.actionRange.arcedTrajectory && 
					(
						longestRangedArcedActionAtPos == undefined ||
						(
							longestRangedArcedActionAtPos.actionRange.range + (longestRangedArcedActionAtPos.actionRange.ignoreUserRange ? 0 : longestRangedArcedActionAtPos.actionRange.baseRange) <
							curActionAtPosition.actionRange.range + (curActionAtPosition.actionRange.ignoreUserRange ? 0 : curActionAtPosition.actionRange.baseRange)
						)
					)
				) {
					longestRangedArcedActionAtPos = curActionAtPosition;
					longestRangedArcedActionAtPosIndex = actionsAtPosition.length-1;
				} else if (
					!curActionAtPosition.actionRange.arcedTrajectory && 
					(
						longestRangedActionAtPos == undefined ||
						(
							longestRangedActionAtPos.actionRange.range + (longestRangedActionAtPos.actionRange.ignoreUserRange ? 0 : longestRangedActionAtPos.actionRange.baseRange) <
							curActionAtPosition.actionRange.range + (curActionAtPosition.actionRange.ignoreUserRange ? 0 : curActionAtPosition.actionRange.baseRange)
						)
					)
				) {
					longestRangedActionAtPos = curActionAtPosition;
					longestRangedActionAtPosIndex = actionsAtPosition.length-1;
				}
			}
			
			if(longestRangedActionAtPos) {
				this.checkActionTiles(longestRangedActionAtPos.x, longestRangedActionAtPos.y, false, false, longestRangedActionAtPos.actionRange, longestRangedActionAtPos.actionTiles, true);
			}
			if(longestRangedArcedActionAtPos) {
				this.checkActionTiles(longestRangedArcedActionAtPos.x, longestRangedArcedActionAtPos.y, false, false, longestRangedArcedActionAtPos.actionRange, longestRangedArcedActionAtPos.actionTiles, true);
			}
			
			var actionAtPosIndex = 0;
			actionsAtPosition.forEach(function (curActionAtPosition) {
				if(
					(curActionAtPosition.actionRange.arcedTrajectory && actionAtPosIndex == longestRangedArcedActionAtPosIndex) ||
					(!curActionAtPosition.actionRange.arcedTrajectory && actionAtPosIndex == longestRangedActionAtPosIndex)
				) { actionAtPosIndex++; return; }
				
				var actionAtPosToCopy = curActionAtPosition.actionRange.arcedTrajectory ? longestRangedArcedActionAtPos : longestRangedActionAtPos;
				
				actionAtPosToCopy.actionTiles.forEach(function (tileToCopy) {
					if(
						this.actualDistance(actionAtPosToCopy.x, actionAtPosToCopy.y, tileToCopy.x, tileToCopy.y) <=
						curActionAtPosition.actionRange.range + (curActionAtPosition.actionRange.ignoreUserRange ? 0 : curActionAtPosition.actionRange.baseRange)
					) { curActionAtPosition.actionTiles.push(tileToCopy); }
				}, this);
				
				actionAtPosIndex++;
			}, this);
			
			if(this._tbsQueuedActionsAtPositions.length == 0) {
				break;
			}
		}
	};
	
	Game_Map.prototype.processQueuedActions = function() {
		this._queuedActionLoops = 0;
		if(!this._tbsSelectedActor || !this._tbsQueuedActions || this._tbsQueuedActions.length === 0) {
			this.processQueuedActionsAtPositions();
			return;
		}
		
		var actionIndex = 0;
		var longestRangedAction = undefined;
		var longestRangedActionIndex = -1;
		var longestRangedArcedAction = undefined;
		var longestRangedArcedActionIndex = -1;
		var chara = this._tbsSelectedActor.chara;
		
		this._tbsQueuedActions.forEach(function (actionInfo) {
			var action = actionInfo.action;
			var actionRange = this.getLargestActionRange(action);
			if(actionRange.arcedTrajectory) {
				if(longestRangedArcedAction == undefined) {
					longestRangedArcedAction = action;
					longestRangedArcedActionIndex = actionIndex;
				} else {
					var longestArcedActionRange = this.getLargestActionRange(longestRangedArcedAction);
					if(
						actionRange.range + (actionRange.ignoreUserRange ? 0 : actionRange.baseRange) >
						longestArcedActionRange.range + (longestArcedActionRange.ignoreUserRange ? 0 : longestArcedActionRange.baseRange)
					) {
						longestRangedArcedAction = action;
						longestRangedArcedActionIndex = actionIndex;
					}
				}
			} else {
				if(longestRangedAction == undefined) {
					longestRangedAction = action;
					longestRangedActionIndex = actionIndex;
				} else {
					var longestActionRange = this.getLargestActionRange(longestRangedAction);
					if(
						actionRange.range + (actionRange.ignoreUserRange ? 0 : actionRange.baseRange) >
						longestActionRange.range + (longestActionRange.ignoreUserRange ? 0 : longestActionRange.baseRange)
					) {
						longestRangedAction = action;
						longestRangedActionIndex = actionIndex;
					}
				}
			}
			actionIndex++;
		}, this);
		
		actionIndex = this._tbsQueuedActions-1;
		var longestActionRange = this.getLargestActionRange(longestRangedAction);
		var longestActionTiles = [];
		var longestArcedActionRange = this.getLargestActionRange(longestRangedArcedAction);
		var longestArcedActionTiles = [];
		if(longestRangedAction) {
			this.checkActionTiles(chara.x, chara.y, longestRangedAction.cantUseHalfMove, longestRangedAction.cantUseFullMove, longestActionRange, longestActionTiles);
		}
		if(longestRangedArcedAction) {
			this.checkActionTiles(chara.x, chara.y, longestRangedArcedAction.cantUseHalfMove, longestRangedArcedAction.cantUseFullMove, longestArcedActionRange, longestArcedActionTiles);
		}
		while(this._tbsQueuedActions.length > 0) {
			var actionInfo = this._tbsQueuedActions.pop();
			if(actionIndex == longestRangedActionIndex) {
				this._tbsActionsTiles[this._tbsActionsTiles.length] = longestActionTiles;
				actionIndex--;
				return;
			}
			if(actionIndex == longestRangedArcedActionIndex) {
				this._tbsActionsTiles[this._tbsActionsTiles.length] = longestArcedActionTiles;
				actionIndex--;
				return;
			}
			var action = actionInfo.action;
			var actionRange = this.getLargestActionRange(action);
			var totalRange = actionRange.range + (actionRange.ignoreUserRange ? 0 : actionRange.baseRange);
			
			var tilesToCopy = actionRange.arcedTrajectory ? longestArcedActionTiles : longestActionTiles;
			
			var actionTiles = [];
			tilesToCopy.forEach(function (longestTile) {
				if(this.actualDistance(chara.x, chara.y, longestTile.x, longestTile.y) <= totalRange) {
					actionTiles.push(longestTile);
				}
			}, this);
			this._tbsActionsTiles[this._tbsActionsTiles.length] = actionTiles;
			if(!this._tbsSelectedActor.movedThisRound) {
				var moveTiles = this._tbsMoveTiles;
				if(longestRangedAction.cantUseHalfMove) {
					moveTiles = this._tbsFullMoveTiles;
				} else if(longestRangedAction.cantUseFullMove) {
					moveTiles = this._tbsHalfMoveTiles;
				}
				moveTiles.forEach(function (moveTile) {
					if(!this.getTbsActorAtPosition(moveTile.x, moveTile.y)) {
						var actionAtPosition = {};
						actionAtPosition.x = moveTile.x;
						actionAtPosition.y = moveTile.y;
						actionAtPosition.actionRange = actionRange;
						actionAtPosition.actionTiles = actionTiles;
						this._tbsQueuedActionsAtPositions.push(actionAtPosition);
					}
				},this);
			}
			
			actionIndex--;
		}
		
		this.processQueuedActionsAtPositions();
	};
	
	Game_Map.prototype.updateBattlerStatus = function() {
		if(this.tbsCursorIsFocusing() || $gamePlayer.isMoving()) {
			$gameTemp.setShouldClearTbsDamageSprites(true);
			return;
		}
		if($gameTemp.isFreeToMakeDamageSprites()) {
			var focusedActor = this.getTbsActorAtPosition($gamePlayer.x, $gamePlayer.y);
			if(!focusedActor) { return; }
			var battler = focusedActor.battler;
			var chara = focusedActor.chara;
			$gameTemp.addTbsDamageSprite(chara.x-1, chara.y-1, 'upperLeft', battler.getDamage('rightArm'));
			$gameTemp.addTbsDamageSprite(chara.x+1, chara.y-1, 'upperRight', battler.getDamage('leftArm'));
			$gameTemp.addTbsDamageSprite(chara.x-1, chara.y+1, 'lowerLeft', battler.getDamage('rightLeg'));
			$gameTemp.addTbsDamageSprite(chara.x+1, chara.y+1, 'lowerRight', battler.getDamage('leftLeg'));
		}
	};
	
	Game_Map.prototype.updateTbsSetup = function() {
		var nobodyMoved = true;
		this._tbsForces.forEach(function (force) {
			if(force.isParty) {
				force.actors.forEach(function (actor) {
					if(actor.chara.isMoving() || actor.chara.x !== actor.startingX || actor.chara.y !== actor.startingY) {
						nobodyMoved = false;
						if(!actor.chara.isMoving()) {
							direction = actor.chara.findDirectionTo(actor.startingX, actor.startingY, actor.battler.isFlying() ? "fly" : undefined);
							actor.chara.moveStraight(direction, actor.battler.isFlying() ? "fly" : undefined);
						}
					}
				});
			}
		});
		if(nobodyMoved) {
			this._tbsForces.forEach(function (force) {
				if(force.isParty) {
					force.actors.forEach(function (actor) {
						actor.chara.setDirection(2);
					});
				}
			});
			this.setTbsTurnMode("selectActorActionType");
		}
	};
	
	Game_Map.prototype.getRandomInt = function(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}
	
	Game_Map.prototype.updateTbsSelectActorActionType = function() {
		if(this._tbsSelectedActor) {
			this.setTbsCursorFocus(this._tbsSelectedActor.chara.x, this._tbsSelectedActor.chara.y);
		}
		this.focusTbsCursor();
		
		this.updateTbsMovementRangeField();
		if(!this.currentForce().isParty) {
			if(!this._tbsSelectedActor) {
				var actives = [];
				this.currentForce().actors.forEach(function (actor) {
					if(actor.canActThisRound) {
						var chances = 1;
						var stress = actor.battler.stress();
						if(stress >= 10) {
							chances = 4;
						} else if (stress >= 5) {
							chances = 2;
						}
						while(chances) {
							actives.push(actor);
							chances--;
						}
					}
				});
				this.setTbsSelectedActor(actives[this.getRandomInt(actives.length)]);
				this.setTbsCursorFocus(this._tbsSelectedActor.chara.x, this._tbsSelectedActor.chara.y);
				this.focusTbsCursor();
				this.setBreadcrumbStage("manualMove");
			}
			if(!this._tbsSelectedAction) {
				if(this._tbsActionsTiles.length === 0 
					&& this._tbsQueuedActions.length === 0 
					&& this._tbsQueuedActionsAtPositions.length === 0)
				{
					this.generateTbsActionFields();
				}
				if(this._tbsQueuedActions.length > 0 || this._tbsQueuedActionsAtPositions.length > 0) { return; }
				
				var defensePriority = 0;
				var stress = this._tbsSelectedActor.battler.stress();
				if(stress > 0) {
					var stressCompare = 1 - (stress / 10);
					if(Math.random() > stressCompare) {
						defensePriority = 6;
					}
				}
				
				var enemies = [];
				var curForce = this.currentForce();
				for(i = 0; i < this._tbsForces.length; i++) {
					if(curForce.enemyForceIds.indexOf(i) >= 0) {
						enemies = enemies.concat(this._tbsForces[i].actors);
					}
				}
				var noThreats = true;
				var closestEnemyDistance = -1;
				var chara = this._tbsSelectedActor.chara;
				for(i = 0; i < enemies.length; i++) {
					var enemy = enemies[i];
					var distance = this.actualDistance(enemy.chara.x, enemy.chara.y, chara.x, chara.y);
					if(closestEnemyDistance == -1 || distance < closestEnemyDistance) {
						closestEnemyDistance = distance;
					}
					if(noThreats && !enemy.battler.isDown() && this.tbsActorInLOSOfPositionType(enemy, chara.x, chara.y) !== "none") {
						noThreats = false;
					}
				}
				
				var actionInfos = this.getEnemyActionInfos();
				if(defensePriority == 0 && !noThreats && aiType === "tactical") {
					for(i = 0; i < actionInfos.length; i++) {
						if(actionInfos[i].action.returnToStart) {
							defensePriority = 4;
							break;
						}
					}
				}
				
				var actionsByPriority = [];
				
				var highestPriority = 0;
				var aiType = this._tbsSelectedActor.battler.aiType();
				if(!aiType) { aiType = "aggressive"; }
				var i;
				for(i = 0; i < actionInfos.length; i++) {
					var actionInfo = actionInfos[i];
					var action = actionInfo.action;
					if(action.returnToStart && !noThreats) {
						continue;
					}
					var priority = 0;
					if(action.name === "Rest") {
						priority = defensePriority;
					} else if(action.name.includes("Unarmed") || action.name === "Shove") {
						priority = 1;
					} else {
						priority = 2;
						var j = 0;
						var k = 0;
						for(j = 0; j < action.hitGroups.length; j++) {
							for(k = 0; k < action.hitGroups[j].hits.length; k++) {
								var rangeType = action.hitGroups[j].hits[k].rangeType;
								if(
									(rangeType === "melee" && aiType === "aggressive") ||
									(rangeType !== "melee" && aiType === "tactical")
								) {
									priority = 4;
									break;
								}
							}
							if(priority == 4) { break; }
						}
						if(action.returnToStart && noThreats) {
							priority++;
						}
					}
					if(priority > highestPriority) {
						highestPriority = priority;
					}
					if(!actionsByPriority[priority]) {
						actionsByPriority[priority] = [];
					}
					var actionByPriority = {};
					actionByPriority.actionInfo = actionInfo;
					actionByPriority.index = i;
					actionByPriority.selfTargetMoveType = "advance";
					if(
						defensePriority >= 6 ||
						(aiType === "tactical" &&
						closestEnemyDistance <= (this._tbsSelectedActor.battler.moveRange() / 2) * 1.5)
					) {
						actionByPriority.selfTargetMoveType = "retreat";
					} else if(
						aiType === "tactical" &&
						closestEnemyDistance > (this._tbsSelectedActor.battler.moveRange() / 2) * 1.5
					) {
						actionByPriority.selfTargetMoveType = "cover";
					}
					actionsByPriority[priority].push(actionByPriority);
				}
				
				for(i = highestPriority; i >= 0; i--) {
					var thisPrioritysActions = actionsByPriority[i];
					if(!thisPrioritysActions) { continue; }
					this.selectEnemyActionAndTarget(thisPrioritysActions);
					if(this._tbsSelectedAction) { break; }
				}
				
				if(this._tbsSelectedAction) {
					
				} else {
					console.log("NO ENEMY ACTION SELECTED");
				}
			}
			if(!this.tbsCursorIsFocusing()) {
				if(this._tbsCurEnemyWaitFrames === -1) {
					this._tbsCurEnemyWaitFrames = this._tbsEnemyWaitFrames;
				}
				if(this._tbsCurEnemyWaitFrames > 0) {
					this._tbsCurEnemyWaitFrames--;
				} else {
					this._tbsCurEnemyWaitFrames = -1;
					this.setTbsTurnMode("manualMove");
				}
			}
		}
	};
	
	Game_Map.prototype.selectEnemyActionAndTarget = function(actionsWithIndicies) {
		if(!actionsWithIndicies || actionsWithIndicies.length === 0) {
			return ;
		}
		var actionsWithTargets = [];
		var i;
		for(i = 0; i < actionsWithIndicies.length; i++) {
			var actionWithIndex = actionsWithIndicies[i];
			var actionInfo = actionWithIndex.actionInfo;
			var action = actionInfo.action;
			var actionIndex = actionWithIndex.index;
			var targets = [];
			var alliesAndEnemies = this.getCurrentActorAlliesAndEnemiesInRange(actionIndex);
			if(action.intendedTarget === "ally") {
				targets = alliesAndEnemies.allies;
			} else if(action.intendedTarget === "enemy") {
				targets = alliesAndEnemies.enemies.filter(function (enemy) { return !enemy.battler.isDown(); });
			}
			if(targets.length > 0) {
				var actionWithTargets = {};
				actionWithTargets.actionInfo = actionInfo;
				actionWithTargets.targets = targets;
				actionWithTargets.index = actionIndex;
				actionWithTargets.selfTargetMoveType = actionWithIndex.selfTargetMoveType;
				actionsWithTargets.push(actionWithTargets);
			}
		}
		
		if(actionsWithTargets.length > 0) {
			var randomActionIndex = this.getRandomInt(actionsWithTargets.length);
			var actionWithTargets = actionsWithTargets[randomActionIndex];
			this.setTbsSelectedAction(actionWithTargets.actionInfo, actionWithTargets.index);
			var randomTargetIndex = this.getRandomInt(actionWithTargets.targets.length);
			var finalTarget = actionWithTargets.targets[randomTargetIndex];
			this.setTbsActionTargetLocation(finalTarget.chara.x, finalTarget.chara.y);
			
			//TODO: set this to mobility for attacks designed to target mobility
			this.setTbsActionTargetPart("vital");
			
			if(finalTarget === this._tbsSelectedActor) {
				if(this._tbsSelectedActor.patient) {
					for(let m = 0; m < actionsWithTargets.length; m++) {
						if(actionsWithTargets[m].targets.length > 1 || actionsWithTargets[m].targets[0] !== this._tbsSelectedActor) {
							break;
						}
						return;
					}
				}
			
				var enemies = [];
				var curForce = this.currentForce();
				for(i = 0; i < this._tbsForces.length; i++) {
					if(curForce.enemyForceIds.indexOf(i) >= 0) {
						enemies = enemies.concat(this._tbsForces[i].actors);
					}
				}
				var chara = this._tbsSelectedActor.chara;
				if(
					actionWithTargets.selfTargetMoveType === "retreat" ||
					actionWithTargets.selfTargetMoveType === "cover"
				) {
					var bestCoveredTile = undefined;
					var closestEnemyDistanceForCover = -1;
					var bestFleeTile = undefined;
					var closestEnemyDistanceForFlee = -1;
					this._tbsMoveTiles.forEach(function (tile) {
						if((tile.x == chara.x && tile.y == chara.y) || !this.getTbsActorAtPosition(tile.x, tile.y)) {
							var threat = false;
							var closestEnemyDistanceForTile = -1;
							enemies.forEach(function (enemy) {
								var distance = this.actualDistance(enemy.chara.x, enemy.chara.y, tile.x, tile.y);
								if(closestEnemyDistanceForTile == -1 || closestEnemyDistanceForTile > distance) {
									closestEnemyDistanceForTile = distance;
								}
								if(
									!enemy.battler.isDown() &&
									this.tbsActorInLOSOfPositionType(enemy, tile.x, tile.y) !== "none"
								) {
									threat = true;
								}
							}, this);
							if(!threat && (
									closestEnemyDistanceForCover == -1 ||
									(actionWithTargets.selfTargetMoveType === "retreat" &&
									closestEnemyDistanceForCover < closestEnemyDistanceForTile) ||
									(actionWithTargets.selfTargetMoveType === "cover" &&
									closestEnemyDistanceForCover > closestEnemyDistanceForTile)
							)) {
								bestCoveredTile = tile;
								closestEnemyDistanceForCover = closestEnemyDistanceForTile;
							}
							if(
								closestEnemyDistanceForFlee == -1 ||
								(actionWithTargets.selfTargetMoveType === "retreat" &&
								closestEnemyDistanceForFlee < closestEnemyDistanceForTile) ||
								(actionWithTargets.selfTargetMoveType === "cover" &&
								closestEnemyDistanceForFlee > closestEnemyDistanceForTile)
							) {
								bestFleeTile = tile;
								closestEnemyDistanceForFlee = closestEnemyDistanceForTile;
							}
						}
					}, this);
					if(
						bestCoveredTile &&
						(actionWithTargets.selfTargetMoveType === "cover" ||
						closestEnemyDistanceForCover >= closestEnemyDistanceForFlee * 0.75)
					) {
						if(bestCoveredTile.x != chara.x || bestCoveredTile.y != chara.y) {
							this.setTbsActionTargetLocation(bestCoveredTile.x, bestCoveredTile.y);
						}
					} else if(bestFleeTile) {
						if(bestFleeTile.x != chara.x || bestFleeTile.y != chara.y) {
							this.setTbsActionTargetLocation(bestFleeTile.x, bestFleeTile.y);
						}
					}
				} else if(actionWithTargets.selfTargetMoveType === "advance") {
					var closestEnemy = undefined;
					var shortesetDistance = -1;
					enemies.forEach(function (enemy) {
						if(!enemy.battler.isDown()) {
							var distance = this.actualDistance(chara.x, chara.y, enemy.chara.x, enemy.chara.y);
							if(shortesetDistance === -1 || shortesetDistance > distance) {
								shortesetDistance = distance;
								closestEnemy = enemy;
							}
						}
					},this);
					if(closestEnemy) {
						var closestTile = undefined;
						shortesetDistance = -1;
						this._tbsMoveTiles.forEach(function (tile) {
							if(!this.getTbsActorAtPosition(tile.x, tile.y)) {
								var distanceTwo = this.actualDistance(tile.x, tile.y, closestEnemy.chara.x, closestEnemy.chara.y);
								if(shortesetDistance == -1 || shortesetDistance > distanceTwo) {
									shortesetDistance = distanceTwo;
									closestTile = tile;
								}
							}
						},this);
						if(closestTile) {
							this.setTbsActionTargetLocation(closestTile.x, closestTile.y);
						}
					}
				}
			}
		}
	};
	
	Game_Map.prototype.updateTbsMovementRangeField = function() {
		if($gameTemp.isFreeToMakeRangeTiles()) {
			this._tbsHalfMoveTiles.forEach(function (tile) {
				$gameTemp.addTbsRangeTile(tile.x, tile.y, 'yellow');
			});
			this._tbsFullMoveTiles.forEach(function (tile) {
				$gameTemp.addTbsRangeTile(tile.x, tile.y, 'white');
			});
		}
	};
	
	Game_Map.prototype.updateTbsPassTurn = function() {
		this.setTbsTurnMode("selectActorActionType");
	};
	
	Game_Map.prototype.updateTbsSurvey = function() {
		if(this.tbsCursorIsFocusing()) {
			this.focusTbsCursor();
			return;
		}
		$gamePlayer.setTbsCanMove(true);
		$gamePlayer.setTbsFollowingCharacter(false);
		$gamePlayer.clearCursorMoveField();
		$gamePlayer.setTbsShowCursor(true);
		$gamePlayer.clearMovingCharacter();
		$gamePlayer.refresh();
	};
	
	Game_Map.prototype.updateTbsManualMove = function() {
		if(this.tbsCursorIsFocusing()) {
			this.focusTbsCursor();
			return;
		}
		
		if(this._tbsManualMoveStarted) {
			this._tbsManualMoveStarted = false;
			if(this.currentForce().isParty) {
				$gamePlayer.setTbsCanMove(true);
				$gamePlayer.setTbsFollowingCharacter(false);
				$gamePlayer.setTbsShowCursor(false);
				$gamePlayer.setMovingCharacter(this._tbsSelectedActor.chara);
			} else {
				$gamePlayer.setTbsCanMove(false);
				$gamePlayer.setTbsFollowingCharacter(true);
				$gamePlayer.setTbsShowCursor(false);
				$gamePlayer.clearMovingCharacter();
			}
			$gamePlayer.refresh();
		}
		
		if(this.currentForce().isParty) {
			if(this._tbsSelectedActor.chara.isMoving()) {
				this._tbsSelectedActorWasMoving = true;
				return;
			}
			if(this._tbsSelectedActorWasMoving) {
				this._tbsSelectedActorWasMoving = false;
				this._tbsAoeSprites = [];
				$gameTemp.setShouldClearTbsAoeSprites(true);
				this.spawnTbsLOSSprites();
			}
		} else {
			if(this._tbsCurEnemyWaitFrames !== -1) {
				if(this._tbsCurEnemyWaitFrames > 0) {
					this._tbsCurEnemyWaitFrames--;
				} else {
					this._tbsCurEnemyWaitFrames = -1;
					this.clearTbsManualMoveStart();
					this.clearTbsRangeSprites();
					this._tbsSelectedActor.movedThisRound = true;
					this.setTbsTurnMode("selectActionTarget");
					this.setBreadcrumbStage("allDone");
					this.generateTbsActionFields();
				}
				return;
			}
			
			var chara = this._tbsSelectedActor.chara;
			if(chara.isMoving()) { return; }
			if(this._tbsActionMoveDestinationX === -1) {
				this.calculateMoveDestinationForAction();
			}
			if(this._tbsActionMoveDestinationX !== -1 && (this._tbsActionMoveDestinationX !== chara.x || this._tbsActionMoveDestinationY !== chara.y)) {
				var direction = chara.findDirectionTo(this._tbsActionMoveDestinationX, this._tbsActionMoveDestinationY, this._tbsSelectedActor.battler.isFlying() ? "fly" : undefined);
				chara.moveStraight(direction, this._tbsSelectedActor.battler.isFlying() ? "fly" : undefined);
				$gamePlayer.setNextFrameMoveDirection(direction);
				return;
			}
			this.clearTbsActionMoveDestination();
			this._tbsCurEnemyWaitFrames = this._tbsEnemyWaitFrames;
		}
	};
	
	Game_Map.prototype.tbsActorInLOSOfPositionType = function(tbsActor, x, y) {
		if(!tbsActor) { return "none"; }
		var chara = tbsActor.chara;
		if(x == chara.x && y == chara.y) { return "direct"; }
		if(!this.isTrajectoryObstructed(chara.x, chara.y, x, y, "thrown")) {
			return "direct";
		}
		return "none";
	};
	
	Game_Map.prototype.spawnTbsLOSSprites = function() {
		if(!this._tbsSelectedActor || this._tbsAoeSprites.length > 0) { return; }
		var chara = this._tbsSelectedActor.chara;
		this._tbsForces.forEach(function (force) {
			force.actors.forEach(function (actor) {
				if(actor.chara.x == chara.x && actor.chara.y == chara.y) { return; }
				var losType = this.tbsActorInLOSOfPositionType(this._tbsSelectedActor, actor.chara.x, actor.chara.y);
				if(losType !== "none") {
					this._tbsAoeSprites.push($gameTemp.addTbsAoeSprite(actor.chara.x, actor.chara.y, losType === "reach"));
				}
			}, this);
		}, this);
	};
	
	Game_Map.prototype.updateTbsCancelMove = function() {
		var chara = this._tbsSelectedActor.chara;
		if(chara.isMoving()
			|| chara.x !== this._tbsManualMoveStartX
			|| chara.y !== this._tbsManualMoveStartY) {
			if(!chara.isMoving()) {
				var direction = chara.findDirectionTo(this._tbsManualMoveStartX, this._tbsManualMoveStartY, this._tbsSelectedActor.battler.isFlying() ? "fly" : undefined);
				chara.moveStraight(direction, this._tbsSelectedActor.battler.isFlying() ? "fly" : undefined);
				$gamePlayer.setNextFrameMoveDirection(direction);
			}
			return;
		}
		this.clearTbsManualMoveStart();
		chara.setDirection(2);
		this.setTbsTurnMode("selectActorActionType");
	};
	
	Game_Map.prototype.updateTbsSelectActionTarget = function() {
		if(this._tbsQueuedActions.length > 0 || this._tbsQueuedActionsAtPositions.length > 0) {
			return;
		}
		this.updateTbsActionRangeField();
		if(this.currentForce().isParty && this._wasWaitingOnQueuedActions) {
			this._shouldOpenActionWindow = true;
		}
		this._wasWaitingOnQueuedActions = false;
		if(!this.currentForce().isParty) {
			if(this._tbsCurEnemyWaitFrames === -1) {
				this._tbsCurEnemyWaitFrames = this._tbsEnemyWaitFrames;
			}
			if(this._tbsCurEnemyWaitFrames > 0) {
				this._tbsCurEnemyWaitFrames--;
				return;
			} else {
				this._tbsSelectedActor.chara.turnTowardLocation(this._tbsActionTargetLocationX, this._tbsActionTargetLocationY);
				this._tbsCurEnemyWaitFrames = -1;
			}
		}
		
		if(this._tbsActionTargetLocationX !== -1) {
			this.setTbsCursorFocus(this._tbsActionTargetLocationX, this._tbsActionTargetLocationY);
		} else {
			this.setTbsCursorFocus(this._tbsSelectedActor.chara.x, this._tbsSelectedActor.chara.y);
		}
		this.focusTbsCursor();
		if(!this.currentForce().isParty) {
			this.setTbsTurnMode("executeAction");
		}
	};
	
	Game_Map.prototype.updateTbsActionRangeField = function() {
		if($gameTemp.isFreeToMakeRangeTiles()) {
			var actionTiles = this._tbsActionsTiles[this._tbsSelectedActionIndex];
			if(!actionTiles) { return; }
			actionTiles.forEach(function (tile) {
				if(this.getExistingTbsTile(tile.x, tile.y, $gameTemp.tbsRangeTilesToAdd())) { return; }
				$gameTemp.addTbsRangeTile(tile.x, tile.y, tile.centerMovePosition ? 'red' : 'white');
			},this);
		}
	};
	
	Game_Map.prototype.updateTbsManualTarget = function() {
		if(this.tbsCursorIsFocusing()) {
			this.focusTbsCursor();
			return;
		}
		if(this._tbsActionsTiles[this._tbsSelectedActionIndex]) {
			$gamePlayer.setTbsCanMove(true);
			$gamePlayer.setTbsFollowingCharacter(false);
			$gamePlayer.setTbsShowCursor(true);
			$gamePlayer.clearMovingCharacter();
			$gamePlayer.clearCursorMoveField();
			$gamePlayer.refresh();
		}
	};
	
	Game_Map.prototype.updateTbsSelectTargetPart = function() {
		if(this.tbsCursorIsFocusing()) {
			this.focusTbsCursor();
		}
	};
	
	Game_Map.prototype.updateTbsExecuteAction = function() {
		if(this.tbsCursorIsFocusing()) {
			this.focusTbsCursor();
			return;
		}
		
		if(!this.currentForce().isParty) {
			if(this._tbsCurEnemyWaitFrames === -1) {
				this._tbsCurEnemyWaitFrames = this._tbsEnemyWaitFrames;
			}
			if(this._tbsCurEnemyWaitFrames > 0) {
				this._tbsCurEnemyWaitFrames--;
			} else {
				this._tbsCurEnemyWaitFrames = -1;
				this.setTbsTurnMode("actionBattleScene");
			}
			return;
		}
		
		var chara = this._tbsSelectedActor.chara;
		if(chara.isMoving()) { return; }
		if(this._tbsActionMoveDestinationX === -1 && !this.isTargetInRangeFromPosition(chara.x, chara.y)) {
			this.calculateMoveDestinationForAction();
			this.setTbsCursorFocus(chara.x, chara.y);
			return;
		}
		if(this._tbsActionMoveDestinationX !== -1
			&& (this._tbsActionMoveDestinationX !== chara.x || this._tbsActionMoveDestinationY !== chara.y)) {
			$gamePlayer.setTbsFollowingCharacter(true);
			$gamePlayer.setTbsShowCursor(false);
			$gamePlayer.refresh();
			var direction = chara.findDirectionTo(this._tbsActionMoveDestinationX, this._tbsActionMoveDestinationY, this._tbsSelectedActor.battler.isFlying() ? "fly" : undefined);
			chara.moveStraight(direction, this._tbsSelectedActor.battler.isFlying() ? "fly" : undefined);
			$gamePlayer.setNextFrameMoveDirection(direction);
			return;
		}
		if(this._tbsActionMoveDestinationX !== -1) {
			$gamePlayer.setTbsFollowingCharacter(false);
			$gamePlayer.setTbsShowCursor(true);
			$gamePlayer.refresh();
			this.clearTbsActionMoveDestination();
			this.setTbsCursorFocus(this._tbsActionTargetLocationX, this._tbsActionTargetLocationY);
			return;
		}
		this.setTbsTurnMode("actionBattleScene");
	};
	
	Game_Map.prototype.isTargetInRangeFromPosition = function(x, y) {
		if(!this._tbsSelectedActor || !this._tbsSelectedAction || this._tbsActionTargetLocationX === -1) { return false; }
		if(x == this._tbsActionTargetLocationX && y == this._tbsActionTargetLocationY) { return true; }
		var actionRange = this.getLargestActionRange(this._tbsSelectedAction);
		var distance = this.actualDistance(x, y, this._tbsActionTargetLocationX, this._tbsActionTargetLocationY);
		if(distance > actionRange.range + (actionRange.ignoreUserRange ? 0 : actionRange.baseRange)) { return false; }
		return !this.isTrajectoryObstructed(x, y, this._tbsActionTargetLocationX, this._tbsActionTargetLocationY, actionRange.type, actionRange.arcedTrajectory);
	};
	
	Game_Map.prototype.calculateMoveDestinationForAction = function() {
		if(!this._tbsSelectedActor || !this._tbsSelectedAction || this._tbsActionTargetLocationX === -1) { return; }
		var furthestTile = undefined;
		var furthestDistance = -1;
		var chara = this._tbsSelectedActor.chara;
		var moveTiles = this._tbsMoveTiles;
		if(this._tbsSelectedAction.cantUseHalfMove) {
			moveTiles = this._tbsFullMoveTiles;
		} else if(this._tbsSelectedAction.cantUseFullMove) {
			moveTiles = this._tbsHalfMoveTiles;
		}
		moveTiles.forEach(function (moveTile) {
			if(
				(moveTile.x == chara.x && moveTile.y == chara.y ||
				!this.getTbsActorAtPosition(moveTile.x, moveTile.y)) &&
				this.isTargetInRangeFromPosition(moveTile.x, moveTile.y)
			) {
				var distance = this.actualDistance(
					moveTile.x,
					moveTile.y,
					this._tbsActionTargetLocationX,
					this._tbsActionTargetLocationY
				);
				if(!furthestTile || furthestDistance < distance) {
					furthestTile = moveTile;
					furthestDistance = distance;
				}
			}
		}, this);
		if(furthestTile) {
			this.setTbsActionMoveDestination(furthestTile.x, furthestTile.y);
		}
	};
	
	Game_Map.prototype.actualDistance = function(x1, y1, x2, y2) {
		var dX = x1 - x2;
		var dY = y1 - y2;
		var dXsq = dX * dX;
		var dYsq = dY * dY;
		return Math.sqrt(dXsq + dYsq);
	};
	
	Game_Map.prototype.updateTbsActionBattleScene = function() {
		if(this._tbsInActionBattleScene) { return; }
		if(this._tbsCurAfterBtlScnFrames === -1) {
			var noTargets = !this.isAnyTbsActionTargets(true);
			this._tbsCurAfterBtlScnFrames = this._tbsAfterBtlScnFrames * (noTargets ? 2 : 1);
			if(noTargets) {
				SoundManager.playBuzzer();
			}
			return;
		} else {
			this._tbsCurAfterBtlScnFrames--;
			if(this._tbsCurAfterBtlScnFrames > 0) {
				return;
			}
		}
		this._tbsCurAfterBtlScnFrames = -1;
		if(this._tbsSelectedAction.skipBattleScene || !this.isAnyTbsActionTargets(true)) {
			var tbsTargets = this.getTbsActionTargets();
			var tbsTargetsByHit = this.getTbsActionTargetsByHit();
			if(tbsTargets.length > 0) {
				BattleManager.initMembers();
				var subjectRoundBuffs = 0;
				var nonSkippedTargets = [];
				tbsTargets.forEach(function (tbsTarget) {
					var index = 0;
					var processedHitGroups = BattleManager.processHitGroups(this._tbsSelectedActionInfo.action.hitGroups);
					processedHitGroups.forEach(function (processedHitGroup) {
						var rangedDistance = this.getRangedDistance();
						var results = BattleManager.combatMath(this._tbsSelectedActor.battler, this._tbsSelectedActionInfo, processedHitGroup, tbsTarget.battler, tbsTargetsByHit, index, undefined, rangedDistance);
						if(!results.skipTarget) {
							nonSkippedTargets.push(tbsTarget);
							BattleManager.applyActionResults(results, this._tbsSelectedActor.battler, tbsTarget.battler);
						}
						subjectRoundBuffs += results.subjectRoundBuffs;
						index++;
					},this);
				},this);
				nonSkippedTargets.forEach(function (tbsTarget) {
					tbsTarget.battler.setRoundBuffs(0);
				});
				this._tbsSelectedActor.battler.setRoundBuffs(subjectRoundBuffs);
			}
		}
		if(this.isAnyTbsActionTargets(false)) {
			this.getTbsActionTargets().forEach(function (tbsTarget) {
				if(tbsTarget.canActThisRound && tbsTarget.battler.isDown()) {
					tbsTarget.canActThisRound = false;
				}
			});
		}
		this._tbsMinorAction = this._tbsSelectedAction.minorAction;
		
		var enemyForceIds = [];
		var partyAndAlliesIds = [];
		var i;
		for(i = 0; i < this._tbsForces.length; i++) {
			var tbsForce = this._tbsForces[i];
			if(tbsForce.isParty) {
				partyAndAlliesIds.push(i);
				tbsForce.enemyForceIds.forEach(function (enemyForceId) {
					if(enemyForceIds.indexOf(enemyForceId) === -1) {
						enemyForceIds.push(enemyForceId);
					}
				});
			}
		}
		for(i = 0; i < this._tbsForces.length; i++) {
			if(partyAndAlliesIds.indexOf(i) >= 0) { continue; }
			var tbsForce = this._tbsForces[i];
			var sameEnemies = true;
			var j;
			for(j = 0; j < enemyForceIds.length; j++) {
				var enemyForceId = enemyForceIds[j];
				if(tbsForce.enemyForceIds.indexOf(enemyForceId) === -1) {
					sameEnemies = false;
					break;
				}
			}
			if(sameEnemies) {
				partyAndAlliesIds.push(i);
			}
		}
		var partyAndAlliesAllDown = true;
		for(i = 0; i < partyAndAlliesIds.length; i++) {
			var allyForceId = partyAndAlliesIds[i];
			var allyForce = this._tbsForces[allyForceId];
			var j;
			for(j = 0; j < allyForce.actors.length; j++) {
				var tbsActor = allyForce.actors[j];
				if(!tbsActor.battler.isDown()) {
					partyAndAlliesAllDown = false;
					break;
				}
			}
			if(!partyAndAlliesAllDown) {
				break;
			}
		}
		if(partyAndAlliesAllDown) {
			this.setTbsTurnMode("gameOver");
			return;
		}
		
		var enemiesAllDown = true;
		for(i = 0; i < enemyForceIds.length; i++) {
			var enemyForceId = enemyForceIds[i];
			var enemyForce = this._tbsForces[enemyForceId];
			var j;
			for(j = 0; j < enemyForce.actors.length; j++) {
				var tbsActor = enemyForce.actors[j];
				if(!tbsActor.battler.isDown()) {
					enemiesAllDown = false;
					break;
				}
			}
			if(!enemiesAllDown) {
				break;
			}
		}
		if(enemiesAllDown) {
			this.setTbsTurnMode("victory");
			return;
		}
		
		if(this._tbsSelectedAction.returnToStart && !this._tbsSelectedActor.battler.isDown()) {
			this.setTbsCursorFocus(this._tbsSelectedActor.chara.x, this._tbsSelectedActor.chara.y);
			this.setTbsManualMoveStart(this._tbsMoveTiles[0].x, this._tbsMoveTiles[0].y);
			this.setTbsTurnMode("postActionMove");
		} else {
			this.setTbsTurnMode("selectActorActionType");
		}
	};
	
	Game_Map.prototype.updateTbsPostActionMove = function() {
		if(this.tbsCursorIsFocusing()) {
			this.focusTbsCursor();
			return;
		}
		$gamePlayer.setTbsShowCursor(false);
		$gamePlayer.setTbsFollowingCharacter(true);
		$gamePlayer.refresh();
		var chara = this._tbsSelectedActor.chara;
		if(chara.isMoving()
			|| chara.x !== this._tbsManualMoveStartX
			|| chara.y !== this._tbsManualMoveStartY) {
			if(!chara.isMoving()) {
				var direction = chara.findDirectionTo(this._tbsManualMoveStartX, this._tbsManualMoveStartY, this._tbsSelectedActor.battler.isFlying() ? "fly" : undefined);
				chara.moveStraight(direction, this._tbsSelectedActor.battler.isFlying() ? "fly" : undefined);
				$gamePlayer.setNextFrameMoveDirection(direction);
			}
			return;
		}
		$gamePlayer.setTbsShowCursor(true);
		$gamePlayer.setTbsFollowingCharacter(false);
		$gamePlayer.refresh();
		this.clearTbsManualMoveStart();
		chara.setDirection(2);
		this.setTbsTurnMode("selectActorActionType");
	};
	
	Game_Map.prototype.updateTbsVictory = function() {
		if(this._tbsEnemyPreFadeoutTimer > 0) {
			this._tbsEnemyPreFadeoutTimer--;
			if(this._tbsEnemyPreFadeoutTimer <= 0) {
				SoundManager.playEnemyCollapse();
			}
			return;
		}
		if(this._tbsEnemyFadeoutTimer > 0) {
			this._tbsEnemyFadeoutTimer--;
			this._tbsForces.forEach(function (force) {
				if(!force.isParty) {
					force.actors.forEach(function (actor) {
						if(!actor.battler.isDown()) { return; }
						actor.chara.setOpacity((this._tbsEnemyFadeoutTimer/this._tbsEnemyFadeoutTime)*255);
					}, this);
				}
			}, this);
			return;
		}
		if(this.tbsCursorIsFocusing()) {
			this.focusTbsCursor();
			return;
		}
		var leadChara = this._tbsLeadCharacter.chara;
		var nobodyMoved = true;
		this._tbsForces.forEach(function (force) {
			if(force.isParty) {
				force.actors.forEach(function (actor) {
					if(actor.chara.isMoving() || actor.chara.x !== leadChara.x || actor.chara.y !== leadChara.y) {
						nobodyMoved = false;
						if(!actor.chara.isMoving()) {
							direction = actor.chara.findDirectionTo(leadChara.x, leadChara.y, actor.battler.isFlying() ? "fly" : undefined);
							actor.chara.moveStraight(direction, actor.battler.isFlying() ? "fly" : undefined);
						}
					}
				});
			}
		});
		if(nobodyMoved) {
			this._tbsForces = [];
			this._tbsOrderedForces = [];
			this._tbsLeadCharacter = undefined;
			$gamePlayer.setDirection(2);
			$gamePlayer.followers().forEach(function (follower) {
				follower.locate($gamePlayer.x, $gamePlayer.y);
				follower.setDirection(2);
			});
			this.replayBgmAndBgs();
			this.setTbsBattleMode(false);
		}
	};
	
	Game_Map.prototype.updateTbsGameOver = function() {
		
	};
	
	Game_Map.prototype.generateTbsMoveField = function() {
		var tbsActor = this._tbsSelectedActor;
		this._tbsMoveTiles = [];
		this._tbsHalfMoveTiles = [];
		this._tbsFullMoveTiles = [];
		if(!tbsActor || !tbsActor.canActThisRound || tbsActor.movedThisRound) { return; }
		var moveRange = Math.max(1, tbsActor.battler.moveRange() / 2);
		var moveType = (tbsActor.battler.limbsType() === "winged" && tbsActor.battler.isFlying()) ? "fly" : "walk";
		this.checkMoveTile(tbsActor.chara.x, tbsActor.chara.y, moveRange, this._tbsMoveTiles, moveType);
		this._tbsMoveTiles.forEach(function (moveTile) {
			if(moveRange - moveTile.remainingRange <= moveRange/2) {
				this._tbsHalfMoveTiles.push(moveTile);
			} else {
				this._tbsFullMoveTiles.push(moveTile);
			}
		}, this);
	};
	
	Game_Map.prototype.checkMoveTile = function(x, y, remainingRange, moveTiles, moveType) {
		var existingMoveTile = this.getExistingTbsTile(x, y, moveTiles);
		if(!existingMoveTile) {
			var newTile = {};
			newTile.x = x;
			newTile.y = y;
			newTile.remainingRange = remainingRange;
			moveTiles.push(newTile);
		} else {
			if(existingMoveTile.remainingRange < remainingRange) {
				existingMoveTile.remainingRange = remainingRange;
			} else {
				return;
			}
		}
		if(remainingRange < 1) { return; }
		
		var potentialTiles = [];
		var checkRadius = Math.ceil(remainingRange);
		var curY = y-checkRadius;
		for(; curY <= y+checkRadius; curY++){
			var curX = x-checkRadius;
			for(; curX <= x+checkRadius; curX++){
				if(this.tbsCursorRegions().length > 0 && this.tbsCursorRegions().indexOf(this.regionId(curX, curY)) < 0) { continue; }
				if((curX == x && curY == y) || curX < 0 || curY < 0 || curX >= this.width || curY >= this.height) { continue; }
				var distance = this.actualDistance(x, y, curX, curY);
				if(distance > remainingRange) { continue; }
				if(!this.isTrajectoryObstructed(x, y, curX, curY, moveType)) {
					var tile = {};
					tile.x = curX;
					tile.y = curY;
					potentialTiles.push(tile);
				}
			}
		}
		
		var reachedTiles = [];
		this.findReachableMoveTiles(x-1, y, potentialTiles, reachedTiles);
		this.findReachableMoveTiles(x+1, y, potentialTiles, reachedTiles);
		this.findReachableMoveTiles(x, y-1, potentialTiles, reachedTiles);
		this.findReachableMoveTiles(x, y+1, potentialTiles, reachedTiles);
		
		reachedTiles.forEach(function (tile) {
			var distance = this.actualDistance(x, y, tile.x, tile.y);
			this.checkMoveTile(tile.x, tile.y, remainingRange - distance, moveTiles, moveType);
		}, this);
	};
	
	Game_Map.prototype.findReachableMoveTiles = function(x, y, potentialTiles, reachedTiles) {
		if(this.getExistingTbsTile(x, y, reachedTiles)) { return; }
		var potentialTile = this.getExistingTbsTile(x, y, potentialTiles);
		if(potentialTile) {
			reachedTiles.push(potentialTile);
			this.findReachableMoveTiles(x-1, y, potentialTiles, reachedTiles);
			this.findReachableMoveTiles(x+1, y, potentialTiles, reachedTiles);
			this.findReachableMoveTiles(x, y-1, potentialTiles, reachedTiles);
			this.findReachableMoveTiles(x, y+1, potentialTiles, reachedTiles);
		}
	};
	
	Game_Map.prototype.getExistingTbsTile = function(x, y, tiles) {
		var existingTile = undefined;
		var i;
		for(i = 0; i < tiles.length; i++) {
			this._queuedActionLoops++;
			var tile = tiles[i];
			if(tile.x === x && tile.y === y) {
				existingTile = tiles[i];
				break;
			}
		}
		return existingTile;
	};
	
	Game_Map.prototype.getTbsActorAtPosition = function(x, y, forManualMove) {
		var returnActor = undefined;
		var i;
		for(i = 0; i < this._tbsForces.length; i++) {
			var force = this._tbsForces[i];
			var j;
			for(j = 0; j < force.actors.length; j++) {
				this._queuedActionLoops++;
				var actor = force.actors[j];
				if(forManualMove && actor === this._tbsSelectedActor) { continue; }
				if(actor.chara.x === x && actor.chara.y === y) {
					returnActor = actor;
					break;
				}
			}
			if(returnActor) { break; }
		}
		return returnActor;
	};
	
	Game_Map.prototype.tbsCurrentPositionIsFullMove = function() {
		if(!this._tbsSelectedActor || !this._tbsMoveTiles || this._tbsMoveTiles.length <= 0)
		{
			return false;
		}
		var tbsActor = this._tbsSelectedActor;
		var moveTile = this.getExistingTbsTile(
			tbsActor.chara.x,
			tbsActor.chara.y,
			this._tbsFullMoveTiles
		);
		return !!moveTile;
	};
	
	Game_Map.prototype.tbsCurrentPositionIsHalfMove = function() {
		if(!this._tbsSelectedActor || !this._tbsMoveTiles || this._tbsMoveTiles.length <= 0)
		{
			return false;
		}
		var tbsActor = this._tbsSelectedActor;
		var moveTile = this.getExistingTbsTile(
			tbsActor.chara.x,
			tbsActor.chara.y,
			this._tbsHalfMoveTiles
		);
		return !!moveTile;
	};
	
	Game_Map.prototype.directionIsDiagonal = function(d) {
		return d === 7 || d === 9 || d === 1 || d === 3;
	};
	
	Game_Map.prototype.clearTbsRangeSprites = function() {
		$gameTemp.setShouldClearTbsRangeTiles(true);
	};
	
	Game_Map.prototype.generateTbsActionFields = function() {
		this._tbsActionsTiles = [];
		this._tbsQueuedActions = [];
		this._tbsQueuedActionsAtPositions = [];
		if(!this._tbsSelectedActor) { return; }
		if(this._tbsSelectedActor.isParty) {
			this._tbsQueuedActions = this.getPartyActionInfos().reverse();
		} else {
			this._tbsQueuedActions = this.getEnemyActionInfos().reverse();
		}
		if(this._tbsQueuedActions.length > 0) {
			this._wasWaitingOnQueuedActions = true;
		}
	};
	
	Game_Map.prototype.getPartyActionInfos = function() {
		var actionInfos = [];
		if(this._tbsSelectedActionType === -1) { return actionInfos; }
		var actionType = "";
		switch(this._tbsSelectedActionType) {
			case 1:
				actionType = "attack";
				break;
			case 2:
				actionType = "technique";
				break;
			case 3:
				actionType = "defense";
				break;
			case 4:
				actionType = "item";
				break;
			default:
				return actionInfos;
		}
		
		var battler = this._tbsSelectedActor.battler;
		
		var equipActionInfos = battler.getAllEquipActionInfos();
		var i;
		for(i = 0; i < equipActionInfos.length; i++) {
			if(equipActionInfos[i].action.type === actionType) {
				actionInfos.push(equipActionInfos[i]);
			}
		}
		var skills = battler.skills();
		for(i = 0; i < skills.length; i++) {
			if(skills[i].tbsStats.action && skills[i].tbsStats.action.type === actionType) {
				var actionInfo = {};
				actionInfo.action = skills[i].tbsStats.action;
				actionInfo.canTargetBodyPart = false;
				actionInfo.canTargetDownedBodyPart = false;
				if(skills[i].tbsStats.action.hitGroups && skills[i].tbsStats.action.hitGroups.length > 0) {
					skills[i].tbsStats.action.hitGroups.forEach(function (hitGroup) {
						if(!hitGroup.hits || hitGroup.hits.length == 0) { return; }
						actionInfo.canTargetBodyPart = hitGroup.hits.some(function (hit) {
							if(hit.heal && hit.heal.damage !== undefined && hit.heal.damage > 0 && (hit.aoe === undefined || hit.aoe <= 0)) {
								return true;
							}
							return false;
						});
						actionInfo.canTargetDownedBodyPart = hitGroup.hits.some(function (hit) {
							if(hit.aoe === undefined || hit.aoe <= 0) {
								return true;
							}
							return false;
						});
					});
				}
				actionInfos.push(actionInfo);
			}
		}
		return actionInfos;
	};
	
	Game_Map.prototype.getEnemyActionInfos = function() {
		var battler = this._tbsSelectedActor.battler;
			
		var actionInfos = battler.getAllEquipActionInfos();
		battler.skills().forEach(function (skill) {
			var actionInfo = {};
			actionInfo.action = skill.tbsStats.action;
			actionInfos.push(actionInfo);
			actionInfo.canTargetBodyPart = false;
			actionInfo.canTargetDownedBodyPart = false;
			if(skill.tbsStats.action.hitGroups && skill.tbsStats.action.hitGroups.length > 0) {
				skill.tbsStats.action.hitGroups.forEach(function (hitGroup) {
					if(!hitGroup.hits || hitGroup.hits.length == 0) { return; }
					actionInfo.canTargetBodyPart = hitGroup.hits.some(function (hit) {
						if(hit.heal && hit.heal.damage !== undefined && hit.heal.damage > 0 && (hit.aoe === undefined || hit.aoe <= 0)) {
							return true;
						}
						return false;
					});
					actionInfo.canTargetDownedBodyPart = hitGroup.hits.some(function (hit) {
						if(hit.aoe === undefined || hit.aoe <= 0) {
							return true;
						}
						return false;
					});
				});
			}
		});
		return actionInfos;
	};
	
	Game_Map.prototype.getCurrentActorAlliesAndEnemiesInRange = function(actionIndex) {
		var allies = [];
		var enemies = [];
		var alliesAndEnemies = {};
		alliesAndEnemies.allies = allies;
		alliesAndEnemies.enemies = enemies;
		if(!this._tbsSelectedActor) { return alliesAndEnemies; }
		var force = this._tbsForces[this._tbsSelectedActor.forceId];
		var actionTiles = this._tbsActionsTiles[actionIndex];
		if(!actionTiles) { return alliesAndEnemies; }
		actionTiles.forEach(function (tile) {
			var tbsActor = this.getTbsActorAtPosition(tile.x, tile.y);
			if(!tbsActor) { return; }
			if(force.enemyForceIds.indexOf(tbsActor.forceId) >= 0) {
				this.insertOrderedByForce(tbsActor, enemies);
			} else {
				this.insertOrderedByForce(tbsActor, allies);
			}
		},this);
		return alliesAndEnemies;
	};
	
	Game_Map.prototype.insertOrderedByForce = function(tbsActor, tbsActors) {
		if(tbsActors.length === 0) {
			tbsActors.push(tbsActor);
			return;
		}
		var inserted = false;
		var i;
		for(i = 0; i < tbsActors.length; i++) {
			if(tbsActors[i].forceId > tbsActor.forceId
				|| (tbsActors[i].forceId === tbsActor.forceId && tbsActors[i].orderNum > tbsActor.orderNum)) {
				tbsActors.splice(i, 0, tbsActor);
				inserted = true;
				break;
			}
		}
		if(!inserted) {
			tbsActors.push(tbsActor);
		}
	};
	
	Game_Map.prototype.getLargestActionRange = function(action) {
		var largestActionRange = {};
		var rangeFound = false;
		largestActionRange.range = 0;
		largestActionRange.type = "air";
		largestActionRange.ignoreUserRange = false;
		largestActionRange.arcedTrajectory = false;
		var battlerBaseRange = this._tbsSelectedActor.battler.baseRange();
		battlerBaseRange = battlerBaseRange < 2 ? 2 : battlerBaseRange;
		largestActionRange.baseRange = battlerBaseRange / 2;
		if(action && action.hitGroups && action.hitGroups.length > 0) {
			action.hitGroups.forEach(function (hitGroup) {
				if(hitGroup.hits && hitGroup.hits.length > 0) {
					hitGroup.hits.forEach(function (hit) {
						this._queuedActionLoops++;
						if(hit.rangeType && hit.rangeType === "followUp") { return; }
						var hitRange = hit.range !== undefined ? hit.range : 0;
						if(!rangeFound || hitRange > largestActionRange.range) {
							rangeFound = true;
							largestActionRange.range = hitRange;
							largestActionRange.type = hit.rangeType;
							largestActionRange.ignoreUserRange = hit.ignoreUserRange;
							largestActionRange.arcedTrajectory = hit.arcedTrajectory;
						}
					},this);
				}
			},this);
		}
		largestActionRange.range /= 2;
		return largestActionRange;
	};
	
	Game_Map.prototype.getForceMembersInActors = function(actors, forceId) {
		var members = [];
		actors.forEach(function (actor) {
			if(actor.forceId === forceId) {
				members.push(actor);
			}
		});
		return members;
	};
	
	Game_Map.prototype.checkActionTiles = function(x, y, cantUseHalfMove, cantUseFullMove, actionRange, actionTiles, treatAsMovedThisRound) {
		this.getReachedActionTiles(
			x,
			y,
			actionRange.range + (actionRange.ignoreUserRange ? 0 : actionRange.baseRange),
			actionTiles,
			actionRange.type,
			!treatAsMovedThisRound,
			actionRange.arcedTrajectory
		);
		if(!treatAsMovedThisRound && !this._tbsSelectedActor.movedThisRound) {
			var moveTiles = this._tbsMoveTiles;
			if(cantUseHalfMove) {
				moveTiles = this._tbsFullMoveTiles;
			} else if(cantUseFullMove) {
				moveTiles = this._tbsHalfMoveTiles;
			}
			moveTiles.forEach(function (moveTile) {
				if(!this.getTbsActorAtPosition(moveTile.x, moveTile.y)) {
					var actionAtPosition = {};
					actionAtPosition.x = moveTile.x;
					actionAtPosition.y = moveTile.y;
					actionAtPosition.actionRange = actionRange;
					actionAtPosition.actionTiles = actionTiles;
					this._tbsQueuedActionsAtPositions.push(actionAtPosition);
				}
			},this);
		}
	};
	
	Game_Map.prototype.getReachedActionTiles = function(x, y, radius, actionTiles, passageType, centerMoveTile, arcedTrajectory) {
		var checkRadius = Math.ceil(radius);
		var curY = y-checkRadius;
		for(; curY <= y+checkRadius; curY++){
			var curX = x-checkRadius;
			for(; curX <= x+checkRadius; curX++){
				if(this.tbsCursorRegions().length > 0 && this.tbsCursorRegions().indexOf(this.regionId(curX, curY)) < 0) { continue; }
				if(curX < 0 || curY < 0 || curX >= this.width || curY >= this.height) { continue; }
				var distance = this.actualDistance(x, y, curX, curY);
				if(distance > radius || this.getExistingTbsTile(curX, curY, actionTiles)) { continue; }
				var tile = {};
				tile.x = curX;
				tile.y = curY;
				tile.centerMovePosition = centerMoveTile;
				if(!this.isTrajectoryObstructed(x, y, curX, curY, passageType, arcedTrajectory)) {
					actionTiles.push(tile);
				}
			}
		}
	};
	
	Game_Map.prototype.isTrajectoryObstructed = function(startX, startY, endX, endY, passageType, arcedTrajectory) {
		var d = 5;
		if(endX > startX) {
			if(endY > startY) {
				d = 3;
			} else if(endY < startY) {
				d = 9;
			} else {
				d = 6;
			}
		} else if(endX < startX) {
			if(endY > startY) {
				d = 1;
			} else if(endY < startY) {
				d = 7;
			} else {
				d = 4;
			}
		} else {
			if(endY > startY) {
				d = 2;
			} else if(endY < startY) {
				d = 8;
			}
		}
		
		if(d == 5) { return false; }
		
		var x0 = startX + 0.5;
		var y0 = startY + 0.5;
		var x1 = endX + 0.5;
		var y1 = endY + 0.5;
		
		var blockedByTerrain = {};
		blockedByTerrain.middle = false;
		blockedByTerrain.upperLeft = false;
		blockedByTerrain.upperRight = false;
		blockedByTerrain.lowerLeft = false;
		blockedByTerrain.lowerRight = false;
		var tileRuns = this._tileRuns;
		for(i = 0; i < tileRuns.length; i++) {
			this._queuedActionLoops++;
			var firstTile = tileRuns[i][0];
			var lastTile = tileRuns[i][tileRuns[i].length-1];
			var startAtEdge = false;
			var endAtEdge = false;
			if(d == 1) {
				if(firstTile.x == startX && lastTile.y == startY) {
					startAtEdge = true;
				}
				if(lastTile.x == endX && firstTile.y == endY) {
					endAtEdge = true;
				}
			} else if(d == 2) {
				if(lastTile.y == startY) {
					startAtEdge = true;
				}
				if(firstTile.y == endY) {
					endAtEdge = true;
				}
			} else if(d == 3) {
				if(lastTile.x == startX && lastTile.y == startY) {
					startAtEdge = true;
				}
				if(firstTile.x == endX && firstTile.y == endY) {
					endAtEdge = true;
				}
			} else if(d == 4) {
				if(firstTile.x == startX) {
					startAtEdge = true;
				}
				if(lastTile.x == endX) {
					endAtEdge = true;
				}
			} else if(d == 6) {
				if(lastTile.x == startX) {
					startAtEdge = true;
				}
				if(firstTile.x == endX) {
					endAtEdge = true;
				}
			} else if(d == 7) {
				if(firstTile.x == startX && firstTile.y == startY) {
					startAtEdge = true;
				}
				if(lastTile.x == endX && lastTile.y == endY) {
					endAtEdge = true;
				}
			} else if(d == 8) {
				if(firstTile.y == startY) {
					startAtEdge = true;
				}
				if(lastTile.y == endY) {
					endAtEdge = true;
				}
			} else if(d == 9) {
				if(lastTile.x == startX && firstTile.y == startY) {
					startAtEdge = true;
				}
				if(firstTile.x == endX && lastTile.y == endY) {
					endAtEdge = true;
				}
			}
			
			if(startAtEdge && endAtEdge) {
				//technically the start and end tiles would have to be one in the same, here
			} else if(startAtEdge) {
				if(firstTile.exitability[d][passageType]) { continue; }
			} else if(endAtEdge) {
				if(firstTile.enterability[d][passageType]) { continue; }
			} else {
				if(firstTile.exitability[d][passageType] && firstTile.enterability[d][passageType]) { continue; }
			}
			
			blockedByTerrain.middle = blockedByTerrain.middle ? true :
				this.cohenSutherlandLineClipAndDraw(x0, y0, x1, y1, firstTile.x, firstTile.y, lastTile.x+1, lastTile.y+1);
			blockedByTerrain.upperLeft = passageType == "walk" || passageType == "fly" || blockedByTerrain.upperLeft ? true :
				this.cohenSutherlandLineClipAndDraw(x0-0.49, y0-0.49, x1-0.49, y1-0.49, firstTile.x, firstTile.y, lastTile.x+1, lastTile.y+1);
			blockedByTerrain.upperRight = passageType == "walk" || passageType == "fly" || blockedByTerrain.upperRight ? true :
				this.cohenSutherlandLineClipAndDraw(x0+0.49, y0-0.49, x1+0.49, y1-0.49, firstTile.x, firstTile.y, lastTile.x+1, lastTile.y+1);
			blockedByTerrain.lowerLeft = passageType == "walk" || passageType == "fly" || blockedByTerrain.lowerLeft ? true :
				this.cohenSutherlandLineClipAndDraw(x0-0.49, y0+0.49, x1-0.49, y1+0.49, firstTile.x, firstTile.y, lastTile.x+1, lastTile.y+1);
			blockedByTerrain.lowerRight = passageType == "walk" || passageType == "fly" || blockedByTerrain.lowerRight ? true :
				this.cohenSutherlandLineClipAndDraw(x0+0.49, y0+0.49, x1+0.49, y1+0.49, firstTile.x, firstTile.y, lastTile.x+1, lastTile.y+1);
			
			if(
				blockedByTerrain.middle &&
				blockedByTerrain.upperLeft &&
				blockedByTerrain.upperRight &&
				blockedByTerrain.lowerLeft &&
				blockedByTerrain.lowerRight
			) {
				break;
			}
		}
		
		if(
			!blockedByTerrain.middle ||
			!blockedByTerrain.upperLeft ||
			!blockedByTerrain.upperRight ||
			!blockedByTerrain.lowerLeft ||
			!blockedByTerrain.lowerRight
		) {
			var i;
			for(i = 0; i < this._tbsForces.length; i++) {
				for(j = 0; j < this._tbsForces[i].actors.length; j++) {
					var chara = this._tbsForces[i].actors[j].chara;
					if((startX == chara.x && startY == chara.y)
						|| (passageType !== "walk" && passageType !== "fly" && 
							((endX == chara.x && endY == chara.y) || arcedTrajectory ||
							this._tbsForces[i].actors[j].battler.isShort()))
						|| this._tbsForces[i].actors[j].battler.isDown()
						|| (this._tbsSelectedActor && (passageType === "walk" || passageType === "fly")
							&& (this._tbsSelectedActor.forceId == i
								|| this._tbsForces[i].allyForceIds.indexOf(this._tbsSelectedActor.forceId) >= 0)))
					{
						continue;
					}
					
					blockedByTerrain.middle = blockedByTerrain.middle ? true :
						this.cohenSutherlandLineClipAndDraw(x0, y0, x1, y1, chara.x, chara.y, chara.x+1, chara.y+1);
					blockedByTerrain.upperLeft = passageType == "walk" || passageType == "fly" || blockedByTerrain.upperLeft ? true :
						this.cohenSutherlandLineClipAndDraw(x0-0.49, y0-0.49, x1-0.49, y1-0.49, chara.x, chara.y, chara.x+1, chara.y+1)
					blockedByTerrain.upperRight = passageType == "walk" || passageType == "fly" || blockedByTerrain.upperRight ? true :
						this.cohenSutherlandLineClipAndDraw(x0+0.49, y0-0.49, x1+0.49, y1-0.49, chara.x, chara.y, chara.x+1, chara.y+1)
					blockedByTerrain.lowerLeft = passageType == "walk" || passageType == "fly" || blockedByTerrain.lowerLeft ? true :
						this.cohenSutherlandLineClipAndDraw(x0-0.49, y0+0.49, x1-0.49, y1+0.49, chara.x, chara.y, chara.x+1, chara.y+1)
					blockedByTerrain.lowerRight = passageType == "walk" || passageType == "fly" || blockedByTerrain.lowerRight ? true :
						this.cohenSutherlandLineClipAndDraw(x0+0.49, y0+0.49, x1+0.49, y1+0.49, chara.x, chara.y, chara.x+1, chara.y+1)
					
					if(
						blockedByTerrain.middle &&
						blockedByTerrain.upperLeft &&
						blockedByTerrain.upperRight &&
						blockedByTerrain.lowerLeft &&
						blockedByTerrain.lowerRight
					) {
						return true;
					}
				}
			}
		}
		
		return blockedByTerrain.middle &&
			blockedByTerrain.upperLeft &&
			blockedByTerrain.upperRight &&
			blockedByTerrain.lowerLeft &&
			blockedByTerrain.lowerRight;
	};
	
	// Cohen–Sutherland clipping algorithm clips a line from
	// P0 = (x0, y0) to P1 = (x1, y1) against a rectangle with 
	// diagonal from (xmin, ymin) to (xmax, ymax).
	Game_Map.prototype.cohenSutherlandLineClipAndDraw = function(x0, y0, x1, y1, xmin, ymin, xmax, ymax) {
		var INSIDE = 0; // 0000
		var LEFT = 1;   // 0001
		var RIGHT = 2;  // 0010
		var BOTTOM = 4; // 0100
		var TOP = 8;    // 1000
		
		//var cornerCheckThreshold = 0.001;
		
		// compute outcodes for P0, P1, and whatever point lies outside the clip rectangle
		var outcode0 = this.computeOutCode(x0, y0, xmin, ymin, xmax, ymax);
		var outcode1 = this.computeOutCode(x1, y1, xmin, ymin, xmax, ymax);
		var accept = false;

		while (true) {
			this._queuedActionLoops++;
			if (!(outcode0 | outcode1)) {
				// bitwise OR is 0: both points inside window; trivially accept and exit loop
				accept = true;
				break;
			} else if (outcode0 & outcode1) {
				// bitwise AND is not 0: both points share an outside zone (LEFT, RIGHT, TOP,
				// or BOTTOM), so both must be outside window; exit loop (accept is false)
				break;
			} else {
				// failed both tests
				// x0CornerCheck = Math.round(x0);
				// y0CornerCheck = Math.round(y0);
				// x1CornerCheck = Math.round(x1);
				// y1CornerCheck = Math.round(y1);
				// if (
					// (Math.abs(x0CornerCheck-x0) <= cornerCheckThreshold && Math.abs(y0CornerCheck-y0) <= cornerCheckThreshold && (
						// (x0CornerCheck == xmin && y0CornerCheck == ymin) || (x0CornerCheck == xmin && y0CornerCheck == ymax) ||
						// (x0CornerCheck == xmax && y0CornerCheck == ymin) || (x0CornerCheck == xmax && y0CornerCheck == ymax)
					// )) ||
					// (Math.abs(x1CornerCheck-x1) <= cornerCheckThreshold && Math.abs(y1CornerCheck-y1) <= cornerCheckThreshold && (
						// (x1CornerCheck == xmin && y1CornerCheck == ymin) || (x1CornerCheck == xmin && y1CornerCheck == ymax) ||
						// (x1CornerCheck == xmax && y1CornerCheck == ymin) || (x1CornerCheck == xmax && y1CornerCheck == ymax)
					// ))
				// ) {
					// // line is just a bit too close to a corner, so count it as a collision
					// accept = true;
					// break;
				// }
				
				// calculate the line segment to clip
				// from an outside point to an intersection with clip edge
				var x;
				var y;

				// At least one endpoint is outside the clip rectangle; pick it.
				var outcodeOut = outcode0 ? outcode0 : outcode1;

				// Now find the intersection point;
				// use formulas:
				//   slope = (y1 - y0) / (x1 - x0)
				//   x = x0 + (1 / slope) * (ym - y0), where ym is ymin or ymax
				//   y = y0 + slope * (xm - x0), where xm is xmin or xmax
				// No need to worry about divide-by-zero because, in each case, the
				// outcode bit being tested guarantees the denominator is non-zero
				if (outcodeOut & TOP) {           // point is above the clip window
					x = x0 + (x1 - x0) * (ymax - y0) / (y1 - y0);
					y = ymax;
				} else if (outcodeOut & BOTTOM) { // point is below the clip window
					x = x0 + (x1 - x0) * (ymin - y0) / (y1 - y0);
					y = ymin;
				} else if (outcodeOut & RIGHT) {  // point is to the right of clip window
					y = y0 + (y1 - y0) * (xmax - x0) / (x1 - x0);
					x = xmax;
				} else if (outcodeOut & LEFT) {   // point is to the left of clip window
					y = y0 + (y1 - y0) * (xmin - x0) / (x1 - x0);
					x = xmin;
				}

				// Now we move outside point to intersection point to clip
				// and get ready for next pass.
				if (outcodeOut == outcode0) {
					x0 = x;
					y0 = y;
					outcode0 = this.computeOutCode(x0, y0, xmin, ymin, xmax, ymax);
				} else {
					x1 = x;
					y1 = y;
					outcode1 = this.computeOutCode(x1, y1, xmin, ymin, xmax, ymax);
				}
			}
		}
		return accept;
	};
	
	// Compute the bit code for a point (x, y) using the clip rectangle
	// bounded diagonally by (xmin, ymin), and (xmax, ymax)
	Game_Map.prototype.computeOutCode = function(x, y, xmin, ymin, xmax, ymax) {
		var INSIDE = 0; // 0000
		var LEFT = 1;   // 0001
		var RIGHT = 2;  // 0010
		var BOTTOM = 4; // 0100
		var TOP = 8;    // 1000
		
		var code;

		code = INSIDE;          // initialised as being inside of [[clip window]]

		if (x < xmin)           // to the left of clip window
			code |= LEFT;
		else if (x > xmax)      // to the right of clip window
			code |= RIGHT;
		if (y < ymin)           // below the clip window
			code |= BOTTOM;
		else if (y > ymax)      // above the clip window
			code |= TOP;

		return code;
	};
	
	Game_Map.prototype.getTileRuns = function() {
		var startX = 0;
		var startY = 0;
		var endX = this.width()-1;
		var endY = this.height()-1;
		
		var xDiff = Math.abs(startX - endX);
		var yDiff = Math.abs(startY - endY);
		var xStart = endX < startX ? endX : startX;
		var yStart = endY < startY ? endY : startY;
		var boxY;
		var tileRuns = [];
		for(boxY = yStart; boxY <= yStart + yDiff; boxY++) {
			var curRun = [];
			var rowRuns = [];
			var boxX;
			for(boxX = xStart; boxX <= xStart + xDiff; boxX++) {
				if(this._tbsCursorRegions.indexOf(this.regionId(boxX, boxY)) < 0) {
					if(curRun.length > 0) {
						rowRuns.push(curRun);
						curRun = [];
					}
					continue;
				}
				var tile = {};
				tile.x = boxX;
				tile.y = boxY;
				tile.enterability = this.getTbsTileEnterability(tile.x, tile.y);
				tile.exitability = this.getTbsTileExitability(tile.x, tile.y);
				if(this.isTileFullyPassable(tile)) {
					if(curRun.length > 0) {
						rowRuns.push(curRun);
						curRun = [];
					}
				} else {
					if(curRun.length > 0 && !this.compareTilePassability(tile, curRun[curRun.length-1])) {
						rowRuns.push(curRun);
						curRun = [];
					}
					curRun.push(tile);
				}
			}
			if(curRun.length > 0) {
				rowRuns.push(curRun);
				curRun = [];
			}
			if(tileRuns.length > 0) {
				var i;
				for(i = 0; i < rowRuns.length; i++) {
					var rowRun = rowRuns[i];
					var verticalFound = false;
					var j;
					for(j = 0; j < tileRuns.length; j++) {
						var tileRun = tileRuns[j];
						if(
							tileRun[tileRun.length-1].y+1 == rowRun[0].y && tileRun[0].x == rowRun[0].x &&
							tileRun[tileRun.length-1].x == rowRun[rowRun.length-1].x &&
							this.compareTilePassability(tileRun[0], rowRun[0])
						) {
							tileRuns[j] = tileRun.concat(rowRun);
							verticalFound = true;
							break;
						}
					}
					if(!verticalFound) {
						tileRuns.push(rowRun);
					}
				}
			} else {
				tileRuns = rowRuns;
			}
		}
		/* tileRuns.forEach(function (tileRun) {
			var outString;
			var prevY;
			tileRun.forEach(function (tile) {
				if(tile.y != prevY) {
					if(outString) {
						console.log(outString);
					}
					var yString = tile.y + "";
					if(yString.length == 1) {
						yString = "  " + yString;
					} else if(yString.length == 2) {
						yString = " " + yString;
					}
					outString = yString + "::";
				}
				var xString = tile.x + "";
				if(xString.length == 1) {
					xString = "  " + xString;
				} else if(xString.length == 2) {
					xString = " " + xString;
				}
				outString = outString + xString + ":";
				prevY = tile.y;
			});
			console.log(outString);
			console.log("---");
		}); */
		return tileRuns;
	};
	
	Game_Map.prototype.isTileFullyPassable = function(tile) {
		return tile.enterability[1].walk
			&& tile.enterability[1].fly
			&& tile.enterability[1].melee
			&& tile.enterability[1].thrown
			&& tile.enterability[1].fired
			&& tile.enterability[2].walk
			&& tile.enterability[2].fly
			&& tile.enterability[2].melee
			&& tile.enterability[2].thrown
			&& tile.enterability[2].fired
			&& tile.enterability[3].walk
			&& tile.enterability[3].fly
			&& tile.enterability[3].melee
			&& tile.enterability[3].thrown
			&& tile.enterability[3].fired
			&& tile.enterability[4].walk
			&& tile.enterability[4].fly
			&& tile.enterability[4].melee
			&& tile.enterability[4].thrown
			&& tile.enterability[4].fired
			&& tile.enterability[6].walk
			&& tile.enterability[6].fly
			&& tile.enterability[6].melee
			&& tile.enterability[6].thrown
			&& tile.enterability[6].fired
			&& tile.enterability[7].walk
			&& tile.enterability[7].fly
			&& tile.enterability[7].melee
			&& tile.enterability[7].thrown
			&& tile.enterability[7].fired
			&& tile.enterability[8].walk
			&& tile.enterability[8].fly
			&& tile.enterability[8].melee
			&& tile.enterability[8].thrown
			&& tile.enterability[8].fired
			&& tile.enterability[9].walk
			&& tile.enterability[9].fly
			&& tile.enterability[9].melee
			&& tile.enterability[9].thrown
			&& tile.enterability[9].fired
			&& tile.exitability[1].walk
			&& tile.exitability[1].fly
			&& tile.exitability[1].melee
			&& tile.exitability[1].thrown
			&& tile.exitability[1].fired
			&& tile.exitability[2].walk
			&& tile.exitability[2].fly
			&& tile.exitability[2].melee
			&& tile.exitability[2].thrown
			&& tile.exitability[2].fired
			&& tile.exitability[3].walk
			&& tile.exitability[3].fly
			&& tile.exitability[3].melee
			&& tile.exitability[3].thrown
			&& tile.exitability[3].fired
			&& tile.exitability[4].walk
			&& tile.exitability[4].fly
			&& tile.exitability[4].melee
			&& tile.exitability[4].thrown
			&& tile.exitability[4].fired
			&& tile.exitability[6].walk
			&& tile.exitability[6].fly
			&& tile.exitability[6].melee
			&& tile.exitability[6].thrown
			&& tile.exitability[6].fired
			&& tile.exitability[7].walk
			&& tile.exitability[7].fly
			&& tile.exitability[7].melee
			&& tile.exitability[7].thrown
			&& tile.exitability[7].fired
			&& tile.exitability[8].walk
			&& tile.exitability[8].fly
			&& tile.exitability[8].melee
			&& tile.exitability[8].thrown
			&& tile.exitability[8].fired
			&& tile.exitability[9].walk
			&& tile.exitability[9].fly
			&& tile.exitability[9].melee
			&& tile.exitability[9].thrown
			&& tile.exitability[9].fired;
	};
	
	Game_Map.prototype.compareTilePassability = function(tileOne, tileTwo) {
		return tileOne.enterability[1].walk		== tileTwo.enterability[1].walk
			&& tileOne.enterability[1].fly		== tileTwo.enterability[1].fly
			&& tileOne.enterability[1].melee	== tileTwo.enterability[1].melee
			&& tileOne.enterability[1].thrown	== tileTwo.enterability[1].thrown
			&& tileOne.enterability[1].fired	== tileTwo.enterability[1].fired
			&& tileOne.enterability[2].walk		== tileTwo.enterability[2].walk
			&& tileOne.enterability[2].fly		== tileTwo.enterability[2].fly
			&& tileOne.enterability[2].melee	== tileTwo.enterability[2].melee
			&& tileOne.enterability[2].thrown	== tileTwo.enterability[2].thrown
			&& tileOne.enterability[2].fired	== tileTwo.enterability[2].fired
			&& tileOne.enterability[3].walk		== tileTwo.enterability[3].walk
			&& tileOne.enterability[3].fly		== tileTwo.enterability[3].fly
			&& tileOne.enterability[3].melee	== tileTwo.enterability[3].melee
			&& tileOne.enterability[3].thrown	== tileTwo.enterability[3].thrown
			&& tileOne.enterability[3].fired	== tileTwo.enterability[3].fired
			&& tileOne.enterability[4].walk		== tileTwo.enterability[4].walk
			&& tileOne.enterability[4].fly		== tileTwo.enterability[4].fly
			&& tileOne.enterability[4].melee	== tileTwo.enterability[4].melee
			&& tileOne.enterability[4].thrown	== tileTwo.enterability[4].thrown
			&& tileOne.enterability[4].fired	== tileTwo.enterability[4].fired
			&& tileOne.enterability[6].walk		== tileTwo.enterability[6].walk
			&& tileOne.enterability[6].fly		== tileTwo.enterability[6].fly
			&& tileOne.enterability[6].melee	== tileTwo.enterability[6].melee
			&& tileOne.enterability[6].thrown	== tileTwo.enterability[6].thrown
			&& tileOne.enterability[6].fired	== tileTwo.enterability[6].fired
			&& tileOne.enterability[7].walk		== tileTwo.enterability[7].walk
			&& tileOne.enterability[7].fly		== tileTwo.enterability[7].fly
			&& tileOne.enterability[7].melee	== tileTwo.enterability[7].melee
			&& tileOne.enterability[7].thrown	== tileTwo.enterability[7].thrown
			&& tileOne.enterability[7].fired	== tileTwo.enterability[7].fired
			&& tileOne.enterability[8].walk		== tileTwo.enterability[8].walk
			&& tileOne.enterability[8].fly		== tileTwo.enterability[8].fly
			&& tileOne.enterability[8].melee	== tileTwo.enterability[8].melee
			&& tileOne.enterability[8].thrown	== tileTwo.enterability[8].thrown
			&& tileOne.enterability[8].fired	== tileTwo.enterability[8].fired
			&& tileOne.enterability[9].walk		== tileTwo.enterability[9].walk
			&& tileOne.enterability[9].fly		== tileTwo.enterability[9].fly
			&& tileOne.enterability[9].melee	== tileTwo.enterability[9].melee
			&& tileOne.enterability[9].thrown	== tileTwo.enterability[9].thrown
			&& tileOne.enterability[9].fired	== tileTwo.enterability[9].fired
			&& tileOne.exitability[1].walk		== tileTwo.exitability[1].walk
			&& tileOne.exitability[1].fly		== tileTwo.exitability[1].fly
			&& tileOne.exitability[1].melee		== tileTwo.exitability[1].melee
			&& tileOne.exitability[1].thrown	== tileTwo.exitability[1].thrown
			&& tileOne.exitability[1].fired		== tileTwo.exitability[1].fired
			&& tileOne.exitability[2].walk		== tileTwo.exitability[2].walk
			&& tileOne.exitability[2].fly		== tileTwo.exitability[2].fly
			&& tileOne.exitability[2].melee		== tileTwo.exitability[2].melee
			&& tileOne.exitability[2].thrown	== tileTwo.exitability[2].thrown
			&& tileOne.exitability[2].fired		== tileTwo.exitability[2].fired
			&& tileOne.exitability[3].walk		== tileTwo.exitability[3].walk
			&& tileOne.exitability[3].fly		== tileTwo.exitability[3].fly
			&& tileOne.exitability[3].melee		== tileTwo.exitability[3].melee
			&& tileOne.exitability[3].thrown	== tileTwo.exitability[3].thrown
			&& tileOne.exitability[3].fired		== tileTwo.exitability[3].fired
			&& tileOne.exitability[4].walk		== tileTwo.exitability[4].walk
			&& tileOne.exitability[4].fly		== tileTwo.exitability[4].fly
			&& tileOne.exitability[4].melee		== tileTwo.exitability[4].melee
			&& tileOne.exitability[4].thrown	== tileTwo.exitability[4].thrown
			&& tileOne.exitability[4].fired		== tileTwo.exitability[4].fired
			&& tileOne.exitability[6].walk		== tileTwo.exitability[6].walk
			&& tileOne.exitability[6].fly		== tileTwo.exitability[6].fly
			&& tileOne.exitability[6].melee		== tileTwo.exitability[6].melee
			&& tileOne.exitability[6].thrown	== tileTwo.exitability[6].thrown
			&& tileOne.exitability[6].fired		== tileTwo.exitability[6].fired
			&& tileOne.exitability[7].walk		== tileTwo.exitability[7].walk
			&& tileOne.exitability[7].fly		== tileTwo.exitability[7].fly
			&& tileOne.exitability[7].melee		== tileTwo.exitability[7].melee
			&& tileOne.exitability[7].thrown	== tileTwo.exitability[7].thrown
			&& tileOne.exitability[7].fired		== tileTwo.exitability[7].fired
			&& tileOne.exitability[8].walk		== tileTwo.exitability[8].walk
			&& tileOne.exitability[8].fly		== tileTwo.exitability[8].fly
			&& tileOne.exitability[8].melee		== tileTwo.exitability[8].melee
			&& tileOne.exitability[8].thrown	== tileTwo.exitability[8].thrown
			&& tileOne.exitability[8].fired		== tileTwo.exitability[8].fired
			&& tileOne.exitability[9].walk		== tileTwo.exitability[9].walk
			&& tileOne.exitability[9].fly		== tileTwo.exitability[9].fly
			&& tileOne.exitability[9].melee		== tileTwo.exitability[9].melee
			&& tileOne.exitability[9].thrown	== tileTwo.exitability[9].thrown
			&& tileOne.exitability[9].fired		== tileTwo.exitability[9].fired;
	};
	
	Game_Map.prototype.getTbsTileEnterability = function(x, y) {
		var enterability = [];
		
		enterability[8] = {};
		enterability[8].walk	= this.isPassable(x, y, 2, "walk");
		enterability[8].fly		= this.isPassable(x, y, 2, "fly");
		enterability[8].melee 	= this.isPassable(x, y, 2, "melee");
		enterability[8].thrown 	= this.isPassable(x, y, 2, "thrown");
		enterability[8].fired 	= this.isPassable(x, y, 2, "fired");
		enterability[2] = {};
		enterability[2].walk	= this.isPassable(x, y, 8, "walk");
		enterability[2].fly		= this.isPassable(x, y, 8, "fly");
		enterability[2].melee 	= this.isPassable(x, y, 8, "melee");
		enterability[2].thrown 	= this.isPassable(x, y, 8, "thrown");
		enterability[2].fired 	= this.isPassable(x, y, 8, "fired");
		enterability[4] = {};
		enterability[4].walk	= this.isPassable(x, y, 6, "walk");
		enterability[4].fly		= this.isPassable(x, y, 6, "fly");
		enterability[4].melee 	= this.isPassable(x, y, 6, "melee");
		enterability[4].thrown 	= this.isPassable(x, y, 6, "thrown");
		enterability[4].fired 	= this.isPassable(x, y, 6, "fired");
		enterability[6] = {};
		enterability[6].walk	= this.isPassable(x, y, 4, "walk");
		enterability[6].fly		= this.isPassable(x, y, 4, "fly");
		enterability[6].melee 	= this.isPassable(x, y, 4, "melee");
		enterability[6].thrown 	= this.isPassable(x, y, 4, "thrown");
		enterability[6].fired 	= this.isPassable(x, y, 4, "fired");
		
		enterability[7] = {};
		enterability[7].walk 	= enterability[4].walk 		&& enterability[8].walk;
		enterability[7].fly 	= enterability[4].fly 		&& enterability[8].fly;
		enterability[7].melee 	= enterability[4].melee 	&& enterability[8].melee;
		enterability[7].thrown 	= enterability[4].thrown	&& enterability[8].thrown;
		enterability[7].fired 	= enterability[4].fired 	&& enterability[8].fired;
		enterability[9] = {};
		enterability[9].walk 	= enterability[6].walk 		&& enterability[8].walk;
		enterability[9].fly 	= enterability[6].fly 		&& enterability[8].fly;
		enterability[9].melee 	= enterability[6].melee 	&& enterability[8].melee;
		enterability[9].thrown 	= enterability[6].thrown	&& enterability[8].thrown;
		enterability[9].fired 	= enterability[6].fired 	&& enterability[8].fired;
		enterability[1] = {};
		enterability[1].walk 	= enterability[4].walk 		&& enterability[2].walk;
		enterability[1].fly 	= enterability[4].fly 		&& enterability[2].fly;
		enterability[1].melee 	= enterability[4].melee 	&& enterability[2].melee;
		enterability[1].thrown 	= enterability[4].thrown	&& enterability[2].thrown;
		enterability[1].fired 	= enterability[4].fired 	&& enterability[2].fired;
		enterability[3] = {};
		enterability[3].walk 	= enterability[6].walk 		&& enterability[2].walk;
		enterability[3].fly 	= enterability[6].fly 		&& enterability[2].fly;
		enterability[3].melee 	= enterability[6].melee 	&& enterability[2].melee;
		enterability[3].thrown 	= enterability[6].thrown	&& enterability[2].thrown;
		enterability[3].fired 	= enterability[6].fired 	&& enterability[2].fired;
		
		return enterability;
	};
	
	Game_Map.prototype.getTbsTileExitability = function(x, y) {
		var exitability = [];
		
		exitability[8] = {};
		exitability[8].walk		= this.isPassable(x, y, 8, "walk");
		exitability[8].fly		= this.isPassable(x, y, 8, "fly");
		exitability[8].melee 	= this.isPassable(x, y, 8, "melee");
		exitability[8].thrown 	= this.isPassable(x, y, 8, "thrown");
		exitability[8].fired 	= this.isPassable(x, y, 8, "fired");
		exitability[2] = {};
		exitability[2].walk		= this.isPassable(x, y, 2, "walk");
		exitability[2].fly		= this.isPassable(x, y, 2, "fly");
		exitability[2].melee 	= this.isPassable(x, y, 2, "melee");
		exitability[2].thrown 	= this.isPassable(x, y, 2, "thrown");
		exitability[2].fired 	= this.isPassable(x, y, 2, "fired");
		exitability[4] = {};
		exitability[4].walk		= this.isPassable(x, y, 4, "walk");
		exitability[4].fly		= this.isPassable(x, y, 4, "fly");
		exitability[4].melee 	= this.isPassable(x, y, 4, "melee");
		exitability[4].thrown 	= this.isPassable(x, y, 4, "thrown");
		exitability[4].fired 	= this.isPassable(x, y, 4, "fired");
		exitability[6] = {};
		exitability[6].walk		= this.isPassable(x, y, 6, "walk");
		exitability[6].fly		= this.isPassable(x, y, 6, "fly");
		exitability[6].melee 	= this.isPassable(x, y, 6, "melee");
		exitability[6].thrown 	= this.isPassable(x, y, 6, "thrown");
		exitability[6].fired 	= this.isPassable(x, y, 6, "fired");
		
		exitability[7] = {};
		exitability[7].walk 	= exitability[4].walk 	&& exitability[8].walk;
		exitability[7].fly 		= exitability[4].fly 	&& exitability[8].fly;
		exitability[7].melee 	= exitability[4].melee 	&& exitability[8].melee;
		exitability[7].thrown 	= exitability[4].thrown	&& exitability[8].thrown;
		exitability[7].fired 	= exitability[4].fired 	&& exitability[8].fired;
		exitability[9] = {};
		exitability[9].walk 	= exitability[6].walk 	&& exitability[8].walk;
		exitability[9].fly 		= exitability[6].fly 	&& exitability[8].fly;
		exitability[9].melee 	= exitability[6].melee 	&& exitability[8].melee;
		exitability[9].thrown 	= exitability[6].thrown	&& exitability[8].thrown;
		exitability[9].fired 	= exitability[6].fired 	&& exitability[8].fired;
		exitability[1] = {};
		exitability[1].walk 	= exitability[4].walk 	&& exitability[2].walk;
		exitability[1].fly 		= exitability[4].fly 	&& exitability[2].fly;
		exitability[1].melee 	= exitability[4].melee 	&& exitability[2].melee;
		exitability[1].thrown 	= exitability[4].thrown	&& exitability[2].thrown;
		exitability[1].fired 	= exitability[4].fired 	&& exitability[2].fired;
		exitability[3] = {};
		exitability[3].walk 	= exitability[6].walk 	&& exitability[2].walk;
		exitability[3].fly 		= exitability[6].fly 	&& exitability[2].fly;
		exitability[3].melee 	= exitability[6].melee 	&& exitability[2].melee;
		exitability[3].thrown 	= exitability[6].thrown	&& exitability[2].thrown;
		exitability[3].fired 	= exitability[6].fired 	&& exitability[2].fired;
		
		return exitability;
	};
	
	Game_Map.prototype.isPassable = function(x, y, d, passageType) {
		if(this._tbsBattleMode) {
			var events = this.eventsXyNt(x, y);
			if(events.some(function(event) {
				return event.isNormalPriority();
			})) { return false; } //event in way
			
			if(this.boat().posNt(x, y) || this.ship().posNt(x, y)) {
				return false; // vehicle in the way
			}
			
			var terrainTag = this.terrainTag(x, y);
			if(passageType === "fly" && (terrainTag == 1 || terrainTag == 2)) {
				return true;
			}
			if((passageType === "melee" || passageType === "thrown" || passageType === "fired")
				&& terrainTag === 1) {
				return true
			}
		}
		
		return this.checkPassage(x, y, (1 << (d / 2 - 1)) & 0x0f);
	};
	
	//character base
	Game_CharacterBase.prototype.initMembers = function() {
		this._x = 0;
		this._y = 0;
		this._realX = 0;
		this._realY = 0;
		this._moveSpeed = 4;
		this._moveFrequency = 6;
		this._opacity = 255;
		this._blendMode = 0;
		this._direction = 2;
		this._pattern = 1;
		this._priorityType = 1;
		this._tileId = 0;
		this._characterName = '';
		this._characterIndex = 0;
		this._isObjectCharacter = false;
		this._walkAnime = true;
		this._stepAnime = false;
		this._directionFix = false;
		this._through = false;
		this._transparent = false;
		this._bushDepth = 0;
		this._animationId = 0;
		this._balloonId = 0;
		this._animationPlaying = false;
		this._balloonPlaying = false;
		this._animationCount = 0;
		this._stopCount = 0;
		this._jumpCount = 0;
		this._jumpPeak = 0;
		this._movementSuccess = true;
		this._tbsBattleMode = false;
	};
	
	Game_CharacterBase.prototype.isDashing = function() {
		return this._tbsBattleMode;
	};
	
	Game_CharacterBase.prototype.setTbsBattleMode = function(modeOn) {
		if(this._tbsBattleMode !== modeOn) {
			this._tbsBattleMode = modeOn;
		}
	};
	
	Game_CharacterBase.prototype.canPass = function(x, y, d, passageType) {
		var x2 = $gameMap.roundXWithDirection(x, d);
		var y2 = $gameMap.roundYWithDirection(y, d);
		if (!$gameMap.isValid(x2, y2)) {
			return false;
		}
		if (this.isThrough() || this.isDebugThrough()) {
			return true;
		}
		if (!this.isMapPassable(x, y, d, passageType)) {
			return false;
		}
		if (this.isCollidedWithCharacters(x2, y2)) {
			return false;
		}
		return true;
	};
	
	Game_CharacterBase.prototype.isMapPassable = function(x, y, d, passageType) {
		var x2 = $gameMap.roundXWithDirection(x, d);
		var y2 = $gameMap.roundYWithDirection(y, d);
		var d2 = this.reverseDir(d);
		return $gameMap.isPassable(x, y, d, passageType) && $gameMap.isPassable(x2, y2, d2, passageType);
	};
	
	Game_CharacterBase.prototype.moveStraight = function(d, passageType) {
		this.setMovementSuccess(this.canPass(this._x, this._y, d, passageType));
		if (this.isMovementSucceeded()) {
			this.setDirection(d);
			this._x = $gameMap.roundXWithDirection(this._x, d);
			this._y = $gameMap.roundYWithDirection(this._y, d);
			this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
			this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
			this.increaseSteps();
		} else {
			this.setDirection(d);
			this.checkEventTriggerTouchFront(d);
		}
	};
	
	//character
	Game_Character.prototype.turnTowardLocation = function(x, y) {
		var sx = this.deltaXFrom(x);
		var sy = this.deltaYFrom(y);
		if (Math.abs(sx) > Math.abs(sy)) {
			this.setDirection(sx > 0 ? 4 : 6);
		} else if (sy !== 0) {
			this.setDirection(sy > 0 ? 8 : 2);
		}
	};
	
	Game_Character.prototype.findDirectionTo = function(goalX, goalY, passageType) {
		var searchLimit = this.searchLimit();
		var mapWidth = $gameMap.width();
		var nodeList = [];
		var openList = [];
		var closedList = [];
		var start = {};
		var best = start;

		if (this.x === goalX && this.y === goalY) {
			return 0;
		}

		start.parent = null;
		start.x = this.x;
		start.y = this.y;
		start.g = 0;
		start.f = $gameMap.distance(start.x, start.y, goalX, goalY);
		nodeList.push(start);
		openList.push(start.y * mapWidth + start.x);

		while (nodeList.length > 0) {
			var bestIndex = 0;
			for (var i = 0; i < nodeList.length; i++) {
				if (nodeList[i].f < nodeList[bestIndex].f) {
					bestIndex = i;
				}
			}

			var current = nodeList[bestIndex];
			var x1 = current.x;
			var y1 = current.y;
			var pos1 = y1 * mapWidth + x1;
			var g1 = current.g;

			nodeList.splice(bestIndex, 1);
			openList.splice(openList.indexOf(pos1), 1);
			closedList.push(pos1);

			if (current.x === goalX && current.y === goalY) {
				best = current;
				goaled = true;
				break;
			}

			if (g1 >= searchLimit) {
				continue;
			}

			for (var j = 0; j < 4; j++) {
				var direction = 2 + j * 2;
				var x2 = $gameMap.roundXWithDirection(x1, direction);
				var y2 = $gameMap.roundYWithDirection(y1, direction);
				var pos2 = y2 * mapWidth + x2;

				if (closedList.contains(pos2)) {
					continue;
				}
				if (!this.canPass(x1, y1, direction, passageType)) {
					continue;
				}

				var g2 = g1 + 1;
				var index2 = openList.indexOf(pos2);

				if (index2 < 0 || g2 < nodeList[index2].g) {
					var neighbor;
					if (index2 >= 0) {
						neighbor = nodeList[index2];
					} else {
						neighbor = {};
						nodeList.push(neighbor);
						openList.push(pos2);
					}
					neighbor.parent = current;
					neighbor.x = x2;
					neighbor.y = y2;
					neighbor.g = g2;
					neighbor.f = g2 + $gameMap.distance(x2, y2, goalX, goalY);
					if (!best || neighbor.f - neighbor.g < best.f - best.g) {
						best = neighbor;
					}
				}
			}
		}

		var node = best;
		while (node.parent && node.parent !== start) {
			node = node.parent;
		}

		var deltaX1 = $gameMap.deltaX(node.x, start.x);
		var deltaY1 = $gameMap.deltaY(node.y, start.y);
		if (deltaY1 > 0) {
			return 2;
		} else if (deltaX1 < 0) {
			return 4;
		} else if (deltaX1 > 0) {
			return 6;
		} else if (deltaY1 < 0) {
			return 8;
		}

		var deltaX2 = this.deltaXFrom(goalX);
		var deltaY2 = this.deltaYFrom(goalY);
		if (Math.abs(deltaX2) > Math.abs(deltaY2)) {
			return deltaX2 > 0 ? 4 : 6;
		} else if (deltaY2 !== 0) {
			return deltaY2 > 0 ? 8 : 2;
		}

		return 0;
	};
	
	//player
	Game_Player.prototype.initMembers = function() {
		Game_Character.prototype.initMembers.call(this);
		this._vehicleType = 'walk';
		this._vehicleGettingOn = false;
		this._vehicleGettingOff = false;
		this._dashing = false;
		this._needsMapReload = false;
		this._transferring = false;
		this._newMapId = 0;
		this._newX = 0;
		this._newY = 0;
		this._newDirection = 0;
		this._fadeType = 0;
		this._followers = new Game_Followers();
		this._encounterCount = 0;
		this._tbsShowCursor = false;
		this._tbsCanMove = false;
		this._tbsIsFollowingCharacter = false;
		this._cursorMoveField = []; 
		this._tbsMovingCharacter = undefined;
		this._tbsNextFrameMoveDirection = 0;
		this._tbsNextFrameMoveDirectionSetThisFrame = false;
	};
	
	Game_Player.prototype.refresh = function() {
		if(this._tbsBattleMode) {
			if(this._tbsShowCursor) {
				this.setImage("Cursor", 0);
			} else {
				this.setImage("Cursor", 1);
			}
		} else {
			var actor = $gameParty.leader();
			var characterName = actor ? actor.characterName() : '';
			var characterIndex = actor ? actor.characterIndex() : 0;
			this.setImage(characterName, characterIndex);
		}
		this._followers.refresh();
	};
	
	Game_Player.prototype.moveStraight = function(d, passageType) {
		if (this.canPass(this.x, this.y, d, passageType)) {
			this._followers.updateMove();
		}
		Game_Character.prototype.moveStraight.call(this, d, passageType);
	};
	
	Game_Player.prototype.isDashing = function() {
		return this._tbsBattleMode ? true : this._dashing;
	};
	
	Game_Player.prototype.realMoveSpeed = function() {
		var speed = this._moveSpeed + (this.isDashing() ? 1 : 0);
		return !this._tbsBattleMode || this._tbsCanMove || this._tbsFollowingCharacter ? speed : speed + 1;
	};
	
	Game_Player.prototype.setTbsBattleMode = function(modeOn) {
		if(this._tbsBattleMode !== modeOn) {
			this._tbsBattleMode = modeOn;
			if(modeOn) {
				this.setStepAnime(true);
				this.setPriorityType(2);
			} else {
				this.setStepAnime(false);
				this.setPriorityType(1);
			}
		}
	};
	
	Game_Player.prototype.setTbsShowCursor = function(showCursor) {
		this._tbsShowCursor = showCursor;
	};
	
	Game_Player.prototype.setCursorMoveField = function(moveField) {
		this._cursorMoveField = moveField;
	};
	
	Game_Player.prototype.clearCursorMoveField = function() {
		this._cursorMoveField = [];
	};
	
	Game_Player.prototype.setMovingCharacter = function(chara) {
		this._tbsMovingCharacter = chara;
	};
	
	Game_Player.prototype.clearMovingCharacter = function() {
		this._tbsMovingCharacter = undefined;
	};
	
	Game_Player.prototype.setTbsCanMove = function(canMove) {
		this._tbsCanMove = canMove;
	};
	
	Game_Player.prototype.setTbsFollowingCharacter = function(followingCharacter) {
		this._tbsFollowingCharacter = followingCharacter;
	};
	
	Game_Player.prototype.setNextFrameMoveDirection = function(direction) {
		this._tbsNextFrameMoveDirection = direction;
		this._tbsNextFrameMoveDirectionSetThisFrame = true;
	};
	
	Game_Player.prototype.moveByInput = function() {
		if(this._tbsBattleMode && this._tbsNextFrameMoveDirection !== 0) {
			if(this._tbsNextFrameMoveDirectionSetThisFrame) {
				this._tbsNextFrameMoveDirectionSetThisFrame = false;
				return;
			}
			this.executeMove(this._tbsNextFrameMoveDirection);
			this._tbsNextFrameMoveDirection = 0;
			return;
		}
		
		if ((!this._tbsBattleMode || this._tbsCanMove) && !this.isMoving() && this.canMove()) {
			var direction = this.getInputDirection();
			if (direction > 0) {
				$gameTemp.clearDestination();
				if(this._tbsBattleMode) {
					if(this._tbsMovingCharacter) {
						this._tbsMovingCharacter.setDirection(direction);
					}
					var x = $gamePlayer.x;
					var y = $gamePlayer.y;
					if(direction === 8) {
						y -= 1;
					} else if(direction === 2) {
						y += 1;
					}
					if(direction === 4) {
						x -= 1;
					} else if(direction === 6) {
						x += 1;
					}
					if(!this.cursorPositionValid(x, y)) {
						direction = 0;
					}
				}
			}
			if (direction === 0 && $gameTemp.isDestinationValid()){
				var x = $gameTemp.destinationX();
				var y = $gameTemp.destinationY();
				if(!this._tbsBattleMode || this.cursorPositionValid(x, y)) {
					direction = this.findDirectionTo(x, y);
				} else {
					$gameTemp.clearDestination();
				}
			}
			if (direction > 0) {
				if(this._tbsBattleMode && this._tbsMovingCharacter) {
					this._tbsNextFrameMoveDirection = direction;
					this._tbsMovingCharacter.moveStraight(direction);
				} else {
					this.executeMove(direction);
				}
			}
		}
	};
	
	Game_Player.prototype.isMoving = function() {
		return this._tbsNextFrameMoveDirection !== 0 || this._realX !== this._x || this._realY !== this._y;
	};
	
	Game_Player.prototype.cursorPositionValid = function(x, y) {
		if(this._cursorMoveField.length > 0) {
			var i;
			for(i = 0; i < this._cursorMoveField.length; i++) {
				if(this._cursorMoveField[i].x === x && this._cursorMoveField[i].y === y) {
					return true;
				}
			}
			return false;
		} else if($gameMap.tbsCursorRegions().length > 0) {
			return $gameMap.tbsCursorRegions().indexOf($gameMap.regionId(x, y)) >= 0;
		}
		return x >= 0 && y >= 0 && x < $gameMap.width && y < $gameMap.height;
	};
	
	Game_Player.prototype.reserveTransfer = function(mapId, x, y, d, fadeType) {
		if(this._tbsBattleMode) { return; }
		this._transferring = true;
		this._newMapId = mapId;
		this._newX = x;
		this._newY = y;
		this._newDirection = d;
		this._fadeType = fadeType;
	};
	
	Game_Player.prototype.triggerAction = function() {
		if(this._tbsBattleMode) { return false; }
		
		if (this.canMove() || $gameMap.anyCloseableMessageWindows()) {
			if (this.triggerButtonAction()) {
				return true;
			}
			if (this.triggerTouchAction()) {
				return true;
			}
		}
		return false;
	};
	
	Game_Player.prototype.triggerButtonAction = function() {
		if (Input.isTriggered('ok')) {
			if($gameMap.anyCloseableMessageWindows()) {
				$gameMap.closeCloseableMessageWindows();
				return false;
			}
			if (this.getOnOffVehicle()) {
				return true;
			}
			this.checkEventTriggerHere([0]);
			if ($gameMap.setupStartingEvent()) {
				return true;
			}
			this.checkEventTriggerThere([0,1,2]);
			if ($gameMap.setupStartingEvent()) {
				return true;
			}
		}
		return false;
	};

	Game_Player.prototype.triggerTouchAction = function() {
		if ($gameTemp.isDestinationValid()){
			if($gameMap.anyCloseableMessageWindows()) {
				$gameMap.closeCloseableMessageWindows();
				return false;
			}
			var direction = this.direction();
			var x1 = this.x;
			var y1 = this.y;
			var x2 = $gameMap.roundXWithDirection(x1, direction);
			var y2 = $gameMap.roundYWithDirection(y1, direction);
			var x3 = $gameMap.roundXWithDirection(x2, direction);
			var y3 = $gameMap.roundYWithDirection(y2, direction);
			var destX = $gameTemp.destinationX();
			var destY = $gameTemp.destinationY();
			if (destX === x1 && destY === y1) {
				return this.triggerTouchActionD1(x1, y1);
			} else if (destX === x2 && destY === y2) {
				return this.triggerTouchActionD2(x2, y2);
			} else if (destX === x3 && destY === y3) {
				return this.triggerTouchActionD3(x2, y2);
			}
		}
		return false;
	};
	
	//follower
	Game_Follower.prototype.chaseCharacter = function(character) {
		if(this._tbsBattleMode) { return; }
		
		var sx = this.deltaXFrom(character.x);
		var sy = this.deltaYFrom(character.y);
		if (sx !== 0 && sy !== 0) {
			this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
		} else if (sx !== 0) {
			this.moveStraight(sx > 0 ? 4 : 6);
		} else if (sy !== 0) {
			this.moveStraight(sy > 0 ? 8 : 2);
		}
		this.setMoveSpeed($gamePlayer.realMoveSpeed());
	};
	
	//followers
	Game_Followers.prototype.length = function() {
		return this._data.length;
	};
	
	//vehicle
	Game_Vehicle.prototype.isLandOk = function(x, y, d) {
		if (this.isAirship()) {
			if (!$gameMap.isAirshipLandOk(x, y)) {
				return false;
			}
			if ($gameMap.eventsXy(x, y).length > 0) {
				return false;
			}
		} else {
			var x2 = $gameMap.roundXWithDirection(x, d);
			var y2 = $gameMap.roundYWithDirection(y, d);
			if (!$gameMap.isValid(x2, y2)) {
				return false;
			}
			if (!$gameMap.isPassable(x2, y2, this.reverseDir(d), this)) {
				return false;
			}
			if (this.isCollidedWithCharacters(x2, y2)) {
				return false;
			}
		}
		return true;
	};
	
	//interpreter
	Game_Interpreter.prototype.updateWaitMode = function() {
		var waiting = false;
		switch (this._waitMode) {
		case 'message':
			waiting = $gameMessage.isBusy();
			break;
		case 'concurrentMessage':
			waiting = $gameMap.waitingOnMessageWindows();
			break;
		case 'transfer':
			waiting = $gamePlayer.isTransferring();
			break;
		case 'scroll':
			waiting = $gameMap.isScrolling();
			break;
		case 'route':
			waiting = this._character.isMoveRouteForcing();
			break;
		case 'animation':
			waiting = this._character.isAnimationPlaying();
			break;
		case 'balloon':
			waiting = this._character.isBalloonPlaying();
			break;
		case 'gather':
			waiting = $gamePlayer.areFollowersGathering();
			break;
		case 'action':
			waiting = BattleManager.isActionForced();
			break;
		case 'video':
			waiting = Graphics.isVideoPlaying();
			break;
		case 'image':
			waiting = !ImageManager.isReady();
			break;
		}
		if (!waiting) {
			this._waitMode = '';
		}
		return waiting;
	};
	
	Game_Interpreter.prototype.concurrentMessage = function() {
		this.setWaitMode('concurrentMessage');
	};
	
	Game_Interpreter.prototype.command355 = function() {
		var script = this.currentCommand().parameters[0] + '\n';
		while (this.nextEventCode() === 655) {
			this._index++;
			script += this.currentCommand().parameters[0] + '\n';
		}
		$gameTemp.setEvaluatingInterpreter(this);
		eval(script);
		$gameTemp.clearEvaluatingInterpreter();
		return true;
	};
}) ();
