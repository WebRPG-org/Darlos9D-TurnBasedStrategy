//=============================================================================
// TurnBasedStrategyWindows.js
//=============================================================================

/*:
 *
 * @plugindesc Window and menu handling for a turn based strategy game
 *
 * @author Darlos9D
 *
 * @help
 *
 * This plugin does not provide any commands.
 *
 */

//-----------------------------------------------------------------------------
// Window_ItemStatusBase
//
// The base for ItemStatus and EquipStatus

function Window_ItemStatusBase() {
    this.initialize.apply(this, arguments);
}

Window_ItemStatusBase.prototype = Object.create(Window_Base.prototype);
Window_ItemStatusBase.prototype.constructor = Window_ItemStatusBase;

Window_ItemStatusBase.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._actor = null;
    this._tempActor = null;
	this._statusPage = "none";
	this._actionsItem = null;
    this.refresh();
};

Window_ItemStatusBase.prototype.setActor = function(actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
};

Window_ItemStatusBase.prototype.refresh = function() {
	this.contents.clear();
	if(this._statusPage ===  "actions") {
		this.drawActions();
	} else if(this._statusPage ===  "skillRequirements") {
		this.drawSkillRequirements();
	} else if(this._statusPage ===  "protection") {
		this.drawProtection();
	} else if(this._statusPage ===  "description") {
		this.drawEquipDescription();
	}
	if(this._statusPage !== "none") {
		this.drawTabs();
	}
};

Window_ItemStatusBase.prototype.setTempActor = function(tempActor) {
    if (this._tempActor !== tempActor) {
        this._tempActor = tempActor;
        this.refresh();
    }
};

Window_ItemStatusBase.prototype.drawItem = function(x, y, paramId) {
    this.drawParamName(x + this.textPadding(), y, paramId);
    if (this._actor) {
        this.drawCurrentParam(x + 140, y, paramId);
    }
    this.drawRightArrow(x + 188, y);
    if (this._tempActor) {
        this.drawNewParam(x + 222, y, paramId);
    }
};

Window_ItemStatusBase.prototype.drawParamName = function(x, y, paramId) {
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.param(paramId), x, y, 120);
};

Window_ItemStatusBase.prototype.drawCurrentParam = function(x, y, paramId) {
    this.resetTextColor();
    this.drawText(this._actor.param(paramId), x, y, 48, 'right');
};

Window_ItemStatusBase.prototype.drawRightArrow = function(x, y) {
    this.changeTextColor(this.systemColor());
    this.drawText('\u2192', x, y, 32, 'center');
};

Window_ItemStatusBase.prototype.drawNewParam = function(x, y, paramId) {
    var newValue = this._tempActor.param(paramId);
    var diffvalue = newValue - this._actor.param(paramId);
    this.changeTextColor(this.paramchangeTextColor(diffvalue));
    this.drawText(newValue, x, y, 48, 'right');
};

Window_ItemStatusBase.prototype.setActionsItem = function(item) {
	if (this._actionsItem !== item) {
		this._actionsItem = item;
		this.refresh();
	}
};

Window_ItemStatusBase.prototype.showActions = function() {
	this._statusPage = "actions";
	this.refresh();
};

Window_ItemStatusBase.prototype.showSkillRequirements = function() {
	this._statusPage = "skillRequirements";
	this.refresh();
};

Window_ItemStatusBase.prototype.showProtection = function() {
	this._statusPage = "protection";
	this.refresh();
};

Window_ItemStatusBase.prototype.showDescription = function() {
	this._statusPage = "description";
	this.refresh();
};

Window_ItemStatusBase.prototype.showNone = function() {
	this._statusPage = "none";
	this.refresh();
};

Window_ItemStatusBase.prototype.nextStatusPage = function() {
	if(this._statusPage ===  "actions") {
		this.showSkillRequirements();
	} else if(this._statusPage ===  "skillRequirements") {
		this.showProtection();
	} else if(this._statusPage ===  "protection") {
		this.showDescription();
	} else if(this._statusPage ===  "description") {
		this.showActions();
	}
};

Window_ItemStatusBase.prototype.prevStatusPage = function() {
	if(this._statusPage ===  "actions") {
		this.showDescription();
	} else if(this._statusPage ===  "skillRequirements") {
		this.showActions();
	} else if(this._statusPage ===  "protection") {
		this.showSkillRequirements();
	} else if(this._statusPage ===  "description") {
		this.showProtection();
	}
};

Window_ItemStatusBase.prototype.drawActions = function() {
	if (this._actionsItem) {
		var item = new Game_Item(this._actionsItem);
		var actions = item.actions();
		var actionInfos = [];
		if(actions) {
			actions.forEach(function (action) {
				var actionInfo = {};
				actionInfo.action = action;
				actionInfos.push(actionInfo);
			});
		}
		this.changeTextColor(this.systemColor());
		this.drawText("Action", 0, 0);
		this.drawText("Rn", 288, 0);
		this.drawText("Ac", 334, 0);
		this.drawText("Pw", 404, 0);
		this.drawText("AE", 450, 0);
		this.resetTextColor();
		var lineOffset = 0;
		var i;
		for(i = 0; i < actionInfos.length; i++) {
			lineOffset += this.drawActionInfo(actionInfos[i], i, lineOffset, true, this._actor);
		}
	}
};

Window_ItemStatusBase.prototype.drawSkillRequirements = function() {
	if (this._actionsItem) {
		var item = new Game_Item(this._actionsItem);
		var actions = item.actions();
		this.changeTextColor(this.systemColor());
		this.drawText("Action", 0, 0);
		this.drawText("Skill Required", 254, 0);
		this.resetTextColor();
		if(!actions) { return; }
		var lineOffset = 0;
		var i;
		for(i = 0; i < actions.length; i++) {
			lineOffset += this.drawActionSkillRequirements(actions[i], i, lineOffset, true, this._actor);
		}
	}
};

Window_ItemStatusBase.prototype.drawProtection = function() {
	var headProt = this.getCompleteProtection({});
	var torsoProt = this.getCompleteProtection({});
	var leftArmProt = this.getCompleteProtection({});
	var rightArmProt = this.getCompleteProtection({});
	var leftLegProt = this.getCompleteProtection({});
	var rightLegProt = this.getCompleteProtection({});
	var mentalProt = this.getCompleteTypeProtection({});
	var headProtTemp = headProt;
	var torsoProtTemp = torsoProt;
	var leftArmProtTemp = leftArmProt;
	var rightArmProtTemp = rightArmProt;
	var leftLegProtTemp = leftLegProt;
	var rightLegProtTemp = rightLegProt;
	var mentalProtTemp = mentalProt;
	
	if (this._actor) {
		headProt = this._actor.protection("head");
		torsoProt = this._actor.protection("torso");
		leftArmProt = this._actor.protection("leftArm");
		rightArmProt = this._actor.protection("rightArm");
		leftLegProt = this._actor.protection("leftLeg");
		rightLegProt = this._actor.protection("rightLeg");
		mentalProt = this._actor.mentalProtection();
		
		if(this._tempActor) {
			headProtTemp = this._tempActor.protection("head");
			torsoProtTemp = this._tempActor.protection("torso");
			leftArmProtTemp = this._tempActor.protection("leftArm");
			rightArmProtTemp = this._tempActor.protection("rightArm");
			leftLegProtTemp = this._tempActor.protection("leftLeg");
			rightLegProtTemp = this._tempActor.protection("rightLeg");
			mentalProtTemp = this._tempActor.mentalProtection();
		} else {
			headProtTemp = headProt;
			torsoProtTemp = torsoProt;
			leftArmProtTemp = leftArmProt;
			rightArmProtTemp = rightArmProt;
			leftLegProtTemp = leftLegProt;
			rightLegProtTemp = rightLegProt;
			mentalProtTemp = mentalProt;
		}
	} else if (this._actionsItem && this._actionsItem.tbsStats.protection) {
		var protection = this._actionsItem.tbsStats.protection;
		headProt = this.getCompleteProtection(protection.head);
		torsoProt = this.getCompleteProtection(protection.torso);
		leftArmProt = this.getCompleteProtection(protection.arms);
		rightArmProt = protection.equippedArm ? this.getCompleteProtection(protection.equippedArm) : this.getCompleteProtection(protection.arms);
		leftLegProt = this.getCompleteProtection(protection.legs);
		rightLegProt = this.getCompleteProtection(protection.legs);
		mentalProt = this.getCompleteMentalProtection(protection.mental);
		
		headProtTemp = headProt;
		torsoProtTemp = torsoProt;
		leftArmProtTemp = leftArmProt;
		rightArmProtTemp = rightArmProt;
		leftLegProtTemp = leftLegProt;
		rightLegProtTemp = rightLegProt;
		mentalProtTemp = mentalProt;
	}
		
	var typesX = 82;
	var typesRightAlignX = 10;
	var typesWidth = 46;
	
	this.drawIcon(this.getIconIdFor("solidDefense"), 	typesX, 					0);
	this.drawIcon(this.getIconIdFor("fluidDefense"), 	typesX + typesWidth, 		0);
	this.drawIcon(this.getIconIdFor("blunt"),			typesX + typesWidth * 2, 	0);
	this.drawIcon(this.getIconIdFor("cut"), 			typesX + typesWidth * 3, 	0);
	this.drawIcon(this.getIconIdFor("bullet"), 			typesX + typesWidth * 4, 	0);
	this.drawIcon(this.getIconIdFor("fire"), 			typesX + typesWidth * 5, 	0);
	this.drawIcon(this.getIconIdFor("ice"), 			typesX + typesWidth * 6, 	0);
	this.drawIcon(this.getIconIdFor("corrosion"), 		typesX + typesWidth * 7, 	0);
	this.drawIcon(this.getIconIdFor("conducted"), 		typesX + typesWidth * 8, 	0);
	
	this.drawPhysProtection("Head", headProtTemp, headProt, typesRightAlignX, typesWidth, this.lineHeight());
	this.drawPhysProtection("Torso", torsoProtTemp, torsoProt, typesRightAlignX, typesWidth, this.lineHeight() * 2);
	this.drawPhysProtection("R Arm", rightArmProtTemp, rightArmProt, typesRightAlignX, typesWidth, this.lineHeight() * 3);
	this.drawPhysProtection("L Arm", leftArmProtTemp, leftArmProt, typesRightAlignX, typesWidth, this.lineHeight() * 4);
	this.drawPhysProtection("R Leg", rightLegProtTemp, rightLegProt, typesRightAlignX, typesWidth, this.lineHeight() * 5);
	this.drawPhysProtection("L Leg", leftLegProtTemp, leftLegProt, typesRightAlignX, typesWidth, this.lineHeight() * 6);
	
	this.drawIcon(this.getIconIdFor("mentalDefense"), typesX, this.lineHeight() * 8);
	this.drawIcon(this.getIconIdFor("psychic"), typesX + typesWidth * 2, this.lineHeight() * 8);
	this.changeTextColor(this.systemColor());
	this.drawText("Mind", 0, this.lineHeight() * 9);
	this.setTextColorForComparison(mentalProtTemp.defense, mentalProt.defense);
	this.drawText(mentalProtTemp.defense > 0 ? mentalProtTemp.defense : "-", typesRightAlignX, this.lineHeight() * 9, 100, 'right');
	this.setTextColorForComparison(mentalProtTemp.armor, mentalProt.armor);
	this.drawText(mentalProtTemp.armor > 0 ? mentalProtTemp.armor : "-", typesRightAlignX + typesWidth * 2, this.lineHeight() * 9, 100, 'right');
	this.resetTextColor();
};

Window_ItemStatusBase.prototype.getCompleteProtection = function(input) {
	var inputObject = input;
	if(!inputObject) {
		inputObject = {};
	}
	if(!inputObject.defense) {
		inputObject.defense = {};
	}
	if(!inputObject.armor) {
		inputObject.armor = {};
	}
	var returnObject = {};
	returnObject.defense = this.getCompleteDefense(inputObject.defense);
	returnObject.armor = this.getCompleteArmor(inputObject.armor);
	return returnObject;
};

Window_ItemStatusBase.prototype.getCompleteDefense = function(input) {
	var inputObject = input;
	if(!inputObject) {
		inputObject = {};
	}
	var returnObject = {};
	returnObject.solid = inputObject.solid !== undefined ? inputObject.solid : 0;
	returnObject.fluid = inputObject.fluid !== undefined ? inputObject.fluid : 0;
	return returnObject;
};

Window_ItemStatusBase.prototype.getCompleteArmor = function(input) {
	var inputObject = input;
	if(!inputObject) {
		inputObject = {};
	}
	var returnObject = {};
	returnObject.blunt = inputObject.blunt !== undefined ? inputObject.blunt : 0;
	returnObject.cut = inputObject.cut !== undefined ? inputObject.cut : 0;
	returnObject.bullet = inputObject.bullet !== undefined ? inputObject.bullet : 0;
	returnObject.fire = inputObject.fire !== undefined ? inputObject.fire : 0;
	returnObject.ice = inputObject.ice !== undefined ? inputObject.ice : 0;
	returnObject.corrosion = inputObject.corrosion !== undefined ? inputObject.corrosion : 0;
	returnObject.conducted = inputObject.conducted !== undefined ? inputObject.conducted : 0;
	return returnObject;
};

Window_ItemStatusBase.prototype.getCompleteMentalProtection = function(input) {
	var inputObject = input;
	if(!inputObject) {
		inputObject = {};
	}
	var returnObject = {};
	returnObject.defense = inputObject.defense !== undefined ? inputObject.defense : 0;
	returnObject.armor = inputObject.armor !== undefined ? inputObject.armor : 0;
	return returnObject;
};

Window_ItemStatusBase.prototype.getCompleteTypeProtection = function(input) {
	var returnObject = {};
	returnObject.defense = 0;
	returnObject.armor = 0;
	if(input === undefined || (input.defense === undefined && input.armor === undefined)) {
		return returnObject;
	}
	
	if(input.defense !== undefined) {
		returnObject.defense = input.defense;
	}
	
	if(input.armor !== undefined) {
		returnObject.armor = input.armor;
	}
	
	return returnObject;
};

Window_ItemStatusBase.prototype.drawPhysProtection = function(partName, protection, oldProtection, typeX, typeWidth, lineHeight) {
	this.changeTextColor(this.systemColor());
	this.drawText(partName, 0, lineHeight);
	
	this.setTextColorForComparison(protection.defense.solid, oldProtection.defense.solid);
	this.drawText(protection.defense.solid > 0 ? protection.defense.solid : "-", typeX, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.defense.fluid, oldProtection.defense.fluid);
	this.drawText(protection.defense.fluid > 0 ? protection.defense.fluid : "-", typeX + typeWidth, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.blunt, oldProtection.armor.blunt);
	this.drawText(protection.armor.blunt > 0 ? protection.armor.blunt : "-", typeX + typeWidth * 2, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.cut, oldProtection.armor.cut);
	this.drawText(protection.armor.cut > 0 ? protection.armor.cut : "-", typeX + typeWidth * 3, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.bullet, oldProtection.armor.bullet);
	this.drawText(protection.armor.bullet > 0 ? protection.armor.bullet : "-", typeX + typeWidth * 4, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.fire, oldProtection.armor.fire);
	this.drawText(protection.armor.fire > 0 ? protection.armor.fire : "-", typeX + typeWidth * 5, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.ice, oldProtection.armor.ice);
	this.drawText(protection.armor.ice > 0 ? protection.armor.ice : "-", typeX + typeWidth * 6, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.corrosion, oldProtection.armor.corrosion);
	this.drawText(protection.armor.corrosion > 0 ? protection.armor.corrosion : "-", typeX + typeWidth * 7, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.conducted, oldProtection.armor.conducted);
	this.drawText(protection.armor.conducted > 0 ? protection.armor.conducted : "-", typeX + typeWidth * 8, lineHeight, 100, 'right');
	
	this.resetTextColor();
};

Window_ItemStatusBase.prototype.setTextColorForComparison = function(newValue, oldValue) {
	if(newValue > oldValue) {
		this.changeTextColor(this.powerUpColor());
	} else if(newValue < oldValue) {
		this.changeTextColor(this.deathColor());
	} else {
		this.resetTextColor();
	}
};

Window_ItemStatusBase.prototype.drawEquipDescription = function() {
	if(this._actionsItem && this._actionsItem.description) {
		this.drawDescription(this._actionsItem.description);
	}
};

Window_ItemStatusBase.prototype.drawTabs = function() {
	var tabsX = 342;
	
	if(this._statusPage !== "actions") {
		this.changePaintOpacity(false);
	}
	this.drawIcon(this.getIconIdFor("action"), tabsX, this.lineHeight() * 9);
	this.changePaintOpacity(true);
	
	if(this._statusPage !== "skillRequirements") {
		this.changePaintOpacity(false);
	}
	this.drawIcon(this.getIconIdFor("skill"), tabsX + this.lineHeight(), this.lineHeight() * 9);
	this.changePaintOpacity(true);
	
	if(this._statusPage !== "protection") {
		this.changePaintOpacity(false);
	}
	this.drawIcon(this.getIconIdFor("solidDefense"), tabsX + this.lineHeight() * 2, this.lineHeight() * 9);
	this.changePaintOpacity(true);
	
	if(this._statusPage !== "description") {
		this.changePaintOpacity(false);
	}
	this.drawIcon(this.getIconIdFor("knowledge"), tabsX + this.lineHeight() * 3, this.lineHeight() * 9);
	this.changePaintOpacity(true);
};

//-----------------------------------------------------------------------------
// Window_ItemStatus
//
// The window for displaying info about items and equipment.

function Window_ItemStatus() {
    this.initialize.apply(this, arguments);
}

Window_ItemStatus.prototype = Object.create(Window_ItemStatusBase.prototype);
Window_ItemStatus.prototype.constructor = Window_ItemStatus;

Window_ItemStatus.prototype.initialize = function(x, y) {
    var width = this.windowWidth();
    var height = this.windowHeight();
    Window_ItemStatusBase.prototype.initialize.call(this, x, y, width, height);
    this._actor = null;
    this._tempActor = null;
	this._statusPage = "none";
	this._actionsItem = null;
    this.refresh();
};

Window_ItemStatus.prototype.windowWidth = function() {
    return Graphics.boxWidth - 298;
};

Window_ItemStatus.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_ItemStatus.prototype.numVisibleRows = function() {
    return 10;
};

//-----------------------------------------------------------------------------
// Window_SkillCharacterInfo
//
// The window for displaying some character info on the skill screen

function Window_SkillCharacterInfo() {
    this.initialize.apply(this, arguments);
}

Window_SkillCharacterInfo.prototype = Object.create(Window_Selectable.prototype);
Window_SkillCharacterInfo.prototype.constructor = Window_SkillCharacterInfo;

Window_SkillCharacterInfo.prototype.initialize = function() {
    var width = Graphics.boxWidth;
    var height = this.fittingHeight(1);
    Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);
    this.refresh();
    this.activate();
};

Window_SkillCharacterInfo.prototype.setActor = function(actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
};

Window_SkillCharacterInfo.prototype.refresh = function() {
    this.contents.clear();
    if (this._actor) {
		this.drawActorName(this._actor, 0, 0);
    }
};
 
//-----------------------------------------------------------------------------
// Window_SkillDescription
//
// The window for displaying a skill description 

function Window_SkillDescription() {
    this.initialize.apply(this, arguments);
}

Window_SkillDescription.prototype = Object.create(Window_Base.prototype);
Window_SkillDescription.prototype.constructor = Window_SkillDescription;

Window_SkillDescription.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.activate();
};

Window_SkillDescription.prototype.refresh = function() {
	this.contents.clear();
	if(this._description) {
		this.drawSkillDescription();
	}
};

Window_SkillDescription.prototype.setDescription = function(description) {
	if (this._description !== description) {
		this._description = description;
		this.refresh();
	}
};

Window_SkillDescription.prototype.drawSkillDescription = function() {
	if(this._description) {
		this.drawDescription(this._description);
	}
};
 
//-----------------------------------------------------------------------------
// Window_SkillActionInfo
//
// The window for displaying a skill's action info

function Window_SkillActionInfo() {
    this.initialize.apply(this, arguments);
}

Window_SkillActionInfo.prototype = Object.create(Window_Selectable.prototype);
Window_SkillActionInfo.prototype.constructor = Window_SkillActionInfo;

Window_SkillActionInfo.prototype.initialize = function(y) {
    Window_Selectable.prototype.initialize.call(this, 0, y, this.windowWidth(), this.windowHeight());
    this.refresh();
    this.activate();
};

Window_SkillActionInfo.prototype.windowWidth = function() {
	return 298;
};

Window_SkillActionInfo.prototype.windowHeight = function() {
	return this.fittingHeight(this.numVisibleRows());
};

Window_SkillActionInfo.prototype.numVisibleRows = function() {
	return 10;
};

Window_SkillActionInfo.prototype.refresh = function() {
	this.contents.clear();
	if(this._actionInfo) {
		this.drawSkillActionInfo();
	}
};

Window_SkillActionInfo.prototype.setActionInfo = function(actionInfo) {
	if (this._actionInfo !== actionInfo) {
		this._actionInfo = actionInfo;
		this.refresh();
	}
};

Window_SkillActionInfo.prototype.setActor = function(actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
};

Window_SkillActionInfo.prototype.drawSkillActionInfo = function() {
	if(!this._actionInfo) { return; }
	
	this.changeTextColor(this.systemColor());
	this.drawText("Rn", 34, 0);
	this.drawText("Ac", 80, 0);
	this.drawText("Pw", 150, 0);
	this.drawText("AE", 196, 0);
	this.resetTextColor();
	
	this.drawActionInfo(this._actionInfo, undefined, undefined, undefined, this._actor);
	
	if(this._actionInfo.sourceEquip) {
		this.drawText("Source:", 0, this.lineHeight() * (this.numVisibleRows() - 2));
		var rect = this.itemRectForText(this.numVisibleRows() - 1);
		this.drawItemName(this._actionInfo.sourceEquip, 0, rect.y, this.windowWidth() - this.lineHeight());
	}
};
 
//-----------------------------------------------------------------------------
// Window_EquipCharacterInfo
//
// The window for displaying some character info on the equip screen

function Window_EquipCharacterInfo() {
    this.initialize.apply(this, arguments);
}

Window_EquipCharacterInfo.prototype = Object.create(Window_Selectable.prototype);
Window_EquipCharacterInfo.prototype.constructor = Window_EquipCharacterInfo;

Window_EquipCharacterInfo.prototype.initialize = function() {
    var width = Graphics.boxWidth;
    var height = this.fittingHeight(1);
    Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);
    this.refresh();
    this.activate();
};

Window_EquipCharacterInfo.prototype.setActor = function(actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
};

Window_EquipCharacterInfo.prototype.refresh = function() {
    this.contents.clear();
    if (this._actor) {
		this.drawActorName(this._actor, 0, 0);
		var handedness = "Left Handed";
		if(this._actor.handedness() === "right") {
			handedness = "Right Handed";
		}
		this.resetTextColor();
		this.drawText(handedness, 186, 0);
		/* this.changeTextColor(this.systemColor());
		this.drawText("Class Skills", 500, 0);
		var skillsPosition = 708;
		var characterWidth = 14;
		this.drawText("/", skillsPosition + characterWidth, 0);
		this.drawText("/", skillsPosition + characterWidth * 3, 0);
		this.resetTextColor();
		var uniqueSkills = this._actor.uniqueSkills();
		var i;
		for(i = 0; i < uniqueSkills.length; i++) {
			this.drawText(this._actor.totalSkill(uniqueSkills[i]), skillsPosition + characterWidth * i * 2, 0);
		} */
    }
};

//-----------------------------------------------------------------------------
// Window_TbsEquipStatus
//
// The window for displaying info about equipment.

function Window_TbsEquipStatus() {
	this.initialize.apply(this, arguments);
}

Window_TbsEquipStatus.prototype = Object.create(Window_ItemStatusBase.prototype);
Window_TbsEquipStatus.prototype.constructor = Window_TbsEquipStatus;

Window_TbsEquipStatus.prototype.initialize = function(x, y, w, h) {
	Window_ItemStatusBase.prototype.initialize.call(this, x, y, w, h);
	this._actor = null;
	this._tempActor = null;
	this._statusPage = "none";
	this._actionsItem = null;
	this.refresh();
};

//-----------------------------------------------------------------------------
// Window_TbsActorStatus
//
// The window for displaying a tbs actor's status during a turn based strategy battle

function Window_TbsActorStatus() {
    this.initialize.apply(this, arguments);
}

Window_TbsActorStatus.prototype = Object.create(Window_Base.prototype);
Window_TbsActorStatus.prototype.constructor = Window_TbsActorStatus;

Window_TbsActorStatus.prototype.initialize = function(x, y) {
    Window_Base.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
    this._tbsActor = null;
};

Window_TbsActorStatus.prototype.windowWidth = function() {
	return this.standardPadding() * 2 + 14 * 14 + 4 + Window_Base._iconWidth;
};

Window_TbsActorStatus.prototype.windowHeight = function() {
	return this.standardPadding() * 2 + this.lineHeight() * 4;
};

Window_TbsActorStatus.prototype.setTbsActor = function(tbsActor) {
    if (this._tbsActor !== tbsActor) {
		if(tbsActor && ($gameMap.tbsTurnMode() === "manualTarget" || $gameMap.tbsTurnMode() === "survey")) {
			SoundManager.playCursor();
		}
        this._tbsActor = tbsActor;
        this.refresh();
    }
};

Window_TbsActorStatus.prototype.refresh = function() {
    this.contents.clear();
    if (this._tbsActor) {
		this.drawActorStress(this._tbsActor.battler, (this.contentsWidth() - 4 - Window_Base._iconWidth) / 2, 0);
        this.drawActorDamage(this._tbsActor.battler, 14*3, this.lineHeight());
        this.drawActorBuffs(this._tbsActor.battler, this.contentsWidth() - Window_Base._iconWidth, this.contentsHeight() / 2);
    }
	//this.drawLine(this.lineHeight(), 0, this.contentsWidth() - this.lineHeight());
	//this.drawLine(this.lineHeight(), this.lineHeight()*4, this.contentsWidth() - this.lineHeight());
};

Window_TbsActorStatus.prototype.drawActorStress = function(battler, xCenter, y) {
	var iconWidth = Window_Base._iconWidth;
	var iconSeparation = 4;
	var stress = battler.stress();
	var x = xCenter - (iconWidth * stress + iconSeparation * Math.max(0, stress - 1)) / 2;
	var i;
	for(i = 0; i < stress; i++) {
		this.drawIcon(6, x + i*(iconWidth + iconSeparation), y);
	}
};

Window_TbsActorStatus.prototype.drawActorBuffs = function(battler, x, yCenter) {
	var iconHeight = Window_Base._iconHeight;
	var iconSeparation = 4;
	var buffs = battler.tbsBuffs();
	var y = yCenter - (iconHeight * buffs.length + iconSeparation * Math.max(0, buffs.length -1)) / 2;
	var i;
	for(i = 0; i < buffs.length; i++) {
		this.drawIcon(buffs[i].iconId, x, y + i*(iconHeight + iconSeparation));
	}
};

Window_TbsActorStatus.prototype.drawLine = function(x, y, width) {
	var lineY = y + this.lineHeight() / 2 - 1;
	this.contents.paintOpacity = 48;
	this.contents.fillRect(x, lineY, width, 2, this.normalColor());
	this.contents.paintOpacity = 255;
};

Window_TbsActorStatus.prototype.setShouldReOpen = function(should) {
	this._shouldReOpen = should;
};

Window_TbsActorStatus.prototype.updateClose = function() {
    if (this._closing) {
        this.openness -= this.openCloseSpeed();
        if (this.isClosed()) {
			this._closing = false;
			if(this._shouldReOpen) {
				this.open();
			}
			this._shouldReOpen = false;
        }
    }
};

//-----------------------------------------------------------------------------
// Window_TbsActor
//
// The window for selecting an actor during battle

function Window_TbsActor() {
    this.initialize.apply(this, arguments);
}

Window_TbsActor.prototype = Object.create(Window_Selectable.prototype);
Window_TbsActor.prototype.constructor = Window_TbsActor;

Window_TbsActor.prototype.initialize = function(x, y) {
    this._actors = [];
    Window_Selectable.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
    this.refreshWindowContents();
	this._skipDisabled = true;
};

Window_TbsActor.prototype.windowWidth = function() {
	var longestLength = 5;
	if(this._actors.length > 0) {
		this._actors.forEach(function (actor) {
			var name = actor.battler.name();
			if(longestLength < name.length) {
				longestLength = name.length;
			}
		});
	}
	return this.standardPadding() * 2 + longestLength * 14 + this.textPadding() * 2;
};

Window_TbsActor.prototype.windowHeight = function() {
	return this.fittingHeight(this.numVisibleRows());
};

Window_TbsActor.prototype.numVisibleRows = function() {
	return this.maxItems();
};

Window_TbsActor.prototype.setActors = function(actors) {
    if (this._actors !== actors) {
        this._actors = actors;
		this.move(this.x, this.y, this.windowWidth(), this.windowHeight());
		this.createContents();
		this.selectFirstEnabledItem();
        this.refreshWindowContents();
    }
};

Window_TbsActor.prototype.setActorStatusWindow = function(actorStatusWindow) {
	if (this._actorStatusWindow !== actorStatusWindow) {
		this._actorStatusWindow = actorStatusWindow;
	}
};

Window_TbsActor.prototype.setActionTypeWindow = function(actionTypeWindow) {
	if (this._actionTypeWindow !== actionTypeWindow) {
		this._actionTypeWindow = actionTypeWindow;
	}
};

Window_TbsActor.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
	if (!$gameMap.currentForce() || !$gameMap.currentForce().isParty || !this.isOpenAndActive()) { return; }
	if (this._actors && this._actors.length > 0 && this.index() >= 0 && this.index() < this.maxItems() - 1) {
		$gameMap.setTbsSelectedActor(this._actors[this.index()]);
		if(this._actorStatusWindow) {
			this._actorStatusWindow.setTbsActor(this._actors[this.index()]);
		}
		if(this._actionTypeWindow) {
			this._actionTypeWindow.setTbsActor(this._actors[this.index()]);
		}
	} else {
		$gameMap.setTbsSelectedActor(undefined);
		if(this._actorStatusWindow) {
			this._actorStatusWindow.setTbsActor(undefined);
		}
		if(this._actionTypeWindow) {
			this._actionTypeWindow.setTbsActor(undefined);
		}
	}
};

Window_TbsActor.prototype.processCancel = function() {
    this.updateInputData();
    this.callCancelHandler();
};

Window_TbsActor.prototype.maxItems = function() {
    return this._actors ? this._actors.length + 1 : 1;
};

Window_TbsActor.prototype.actor = function() {
    return this._actors ? this._actors[this.index()] : null;
};

Window_TbsActor.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    this.resetTextColor();
    this.changePaintOpacity(true);
	if (index === this.maxItems() - 1) {
		this.changePaintOpacity(this.isEnabled(index));
        this.drawText("*Wait", rect.x, rect.y, rect.width);
	} else if (this._actors) {
		var battler = this._actors[index].battler;
		if(battler.isDown()) {
			this.changeTextColor(this.deathColor());
		} else {
			this.changePaintOpacity(this.isEnabled(index));
		}
        this.drawText(battler.name(), rect.x, rect.y, rect.width);
    }
    this.resetTextColor();
    this.changePaintOpacity(true);
};

Window_TbsActor.prototype.isEnabled = function(index) {
	return index === this.maxItems() - 1 || (this._actors && this._actors[index] ? this._actors[index].canActThisRound : false);
};

Window_TbsActor.prototype.isCurrentItemEnabled = function() {
    return this.isEnabled(this.index());
};

Window_TbsActor.prototype.isOnPass = function() {
    return this._actors && this._actors.length > 0 && this.index() === this.maxItems() - 1;
};

Window_TbsActor.prototype.shouldOpenActionTypeWindow = function(should) {
	this._shouldOpenActionTypeWindow = should;
};

Window_TbsActor.prototype.shouldPassTurn = function(should) {
	this._shouldPassTurn = should;
};

Window_TbsActor.prototype.shouldActivateSurvey = function(should) {
	this._shouldActivateSurvey = should;
};

Window_TbsActor.prototype.refreshWindowContents = function(dontSelectFirst) {
	this.move(this.x, this.y, this.windowWidth(), this.windowHeight());
	this.createContents();
	if(!dontSelectFirst) {
		this.selectFirstEnabledItem();
	}
	this.refresh();
};

Window_TbsActor.prototype.open = function() {
    if (!this.isOpen()) {
        this._opening = true;
    }
    this._closing = false;
	if(this._actorStatusWindow) {
		this._actorStatusWindow.show();
		this._actorStatusWindow.open();
	}
};

Window_TbsActor.prototype.close = function() {
    if (!this.isClosed()) {
        this._closing = true;
    }
    this._opening = false;
	if(this._actorStatusWindow && !this._actorStatusWindow.isOpening() && !this._shouldActivateSurvey) {
		this._actorStatusWindow.close();
	}
};

Window_TbsActor.prototype.updateClose = function() {
    if (this._closing) {
        this.openness -= this.openCloseSpeed();
        if (this.isClosed()) {
			this._closing = false;
			if(this._shouldOpenActionTypeWindow) {
				this._actionTypeWindow.refresh();
				this._actionTypeWindow.show();
				this._actionTypeWindow.open();
				this._actionTypeWindow.activate();
			}
			if(this._shouldPassTurn) {
				$gameMap.setTbsTurnMode("passTurn");
			}
			if(this._shouldActivateSurvey) {
				$gameMap.setTbsTurnMode("survey");
			}
			this._shouldActivateSurvey = false;
			this._shouldPassTurn = false;
			this._shouldOpenActionTypeWindow = false;
        }
    }
};

//-----------------------------------------------------------------------------
// Window_TbsActionType
//
// The window for selecting an action type during a turn based battle

function Window_TbsActionType() {
    this.initialize.apply(this, arguments);
}

Window_TbsActionType.prototype = Object.create(Window_Command.prototype);
Window_TbsActionType.prototype.constructor = Window_TbsActionType;

Window_TbsActionType.prototype.initialize = function(x, y) {
    Window_Command.prototype.initialize.call(this, x, y);
    this._tbsActor = null;
	this._skipDisabled = true;
	this._moveEnabledPrev = true;
};

Window_TbsActionType.prototype.windowWidth = function() {
    return 126 + this.standardPadding()*2 + this.textPadding()*2;
};

Window_TbsActionType.prototype.setTbsActor = function(tbsActor) {
    if (this._tbsActor !== tbsActor) {
        this._tbsActor = tbsActor;
        this.refresh();
        this.selectLast();
		if(!this.isCurrentItemEnabled()) {
			this.selectFirstEnabledItem();
		}
    }
};

Window_TbsActionType.prototype.numVisibleRows = function() {
    return 5;
};

Window_TbsActionType.prototype.makeCommandList = function() {
	var actionTypes = {};
	actionTypes.attack = 1;
	actionTypes.technique = 2;
	actionTypes.defense = 3;
	actionTypes.item = 4;
	
	var actionLists = [];
	actionLists[1] = [];
	actionLists[2] = [];
	actionLists[3] = [];
	actionLists[4] = [];
	if(this._tbsActor) {
		var actor = this._tbsActor.battler;
		var equipActionInfos = actor.getAllEquipActionInfos();
		var i;
		for(i = 0; i < equipActionInfos.length; i++) {
			actionLists[actionTypes[equipActionInfos[i].action.type]].push(equipActionInfos[i]);
		}
		var skills = actor.skills();
		for(i = 0; i < skills.length; i++) {
			if(skills[i].tbsStats.action) {
				var actionInfo = {};
				actionInfo.action = skills[i].tbsStats.action;
				actionLists[actionTypes[skills[i].tbsStats.action.type]].push(actionInfo);
			}
		}
	}
	
	var name = $dataSystem.skillTypes[1];
	this.addCommand(name, 'action', actionLists[1].length > 0, 1);
	var name = $dataSystem.skillTypes[2];
	this.addCommand(name, 'action', actionLists[2].length > 0, 2);
	var name = $dataSystem.skillTypes[4];
	this.addCommand(name, 'action', actionLists[4].length > 0, 4);
	var name = $dataSystem.skillTypes[3];
	this.addCommand(name, 'action', actionLists[3].length > 0, 3);
	this.addCommand("*Move", 'move', this.isMoveEnabled(), 4);
};

Window_TbsActionType.prototype.isMoveEnabled = function() {
	return !this._tbsActor || !this._tbsActor.movedThisRound;
};

Window_TbsActionType.prototype.setActorWindow = function(actorWindow) {
	if (this._actorWindow !== actorWindow) {
		this._actorWindow = actorWindow;
		this.refresh();
	}
};

Window_TbsActionType.prototype.setActionWindow = function(actionWindow) {
	if(this._actionWindow !== actionWindow) {
		this._actionWindow = actionWindow;
		this.refresh();
	}
};

Window_TbsActionType.prototype.update = function() {
	Window_Command.prototype.update.call(this);
	if (!$gameMap.currentForce() || !$gameMap.currentForce().isParty || !this.isOpenAndActive()) { return; }
	$gameMap.setTbsSelectedActionType(this.currentExt());
	if (this._actionWindow) {
		this._actionWindow.setStypeId(this.currentExt());
		if (this._tbsActor) {
			this._actionWindow.setTbsActor(this._tbsActor);
		}
	}
	if(this._moveEnabledPrev !== this.isMoveEnabled()) {
        this.refresh();
		if(this.isMoveEnabled()) {
			this.select(4);
		} else {
			if(!this.isCurrentItemEnabled()) {
				this.selectFirstEnabledItem();
			}
		}
	}
	this._moveEnabledPrev = this.isMoveEnabled();
};

Window_TbsActionType.prototype.processCancel = function() {
    this.updateInputData();
    this.callCancelHandler();
};

Window_TbsActionType.prototype.selectLast = function() {
	if(this._tbsActor) {
		var actor = this._tbsActor.battler;
		var skill = actor.lastMenuSkill();
		if (skill) {
			this.selectExt(skill.stypeId);
		} else {
			this.select(0);
		}
	} else {
		this.select(0);
	}
};

Window_TbsActionType.prototype.shouldOpenActorWindow = function(should) {
	this._shouldOpenActorWindow = should;
};

Window_TbsActionType.prototype.shouldOpenActionWindow = function(should) {
	this._shouldOpenActionWindow = should;
};

Window_TbsActionType.prototype.shouldActivateManualMove = function(should) {
	this._shouldActivateManualMove = should;
};

Window_TbsActionType.prototype.updateClose = function() {
    if (this._closing) {
        this.openness -= this.openCloseSpeed();
        if (this.isClosed()) {
			this._closing = false;
			if(this._shouldOpenActorWindow) {
				this._actorWindow.refreshWindowContents(true);
				this._actorWindow.show();
				this._actorWindow.open();
				this._actorWindow.activate();
			}
			if(this._shouldOpenActionWindow) {
				this._actionWindow.refreshWindowContents();
				this._actionWindow.show();
				this._actionWindow.open();
				this._actionWindow.activate();
			}
			if(this._shouldActivateManualMove) {
				$gameMap.setTbsTurnMode("manualMove");
			}
			this._shouldOpenActorWindow = false;
			this._shouldOpenActionWindow = false;
			this._shouldActivateManualMove = false;
        }
    }
};

//-----------------------------------------------------------------------------
// Window_TbsActionInfo
//
// The window for displaying a skill's action info during battle

function Window_TbsActionInfo() {
    this.initialize.apply(this, arguments);
}

Window_TbsActionInfo.prototype = Object.create(Window_Selectable.prototype);
Window_TbsActionInfo.prototype.constructor = Window_TbsActionInfo;

Window_TbsActionInfo.prototype.initialize = function(x, y) {
    Window_Selectable.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
    this.refresh();
    this.activate();
};

Window_TbsActionInfo.prototype.windowWidth = function() {
	return 298;
};

Window_TbsActionInfo.prototype.windowHeight = function() {
	return this.fittingHeight(this.numVisibleRows());
};

Window_TbsActionInfo.prototype.numVisibleRows = function() {
	return 7;
};

Window_TbsActionInfo.prototype.refresh = function() {
	this.contents.clear();
	if(this._actionInfo) {
		this.drawSkillActionInfo();
	}
};

Window_TbsActionInfo.prototype.setActionInfo = function(actionInfo) {
	if (this._actionInfo !== actionInfo) {
		this._actionInfo = actionInfo;
		this.refresh();
	}
};

Window_TbsActionInfo.prototype.setActor = function(actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
};

Window_TbsActionInfo.prototype.drawSkillActionInfo = function() {
	if(!this._actionInfo) { return; }
	
	this.changeTextColor(this.systemColor());
	this.drawText("Rn", 34, 0);
	this.drawText("Ac", 80, 0);
	this.drawText("Pw", 150, 0);
	this.drawText("AE", 196, 0);
	this.resetTextColor();
	
	this.drawActionInfo(this._actionInfo, undefined, undefined, undefined, this._actor);
	
	if(this._actionInfo.sourceEquip) {
		this.drawText("Source:", 0, this.lineHeight() * (this.numVisibleRows() - 2));
		var rect = this.itemRectForText(this.numVisibleRows() - 1);
		this.drawItemName(this._actionInfo.sourceEquip, 0, rect.y, this.windowWidth() - this.lineHeight());
	}
};

//-----------------------------------------------------------------------------
// Window_TbsAction
//
// The window for selecting an action during battle

function Window_TbsAction() {
    this.initialize.apply(this, arguments);
}

Window_TbsAction.prototype = Object.create(Window_Selectable.prototype);
Window_TbsAction.prototype.constructor = Window_TbsAction;

Window_TbsAction.prototype.initialize = function(x, y) {
	this._actionInfos = [];
    Window_Selectable.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
	this._stypeId = 0;
	this._actionTextColor = [];
    this.refreshWindowContents();
};

Window_TbsAction.prototype.windowWidth = function() {
	if(this._actionInfos.length > 0) {
		var longestLength = 0;
		this._actionInfos.forEach(function (actionInfo) {
			if(longestLength < actionInfo.action.name.length) {
				longestLength = actionInfo.action.name.length;
			}
		});
		return this.standardPadding() * 2 + longestLength * 14 + Window_Base._iconWidth + this.textPadding() * 3;
	} else {
		return Graphics.boxWidth / 2;
	}
};

Window_TbsAction.prototype.windowHeight = function() {
	return this.fittingHeight(this.numVisibleRows());
};

Window_TbsAction.prototype.numVisibleRows = function() {
	return Math.min(4, this.maxItems());
};

Window_TbsAction.prototype.setActionTypeWindow = function(actionTypeWindow) {
	if (this._actionTypeWindow !== actionTypeWindow) {
		this._actionTypeWindow = actionTypeWindow;
		this.refreshWindowContents();
	}
};

Window_TbsAction.prototype.setTargetWindow = function(targetWindow) {
	if (this._targetWindow !== targetWindow) {
		this._targetWindow = targetWindow;
		this.refreshWindowContents();
	}
};

Window_TbsAction.prototype.setActionInfoWindow = function(actionInfoWindow) {
	if (this._actionInfoWindow !== actionInfoWindow) {
		this._actionInfoWindow = actionInfoWindow;
		this.refreshWindowContents();
	}
};

Window_TbsAction.prototype.setTbsActor = function(tbsActor) {
    if (this._tbsActor !== tbsActor) {
        this._tbsActor = tbsActor;
        this.refreshWindowContents();
		if(this._targetWindow) {
			this._targetWindow.setActionIndex(-1);
		}
    }
};

Window_TbsAction.prototype.setStypeId = function(stypeId) {
    if (this._stypeId !== stypeId) {
        this._stypeId = stypeId;
        this.refreshWindowContents();
        this.resetScroll();
		if(this._targetWindow) {
			this._targetWindow.setActionIndex(-1);
		}
    }
};

Window_TbsAction.prototype.isOnlyTargetSelf = function() {
	if(!this._targetWindow || !this._tbsActor) { return true; }
	var allies = this._targetWindow.allies();
	var enemies = this._targetWindow.enemies();
	return allies.length === 1 && enemies.length === 0 && this._tbsActor === allies[0];
};

Window_TbsAction.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
	if (!$gameMap.currentForce() || !$gameMap.currentForce().isParty || !this.isOpenAndActive()) { return; }
	if(this._actionInfos && this._actionInfos.length > 0 && this.index() >= 0 && this.index() < this._actionInfos.length) {
		$gameMap.setTbsSelectedAction(this._actionInfos[this.index()], this.index());
		if (this._actionInfoWindow) {
			this._actionInfoWindow.setActionInfo(this._actionInfos[this.index()]);
			if(this._tbsActor) {
				this._actionInfoWindow.setActor(this._tbsActor.battler);
			}
		}
		if (this._targetWindow) {
			this._targetWindow.setActionIndex(this.index());
			var action = this._actionInfos[this.index()].action;
			var allies = this._targetWindow.allies();
			var enemies = this._targetWindow.enemies();
			if((action.intendedTarget === "ally" && allies.length > 0)
				|| (action.intendedTarget === "enemy" && enemies.length === 0)) {
				this._targetWindow.showAllies();
			} else {
				this._targetWindow.showEnemies();
			}
		}
	}
};

Window_TbsAction.prototype.makeItemList = function() {
	this._actionInfos = [];
	this._actionTextColor = [];
	if (this._tbsActor) {
		this._actionInfos = this._tbsActor.isParty ? $gameMap.getPartyActionInfos() : $gameMap.getEnemyActionInfos();
		
		var i;
		for(i = 0; i < this._actionInfos.length; i++) {
			var action = this._actionInfos[i].action;
			var allyAndEnemyTargets = $gameMap.getCurrentActorAlliesAndEnemiesInRange(i);
			var allyTargets = allyAndEnemyTargets.allies;
			var enemyTargets = allyAndEnemyTargets.enemies.filter(function (enemy) { return !enemy.battler.isDown(); });
			var hasAllyTargets = allyTargets.length > 0;
			var hasEnemyTargets = enemyTargets.length > 0;
			if(!hasEnemyTargets && (!hasAllyTargets
				|| (action.intendedTarget === "enemy" && allyTargets.length === 1 && allyTargets[0] === this._tbsActor))) {
				this._actionTextColor[i] = this.deathColor();
			} else if((action.intendedTarget === "ally" && !hasAllyTargets)
				|| (action.intendedTarget === "enemy" && !hasEnemyTargets)) {
				this._actionTextColor[i] = this.crisisColor();
			} else {
				this._actionTextColor[i] = this.normalColor();
			}
		};
	}
	
	if(this.index() < 0) {
		this.select(0);
	}
	if(this.index() >= this._actionInfos.length) {
		this.select(Math.max(0, this._actionInfos.length - 1));
	}
	
	this.move(this.x, this.y, this.windowWidth(), this.windowHeight());
	this.createContents();
};

Window_TbsAction.prototype.maxItems = function() {
	return this._actionInfos ? this._actionInfos.length : 1;
};

Window_TbsAction.prototype.drawItem = function(index) {
    var actionInfo = this._actionInfos[index];
	if (actionInfo && actionInfo.action) {
		var action = actionInfo.action;
		var costWidth = this.costWidth();
		
		var iconBoxWidth = Window_Base._iconWidth;
		this.resetTextColor();
		
		var iconIndex = this.iconIndexForAction(action);
		var enabled = this.isEnabled(action);
		this.resetTextColor();
		this.changePaintOpacity(enabled);
		if(enabled) {
			this.changeTextColor(this._actionTextColor[index]);
		}
		this.drawIcon(iconIndex, this.textPadding(), this.lineHeight() * index + 2);
		this.drawText(action.name, this.textPadding() * 2 + iconBoxWidth, this.lineHeight() * index);
		this.resetTextColor();
		this.changePaintOpacity(1);
	}
};

Window_TbsAction.prototype.selectFirstEnabledItem = function() {
	var selected = false;
	var i;
	for(i = 0; i < this.maxItems(); i++) {
		if(this.isEnabled(i) && this._actionTextColor[i] === this.normalColor()) {
			this.select(i);
			selected = true;
			break;
		}
	}
	if(!selected) {
		this.select(0);
	}
};

Window_TbsAction.prototype.costWidth = function() {
    return this.textWidth('000');
};

Window_TbsAction.prototype.isEnabled = function(action) {
	return true;
};

Window_TbsAction.prototype.isCurrentItemEnabled = function() {
	if(!this._actionInfos[this.index()]) { return false; }
	return this.isEnabled(this._actionInfos[this.index()].action);
};

Window_TbsAction.prototype.shouldOpenActionTypeWindow = function(should) {
	this._shouldOpenActionTypeWindow = should;
};

Window_TbsAction.prototype.shouldOpenTargetWindow = function(should) {
	this._shouldOpenTargetWindow = should;
};

Window_TbsAction.prototype.shouldActivateManualTarget = function(should) {
	this._shouldActivateManualTarget = should;
};

Window_TbsAction.prototype.open = function() {
    if (!this.isOpen()) {
        this._opening = true;
    }
    this._closing = false;
	if(this._actionInfoWindow) {
		this._actionInfoWindow.show();
		this._actionInfoWindow.open();
	}
};

Window_TbsAction.prototype.close = function() {
    if (!this.isClosed()) {
        this._closing = true;
    }
    this._opening = false;
	if(this._actionInfoWindow) {
		this._actionInfoWindow.close();
	}
};

Window_TbsAction.prototype.updateClose = function() {
    if (this._closing) {
        this.openness -= this.openCloseSpeed();
        if (this.isClosed()) {
			this._closing = false;
			if(this._shouldOpenActionTypeWindow) {
				this._actionTypeWindow.refresh();
				this._actionTypeWindow.show();
				this._actionTypeWindow.open();
				this._actionTypeWindow.activate();
			}
			if(this._shouldOpenTargetWindow) {
				this._targetWindow.refreshWindowContents();
				this._targetWindow.show();
				this._targetWindow.open();
				this._targetWindow.activate();
			}
			if(this._shouldActivateManualTarget) {
				$gameMap.setTbsTurnMode("manualTarget");
			}
			this._shouldOpenActionTypeWindow = false;
			this._shouldOpenTargetWindow = false;
			this._shouldActivateManualTarget = false;
        }
    }
};

Window_TbsAction.prototype.refreshWindowContents = function(dontSelectFirst) {
	this.move(this.x, this.y, this.windowWidth(), this.windowHeight());
	this.refresh(dontSelectFirst);
};

Window_TbsAction.prototype.refresh = function(dontSelectFirst) {
    this.makeItemList();
    this.createContents();
	if(!dontSelectFirst) {
		this.selectFirstEnabledItem();
	}
    this.drawAllItems();
};

Window_TbsAction.prototype.selectLast = function() {
	this.select(0);
};

Window_TbsAction.prototype.actionInfo = function() {
	return this._actionInfos && this.index() >= 0 ? this._actionInfos[this.index()] : null;
};

//-----------------------------------------------------------------------------
// Window_TbsTarget
//
// The window for selecting a target during battle

function Window_TbsTarget() {
    this.initialize.apply(this, arguments);
}

Window_TbsTarget.prototype = Object.create(Window_Selectable.prototype);
Window_TbsTarget.prototype.constructor = Window_TbsTarget;

Window_TbsTarget.prototype.initialize = function(x, y) {
    this._actors = [];
    Window_Selectable.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
	this._allies = [];
	this._enemies = [];
	this._actionIndex = -1;
    this.refresh();
	this._skipDisabled = true;
};

Window_TbsTarget.prototype.windowWidth = function() {
	if(this._actors.length > 0) {
		var longestLength = 7;
		this._actors.forEach(function (actor) {
			var name = actor.battler.name();
			if(longestLength < name.length) {
				longestLength = name.length;
			}
		});
		return this.standardPadding() * 2 + longestLength * 14 + this.textPadding() * 2;
	} else {
		return this.standardPadding() * 2 + 7 * 14 + this.textPadding() * 2;
	}
};

Window_TbsTarget.prototype.windowHeight = function() {
	return this.fittingHeight(this.numVisibleRows());
};

Window_TbsTarget.prototype.numVisibleRows = function() {
	return this.maxItems();
};

Window_TbsTarget.prototype.setActionIndex = function(index) {
	if(this._actionIndex !== index) {
		this._actionIndex = index;
		if(index >= 0) {
			var alliesAndEnemies = $gameMap.getCurrentActorAlliesAndEnemiesInRange(index);
			this._allies = alliesAndEnemies.allies;
			this._enemies = alliesAndEnemies.enemies;
		} else {
			this._allies = [];
			this._enemies = [];
		}
		this.refreshWindowContents();
	}
};

Window_TbsTarget.prototype.allies = function() {
	return this._allies;
};

Window_TbsTarget.prototype.enemies = function() {
	return this._enemies;
};

Window_TbsTarget.prototype.showAllies = function() {
	if(this._actionIndex === -1) { return; }
	this._actors = this._allies;
	this.refreshWindowContents();
};

Window_TbsTarget.prototype.showEnemies = function() {
	if(this._actionIndex === -1) { return; }
	this._actors = this._enemies;
	this.refreshWindowContents();
};

Window_TbsTarget.prototype.switchShownGroup = function() {
	if(!this.hasAlliesAndEnemies()) { return; }
	if(this._actors === this._allies) {
		this.showEnemies();
	} else {
		this.showAllies();
	}
};

Window_TbsTarget.prototype.hasAlliesAndEnemies = function() {
	if(this._actionIndex === -1) { return false; }
	return this._allies.length > 0 && this._enemies.length > 0;
};

Window_TbsTarget.prototype.hasAlliesOrEnemies = function() {
	if(this._actionIndex === -1) { return false; }
	return this._allies.length > 0 || this._enemies.length > 0;
};
	
Window_TbsTarget.prototype.processControl = function() {
	if(this.hasAlliesAndEnemies()) {
		SoundManager.playCursor();
		this.updateInputData();
		this.callHandler('control');
	} else {
		SoundManager.playBuzzer();
	}
};

Window_TbsTarget.prototype.processShift = function() {
	if(this.hasAlliesAndEnemies()) {
		SoundManager.playCursor();
		this.updateInputData();
		this.callHandler('shift');
	} else {
		SoundManager.playBuzzer();
	}
};

Window_TbsTarget.prototype.refreshWindowContents = function(dontSelectFirst) {
	this.move(this.x, this.y, this.windowWidth(), this.windowHeight());
	this.createContents();
	if(!dontSelectFirst) {
		this.selectFirstEnabledItem();
	}
	this.refresh();
};

Window_TbsTarget.prototype.selectFirstEnabledItem = function() {
	var selected = false;
	var i;
	for(i = 0; i < this.maxItems(); i++) {
		var tbsActor = this._actors[i];
		if(this.isEnabled(i) && (!tbsActor || !tbsActor.battler.isDown())) {
			this.select(i);
			selected = true;
			break;
		}
	}
	if(!selected) {
		this.select(0);
	}
};

Window_TbsTarget.prototype.setActorStatusWindow = function(actorStatusWindow) {
	if (this._actorStatusWindow !== actorStatusWindow) {
		this._actorStatusWindow = actorStatusWindow;
	}
};

Window_TbsTarget.prototype.setActionWindow = function(actionWindow) {
	if (this._actionWindow !== actionWindow) {
		this._actionWindow = actionWindow;
	}
};

Window_TbsTarget.prototype.setTargetPartWindow = function(targetPartWindow) {
	if (this._targetPartWindow !== targetPartWindow) {
		this._targetPartWindow = targetPartWindow;
	}
};

Window_TbsTarget.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
	if (!$gameMap.currentForce() || !$gameMap.currentForce().isParty || !this.isOpenAndActive()) { return; }
	if (this._actors && this._actors.length > 0 && this.index() >= 0) {
		if(this._actorStatusWindow) {
			this._actorStatusWindow.setTbsActor(this.actor());
		}
		if(this.index() === this.maxItems() - 1)
		{
			$gameMap.setTbsActionTargetLocation(-1, -1);
			return;
		}
		$gameMap.setTbsActionTargetLocation(this.actor().chara.x, this.actor().chara.y);
	}
};

Window_TbsTarget.prototype.maxItems = function() {
    return this._actors ? this._actors.length + 1: 1;
};

Window_TbsTarget.prototype.actor = function() {
    return this._actors[this.index()];
};

Window_TbsTarget.prototype.drawItem = function(index) {
    if (this._actors && this._actors.length > 0) {
		if(index === this.maxItems() - 1) {
			this.drawText("*Manual", this.textPadding(), this.lineHeight()*index);
		} else {
			var tbsActor = this._actors[index];
			var name = "";
			this.resetTextColor();
			this.changePaintOpacity(true);
			if(tbsActor.battler.isDown()) {
				this.changeTextColor(this.deathColor());
			}
			this.drawText(tbsActor.battler.name(), this.textPadding(), this.lineHeight()*index);
			this.resetTextColor();
			this.changePaintOpacity(true);
		}
    }
};

Window_TbsTarget.prototype.isOnManualTarget = function() {
    return this._actors && this._actors.length > 0 && this.index() === this.maxItems() - 1;
};

Window_TbsTarget.prototype.isEnabled = function(index) {
    return true;
};

Window_TbsTarget.prototype.isCurrentItemEnabled = function() {
    return this.isEnabled(this.index());
};

Window_TbsTarget.prototype.shouldOpenActionWindow = function(should) {
	this._shouldOpenActionWindow = should;
};

Window_TbsTarget.prototype.shouldOpenTargetPartWindow = function(should) {
	this._shouldOpenTargetPartWindow = should;
};

Window_TbsTarget.prototype.shouldActivateManualTarget = function(should) {
	this._shouldActivateManualTarget = should;
};

Window_TbsTarget.prototype.open = function() {
    if (!this.isOpen()) {
        this._opening = true;
    }
    this._closing = false;
	if(this._actorStatusWindow) {
		this._actorStatusWindow.show();
		this._actorStatusWindow.open();
	}
};

Window_TbsTarget.prototype.close = function() {
    if (!this.isClosed()) {
        this._closing = true;
    }
    this._opening = false;
	if(this._actorStatusWindow && !this._actorStatusWindow.isOpening() && !this._shouldOpenTargetPartWindow && !this._shouldActivateManualTarget) {
		this._actorStatusWindow.close();
	}
};

Window_TbsTarget.prototype.updateClose = function() {
    if (this._closing) {
        this.openness -= this.openCloseSpeed();
        if (this.isClosed()) {
			this._closing = false;
			if(this._shouldOpenActionWindow) {
				this._actionWindow.refreshWindowContents(true);
				this._actionWindow.show();
				this._actionWindow.open();
				this._actionWindow.activate();
			}
			if(this._shouldOpenTargetPartWindow) {
				this._targetPartWindow.refreshWindowContents();
				this._targetPartWindow.show();
				this._targetPartWindow.open();
				this._targetPartWindow.activate();
			}
			if(this._shouldActivateManualTarget) {
				$gameMap.setTbsTurnMode("manualTarget");
			}
			this._shouldOpenActionWindow = false;
			this._shouldOpenTargetPartWindow = false;
			this._shouldActivateManualTarget = false;
        }
    }
};

//-----------------------------------------------------------------------------
// Window_TbsTargetName
//
// The window for displaying a manual target's name in tbs combat

function Window_TbsTargetName() {
    this.initialize.apply(this, arguments);
}

Window_TbsTargetName.prototype = Object.create(Window_Base.prototype);
Window_TbsTargetName.prototype.constructor = Window_TbsTargetName;

Window_TbsTargetName.prototype.initialize = function(x, y) {
    Window_Base.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
    this.refresh();
    this.activate();
};

Window_TbsTargetName.prototype.windowWidth = function() {
	if(this._tbsActor) {
		return this.standardPadding() * 2 + this._tbsActor.battler.name().length * 14 + this.textPadding() * 2;
	} else {
		return 300;
	}
};

Window_TbsTargetName.prototype.windowHeight = function() {
	return this.fittingHeight(1);
};

Window_TbsTargetName.prototype.setTargetActor = function(tbsActor, adjustX) {
	if(this._tbsActor !== tbsActor) {
		this._tbsActor = tbsActor;
		this.refreshWindowContents(adjustX);
	}
};

Window_TbsTargetName.prototype.refreshWindowContents = function(adjustX) {
	var newX = this.x;
	if(adjustX) {
		newX += this.width - this.windowWidth();
	}
	this.move(newX, this.y, this.windowWidth(), this.windowHeight());
	this.createContents();
	this.refresh();
};

Window_TbsTargetName.prototype.refresh = function() {
    if (this.contents) {
        this.contents.clear();
		if(this._tbsActor) {
			this.drawTargetNameText();
		}
    }
};

Window_TbsTargetName.prototype.drawTargetNameText = function() {
	if(this._tbsActor) {
		var battler = this._tbsActor.battler;
		this.resetTextColor();
		this.changePaintOpacity(true);
		if(battler.isDown()) {
			this.changeTextColor(this.deathColor());
		}
		this.drawText(battler.name(), this.textPadding(), 0);
		this.resetTextColor();
		this.changePaintOpacity(true);
	}
};

Window_TbsTargetName.prototype.setTargetAndPosOnOpen = function(target, adjustX) {
	this._setTargetAndPosOnOpen = true;
	this._targetOnOpen = target;
	this._adjustXOnOpen = adjustX;
};

Window_TbsTargetName.prototype.setShouldReOpen = function(should) {
	this._shouldReOpen = should;
};

Window_TbsTargetName.prototype.updateClose = function() {
    if (this._closing) {
        this.openness -= this.openCloseSpeed();
        if (this.isClosed()) {
			this._closing = false;
			if(this._shouldReOpen) {
				this.open();
			}
			this._shouldReOpen = false;
        }
    }
};

Window_TbsTargetName.prototype.open = function() {
    if (!this.isOpen()) {
        this._opening = true;
		if(this._setTargetAndPosOnOpen) {
			this._setTargetAndPosOnOpen = false;
			this.setTargetActor(this._targetOnOpen, this._adjustXOnOpen);
		}
    }
    this._closing = false;
};

//-----------------------------------------------------------------------------
// Window_TbsTargetPart
//
// The window for selecting a target's body part during a turn based battle

function Window_TbsTargetPart() {
    this.initialize.apply(this, arguments);
}

Window_TbsTargetPart.prototype = Object.create(Window_Command.prototype);
Window_TbsTargetPart.prototype.constructor = Window_TbsTargetPart;

Window_TbsTargetPart.prototype.initialize = function(x, y) {
    Window_Command.prototype.initialize.call(this, x, y);
	this._skipDisabled = true;
};

Window_TbsTargetPart.prototype.windowWidth = function() {
	var textWidth = 14 * 9;
    return textWidth + this.standardPadding()*2 + this.textPadding()*2;
};

Window_TbsTargetPart.prototype.numVisibleRows = function() {
	return 6;
};

Window_TbsTargetPart.prototype.makeCommandList = function() {
	this.addCommand("Head", 'targetPart', true, 1);
	this.addCommand("Torso", 'targetPart', true, 2);
	this.addCommand("Left Arm", 'targetPart', true, 3);
	this.addCommand("Right Arm", 'targetPart', true, 4);
	this.addCommand("Left Leg", 'targetPart', true, 5);
	this.addCommand("Right Leg", 'targetPart', true, 6);
};

Window_TbsTargetPart.prototype.refreshWindowContents = function() {
	this.move(this.x, this.y, this.windowWidth(), this.windowHeight());
	this.createContents();
	this.refresh();
};

Window_TbsTargetPart.prototype.setTargetWindow = function(targetWindow) {
	if (this._targetWindow !== targetWindow) {
		this._targetWindow = targetWindow;
		this.refresh();
	}
};

Window_TbsTargetPart.prototype.setActorStatusWindow = function(actorStatusWindow) {
	if (this._actorStatusWindow !== actorStatusWindow) {
		this._actorStatusWindow = actorStatusWindow;
	}
};

Window_TbsTargetPart.prototype.update = function() {
	Window_Command.prototype.update.call(this);
	if (!$gameMap.currentForce() || !$gameMap.currentForce().isParty || !this.isOpenAndActive()) { return; }
	var part = "none";
	var ext = this.currentExt();
	switch(ext) {
		case 1:
			part = "head";
			break;
		case 2:
			part = "torso";
			break;
		case 3:
			part = "leftArm";
			break;
		case 4:
			part = "rightArm";
			break;
		case 5:
			part = "leftLeg";
			break;
		case 6:
			part = "rightLeg";
			break;
	}
	$gameMap.setTbsActionTargetPart(part);
};

Window_TbsTargetPart.prototype.shouldOpenTargetWindow = function(should) {
	this._shouldOpenTargetWindow = should;
};

Window_TbsTargetPart.prototype.shouldActivateManualTarget = function(should) {
	this._shouldActivateManualTarget = should;
};

Window_TbsTargetPart.prototype.close = function() {
    if (!this.isClosed()) {
        this._closing = true;
    }
    this._opening = false;
	if(this._actorStatusWindow && !this._actorStatusWindow.isOpening() && !this._shouldOpenTargetWindow && !this._shouldActivateManualTarget) {
		this._actorStatusWindow.close();
	}
};

Window_TbsTargetPart.prototype.updateClose = function() {
    if (this._closing) {
        this.openness -= this.openCloseSpeed();
        if (this.isClosed()) {
			this._closing = false;
			if(this._shouldOpenTargetWindow) {
				this._targetWindow.refreshWindowContents(true);
				this._targetWindow.show();
				this._targetWindow.open();
				this._targetWindow.activate();
			}
			if(this._shouldActivateManualTarget) {
				$gameMap.setTbsTurnMode("manualTarget");
			}
			this._shouldOpenTargetWindow = false;
			this._shouldActivateManualTarget = false;
        }
    }
};

//-----------------------------------------------------------------------------
// Window_TbsBreadcrumb
//
// The window for displaying pending selections in tbs combat

function Window_TbsBreadcrumb() {
    this.initialize.apply(this, arguments);
}

Window_TbsBreadcrumb.prototype = Object.create(Window_Base.prototype);
Window_TbsBreadcrumb.prototype.constructor = Window_TbsBreadcrumb;

Window_TbsBreadcrumb.prototype.initialize = function(x, y) {
    Window_Base.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
    this.refresh();
    this.activate();
	this._otherBreadcrumbWindows = [];
	this._flashValue = 255;
	this._flashDecreasing = true;
	this._flashIncrement = 5;
};

Window_TbsBreadcrumb.prototype.windowWidth = function() {
	if(this._breadcrumbInfo) {
		if(this._breadcrumbInfo.action) {
			return this.standardPadding() * 2 + this._breadcrumbInfo.text.length * 14 + Window_Base._iconWidth + this.textPadding() * 3;
		} else {
			return this.standardPadding() * 2 + this._breadcrumbInfo.text.length * 14 + this.textPadding() * 2;
		}
	} else {
		return 300;
	}
};

Window_TbsBreadcrumb.prototype.windowHeight = function() {
	return this.fittingHeight(1);
};

Window_TbsBreadcrumb.prototype.addOtherBreadcrumbWindow = function(bcWindow) {
	this._otherBreadcrumbWindows.push(bcWindow);
};

Window_TbsBreadcrumb.prototype.setBreadcrumbInfo = function(info) {
	this._breadcrumbInfoToSet = info;
	this._needToSetBreadcrumbInfo = true;
};

Window_TbsBreadcrumb.prototype.playSounds = function(playSounds, playBattleStartSound) {
	this._playSounds = playSounds;
	this._playBattleStartSound = playBattleStartSound;
};

Window_TbsBreadcrumb.prototype.refreshWindowContents = function() {
	this.move(this.x, this.y, this.windowWidth(), this.windowHeight());
	this.createContents();
	this.refresh();
};

Window_TbsBreadcrumb.prototype.refresh = function() {
    if (this.contents) {
        this.contents.clear();
		if(this._breadcrumbInfo) {
			this.drawBreadcrumbText();
		}
    }
};

Window_TbsBreadcrumb.prototype.update = function() {
    Window_Base.prototype.update.call(this);
	if (this._needToSetBreadcrumbInfo && (this.isClosed() || !this.visible)) {
		this._flashValue = 255;
		this._breadcrumbInfo = this._breadcrumbInfoToSet;
		this._breadcrumbInfoToSet = undefined;
		this._needToSetBreadcrumbInfo = false;
		this.refreshWindowContents();
	}
	this.openIfNecessary();
	if(this.isOpen() && this._breadcrumbInfo && this._breadcrumbInfo.flashing) {
		if(this._flashDecreasing) {
			this._flashValue -= this._flashIncrement;
			if(this._flashValue <= this.translucentOpacity()) {
				this._flashValue = this.translucentOpacity();
				this._flashDecreasing = false;
			}
		} else {
			this._flashValue += this._flashIncrement;
			if(this._flashValue >= 255) {
				this._flashValue = 255;
				this._flashDecreasing = true;
			}
		}
		this.refresh();
	}
};

Window_TbsBreadcrumb.prototype.openIfNecessary = function() {
	if (this._breadcrumbInfo && (this.isClosed() || !this.visible)) {
		var windowsOpen = false;
		var i;
		for(i = 0; i < this._otherBreadcrumbWindows.length; i++) {
			if(!this._otherBreadcrumbWindows[i].isClosed() && this._otherBreadcrumbWindows[i].visible) {
				windowsOpen = true;
				break;
			}
		}
		if(!windowsOpen) {
			this.refresh();
			this.show();
			this.open();
			if(this._playSounds) {
				if(this._playBattleStartSound) {
					SoundManager.playTbsBattleStartSound();
					this._playBattleStartSound = false;
				} else {
					SoundManager.playWindowOpenCloseSound();
				}
				this._playSounds = false;
			}
		}
	}
};

Window_TbsBreadcrumb.prototype.drawBreadcrumbText = function() {
	if(this._breadcrumbInfo) {
		this.contents.paintOpacity = this._flashValue;
		if(this._breadcrumbInfo.action) {
			var iconBoxWidth = Window_Base._iconWidth;
			var iconIndex = this.iconIndexForAction(this._breadcrumbInfo.action);
			this.drawIcon(iconIndex, this.textPadding(), 2);
			this.drawText(this._breadcrumbInfo.text, this.textPadding() * 2 + iconBoxWidth, 0);
		} else {
			this.drawText(this._breadcrumbInfo.text, this.textPadding(), 0);
		}
		this.changePaintOpacity(true);
	}
};

Window_TbsBreadcrumb.prototype.updateOpen = function() {
    if (this._opening) {
        this.openness += this.openCloseSpeed();
        if (this.isOpen()) {
			this._flashValue = 255;
			this._flashDecreasing = true;
            this._opening = false;
        }
    }
};
 
(function() {
	//base
	Window_Base.prototype.openCloseSpeed = function() {
		return 64;
	};
	
	Window_Base.prototype.updateOpen = function() {
		if (this._opening) {
			this.openness += this.openCloseSpeed();
			if (this.isOpen()) {
				this._opening = false;
			}
		}
	};

	Window_Base.prototype.updateClose = function() {
		if (this._closing) {
			this.openness -= this.openCloseSpeed();
			if (this.isClosed()) {
				this._closing = false;
			}
		}
	};
	
	Window_Base.prototype.drawActorSimpleStatus = function(actor, x, y, width) {
		var lineHeight = this.lineHeight();
		var x2 = x + 180;
		var width2 = Math.min(200, width - 180 - this.textPadding());
		this.drawActorName(actor, x, y);
		this.drawActorIcons(actor, x, y + lineHeight * 2);
		this.drawActorDamage(actor, x2, y);
	};
	
	Window_Base.prototype.drawActorDamage = function(actor, x, y) {
		var xIncrement = 42;
		
		this.drawActorPartDamge(actor, "head"    , x + xIncrement/2  , y                        , "He");
		this.drawActorPartDamge(actor, "mind"    , x + xIncrement*1.5, y                        , "Mi");
		this.drawActorPartDamge(actor, "rightArm", x                 , y + this.lineHeight()    , "RA");
		this.drawActorPartDamge(actor, "torso"   , x + xIncrement    , y + this.lineHeight()    , "To");
		this.drawActorPartDamge(actor, "leftArm" , x + xIncrement * 2, y + this.lineHeight()    , "LA");
		this.drawActorPartDamge(actor, "rightLeg", x                 , y + this.lineHeight() * 2, "RL");
		this.drawActorPartDamge(actor, "leftLeg" , x + xIncrement * 2, y + this.lineHeight() * 2, "LL");
	};
	
	Window_Base.prototype.drawActorPartDamge = function(actor, part, x, y, label) {
		if(actor.getDamage(part)) {
			if(actor.getDamage(part) >= 2) {
				this.changeTextColor(this.deathColor());
			} else { this.changeTextColor(this.crisisColor()); }
		} else { this.resetTextColor(); }
		this.drawText(label, x, y, 100);
		this.resetTextColor();
	};
	
	Window_Base.prototype.drawActionSkillRequirements = function(action, actionIndex, lineOffset, drawName, actor) {
		if(!action) { return 0; }
		if(actionIndex === undefined) { actionIndex = 0; }
		if(lineOffset === undefined) { lineOffset = 0; }
		
		var nameOffset = drawName ? 254 : 0;
		var skillsPosition = nameOffset + 182;
		var characterWidth = 14;
		
		var reqs = action.skillRequirements;
		if(!reqs || reqs.length === 0) {
			this.resetTextColor();
			if(drawName) {
				this.drawText(action.name, 0, this.lineHeight() * (actionIndex + 1 + lineOffset), 400);
			}
			this.drawText("-", nameOffset, this.lineHeight() * (actionIndex + 1 + lineOffset), 400);
			return 0;
		}
		var reqsMet = true;
		var i;
		for(i = 0; i < reqs.length; i++) {
			var lineHeight = this.lineHeight() * (actionIndex + i + 1 + lineOffset);
			this.resetTextColor();
			this.drawText(this.getDisplayNameForUniqueSkill(reqs[i].skill), nameOffset, lineHeight, 400);
			if(actor) {
				if(reqs[i].level > actor.totalSkill(reqs[i].skill)) {
					this.changeTextColor(this.deathColor());
					reqsMet = false;
				}
				this.drawText(actor.totalSkill(reqs[i].skill), skillsPosition, lineHeight, 400);
				this.resetTextColor();
				this.drawText("/", skillsPosition + characterWidth, lineHeight, 400);
			}
			this.drawText(reqs[i].level, skillsPosition + characterWidth * 2, lineHeight, 400);
		}
		this.resetTextColor();
		if(drawName) {
			if(!reqsMet) {
				this.changeTextColor(this.deathColor());
			}
			for(i = 0; i < reqs.length; i++) {
				var lineHeight = this.lineHeight() * (actionIndex + i + 1 + lineOffset);
				if(i === 0 ) {
					this.drawText(action.name, 0, lineHeight, 400);
				} else {
					this.drawText(":", 0, lineHeight, 400);
				}
			}
		}
		this.resetTextColor();
		
		return reqs.length > 1 ? reqs.length - 1 : 0; 
	};
	
	Window_Base.prototype.drawActionInfo = function(actionInfo, actionIndex, lineOffset, drawName, actor) {
		if(!actionInfo || !actionInfo.action) { return 0; }
		if(actionIndex === undefined) { actionIndex = 0; }
		if(lineOffset === undefined) { lineOffset = 0; }
		
		var action = actionInfo.action;
		var nameOffset = drawName ? 254 : 0;
		var curLineOffset = lineOffset;
		var hits = action.hits;
		if(!hits) { return 0; }
		var reqLacked = false;
		var i;
		for(i = 0; i < hits.length; i++) {
			var lineHeight = this.lineHeight() * (actionIndex + i + 1 + curLineOffset);
			
			var rangeTypeIconId = hits[i].rangeType ? this.getIconIdFor(hits[i].rangeType) : 0;
			var rangeIsSelf = hits[i].rangeType && hits[i].rangeType === "self";
			this.drawIcon(rangeTypeIconId, nameOffset, lineHeight);
			var hitRange = hits[i].range !== undefined ? hits[i].range : 0;
			hitRange += hits[i].ignoreUserRange || !actor ? 0 : actor.baseRange();
			var range = hitRange;
			this.drawText(!rangeIsSelf && range > 0 ? range : "-", nameOffset - 38, lineHeight, 100, 'right');
			var accuracyBonus = hits[i].accuracyBonus !== undefined ? hits[i].accuracyBonus : 0;
			this.drawText((hits[i].damage || hits[i].debuffs) && accuracyBonus > 0 ? accuracyBonus : "-", nameOffset + 8, lineHeight, 100, 'right');
			this.drawText(hits[i].aoe > 0 ? hits[i].aoe : "-", nameOffset + 124, lineHeight, 100, 'right');
			
			if(i === 0) {
				if(actor) {
					var uniqueSkills = actor.uniqueSkills();
					var j;
					for(j = 0; j < uniqueSkills.length; j++) {
						var req = this.actionSkillRequirement(action, uniqueSkills[j]);
						var actorSkill = actor.totalSkill(uniqueSkills[j]);
						
						if(actorSkill < req) {
							this.changeTextColor(this.deathColor());
							reqLacked = true;
						}
					}
				}
				
				/* if(drawSkillReqs) {
					var skillsPosition = nameOffset + 242;
					var characterWidth = 14;
					this.changeTextColor(this.systemColor());
					this.drawText("/", skillsPosition + characterWidth, lineHeight);
					this.drawText("/", skillsPosition + characterWidth * 3, lineHeight);
					this.resetTextColor();
					if(actor) {
						var uniqueSkills = actor.uniqueSkills();
						var j;
						for(j = 0; j < uniqueSkills.length; j++) {
							var req = this.actionSkillRequirement(action, uniqueSkills[j]);
							var actorSkill = actor.totalSkill(uniqueSkills[j]);
							
							if(actorSkill < req) {
								this.changeTextColor(this.deathColor());
								reqLacked = true;
							}
							
							this.drawText(req > 0 ? req : "-", skillsPosition + characterWidth * j * 2, lineHeight);
							this.resetTextColor();
						}
					} else {
						var j = 0;
						if (action.skillRequirements && action.skillRequirements.length > 0) {
							for(; j < action.skillRequirements.length; j++) {
								var req = action.skillRequirements[j].level;
								this.drawText(req > 0 ? req : "-", skillsPosition + characterWidth * j * 2, lineHeight);
							}
						}
						if(j < 2) {
							for(; j < 3; j++) {
								this.drawText("-", skillsPosition + characterWidth * j * 2, lineHeight);
							}
						}
					}
				} */
				
				if(drawName) {
					if(reqLacked) {
						this.changeTextColor(this.deathColor());
					}
					this.drawText(action.name, 0, lineHeight, 160);
					this.resetTextColor();
				}
			} else {
				if (drawName) {
					if(reqLacked) {
						this.changeTextColor(this.deathColor());
					}
					this.drawText(": Effect " + (i+1), 0, lineHeight);
					this.resetTextColor();
				}
			}
			
			var damageLineOffset = 0;
			var damage = hits[i].damage;
			var heal = hits[i].heal;
			var buffs = hits[i].buffs;
			if(!damage && !heal && !buffs) {
				this.drawText("-", nameOffset + 78, lineHeight, 100, 'right');
				this.drawText("-", nameOffset + 124, lineHeight, 100, 'right');
			} else {
				if(damage) {
					var hitDamage = BattleManager.getCompleteDamage(actor, actionInfo, hits[i]);
					
					damageLineOffset += this.drawDamageForType(hitDamage.trip, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("trip"));
					damageLineOffset += this.drawDamageForType(hitDamage.blunt, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("blunt"));
					damageLineOffset += this.drawDamageForType(hitDamage.cut, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("cut"));
					damageLineOffset += this.drawDamageForType(hitDamage.keen, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("keen"));
					damageLineOffset += this.drawDamageForType(hitDamage.thrust, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("thrust"));
					damageLineOffset += this.drawDamageForType(hitDamage.stiletto, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("stiletto"));
					damageLineOffset += this.drawDamageForType(hitDamage.bullet, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("bullet"));
					damageLineOffset += this.drawDamageForType(hitDamage.fire, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("fire"));
					damageLineOffset += this.drawDamageForType(hitDamage.ice, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("ice"));
					damageLineOffset += this.drawDamageForType(hitDamage.corrosion, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("corrosion"));
					damageLineOffset += this.drawDamageForType(hitDamage.lightning, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("conducted"));
					damageLineOffset += this.drawDamage(hitDamage.psychic, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("psychic")) ? 1 : 0;
				}
				if(heal) {
					damageLineOffset += this.drawHeal(heal.stress, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("healStress")) ? 1 : 0;
					damageLineOffset += this.drawHeal(heal.damage, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("healBody")) ? 1 : 0;
				}
				if(buffs) {
					var j;
					for(j = 0; j < buffs.length; j++) {
						var prot = buffs[j].protection;
						if(!prot) { continue; }
						var fullBody = prot.fullBody;
						if(fullBody && fullBody.defense) {
							var defense = fullBody.defense;
							damageLineOffset += this.drawHeal(defense.solid, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("solidDefense")) ? 1 : 0;
							damageLineOffset += this.drawHeal(defense.fluid, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("fluidDefense")) ? 1 : 0;
						}
						var mental = prot.mental;
						if(mental) {
							damageLineOffset += this.drawHeal(mental.defense, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("mentalDefense")) ? 1 : 0;
						} 
					}
				}
			}
			curLineOffset += Math.max(0, damageLineOffset-1);
		}
		
		return curLineOffset - lineOffset;
	};
	
	Window_Base.prototype.actionSkillRequirement = function(action, skill) {
		if(!action || !skill) { return 0; }
		var reqs = action.skillRequirements;
		if(!reqs) { return 0; }
		var i;
		for(i = 0; i < reqs.length; i++) {
			if(reqs[i].skill === skill) {
				return reqs[i].level;
			}
		}
		return 0;
	};
	
	Window_Base.prototype.drawDamageForType = function(damage, drawName, nameOffset, lineHeight, lineOffset, reqLacked, iconId) {
		var lineCount = 0;
		lineCount += this.drawDamage(damage, drawName, nameOffset, lineHeight, lineOffset + lineCount, reqLacked, iconId) ? 1 : 0;
		return lineCount;
	};
	
	Window_Base.prototype.drawDamage = function(power, drawName, nameOffset, lineHeight, lineOffset, reqLacked, iconId) {
		if(power > 0) {
			this.drawIcon(iconId, nameOffset + 116, lineHeight + this.lineHeight() * lineOffset);
			this.drawText(power > 0 ? power : "-", nameOffset + 78, lineHeight + this.lineHeight() * lineOffset, 100, 'right');
			if(drawName && lineOffset > 0) {
				if(reqLacked) {
					this.changeTextColor(this.deathColor());
				}
				this.drawText(":", 0, lineHeight + this.lineHeight() * lineOffset);
				this.resetTextColor();
			}
			return true;
		}
		return false;
	};
	
	Window_Base.prototype.drawHeal = function(heal, drawName, nameOffset, lineHeight, lineOffset, reqLacked, iconId) {
		if(heal !== undefined) {
			this.drawIcon(iconId, nameOffset + 116, lineHeight + this.lineHeight() * lineOffset);
			var power = heal !== undefined ? heal : 0;
			this.drawText(power > 0 ? power : "-", nameOffset + 78, lineHeight + this.lineHeight() * lineOffset, 100, 'right');
			if(drawName && lineOffset > 0) {
				if(reqLacked) {
					this.changeTextColor(this.deathColor());
				}
				this.drawText(":", 0, lineHeight + this.lineHeight() * lineOffset);
				this.resetTextColor();
			}
			return true;
		}
		return false;
	};
	
	Window_Base.prototype.getDisplayNameForUniqueSkill = function(skill)
	{
		switch(skill)
		{
			case "meleeWeapons":
				return "Melee Wpns";
				break;
			case "throwingWeapons":
				return "Thrown Wpns";
				break;
			case "rangedWeapons":
				return "Ranged Wpns";
				break;
			case "whiteMagic":
				return "White Magic";
				break;
			case "blackMagic":
				return "Black Magic";
				break;
			default:
				return "UNKNOWN NAME";
		};
	};
	
	Window_Base.prototype.getIconIdFor = function(type) {
		switch(type) {
			case "solidDefense":   	return  81; break;
			case "fluidDefense":   	return  69; break;
			case "mentalDefense":	return 302; break;
			
			case "trip":          	return   6; break;
			case "blunt":          	return 110; break;
			case "cut":            	return  99; break;
			case "keen":            return 120; break;
			case "thrust":        	return 107; break;
			case "stiletto":        return  96; break;
			case "bullet":         	return 104; break;
			case "fire":           	return  64; break;
			case "ice":            	return  65; break;
			case "corrosion":      	return   2; break;
			case "conducted":		return  66; break;
			case "psychic":        	return  71; break;
			
			case "healStress":     	return  80; break;
			case "healBody":       	return  84; break;
			case "healMind":       	return  72; break;
			
			case "self":           	return  75; break;
			case "melee":          	return  97; break;
			case "thrown":         	return 114; break;
			case "fired":          	return 102; break;
			case "followUp":        return  73; break;
			
			case "action":			return  76; break;
			case "skill":      	   	return  88; break;
			case "knowledge":      	return  79; break;
		}
		return 0;
	};
	
	Window_Base.prototype.drawDescription = function(description) {
		if(!description) { return; }
		
		var lineWidth = 34;
		var descWords = description.split(" ");
		var i;
		var descLine = "";
		var descLineNum = 0;
		for(i = 0; i < descWords.length ; i++) {
			if(descLine.length + descWords[i].length + (descLine.length > 0 ? 1 : 0) > lineWidth) {
				this.drawText(descLine, 0, this.lineHeight() * descLineNum);
				descLineNum++;
				descLine = "";
			}
			
			if(descLine.length > 0) {
				descLine += " ";
			}
			descLine += descWords[i];
		}
		
		if(descLine.length > 0) {
			this.drawText(descLine, 0, this.lineHeight() * descLineNum);
		}
	};
	
	Window_Base.prototype.iconIndexForAction = function(action) {
		if(action.menuIcon !== undefined) { return action.menuIcon; }
		return 79;
	};
	
	//menu actor
	Window_MenuActor.prototype.initialize = function() {
		Window_MenuStatus.prototype.initialize.call(this, 0, 0);
		this._displayMode = false;
		this.hide();
	};
	
	Window_MenuActor.prototype.processOk = function() {
		if(this._displayMode) { return; }
		
		if (!this.cursorAll()) {
			$gameParty.setTargetActor($gameParty.members()[this.index()]);
		}
		this.callOkHandler();
	};
	
	Window_MenuActor.prototype.setDisplayMode = function(displayMode) {
		this._displayMode = displayMode;
		if(displayMode) {
			this.select(-1);
			this.setCursorFixed(true);
		}
	};
	
	Window_MenuActor.prototype.selectForActionInfo = function(actionInfo) {
		var actor = $gameParty.menuActor();
		this.setCursorFixed(false);
        this.selectLast();
		//TODO: use the action to figure out which actor to select. I guess.
	};
	
	//selectable
	Window_Selectable.prototype.initialize = function(x, y, width, height) {
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this._index = -1;
		this._cursorFixed = false;
		this._cursorAll = false;
		this._stayCount = 0;
		this._helpWindow = null;
		this._handlers = {};
		this._touching = false;
		this._scrollX = 0;
		this._scrollY = 0;
		this._skipDisabled = false;
		this.deactivate();
	};
	
	Window_Selectable.prototype.checkIfCursorNeedsReposition = function() {
		//if(this._skipDisabled && !this.isCurrentItemEnabled()) {
		//	this.cursorDown(true);
		//}
	};
	
	Window_Selectable.prototype.cursorDown = function(wrap) {
		var index = this.index();
		var maxItems = this.maxItems();
		var maxCols = this.maxCols();
		if (index < maxItems - maxCols || (wrap && maxCols === 1)) {
			this.select((index + maxCols) % maxItems);
		}
		// if(this.index !== this.index() && this._skipDisabled && !this.isCurrentItemEnabled()) {
			// this.cursorDown(wrap);
		// }
	};

	Window_Selectable.prototype.cursorUp = function(wrap) {
		var index = this.index();
		var maxItems = this.maxItems();
		var maxCols = this.maxCols();
		if (index >= maxCols || (wrap && maxCols === 1)) {
			this.select((index - maxCols + maxItems) % maxItems);
		}
		// if(this.index !== this.index() && this._skipDisabled && !this.isCurrentItemEnabled()) {
			// this.cursorUp(wrap);
		// }
	};

	Window_Selectable.prototype.cursorRight = function(wrap) {
		var index = this.index();
		var maxItems = this.maxItems();
		var maxCols = this.maxCols();
		if (maxCols >= 2 && (index < maxItems - 1 || (wrap && this.isHorizontal()))) {
			this.select((index + 1) % maxItems);
		}
		// if(this.index !== this.index() && this._skipDisabled && !this.isCurrentItemEnabled()) {
			// this.cursorRight(wrap);
		// }
	};

	Window_Selectable.prototype.cursorLeft = function(wrap) {
		var index = this.index();
		var maxItems = this.maxItems();
		var maxCols = this.maxCols();
		if (maxCols >= 2 && (index > 0 || (wrap && this.isHorizontal()))) {
			this.select((index - 1 + maxItems) % maxItems);
		}
		// if(this.index !== this.index() && this._skipDisabled && !this.isCurrentItemEnabled()) {
			// this.cursorLeft(wrap);
		// }
	};

	Window_Selectable.prototype.cursorPagedown = function() {
		var index = this.index();
		var maxItems = this.maxItems();
		if (this.topRow() + this.maxPageRows() < this.maxRows()) {
			this.setTopRow(this.topRow() + this.maxPageRows());
			this.select(Math.min(index + this.maxPageItems(), maxItems - 1));
		}
		// if(this.index !== this.index() && this._skipDisabled && !this.isCurrentItemEnabled()) {
			// this.cursorDown(true);
		// }
	};

	Window_Selectable.prototype.cursorPageup = function() {
		var index = this.index();
		if (this.topRow() > 0) {
			this.setTopRow(this.topRow() - this.maxPageRows());
			this.select(Math.max(index - this.maxPageItems(), 0));
		}
		// if(this.index !== this.index() && this._skipDisabled && !this.isCurrentItemEnabled()) {
			// this.cursorUp(true);
		// }
	};
	
	Window_Selectable.prototype.processHandling = function() {
		if (this.isOpenAndActive()) {
			if (this.isOkEnabled() && this.isOkTriggered()) {
				this.processOk();
			} else if (this.isCancelEnabled() && this.isCancelTriggered()) {
				this.processCancel();
			} else if (this.isHandled('pagedown') && Input.isTriggered('pagedown')) {
				this.processPagedown();
			} else if (this.isHandled('pageup') && Input.isTriggered('pageup')) {
				this.processPageup();
			} else if (this.isHandled('control') && Input.isTriggered('control')) {
				this.processControl();
			} else if (this.isHandled('shift') && Input.isTriggered('shift')) {
				this.processShift();
			}
		}
	};
	
	Window_Selectable.prototype.processControl = function() {
		SoundManager.playCursor();
		this.updateInputData();
		this.callHandler('control');
	};
	
	Window_Selectable.prototype.processShift = function() {
		SoundManager.playCursor();
		this.updateInputData();
		this.callHandler('shift');
	};

	Window_Selectable.prototype.selectFirstEnabledItem = function() {
		var selected = false;
		var i;
		for(i = 0; i < this.maxItems(); i++) {
			if(this.isEnabled(i)) {
				this.select(i);
				selected = true;
				break;
			}
		}
		if(!selected) {
			this.select(0);
		}
	};

	Window_Selectable.prototype.isEnabled = function(index) {
		return true;
	};
	
	Window_Selectable.prototype.isHealing = function(action) {
		return action && action.hits && action.hits.length > 0 &&
			action.hits.some(function(hit) { return hit.heal && hit.heal.damage !== undefined && hit.heal.damage > 0 });
	};
	
	//item category
	Window_ItemCategory.prototype.setDescriptionWindow = function(descriptionWindow) {
		if (this._descriptionWindow !== descriptionWindow) {
			this._descriptionWindow = descriptionWindow;
			this.update();
		}
	};

	Window_ItemCategory.prototype.setStatusWindow = function(statusWindow) {
		if (this._statusWindow !== statusWindow) {
			this._statusWindow = statusWindow;
			this.refresh();
		}
	};
	
	Window_ItemCategory.prototype.update = function() {
		Window_HorzCommand.prototype.update.call(this);
		if (this._itemWindow) {
			this._itemWindow.setCategory(this.currentSymbol());
		}
		if(this._descriptionWindow && this.isOpenAndActive() && (!this._itemWindow || !this._itemWindow.isOpenAndActive())) {
			switch(this.index()) {
				case 0:
					this._descriptionWindow.setDescription("Consumable items and materials.");
					break;
				case 1:
					this._descriptionWindow.setDescription("Weapons, shields, and other held equipment.");
					break;
				case 2:
					this._descriptionWindow.setDescription("Wearable equipment that provides protection, and other passive enhancements.");
					break;
				case 3:
					this._descriptionWindow.setDescription("Keys, of course, as well as anything else that is only useable in certain places.");
					break;
			}
		}
		if(this._statusWindow && this.isOpenAndActive()) {
			switch(this.index()) {
				case 0:
					this._statusWindow.showDescription();
					break;
				case 1:
					this._statusWindow.showActions();
					break;
				case 2:
					this._statusWindow.showProtection();
					break;
				case 3:
					this._statusWindow.showDescription();
					break;
			}
		}
	};
	
	//item list
	Window_ItemList.prototype.update = function() {
		Window_Selectable.prototype.update.call(this);
		if(this._statusWindow && this.isOpenAndActive()) {
			this._statusWindow.setActionsItem(this.item());
		}
	};

	Window_ItemList.prototype.setStatusWindow = function(statusWindow) {
		if (this._statusWindow !== statusWindow) {
			this._statusWindow = statusWindow;
			this.refresh();
		}
	};
	
	Window_ItemList.prototype.isEnabled = function(item) {
		return false;
	};
	
	//skill type
	Window_SkillType.prototype.update = function() {
		Window_Command.prototype.update.call(this);
		if (this._skillWindow) {
			this._skillWindow.setStypeId(this.currentExt());
		}
		if(this._descriptionWindow && this.isOpenAndActive() && (!this._skillWindow || !this._skillWindow.isOpenAndActive())) {
			switch(this.index()) {
				case 0:
					this._descriptionWindow.setDescription("Special attacks and actions, both innate and derived from equipment. Healing and curative techniques can be used here.");
					break;
				case 1:
					this._descriptionWindow.setDescription("The functions of currently equipped items. Healing and curative items can be used here.");
					break;
				case 2:
					this._descriptionWindow.setDescription("Normal attacks granted by weapons, as well as basic unarmed attacks.");
					break;
				case 3:
					this._descriptionWindow.setDescription("Normal defensive actions.");
					break;
			}
		}
	};

	Window_SkillType.prototype.setDescriptionWindow = function(descriptionWindow) {
		if (this._descriptionWindow !== descriptionWindow) {
			this._descriptionWindow = descriptionWindow;
			this.refresh();
		}
	};
	
	Window_SkillType.prototype.makeCommandList = function() {
		var name = $dataSystem.skillTypes[2];
		this.addCommand(name, 'skill', true, 2);
		var name = $dataSystem.skillTypes[4];
		this.addCommand(name, 'skill', true, 4);
		var name = $dataSystem.skillTypes[1];
		this.addCommand(name, 'skill', true, 1);
		var name = $dataSystem.skillTypes[3];
		this.addCommand(name, 'skill', true, 3);
	};
	
	//skill list
	Window_SkillList.prototype.initialize = function(y, height) {
		Window_Selectable.prototype.initialize.call(this, 0, y, Graphics.boxWidth, height);
		this._actor = null;
		this._stypeId = 0;
		this._data = [];
		this._actionInfos = [];
	};
	
	Window_SkillList.prototype.update = function() {
		Window_Selectable.prototype.update.call(this);
		if(this._actionInfos && this._actionInfos.length > 0 && this.index() >= 0 && this.index() < this._actionInfos.length) {
			if (this._descriptionWindow && this.isOpenAndActive()) {
				this._descriptionWindow.setDescription(this._actionInfos[this.index()].action.description);
			}
			if (this._actionInfoWindow) {
				this._actionInfoWindow.setActionInfo(this._actionInfos[this.index()]);
				this._actionInfoWindow.setActor(this._actor);
			}
		}
	};

	Window_SkillList.prototype.setDescriptionWindow = function(descriptionWindow) {
		if (this._descriptionWindow !== descriptionWindow) {
			this._descriptionWindow = descriptionWindow;
			this.refresh();
		}
	};

	Window_SkillList.prototype.setActionInfoWindow = function(actionInfoWindow) {
		if (this._actionInfoWindow !== actionInfoWindow) {
			this._actionInfoWindow = actionInfoWindow;
			this.refresh();
		}
	};
	
	Window_SkillList.prototype.maxItems = function() {
		return this._actionInfos ? this._actionInfos.length : 1;
	};
	
	Window_SkillList.prototype.makeItemList = function() {
		this._data = [];
		this._actionInfos = [];
		if (this._actor) {
			var actionType = "";
			switch(this._stypeId) {
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
					return;
			}
			
			var equipActionInfos = this._actor.getAllEquipActionInfos();
			var i;
			for(i = 0; i < equipActionInfos.length; i++) {
				if(equipActionInfos[i].action.type === actionType) {
					this._actionInfos.push(equipActionInfos[i]);
				}
			}
			var skills = this._actor.skills();
			for(i = 0; i < skills.length; i++) {
				if(skills[i].tbsStats.action && skills[i].tbsStats.action.type === actionType) {
					var actionInfo = {};
					actionInfo.action = skills[i].tbsStats.action;
					this._actionInfos.push(actionInfo);
				}
			}
		}
		
		if(this.index() >= this._actionInfos.length) {
			this.select(Math.max(0, this._actionInfos.length - 1));
		}
	};
	
	Window_SkillList.prototype.selectLast = function() {
		this.select(0);
	};
	
	Window_SkillList.prototype.drawItem = function(index) {
		var actionInfo = this._actionInfos[index];
		if (actionInfo && actionInfo.action) {
			var action = actionInfo.action;
			var costWidth = this.costWidth();
			var rect = this.itemRect(index);
			rect.width -= this.textPadding();
			
			var iconBoxWidth = Window_Base._iconWidth + 4;
			this.resetTextColor();
			
			var iconIndex = this.iconIndexForAction(action);
			this.changePaintOpacity(this.isEnabled(action));
			this.drawIcon(iconIndex, rect.x + 2, rect.y + 2);
			this.drawText(action.name, rect.x + iconBoxWidth, rect.y, rect.width - costWidth - iconBoxWidth);
			this.changePaintOpacity(1);
		}
	};
	
	Window_SkillList.prototype.actionInfo = function() {
		return this._actionInfos && this.index() >= 0 ? this._actionInfos[this.index()] : null;
	};
	
	Window_SkillList.prototype.isCurrentItemEnabled = function() {
		if(!this._actionInfos[this.index()]) { return false; }
		return this.isEnabled(this._actionInfos[this.index()].action);
	};
	
	Window_SkillList.prototype.isEnabled = function(action) {
		return this.isHealing(action);
	};
	
	//equip command
	Window_EquipCommand.prototype.initialize = function(x, y, width) {
		this._windowWidth = width;
		Window_HorzCommand.prototype.initialize.call(this, x, y);
	};
	
	Window_EquipCommand.prototype.update = function() {
		Window_Selectable.prototype.update.call(this);
		if (this._slotWindow) {
			var slotsType = "none";
			switch(this.index())
			{
				case 0:
					slotsType = "weapons";
					break;
				case 1:
					slotsType = "accessories";
					break;
				case 2:
					slotsType = "items";
					break;
				default:
			}
			this._slotWindow.setSlotsType(slotsType);
		}
	};
	
	Window_EquipCommand.prototype.setSlotWindow = function(slotWindow) {
		if (this._slotWindow !== slotWindow) {
			this._slotWindow = slotWindow;
			this.refresh();
		}
	};
	
	Window_EquipCommand.prototype.makeCommandList = function() {
		this.addCommand("Held",   'equipWeapons');
		this.addCommand("Accessory", 'equipAccessories');
		this.addCommand("Item",    'equipItems');
	};
	
	//equip slot
	Window_EquipSlot.prototype.initialize = function(y) {
		Window_Selectable.prototype.initialize.call(this, 0, y, this.windowWidth(), this.windowHeight());
		this._actor = null;
		this._slotsType = "none";
		this._prevSlotsType = "none";
		this._prevIndex = -1;
		this.refresh();
	};
	
	Window_EquipSlot.prototype.windowWidth = function() {
		return 298;
	};

	Window_EquipSlot.prototype.windowHeight = function() {
		return this.fittingHeight(this.numVisibleRows());
	};

	Window_EquipSlot.prototype.numVisibleRows = function() {
		return 10;
	};

	Window_EquipSlot.prototype.setSlotsType = function(slotsType) {
		if (this._slotsType !== slotsType) {
			this._slotsType = slotsType;
			this.refresh();
		}
	};
	
	Window_EquipSlot.prototype.slotsOffset = function() {
		switch(this._slotsType)
		{
			case "weapons":
				return 0;
				break;
			case "accessories":
				return 2;
				break;
			case "items":
				return 6;
				break;
			default:
				return 0;
		}
	};

	Window_EquipSlot.prototype.update = function() {
		Window_Selectable.prototype.update.call(this);
		if (this._actor && this._itemWindow) {
			var slotType = this._slotsType;
			if(this._slotsType === "weapons")
			{
				if(this.index() == 0)
				{
					slotType = "mainHand";
				}
				else if(this.index() == 1)
				{
					slotType = "offhand";
				}
			}
			this._itemWindow.setSlotId(this.index() + this.slotsOffset());
			this._itemWindow.setSlotType(slotType);
		}
		if (this._actor && this._statusWindow && (!this._itemWindow || !this._itemWindow.isOpenAndActive())) {
			if (this._slotsType != this._prevSlotsType) {
				if(this._slotsType === "weapons") {
					if(this.index() == 0) {
						slotType = this._actor.heldSlotOne();
					}
					else if(this.index() == 1) {
						slotType = this._actor.heldSlotTwo();
					}
					if(slotType === "shields") {
						this._statusWindow.showProtection();
					} else {
						this._statusWindow.showActions();
					}
				} else if(this._slotsType === "accessories") {
					this._statusWindow.showProtection();
				} else if(this._slotsType === "items") {
					this._statusWindow.showDescription();
				} else {
					this._statusWindow.showNone();
				}
			}
			this._statusWindow.setActionsItem(this._actor.equips()[this.index() + this.slotsOffset()]);
		}
		this._prevIndex = this.index();
		this._prevSlotsType = this._slotsType;
	};

	Window_EquipSlot.prototype.maxItems = function() {
		switch(this._slotsType)
		{
			case "weapons":
				return 2;
				break;
			case "accessories":
				return 4;
				break;
			case "items":
				return 4;
				break;
			default:
				return 0;
		}
	};

	Window_EquipSlot.prototype.item = function() {
		return this._actor ? this._actor.equips()[this.index() + this.slotsOffset()] : null;
	};

	Window_EquipSlot.prototype.drawItem = function(index) {
		if (this._actor) {
			var rect = this.itemRectForText(index);
			if(!this._actor.equips()[index + this.slotsOffset()])
			{
				var slotName = this.slotName(index);
				this.resetTextColor();
				this.changePaintOpacity(false);
				this.drawText(slotName, 0, rect.y, 138, this.lineHeight());
				this.changePaintOpacity(true);
			}
			else
			{
				this.drawItemName(this._actor.equips()[index + this.slotsOffset()], 0, rect.y, this.windowWidth() - this.lineHeight());
			}
		}
	};

	Window_EquipSlot.prototype.slotName = function(index) {
		var slots = this._actor.equipSlots();
		return this._actor ? $dataSystem.equipTypes[slots[index + this.slotsOffset()]] : '';
	};

	Window_EquipSlot.prototype.updateHelp = function() {
		Window_Selectable.prototype.updateHelp.call(this);
		this.setHelpWindowItem(this.item());
		if (this._statusWindow) {
			this._statusWindow.setTempActor(null);
		}
	};
	
	Window_EquipSlot.prototype.isEnabled = function(index) {
		var slotNum = index + this.slotsOffset();
		return this._actor && this._actor.isEquipChangeOk(slotNum) && (slotNum !== 1 || !this._actor.equips()[0]
			|| (this._actor.equips()[0].tbsStats.hands && this._actor.equips()[0].tbsStats.hands < 2));
	};
	
	//equip item
	Window_EquipItem.prototype.initialize = function(x, y, width, height) {
		Window_ItemList.prototype.initialize.call(this, x, y, width, height);
		this._actor = null;
		this._slotId = "none";
		this._slotType = "none";
		this._showItems = false;
	};
	
	Window_EquipItem.prototype.update = function() {
		Window_ItemList.prototype.update.call(this);
		if(this._statusWindow && this.isOpenAndActive()) {
			this._statusWindow.setActionsItem(this.item());
		}
	};

	Window_EquipItem.prototype.setSlotType = function(slotType) {
		if (this._slotType !== slotType) {
			this._slotType = slotType;
			this.refresh();
			this.resetScroll();
		}
	};

	Window_EquipItem.prototype.showItems = function(showItems) {
		this._showItems = showItems;
	};

	Window_EquipItem.prototype.showingItems = function() {
		return this._showItems;
	};

	Window_EquipItem.prototype.includes = function(item) {
		if (!this._showItems) {
			return false;
		}
		
		if (item === null) {
			return true;
		}
		if ((this._slotType === "mainHand" && DataManager.isWeapon(item) && item.tbsStats.hands) ||
			(this._slotType === "offhand" && DataManager.isWeapon(item) && item.tbsStats.hands && item.tbsStats.hands === 1) ||
			(this._slotType === "accessories" && DataManager.isArmor(item)) ||
			(this._slotType === "items" && DataManager.isItem(item))) {
			return this._actor.canEquip(item);
		}
		
		return false;
	};

	Window_EquipItem.prototype.updateHelp = function() {
		Window_ItemList.prototype.updateHelp.call(this);
		if (this._actor && this._statusWindow) {
			var actor = JsonEx.makeDeepCopy(this._actor);
			actor.forceChangeEquip(this._slotId, this.item());
			this._statusWindow.setTempActor(actor);
		}
	};
	
	Window_EquipItem.prototype.isEnabled = function(item) {
		if (!item) { return true; }
		if (this._actor) {
			if(this._slotType === "mainHand") {
				if(!this._actor.equips()[1] || (item.tbsStats.hands && item.tbsStats.hands === 1)) {
					return true;
				}
			} else if(this._slotType === "accessories" && item.tbsStats.limitedPart) {
				var limitedParts = [];
				var i;
				for(i = 2; i < 6; i++) {
					var equips = this._actor.equips();
					if(equips[i] && equips[i].tbsStats.limitedPart) {
						limitedParts.push(equips[i].tbsStats.limitedPart);
					}
				}
				for(i = 0; i < limitedParts.length; i++) {
					if(item.tbsStats.limitedPart === limitedParts[i]) {
						return false;
					}
				}
				return true;
			} else {
				return true;
			}
		}
		return false;
	};
	
	//status
	Window_Status.prototype.refresh = function() {
		this.contents.clear();
		if (this._actor) {
			var lineHeight = this.lineHeight();
			this.drawBlock1(lineHeight * 0);
			this.drawHorzLine(lineHeight * 1);
			this.drawBlock2(lineHeight * 2);
			this.drawHorzLine(lineHeight * 6);
			this.drawBlock3(lineHeight * 6);
		}
	};
	
	Window_Status.prototype.drawBlock2 = function(y) {
		this.drawActorFace(this._actor, 12, y);
		this.drawBasicInfo(204, y);
	};

	Window_Status.prototype.drawBlock3 = function(y) {
		this.drawParametersColumnOne(48, y);
		this.drawParametersColumnTwo(432, y);
	};
	
	Window_Status.prototype.drawHorzLine = function(y) {
		var lineY = y + this.lineHeight() / 2 - 1;
		this.contents.paintOpacity = 48;
		this.contents.fillRect(0, lineY, this.contentsWidth(), 2, this.lineColor());
		this.contents.paintOpacity = 255;
	};
	
	Window_Status.prototype.lineColor = function() {
		return this.normalColor();
	};
	
	Window_Status.prototype.drawBasicInfo = function(x, y) {
		var lineHeight = this.lineHeight();
		this.drawActorIcons(this._actor, x, y + lineHeight * 1);
	};
	
	Window_Status.prototype.drawParametersColumnOne = function(x, y) {
		var y2 = y + this.lineHeight();
		this.resetTextColor();
		this.drawText("Accuracy Skills", x, y2, 250);
		y2 += this.lineHeight();
		this.drawSkillLevel("Melee", "meleeAcc", x, y2);
		y2 += this.lineHeight();
		this.drawSkillLevel("Ranged", "rangedAcc", x, y2);
		y2 += this.lineHeight();
		this.drawSkillLevel("Mental", "mentalAcc", x, y2);
		y2 += this.lineHeight();
		y2 += this.lineHeight();
		this.resetTextColor();
		this.drawText("Evasive Skills", x, y2, 250);
		y2 += this.lineHeight();
		this.drawSkillLevel("Physical", "physEvade", x, y2);
		y2 += this.lineHeight();
		this.drawSkillLevel("Balance", "tripEvade", x, y2);
		y2 += this.lineHeight();
		this.drawSkillLevel("Mental", "mentalEvade", x, y2);
	};
	
	Window_Status.prototype.drawParametersColumnTwo = function(x, y) {
		var y2 = y + this.lineHeight();
		this.resetTextColor();
		this.drawText("Class Skills", x, y2, 250);
		y2 += this.lineHeight();
		var uniqueSkills = this._actor.uniqueSkills();
		var i;
		for(i = 0; i < uniqueSkills.length; i++)
		{
			this.drawSkillLevel(this.getDisplayNameForUniqueSkill(uniqueSkills[i]), uniqueSkills[i], x, y2);
			y2 += this.lineHeight();
		}
	};
	
	Window_Status.prototype.drawSkillLevel = function(displayName, skill, x, y) {
		this.changeTextColor(this.systemColor());
		this.drawText(displayName, x, y, 250);
		this.resetTextColor();
		this.drawText(this._actor.totalSkill(skill), x + 200, y, 60, 'right');
	};
	
	//BattleLog
	Window_BattleLog.prototype.performActionStart = function(subject, action) {
		//subject.performActionStart(action);
	};

	Window_BattleLog.prototype.performAction = function(subject, action) {
		subject.performAction(action);
	};

	Window_BattleLog.prototype.performActionEnd = function(subject) {
		//subject.performActionEnd();
	};
	
	Window_BattleLog.prototype.showInitialAnimations = function(centerTarget, hits) {
		if(!hits) { return; }
		var that = this;
		hits.forEach(function(hit) {
			if(hit.initialAnimationId !== undefined && hit.initialAnimationId > 0) {
				var animation = $dataAnimations[hit.initialAnimationId];
				if (animation) {
					centerTarget.startAnimation(hit.initialAnimationId, false, that.animationBaseDelay());
				}
			}
		});
	};
	
	Window_BattleLog.prototype.showAnimation = function(subject, targets, animationId) {
		//if (animationId < 0) {
		//	this.showAttackAnimation(subject, targets);
		//} else {
			this.showNormalAnimation(targets, animationId);
		//}
	};

	Window_BattleLog.prototype.showAttackAnimation = function(subject, targets) {
		if (subject.isActor()) {
			this.showActorAttackAnimation(subject, targets);
		} else {
			this.showEnemyAttackAnimation(subject, targets);
		}
	};

	Window_BattleLog.prototype.showActorAttackAnimation = function(subject, targets) {
		this.showNormalAnimation(targets, subject.attackAnimationId1(), false);
		this.showNormalAnimation(targets, subject.attackAnimationId2(), true);
	};

	Window_BattleLog.prototype.showEnemyAttackAnimation = function(subject, targets) {
		SoundManager.playEnemyAttack();
	};

	Window_BattleLog.prototype.showNormalAnimation = function(targets, animationId, mirror) {
		var animation = $dataAnimations[animationId];
		if (animation) {
			var delay = this.animationBaseDelay();
			var nextDelay = this.animationNextDelay();
			targets.forEach(function(target) {
				target.battler.startAnimation(animationId, mirror, delay);
				delay += nextDelay;
			});
		}
	};
	
	Window_BattleLog.prototype.startAction = function(subject, action, targets) {
		//var item = action.item();
		this.push('performActionStart', subject, action);
		this.push('waitForMovement');
		this.push('performAction', subject, action);
		this.push('showInitialAnimations', targets.clone()[0].battler, action.hits);
		this.displayAction(subject, action);
	};

	Window_BattleLog.prototype.endAction = function(subject) {
		this.push('waitForNewLine');
		this.push('clear');
		this.push('performActionEnd', subject);
	};
	
	Window_BattleLog.prototype.displayAction = function(subject, action) {
		var numMethods = this._methods.length;
		//if (DataManager.isSkill(item)) {
		//	if (item.message1) {
		//		this.push('addText', subject.name() + item.message1.format(item.name));
		//	}
		//	if (item.message2) {
		//		this.push('addText', item.message2.format(item.name));
		//	}
		//} else {
		//	this.push('addText', TextManager.useItem.format(subject.name(), item.name));
		//}
		if(action.type === "attack") {
			this.push('addText', subject.name() + ' attacks with ' + action.name + '!');
		} else if (action.type === "technique") {
			this.push('addText', subject.name() + ' executes ' + action.name + '!');
		} else if (action.type === "item") {
			this.push('addText', subject.name() + ' uses ' + action.name + '!');
		}
		if (this._methods.length === numMethods) {
			this.push('wait');
		}
	};
	
	Window_BattleLog.prototype.performDeflection = function(target) {
		target.performDeflection();
	};
	
	Window_BattleLog.prototype.performStress = function(target) {
		target.performStress();
	};
	
	Window_BattleLog.prototype.displayActionResults = function(subject, target, results) {
		if(target.blankDummy()) { return; }
		this.push('pushBaseLine');
		//this.displayCritical(target);
		//this.push('popupDamage', target);
		//this.push('popupDamage', subject);
		this.displayResultsValues(target, results);
		this.displayAffectedStatus(target, results);
		//this.displayFailure(target);
		this.push('waitForNewLine');
		this.push('popBaseLine');
	};
	
	Window_BattleLog.prototype.displayResultsValues = function(target, results) {
		if(results.animationIds.length > 0) {
			results.animationIds.forEach(function (animationId) {
				if(animationId !== undefined && animationId > 0) {
					var animation = $dataAnimations[animationId];
					if (animation) {
						target.startAnimation(animationId, false, 0);
					}
				}
			});
		}
		if(results.ongoingAnimationIds.length > 0) {
			results.ongoingAnimationIds.forEach(function (animationId) {
				if(animationId !== undefined && animationId > 0) {
					var animation = $dataAnimations[animationId];
					if (animation) {
						target.startOngoingAnimation(animationId, false, 0);
					}
				}
			});
		}
		if (results.dodged) {
			this.displayDodge(target);
		} else {
			if(results.damage.head > results.heal.head || results.damage.mind > results.heal.mind ||
				results.damage.torso > results.heal.torso || results.damage.leftArm > results.heal.leftArm ||
				results.damage.rightArm > results.heal.rightArm || results.damage.leftLeg > results.heal.leftLeg ||
				results.damage.rightLeg > results.heal.rightLeg) {
				this.push('performDamage', target);
			} else if(results.damage.head < results.heal.head || results.damage.mind < results.heal.mind ||
				results.damage.torso < results.heal.torso || results.damage.leftArm < results.heal.leftArm ||
				results.damage.rightArm < results.heal.rightArm || results.damage.leftLeg < results.heal.leftLeg ||
				results.damage.rightLeg < results.heal.rightLeg ||
				(results.stress.other + results.stress.mind + results.stress.head + results.stress.torso +
				results.stress.leftArm + results.stress.rightArm + results.stress.leftLeg +
				results.stress.rightLeg) < results.heal.stress) {
				this.push('performRecovery', target);
			} else if((results.stress.other + results.stress.mind + results.stress.head + results.stress.torso +
				results.stress.leftArm + results.stress.rightArm + results.stress.leftLeg +
				results.stress.rightLeg) > results.heal.stress) {
				this.push('performStress', target);
			} else {
				this.push('performDeflection', target);
			}
			this.displayPartsDamage(target, results);
			this.displayStress(target, results);
		}
		this.push('wait');
	};

	Window_BattleLog.prototype.displayDodge = function(target) {
		var fmt;
		fmt = TextManager.evasion;
		this.push('performEvasion', target);
		this.push('addText', fmt.format(target.name()));
	};

	Window_BattleLog.prototype.displayPartsDamage = function(target, results) {
		var hitCount = results.hit.mind ? 1 : 0;
		hitCount += results.hit.head ? 1 : 0;
		hitCount += results.hit.torso ? 1 : 0;
		hitCount += results.hit.rightArm ? 1 : 0;
		hitCount += results.hit.leftArm ? 1 : 0;
		hitCount += results.hit.rightLeg ? 1 : 0;
		hitCount += results.hit.leftLeg ? 1 : 0;
		var lines = 0;
		if(hitCount > 1) {
			var totalDamage = results.damage["mind"]
				+ results.damage["head"]
				+ results.damage["torso"]
				+ results.damage["rightArm"]
				+ results.damage["leftArm"]
				+ results.damage["rightLeg"]
				+ results.damage["leftLeg"];
			var totalHeal = results.heal["mind"]
				+ results.heal["head"]
				+ results.heal["torso"]
				+ results.heal["rightArm"]
				+ results.heal["leftArm"]
				+ results.heal["rightLeg"]
				+ results.heal["leftLeg"];
			if(totalDamage > 0 || totalHeal > 0) {
				if(totalDamage > 0) {
					this.push('addText', target.name() + " takes a total of " + totalDamage + " damage!", false);
					lines++;
				}
				if(totalHeal > 0) {
					this.push('addText', target.name() + " is healed by a total of " + totalHeal + "!", false);
					lines++;
				}
			} else {
				var totalStress = results.stress.other
					+ results.stress.mind
					+ results.stress.head
					+ results.stress.torso
					+ results.stress.leftArm
					+ results.stress.rightArm
					+ results.stress.leftLeg
					+ results.stress.rightLeg;
				if(totalStress > 0) {
					this.push('addText', target.name() + " is struck in multiple places!", false);
					lines++;
				} else {
					this.push('addText', target.name() + " fully deflects the blow!", false);
					lines++;
				}
			}
		} else {
			lines += this.displayPartDamage(target, results, "mind");
			lines += this.displayPartDamage(target, results, "head");
			lines += this.displayPartDamage(target, results, "torso");
			lines += this.displayPartDamage(target, results, "rightArm");
			lines += this.displayPartDamage(target, results, "leftArm");
			lines += this.displayPartDamage(target, results, "rightLeg");
			lines += this.displayPartDamage(target, results, "leftLeg");
		}
		return lines;
	};

	Window_BattleLog.prototype.displayPartDamage = function(target, results, partName) {
		var partDisplayText = partName;
		switch(partName) {
			case "leftArm": partDisplayText = "left arm"; break;
			case "rightArm": partDisplayText = "right arm"; break;
			case "leftLeg": partDisplayText = "left leg"; break;
			case "rightLeg": partDisplayText = "right leg"; break;
		}
		if(results.damage[partName] !== results.heal[partName]) {
			var text = "";
			var diff = Math.abs(results.damage[partName] - results.heal[partName]);
			if (results.damage[partName] > results.heal[partName]) {
				text = target.name() + "'s " + partDisplayText + " takes " + diff + " damage!";
			} else if (results.damage[partName] < results.heal[partName]) {
				text = target.name() + "'s " + partDisplayText + " is healed by " + diff + "!";
			}
			this.push('addText', text, false);
			return 1;
		} else if(results.hit[partName]) {
			if(results.stress[partName] > 0) {
				this.push('addText', target.name() + "'s " + partDisplayText + " is struck!", false);
				return 1;
			} else {
				this.push('addText', target.name() + "'s " + partDisplayText + " deflects the blow!", false);
				return 1;
			}
		}
		return 0;
	};

	Window_BattleLog.prototype.displayStress = function(target, results) {
		var totalStress = results.stress.other + results.stress.mind + results.stress.head + results.stress.torso
			+ results.stress.leftArm + results.stress.rightArm + results.stress.leftLeg + results.stress.rightLeg;
		if(totalStress !== results.heal.stress) {
			var text = "";
			var diff = Math.abs(totalStress - results.heal.stress);
			if (totalStress > results.heal.stress) {
				text = target.name() + " is inflicted with " + diff + " stress!";
			} else if (totalStress < results.heal.stress) {
				text = target.name() + " has " + diff + " stress removed!";
			}
			this.push('addText', text, false);
			return 1;
		}
		return 0;
	};
	
	Window_BattleLog.prototype.displayAffectedStatus = function(target, results) {
		if (target.result().isStatusAffected() || results.downed || results.revived) {
			this.push('pushBaseLine');
			this.displayChangedStates(target, results);
			//this.displayChangedBuffs(target);
			this.push('waitForNewLine');
			this.push('popBaseLine');
		}
	};

	Window_BattleLog.prototype.displayAutoAffectedStatus = function(target) {
		if (target.result().isStatusAffected()) {
			this.displayAffectedStatus(target, null);
			this.push('clear');
		}
	};

	Window_BattleLog.prototype.displayChangedStates = function(target, results) {
		this.displayAddedStates(target, results);
		this.displayRemovedStates(target, results);
	};

	Window_BattleLog.prototype.displayAddedStates = function(target, results) {
		// target.result().addedStateObjects().forEach(function(state) {
			// var stateMsg = target.isActor() ? state.message1 : state.message2;
			// if (state.id === target.deathStateId()) {
				// this.push('performCollapse', target);
			// }
			// if (stateMsg) {
				// this.push('popBaseLine');
				// this.push('pushBaseLine');
				// this.push('addText', target.name() + stateMsg);
				// this.push('waitForEffect');
			// }
		// }, this);
		if(results.downed) {
			this.push('performCollapse', target);
			this.push('popBaseLine');
			this.push('pushBaseLine');
			this.push('addText', target.name() + " is taken down!");
			this.push('waitForEffect');
		}
	};

	Window_BattleLog.prototype.displayRemovedStates = function(target, results) {
		// target.result().removedStateObjects().forEach(function(state) {
			// if (state.message4) {
				// this.push('popBaseLine');
				// this.push('pushBaseLine');
				// this.push('addText', target.name() + state.message4);
			// }
		// }, this);
		if(results.revived) {
			this.push('popBaseLine');
			this.push('pushBaseLine');
			this.push('addText', target.name() + " can function again!");
		}
	};

	Window_BattleLog.prototype.displayChangedBuffs = function(target) {
		var result = target.result();
		this.displayBuffs(target, result.addedBuffs, TextManager.buffAdd);
		this.displayBuffs(target, result.addedDebuffs, TextManager.debuffAdd);
		this.displayBuffs(target, result.removedBuffs, TextManager.buffRemove);
	};

	Window_BattleLog.prototype.displayBuffs = function(target, buffs, fmt) {
		buffs.forEach(function(paramId) {
			this.push('popBaseLine');
			this.push('pushBaseLine');
			this.push('addText', fmt.format(target.name(), TextManager.param(paramId)));
		}, this);
	};
	
	Window_BattleLog.prototype.addText = function(text, wait) {
		if(wait === undefined) { wait = true; }
		this._lines.push(text);
		this.refresh();
		if(wait) {
			this.wait();
		}
	};
}) ();
 