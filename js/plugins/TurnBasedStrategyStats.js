//=============================================================================
// TurnBasedStrategyStats.js
//=============================================================================

/*:
 *
 * @plugindesc Stats and class parameters handling for a turn based strategy game
 *
 * @author Darlos9D
 *
 * @help
 *
 * This plugin does not provide any commands.
 *
 */
 
(function() {
	var turnBasedStrategyStatsLoaded = false;
	var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
	DataManager.isDatabaseLoaded = function () {
		if(!_DataManager_isDatabaseLoaded.call(this))
		{
			return false;
		}
		
		if(turnBasedStrategyStatsLoaded)
		{
			return true;
		}
		
		var i;
		for(i = 0; i < $dataActors.length; i++)
		{
			if($dataActors[i])
			{
				var note = $dataActors[i].note.length > 0 ? $dataActors[i].note : "{}";
				$dataActors[i].tbsStats = JSON.parse(note);
			}
		}
		
		for(i = 0; i < $dataClasses.length; i++)
		{
			if($dataClasses[i])
			{
				var note = $dataClasses[i].note.length > 0 ? $dataClasses[i].note : "{}";
				$dataClasses[i].tbsStats = JSON.parse(note);
			}
		}
		
		for(i = 0; i < $dataArmors.length; i++)
		{
			if($dataArmors[i])
			{
				var note = $dataArmors[i].note.length > 0 ? $dataArmors[i].note : "{}";
				$dataArmors[i].tbsStats = JSON.parse(note);
				this.sortActionsHits($dataArmors[i].tbsStats.actions);
				DataManager.setUpAnimationIds($dataArmors[i]);
			}
		}
		
		for(i = 0; i < $dataWeapons.length; i++)
		{
			if($dataWeapons[i])
			{
				var note = $dataWeapons[i].note.length > 0 ? $dataWeapons[i].note : "{}";
				$dataWeapons[i].tbsStats = JSON.parse(note);
				this.sortActionsHits($dataWeapons[i].tbsStats.actions);
				DataManager.setUpAnimationIds($dataWeapons[i]);
			}
		}
		
		for(i = 0; i < $dataEnemies.length; i++)
		{
			if($dataEnemies[i])
			{
				var note = $dataEnemies[i].note.length > 0 ? $dataEnemies[i].note : "{}";
				$dataEnemies[i].tbsStats = JSON.parse(note);
			}
		}
		
		for(i = 0; i < $dataSkills.length; i++)
		{
			if($dataSkills[i])
			{
				var note = $dataSkills[i].note.length > 0 ? $dataSkills[i].note : "{}";
				$dataSkills[i].tbsStats = JSON.parse(note);
				this.sortActionHits($dataSkills[i].tbsStats.action);
				DataManager.setUpAnimationIds($dataSkills[i]);
			}
		}
		
		for(i = 0; i < $dataItems.length; i++)
		{
			if($dataItems[i])
			{
				var note = $dataItems[i].note.length > 0 ? $dataItems[i].note : "{}";
				$dataItems[i].tbsStats = JSON.parse(note);
				this.sortActionsHits($dataItems[i].tbsStats.actions);
				DataManager.setUpAnimationIds($dataItems[i]);
			}
		}
		
		turnBasedStrategyStatsLoaded = true;
		
		return true;
	};
	
	DataManager.sortActionsHits = function(actions) {
		if(!actions) { return; }
		var that = this;
		actions.forEach(function (action) {
			that.sortActionHits(action);
		});
	};
	
	DataManager.sortActionHits = function(action) {
		if(!action || !action.hitGroups) { return; }
		action.hitGroups.forEach(function(hitGroup) {
			if(!hitGroup.hits) { return; }
			var initialHits = [];
			var followUpHits = [];
			hitGroup.hits.forEach(function(hit) {
				if(hit.rangeType === "followUp") {
					followUpHits.push(hit);
				} else {
					initialHits.push(hit);
				}
			});
			hitGroup.hits = initialHits.concat(followUpHits);
		});
	};
	
	DataManager.setUpAnimationIds = function(dataArrayItem) {
		var actions = [];
		if(dataArrayItem.tbsStats.actions) {
			actions = dataArrayItem.tbsStats.actions;
		} else if(dataArrayItem.tbsStats.action) {
			actions.push(dataArrayItem.tbsStats.action);
		}
		
		actions.forEach(function (action) {
			action.hitGroups.forEach(function (hitGroup) {
				if(hitGroup.attackMotion) {
					hitGroup.attackMotion.imageId = DataManager.getWeaponImageId(hitGroup.attackMotion.image);
					if(hitGroup.attackMotion.castAnimation) {
						hitGroup.attackMotion.castAnimationId = 0;
						var i;
						for(i = 1; i < $dataAnimations.length; i++) {
							if($dataAnimations[i].name.toLowerCase() === hitGroup.attackMotion.castAnimation.toLowerCase()) {
								hitGroup.attackMotion.castAnimationId = i;
								break;
							}
						}
					}
					if(hitGroup.attackMotion.delayedCastAnimation) {
						hitGroup.attackMotion.delayedCastAnimationId = 0;
						var i;
						for(i = 1; i < $dataAnimations.length; i++) {
							if($dataAnimations[i].name.toLowerCase() === hitGroup.attackMotion.delayedCastAnimation.toLowerCase()) {
								hitGroup.attackMotion.delayedCastAnimationId = i;
								break;
							}
						}
					}
				}
				if(hitGroup.hits) {
					hitGroup.hits.forEach(function (hit) {
						if(hit.initialAnimation) {
							hit.initialAnimationId = 0;
							var i;
							for(i = 1; i < $dataAnimations.length; i++) {
								if($dataAnimations[i].name.toLowerCase() === hit.initialAnimation.toLowerCase()) {
									hit.initialAnimationId = i;
									break;
								}
							}
						}
						if(hit.animation) {
							hit.animationId = 0;
							var i;
							for(i = 1; i < $dataAnimations.length; i++) {
								if($dataAnimations[i].name.toLowerCase() === hit.animation.toLowerCase()) {
									hit.animationId = i;
									break;
								}
							}
						}
						if(hit.missAnimation) {
							hit.missAnimationId = 0;
							var i;
							for(i = 1; i < $dataAnimations.length; i++) {
								if($dataAnimations[i].name.toLowerCase() === hit.missAnimation.toLowerCase()) {
									hit.missAnimationId = i;
									break;
								}
							}
						}
						if(hit.ongoingAnimation) {
							hit.ongoingAnimationId = 0;
							var i;
							for(i = 1; i < $dataAnimations.length; i++) {
								if($dataAnimations[i].name.toLowerCase() === hit.ongoingAnimation.toLowerCase()) {
									hit.ongoingAnimationId = i;
									break;
								}
							}
						}
						if(hit.ongoingMissAnimation) {
							hit.ongoingMissAnimationId = 0;
							var i;
							for(i = 1; i < $dataAnimations.length; i++) {
								if($dataAnimations[i].name.toLowerCase() === hit.ongoingMissAnimation.toLowerCase()) {
									hit.ongoingMissAnimationId = i;
									break;
								}
							}
						}
					});
				}
			});
		});
	};
	
	DataManager.getWeaponImageId = function(imageName) {
		if(!imageName) { return 0; }
		var weaponImageId = 0;
		switch(imageName.toLowerCase()) {
			case "dagger":
				weaponImageId = 1;
				break;
			case "sword":
				weaponImageId = 2;
				break;
			case "flail":
				weaponImageId = 3;
				break;
			case "axe":
				weaponImageId = 4;
				break;
			case "whip":
				weaponImageId = 5;
				break;
			case "cane":
				weaponImageId = 6;
				break;
			case "bow":
				weaponImageId = 7;
				break;
			case "crossbow":
				weaponImageId = 8;
				break;
			case "gun":
				weaponImageId = 9;
				break;
			case "claw":
				weaponImageId = 10;
				break;
			case "glove":
				weaponImageId = 11;
				break;
			case "spear":
				weaponImageId = 12;
				break;
			case "mace":
				weaponImageId = 13;
				break;
			case "rod":
				weaponImageId = 14;
				break;
			case "club":
				weaponImageId = 15;
				break;
			case "combat chain":
				weaponImageId = 16;
				break;
			case "futuristic sword":
				weaponImageId = 17;
				break;
			case "iron pipe":
				weaponImageId = 18;
				break;
			case "slingshot":
				weaponImageId = 19;
				break;
			case "shotgun":
				weaponImageId = 20;
				break;
			case "rifle":
				weaponImageId = 21;
				break;
			case "chainsaw":
				weaponImageId = 22;
				break;
			case "railgun":
				weaponImageId = 23;
				break;
			case "stun rod":
				weaponImageId = 24;
				break;
		}
		return weaponImageId;
	};
	
	//battler base
	Game_BattlerBase.prototype.initMembers = function() {
		this._hp = 1;
		this._mp = 0;
		this._tp = 0;
		this._hidden = false;
		this.clearParamPlus();
		this.clearStates();
		this.clearBuffs();
		this._stress = 0;
		this._damage = {};
		this._damage.mind = 0;
		this._damage.head = 0;
		this._damage.torso = 0;
		this._damage.leftArm = 0;
		this._damage.rightArm = 0;
		this._damage.leftLeg = 0;
		this._damage.rightLeg = 0;
		this._tbsBuffs = [];
		this._skillPoints = {};
		
		this._skillPoints.meleeAcc = 0;
		this._skillPoints.rangedAcc = 0;
		this._skillPoints.mentalAcc = 0;
		
		this._skillPoints.physEvade = 0;
		this._skillPoints.tripEvade = 0;
		this._skillPoints.mentalEvade = 0;
		
		this._skillPoints.manualDex = 0;
		this._skillPoints.perception = 0;
		
		this._skillPoints.meleeWeapons = 0;
		this._skillPoints.throwingWeapons = 0;
		this._skillPoints.rangedWeapons = 0;
		this._skillPoints.whiteMagic = 0;
		this._skillPoints.blackMagic = 0;
		this._skillPoints.lockpicking = 0;
		this._skillPoints.electronics = 0;
		this._skillPoints.computers = 0;
		
		this._displayName = undefined;
		this._stressCost = 0;
		this._skillXP = 0;
		this._respecXP = 0;
		this.initAllItems();
	};

	Game_BattlerBase.prototype.initAllItems = function() {
		this._items = [];
		var i;
		for(i = 0; i < this.maxItems(); i++) {
			var item = {};
			item.type = "";
			item.id = 0;
			this._items[i] = item;
		}
	};
	
	Game_BattlerBase.prototype.items = function() {
		return this._items;
	};
	
	Game_BattlerBase.prototype.itemType = function(item) {
		if (!item) {
			return "";
		} else if (DataManager.isItem(item)) {
			return "item";
		} else if (DataManager.isWeapon(item)) {
			return "weapon";
		} else if (DataManager.isArmor(item)) {
			return "armor";
		} else {
			return "";
		}
	};
	
	Game_BattlerBase.prototype.numItems = function(item) {
		var count = 0;
		var type = this.itemType(item);
		var i;
		for(i = 0; i < this.maxItems(); i++) {
			count += this._items[i].type === type && this._items[i].id === item.id ? 1 : 0;
		}
		return count;
	};
	
	Game_BattlerBase.prototype.totalItemCount = function() {
		var count = 0;
		var i;
		for(i = 0; i < this.maxItems(); i++) {
			count += this._items[i].id > 0 && this._items[i].type !== "";
		}
		return count;
	};
	
	Game_BattlerBase.prototype.hasItem = function(item) {
		return this.numItems(item) > 0;
	};

	Game_BattlerBase.prototype.maxItems = function() {
		return 6;
	};
	
	Game_BattlerBase.prototype.tradeItemWithSelf = function() {
	};
	
	Game_BattlerBase.prototype.gainItem = function(item) {
		if(this.totalItemCount() >= this.maxItems()) { return false; }
		var type = this.itemType(item);
		var gained = false;
		var i;
		for(i = 0; i < this.maxItems(); i++) {
			if(this._items[i].id <= 0 && this._items[i].type === "") {
				this._items[i].id = item.id;
				this._items[i].type = type;
				gained = true;
				$gameMap.requestRefresh();
				break;
			}
		}
		return gained;
	};
	
	Game_BattlerBase.prototype.loseItem = function(item) {
		var type = this.itemType(item);
		var lost = false;
		var i;
		for(i = 0; i < this.maxItems(); i++) {
			if(this._items[i].type === type && this._items[i].id === item.id) {
				this._items[i].id = 0;
				this._items[i].type = "";
				lost = true;
				$gameMap.requestRefresh();
				break;
			}
		}
		return lost;
	};
	
	Game_BattlerBase.prototype.gainItemAtIndex = function(item, index) {
		var type = this.itemType(item);
		index = Math.max(0, Math.min(this.maxItems()-1, index));
		this._items[index].id = item ? item.id : 0;
		this._items[index].type = type;
		$gameMap.requestRefresh();
	};
	
	Game_BattlerBase.prototype.loseItemAtIndex = function(index) {
		index = Math.max(0, Math.min(this.maxItems()-1, index));
		this._items[index].id = 0;
		this._items[index].type = "";
		$gameMap.requestRefresh();
	};
	
	Game_BattlerBase.prototype.gainActorItemAtIndex = function(item, index) {
		index = Math.max(0, Math.min(this.maxItems()-1, index));
		this._items[index].id = item ? item.id : 0;
		this._items[index].type = item ? item.type : "";
		$gameMap.requestRefresh();
	};
	
	Game_BattlerBase.prototype.swapItemLocations = function(indexOne, indexTwo) {
		var itemOne = {};
		var itemTwo = {};
		itemOne.type = this._items[indexOne].type;
		itemOne.id = this._items[indexOne].id;
		itemTwo.type = this._items[indexTwo].type;
		itemTwo.id = this._items[indexTwo].id;
		this._items[indexOne].type = itemTwo.type;
		this._items[indexOne].id = itemTwo.id;
		this._items[indexTwo].type = itemOne.type;
		this._items[indexTwo].id = itemOne.id;
		$gameMap.requestRefresh();
	};

	Game_BattlerBase.prototype.allItems = function() {
		return this.items();
	};
	
	Game_BattlerBase.prototype.setDisplayName = function(displayName) {
		this._displayName = displayName;
	};
	
	Game_BattlerBase.prototype.displayName = function() {
		return this._displayName == undefined ? this.nickname() : this._displayName;
	};
	
	Game_BattlerBase.prototype.nickname = function() {
		return this.name();
	};
	
	Game_BattlerBase.prototype.name = function() {
		return "";
	};
	
	Game_BattlerBase.prototype.refresh = function() {
		this.stateResistSet().forEach(function(stateId) {
			this.eraseState(stateId);
		}, this);
		this._hp = this._hp.clamp(0, this.mhp);
		this._mp = this._mp.clamp(0, this.mmp);
		this._tp = this._tp.clamp(0, this.maxTp());
		this._stress = this._stress.clamp(0, 100);
		this._damage.head = this._damage.head.clamp(0, 100);
		this._damage.torso = this._damage.torso.clamp(0, 100);
		this._damage.leftArm = this._damage.leftArm.clamp(0, 100);
		this._damage.rightArm = this._damage.rightArm.clamp(0, 100);
		this._damage.leftLeg = this._damage.leftLeg.clamp(0, 100);
		this._damage.rightLeg = this._damage.rightLeg.clamp(0, 100);
		this._damage.mind = this._damage.mind.clamp(0, 100);
	};

	Game_BattlerBase.prototype.recoverAll = function() {
		this.clearStates();
		this._hp = this.mhp;
		this._mp = this.mmp;
		this._stress = 0;
		this._damage.head = 0;
		this._damage.torso = 0;
		this._damage.leftArm = 0;
		this._damage.rightArm = 0;
		this._damage.leftLeg = 0;
		this._damage.rightLeg = 0;
		this._damage.mind = 0;
	};
	
	Game_BattlerBase.prototype.setStress = function(newStress) {
		this._stress = Math.min(100, Math.max(0, newStress));
	};
	
	Game_BattlerBase.prototype.adjustStress = function(change) {
		this.setStress(this._stress + change);
	};
	
	Game_BattlerBase.prototype.clearStress = function() {
		this.setStress(0);
	};
	
	Game_BattlerBase.prototype.stressModifier = function() {
		return Math.floor(this.stress() / 20);
	};
	
	Game_BattlerBase.prototype.stress = function() {
		return Math.max(0, this._stress + this._stressCost);
	};
	
	Game_BattlerBase.prototype.setDamage = function(part, damage) {
		if(this._damage[part] === undefined) { return; }
		this._damage[part] = Math.min(100, Math.max(0, damage));
	};
	
	Game_BattlerBase.prototype.adjustDamage = function(part, change) {
		this.setDamage(part, (this._damage[part] === undefined ? 0 : this._damage[part]) + change);
	};
	
	Game_BattlerBase.prototype.getDamage = function(part) {
		return this._damage[part];
	};
	
	Game_BattlerBase.prototype.isDown = function() {
		return this._damage.torso >= 100 || this._damage.head >= 100 || this._damage.mind >= 100;
	};
	
	Game_BattlerBase.prototype.addTbsBuffs = function(buffs) {
		if(buffs) {
			var that = this;
			buffs.forEach(function (buff) {
				that.addTbsBuff(buff);
			});
		}
	};
	
	Game_BattlerBase.prototype.addTbsBuff = function(buff) {
		if(buff) {
			this._tbsBuffs.push(buff);
		}
	};
	
	Game_BattlerBase.prototype.tbsBuffs = function() {
		return this._tbsBuffs;
	};
	
	Game_BattlerBase.prototype.tickTbsBuffs = function() {
		var newBuffs = [];
		this._tbsBuffs.forEach(function (buff) {
			buff.duration--;
			if(buff.duration > 0) {
				newBuffs.push(buff);
			}
		});
		this._tbsBuffs = newBuffs;
	};
	
	Game_BattlerBase.prototype.clearTbsBuffs = function() {
		this._tbsBuffs = [];
	};
	
	Game_BattlerBase.prototype.checkLearnedSkills = function() {
	};
	
	Game_BattlerBase.prototype.setSkillPoints = function(skill, points) {
		if(this._skillPoints[skill] === undefined) { return; }
		this._skillPoints[skill] = Math.min(7, Math.max(0, points));
		this.checkLearnedSkills();
	};
	
	Game_BattlerBase.prototype.adjustSkillPoints = function(skill, change) {
		this.setSkillPoints(skill, (this._skillPoints[skill] === undefined ? 0 : this._skillPoints[skill]) + change);
	};
	
	Game_BattlerBase.prototype.skillPoints = function(skill) {
		return !this._skillPoints[skill] === undefined ? 0 : this._skillPoints[skill];
	};
	
	Game_BattlerBase.prototype.skillUpgradeCost = function(skill) {
		return Math.pow(this.skillPoints(skill)+1, 2)*100;
	};
	
	Game_BattlerBase.prototype.skillDowngradeCost = function(skill) {
		var skillPoints = this.skillPoints(skill);
		return skillPoints > 0 ? Math.pow(this.skillPoints(skill), 2)*100 : 0;;
	};
	
	Game_BattlerBase.prototype.skillXP = function() {
		return this._skillXP;
	};
	
	Game_BattlerBase.prototype.adjustSkillXP = function(amount) {
		this._skillXP = Math.max(0, this._skillXP + amount);
	};
	
	Game_BattlerBase.prototype.respecXP = function() {
		return this._respecXP;
	};
	
	Game_BattlerBase.prototype.adjustRespecXP = function(amount) {
		this._respecXP = Math.max(0, this._respecXP + amount);
	};
	
	Game_BattlerBase.prototype.isDead = function() {
		return this.isAppeared() && (this.isDeathStateAffected() || this.isDown());
	};
	
	Game_BattlerBase.prototype.isAlive = function() {
		return this.isAppeared() && !this.isDeathStateAffected() && !this.isDown();
	};
	
	Game_BattlerBase.prototype.stateMotionIndex = function() {
		if(this.isDown()) { return 3; }
		var states = this.states();
		if (states.length > 0) {
			return states[0].motion;
		} else {
			return 0;
		}
	};
	
	Game_BattlerBase.prototype.handedness = function() {
		return "right";
	};
	
	Game_BattlerBase.prototype.limbsType = function() {
		return "humanoid";
	};
	
	Game_BattlerBase.prototype.uniqueSkills = function() {
		return [];
	};
	
	Game_BattlerBase.prototype.totalSkill = function(skill) {
		return this.skillPoints(skill) + this.getSkillBuff(skill);
	};
	
	Game_BattlerBase.prototype.getSkillBuff = function(skill) {
		var total = 0;
		this._tbsBuffs.forEach(function (buff) {
			total += buff.core === undefined ? 0 : buff.core[skill];
		});
		return total;
	};
	
	Game_BattlerBase.prototype.baseRange = function() {
		return 2;
	};
	
	Game_BattlerBase.prototype.moveRange = function() {
		return 12;
	};
	
	Game_BattlerBase.prototype.isFlying = function() {
		return false;
	};
	
	Game_BattlerBase.prototype.toughness = function() {
		return 4;
	};
	
	Game_BattlerBase.prototype.mentalToughness = function() {
		return 4;
	};
	
	Game_BattlerBase.prototype.stressRecovery = function() {
		return 20;
	};
	
	Game_BattlerBase.prototype.adjustStressCost = function(adjustValue) {
		this._stressCost = Math.max(0, this._stressCost + adjustValue);
	};
	
	Game_BattlerBase.prototype.clearStressCost = function() {
		this._stressCost = 0;
	};
	
	Game_BattlerBase.prototype.applyStressCost = function() {
		this.adjustStress(this._stressCost);
		this.clearStressCost();
	};
	
	Game_BattlerBase.prototype.baseProtection = function() {
		return undefined;
	};
	
	Game_BattlerBase.prototype.blankDummy = function() {
		return false;
	};
	
	Game_BattlerBase.prototype.sumProtection = function(protOne, protTwo) {
		var defaultProtection = {};
		defaultProtection.defense = {};
		defaultProtection.defense.solid = 0;
		defaultProtection.defense.fluid = 0;
		defaultProtection.armor = {};
		defaultProtection.armor.blunt = 0;
		defaultProtection.armor.cut = 0;
		defaultProtection.armor.bullet = 0;
		defaultProtection.armor.fire = 0;
		defaultProtection.armor.ice = 0;
		defaultProtection.armor.corrosion = 0;
		defaultProtection.armor.conducted = 0;
		
		if(protOne === undefined && protTwo === undefined) { return defaultProtection; }
		if(protOne === undefined) { protOne = defaultProtection; }
		
		if(protOne.defense === undefined) { protOne.defense = defaultProtection.defense; }
		if(protOne.defense.solid === undefined) { protOne.defense.solid = 0; }
		if(protOne.defense.fluid === undefined) { protOne.defense.fluid = 0; }
		
		if(protOne.armor === undefined) { protOne.armor = defaultProtection.armor; }
		if(protOne.armor.blunt === undefined) { protOne.armor.blunt = 0; }
		if(protOne.armor.cut === undefined) { protOne.armor.cut = 0; }
		if(protOne.armor.bullet === undefined) { protOne.armor.bullet = 0; }
		if(protOne.armor.fire === undefined) { protOne.armor.fire = 0; }
		if(protOne.armor.ice === undefined) { protOne.armor.ice = 0; }
		if(protOne.armor.corrosion === undefined) { protOne.armor.corrosion = 0; }
		if(protOne.armor.conducted === undefined) { protOne.armor.conducted = 0; }
		
		if(protTwo === undefined) { return protOne; }
		
		if(protTwo.defense !== undefined)
		{
			protOne.defense.solid += protTwo.defense.solid === undefined ? 0 : protTwo.defense.solid;
			protOne.defense.fluid += protTwo.defense.fluid === undefined ? 0 : protTwo.defense.fluid;
		}
		
		if(protTwo.armor !== undefined)
		{
			protOne.armor.blunt += protTwo.armor.blunt === undefined ? 0 : protTwo.armor.blunt;
			protOne.armor.cut += protTwo.armor.cut === undefined ? 0 : protTwo.armor.cut;
			protOne.armor.bullet += protTwo.armor.bullet === undefined ? 0 : protTwo.armor.bullet;
			protOne.armor.fire += protTwo.armor.fire === undefined ? 0 : protTwo.armor.fire;
			protOne.armor.ice += protTwo.armor.ice === undefined ? 0 : protTwo.armor.ice;
			protOne.armor.corrosion += protTwo.armor.corrosion === undefined ? 0 : protTwo.armor.corrosion;
			protOne.armor.conducted += protTwo.armor.conducted === undefined ? 0 : protTwo.armor.conducted;
		}
		
		return protOne;
	};
	
	Game_BattlerBase.prototype.getAllEquipActionInfos = function() {
		var returnActionInfos = [];
		var equips = this.equips();
		if(equips && equips.length) {
			var i;
			for(i = 0; i < equips.length; i++)
			{
				if(equips[i] && equips[i].tbsStats.actions && equips[i].tbsStats.actions.length > 0)
				{
					var j;
					var actions = equips[i].tbsStats.actions;
					for(j = 0; j < actions.length; j++)
					{
						var returnActionInfo = {};
						returnActionInfo.action = actions[j];
						returnActionInfo.sourceEquip = equips[i];
						returnActionInfo.sourceEquipSlotId = i;
						returnActionInfo.canTargetBodyPart = false;
						returnActionInfo.canTargetDownedBodyPart = false;
						if(actions[j].hitGroups && actions[j].hitGroups.length > 0) {
							var groups = actions[j].hitGroups;
							var k;
							for(k = 0; k < groups.length; k++) {
								if(groups[k].hits && groups[k].hits.length > 0) {
									var hits = groups[k].hits;
									returnActionInfo.canTargetBodyPart = hits.some(function (hit) {
										if(hit.heal && hit.heal.damage !== undefined && hit.heal.damage > 0 && (hit.aoe === undefined || hit.aoe <= 0)) {
											return true;
										}
										return false;
									});
									returnActionInfo.canTargetDownedBodyPart = hits.some(function (hit) {
										if(hit.aoe === undefined || hit.aoe <= 0) {
											return true;
										}
										return false;
									});
								}
							}
						}
						
						var requirements = actions[j].skillRequirements;
						
						if(requirements === undefined) { returnActionInfos.push(returnActionInfo); continue; }
						
						var canUseAction = true;
						for(k = 0; k < requirements.length; k++)
						{
							if(this.totalSkill(requirements[k].skill) < requirements[k].level)
							{
								canUseAction = false;
								break;
							}
						}
						if(!canUseAction) { continue; }
						returnActionInfos.push(returnActionInfo);
					}
				}
			}
		}
		var actorItems = this.items();
		if(actorItems && actorItems.length) {
			var i;
			for(i = 0; i < actorItems.length; i++)
			{
				var item = undefined;
				if(actorItems[i].type === "item") {
					item = $dataItems[actorItems[i].id];
				} else if(actorItems[i].type === "weapon") {
					item = $dataWeapons[actorItems[i].id];
				} else if(actorItems[i].type === "armor") {
					item = $dataArmors[actorItems[i].id];
				}
				if(item && item.tbsStats.actions && item.tbsStats.actions.length > 0)
				{
					var j;
					var actions = item.tbsStats.actions;
					for(j = 0; j < actions.length; j++)
					{0
						var returnActionInfo = {};
						returnActionInfo.action = actions[j];
						returnActionInfo.sourceEquip = item;
						returnActionInfo.sourceEquipSlotId = -1;
						returnActionInfo.sourceItemIndex = i;
						returnActionInfo.canTargetBodyPart = false;
						returnActionInfo.canTargetDownedBodyPart = false;
						if(actions[j].hitGroups && actions[j].hitGroups.length > 0) {
							var groups = actions[j].hitGroups;
							var k;
							for(k = 0; k < groups.length; k++) {
								if(groups[k].hits && groups[k].hits.length > 0) {
									var hits = groups[k].hits;
									returnActionInfo.canTargetBodyPart = hits.some(function (hit) {
										if(hit.heal && hit.heal.damage !== undefined && hit.heal.damage > 0 && (hit.aoe === undefined || hit.aoe <= 0)) {
											return true;
										}
										return false;
									});
									returnActionInfo.canTargetDownedBodyPart = hits.some(function (hit) {
										if(hit.aoe === undefined || hit.aoe <= 0) {
											return true;
										}
										return false;
									});
								}
							}
						}
						
						var requirements = actions[j].skillRequirements;
						
						if(requirements === undefined) { returnActionInfos.push(returnActionInfo); continue; }
						
						var canUseAction = true;
						for(k = 0; k < requirements.length; k++)
						{
							if(this.totalSkill(requirements[k].skill) < requirements[k].level)
							{
								canUseAction = false;
								break;
							}
						}
						if(!canUseAction) { continue; }
						returnActionInfos.push(returnActionInfo);
					}
				}
			}
		}
		return returnActionInfos;
	};
	
	Game_BattlerBase.prototype.protection = function(bodyPart) {
		if(bodyPart === "mental")
		{
			return this.mentalProtection();
		}
		
		var totalProtection = {};
		totalProtection.defense = {};
		totalProtection.defense.solid = 0;
		totalProtection.defense.fluid = 0;
		totalProtection.armor = {};
		totalProtection.armor.blunt = 0;
		totalProtection.armor.cut = 0;
		totalProtection.armor.bullet = 0;
		totalProtection.armor.fire = 0;
		totalProtection.armor.ice = 0;
		totalProtection.armor.corrosion = 0;
		totalProtection.armor.conducted = 0;
		
		totalProtection = this.sumPartProtection(totalProtection, this.baseProtection(), bodyPart);
		
		var that = this;
		this._tbsBuffs.forEach(function (buff) {
			if(buff.protection) {
				totalProtection = that.sumPartProtection(totalProtection, buff.protection, bodyPart);
			}
		});
		
		var equips = this.equips();
		if(equips && equips.length) {
			var i;
			for(i = 0; i < equips.length; i++)
			{
				if(equips[i] && equips[i].tbsStats.protection !== undefined)
				{
					totalProtection = this.sumPartProtection(totalProtection, equips[i].tbsStats.protection, bodyPart, i, equips[i].tbsStats.hands);
				}
			}
		}
		return totalProtection;
	};
	
	Game_BattlerBase.prototype.sumPartProtection = function(protOne, protTwo, bodyPart, equipIndex, hands) {
		if(!protTwo) { return protOne; }
		if(bodyPart !== "leftHeld" && bodyPart !== "rightHeld") {
			protOne = this.sumProtection(protOne, protTwo.fullBody, true);
		}
		protOne = this.sumProtection(protOne, protTwo[bodyPart], true);
		
		if((bodyPart === "leftHeld" && ((this.handedness() === "left" && equipIndex == 0)
			|| (this.handedness() === "right" && equipIndex == 1)))
			|| (bodyPart === "rightHeld" && ((this.handedness() === "right" && equipIndex == 0)
			|| (this.handedness() === "left" && equipIndex == 1))))
		{
			protOne = this.sumProtection(protOne, protTwo.equippedArm);
		}
		else if(bodyPart === "leftArm" || bodyPart === "rightArm")
		{
			protOne = this.sumProtection(protOne, protTwo.arms, true);
		}
		else if(bodyPart === "leftLeg" || bodyPart === "rightLeg")
		{
			protOne = this.sumProtection(protOne, protTwo.legs, true);
		}
		return protOne;
	};
	
	Game_BattlerBase.prototype.mentalProtection = function() {
		var totalProtection = {};
		totalProtection.defense = 0;
		totalProtection.armor = 0;
		
		var baseProtection = this.baseProtection();
		if(baseProtection && baseProtection.mental) {
			if(baseProtection.mental.defense !== undefined) {
				totalProtection.defense += baseProtection.mental.defense;
			}
			if(baseProtection.mental.armor !== undefined) {
				totalProtection.armor += baseProtection.mental.armor;
			}
		}
		
		var that = this;
		this._tbsBuffs.forEach(function (buff) {
			if(buff.protection && buff.protection.mental) {
				if(buff.protection.mental.defense !== undefined) {
					totalProtection.defense += buff.protection.mental.defense;
				}
				if(buff.protection.mental.armor !== undefined) {
					totalProtection.armor += buff.protection.mental.armor;
				}
			}
		});
		
		var equips = this.equips();
		if(equips && equips.length) {
			var i;
			for(i = 0; i < equips.length; i++)
			{
				if(equips[i] && equips[i].tbsStats.protection !== undefined && equips[i].tbsStats.protection.mental !== undefined)
				{
					if(equips[i].tbsStats.protection.mental.defense !== undefined) {
						totalProtection.defense += equips[i].tbsStats.protection.mental.defense;
					}
					if(equips[i].tbsStats.protection.mental.armor !== undefined) {
						totalProtection.armor += equips[i].tbsStats.protection.mental.armor;
					}
				}
			}
		}
		return totalProtection;
	};
	
	Game_BattlerBase.prototype.traitsWithId = function(code, id) {
		return this.allTraits().filter(function(trait) {
			if(!trait) { return false; }
			return trait.code === code && trait.dataId === id;
		});
	};
	
	Game_BattlerBase.prototype.traits = function(code) {
		return this.allTraits().filter(function(trait) {
			if(!trait) { return false; }
			return trait.code === code;
		});
	};
	
	Game_BattlerBase.prototype.isDualWield = function() {
		return false;
	};
	
	Game_BattlerBase.prototype.canEquip = function(item) {
		if (!item) {
			return false;
		} else {
			return true;
		}
	};
	
	Game_BattlerBase.prototype.canUseAction = function(actionInfo) {
		if(!actionInfo || !actionInfo.action) { return false; }
		var action = actionInfo.action;
		
		if(!actionInfo.sourceEquip || actionInfo.sourceEquipSlotId == undefined || actionInfo.sourceEquipSlotId < 0) {
			var isItemAction = this._items.some(function (battlerItem) {
				if(battlerItem.id <= 0 || battlerItem.type == undefined) { return false; }
				var item = undefined;
				if(battlerItem.type == "item") {
					item = $dataItems[battlerItem.id];
				} else if(battlerItem.type == "weapon") {
					item = $dataWeapons[battlerItem.id];
				} else if(battlerItem.type == "armor") {
					item = $dataArmors[battlerItem.id];
				}
				return item.tbsStats.actions && item.tbsStats.actions.some(function (itemAction) {
					return itemAction == action;
				});
			});
			return isItemAction || this.skills().some(function(skill) { return skill.tbsStats.action && skill.tbsStats.action === action; });
		} else {
			var equips = this.equips();
			return equips.length > actionInfo.sourceEquipSlotId && equips[actionInfo.sourceEquipSlotId] === actionInfo.sourceEquip;
		}
	};
	
	Game_BattlerBase.prototype.equips = function() {
		return [];
	};
	
	Game_BattlerBase.prototype.skills = function() {
		return [];
	};
	
	Game_BattlerBase.prototype.isHitValid = function(hit) {
		if(!hit.heal || hit.heal.damage === undefined || hit.heal.damage <= 0) { return false; }
			
		return this.getDamage("head") > 0 ||
			this.getDamage("torso") > 0 ||
			this.getDamage("leftArm") > 0 ||
			this.getDamage("rightArm") > 0 ||
			this.getDamage("leftLeg") > 0 ||
			this.getDamage("rightLeg") > 0;
	};
	
	Game_BattlerBase.prototype.applyHit = function(hit, bodyPart) {
		if(!hit.heal || hit.heal.damage === undefined || hit.heal.damage <= 0) { return; }
		
		if(bodyPart === "undefined") {
			this.adjustDamage("head", -hit.heal.damage);
			this.adjustDamage("torso", -hit.heal.damage);
			this.adjustDamage("leftArm", -hit.heal.damage);
			this.adjustDamage("rightArm", -hit.heal.damage);
			this.adjustDamage("leftLeg", -hit.heal.damage);
			this.adjustDamage("rightLeg", -hit.heal.damage);
		} else {
			this.adjustDamage(bodyPart, -hit.heal.damage);
		}
	};
	
	//battler
	Game_Battler.prototype.initMembers = function() {
		Game_BattlerBase.prototype.initMembers.call(this);
		this._actions = [];
		this._speed = 0;
		this._result = new Game_ActionResult();
		this._actionState = '';
		this._lastTargetIndex = 0;
		this._animations = [];
		this._ongoingAnimations = [];
		this._currentlyOngoingAnims = [];
		this._damagePopup = false;
		this._effectType = null;
		this._motionType = null;
		this._weaponImageId = 0;
		this._motionRefresh = false;
		this._selected = false;
		this._screenX = 0;
		this._screenY = 0;
		this._shouldMoveIn = false;
		this._tbsResults = undefined;
	};
	
	Game_Battler.prototype.setTbsResults = function(tbsResults) {
		this._tbsResults = tbsResults;
	};
	
	Game_Battler.prototype.getTbsResults = function() {
		return this._tbsResults;
	};
	
	Game_Battler.prototype.clearTbsResults = function() {
		this._tbsResults = undefined;
	};
	
	Game_Battler.prototype.performDeflection = function() {
		SoundManager.playDeflectionSound();
	};
	
	Game_Battler.prototype.performStress = function() {
		SoundManager.playStressSound();
	};
	
	Game_Battler.prototype.setShouldMoveIn = function(should) {
		this._shouldMoveIn = false;
	};
	
	Game_Battler.prototype.setScreenPos = function(x, y) {
		this._screenX = x;
		this._screenY = y;
	};
	
	Game_Battler.prototype.shouldMoveIn = function() {
		return this._shouldMoveIn;
	};
	
	Game_Battler.prototype.screenX = function() {
		return this._screenX;
	};

	Game_Battler.prototype.screenY = function() {
		return this._screenY;
	};
	
	Game_Battler.prototype.changeEquip = function(slotId, item) {
	};
	
	Game_Battler.prototype.consumeItem = function(item) {
		if (DataManager.isItem(item) && item.consumable) {
			this.loseItem(item);
		}
	};
	
	Game_Battler.prototype.useActionItem = function(actionInfo) {
		if(!actionInfo || !actionInfo.action.consumesItem
			|| (!actionInfo.sourceEquip && actionInfo.sourceItemIndex === undefined)) { return false; }
		if(actionInfo.sourceEquipSlotId !== undefined && actionInfo.sourceEquipSlotId >= 0) {
			this.changeEquip(actionInfo.sourceEquipSlotId, null);
		}
		if(actionInfo.sourceItemIndex === undefined) {
			this.consumeItem(actionInfo.sourceEquip);
		} else {
			this.loseItemAtIndex(actionInfo.sourceItemIndex);
		}
		return true;
	};
	
	Game_Battler.prototype.performActionStart = function(action) {
		//if (!action.isGuard()) {
			this.setActionState('acting');
		//}
	};

	Game_Battler.prototype.performAction = function(hitGroup) {
	};

	Game_Battler.prototype.performActionEnd = function() {
		this.setActionState('done');
	};
	
	Game_Battler.prototype.startAnimation = function(animationId, mirror, delay, variance) {
		var data = { animationId: animationId, mirror: mirror, delay: delay, variance: variance };
		this._animations.push(data);
	};
	
	Game_Battler.prototype.clearAnimations = function() {
		this._animations = [];
		this._ongoingAnimations = [];
		this._currentlyOngoingAnims = [];
	};
	
	Game_Battler.prototype.clearCurrentlyOngoingAnims = function() {
		this._currentlyOngoingAnims = [];
		this._endOngoingAnimations = true;
	};
	
	Game_Battler.prototype.isOngoingAnimationRequested = function() {
		return this._ongoingAnimations.length > 0;
	};
	
	Game_Battler.prototype.isOngoingAnimationEndRequested = function() {
		var returnVal = this._endOngoingAnimations;
		this._endOngoingAnimations = false;
		return returnVal;
	};
	
	Game_Battler.prototype.shiftOngoingAnimation = function() {
		return this._ongoingAnimations.shift();
	};
	
	Game_Battler.prototype.startOngoingAnimation = function(animationId, mirror, delay) {
		var data = { animationId: animationId, mirror: mirror, delay: delay };
		this._ongoingAnimations.push(data);
	};
	
	Game_Battler.prototype.addCurrentlyOngoingAnim = function(anim) {
		this._currentlyOngoingAnims.push(anim);
	};
	
	Game_Battler.prototype.updateCurrentlyOngoingAnims = function() {
		this._currentlyOngoingAnims.forEach(function (anim) {
			anim.time--;
		});
	};
	
	Game_Battler.prototype.ongoingAnimationsToReplay = function() {
		var returnArray = [];
		var remainingArray = [];
		var i;
		this._currentlyOngoingAnims.forEach(function (anim) {
			if(anim.time <= 0) {
				returnArray.push(anim);
			} else {
				remainingArray.push(anim);
			}
		});
		this._currentlyOngoingAnims = remainingArray;
		return returnArray;
	};
	
	//actor
	Game_Actor.prototype.performDeflection = function() {
		Game_Battler.prototype.performDeflection.call(this);
		this.requestMotion('evade');
	};
	
	Game_Actor.prototype.performStress = function() {
		Game_Battler.prototype.performStress.call(this);
		if (this.isSpriteVisible()) {
			this.requestMotion('damage');
		} else {
			$gameScreen.startShake(5, 5, 10);
		}
	};
	
	Game_Actor.prototype.checkLearnedSkills = function() {
		var i;
		for(i = 0; i <= $dataSkills.length; i++) {
			if(!$dataSkills[i]) { continue; }
			var skillStats = $dataSkills[i].tbsStats;
			if(skillStats.unlearnable || !skillStats.action || !skillStats.action.skillRequirements) {
				continue;
			}
			
			var skillReqs = skillStats.action.skillRequirements;
			var shouldLearn = true;
			var j;
			for(j = 0; j < skillReqs.length; j++) {
				if(this.skillPoints(skillReqs[j].skill) < skillReqs[j].level) {
					shouldLearn = false;
					break;
				}
			}
			
			if(shouldLearn) {
				this.learnSkill(i);
			} else {
				this.forgetSkill(i);
			}
		}
	};
	
	Game_Actor.prototype.handedness = function() {
		return this.actor().tbsStats.handedness;
	};
	
	Game_Actor.prototype.limbsType = function() {
		return this.actor().tbsStats.limbsType;
	};
	
	Game_Actor.prototype.uniqueSkills = function() {
		return this.currentClass().tbsStats.uniqueSkills;
	};
	
	Game_Actor.prototype.totalSkill = function(skill) {
		return (this.currentClass().tbsStats.startingSkills[skill] === undefined ? 0 : this.currentClass().tbsStats.startingSkills[skill])
			+ this.skillPoints(skill) + this.getSkillBuff(skill);
	};
	
	Game_Actor.prototype.baseProtection = function() {
		return this.currentClass().tbsStats.protection;
	};
	
	Game_Actor.prototype.paramPlus = function(paramId) {
		var value = Game_Battler.prototype.paramPlus.call(this, paramId);
		var equips = this.equips();
		for (var i = 0; i < equips.length; i++) {
			var item = equips[i];
			if (item && item.params) {
				value += item.params[paramId];
			}
		}
		return value;
	};
	
	Game_Actor.prototype.tradeItemWithSelf = function(newItem, oldItem, itemIndex) {
		if (newItem && !this.hasItem(newItem)) {
			return false;
		} else {
			this.loseItemAtIndex(itemIndex);
			this.gainItemAtIndex(oldItem, itemIndex);
			return true;
		}
	};
	
	Game_Actor.prototype.changeEquip = function(slotId, item, itemIndex) {
		if (this.tradeItemWithSelf(item, this.equips()[slotId], itemIndex)) {
			this._equips[slotId].setObject(item);
			this.refresh();
		}
	};
	
	Game_Actor.prototype.releaseUnequippableItems = function(forcing) {
		for (;;) {
			var slots = this.equipSlots();
			var equips = this.equips();
			var changed = false;
			for (var i = 0; i < equips.length; i++) {
				var item = equips[i];
				if (item && !this.canEquip(item)) {
					if (!forcing) {
						this.tradeItemWithParty(null, item);
					}
					this._equips[i].setObject(null);
					changed = true;
				}
			}
			if (!changed) {
				break;
			}
		}
	};
	
	Game_Actor.prototype.performActionStart = function(action) {
		Game_Battler.prototype.performActionStart.call(this, action);
	};

	Game_Actor.prototype.performAction = function(hitGroup) {
		Game_Battler.prototype.performAction.call(this, hitGroup);
		//if (action.isAttack()) {
		//	this.performAttack();
		//} else if (action.isGuard()) {
		//	this.requestMotion('guard');
		//} else if (action.isMagicSkill()) {
		//	this.requestMotion('spell');
		//} else if (action.isSkill()) {
		//	this.requestMotion('skill');
		//} else if (action.isItem()) {
		//	this.requestMotion('item');
		//}
		this.requestMotion(hitGroup.attackMotion.motion.toLowerCase());
		this.startWeaponAnimation(hitGroup.attackMotion.imageId);
	};

	Game_Actor.prototype.performActionEnd = function() {
		Game_Battler.prototype.performActionEnd.call(this);
	};

	Game_Actor.prototype.performAttack = function() {
		var weapons = this.weapons();
		var wtypeId = weapons[0] ? weapons[0].wtypeId : 0;
		var attackMotion = $dataSystem.attackMotions[wtypeId];
		if (attackMotion) {
			if (attackMotion.type === 0) {
				this.requestMotion('thrust');
			} else if (attackMotion.type === 1) {
				this.requestMotion('swing');
			} else if (attackMotion.type === 2) {
				this.requestMotion('missile');
			}
			this.startWeaponAnimation(attackMotion.weaponImageId);
		}
	};

	Game_Actor.prototype.performDamage = function() {
		Game_Battler.prototype.performDamage.call(this);
		if (this.isSpriteVisible()) {
			this.requestMotion('damage');
		} else {
			$gameScreen.startShake(5, 5, 10);
		}
		SoundManager.playActorDamage();
	};

	Game_Actor.prototype.performEvasion = function() {
		Game_Battler.prototype.performEvasion.call(this);
		this.requestMotion('evade');
	};

	Game_Actor.prototype.performMagicEvasion = function() {
		Game_Battler.prototype.performMagicEvasion.call(this);
		this.requestMotion('evade');
	};

	Game_Actor.prototype.performCounter = function() {
		Game_Battler.prototype.performCounter.call(this);
		this.performAttack();
	};

	Game_Actor.prototype.performCollapse = function() {
		Game_Battler.prototype.performCollapse.call(this);
		if ($gameParty.inBattle()) {
			SoundManager.playActorCollapse();
		}
	};
	
	Game_Actor.prototype.startAnimation = function(animationId, mirror, delay, variance) {
		Game_Battler.prototype.startAnimation.call(this, animationId, mirror, delay, variance);
	};
	
	//enemy
	Game_Enemy.prototype.performStress = function() {
		//Game_Battler.prototype.performStress.call(this);
		//this.requestEffect('blink');
	};
	
	Game_Enemy.prototype.isSpriteVisible = function() {
		return true;
	};
	
	Game_Enemy.prototype.handedness = function() {
		return this.enemy().tbsStats.handedness;
	};
	
	Game_Enemy.prototype.limbsType = function() {
		return this.enemy().tbsStats.limbsType;
	};
	
	Game_Enemy.prototype.uniqueSkills = function() {
		return this.enemy().tbsStats.uniqueSkills;
	};
	
	Game_Enemy.prototype.totalSkill = function(skill) {
		return (this.enemy().tbsStats.startingSkills[skill] === undefined ? 0 : this.enemy().tbsStats.startingSkills[skill])
			+ this.skillPoints(skill) + this.getSkillBuff(skill);
	};
	
	Game_Enemy.prototype.isFlying = function() {
		return this.enemy().tbsStats.flying;
	};
	
	Game_Enemy.prototype.baseProtection = function() {
		return this.enemy().tbsStats.protection;
	};
	
	Game_Enemy.prototype.blankDummy = function() {
		return !!this.enemy().tbsStats.blankDummy;
	};
	
	Game_Enemy.prototype.toughness = function() {
		return this.enemy().tbsStats.toughness === undefined 
			? Game_Battler.prototype.toughness.call(this)
			: this.enemy().tbsStats.toughness;
	};
	
	Game_Enemy.prototype.equips = function() {
		var returnEquips = [];
		var i;
		for(i = 0; i < 13; i++) {
			returnEquips[i] = undefined;
		}
		var equipment = this.enemy().tbsStats.equipment;
		if(!equipment) { return returnEquips; }
		if($dataWeapons[equipment.mainHand]) { returnEquips[0] = $dataWeapons[equipment.mainHand]; }
		if($dataWeapons[equipment.offhand]) { returnEquips[1] = $dataWeapons[equipment.offhand]; }
		if($dataArmors[equipment.accessoryOne]) { returnEquips[2] = $dataArmors[equipment.accessoryOne]; }
		if($dataArmors[equipment.accessoryTwo]) { returnEquips[3] = $dataArmors[equipment.accessoryTwo]; }
		if($dataArmors[equipment.accessoryThree]) { returnEquips[4] = $dataArmors[equipment.accessoryThree]; }
		if($dataArmors[equipment.accessoryFour]) { returnEquips[5] = $dataArmors[equipment.accessoryFour]; }
		if($dataArmors[equipment.accessoryFive]) { returnEquips[6] = $dataArmors[equipment.accessoryFive]; }
		if($dataItems[equipment.itemOne]) { returnEquips[7] = $dataItems[equipment.itemOne]; }
		if($dataItems[equipment.itemTwo]) { returnEquips[8] = $dataItems[equipment.itemTwo]; }
		if($dataItems[equipment.itemThree]) { returnEquips[9] = $dataItems[equipment.itemThree]; }
		if($dataItems[equipment.itemFour]) { returnEquips[10] = $dataItems[equipment.itemFour]; }
		if($dataItems[equipment.itemFive]) { returnEquips[11] = $dataItems[equipment.itemFive]; }
		if($dataItems[equipment.itemSix]) { returnEquips[12] = $dataItems[equipment.itemSix]; }
		
		return returnEquips;
	};
	
	Game_Enemy.prototype.skills = function() {
		var returnSkills = [];
		var actions = this.enemy().actions;
		if(!actions) { return returnSkills; }
		this.enemy().actions.forEach(function (action) {
			if($dataSkills[action.skillId]) { returnSkills.push($dataSkills[action.skillId]); }
		});
		return returnSkills;
	};
	
	Game_Enemy.prototype.performActionStart = function(action) {
		Game_Battler.prototype.performActionStart.call(this, action);
		this.requestEffect('whiten');
	};

	Game_Enemy.prototype.performAction = function(hitGroup) {
		Game_Battler.prototype.performAction.call(this, hitGroup);
	};

	Game_Enemy.prototype.performActionEnd = function() {
		Game_Battler.prototype.performActionEnd.call(this);
	};

	Game_Enemy.prototype.performDamage = function() {
		Game_Battler.prototype.performDamage.call(this);
		SoundManager.playEnemyDamage();
		this.requestEffect('blink');
	};

	Game_Enemy.prototype.performCollapse = function() {
		Game_Battler.prototype.performCollapse.call(this);
		switch (this.collapseType()) {
		case 0:
			this.requestEffect('collapse');
			SoundManager.playEnemyCollapse();
			break;
		case 1:
			this.requestEffect('bossCollapse');
			SoundManager.playBossCollapse1();
			break;
		case 2:
			this.requestEffect('instantCollapse');
			break;
		}
	};
})();
