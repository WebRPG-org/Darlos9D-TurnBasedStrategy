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
// Window_ConcurrentWindow
//
// The window for displaying text in customizable locations and sizes

function Window_ConcurrentWindow() {
    this.initialize.apply(this, arguments);
}

Window_ConcurrentWindow.prototype = Object.create(Window_Base.prototype);
Window_ConcurrentWindow.prototype.constructor = Window_ConcurrentWindow;

Window_ConcurrentWindow.prototype.initialize = function() {
	this._text = [];
    Window_Base.prototype.initialize.call(this, 0, 0, this.windowWidth(), this.windowHeight());
	this._curTextLength = 0;
	this._textLength = 0;
	this._type = "";
	this._absolute = false;
	this._stayOnScreen = false;
	this._absoluteX = 0;
	this._absoluteY = 0;
	this._waitOn = false;
	this._duration = -1;
	this._closeable = false;
	this._textLengthIncrease = 2;
	this._soundTime = 3;
	this._soundTimer = 0;
	this.hide();
};

Window_ConcurrentWindow.prototype.windowWidth = function() {
	var textLength = 0;
	this._text.forEach(function (textRow) {
		var textRowLength = this.getTextRowLength(textRow);
		textLength = textRowLength > textLength ? textRowLength : textLength;
	}, this);
	return textLength*14 + this.standardPadding()*2 + this.textPadding()*2;
};

Window_ConcurrentWindow.prototype.windowHeight = function() {
	return this.fittingHeight(this._text.length);
};

Window_ConcurrentWindow.prototype.setupAndShow = function(
	type,
	absolute,
	stayOnScreen,
	x,
	y,
	text,
	soundEffect,
	waitOn,
	duration,
	closeable
) {
	if(!text || text.length <= 0) { return; }
	this._text = text;
	
	this._textLength = 0;
	this._soundTimer = 0;
	text.forEach(function (textRow) {
		this._textLength += this.getTextRowLength(textRow);
	}, this);
	
	this._curTextLength = type !== "message" ? this._textLength : 0;
	
	this._type = type;
	this._soundEffect = soundEffect;
	this._waitOn = waitOn;
	this._duration = duration === undefined ? -1 : duration;
	this._closeable = closeable;
	this._absolute = absolute;
	this._stayOnScreen = stayOnScreen;
	
	this.x = type === "infoLog" ? Math.floor(x) : Math.floor(x - this.windowWidth() / 2);
	this.y = type === "infoLog" ? Math.floor(y) : Math.floor(y - this.windowHeight() / 2);
	if(absolute) {
		this._absoluteX = this.x;
		this._absoluteY = this.y;
		this.absoluteReposition();
	}
	this.move(this.x, this.y, this.windowWidth(), this.windowHeight());
	
	this.createContents();
	this.drawCurrentText();
	
	this.windowskin = type === "suffix" ? ImageManager.loadSystem('BlankWindow') : ImageManager.loadSystem('Window');
	if(type === "suffix") {
		this.hide();
	} else {
		this.show();
	}
	this.open();
};

Window_ConcurrentWindow.prototype.reposition = function(x, y) {
	if(this._type !== "suffix") { return; }
	this.x = x;
	this.y = y;
	this._absoluteX = this.x;
	this._absoluteY = this.y;
	this.absoluteReposition();
};

Window_ConcurrentWindow.prototype.drawCurrentText = function() {
	if (!this.contents) { return; }
	this.contents.clear();
	this.resetTextColor();
	this.changePaintOpacity(true);
	var charactersDrawn = 0;
	var i;
	for(i = 0; i < this._text.length; i++) {
		var limitReached = false;
		var textRowSegments = this.getTextRowSegments(this._text[i]);
		var segmentPosition = 0;
		for(j = 0; j < textRowSegments.length; j++) {
			var textRowSegment = textRowSegments[j];
			if(textRowSegment.type === "string") {
				var segmentText = textRowSegment.value;
				if(charactersDrawn + segmentPosition + segmentText.length > this._curTextLength) {
					segmentText = segmentText.slice(0, this._curTextLength - (charactersDrawn + segmentPosition));
					limitReached = true;
				}
				this.drawText(segmentText, this.textPadding()+segmentPosition*14, this.lineHeight()*i, segmentText.length*14);
				segmentPosition += segmentText.length;
				if(limitReached) { break; }
			} else if(textRowSegment.type === "icon") {
				if(charactersDrawn + segmentPosition + 3 > this._curTextLength) {
					limitReached = true;
					break;
				}
				this.drawIcon(
					textRowSegment.value,
					this.textPadding() + segmentPosition * 14 + Math.floor((14 * 3 - Window_Base._iconWidth) / 2),
					this.lineHeight()*i
				);
				segmentPosition += 3;
			}
		}
		if(limitReached) { break; }
		charactersDrawn += segmentPosition;
	}
};

Window_ConcurrentWindow.prototype.getTextRowLength = function(textRow) {
	var rowLength = 0;
	for(let i = 0; i < textRow.length; i++) {
		rowLength++;
		if(
			textRow[i] === "\\" &&
			i+1 < textRow.length &&
			textRow[i+1] === "I" &&
			i+2 < textRow.length &&
			textRow[i+2] >= '0' &&textRow[i+2] <= '9'
		) {
			rowLength += 2;
			i = i+2;
			var endOfControlFound = false;
			for(let j = i+1; j < textRow.length; j++) {
				if(textRow[j] >= '0' &&textRow[j] <= '9') {
					continue;
				}
				i = j-1;
				endOfControlFound = true;
				break;
			}
			if(!endOfControlFound) {
				break;
			}
		}
	}
	return rowLength;
};

Window_ConcurrentWindow.prototype.getTextRowSegments = function(textRow) {
	var textRowSegments = [];
	var stringSegment = "";
	for(let i = 0; i < textRow.length; i++) {
		if(
			textRow[i] === "\\" &&
			i+1 < textRow.length &&
			textRow[i+1] === "I" &&
			i+2 < textRow.length &&
			textRow[i+2] >= '0' &&textRow[i+2] <= '9'
		) {
			if(stringSegment.length > 0) {
				var stringSegmentObject = {};
				stringSegmentObject.type = "string";
				stringSegmentObject.value = stringSegment;
				textRowSegments.push(stringSegmentObject);
				stringSegment = "";
			}
			var iconSegment = textRow[i+2]+"";
			i = i+2;
			var endOfControlFound = false;
			for(let j = i+1; j < textRow.length; j++) {
				if(textRow[j] >= '0' &&textRow[j] <= '9') {
					iconSegment += textRow[j];
					continue;
				}
				var iconSegmentObject = {};
				iconSegmentObject.type = "icon";
				iconSegmentObject.value = parseInt(iconSegment);
				textRowSegments.push(iconSegmentObject); 
				i = j-1;
				endOfControlFound = true;
				break;
			}
			if(!endOfControlFound) {
				var iconSegmentObject = {};
				iconSegmentObject.type = "icon";
				iconSegmentObject.value = parseInt(iconSegment);
				textRowSegments.push(iconSegmentObject); 
				break;
			}
		} else {
			stringSegment += textRow[i];
		}
	}
	if(stringSegment.length > 0) {
		var stringSegmentObject = {};
		stringSegmentObject.type = "string";
		stringSegmentObject.value = stringSegment;
		textRowSegments.push(stringSegmentObject);
	}
	return textRowSegments;
};

Window_ConcurrentWindow.prototype.absoluteReposition = function() {
	if(!this._absolute) { return; }
	this.x = $gameMap.mapToCanvasX(this._absoluteX);
	this.y = $gameMap.mapToCanvasY(this._absoluteY);
	if(this._type === "suffix") {
		this.x -= 23;
		this.y -= 30;
	}
	if(this._stayOnScreen) {
		this.x = Math.max(0, Math.min(Graphics.boxWidth-this.windowWidth(), this.x));
		this.y = Math.max(0, Math.min(Graphics.boxHeight-this.windowHeight(), this.y));
	}
};

Window_ConcurrentWindow.prototype.update = function() {
    Window_Base.prototype.update.call(this);
	this.absoluteReposition();
	if(this._type === "suffix") { return; }
	if(this._waitOn && this.isOpen() && this.isCloseable() && this.isTriggered()) {
		this.close();
	}
	if(this.isOpen() && !this.isClosing()) {
		if(this._curTextLength < this._textLength) {
			this._curTextLength += this._textLengthIncrease;
			this.drawCurrentText();
			if(this._soundEffect) {
				this._soundTimer--;
				if(this._soundTimer <= 0) {
					var soundEffect = {};
					soundEffect.name = this._soundEffect.name;
					soundEffect.pan = this._soundEffect.pan;
					soundEffect.volume = this._soundEffect.volume;
					soundEffect.pitch = this._soundEffect.pitch === undefined ?
						100 : Math.max(25, Math.min(400, this._soundEffect.pitch)) - 1 + Math.floor(Math.random() * 3);
					AudioManager.playSe(soundEffect);
					this._soundTimer = this._soundTime;
				}
			}
		}
	}
};

Window_ConcurrentWindow.prototype.isTriggered = function() {
    return (Input.isRepeated('ok') || Input.isRepeated('cancel') ||
            TouchInput.isRepeated());
};

Window_ConcurrentWindow.prototype.hasDrawnAllText = function() {
	return this._curTextLength >= this._textLength;
};

Window_ConcurrentWindow.prototype.isCountingDown = function() {
	return this._duration >= 0;
};

Window_ConcurrentWindow.prototype.countDown = function() {
	if(this._type === "suffix" || !this.hasDrawnAllText() || this._duration < 0) { return; }
	this._duration--;
	if(this._duration <= 0) {
		this._duration = -1;
		this.close();
	}
};

Window_ConcurrentWindow.prototype.isCloseable = function() {
	return this.hasDrawnAllText() && (!this.isCountingDown() || this._closeable);
};

Window_ConcurrentWindow.prototype.isWaitOn = function() {
	return this._waitOn;
};

Window_ConcurrentWindow.prototype.isInfoLog = function() {
	return this._type === "infoLog";
};

Window_ConcurrentWindow.prototype.isSuffix = function() {
	return this._type === "suffix";
};

Window_ConcurrentWindow.prototype.updateClose = function() {
    if (this._closing) {
        this.openness -= this.openCloseSpeed();
        if (this.isClosed()) {
			this._waitOn = false;
            this._closing = false;
        }
    }
};

Window_ConcurrentWindow.prototype.hide = function() {
    this.visible = false;
	if(this._type !== "suffix") {
		this.close();
	}
};

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
		this.drawText("Pw", this.nameOffset() + Window_Base._iconWidth, 0);
		this.drawText("Rn", this.nameOffset() + Window_Base._iconWidth*2 + 14*3, 0);
		this.drawText("AE", this.nameOffset() + Window_Base._iconWidth*2 + 14*6, 0);
		this.drawText("Ac", this.nameOffset() + Window_Base._iconWidth*2 + 14*9, 0);
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
		this.drawText("Skill Required", this.nameOffset(), 0);
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
	var leftHeldProt = this.getCompleteProtection({});
	var rightHeldProt = this.getCompleteProtection({});
	var headProt = this.getCompleteProtection({});
	var torsoProt = this.getCompleteProtection({});
	var leftArmProt = this.getCompleteProtection({});
	var rightArmProt = this.getCompleteProtection({});
	var leftLegProt = this.getCompleteProtection({});
	var rightLegProt = this.getCompleteProtection({});
	var mentalProt = this.getCompleteTypeProtection({});
	var leftHeldProtTemp = leftHeldProt;
	var rightHeldProtTemp = rightHeldProt;
	var headProtTemp = headProt;
	var torsoProtTemp = torsoProt;
	var leftArmProtTemp = leftArmProt;
	var rightArmProtTemp = rightArmProt;
	var leftLegProtTemp = leftLegProt;
	var rightLegProtTemp = rightLegProt;
	var mentalProtTemp = mentalProt;
	
	if (this._actor) {
		leftHeldProt = this._actor.protection("leftHeld");
		rightHeldProt = this._actor.protection("rightHeld");
		headProt = this._actor.protection("head");
		torsoProt = this._actor.protection("torso");
		leftArmProt = this._actor.protection("leftArm");
		rightArmProt = this._actor.protection("rightArm");
		leftLegProt = this._actor.protection("leftLeg");
		rightLegProt = this._actor.protection("rightLeg");
		mentalProt = this._actor.mentalProtection();
		
		if(this._tempActor) {
			leftHeldProtTemp = this._tempActor.protection("leftHeld");
			rightHeldProtTemp = this._tempActor.protection("rightHeld");
			headProtTemp = this._tempActor.protection("head");
			torsoProtTemp = this._tempActor.protection("torso");
			leftArmProtTemp = this._tempActor.protection("leftArm");
			rightArmProtTemp = this._tempActor.protection("rightArm");
			leftLegProtTemp = this._tempActor.protection("leftLeg");
			rightLegProtTemp = this._tempActor.protection("rightLeg");
			mentalProtTemp = this._tempActor.mentalProtection();
		} else {
			leftHeldProtTemp = leftHeldProt;
			rightHeldProtTemp = rightHeldProt;
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
		leftHeldProt = this.getCompleteProtection({});
		rightHeldProt = this.getCompleteProtection(protection.equippedArm);
		headProt = this.getCompleteProtection(protection.head);
		torsoProt = this.getCompleteProtection(protection.torso);
		leftArmProt = this.getCompleteProtection(protection.arms);
		rightArmProt = this.getCompleteProtection(protection.arms);
		leftLegProt = this.getCompleteProtection(protection.legs);
		rightLegProt = this.getCompleteProtection(protection.legs);
		mentalProt = this.getCompleteMentalProtection(protection.mental);
		
		leftHeldProtTemp = leftHeldProt;
		rightHeldProtTemp = rightHeldProt;
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
	var armorSeparation = this.armorSeparation();
	
	this.drawIcon(this.getIconIdFor("solidDefense"), 	typesX, 									0);
	this.drawIcon(this.getIconIdFor("fluidDefense"), 	typesX + typesWidth, 						0);
	this.drawIcon(this.getIconIdFor("blunt"),			typesX + typesWidth * 2 + armorSeparation, 	0);
	this.drawIcon(this.getIconIdFor("cut"), 			typesX + typesWidth * 3 + armorSeparation, 	0);
	this.drawIcon(this.getIconIdFor("bullet"), 			typesX + typesWidth * 4 + armorSeparation, 	0);
	this.drawIcon(this.getIconIdFor("fire"), 			typesX + typesWidth * 5 + armorSeparation, 	0);
	this.drawIcon(this.getIconIdFor("ice"), 			typesX + typesWidth * 6 + armorSeparation, 	0);
	this.drawIcon(this.getIconIdFor("corrosion"), 		typesX + typesWidth * 7 + armorSeparation, 	0);
	this.drawIcon(this.getIconIdFor("conducted"), 		typesX + typesWidth * 8 + armorSeparation, 	0);
	
	this.drawPhysProtection("R Wpn", rightHeldProtTemp, rightHeldProt, typesRightAlignX, typesWidth, this.lineHeight());
	this.drawPhysProtection("L Wpn", leftHeldProtTemp, leftHeldProt, typesRightAlignX, typesWidth, this.lineHeight() * 2);
	this.drawPhysProtection("Head", headProtTemp, headProt, typesRightAlignX, typesWidth, this.lineHeight() * 3);
	this.drawPhysProtection("Torso", torsoProtTemp, torsoProt, typesRightAlignX, typesWidth, this.lineHeight() * 4);
	this.drawPhysProtection("R Arm", rightArmProtTemp, rightArmProt, typesRightAlignX, typesWidth, this.lineHeight() * 5);
	this.drawPhysProtection("L Arm", leftArmProtTemp, leftArmProt, typesRightAlignX, typesWidth, this.lineHeight() * 6);
	this.drawPhysProtection("R Leg", rightLegProtTemp, rightLegProt, typesRightAlignX, typesWidth, this.lineHeight() * 7);
	this.drawPhysProtection("L Leg", leftLegProtTemp, leftLegProt, typesRightAlignX, typesWidth, this.lineHeight() * 8);
	
	//this.drawIcon(this.getIconIdFor("mentalDefense"), typesX, this.lineHeight() * 8);
	//this.drawIcon(this.getIconIdFor("psychic"), typesX + typesWidth * 2, this.lineHeight() * 8);
	//this.changeTextColor(this.systemColor());
	//this.drawText("Mind", 0, this.lineHeight() * 9);
	//this.setTextColorForComparison(mentalProtTemp.defense, mentalProt.defense);
	//this.drawText(mentalProtTemp.defense > 0 ? mentalProtTemp.defense : "-", typesRightAlignX, this.lineHeight() * 9, 100, 'right');
	//this.setTextColorForComparison(mentalProtTemp.armor, mentalProt.armor);
	//this.drawText(mentalProtTemp.armor > 0 ? mentalProtTemp.armor : "-", typesRightAlignX + typesWidth * 2, this.lineHeight() * 9, 100, 'right');
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
	var armorSeparation = this.armorSeparation();
	
	this.setTextColorForComparison(protection.defense.solid, oldProtection.defense.solid);
	this.drawText(protection.defense.solid > 0 ? protection.defense.solid : "-", typeX, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.defense.fluid, oldProtection.defense.fluid);
	this.drawText(protection.defense.fluid > 0 ? protection.defense.fluid : "-", typeX + typeWidth, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.blunt, oldProtection.armor.blunt);
	this.drawText(protection.armor.blunt > 0 ? protection.armor.blunt : "-", typeX + typeWidth * 2 + armorSeparation, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.cut, oldProtection.armor.cut);
	this.drawText(protection.armor.cut > 0 ? protection.armor.cut : "-", typeX + typeWidth * 3 + armorSeparation, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.bullet, oldProtection.armor.bullet);
	this.drawText(protection.armor.bullet > 0 ? protection.armor.bullet : "-", typeX + typeWidth * 4 + armorSeparation, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.fire, oldProtection.armor.fire);
	this.drawText(protection.armor.fire > 0 ? protection.armor.fire : "-", typeX + typeWidth * 5 + armorSeparation, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.ice, oldProtection.armor.ice);
	this.drawText(protection.armor.ice > 0 ? protection.armor.ice : "-", typeX + typeWidth * 6 + armorSeparation, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.corrosion, oldProtection.armor.corrosion);
	this.drawText(protection.armor.corrosion > 0 ? protection.armor.corrosion : "-", typeX + typeWidth * 7 + armorSeparation, lineHeight, 100, 'right');
	
	this.setTextColorForComparison(protection.armor.conducted, oldProtection.armor.conducted);
	this.drawText(protection.armor.conducted > 0 ? protection.armor.conducted : "-", typeX + typeWidth * 8 + armorSeparation, lineHeight, 100, 'right');
	
	this.resetTextColor();
};

Window_ItemStatusBase.prototype.armorSeparation = function() {
	return 44;
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
	var tabsX = 398;
	
	if(this._statusPage !== "actions") {
		this.changePaintOpacity(false);
	}
	this.drawIcon(this.getIconIdFor("action"), tabsX, this.lineHeight() * 9);
	this.changePaintOpacity(true);
	
	if(this._statusPage !== "skillRequirements") {
		this.changePaintOpacity(false);
	}
	this.drawIcon(this.getIconIdFor("skill"), tabsX + Window_Base._iconWidth, this.lineHeight() * 9);
	this.changePaintOpacity(true);
	
	if(this._statusPage !== "protection") {
		this.changePaintOpacity(false);
	}
	this.drawIcon(this.getIconIdFor("solidDefense"), tabsX + Window_Base._iconWidth * 2, this.lineHeight() * 9);
	this.changePaintOpacity(true);
	
	if(this._statusPage !== "description") {
		this.changePaintOpacity(false);
	}
	this.drawIcon(this.getIconIdFor("knowledge"), tabsX + Window_Base._iconWidth * 3, this.lineHeight() * 9);
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
    return Graphics.boxWidth - Window_SkillActionInfo.prototype.windowWidth();;
};

Window_ItemStatus.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_ItemStatus.prototype.numVisibleRows = function() {
    return 10;
};

//-----------------------------------------------------------------------------
// Window_ActorItemName
//
// The window for displaying an actor's name in the inventory menu

function Window_ActorItemName() {
    this.initialize.apply(this, arguments);
}

Window_ActorItemName.prototype = Object.create(Window_Base.prototype);
Window_ActorItemName.prototype.constructor = Window_ActorItemName;

Window_ActorItemName.prototype.initialize = function(x, y) {
    Window_Base.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
    this.refresh();
    this.activate();
	this._actor = undefined;
};

Window_ActorItemName.prototype.windowWidth = function() {
	if(this._tbsActor) {
		return this.standardPadding() * 2 + this._tbsActor.battler.displayName().length * 14 + this.textPadding() * 2;
	} else {
		return 300;
	}
};

Window_ActorItemName.prototype.windowHeight = function() {
	return this.fittingHeight(1);
};

Window_ActorItemName.prototype.setActor = function(actor) {
	if(this._actor !== actor) {
		this._actor = actor;
		this.refreshWindowContents();
	}
};

Window_ActorItemName.prototype.refreshWindowContents = function() {
	this.move(this.x, this.y, this.windowWidth(), this.windowHeight());
	this.createContents();
	this.refresh();
};

Window_ActorItemName.prototype.refresh = function() {
    if (this.contents) {
        this.contents.clear();
		if(this._actor) {
			this.drawTargetNameText();
		}
    }
};

Window_ActorItemName.prototype.drawTargetNameText = function() {
	if(this._actor) {
		this.resetTextColor();
		this.changePaintOpacity(true);
		this.drawText(this._actor.displayName(), this.textPadding(), 0);
	}
};

//-----------------------------------------------------------------------------
// Window_ItemOption
//
// The window for selecting an option for an item on the item screen

function Window_ItemOption() {
    this.initialize.apply(this, arguments);
}

Window_ItemOption.prototype = Object.create(Window_Command.prototype);
Window_ItemOption.prototype.constructor = Window_ItemOption;

Window_ItemOption.prototype.initialize = function(x, y) {
    Window_Command.prototype.initialize.call(this, x, y);
    this._actor = null;
	this._item = null;
};

Window_ItemOption.prototype.windowWidth = function() {
    return Window_SkillActionInfo.prototype.windowWidth();
};

Window_ItemOption.prototype.setActor = function(actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
        this.select(0);
    }
};

Window_ItemOption.prototype.setItem = function(item) {
    if (this._item !== item) {
        this._item = item;
        this.refresh();
        this.select(0);
    }
};

Window_ItemOption.prototype.setItemIndex = function(itemIndex) {
    if (this._itemIndex !== itemIndex) {
        this._itemIndex = itemIndex;
    }
};

Window_ItemOption.prototype.setYesNoWindow = function(yesNoWindow) {
	if(this._yesNoWindow !== yesNoWindow) {
		this._yesNoWindow = yesNoWindow;
	}
};

Window_ItemOption.prototype.numVisibleRows = function() {
	var rows = 1;
	if (this._item) {
		if(this._actor) {
			rows += 2;
		} else {
			if(!DataManager.isItem(this._item) || this._item.itypeId === 1) {
				rows += $gameParty.size();
			}
		}
	}
    return rows;
};

Window_ItemOption.prototype.makeCommandList = function() {
    if (this._item) {
		if(this._actor) {
			var canUse = DataManager.isItem(this._item)
				&& this._item.tbsStats.actions.some(function(action) { return this.isHealing(action); }, this);
			this.addCommand("Use", 'use', canUse);
			this.addCommand("Stash", 'stash', $gameSystem.isSaveEnabled());
		} else {
			if(!DataManager.isItem(this._item) || this._item.itypeId === 1) {
				$gameParty.members().forEach(function(member) {
					var enabled = member.totalItemCount() < member.maxItems();
					this.addCommand("Give " + member.displayName(), 'give', enabled);
				}, this);
			}
		}
		if(DataManager.isItem(this._item) && this._item.itypeId === 2) {
			this.addCommand("Done", 'cancel');
		} else {
			this.addCommand("Discard", 'discard');
		}
    }
};

Window_ItemOption.prototype.actor = function() {
	return this._actor;
};

Window_ItemOption.prototype.item = function() {
	return this._item;
};

Window_ItemOption.prototype.itemIndex = function() {
	return this._itemIndex;
};

Window_ItemOption.prototype.actionInfo = function() {
	var actionInfo = {};
	actionInfo.action = undefined;
	actionInfo.canTargetBodyPart = false;
	actionInfo.canTargetDownedBodyPart = false;
	actionInfo.sourceItemIndex = this._itemIndex;
	if (this._item && this._actor) {
		var action = undefined;
		var i;
		for(i = 0; i < this._item.tbsStats.actions.length; i++) {
			if(this.isHealing(this._item.tbsStats.actions[i])) {
				action = this._item.tbsStats.actions[i];
				break;
			}
		}
		if(!action) {
			return actionInfo;
		}
		
		actionInfo.action = action;
		if(action.hitGroups && action.hitGroups.length > 0) {
			action.hitGroups.forEach(function (hitGroup) {
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
	}
	return actionInfo;
};

Window_ItemOption.prototype.selectLast = function() {
    var skill = this._actor.lastMenuSkill();
    if (skill) {
        this.selectExt(skill.stypeId);
    } else {
        this.select(0);
    }
};

Window_ItemOption.prototype.refresh = function() {
	this.move(this.x, this.y, this.width, this.windowHeight());
	Window_Command.prototype.refresh.call(this);
	if(this._yesNoWindow) {
		this._yesNoWindow.y = this.y + this.height;
	}
};

Window_ItemOption.prototype.processOk = function() {
    if (this.isCurrentItemEnabled()) {
        this.playOkSound();
        this.updateInputData();
        this.deactivate();
        this.callOkHandler();
    } else {
        this.playBuzzerSound();
    }
};

Window_ItemOption.prototype.processPageup = function() {
    SoundManager.playCursor();
    this.updateInputData();
    this.callHandler('pageup');
};

Window_ItemOption.prototype.processPagedown = function() {
    SoundManager.playCursor();
    this.updateInputData();
    this.callHandler('pagedown');
};

//-----------------------------------------------------------------------------
// Window_YesNoConfirm
//
// The window for confirming yes or no on something.

function Window_YesNoConfirm() {
    this.initialize.apply(this, arguments);
}

Window_YesNoConfirm.prototype = Object.create(Window_Command.prototype);
Window_YesNoConfirm.prototype.constructor = Window_YesNoConfirm;

Window_YesNoConfirm.prototype.initialize = function(x, y) {
	this._yesText = "Yes";
	this._noText = "No";
    Window_Command.prototype.initialize.call(this, x, y);
};

Window_YesNoConfirm.prototype.windowWidth = function() {
	var textLength = this._yesText.length > this._noText.length ? this._yesText.length : this._noText.length;
    return this.standardPadding()*2 + this.textPadding()*2 + textLength*14;
};

Window_YesNoConfirm.prototype.setYesText = function(yesText) {
	if(this._yesText !== yesText) {
		this._yesText = yesText;
		this.refresh();
	}
};

Window_YesNoConfirm.prototype.setNoText = function(noText) {
	if(this._noText !== noText) {
		this._noText = noText;
		this.refresh();
	}
};

Window_YesNoConfirm.prototype.setYPos = function(yPos) {
	if(this.x !== yPos) {
		this.x = yPos;
	}
};

Window_YesNoConfirm.prototype.makeCommandList = function() {
    this.addCommand(this._yesText, 'yes');
    this.addCommand(this._noText,  'no');
};

Window_YesNoConfirm.prototype.refresh = function() {
	this.move(this.x, this.y, this.windowWidth(), this.height);
	Window_Command.prototype.refresh.call(this);
};

//-----------------------------------------------------------------------------
// Window_ActorBodyPart
//
// The window for selecting a target's body part in the party menus

function Window_ActorBodyPart() {
    this.initialize.apply(this, arguments);
}

Window_ActorBodyPart.prototype = Object.create(Window_Command.prototype);
Window_ActorBodyPart.prototype.constructor = Window_ActorBodyPart;

Window_ActorBodyPart.prototype.initialize = function(x, y) {
    Window_Command.prototype.initialize.call(this, x, y);
};

Window_ActorBodyPart.prototype.windowWidth = function() {
	var textWidth = 14 * 9;
    return textWidth + this.standardPadding()*2 + this.textPadding()*2;
};

Window_ActorBodyPart.prototype.numVisibleRows = function() {
	return 6;
};

Window_ActorBodyPart.prototype.makeCommandList = function() {
	this.addCommand("Head", 'targetPart', true, 1);
	this.addCommand("Torso", 'targetPart', true, 2);
	this.addCommand("Right Arm", 'targetPart', true, 3);
	this.addCommand("Left Arm", 'targetPart', true, 4);
	this.addCommand("Right Leg", 'targetPart', true, 5);
	this.addCommand("Left Leg", 'targetPart', true, 6);
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
		this.drawActorNickname(this._actor, 0, 0);
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
	return this.standardPadding()*2 + Window_Base._iconWidth*2 + 14*11;
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
	this.drawText("Pw", Window_Base._iconWidth, 0);
	this.drawText("Rn", Window_Base._iconWidth*2 + 14*3, 0);
	this.drawText("AE", Window_Base._iconWidth*2 + 14*6, 0);
	this.drawText("Ac", Window_Base._iconWidth*2 + 14*9, 0);
	this.resetTextColor();
	
	this.drawActionInfo(this._actionInfo, undefined, undefined, undefined, this._actor);
	
	if(this._actionInfo.sourceEquip) {
		this.drawText("Source:", 0, this.lineHeight() * (this.numVisibleRows() - 2));
		var rect = this.itemRectForText(this.numVisibleRows() - 1);
		this.drawItemName(this._actionInfo.sourceEquip, 0, rect.y, Window_Base._iconWidth*2 + 14*11);
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
		this.drawActorNickname(this._actor, 0, 0, Graphics.boxWidth/2);
		var handedness = "Left Handed";
		if(this._actor.handedness() === "right") {
			handedness = "Right Handed";
		}
		this.resetTextColor();
		this.drawText(handedness, Graphics.boxWidth/2, 0, Graphics.boxWidth/2);
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

//Window_TbsActorStatus.prototype.lineHeight = function() {
//    return 29;
//};

Window_TbsActorStatus.prototype.windowWidth = function() {
	return this.standardPadding()*2 + this.textPadding()*2 + 14*29;
};

Window_TbsActorStatus.prototype.windowHeight = function() {
	return this.fittingHeight(3);
};

Window_TbsActorStatus.prototype.setTbsActor = function(tbsActor, forceRefresh) {
    if (this._tbsActor !== tbsActor) {
		if(tbsActor && ($gameMap.tbsTurnMode() === "manualTarget" || $gameMap.tbsTurnMode() === "survey")) {
			SoundManager.playCursor();
		}
        this._tbsActor = tbsActor;
        this.refresh();
    } else if(forceRefresh) {
		this.refresh();
	}
};

Window_TbsActorStatus.prototype.refresh = function() {
    this.contents.clear();
    if (this._tbsActor) {
		this.resetTextColor();
		this.drawText(
			this._tbsActor.battler.blankDummy() ? "NO TARGET" : this._tbsActor.battler.displayName(),
			this.textPadding(),
			0,
			270
		);
		this.drawActorBuffs(this._tbsActor.battler, this.textPadding()+14*12, 0)
        this.drawActorDamage(this._tbsActor.battler, this.textPadding(), this.lineHeight());
        this.drawActorStress(this._tbsActor.battler, this.textPadding(), this.lineHeight()*2);
        this.drawActorRoundBuffs(this._tbsActor.battler, this.textPadding()+14*12, this.lineHeight()*2);
		
        this.drawActorPartsDamage(this._tbsActor.battler, this.textPadding()+14*24, 0, true);
    }
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
			var name = actor.battler.displayName();
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
        this.drawText(battler.displayName(), rect.x, rect.y, rect.width);
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

Window_TbsActor.prototype.shouldActivateManualMove = function(should) {
	this._shouldActivateManualMove = should;
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
	this.update();
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
			if(this._shouldActivateManualMove) {
				$gameMap.setTbsTurnMode("manualMove");
			}
			this._shouldActivateSurvey = false;
			this._shouldPassTurn = false;
			this._shouldOpenActionTypeWindow = false;
			this._shouldActivateManualMove = false;
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
    return 4;
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
	//this.addCommand("*Move", 'move', this.isMoveEnabled(), 4);
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

Window_TbsActionType.prototype.open = function() {
	Window_Command.prototype.open.call(this);
	this.update();
};

Window_TbsActionType.prototype.updateOpen = function() {
    if (this._opening) {
        this.openness += this.openCloseSpeed();
        if (this.isOpen()) {
            this._opening = false;
			this.refresh();
        }
    }
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
	return this.standardPadding()*2 + Window_Base._iconWidth*2 + 14*11;
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
	this.drawText("Pw", Window_Base._iconWidth, 0);
	this.drawText("Rn", Window_Base._iconWidth*2 + 14*3, 0);
	this.drawText("AE", Window_Base._iconWidth*2 + 14*6, 0);
	this.drawText("Ac", Window_Base._iconWidth*2 + 14*9, 0);
	this.resetTextColor();
	
	this.drawActionInfo(this._actionInfo, undefined, undefined, undefined, this._actor);
	
	if(this._actionInfo.sourceEquip) {
		this.drawText("Source:", 0, this.lineHeight() * (this.numVisibleRows() - 2));
		var rect = this.itemRectForText(this.numVisibleRows() - 1);
		this.drawItemName(this._actionInfo.sourceEquip, 0, rect.y, Window_Base._iconWidth*2 + 14*11);
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
	this._actionInfoGroups = [];
    Window_Selectable.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
	this._stypeId = 0;
	this._actionTextColor = [];
	this._previousIndex = 0;
};

Window_TbsAction.prototype.windowWidth = function() {
	if(this._actionInfoGroups.length > 0) {
		var longestLength = 0;
		this._actionInfoGroups.forEach(function (actionInfoGroup) {
			actionInfoGroup.forEach(function (actionInfoGroupEntry) {
				var actionInfo = actionInfoGroupEntry.actionInfo;
				var thisLength = actionInfo.action.name.length;
				if(actionInfo.action.stressCost !== undefined && actionInfo.action.stressCost > 0) {
					thisLength += 3;
				}
				if(longestLength < thisLength) {
					longestLength = thisLength;
				}
			});
		});
		return this.standardPadding() * 2 + longestLength * 14 + Window_Base._iconWidth + this.textPadding() * 3;
	} else {
		return Graphics.boxWidth / 4;
	}
};

Window_TbsAction.prototype.windowHeight = function() {
	return this.fittingHeight(this.numVisibleRows());
};

Window_TbsAction.prototype.numVisibleRows = function() {
	return this.maxItems();
};

Window_TbsAction.prototype.cursorRight = function(wrap) {
	if(this._actionLevelWindow && this._actionLevelWindow.visible) {
		var newIndex = this._actionLevelWindow.index()+1;
		if(newIndex >= this._actionLevelWindow.maxItems()) {
			newIndex = 0;
		}
		this._actionLevelWindow.select(newIndex);
		this.updateSelectedAction();
		this.refresh(true);
		SoundManager.playCursor();
	}
};

Window_TbsAction.prototype.cursorLeft = function(wrap) {
	if(this._actionLevelWindow && this._actionLevelWindow.visible) {
		var newIndex = this._actionLevelWindow.index()-1;
		if(newIndex < 0) {
			newIndex = this._actionLevelWindow.maxItems()-1;
		}
		this._actionLevelWindow.select(newIndex);
		this.updateSelectedAction();
		this.refresh(true);
		SoundManager.playCursor();
	}
};

Window_TbsAction.prototype.setActionTypeWindow = function(actionTypeWindow) {
	if (this._actionTypeWindow !== actionTypeWindow) {
		this._actionTypeWindow = actionTypeWindow;
	}
};

Window_TbsAction.prototype.setTargetWindow = function(targetWindow) {
	if (this._targetWindow !== targetWindow) {
		this._targetWindow = targetWindow;
	}
};

Window_TbsAction.prototype.setActionInfoWindow = function(actionInfoWindow) {
	if (this._actionInfoWindow !== actionInfoWindow) {
		this._actionInfoWindow = actionInfoWindow;
	}
};

Window_TbsAction.prototype.setActionLevelWindow = function(actionLevelWindow) {
	if (this._actionLevelWindow !== actionLevelWindow) {
		this._actionLevelWindow = actionLevelWindow;
	}
};

Window_TbsAction.prototype.setTbsActor = function(tbsActor) {
    if (this._tbsActor !== tbsActor) {
        this._tbsActor = tbsActor;
		if(this._targetWindow) {
			this._targetWindow.setActionIndex(-1);
		}
    }
};

Window_TbsAction.prototype.setStypeId = function(stypeId) {
    if (this._stypeId !== stypeId) {
        this._stypeId = stypeId;
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

Window_TbsAction.prototype.updateActionLevelWindow = function(forceRecreate) {
	var actionInfoGroup = this._actionInfoGroups[this.index()];
	if (this._actionLevelWindow) {
		if(forceRecreate || this._previousIndex != this.index()) {
			var levels = [];
			var i;
			for(i = 0; i < actionInfoGroup.length; i++) {
				var level = {};
				level.number = actionInfoGroup[i].actionInfo.action.actionGroupLevel;
				if(!this.isActionEnabled(actionInfoGroup[i].actionInfo.action)) {
					level.color = "gray";
				} else if(this._actionTextColor[actionInfoGroup[i].actionIndex] == this.deathColor()) {
					level.color = "red";
				} else if(this._actionTextColor[actionInfoGroup[i].actionIndex] == this.crisisColor()) {
					level.color = "yellow";
				} else {
					level.color = "white";
				}
				levels.push(level);
			}
			this._actionLevelWindow.setLevels(levels);
			this._actionLevelWindow.move(
				this._actionLevelWindow.x,
				this.y + this.index() * this.lineHeight(),
				this._actionLevelWindow.windowWidth(),
				this._actionLevelWindow.windowHeight()
			);
			this._actionLevelWindow.createContents();
			this._actionLevelWindow.select(0);
			this._actionLevelWindow.refresh();
			this.refresh(true);
		}
		if(actionInfoGroup.length > 1) {
			this._actionLevelWindow.show();
			this._actionLevelWindow.move(
				this._actionLevelWindow.x,
				this.y + this.index() * this.lineHeight(),
				this._actionLevelWindow.windowWidth(),
				this._actionLevelWindow.windowHeight()
			);
			this._actionLevelWindow.createContents();
			this._actionLevelWindow.refresh();
		} else {
			this._actionLevelWindow.hide();
		}
	}
};

Window_TbsAction.prototype.updateSelectedAction = function() {
	var actionInfoGroup = this._actionInfoGroups[this.index()];
	var indexInGroup = Math.max(0, this._actionLevelWindow && actionInfoGroup.length > 1 ? this._actionLevelWindow.index() : 0);
	var actionInfo = actionInfoGroup[indexInGroup].actionInfo;
	var actionIndex = actionInfoGroup[indexInGroup].actionIndex;
	$gameMap.setTbsSelectedAction(actionInfo, actionIndex);
	if (this._actionInfoWindow) {
		this._actionInfoWindow.setActionInfo(actionInfo);
		if(this._tbsActor) {
			this._actionInfoWindow.setActor(this._tbsActor.battler);
		}
	}
	if (this._targetWindow) {
		this._targetWindow.setActionIndex(actionIndex);
		var action = actionInfo.action;
		var allies = this._targetWindow.allies();
		var enemies = this._targetWindow.enemies();
		if((action.intendedTarget === "ally" && allies.length > 0)
			|| (action.intendedTarget === "enemy" && enemies.length === 0)) {
			this._targetWindow.showAllies();
		} else {
			this._targetWindow.showEnemies();
		}
	}
};

Window_TbsAction.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
	if (!$gameMap.currentForce() || !$gameMap.currentForce().isParty || !this.isOpenAndActive()) {
		this._previousIndex = this.index();
		if(this._actionLevelWindow) {
			this._actionLevelWindow.hide();
		}
		return;
	}
	if(this._actionInfoGroups && this._actionInfoGroups.length > 0 && this.index() >= 0 && this.index() < this._actionInfoGroups.length) {
		this.updateActionLevelWindow();
		this.updateSelectedAction();
	}
	this._previousIndex = this.index();
};

Window_TbsAction.prototype.makeItemList = function() {
	this._actionInfoGroups = [];
	this._actionTextColor = [];
	var handledGroupNames = [];
	if (this._tbsActor) {
		var actionInfos = this._tbsActor.isParty ? $gameMap.getPartyActionInfos() : $gameMap.getEnemyActionInfos();
		
		var i;
		for(i = 0; i < actionInfos.length; i++) {
			var action = actionInfos[i].action;
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
			
			if(action.actionGroupName === undefined) {
				var actionInfoGroup = [];
				var actionInfoGroupEntry = {};
				actionInfoGroupEntry.actionInfo = actionInfos[i];
				actionInfoGroupEntry.actionIndex = i;
				actionInfoGroup.push(actionInfoGroupEntry);
				this._actionInfoGroups[this._actionInfoGroups.length] = actionInfoGroup;
			} else if(handledGroupNames.indexOf(action.actionGroupName) == -1) {
				handledGroupNames.push(action.actionGroupName);
				var handledLevels = [];
				var actionInfoGroup = [];
				var actionInfoGroupEntry = {};
				actionInfoGroupEntry.actionInfo = actionInfos[i];
				actionInfoGroupEntry.actionIndex = i;
				actionInfoGroup.push(actionInfoGroupEntry);
				handledLevels.push(action.actionGroupLevel);
				var j;
				for(j = 0; j < actionInfos.length; j++) {
					var innerAction = actionInfos[j].action;
					if(handledLevels.indexOf(innerAction.actionGroupLevel) >= 0) { continue; }
					if(innerAction.actionGroupName === action.actionGroupName) {
						var innerActionInfoGroupEntry = {};
						innerActionInfoGroupEntry.actionInfo = actionInfos[j];
						innerActionInfoGroupEntry.actionIndex = j;
						actionInfoGroup.push(innerActionInfoGroupEntry);
					}
				}
				actionInfoGroup.sort(function(a, b) {
					return b.actionInfo.action.actionGroupLevel - a.actionInfo.action.actionGroupLevel;
				});
				this._actionInfoGroups[this._actionInfoGroups.length] = actionInfoGroup;
			}
		};
	}
	
	if (this._actionLevelWindow) {
		this._actionLevelWindow.move(
			this.x + this.windowWidth() - this.standardPadding()*(2/3),
			this._actionLevelWindow.y,
			this._actionLevelWindow.windowWidth(),
			this._actionLevelWindow.windowHeight()
		);
		this._actionLevelWindow.createContents();
		this._actionLevelWindow.refresh();
	}
	
	if(this.index() < 0) {
		this.select(0);
	}
	if(this.index() >= this._actionInfoGroups.length) {
		this.select(Math.max(0, this._actionInfoGroups.length - 1));
	}
};

Window_TbsAction.prototype.maxItems = function() {
	return this._actionInfoGroups ? this._actionInfoGroups.length : 1;
};

Window_TbsAction.prototype.drawItem = function(index) {
    var actionInfoGroup = this._actionInfoGroups[index];
	if (actionInfoGroup) {
		var levelIndex = Math.max(0, this._actionLevelWindow && index == this.index() ? this._actionLevelWindow.index() : 0);
		var action = actionInfoGroup[levelIndex].actionInfo.action;
		var highestEnabledAction = actionInfoGroup[actionInfoGroup.length-1].actionInfo.action;
		var i;
		for(i = 0; i < actionInfoGroup.length; i++) {
			if(this.isActionEnabled(actionInfoGroup[i].actionInfo.action)) {
				highestEnabledAction = actionInfoGroup[i].actionInfo.action;
				break;
			}
		}
		var costWidth = this.costWidth();
		
		var iconBoxWidth = Window_Base._iconWidth;
		this.resetTextColor();
		
		var name = index == this.index() ? action.name : highestEnabledAction.name;
		var iconIndex = index == this.index() ? this.iconIndexForAction(action) : this.iconIndexForAction(highestEnabledAction);
		var enabled = index == this.index() ? this.isActionEnabled(action) : this.isActionGroupEnabled(actionInfoGroup);
		this.resetTextColor();
		this.changePaintOpacity(enabled);
		if(enabled) {
			this.changeTextColor(this._actionTextColor[actionInfoGroup[levelIndex].actionIndex]);
		}
		this.drawIcon(iconIndex, this.textPadding(), this.lineHeight() * index + 2);
		this.drawText(name, this.textPadding() * 2 + iconBoxWidth, this.lineHeight() * index);
		var stressCost = index == this.index() ? action.stressCost : highestEnabledAction.stressCost;
		if(stressCost !== undefined && stressCost > 0) {
			this.changeTextColor(this.crisisColor());
			this.drawText(stressCost, this.textPadding(), this.lineHeight() * index,
				this.windowWidth() - this.standardPadding()*2 - this.textPadding()*2, "right");
		}
		this.resetTextColor();
		this.changePaintOpacity(1);
	}
};

Window_TbsAction.prototype.selectFirstEnabledItem = function() {
	var selected = false;
	var i;
	for(i = 0; i < this.maxItems(); i++) {
		var actionInfoGroup = this._actionInfoGroups[this.index()];
		if(this.isActionGroupEnabled(actionInfoGroup)) {
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

Window_TbsAction.prototype.isActionEnabled = function(action) {
	if(this._tbsActor && action) {
		return (!action.cantUseHalfMove || $gameMap.tbsCurrentPositionIsFullMove())
			&& (!action.cantUseFullMove || $gameMap.tbsCurrentPositionIsHalfMove());
	}
	return false;
};

Window_TbsAction.prototype.isActionGroupEnabled = function(actionGroup) {
	var i;
	for(i = 0; i < actionGroup.length; i++) {
		if(this.isActionEnabled(actionGroup[i].actionInfo.action)) {
			return true;
		}
	}
	return false;
};

Window_TbsAction.prototype.isCurrentItemEnabled = function() {
	if(!this._actionInfoGroups[this.index()]) { return false; }
	return this.isActionGroupEnabled(this._actionInfoGroups[this.index()]);
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
	if(this._actionLevelWindow) {
		this._actionLevelWindow.select(0);
	}
	this.updateActionLevelWindow(true);
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
	this.refresh(dontSelectFirst);
};

Window_TbsAction.prototype.refresh = function(dontSelectFirst) {
    this.makeItemList();
	this.move(this.x, this.y, this.windowWidth(), this.windowHeight());
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
	return
		this._actionInfoGroups && this.index() >= 0 ?
		this._actionInfoGroups[this.index()][this._actionInfoGroups[this.index()].length > 1 ? this._actionLevelWindow.index() : 0].actionInfo :
		null;
};

//-----------------------------------------------------------------------------
// Window_TbsActionLevel
//
// The window for selecting the level of an action with multiple power levels

function Window_TbsActionLevel() {
    this.initialize.apply(this, arguments);
}

Window_TbsActionLevel.prototype = Object.create(Window_Selectable.prototype);
Window_TbsActionLevel.prototype.constructor = Window_TbsAction;

Window_TbsActionLevel.prototype.initialize = function() {
	this._levels = [];
    Window_Selectable.prototype.initialize.call(this, 0, 0, this.windowWidth(), this.windowHeight());
};

Window_TbsActionLevel.prototype.windowWidth = function() {
	var levelCount = this._levels.length;
	var levelString = levelCount+"";
	return this.standardPadding()*2 + this.spacing()*(levelCount-1) + (levelString.length*14+this.textPadding()*2)*levelCount;
};

Window_TbsActionLevel.prototype.windowHeight = function() {
	return this.fittingHeight(this.numVisibleRows());
};

Window_TbsActionLevel.prototype.numVisibleRows = function() {
    return 1;
};

Window_TbsActionLevel.prototype.maxCols = function() {
    return Math.max(1, this._levels.length);
};

Window_TbsActionLevel.prototype.maxItems = function() {
	return this.maxCols();
};

Window_TbsActionLevel.prototype.itemTextAlign = function() {
    return 'center';
};

Window_TbsActionLevel.prototype.setLevels = function(levels) {
	this._levels = levels;
	this.move(this.x, this.y, this.windowWidth(), this.windowHeight());
	this.createContents();
	this.refresh();
};

Window_TbsActionLevel.prototype.drawItem = function(index) {
	if(index < 0 || index >= this._levels.length) { return; }
    this.resetTextColor();
	this.changePaintOpacity(true);
	if(this._levels[index].color === 'yellow') {
		this.changeTextColor(this.crisisColor());
	} else if(this._levels[index].color === 'red') {
		this.changeTextColor(this.deathColor());
	} else if(this._levels[index].color === 'gray') {
		this.changePaintOpacity(false);
	}
	var levelString = this._levels[index].number+"";
    this.drawText(
		levelString,
		this.textPadding()+(levelString.length*14+this.textPadding()*2+this.spacing())*index,
		0,
		levelString.length*14,
		this.itemTextAlign()
	);
    this.resetTextColor();
	this.changePaintOpacity(true);
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

Window_TbsTarget.prototype.cursorRight = function(wrap) {
    this.select(this.maxItems()-1);
};

Window_TbsTarget.prototype.cursorLeft = function(wrap) {
    this.select(this.maxItems()-1);
};

Window_TbsTarget.prototype.windowWidth = function() {
	if(this._actors.length > 0) {
		var longestLength = 7;
		this._actors.forEach(function (actor) {
			var name = actor.battler.displayName();
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
		this.updateAlliesAndEnemies();
	}
};

Window_TbsTarget.prototype.updateAlliesAndEnemies = function() {
	if(this._actionIndex >= 0) {
		var alliesAndEnemies = $gameMap.getCurrentActorAlliesAndEnemiesInRange(this._actionIndex);
		this._allies = alliesAndEnemies.allies;
		this._enemies = alliesAndEnemies.enemies;
	} else {
		this._allies = [];
		this._enemies = [];
	}
	this.refreshWindowContents();
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
	
Window_TbsTarget.prototype.processPagedown = function() {
	if(this.hasAlliesAndEnemies()) {
		SoundManager.playCursor();
		this.updateInputData();
		this.callHandler('pagedown');
	} else {
		SoundManager.playBuzzer();
	}
};

Window_TbsTarget.prototype.processPageup = function() {
	if(this.hasAlliesAndEnemies()) {
		SoundManager.playCursor();
		this.updateInputData();
		this.callHandler('pageup');
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
			this.drawText(tbsActor.battler.displayName(), this.textPadding(), this.lineHeight()*index);
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
		if(!this.isOpening()) {
			this._allies.forEach(function (actor) {
				if(!actor.suffixWindow) { return; }
				actor.suffixWindow.reposition(actor.chara.x, actor.chara.y);
				actor.suffixWindow.show();
			}, this);
			this._enemies.forEach(function (actor) {
				if(!actor.suffixWindow) { return; }
				actor.suffixWindow.reposition(actor.chara.x, actor.chara.y);
				actor.suffixWindow.show();
			}, this);
		}
        this._opening = true;
    }
    this._closing = false;
	if(this._actorStatusWindow) {
		this._actorStatusWindow.show();
		this._actorStatusWindow.open();
	}
	this.update();
};

Window_TbsTarget.prototype.close = function() {
    if (!this.isClosed()) {
		if(!this.isClosing()) {
			this._allies.forEach(function (actor) {
				if(!actor.suffixWindow) { return; }
				actor.suffixWindow.hide();
			}, this);
			this._enemies.forEach(function (actor) {
				if(!actor.suffixWindow) { return; }
				actor.suffixWindow.hide();
			}, this);
		}
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
		return this.standardPadding()*2 + this.textPadding()*2 + this._tbsActor.battler.displayName().length * 14;
	} else {
		return this.standardPadding()*2 + this.textPadding()*2;
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
		this.drawText(battler.blankDummy() ? "NO TARGET" : battler.displayName(), this.textPadding(), 0);
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
	this.addCommand("Right Arm", 'targetPart', true, 3);
	this.addCommand("Left Arm", 'targetPart', true, 4);
	this.addCommand("Right Leg", 'targetPart', true, 5);
	this.addCommand("Left Leg", 'targetPart', true, 6);
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
			part = "rightArm";
			break;
		case 4:
			part = "leftArm";
			break;
		case 5:
			part = "rightLeg";
			break;
		case 6:
			part = "leftLeg";
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

//-----------------------------------------------------------------------------
// Window_TbsNoTarget
//
// The window for informing the player that an action had no target

function Window_TbsNoTarget() {
    this.initialize.apply(this, arguments);
}

Window_TbsNoTarget.prototype = Object.create(Window_Base.prototype);
Window_TbsNoTarget.prototype.constructor = Window_TbsNoTarget;

Window_TbsNoTarget.prototype.initialize = function() {
    Window_Base.prototype.initialize.call(this,
		Graphics.boxWidth / 2 - this.windowWidth() / 2,
		Graphics.boxHeight / 2 - this.windowHeight() / 2,
		this.windowWidth(), this.windowHeight());
    this.refresh();
};

Window_TbsNoTarget.prototype.refresh = function() {
	this.drawText("No target", this.textPadding(), 0);
};

Window_TbsNoTarget.prototype.windowWidth = function() {
	return 14*9 + this.standardPadding()*2 + this.textPadding()*2;
};

Window_TbsNoTarget.prototype.windowHeight = function() {
	return this.fittingHeight(1);
};
//-----------------------------------------------------------------------------
// Window_TbsSurpriseRound
//
// The window for informing the player that the battle has begun with a surprise round

function Window_TbsSurpriseRound() {
    this.initialize.apply(this, arguments);
}

Window_TbsSurpriseRound.prototype = Object.create(Window_Base.prototype);
Window_TbsSurpriseRound.prototype.constructor = Window_TbsSurpriseRound;

Window_TbsSurpriseRound.prototype.initialize = function() {
    Window_Base.prototype.initialize.call(this,
		Graphics.boxWidth - this.windowWidth() + this.standardPadding()*(2/3),
		Graphics.boxHeight / 2 - this.windowHeight() / 2,
		this.windowWidth(), this.windowHeight());
    this.refresh();
};

Window_TbsSurpriseRound.prototype.refresh = function() {
	this.drawText("Surprise round", this.textPadding(), 0);
};

Window_TbsSurpriseRound.prototype.windowWidth = function() {
	return 14*14 + this.standardPadding()*2 + this.textPadding()*2;
};

Window_TbsSurpriseRound.prototype.windowHeight = function() {
	return this.fittingHeight(1);
};

//-----------------------------------------------------------------------------
// Window_TbsNextRound
//
// The window for informing the player that a new round has started

function Window_TbsNextRound() {
    this.initialize.apply(this, arguments);
}

Window_TbsNextRound.prototype = Object.create(Window_Base.prototype);
Window_TbsNextRound.prototype.constructor = Window_TbsNextRound;

Window_TbsNextRound.prototype.initialize = function() {
    Window_Base.prototype.initialize.call(this,
		Graphics.boxWidth - this.windowWidth() + this.standardPadding()*(2/3),
		Graphics.boxHeight / 2 - this.windowHeight() / 2,
		this.windowWidth(), this.windowHeight());
    this.refresh();
};

Window_TbsNextRound.prototype.refresh = function() {
	this.drawText("New round", this.textPadding(), 0);
};

Window_TbsNextRound.prototype.windowWidth = function() {
	return 14*9 + this.standardPadding()*2 + this.textPadding()*2;
};

Window_TbsNextRound.prototype.windowHeight = function() {
	return this.fittingHeight(1);
};

//-----------------------------------------------------------------------------
// Window_StatusCommand
//
// The window for selecting a command on the status screen.

function Window_StatusCommand() {
    this.initialize.apply(this, arguments);
}

Window_StatusCommand.prototype = Object.create(Window_HorzCommand.prototype);
Window_StatusCommand.prototype.constructor = Window_StatusCommand;

Window_StatusCommand.prototype.initialize = function(y) {
    this._windowWidth = Graphics.boxWidth;
    Window_HorzCommand.prototype.initialize.call(this, 0, y);
};

Window_StatusCommand.prototype.windowWidth = function() {
    return this._windowWidth;
};

Window_StatusCommand.prototype.maxCols = function() {
    return 2;
};

Window_StatusCommand.prototype.makeCommandList = function() {
    this.addCommand("Skills",   'skills');
    this.addCommand("Attributes", 'attributes');
};

Window_StatusCommand.prototype.processPageup = function() {
    SoundManager.playCursor();
    this.updateInputData();
    this.callHandler('pageup');
};

Window_StatusCommand.prototype.processPagedown = function() {
    SoundManager.playCursor();
    this.updateInputData();
    this.callHandler('pagedown');
};

//-----------------------------------------------------------------------------
// Window_StatusSkills
//
// The window for displaying character skills on the status screen

function Window_StatusSkills() {
    this.initialize.apply(this, arguments);
}

Window_StatusSkills.prototype = Object.create(Window_Selectable.prototype);
Window_StatusSkills.prototype.constructor = Window_StatusSkills;

Window_StatusSkills.prototype.initialize = function(y) {
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight-y;
    Window_Selectable.prototype.initialize.call(this, 0, y, width, height);
	this._activeIndicies = [];
    this.refresh();
    this.activate();
};

Window_StatusSkills.prototype.maxCols = function() {
	return 2;
};

Window_StatusSkills.prototype.maxItems = function() {
    return 18;
};

Window_StatusSkills.prototype.spacing = function() {
	return 48;
};

Window_StatusSkills.prototype.setActor = function(actor) {
	if(this._optionWindow) {
		this._optionWindow.setActor(actor);
	}
	if(this._statusWindow) {
		this._statusWindow.setActor(actor);
	}
	if(this._skillLearnedWindow && actor) {
		var actions = actor.getAllSkillActionInfos().map(function (actionInfo) { return actionInfo.action; });
		this._skillLearnedWindow.setOldActions(actions);
	}
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
};

Window_StatusSkills.prototype.setSkillOptionWindow = function(optionWindow) {
    if (this._optionWindow !== optionWindow) {
        this._optionWindow = optionWindow;
    }
};

Window_StatusSkills.prototype.setStatusWindow = function(statusWindow) {
    if (this._statusWindow !== statusWindow) {
        this._statusWindow = statusWindow;
    }
};

Window_StatusSkills.prototype.setSkillLearnedWindow = function(skillLearnedWindow) {
    if (this._skillLearnedWindow !== skillLearnedWindow) {
        this._skillLearnedWindow = skillLearnedWindow;
    }
};

Window_StatusSkills.prototype.update = function() {
	Window_Selectable.prototype.update.call(this);
	if(this._optionWindow) {
		this._optionWindow.setSkill(this.currentSkill());
	}
};

Window_StatusSkills.prototype.isCurrentItemEnabled = function() {
    return this._activeIndicies.indexOf(this.index()) >= 0;
};

Window_StatusSkills.prototype.currentSkill = function() {
	if(!this._actor) { return ""; }
	if(this.index() % 2 == 1) {
		switch(this.index()) {
			case 3:
				return "meleeAcc";
			case 5:
				return "rangedAcc";
			case 9:
				return "physEvade";
			case 11:
				return "tripEvade";
			case 15:
				return "manualDex";
			case 17:
				return "perception";
		}
	} else {
		var uniqueSkills = this._actor.uniqueSkills();
		return uniqueSkills[this.index()/2-1];
	}
};

Window_StatusSkills.prototype.handleCursorPosition = function() {
	if(!this._lastDirection) { this._lastDirection = "up"; }
	while(!this.isCurrentItemEnabled()) {
		switch(this._lastDirection) {
			case "down":
				this.cursorDown(true);
				break;
			case "up":
				this.cursorUp(true);
				break;
			case "right":
				this.cursorRight(true);
				break;
			case "left":
				this.cursorLeft(true);
				break;
		}
	}
	this._lastDirection = undefined;
};

Window_StatusSkills.prototype.cursorDown = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (index < maxItems - maxCols || wrap) {
        this.select((index + maxCols) % maxItems);
    }
	this._lastDirection = "down";
};

Window_StatusSkills.prototype.cursorUp = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (index >= maxCols || wrap) {
        this.select((index - maxCols + maxItems) % maxItems);
    }
	this._lastDirection = "up";
};

Window_StatusSkills.prototype.cursorRight = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (maxCols >= 2 && (index < maxItems - 1 || wrap)) {
        this.select((index + 1) % maxItems);
    }
	this._lastDirection = "right";
};

Window_StatusSkills.prototype.cursorLeft = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (maxCols >= 2 && (index > 0 || wrap)) {
        this.select((index - 1 + maxItems) % maxItems);
    }
	this._lastDirection = "left";
};

Window_StatusSkills.prototype.processCursorMove = function() {
    if (this.isCursorMovable()) {
        var lastIndex = this.index();
        if (Input.isRepeated('down')) {
            this.cursorDown(Input.isTriggered('down'));
        }
        if (Input.isRepeated('up')) {
            this.cursorUp(Input.isTriggered('up'));
        }
        if (Input.isRepeated('right')) {
            this.cursorRight(Input.isTriggered('right'));
        }
        if (Input.isRepeated('left')) {
            this.cursorLeft(Input.isTriggered('left'));
        }
		this.handleCursorPosition();
        if (this.index() !== lastIndex) {
            SoundManager.playCursor();
        }
    }
};

Window_StatusSkills.prototype.refresh = function() {
	if(this.contents) {
		this.contents.clear();
		this._activeIndicies = [];
		if (this._actor) {
			this.drawParametersColumnOne();
			this.drawParametersColumnTwo();
			this.handleCursorPosition();
		}
	}
	if (this._statusWindow) {
		this._statusWindow.refresh();
	}
	if(this._optionWindow) {
		this._optionWindow.refresh();
	}
};

Window_StatusSkills.prototype.drawParametersColumnOne = function() {
	var rect = this.itemRect(0);
	var iconWidth = Window_Base._iconWidth;
	this.resetTextColor();
	this.drawText("Ability", rect.x, rect.y, rect.width);
	var uniqueSkills = this._actor.uniqueSkills();
	var i;
	for(i = 0; i < uniqueSkills.length; i++)
	{
		rect = this.itemRect((i+1)*2);
		var xOffset = 0;
		if(uniqueSkills[i] === this._actor.defenseSkillName()) {
			xOffset = iconWidth + this.textPadding();
			this.drawIcon(81, rect.x, rect.y);
		} else if(uniqueSkills[i] === this._actor.reflexSkillName()) {
			xOffset = iconWidth + this.textPadding();
			this.drawIcon(82, rect.x, rect.y);
		}
		this.drawSkillLevel(this.getDisplayNameForUniqueSkill(uniqueSkills[i]), uniqueSkills[i], rect.x + xOffset, rect.y, rect.width-xOffset);
		this._activeIndicies.push((i+1)*2);
	}
};

Window_StatusSkills.prototype.drawParametersColumnTwo = function() {
	this.resetTextColor();
	var rect = this.itemRect(1);
	this.drawText("Accuracy", rect.x, rect.y, rect.width);
	rect = this.itemRect(3);
	this.drawSkillLevel("Melee", "meleeAcc", rect.x, rect.y, rect.width);
	rect = this.itemRect(5);
	this.drawSkillLevel("Ranged", "rangedAcc", rect.x, rect.y, rect.width);
	this.resetTextColor();
	rect = this.itemRect(7);
	this.drawText("Evasion", rect.x, rect.y, rect.width);
	rect = this.itemRect(9);
	this.drawSkillLevel("Defense", "physEvade", rect.x, rect.y, rect.width);
	rect = this.itemRect(11);
	this.drawSkillLevel("Balance", "tripEvade", rect.x, rect.y, rect.width);
	this.resetTextColor();
	rect = this.itemRect(13);
	this.drawText("Utility", rect.x, rect.y, rect.width);
	rect = this.itemRect(15);
	this.drawSkillLevel("Manual Dexterity", "manualDex", rect.x, rect.y, rect.width);
	rect = this.itemRect(17);
	this.drawSkillLevel("Perception", "perception", rect.x, rect.y, rect.width);
	this._activeIndicies.push(3);
	this._activeIndicies.push(5);
	this._activeIndicies.push(9);
	this._activeIndicies.push(11);
	this._activeIndicies.push(15);
	this._activeIndicies.push(17);
};

Window_StatusSkills.prototype.drawSkillLevel = function(displayName, skill, x, y, width) {
	if(this._actor.skillPotential(skill) > 0) {
		this.drawIcon(87, x + width - 14*2 - this.textPadding()*2 - Window_Base._iconWidth, y);
	}
	this.changeTextColor(this.systemColor());
	this.drawText(displayName, this.textPadding() + x, y, width - 14*7);
	this.resetTextColor();
	this.drawText(this._actor.totalSkill(skill), x + width - 14*2 - this.textPadding(), y, 14*2, 'right');
};

Window_StatusSkills.prototype.processPageup = function() {
    SoundManager.playCursor();
    this.updateInputData();
    this.callHandler('pageup');
};

Window_StatusSkills.prototype.processPagedown = function() {
    SoundManager.playCursor();
    this.updateInputData();
    this.callHandler('pagedown');
};

//-----------------------------------------------------------------------------
// Window_StatusSkillOption
//
// The window for selecting an option for a skill on the status screen

function Window_StatusSkillOption() {
    this.initialize.apply(this, arguments);
}

Window_StatusSkillOption.prototype = Object.create(Window_Command.prototype);
Window_StatusSkillOption.prototype.constructor = Window_StatusSkillOption;

Window_StatusSkillOption.prototype.initialize = function(x, y) {
    Window_Command.prototype.initialize.call(this, x, y);
    this._actor = null;
	this._skill = null;
};

Window_StatusSkillOption.prototype.windowWidth = function() {
    return this.standardPadding()*2 + this.textPadding()*2 + 14*20;
};

Window_StatusSkillOption.prototype.setActor = function(actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
        this.select(0);
    }
};

Window_StatusSkillOption.prototype.setSkill = function(skill) {
    if (this._skill !== skill) {
        this._skill = skill;
        this.refresh();
        this.select(0);
    }
};

Window_StatusSkillOption.prototype.numVisibleRows = function() {
    return 2;
};

Window_StatusSkillOption.prototype.makeCommandList = function() {
	var canUpgrade = false;
	var canDowngrade = false;
	var upgradeCostText = "------";
	var downgradeCostText = "------";
	if(this._actor && this._skill) {
		var battler = this._actor;
		canUpgrade = battler.skillPoints(this._skill) < battler.maxSkillPoints() && battler.skillXP() >= battler.skillUpgradeCost(this._skill);
		canDowngrade = battler.skillPoints(this._skill) > 0 && battler.respecXP() >= battler.skillDowngradeCost(this._skill);
		upgradeCostText = battler.skillPoints(this._skill) < battler.maxSkillPoints() ? battler.skillUpgradeCost(this._skill)+"" : "------";
		downgradeCostText = battler.skillPoints(this._skill) > 0 ? battler.skillDowngradeCost(this._skill)+"" : "------";
		while(upgradeCostText.length < 6) {
			upgradeCostText = " " + upgradeCostText;
		}
		while(downgradeCostText.length < 6) {
			downgradeCostText = " " + downgradeCostText;
		}
	}
	this.addCommand("Upgrade   - " + upgradeCostText 	+ "SP", 'upgrade', canUpgrade);
	this.addCommand("Downgrade - " + downgradeCostText	+ "RP", 'downgrade', canDowngrade);
};

Window_StatusSkillOption.prototype.processOk = function() {
    if (this.isCurrentItemEnabled()) {
        this.playOkSound();
        this.updateInputData();
        this.deactivate();
        this.callOkHandler();
    } else {
        this.playBuzzerSound();
    }
};

//-----------------------------------------------------------------------------
// Window_StatusSkillLearned
//
// The window for informing the player that a skill has been gained or lost

function Window_StatusSkillLearned() {
    this.initialize.apply(this, arguments);
}

Window_StatusSkillLearned.prototype = Object.create(Window_Base.prototype);
Window_StatusSkillLearned.prototype.constructor = Window_StatusSkillLearned;

Window_StatusSkillLearned.prototype.initialize = function() {
	this._oldActions = [];
	this._newActions = [];
	this._oldAttributes = [];
	this._newAttributes = [];
	this._learnedActions = [];
	this._forgottenActions = [];
	this._gainedAttributes = [];
	this._lostAttributes = [];
    Window_Base.prototype.initialize.call(this,
		Graphics.boxWidth / 2 - this.windowWidth() / 2,
		Graphics.boxHeight / 2 - this.windowHeight() / 2,
		this.windowWidth(), this.windowHeight());
};

Window_StatusSkillLearned.prototype.windowWidth = function() {
	var contentsWidth = 18*14;
	var characterCount = 0;
	this._learnedActions.forEach(function (action) {
		if(characterCount < action.name.length) {
			characterCount = action.name.length;
		}
	});
	this._forgottenActions.forEach(function (action) {
		if(characterCount < action.name.length) {
			characterCount = action.name.length;
		}
	});
	var actionWidth = Window_Base._iconWidth + this.textPadding() + characterCount*14;
	if(contentsWidth < actionWidth) {
		contentsWidth = actionWidth;
	}
	characterCount = 0;
	this._gainedAttributes.forEach(function (attribute) {
		if(characterCount < attribute.name.length) {
			characterCount = attribute.name.length;
		}
	});
	this._lostAttributes.forEach(function (attribute) {
		if(characterCount < attribute.name.length) {
			characterCount = attribute.name.length;
		}
	});
	var attributeWidth = characterCount*14;
	if(contentsWidth < attributeWidth) {
		contentsWidth = attributeWidth;
	}
	return this.standardPadding()*2 + this.textPadding()*2 + contentsWidth;
};

Window_StatusSkillLearned.prototype.windowHeight = function() {
	var lineCount = 0;
	if(this._learnedActions.length > 0) {
		lineCount += this._learnedActions.length + 1;
	}
	if(this._forgottenActions.length > 0) {
		lineCount += this._forgottenActions.length + 1;
	}
	if(this._gainedAttributes.length > 0) {
		lineCount += this._gainedAttributes.length + 1;
	}
	if(this._lostAttributes.length > 0) {
		lineCount += this._lostAttributes.length + 1;
	}
	return this.fittingHeight(lineCount);
};

Window_StatusSkillLearned.prototype.setOldActions = function(oldActions) {
	this._oldActions = oldActions;
	this._newActions = [];
};

Window_StatusSkillLearned.prototype.setNewActions = function(newActions) {
	this._newActions = newActions;
	this._learnedActions = [];
	this._forgottenActions = [];
	this._oldActions.forEach(function (oldAction) {
		if(!this._newActions.some(function (newAction) {
			return oldAction.name === newAction.name;
		})) {
			this._forgottenActions.push(oldAction);
		}
	}, this);
	this._newActions.forEach(function (newAction) {
		if(!this._oldActions.some(function (oldAction) {
			return oldAction.name === newAction.name;
		})) {
			this._learnedActions.push(newAction);
		}
	}, this);
};

Window_StatusSkillLearned.prototype.setOldAttributes = function(oldAttributes) {
	this._oldAttributes = oldAttributes;
	this._newAttributes = [];
};

Window_StatusSkillLearned.prototype.setNewAttributes = function(newAttributes) {
	this._newAttributes = newAttributes;
	this._gainedAttributes = [];
	this._lostAttributes = [];
	var gainedAndLostAttributes = [];
	this._oldAttributes.forEach(function (oldAttribute) {
		if(!gainedAndLostAttributes.some(function (gainedAndLostAttribute) {
			return gainedAndLostAttribute.name === oldAttribute.name
		})) {
			gainedAndLostAttributes.push(oldAttribute);
		}
	}, this);
	this._newAttributes.forEach(function (newAttribute) {
		if(!gainedAndLostAttributes.some(function (gainedAndLostAttribute) {
			return gainedAndLostAttribute.name === newAttribute.name
		})) {
			gainedAndLostAttributes.push(newAttribute);
		}
	}, this);
	gainedAndLostAttributes.forEach(function (gainedAndLostAttribute) {
		var oldCount = this._oldAttributes.filter(function (oldAttribute) {
			return oldAttribute.name === gainedAndLostAttribute.name;
		}).length;
		var newCount = this._newAttributes.filter(function (newAttribute) {
			return newAttribute.name === gainedAndLostAttribute.name;
		}).length;
		var addCount = 0;
		if(newCount > oldCount) {
			while(addCount < newCount - oldCount) {
				this._gainedAttributes.push(gainedAndLostAttribute);
				addCount++;
			}
		} else if(oldCount > newCount) {
			while(addCount < oldCount - newCount) {
				this._lostAttributes.push(gainedAndLostAttribute);
				addCount++;
			}
		}
	}, this);
};

Window_StatusSkillLearned.prototype.isChangeInActions = function() {
	return this._learnedActions.length + this._forgottenActions.length > 0;
};

Window_StatusSkillLearned.prototype.isChangeInAttributes = function() {
	return this._gainedAttributes.length + this._lostAttributes.length > 0;
};

Window_StatusSkillLearned.prototype.setHandler = function(method) {
    this._inputHandler = method;
};

Window_StatusSkillLearned.prototype.isOkTriggered = function() {
    return Input.isRepeated('ok');
};

Window_StatusSkillLearned.prototype.isCancelTriggered = function() {
    return Input.isRepeated('cancel');
};

Window_StatusSkillLearned.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	if(this.active && (this.isOkTriggered() || this.isCancelTriggered())) {
		SoundManager.playCancel();
		Input.update();
		TouchInput.update();
        this.deactivate();
		if(this._inputHandler) {
			this._inputHandler();
		}
	}
};

Window_StatusSkillLearned.prototype.refresh = function() {
	this.move(Graphics.boxWidth / 2 - this.windowWidth() / 2,
		Graphics.boxHeight / 2 - this.windowHeight() / 2,
		this.windowWidth(), this.windowHeight());
	this.createContents();
	if(this.contents) {
		this.contents.clear();
		var iconBoxWidth = Window_Base._iconWidth;
		this.changePaintOpacity(true);
		var lineOffset = 0;
		if(this._learnedActions.length > 0) {
			this.changeTextColor(this.systemColor());
			this.drawText("Learned Actions:", this.textPadding(), lineOffset, 16*14);
			this.resetTextColor();
			lineOffset += this.lineHeight();
			this._learnedActions.forEach(function (learnedAction) {
				var iconIndex = this.iconIndexForAction(learnedAction);
				this.drawIcon(iconIndex, this.textPadding(), lineOffset);
				this.drawText(learnedAction.name, this.textPadding() * 2 + iconBoxWidth, lineOffset, learnedAction.name.length*14);
				lineOffset += this.lineHeight();
			}, this);
		}
		if(this._forgottenActions.length > 0) {
			this.changeTextColor(this.systemColor());
			this.drawText("Forgotten Actions:", this.textPadding(), lineOffset, 18*14);
			this.resetTextColor();
			lineOffset += this.lineHeight();
			this._forgottenActions.forEach(function (forgottenAction) {
				var iconIndex = this.iconIndexForAction(forgottenAction);
				this.drawIcon(iconIndex, this.textPadding(), lineOffset);
				this.drawText(forgottenAction.name, this.textPadding() * 2 + iconBoxWidth, lineOffset, forgottenAction.name.length*14);
				lineOffset += this.lineHeight();
			}, this);
		}
		if(this._gainedAttributes.length > 0) {
			this.changeTextColor(this.systemColor());
			this.drawText("Gained Attributes:", this.textPadding(), lineOffset, 18*14);
			this.resetTextColor();
			lineOffset += this.lineHeight();
			this._gainedAttributes.forEach(function (gainedAttribute) {
				this.drawText(gainedAttribute.name, this.textPadding(), lineOffset, gainedAttribute.name.length*14);
				lineOffset += this.lineHeight();
			}, this);
		}
		if(this._lostAttributes.length > 0) {
			this.changeTextColor(this.systemColor());
			this.drawText("Lost Attributes:", this.textPadding(), lineOffset, 16*14);
			this.resetTextColor();
			lineOffset += this.lineHeight();
			this._lostAttributes.forEach(function (lostAttribute) {
				this.drawText(lostAttribute.name, this.textPadding(), lineOffset, lostAttribute.name.length*14);
				lineOffset += this.lineHeight();
			}, this);
		}
	}
	this.resetTextColor();
};

//-----------------------------------------------------------------------------
// Window_StatusAttributesList
//
// The window for selecting an attribute on the status window

function Window_StatusAttributesList() {
    this.initialize.apply(this, arguments);
}

Window_StatusAttributesList.prototype = Object.create(Window_Selectable.prototype);
Window_StatusAttributesList.prototype.constructor = Window_StatusAttributesList;

Window_StatusAttributesList.prototype.initialize = function(y, height) {
    Window_Selectable.prototype.initialize.call(this, 0, y, this.windowWidth(), height);
	this._attributes = [];
	this._attributeLevels = [];
};

Window_StatusAttributesList.prototype.windowWidth = function() {
	return this.standardPadding()*2 + this.textPadding() + 14*20;
};

Window_StatusAttributesList.prototype.numVisibleRows = function() {
	return this.maxItems();
};

Window_StatusAttributesList.prototype.setAttributeDescriptionWindow = function(attributeDescriptionWindow) {
	if (this._attributeDescriptionWindow !== attributeDescriptionWindow) {
		this._attributeDescriptionWindow = attributeDescriptionWindow;
	}
};

Window_StatusAttributesList.prototype.setActor = function(actor) {
    if (this._actor !== actor) {
        this._actor = actor;
		this.refresh();
    }
};

Window_StatusAttributesList.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
	if(this._attributeDescriptionWindow) {
		var attribute = this.attribute();
		if(attribute) {
			this._attributeDescriptionWindow.setDescription(attribute.description);
		} else {
			this._attributeDescriptionWindow.setDescription("(No attributes.)");
		}
	}
};

Window_StatusAttributesList.prototype.attribute = function() {
	return this._attributes[this.index()];
};

Window_StatusAttributesList.prototype.refresh = function() {
	this.makeItemList();
    this.createContents();
	this.select(0);
    this.drawAllItems();
};

Window_StatusAttributesList.prototype.makeItemList = function() {
	if(!this._actor) { return; }
	var attributes = this._actor.getAttributes();
	this._attributes = [];
	this._attributeLevels = [];
	attributes.forEach(function (attribute) {
		var attributeFound = false;
		var i;
		for(i = 0; i < this._attributes.length; i++) {
			if(this._attributes[i].name === attribute.name) {
				this._attributeLevels[i]++;
				attributeFound = true;
				break;
			}
		}
		if(!attributeFound) {
			this._attributes.push(attribute);
			this._attributeLevels.push(1);
		}
	}, this);
};

Window_StatusAttributesList.prototype.maxItems = function() {
	return this._attributes ? this._attributes.length : 1;
};

Window_StatusAttributesList.prototype.drawItem = function(index) {
	var attribute = this._attributes[index];
	var rect = this.itemRect(index);
	var name = attribute.name;
	if(this._attributeLevels[index] > 1) {
		name = name + " " + this._attributeLevels[index];
	}
	this.drawText(name, rect.x + this.textPadding(), rect.y, rect.width - this.textPadding()*2);
};

Window_StatusAttributesList.prototype.processOk = function() {
    this.playBuzzerSound();
};

Window_StatusAttributesList.prototype.processPageup = function() {
    SoundManager.playCursor();
    this.updateInputData();
    this.callHandler('pageup');
};

Window_StatusAttributesList.prototype.processPagedown = function() {
    SoundManager.playCursor();
    this.updateInputData();
    this.callHandler('pagedown');
};

//-----------------------------------------------------------------------------
// Window_StatusAttributeDescription
//
// The window for displaying an attribute description 

function Window_StatusAttributeDescription() {
    this.initialize.apply(this, arguments);
}

Window_StatusAttributeDescription.prototype = Object.create(Window_Base.prototype);
Window_StatusAttributeDescription.prototype.constructor = Window_StatusAttributeDescription;

Window_StatusAttributeDescription.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.activate();
};

Window_StatusAttributeDescription.prototype.refresh = function() {
	this.contents.clear();
	if(this._description) {
		this.drawAttributeDescription();
	}
};

Window_StatusAttributeDescription.prototype.setDescription = function(description) {
	if (this._description !== description) {
		this._description = description;
		this.refresh();
	}
};

Window_StatusAttributeDescription.prototype.drawAttributeDescription = function() {
	if(this._description) {
		this.drawDescription(this._description);
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
		var width2 = Math.min(200, width - 180 - this.textPadding());
		this.drawActorNickname(actor, x, y);
		this.changePaintOpacity(false);
		if(actor.tbsBuffs().length > 0) {
			this.drawActorBuffs(actor, x, y+lineHeight);
		} else {
			this.drawActorClass(actor, x, y+lineHeight);
		}
		this.changePaintOpacity(true);
		this.drawActorSkillXP(actor, x, y+lineHeight*2, 14*11);
		//this.drawActorIcons(actor, x, y + lineHeight * 2);
		//this.drawActorStress(actor, x, y + lineHeight);
		this.drawActorSimpleDamage(actor, x+14*12, y);
		this.drawActorPartsDamage(actor, x+14*13, y+lineHeight, true);
	};
	
	Window_Base.prototype.drawActorSkillXP = function(actor, x, y, width) {
		this.changeTextColor(this.systemColor());
		this.drawText("SP", x, y, width);
		this.drawText("RP", x, y+this.lineHeight(), width);
		this.resetTextColor();
		this.drawText(actor.skillXP(), x, y, width, 'right');
		this.drawText(actor.respecXP(), x, y+this.lineHeight(), width, 'right');
	};
	
	Window_Base.prototype.healthMeterPipCount = function() {
		return 14;
	};
	
	Window_Base.prototype.statusMeterPipCount = function() {
		return 5;
	};
	
	Window_Base.prototype.drawActorDamage = function(actor, x, y) {
		if(actor.blankDummy()) { return; }
		this.drawActorPartDamage(actor, "core"    , x		, y							, "HP");
		//this.drawActorPartDamage(actor, "head"    , x		, y							, "He");
		//this.drawActorPartDamage(actor, "torso"   , x		, y + this.lineHeight()		, "To");
		//this.drawActorLimbDamage(actor, "leftArm" , x		, y + this.lineHeight()*2	, "Ar");
		//this.drawActorLimbDamage(actor, "rightArm", x+14*12	, y + this.lineHeight()*2);
		//this.drawActorLimbDamage(actor, "leftLeg" , x		, y + this.lineHeight()*3	, "Le");
		//this.drawActorLimbDamage(actor, "rightLeg", x+14*12	, y + this.lineHeight()*3);
	};
	
	Window_Base.prototype.drawActorSimpleDamage = function(actor, x, y) {
		this.drawActorSimplePartDamage(actor, "core"    , x		, y							, "HP");
		//this.drawActorSimplePartDamage(actor, "head"    , x		, y							, "He");
		//this.drawActorSimplePartDamage(actor, "torso"   , x		, y + this.lineHeight()		, "To");
		//this.drawActorSimpleLimbDamage(actor, "leftArm" , x		, y + this.lineHeight()*2	, "Ar");
		//this.drawActorSimpleLimbDamage(actor, "rightArm", x+14*8	, y + this.lineHeight()*2);
		//this.drawActorSimpleLimbDamage(actor, "leftLeg" , x		, y + this.lineHeight()*3	, "Le");
		//this.drawActorSimpleLimbDamage(actor, "rightLeg", x+14*8	, y + this.lineHeight()*3);
	};
	
	Window_Base.prototype.drawActorMentalDamage = function(actor, part, x, y, label) {
		this.changeTextColor(this.systemColor());
		this.drawText(label, x, y, 14*2);
		if(actor.getDamage(part) >= 100) {
			this.changeTextColor(this.deathColor());
		} else {
			this.resetTextColor();
			this.changePaintOpacity(false);
		}
		this.drawText(actor.getDamage(part) > 0 ? actor.getDamage(part) : "-", x + 14*2, y, 14*3, 'right');
		this.resetTextColor();
		this.changePaintOpacity(true);
	};
	
	Window_Base.prototype.drawActorBuffs = function(battler, x, y) {
		var iconHeight = Window_Base._iconHeight;
		var iconWidth = Window_Base._iconWidth;
		var buffs = battler.tbsBuffs();
		var curX = x;
		var curY = y;
		var i;
		for(i = 0; i < buffs.length; i++) {
			this.drawIcon(buffs[i].iconId, curX, curY);
			curX += iconWidth+this.iconSeparation();
		}
	};
	
	Window_Base.prototype.drawActorPartDamage = function(actor, part, x, y, label) {
		this.changeTextColor(this.systemColor());
		this.drawText(label, x, y, 14*2);
		this.drawText("/", x+14*4, y, 14);
		var brackets = "[";
		var i;
		for(i = 0; i < this.healthMeterPipCount(); i++) {
			brackets += " ";
		}
		brackets += "]";
		this.drawText(brackets, x+14*7, y, brackets.length*14);
		var health = actor.toughness()*(part==="core"||part==="torso"?2:1) - actor.getDamage(part);
		this.resetTextColor();
		if(health <= 0) {
			this.changeTextColor(this.deathColor());
		}
		this.drawText(health, x + 14*2, y, 14*2, 'right');
		this.drawText(actor.toughness()*(part==="core"||part==="torso"?2:1), x + 14*5, y, 14*2, 'right');
		var pips = (health / (actor.toughness()*(part==="core"||part==="torso"?2:1))) * this.healthMeterPipCount();
		for(i = 0; i < pips; i++) {
			var width = 14;
			if(pips - i > 0 && pips - i < 1) {
				width *= pips - i;
			}
			this.drawText("=", x+14*(8+i), y, width);
		}
		this.resetTextColor();
	};
	
	Window_Base.prototype.drawActorLimbDamage = function(actor, part, x, y, label) {
		this.changeTextColor(this.systemColor());
		if(label) {
			this.drawText(label, x, y, 14*2);
		} else {
			x -= 14*2;
		}
		this.drawText("[     ]", x+14*5, y, 14*7);
		var health = actor.toughness()*(part==="core"||part==="torso"?2:1) - actor.getDamage(part);
		this.resetTextColor();
		if(health <= 0) {
			this.changeTextColor(this.deathColor());
		}
		this.drawText(health, x + 14*2, y, 14*3, 'right');
		var pips = (health / (actor.toughness()*(part==="core"||part==="torso"?2:1))) * 5;
		var i;
		for(i = 0; i < pips; i++) {
			var width = 14;
			if(pips - i > 0 && pips - i < 1) {
				width *= pips - i;
			}
			this.drawText("=", x+14*(6+i), y, width);
		}
		this.resetTextColor();
	};
	
	Window_Base.prototype.drawActorSimplePartDamage = function(actor, part, x, y, label) {
		this.changeTextColor(this.systemColor());
		this.drawText(label, x, y, 14*2);
		this.drawText("/", x+14*4, y, 14);
		var health = actor.toughness()*(part==="core"||part==="torso"?2:1) - actor.getDamage(part);
		this.resetTextColor();
		if(health <= 0) {
			this.changeTextColor(this.deathColor());
		}
		this.drawText(health, x + 14*2, y, 14*2, 'right');
		this.drawText(actor.toughness()*(part==="core"||part==="torso"?2:1), x + 14*5, y, 14*2, 'right');
		this.resetTextColor();
	};
	
	Window_Base.prototype.drawActorSimpleLimbDamage = function(actor, part, x, y, label) {
		if(label) {
			this.changeTextColor(this.systemColor());
			this.drawText(label, x, y, 14*2);
		} else {
			x -= 14*2;
		}
		var health = actor.toughness()*(part==="core"||part==="torso"?2:1) - actor.getDamage(part);
		this.resetTextColor();
		if(health <= 0) {
			this.changeTextColor(this.deathColor());
		}
		this.drawText(health, x + 14*3, y, 14*3, 'right');
		this.resetTextColor();
	};
	
	Window_Base.prototype.drawActorPartsDamage = function(actor, x, y, multipleLines) {
		if(actor.blankDummy()) { return; }
		var curX = x;
		var tough = actor.toughness();
		if(actor.getDamage("head") > 0) {
			this.resetTextColor();
			this.changePaintOpacity(false);
			if(actor.getDamage("head") >= tough/2) {
				this.changePaintOpacity(true);
				this.changeTextColor(this.crisisColor());
				if(actor.getDamage("head") >= tough) {
					this.changeTextColor(this.deathColor());
				}
			}
			this.drawText("He", curX, y, 14*2);
		}
		curX += 14*3;
		if(actor.getDamage("torso") > 0) {
			this.resetTextColor();
			this.changePaintOpacity(false);
			if(actor.getDamage("torso") >= tough) {
				this.changePaintOpacity(true);
				this.changeTextColor(this.crisisColor());
				if(actor.getDamage("torso") >= tough*2) {
					this.changeTextColor(this.deathColor());
				}
			}
			this.drawText("To", curX, y, 14*2);
		}
		curX += 14*3;
		if(multipleLines) { curX = x; y += this.lineHeight(); }
		if(actor.getDamage("leftArm") > 0) {
			this.resetTextColor();
			this.changePaintOpacity(false);
			if(actor.getDamage("leftArm") >= tough/2) {
				this.changePaintOpacity(true);
				this.changeTextColor(this.crisisColor());
				if(actor.getDamage("leftArm") >= tough) {
					this.changeTextColor(this.deathColor());
				}
			}
			this.drawText("LA", curX, y, 14*2);
		}
		curX += 14*3;
		if(actor.getDamage("rightArm") > 0) {
			this.resetTextColor();
			this.changePaintOpacity(false);
			if(actor.getDamage("rightArm") >= tough/2) {
				this.changePaintOpacity(true);
				this.changeTextColor(this.crisisColor());
				if(actor.getDamage("rightArm") >= tough) {
					this.changeTextColor(this.deathColor());
				}
			}
			this.drawText("RA", curX, y, 14*2);
		}
		curX += 14*3;
		if(multipleLines) { curX = x; y += this.lineHeight(); }
		if(actor.getDamage("leftLeg") > 0) {
			this.resetTextColor();
			this.changePaintOpacity(false);
			if(actor.getDamage("leftLeg") >= tough/2) {
				this.changePaintOpacity(true);
				this.changeTextColor(this.crisisColor());
				if(actor.getDamage("leftLeg") >= tough) {
					this.changeTextColor(this.deathColor());
				}
			}
			this.drawText("LL", curX, y, 14*2);
		}
		curX += 14*3;
		if(actor.getDamage("rightLeg") > 0) {
			this.resetTextColor();
			this.changePaintOpacity(false);
			if(actor.getDamage("rightLeg") >= tough/2) {
				this.changePaintOpacity(true);
				this.changeTextColor(this.crisisColor());
				if(actor.getDamage("rightLeg") >= tough) {
					this.changeTextColor(this.deathColor());
				}
			}
			this.drawText("RL", curX, y, 14*2);
		}
		this.changePaintOpacity(true);
		this.resetTextColor();
	};
	
	Window_Base.prototype.drawActorStress = function(actor, x, y) {
		if(actor.blankDummy()) { return; }
		this.changeTextColor(this.systemColor());
		this.drawText("St", x, y, 14*2);
		var brackets = "[";
		var i;
		for(i = 0; i < this.statusMeterPipCount(); i++) {
			brackets += " ";
		}
		brackets += "]";
		this.drawText(brackets, x+14*4, y, brackets.length*14);
		this.changeTextColor(this.crisisColor());
		var stress = actor.stress();
		this.drawText(stress, x + 14*2, y, 14*2, 'right');
		var pips = (stress / 10) * this.statusMeterPipCount();
		for(i = 0; i < pips; i++) {
			var width = 14;
			if(pips - i > 0 && pips - i < 1) {
				width *= pips - i;
			}
			this.drawText("=", x+14*(5+i), y, width);
		}
		this.resetTextColor();
	};
	
	Window_Base.prototype.drawActorRoundBuffs = function(actor, x, y) {
		if(actor.blankDummy()) { return; }
		this.changeTextColor(this.systemColor());
		this.drawText("Fo", x, y, 14*2);
		var brackets = "[";
		var i;
		for(i = 0; i < this.statusMeterPipCount(); i++) {
			brackets += " ";
		}
		brackets += "]";
		this.drawText(brackets, x+14*4, y, brackets.length*14);
		this.changeTextColor(this.textColor(27));
		var roundBuffs = actor.roundBuffs();
		this.drawText(roundBuffs, x + 14*2, y, 14*2, 'right');
		var pips = (roundBuffs / 10) * this.statusMeterPipCount();
		for(i = 0; i < pips; i++) {
			var width = 14;
			if(pips - i > 0 && pips - i < 1) {
				width *= pips - i;
			}
			this.drawText("=", x+14*(5+i), y, width);
		}
		this.resetTextColor();
	};
	
	Window_Base.prototype.drawActionSkillRequirements = function(action, actionIndex, lineOffset, drawName, actor) {
		if(!action) { return 0; }
		if(actionIndex === undefined) { actionIndex = 0; }
		if(lineOffset === undefined) { lineOffset = 0; }
		
		var nameOffset = drawName ? this.nameOffset() : 0;
		var skillsPosition = nameOffset + 175;
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
			this.drawText(this.getShortDisplayNameForUniqueSkill(reqs[i].skill), nameOffset, lineHeight, 400);
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
	
	Window_Base.prototype.nameOffset = function() {
		return 308;
	};
	
	Window_Base.prototype.drawActionInfo = function(actionInfo, actionIndex, lineOffset, drawName, actor) {
		if(!actionInfo || !actionInfo.action) { return 0; }
		if(actionIndex === undefined) { actionIndex = 0; }
		if(lineOffset === undefined) { lineOffset = 0; }
		
		var action = actionInfo.action;
		var nameOffset = drawName ? this.nameOffset() : 0;
		var curLineOffset = lineOffset;
		var hitGroups = action.hitGroups;
		var reqLacked = false;
		if(!hitGroups) { return 0; }
		for(let n = 0; n < hitGroups.length; n++) {
			var hits = hitGroups[n].hits;
			if(!hits) { continue; }
			for(let i = 0; i < hits.length; i++) {
				var lineHeight = this.lineHeight() * (actionIndex + n + 1 + curLineOffset);
				
				var rangeTypeIconId = hits[i].rangeType ? this.getIconIdFor(hits[i].rangeType) : 0;
				var rangeIsSelf = hits[i].rangeType && hits[i].rangeType === "self";
				this.drawIcon(rangeTypeIconId, nameOffset + Window_Base._iconWidth + 14*3, lineHeight);
				var hitRange = hits[i].range !== undefined ? hits[i].range : 0;
				hitRange += hits[i].ignoreUserRange || !actor ? 0 : actor.baseRange();
				var range = hitRange / 2;
				var flooredRange = Math.floor(range);
				this.drawText(!rangeIsSelf && range > 0 ? flooredRange + (range > flooredRange ? "½" : "") : "-", nameOffset + Window_Base._iconWidth*2 + 14*3, lineHeight, 14*2, 'right');
				var accuracy = hits[i].evasionPenalty !== undefined ? hits[i].evasionPenalty : 0;
				accuracy += hits[i].accuracy !== undefined ? hits[i].accuracy : 0;
				accuracy -= hits[i].accuracyPenalty !== undefined ? hits[i].accuracyPenalty : 0;
				this.drawText((hits[i].damage || hits[i].debuffs) && accuracy > 0 ? accuracy : "-", nameOffset + Window_Base._iconWidth*2 + 14*9, lineHeight, 14*2, 'right');
				var hitAoe = hits[i].aoe !== undefined ? hits[i].aoe : 0;
				var aoe = hitAoe / 2;
				var flooredAoe = Math.floor(aoe);
				this.drawText(aoe > 0 ? flooredAoe + (aoe > flooredAoe ? "½" : "") : "-", nameOffset + Window_Base._iconWidth*2 + 14*6, lineHeight, 14*2, 'right');
				
				if(i === 0 && n === 0) {
					if(actor) {
						var reqs = action.skillRequirements;
						if(reqs && reqs.length > 0) {
							var j;
							for(j = 0; j < reqs.length; j++) {
								if(reqs[j].level > actor.totalSkill(reqs[j].skill)) {
									reqLacked = true;
									break;
								}
							}
						}
					}
					
					if(drawName) {
						if(reqLacked) {
							this.changeTextColor(this.deathColor());
						}
						this.drawText(action.name, 0, lineHeight, 18*14);
						this.resetTextColor();
					}
				} else {
					if (drawName) {
						if(reqLacked) {
							this.changeTextColor(this.deathColor());
						}
						if(i === 0) {
							var groupText = n + "th";
							if(n == 0) { groupText = "1st"; }
							else if(n == 1) { groupText = "2nd"; }
							else if(n == 2) { groupText = "3rd"; }
							this.drawText(": " + groupText, 0, lineHeight);
						} else {
							this.drawText(":", 0, lineHeight);
						}
						this.resetTextColor();
					}
				}
				
				var damageLineOffset = 0;
				var damage = hits[i].damage;
				var heal = hits[i].heal;
				var buffs = hits[i].buffs;
				var focusAmount = hits[i].focus;
				if(damage == undefined && heal == undefined && buffs == undefined && focusAmount == undefined) {
					this.drawText("-", nameOffset + Window_Base._iconWidth, lineHeight, 14*2, 'right');
					this.drawText("-", nameOffset + Window_Base._iconWidth, lineHeight, 14*2, 'right');
				} else {
					var multipleHits = 1;
					if(hits[i].multipleHits !== undefined) {
						multipleHits = hits[i].multipleHits;
					}
					if(damage !== undefined) {
						var hitDamage = BattleManager.getCompleteDamage(actor, actionInfo, hits[i]);
						
						damageLineOffset += this.drawDamageForType(hitDamage.trip*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("trip"));
						damageLineOffset += this.drawDamageForType(hitDamage.blunt*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("blunt"));
						damageLineOffset += this.drawDamageForType(hitDamage.cut*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("cut"));
						damageLineOffset += this.drawDamageForType(hitDamage.keen*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("keen"));
						damageLineOffset += this.drawDamageForType(hitDamage.thrust*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("thrust"));
						damageLineOffset += this.drawDamageForType(hitDamage.stiletto*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("stiletto"));
						damageLineOffset += this.drawDamageForType(hitDamage.bullet*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("bullet"));
						damageLineOffset += this.drawDamageForType(hitDamage.frag*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("frag"));
						damageLineOffset += this.drawDamageForType(hitDamage.fire*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("fire"));
						damageLineOffset += this.drawDamageForType(hitDamage.ice*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("ice"));
						damageLineOffset += this.drawDamageForType(hitDamage.corrosion*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("corrosion"));
						damageLineOffset += this.drawDamageForType(hitDamage.lightning*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("conducted"));
						//damageLineOffset += this.drawDamage(hitDamage.psychic*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("psychic")) ? 1 : 0;
					}
					if(heal !== undefined) {
						damageLineOffset += this.drawHeal(heal.stress*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("healStress")) ? 1 : 0;
						damageLineOffset += this.drawHeal(heal.damage*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("healBody")) ? 1 : 0;
					}
					if(focusAmount !== undefined) {
						damageLineOffset += this.drawHeal(focusAmount*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("focus")) ? 1 : 0;
					}
					if(buffs !== undefined) {
						var j;
						for(j = 0; j < buffs.length; j++) {
							var prot = buffs[j].protection;
							if(prot) {
								var fullBody = prot.fullBody;
								if(fullBody && fullBody.defense) {
									var defense = fullBody.defense;
									damageLineOffset += this.drawHeal(defense.solid*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("solidDefense")) ? 1 : 0;
									damageLineOffset += this.drawHeal(defense.fluid*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("fluidDefense")) ? 1 : 0;
								}
								var mental = prot.mental;
								if(mental) {
									//damageLineOffset += this.drawHeal(mental.defense*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("mentalDefense")) ? 1 : 0;
								}
							}
							var core = buffs[j].core;
							if(core) {
								damageLineOffset += this.drawHeal(core.physEvade*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("solidDefense")) ? 1 : 0;
								damageLineOffset += this.drawHeal(core.tripEvade*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("tripEvade")) ? 1 : 0;
								//damageLineOffset += this.drawHeal(core.mentalEvade*multipleHits, drawName, nameOffset, lineHeight, damageLineOffset, reqLacked, this.getIconIdFor("mentalDefense")) ? 1 : 0;
							}
						}
					}
				}
				curLineOffset += Math.max(0, damageLineOffset);
			}
		}
		
		return Math.max(0, curLineOffset - lineOffset - 1);
	};
	
	Window_Base.prototype.drawDamageForType = function(damage, drawName, nameOffset, lineHeight, lineOffset, reqLacked, iconId) {
		var lineCount = 0;
		lineCount += this.drawDamage(damage, drawName, nameOffset, lineHeight, lineOffset + lineCount, reqLacked, iconId) ? 1 : 0;
		return lineCount;
	};
	
	Window_Base.prototype.drawDamage = function(power, drawName, nameOffset, lineHeight, lineOffset, reqLacked, iconId) {
		if(power !== undefined && !isNaN(power)) {
			this.drawIcon(iconId, nameOffset, lineHeight + this.lineHeight() * lineOffset);
			this.drawText(power, nameOffset + Window_Base._iconWidth, lineHeight + this.lineHeight() * lineOffset, 14*2, 'right');
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
		if(heal !== undefined && !isNaN(heal)) {
			this.drawIcon(iconId, nameOffset, lineHeight + this.lineHeight() * lineOffset);
			var power = heal !== undefined ? heal : 0;
			this.drawText(power > 0 ? (power >= 100 ? "**" : power) : "-", nameOffset + Window_Base._iconWidth, lineHeight + this.lineHeight() * lineOffset, 14*2, 'right');
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
		var i;
		for(i = 0; i < $dataClasses.length; i++) {
			if(!$dataClasses[i]) { continue; }
			if($dataClasses[i].name === "UNIVERSAL DEFINITIONS") {
				var allUniqeSkills = $dataClasses[i].tbsStats.uniqueSkills;
				if(!allUniqeSkills) { break; }
				var j;
				for(j = 0; j < allUniqeSkills.length; j++) {
					if(allUniqeSkills[j].name === skill && allUniqeSkills[j].displayName) {
						return allUniqeSkills[j].displayName;
					}
				}
				break;
			}
		}
		return "UNKNOWN NAME";
	};
	
	Window_Base.prototype.getShortDisplayNameForUniqueSkill = function(skill)
	{
		var i;
		for(i = 0; i < $dataClasses.length; i++) {
			if(!$dataClasses[i]) { continue; }
			if($dataClasses[i].name === "UNIVERSAL DEFINITIONS") {
				var allUniqeSkills = $dataClasses[i].tbsStats.uniqueSkills;
				if(!allUniqeSkills) { break; }
				var j;
				for(j = 0; j < allUniqeSkills.length; j++) {
					if(allUniqeSkills[j].name === skill && allUniqeSkills[j].shortDisplayName) {
						return allUniqeSkills[j].shortDisplayName;
					}
				}
				break;
			}
		}
		return "UNKNOWN NAME";
	};
	
	Window_Base.prototype.getIconIdFor = function(type) {
		switch(type) {
			case "solidDefense":   	return  81; break;
			case "fluidDefense":   	return  67; break;
			case "tripEvade":   	return  82; break;
			case "mentalDefense":	return 302; break;
			
			case "trip":          	return   6; break;
			case "blunt":          	return 110; break;
			case "cut":            	return  99; break;
			case "keen":            return 120; break;
			case "thrust":        	return 107; break;
			case "stiletto":        return  96; break;
			case "bullet":         	return 115; break;
			case "frag":        	return 115; break;
			case "fire":           	return  64; break;
			case "ice":            	return  65; break;
			case "corrosion":      	return   2; break;
			case "conducted":		return  66; break;
			case "psychic":        	return  71; break;
			
			case "healStress":     	return  70; break;
			case "healBody":       	return  72; break;
			case "healMind":       	return  72; break;
			
			case "focus":			return	80; break;
			
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
		
		var lineWidth = Math.floor((this.width - this.standardPadding()*2 - this.textPadding()*2) / 14);
		var descWords = description.split(" ");
		var i;
		var descLine = "";
		var descLineNum = 0;
		for(i = 0; i < descWords.length ; i++) {
			if(descLine.length + descWords[i].length + (descLine.length > 0 ? 1 : 0) > lineWidth) {
				this.drawText(descLine, this.textPadding(), this.lineHeight() * descLineNum);
				descLineNum++;
				descLine = "";
			}
			
			if(descLine.length > 0) {
				descLine += " ";
			}
			descLine += descWords[i];
		}
		
		if(descLine.length > 0) {
			this.drawText(descLine, this.textPadding(), this.lineHeight() * descLineNum);
		}
	};
	
	Window_Base.prototype.iconIndexForAction = function(action) {
		if(action.menuIcon !== undefined) { return action.menuIcon; }
		return 79;
	};
	
	//menu command
	Window_MenuCommand.prototype.addMainCommands = function() {
		var enabled = this.areMainCommandsEnabled();
		if (this.needsCommand('item')) {
			this.addCommand('Inventory', 'item', enabled);
		}
		if (this.needsCommand('skill')) {
			this.addCommand(TextManager.skill, 'skill', enabled);
		}
		if (this.needsCommand('equip')) {
			this.addCommand(TextManager.equip, 'equip', enabled);
		}
		if (this.needsCommand('status')) {
			this.addCommand(TextManager.status, 'status', enabled);
		}
	};
	
	//menu status
	Window_MenuStatus.prototype.drawItemStatus = function(index) {
		var actor = $gameParty.members()[index];
		var rect = this.itemRect(index);
		var x = rect.x + 162;
		var y = rect.y;
		var width = rect.width - x - this.textPadding();
		this.drawActorSimpleStatus(actor, x, y, width);
	};
	
	Window_MenuStatus.prototype.selectLast = function() {
		this.select(0);
	};
	
	//menu actor
	Window_MenuActor.prototype.initialize = function() {
		Window_MenuStatus.prototype.initialize.call(this, 0, 0);
		this._displayMode = false;
		this.hide();
	};
	
	Window_MenuActor.prototype.processOk = function() {
        this.updateInputData();
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
        this.select(0);
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
		return action && action.hitGroups && action.hitGroups.length > 0 &&
			action.hitGroups.some(function(hitGroup) { return hitGroup.hits && hitGroup.hits.length > 0
			&& hitGroup.hits.some(function(hit) { return hit.heal && hit.heal.damage !== undefined && hit.heal.damage > 0 });
		});
	};
	
	Window_Selectable.prototype.drawOrgSelectBrackets = function(x, y, width) {
		this.changeTextColor(this.crisisColor());
		this.drawText('__________________________', x, y, width);
		this.resetTextColor();
	};
	
	//item category
	Window_ItemCategory.prototype.initialize = function() {
		Window_HorzCommand.prototype.initialize.call(this, 0, 0);
		this._actorItemWindows = [];
		this._descriptionWindow = undefined;
	};
	
	Window_ItemCategory.prototype.maxCols = function() {
		return 3;
	};
	
	Window_ItemCategory.prototype.setActorItemWindows = function(itemWindows) {
		if(this._actorItemWindows != itemWindows) {
			this._actorItemWindows = itemWindows;
			this.refresh();
		}
	};
	
	Window_ItemCategory.prototype.update = function() {
		Window_HorzCommand.prototype.update.call(this);
		if (this._itemWindow) {
			this._itemWindow.setCategory('stash');
		}
		this._actorItemWindows.forEach(function (itemWindow) {
			itemWindow.setCategory('organize');
		});
		switch(this.index()) {
			case 0:
				this._actorItemWindows.forEach(function (itemWindow) {
					itemWindow.hideOrShow();
				});
				if(this._itemWindow) {
					this._itemWindow.hide();
				}
				break;
			case 1:
				this._actorItemWindows.forEach(function (itemWindow) {
					itemWindow.hide();
				});
				if(this._itemWindow) {
					this._itemWindow.setCategory('stash');
					this._itemWindow.show();
				}
				break;
			case 2:
				this._actorItemWindows.forEach(function (itemWindow) {
					itemWindow.hide();
				});
				if(this._itemWindow) {
					this._itemWindow.setCategory('keyItems');
					this._itemWindow.show();
				}
				break;
		}
	};
	
	Window_ItemCategory.prototype.makeCommandList = function() {
		this.addCommand("Party",    'organize');
		this.addCommand("Stash", 'stash', $gameSystem.isSaveEnabled());
		this.addCommand("Key Items",    'keyItems');
	};
	
	//item list
	Window_ItemList.prototype.initialize = function(x, y, width, height) {
		Window_Selectable.prototype.initialize.call(this, x, y, width, height);
		this._category = 'none';
		this._data = [];
		this._statusWindow = undefined;
		this._actor = undefined
		this._previousWindow = undefined;
		this._nextWindow = undefined;
		this._orgSelectIndex = -1;
		this._nameWindowYOffset = Math.floor(this.lineHeight() * 1.6);
		this._yStartPosition = 0;
	};
	
	Window_ItemList.prototype.windowHeight = function() {
		return this.fittingHeight(Math.floor(Game_BattlerBase.prototype.maxItems()/2));
	};
	
	Window_ItemList.prototype.maxItems = function() {
		return this._actor ? this._actor.maxItems() : this._data ? this._data.length : 1;
	};
	
	Window_ItemList.prototype.hideOrShow = function() {
		if(this.y - this._nameWindowYOffset < this._yStartPosition) {
			this.hide();
		} else {
			this.show();
		}
	};
	
	Window_ItemList.prototype.show = function() {
		this.visible = true;
		if(this._actorNameWindow) {
			this._actorNameWindow.show();
		}
	};

	Window_ItemList.prototype.hide = function() {
		this.visible = false;
		if(this._actorNameWindow) {
			this._actorNameWindow.hide();
		}
	};
	
	Window_ItemList.prototype.item = function() {
		var index = this.index();
		if(this._actor) {
			return index >= 0 ? this._actor.allItems()[index] : null;
		} else {
			return this._data && index >= 0 ? this._data[index] : null;
		}
	};
	
	Window_ItemList.prototype.isCurrentItemEnabled = function() {
		return this.isEnabled(this.item());
	};
	
	Window_ItemList.prototype.needsNumber = function() {
		return !this._actor;
	};
	
	Window_ItemList.prototype.isEnabled = function(item) {
		return this._actor || item.itypeId === 2 || $gameSystem.isSaveEnabled();
	};
	
	Window_ItemList.prototype.makeItemList = function() {
		this._data = [];
		if(this._actor) {
			this._actor.allItems().forEach(function(actorItem) {
				var item = null;
				if(actorItem.type === "item") {
					item = $dataItems[actorItem.id];
				} else if(actorItem.type === "weapon") {
					item = $dataWeapons[actorItem.id];
				} else if(actorItem.type === "armor") {
					item = $dataArmors[actorItem.id];
				}
				this._data.push(item);
			}, this);
		} else {
			$gameParty.allItems().forEach(function(item) {
				if((this._category === "stash" && ((DataManager.isItem(item) && item.itypeId === 1) || DataManager.isWeapon(item) || DataManager.isArmor(item)))
					|| (this._category === "keyItems" && DataManager.isItem(item) && item.itypeId === 2))
				{
					this._data.push(item);
				}
			}, this);
		}
	};
	
	Window_ItemList.prototype.deactivate = function() {
		Window_Selectable.prototype.deactivate.call(this);
	};
	
	Window_ItemList.prototype.update = function() {
		Window_Selectable.prototype.update.call(this);
		if(this._statusWindow && this._itemOptionsWindow && this.isOpenAndActive()) {
			if(this.item()) {
				if(this._actor) {
					var item = null;
					var actorItem = this.item();
					if(actorItem.type === "item") {
						item = $dataItems[actorItem.id];
					} else if(actorItem.type === "weapon") {
						item = $dataWeapons[actorItem.id];
					} else if(actorItem.type === "armor") {
						item = $dataArmors[actorItem.id];
					}
					this._statusWindow.setActionsItem(item);
					if(item) {
						if(actorItem.type === "item") {
							this._statusWindow.showActions();
						} else if(actorItem.type === "weapon") {
							this._statusWindow.showActions();
						} else if(actorItem.type === "armor") {
							this._statusWindow.showProtection();
						}
					} else {
						this._statusWindow.showNone();
					}
					this._itemOptionsWindow.setActor(this._actor);
					this._itemOptionsWindow.setItem(item);
					this._itemOptionsWindow.setItemIndex(this.index());
				} else {
					this._statusWindow.setActionsItem(this.item());
					if(DataManager.isItem(this.item())) {
						if(this.item().itypeId === 1) {
							this._statusWindow.showActions();
						} else {
							this._statusWindow.showDescription();
						}
					} else if(DataManager.isWeapon(this.item())) {
						this._statusWindow.showActions();
					} else if(DataManager.isArmor(this.item())) {
						this._statusWindow.showProtection();
					} else {
						this._statusWindow.showNone();
					}
					this._itemOptionsWindow.setActor(null);
					this._itemOptionsWindow.setItem(this.item());
					this._itemOptionsWindow.setItemIndex(this.index());
				}
			} else {
				this._statusWindow.setActionsItem(null);
				this._statusWindow.showNone();
				this._itemOptionsWindow.setActor(null);
				this._itemOptionsWindow.setItem(null);
				this._itemOptionsWindow.setItemIndex(undefined);
			}
		}
	};
	
	Window_ItemList.prototype.drawItem = function(index) {
		var item = this._data[index];
		var rect = this.itemRect(index);
		if (item) {
			var numberWidth = this.numberWidth();
			this.changePaintOpacity(this.isEnabled(item));
			this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth - this.textPadding());
			this.drawItemNumber(item, rect.x, rect.y, rect.width - this.textPadding());
			this.changePaintOpacity(1);
		}
		if(this._orgSelectIndex >= 0 && this._orgSelectIndex == index) {
			this.drawOrgSelectBrackets(rect.x, rect.y, rect.width);
		}
	};

	Window_ItemList.prototype.setActor = function(actor) {
		if (this._actor !== actor) {
			this._actor = actor;
			this.refresh();
		}
	};
	
	Window_ItemList.prototype.setPreviousWindow = function(previousWindow) {
		if (this._previousWindow !== previousWindow) {
			this._previousWindow = previousWindow;
			this.refresh();
		}
	};
	
	Window_ItemList.prototype.setNextWindow = function(nextWindow) {
		if (this._nextWindow !== nextWindow) {
			this._nextWindow = nextWindow;
			this.refresh();
		}
	};
	
	Window_ItemList.prototype.setActorNameWindow = function(actorNameWindow) {
		if (this._actorNameWindow !== actorNameWindow) {
			this._actorNameWindow = actorNameWindow;
			this.refresh();
		}
	}
	
	Window_ItemList.prototype.setItemOptionsWindow = function(itemOptionsWindow) {
		if (this._itemOptionsWindow !== itemOptionsWindow) {
			this._itemOptionsWindow = itemOptionsWindow;
			this.update();
		}
	}
	
	Window_ItemList.prototype.setStatusWindow = function(statusWindow) {
		if (this._statusWindow !== statusWindow) {
			this._statusWindow = statusWindow;
			this.update();
		}
	}
	
	Window_ItemList.prototype.setNameWindowYOffset = function(offset) {
		if (this._nameWindowYOffset !== offset) {
			this._nameWindowYOffset = offset;
			this.refresh();
		}
	}
	
	Window_ItemList.prototype.setYStartPosition = function(position) {
		if (this._yStartPosition !== position) {
			this._yStartPosition = position;
			this.refresh();
		}
	}
	
	Window_ItemList.prototype.previousWindow = function() {
		return this._previousWindow;
	};
	
	Window_ItemList.prototype.nextWindow = function() {
		return this._nextWindow;
	};
	
	Window_ItemList.prototype.orgSelectIndex = function() {
		return this._orgSelectIndex;
	};
	
	Window_ItemList.prototype.clearOrgSelect = function() {
		this._orgSelectIndex = -1;
	};
	
	Window_ItemList.prototype.actor = function() {
		return this._actor;
	};
	
	Window_ItemList.prototype.getOrgSelectInfo = function() {
		var returnObj = {};
		returnObj.orgSelectIndex = this._orgSelectIndex;
		returnObj.window = this;
		if(this._orgSelectIndex >= 0) { return returnObj; }
		var prevWindow = this._previousWindow;
		while(prevWindow) {
			if(prevWindow.orgSelectIndex() >= 0) {
				returnObj.orgSelectIndex = prevWindow.orgSelectIndex();
				returnObj.window = prevWindow;
				return returnObj;
			}
			prevWindow = prevWindow.previousWindow();
		}
		var nextWindow = this._nextWindow;
		while(nextWindow) {
			if(nextWindow.orgSelectIndex() >= 0) {
				returnObj.orgSelectIndex = nextWindow.orgSelectIndex();
				returnObj.window = nextWindow;
				return returnObj;
			}
			nextWindow = nextWindow.nextWindow();
		}
		return returnObj;
	};
	
	Window_ItemList.prototype.isOrgSelected = function() {
		return this.getOrgSelectInfo().orgSelectIndex >= 0;
	};
	
	Window_ItemList.prototype.moveUp = function() {
		this.move(this.x, this.y - this.height - this._nameWindowYOffset, this.width, this.height);
		this._actorNameWindow.move(this._actorNameWindow.x,
			this._actorNameWindow.y - this.height - this._nameWindowYOffset,
			this._actorNameWindow.width, this._actorNameWindow.height);
		this.hideOrShow();
		this.refresh();
	};
	
	Window_ItemList.prototype.moveDown = function() {
		this.move(this.x, this.y + this.height + this._nameWindowYOffset, this.width, this.height);
		this._actorNameWindow.move(this._actorNameWindow.x,
			this._actorNameWindow.y + this.height + this._nameWindowYOffset,
			this._actorNameWindow.width, this._actorNameWindow.height);
		this.hideOrShow();
		this.refresh();
	};
	
	Window_ItemList.prototype.moveWindowsUp = function() {
		this.moveUp();
		var prevWindow = this._previousWindow;
		while(prevWindow) {
			prevWindow.moveUp();
			prevWindow = prevWindow.previousWindow();
		}
		var nextWindow = this._nextWindow;
		while(nextWindow) {
			nextWindow.moveUp();
			nextWindow = nextWindow.nextWindow();
		}
	};
	
	Window_ItemList.prototype.moveWindowsDown = function() {
		this.moveDown();
		var prevWindow = this._previousWindow;
		while(prevWindow) {
			prevWindow.moveDown();
			prevWindow = prevWindow.previousWindow();
		}
		var nextWindow = this._nextWindow;
		while(nextWindow) {
			nextWindow.moveDown();
			nextWindow = nextWindow.nextWindow();
		}
	};
	
	Window_ItemList.prototype.cursorDown = function(wrap) {
		var index = this.index();
		var maxItems = this.maxItems();
		var maxCols = this.maxCols();
		if (index < maxItems - maxCols || (wrap && maxCols === 1)) {
			this.select((index + maxCols) % maxItems);
		}
		if(index == this.index() && this._nextWindow) {
			this.deactivate();
			this.deselect();
			this._nextWindow.activate();
			this._nextWindow.select(((index + maxCols) % maxItems) - maxCols);
			if(this._nextWindow.y + this._nextWindow.height > Graphics.boxHeight) {
				this.moveWindowsUp();
			}
		}
	};

	Window_ItemList.prototype.cursorUp = function(wrap) {
		var index = this.index();
		var maxItems = this.maxItems();
		var maxCols = this.maxCols();
		if (index >= maxCols || (wrap && maxCols === 1)) {
			this.select((index - maxCols + maxItems) % maxItems);
		}
		if(index == this.index() && this._previousWindow) {
			this.deactivate();
			this.deselect();
			this._previousWindow.activate();
			this._previousWindow.select((index - maxCols + maxItems) % maxItems);
			if(this._previousWindow.y - this._nameWindowYOffset < this._yStartPosition) {
				this.moveWindowsDown();
			}
		}
	};

	Window_ItemList.prototype.cursorRight = function(wrap) {
		var index = this.index();
		var maxItems = this.maxItems();
		var maxCols = this.maxCols();
		if (maxCols >= 2 && (index < maxItems - 1 || (wrap && this.isHorizontal()))) {
			this.select((index + 1) % maxItems);
		}
		if(index == this.index() && this._nextWindow) {
			this.deactivate();
			this.deselect();
			this._nextWindow.activate();
			this._nextWindow.select(-1);
			if(this._nextWindow.y + this._nextWindow.height > Graphics.boxHeight) {
				this.moveWindowsUp();
			}
		}
	};

	Window_ItemList.prototype.cursorLeft = function(wrap) {
		var index = this.index();
		var maxItems = this.maxItems();
		var maxCols = this.maxCols();
		if (maxCols >= 2 && (index > 0 || (wrap && this.isHorizontal()))) {
			this.select((index - 1 + maxItems) % maxItems);
		}
		if(index == this.index() && this._previousWindow) {
			this.deactivate();
			this.deselect();
			this._previousWindow.activate();
			this._previousWindow.select(maxItems-1);
			if(this._previousWindow.y - this._nameWindowYOffset < this._yStartPosition) {
				this.moveWindowsDown();
			}
		}
	};
	
	Window_ItemList.prototype.lastWindowUsed = function() {
		return this._lastWindowUsed;
	};
	
	Window_ItemList.prototype.clearLastWindowUsed = function() {
		this._lastWindowUsed = false;
	};
	
	Window_ItemList.prototype.processOk = function() {
		if (this.isCurrentItemEnabled()) {
			if(this._category === "organize") {
				if(this.isOrgSelected()) {
					if(this._orgSelectIndex >= 0 && this._orgSelectIndex == this.index()) {
						var item = this.item();
						if(item.id <= 0 || item.type === "") {
							SoundManager.playCancel();
						} else {
							this.playOkSound();
							this.deactivate();
							this._lastWindowUsed = true;
							this.callOkHandler();
						}
						this._orgSelectIndex = -1;
						this.refresh();
					} else {
						var orgSelectInfo = this.getOrgSelectInfo();
						var itemOne = {};
						itemOne.id = this._actor.allItems()[this.index()].id;
						itemOne.type = this._actor.allItems()[this.index()].type;
						var itemTwo = {};
						itemTwo.id = orgSelectInfo.window.actor().allItems()[orgSelectInfo.orgSelectIndex].id;
						itemTwo.type = orgSelectInfo.window.actor().allItems()[orgSelectInfo.orgSelectIndex].type;
						if((itemOne.id <= 0 || itemOne.type === "") && (itemTwo.id <= 0 || itemTwo.type === "")) {
							SoundManager.playCancel();
						} else {
							SoundManager.playEquip();
							this._actor.gainActorItemAtIndex(itemTwo, this.index());
							orgSelectInfo.window.actor().gainActorItemAtIndex(itemOne, orgSelectInfo.orgSelectIndex);
						}
						orgSelectInfo.window.clearOrgSelect();
						this.refresh();
						orgSelectInfo.window.refresh();
					}
				} else {
					this._orgSelectIndex = this.index();
					this.playOkSound();
					this.refresh();
				}
			} else if (this._category === "stash" || this._category === "keyItems") {
				if(this.item()) {
					this.playOkSound();
					this.deactivate();
					this.callOkHandler();
				} else {
					this.playBuzzerSound();
				}
			}
		} else {
			this.playBuzzerSound();
		}
		this.updateInputData();
	};
	
	Window_ItemList.prototype.processCancel = function() {
		SoundManager.playCancel();
		this.updateInputData();
		if(this._category === "organize" && this.isOrgSelected()) {
			var orgSelectInfo = this.getOrgSelectInfo();
			orgSelectInfo.window.clearOrgSelect();
			orgSelectInfo.window.refresh();
		} else {
			this.deactivate();
			this.callCancelHandler();
		}
	};
	
	Window_ItemList.prototype.processPageup = function() {
		SoundManager.playCursor();
		this.updateInputData();
		this.callHandler('pageup');
	};

	Window_ItemList.prototype.processPagedown = function() {
		SoundManager.playCursor();
		this.updateInputData();
		this.callHandler('pagedown');
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
			if(action.stressCost !== undefined && action.stressCost > 0) {
				this.changeTextColor(this.crisisColor());
				this.drawText(action.stressCost, rect.x, rect.y, rect.width, 'right');
				this.resetTextColor();
			}
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
		this._itemWindow = undefined;
	};
	
	Window_EquipCommand.prototype.setItemWindow = function(itemWindow) {
		if(this._itemWindow != itemWindow) {
			this._itemWindow = itemWindow;
			this.refresh();
		}
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
			this._itemWindow.setOrganizeMode(this.index() == 2);
		}
	};
	
	Window_EquipCommand.prototype.setSlotWindow = function(slotWindow) {
		if (this._slotWindow !== slotWindow) {
			this._slotWindow = slotWindow;
			this.refresh();
		}
	};
	
	Window_EquipCommand.prototype.maxCols = function() {
		return 3;
	};
	
	Window_EquipCommand.prototype.makeCommandList = function() {
		this.addCommand("Held",   'equipWeapons');
		this.addCommand("Accessory", 'equipAccessories');
		this.addCommand("Organize",    'organizeItems');
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
		return Window_SkillActionInfo.prototype.windowWidth();
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
				return 7;
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
					var slotType = this._slotsType;
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
			this._statusWindow.setActor(this._slotsType !== "items" ? this._actor : null);
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
				return 5;
				break;
			case "items":
				return 0;
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
	
	Window_EquipSlot.prototype.processPageup = function() {
		SoundManager.playCursor();
		this.updateInputData();
		this.callHandler('pageup');
	};

	Window_EquipSlot.prototype.processPagedown = function() {
		SoundManager.playCursor();
		this.updateInputData();
		this.callHandler('pagedown');
	};
	
	//equip item
	Window_EquipItem.prototype.initialize = function(x, y, width, height) {
		Window_Selectable.prototype.initialize.call(this, x, y, width, height);
		this._category = 'none';
		this._data = [];
		this._actor = null;
		this._slotId = 0;
		this._slotType = "none";
		this._slotWindow = undefined;
		this._organizeMode = false;
		this._orgSelectIndex = -1;
		this.makeItemList();
	};
	
	Window_EquipItem.prototype.setCategory = function(category) {
		if (this._category !== category) {
			this._category = category;
			this.refresh();
			this.resetScroll();
		}
	};
	
	Window_EquipItem.prototype.maxCols = function() {
		return 2;
	};

	Window_EquipItem.prototype.spacing = function() {
		return 48;
	};

	Window_EquipItem.prototype.maxItems = function() {
		return this._data ? this._data.length : 1;
	};

	Window_EquipItem.prototype.item = function() {
		var index = this.index();
		return this._data && index >= 0 ? this._data[index] : null;
	};

	Window_EquipItem.prototype.isCurrentItemEnabled = function() {
		return this.isEnabled(this.item());
	};
	
	Window_EquipItem.prototype.selectLast = function() {
		var index = this._data.indexOf($gameParty.lastItem());
		this.select(index >= 0 ? index : 0);
	};
	
	Window_EquipItem.prototype.numberWidth = function() {
		return this.textWidth('000');
	};
	
	Window_EquipItem.prototype.setSlotWindow = function(slotWindow) {
		if (this._slotWindow !== slotWindow) {
			this._slotWindow = slotWindow;
			this.refresh();
		}
	};
	
	Window_EquipItem.prototype.organizeMode = function() {
		return this._organizeMode;
	};
	
	Window_EquipItem.prototype.setOrganizeMode = function(mode) {
		if(this._organizeMode !== mode) {
			this._organizeMode = mode;
			this.refresh();
		}
	};
	
	Window_EquipItem.prototype.update = function() {
		Window_Selectable.prototype.update.call(this);
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
	
	Window_EquipItem.prototype.makeItemList = function() {
		this._data = [];
		if(this._actor) {
			this._actor.allItems().forEach(function(actorItem) {
				var item = null;
				if(actorItem.type === "item") {
					item = $dataItems[actorItem.id];
				} else if(actorItem.type === "weapon") {
					item = $dataWeapons[actorItem.id];
				} else if(actorItem.type === "armor") {
					item = $dataArmors[actorItem.id];
				}
				this._data.push(item);
			}, this);
		} else {
			var i;
			for(i = 0; i < Game_Actor.prototype.maxItems(); i++) {
				this._data[i] = null;
			}
		}
	};

	Window_EquipItem.prototype.includes = function(item) {
		return true;
	};

	Window_EquipItem.prototype.updateHelp = function() {
		this.setHelpWindowItem(this.item());
		if (this._actor && this._statusWindow && this.isOpenAndActive()) {
			if(this._organizeMode) {
				this._statusWindow.setTempActor(null);
			} else {
				var actor = JsonEx.makeDeepCopy(this._actor);
				actor.forceChangeEquip(this._slotId, this.item());
				this._statusWindow.setTempActor(actor);
			}
		}
	};
	
	Window_EquipItem.prototype.needsNumber = function() {
		false;
	};
	
	Window_EquipItem.prototype.drawItem = function(index) {
		var item = this._data[index];
		var rect = this.itemRect(index);
		if (item) {
			var numberWidth = this.numberWidth();
			this.changePaintOpacity(this.isEnabled(item));
			this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth - this.textPadding());
			this.drawItemNumber(item, rect.x, rect.y, rect.width - this.textPadding());
			this.changePaintOpacity(1);
		}
		if (this._orgSelectIndex >= 0 && this._orgSelectIndex == index) {
			this.drawOrgSelectBrackets(rect.x, rect.y, rect.width);
		}
	};
	
	Window_EquipItem.prototype.drawItemNumber = function(item, x, y, width) {
		if (this.needsNumber() && this._actor) {
			this.drawText(':', x, y, width - this.textWidth('00'), 'right');
			this.drawText(this._actor.numItems(item), x, y, width, 'right');
		}
	};
	
	Window_EquipItem.prototype.processOk = function() {
		if (this.isCurrentItemEnabled()) {
			this.updateInputData();
			if(this._organizeMode) {
				if(this._orgSelectIndex < 0) {
					this._orgSelectIndex = this.index();
				} else {
					this._actor.swapItemLocations(this._orgSelectIndex, this.index());
					this._orgSelectIndex = -1;
				}
			} else {
				this.deactivate();
			}
			this.callOkHandler();
		} else {
			this.playBuzzerSound();
		}
	};
	
	Window_EquipItem.prototype.processCancel = function() {
		SoundManager.playCancel();
		this.updateInputData();
		if(!this._organizeMode || this._orgSelectIndex < 0) {
			this.deactivate();
		}
		this.callCancelHandler();
	};
	
	Window_EquipItem.prototype.isOrgSelected = function() {
		return this._orgSelectIndex >= 0;
	};
	
	Window_EquipItem.prototype.clearOrgSelect = function() {
		this._orgSelectIndex = -1;
		this.refresh();
	};
	
	Window_EquipItem.prototype.isEnabled = function(item) {
		if (this._organizeMode) { return true; }
		if (!this.isOpenAndActive() && (!this._slotWindow || !this._slotWindow.isOpenAndActive())) { return false; }
		if (!item) { return true; }
		if (this._actor) {
			if(this._slotType === "mainHand") {
				if(DataManager.isWeapon(item) && item.tbsStats.hands !== undefined
					&& (!this._actor.equips()[1] || item.tbsStats.hands === 1))
				{
					return true;
				}
			} else if(this._slotType === "offhand") {
				if(DataManager.isWeapon(item) && item.tbsStats.hands !== undefined && item.tbsStats.hands === 1)
				{
					return true;
				}
			} else if(this._slotType === "accessories") {
				if(DataManager.isArmor(item)) {
					if(item.tbsStats.limitedPart) {
						var limitedParts = [];
						var i;
						for(i = 2; i < 7; i++) {
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
					}
					return true;
				}
			}
		}
		return false;
	};
	
	Window_EquipItem.prototype.refresh = function() {
		this.makeItemList();
		this.createContents();
		this.drawAllItems();
	};
	
	//status
	Window_Status.prototype.initialize = function() {
		var width = Graphics.boxWidth;
		Window_Selectable.prototype.initialize.call(this, 0, 0, width, this.windowHeight());
		this.refresh();
		this.activate();
	};
	
	Window_Status.prototype.windowHeight = function() {
		return this.standardPadding()*2 + this.lineHeight()*2 + Window_Base._faceHeight;
	};
	
	Window_Status.prototype.refresh = function() {
		this.contents.clear();
		if (this._actor) {
			var lineHeight = this.lineHeight();
			this.drawBlock1(lineHeight * 0);
			this.drawHorzLine(lineHeight * 1);
			this.drawBlock2(lineHeight * 2);
		}
	};
	
	Window_Status.prototype.drawBlock1 = function(y) {
		this.drawActorName(this._actor, this.textPadding(), y, 14*28);
		var handedness = "Left Handed";
		if(this._actor.handedness() === "right") {
			handedness = "Right Handed";
		}
		this.drawText(handedness, this.width-this.standardPadding()-this.textPadding()-14*13, y, 14*12);
	};
	
	Window_Status.prototype.drawBlock2 = function(y) {
		this.drawActorFace(this._actor, 12, y);
		this.drawBasicInfo(204, y);
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
		this.drawActorNickname(this._actor, x, y);
		this.changePaintOpacity(false);
		this.drawActorClass(this._actor, x, y+lineHeight);
		this.changePaintOpacity(true);
		this.drawActorSkillXP(this._actor, x, y+lineHeight*2, 14*11);
		//this.drawActorIcons(this._actor, x, y + lineHeight * 2);
		//this.drawActorStress(this._actor, x, y + lineHeight);
		this.drawActorDamage(this._actor, 432, y);
		this.drawActorPartsDamage(this._actor, 432+14, y+lineHeight, true);
		this.drawActorBuffs(this._actor, 432+14*7, y+lineHeight);
	};
	
	//BattleLog
	Window_BattleLog.prototype.initialize = function() {
		var width = this.windowWidth();
		var height = this.windowHeight();
		Window_Selectable.prototype.initialize.call(this, 0, 150, width, height);
		this.opacity = 0;
		this._lines = [];
		this._methods = [];
		this._waitCount = 0;
		this._waitMode = '';
		this._baseLineStack = [];
		this._spriteset = null;
		this.createBackBitmap();
		this.createBackSprite();
		this.refresh();
	};
	
	Window_BattleLog.prototype.performActionStart = function(subject, action) {
		//subject.performActionStart(action);
	};

	Window_BattleLog.prototype.performAction = function(subject, hitGroup, firstTarget) {
		subject.performAction(hitGroup, firstTarget);
	};

	Window_BattleLog.prototype.performActionEnd = function(subject) {
		//subject.performActionEnd();
	};
	
	Window_BattleLog.prototype.showInitialAnimations = function(subject, hitGroup, animationIds, target, showCastAnimation, firstTarget) {
		var baseDelay = this.animationBaseDelay();
		if(hitGroup && hitGroup.motion && hitGroup.motion.motionSpeed && hitGroup.motion.motionSpeed.length > 0) {
			baseDelay = Math.max(0, hitGroup.motion.motionSpeed[0] - 4);
		}
		this.performAction(subject, hitGroup, firstTarget);
		if(showCastAnimation && hitGroup.attackMotion && hitGroup.attackMotion.castAnimationId !== undefined && hitGroup.attackMotion.castAnimationId > 0) {
			var animation = $dataAnimations[hitGroup.attackMotion.castAnimationId];
			if (animation) {
				subject.startAnimation(hitGroup.attackMotion.castAnimationId, subject.isEnemy(), 0);
			}
		}
		if(hitGroup.attackMotion && hitGroup.attackMotion.delayedCastAnimationId !== undefined && hitGroup.attackMotion.delayedCastAnimationId > 0) {
			var animation = $dataAnimations[hitGroup.attackMotion.delayedCastAnimationId];
			if (animation) {
				subject.startAnimation(hitGroup.attackMotion.delayedCastAnimationId, subject.isEnemy(), baseDelay);
			}
		}
		var highestDelay = 0;
		var that = this;
		animationIds.forEach(function(animationId) {
			if(animationId !== undefined && animationId > 0) {
				var animation = $dataAnimations[animationId];
				if (animation) {
					target.startAnimation(animationId, subject.isEnemy(), baseDelay);
					if(animation.frames.length > highestDelay) {
						highestDelay = animation.frames.length;
					}
				}
			}
		});
		return baseDelay + (highestDelay * 4);
	};
	
	Window_BattleLog.prototype.showAnimation = function(subject, targets, animationId) {
		//if (animationId < 0) {
		//	this.showAttackAnimation(subject, targets);
		//} else {
			this.showNormalAnimation(subject, targets, animationId);
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
		this.showNormalAnimation(subject, targets, subject.attackAnimationId1());
		this.showNormalAnimation(subject, targets, subject.attackAnimationId2());
	};

	Window_BattleLog.prototype.showEnemyAttackAnimation = function(subject, targets) {
		SoundManager.playEnemyAttack();
	};

	Window_BattleLog.prototype.showNormalAnimation = function(subject, targets, animationId) {
		var animation = $dataAnimations[animationId];
		if (animation) {
			var delay = this.animationBaseDelay();
			var nextDelay = this.animationNextDelay();
			targets.forEach(function(target) {
				target.battler.startAnimation(animationId, subject.isEnemy(), delay);
				delay += nextDelay;
			});
		}
	};
	
	Window_BattleLog.prototype.showHitMissAnimations = function(subject, target, results, firstTarget) {
		if(firstTarget) {
			if(results.animationIds.length > 0) {
				var i;
				for(i = 0; i < results.animationIds.length; i++) {
					var animationId = results.animationIds[i];
					if(animationId !== undefined && animationId > 0) {
						var animation = $dataAnimations[animationId];
						if (animation) {
							target.startAnimation(animationId, subject.isEnemy(), 0, results.animationVariances[i]);
						}
					}
				}
			}
			if(results.ongoingAnimationIds.length > 0) {
				results.ongoingAnimationIds.forEach(function (animationId) {
					if(animationId !== undefined && animationId > 0) {
						var animation = $dataAnimations[animationId];
						if (animation) {
							target.startOngoingAnimation(animationId, subject.isEnemy(), 0);
						}
					}
				});
			}
		} else {
			if(results.secondaryAnimationIds.length > 0) {
				var i;
				for(i = 0; i < results.secondaryAnimationIds.length; i++) {
					var animationId = results.secondaryAnimationIds[i];
					if(animationId !== undefined && animationId > 0) {
						var animation = $dataAnimations[animationId];
						if (animation) {
							target.startAnimation(animationId, subject.isEnemy(), 0, results.secondaryAnimationVariances[i]);
						}
					}
				}
			}
		}
		if(target.blankDummy()) { return; }
		target.setTbsResults(results);
		target.startDamagePopup();
		if (results.dodged) {
			target.performEvasion();
		} else {
			if(results.damage.head > results.heal.head || results.damage.mind > results.heal.mind ||
				results.damage.torso > results.heal.torso || results.damage.leftArm > results.heal.leftArm ||
				results.damage.rightArm > results.heal.rightArm || results.damage.leftLeg > results.heal.leftLeg ||
				results.damage.rightLeg > results.heal.rightLeg) {
				target.performDamage();
			} else if(results.damage.head < results.heal.head || results.damage.mind < results.heal.mind ||
				results.damage.torso < results.heal.torso || results.damage.leftArm < results.heal.leftArm ||
				results.damage.rightArm < results.heal.rightArm || results.damage.leftLeg < results.heal.leftLeg ||
				results.damage.rightLeg < results.heal.rightLeg ||
				(results.stress.other + results.stress.mind + results.stress.head + results.stress.torso +
				results.stress.leftArm + results.stress.rightArm + results.stress.leftLeg +
				results.stress.rightLeg + results.stress.leftHeld + results.stress.rightHeld) < results.heal.stress) {
				target.performRecovery();
			} else if((results.stress.other + results.stress.mind + results.stress.head + results.stress.torso +
				results.stress.leftArm + results.stress.rightArm + results.stress.leftLeg +
				results.stress.rightLeg + results.stress.leftHeld + results.stress.rightHeld) > results.heal.stress) {
				target.performStress();
			} else {
				target.performDeflection();
			}
		}
	};
	
	Window_BattleLog.prototype.showStressCost = function(subject, stressCost) {
		var totalResults = {};
		totalResults.stress = {};
		totalResults.stress.head = stressCost;
		totalResults.stress.torso = 0;
		totalResults.stress.leftArm = 0;
		totalResults.stress.rightArm = 0;
		totalResults.stress.leftLeg = 0;
		totalResults.stress.rightLeg = 0;
		totalResults.stress.leftHeld = 0;
		totalResults.stress.rightHeld = 0;
		totalResults.stress.mind = 0;
		totalResults.stress.other = 0;
		totalResults.damage = {};
		totalResults.damage.head = 0;
		totalResults.damage.torso = 0;
		totalResults.damage.leftArm = 0;
		totalResults.damage.rightArm = 0;
		totalResults.damage.leftLeg = 0;
		totalResults.damage.rightLeg = 0;
		totalResults.damage.leftHeld = 0;
		totalResults.damage.rightHeld = 0;
		totalResults.damage.mind = 0;
		totalResults.heal = {};
		totalResults.heal.stress = 0;
		totalResults.heal.head = 0;
		totalResults.heal.torso = 0;
		totalResults.heal.leftArm = 0;
		totalResults.heal.rightArm = 0;
		totalResults.heal.leftLeg = 0;
		totalResults.heal.rightLeg = 0;
		totalResults.heal.leftHeld = 0;
		totalResults.heal.rightHeld = 0;
		totalResults.heal.mind = 0;
		totalResults.dodged = false;
		totalResults.hit = {};
		totalResults.hit.mind = false;
		totalResults.hit.head = false;
		totalResults.hit.torso = false;
		totalResults.hit.leftArm = false;
		totalResults.hit.rightArm = false;
		totalResults.hit.leftLeg = false;
		totalResults.hit.rightLeg = false;
		totalResults.hit.leftHeld = false;
		totalResults.hit.rightHeld = false;
		totalResults.critical = {};
		totalResults.critical.mind = false;
		totalResults.critical.head = false;
		totalResults.critical.torso = false;
		totalResults.critical.leftArm = false;
		totalResults.critical.rightArm = false;
		totalResults.critical.leftLeg = false;
		totalResults.critical.rightLeg = false;
		totalResults.buffs = [];
		totalResults.downed = false;
		totalResults.revived = false;
		subject.setTbsResults(totalResults);
		subject.startDamagePopup();
	};
	
	Window_BattleLog.prototype.startAction = function(subject, action, targets) {
		//var item = action.item();
		this.push('performActionStart', subject, action);
		this.push('waitForMovement');
		//this.push('performAction', subject, action);
		//this.push('showInitialAnimations', targets.clone()[0].battler, action.hits);
		//this.displayAction(subject, action);
	};

	Window_BattleLog.prototype.endAction = function(subject) {
		this.push('waitForNewLine');
		this.push('clear');
		this.push('performActionEnd', subject);
	};
	
	Window_BattleLog.prototype.displayRegeneration = function(subject) {
		//this.push('popupDamage', subject);
	};
	
	Window_BattleLog.prototype.displayAction = function(subject, action) {
		var numMethods = this._methods.length;
		//if (DataManager.isSkill(item)) {
		//	if (item.message1) {
		//		this.push('addText', subject.displayName() + item.message1.format(item.name));
		//	}
		//	if (item.message2) {
		//		this.push('addText', item.message2.format(item.name));
		//	}
		//} else {
		//	this.push('addText', TextManager.useItem.format(subject.displayName(), item.name));
		//}
		if(action.type === "attack") {
			this.push('addText', subject.displayName() + ' attacks with ' + action.name + '!');
		} else if (action.type === "technique") {
			this.push('addText', subject.displayName() + ' executes ' + action.name + '!');
		} else if (action.type === "item") {
			this.push('addText', subject.displayName() + ' uses ' + action.name + '!');
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
		//this.displayResultsValues(subject, target, results);
		this.displayAffectedStatus(target, results);
		this.push('wait');
		this.push('wait');
		//this.displayFailure(target);
		this.push('waitForNewLine');
		this.push('popBaseLine');
	};
	
	Window_BattleLog.prototype.displayResultsValues = function(subject, target, results) {
		if (results.dodged) {
			this.displayDodge(target);
			this.displayStress(target, results);
		} else {
			this.displayPartsDamage(subject, target, results);
			this.displayStress(target, results);
		}
		this.push('wait');
	};

	Window_BattleLog.prototype.displayDodge = function(target) {
		var fmt;
		fmt = TextManager.evasion;
		this.push('addText', fmt.format(target.displayName()));
	};

	Window_BattleLog.prototype.displayPartsDamage = function(subject, target, results) {
		var hitCount = results.hit.mind ? 1 : 0;
		hitCount += results.hit.head ? 1 : 0;
		hitCount += results.hit.torso ? 1 : 0;
		hitCount += results.hit.rightArm ? 1 : 0;
		hitCount += results.hit.leftArm ? 1 : 0;
		hitCount += results.hit.rightLeg ? 1 : 0;
		hitCount += results.hit.leftLeg ? 1 : 0;
		hitCount += results.hit.leftHeld ? 1 : 0;
		hitCount += results.hit.rightHeld ? 1 : 0;
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
					this.push('addText', target.displayName() + " takes a total of " + totalDamage + " damage!", false);
					lines++;
				}
				if(totalHeal > 0) {
					this.push('addText', target.displayName() + " is healed by a total of " + totalHeal + "!", false);
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
					this.push('addText', target.displayName() + " is struck in multiple places!", false);
					lines++;
				} else {
					this.push('addText', target.displayName() + " fully deflects the blow!", false);
					lines++;
				}
			}
		} else {
			lines += this.displayPartDamage(subject, target, results, "mind");
			lines += this.displayPartDamage(subject, target, results, "head");
			lines += this.displayPartDamage(subject, target, results, "torso");
			lines += this.displayPartDamage(subject, target, results, "rightArm");
			lines += this.displayPartDamage(subject, target, results, "leftArm");
			lines += this.displayPartDamage(subject, target, results, "rightLeg");
			lines += this.displayPartDamage(subject, target, results, "leftLeg");
			lines += this.displayPartDamage(subject, target, results, "rightHeld");
			lines += this.displayPartDamage(subject, target, results, "leftHeld");
		}
		return lines;
	};

	Window_BattleLog.prototype.displayPartDamage = function(subject, target, results, partName) {
		var partDisplayText = partName;
		switch(partName) {
			case "leftArm": partDisplayText = "left arm"; break;
			case "rightArm": partDisplayText = "right arm"; break;
			case "leftLeg": partDisplayText = "left leg"; break;
			case "rightLeg": partDisplayText = "right leg"; break;
			case "leftHeld":
				partDisplayText = target.handedness() === "left"
					? target.equips()[0] ? target.equips()[0].name : "main weapon"
					: target.equips()[1] ? target.equips()[1].name : "offhand weapon";
				break;
			case "rightHeld":
				partDisplayText = target.handedness() === "left"
					? target.equips()[1] ? target.equips()[1].name : "offhand weapon"
					: target.equips()[0] ? target.equips()[0].name : "main weapon";
				break;
		}
		if(results.damage[partName] !== results.heal[partName]) {
			var text = "";
			var diff = Math.abs(results.damage[partName] - results.heal[partName]);
			if (results.damage[partName] > results.heal[partName]) {
				text = target.displayName() + "'s " + partDisplayText + " takes " + diff + " damage!";
			} else if (results.damage[partName] < results.heal[partName]) {
				text = target.displayName() + "'s " + partDisplayText + " is healed by " + diff + "!";
			}
			this.push('addText', text, false);
			return 1;
		} else if(results.hit[partName]) {
			if(results.stress[partName] > 0) {
				this.push('addText', target.displayName() + "'s " + partDisplayText + " is struck!", false);
				return 1;
			} else {
				this.push('addText', target.displayName() + "'s " + partDisplayText + " deflects the blow!", false);
				return 1;
			}
		}
		return 0;
	};

	Window_BattleLog.prototype.displayStress = function(target, results) {
		var totalStress = results.stress.other + results.stress.mind + results.stress.head + results.stress.torso
			+ results.stress.leftArm + results.stress.rightArm + results.stress.leftLeg + results.stress.rightLeg
			 + results.stress.leftHeld + results.stress.rightHeld;
		if(totalStress !== results.heal.stress) {
			var text = "";
			var diff = Math.abs(totalStress - results.heal.stress);
			if (totalStress > results.heal.stress) {
				text = target.displayName() + " is inflicted with " + diff + " stress!";
			} else if (totalStress < results.heal.stress) {
				text = target.displayName() + " has " + diff + " stress removed!";
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
				// this.push('addText', target.displayName() + stateMsg);
				// this.push('waitForEffect');
			// }
		// }, this);
		if(results.downed) {
			this.push('performCollapse', target);
			this.push('popBaseLine');
			this.push('pushBaseLine');
			//this.push('addText', target.displayName() + " is taken down!");
			this.push('waitForEffect');
		}
	};

	Window_BattleLog.prototype.displayRemovedStates = function(target, results) {
		// target.result().removedStateObjects().forEach(function(state) {
			// if (state.message4) {
				// this.push('popBaseLine');
				// this.push('pushBaseLine');
				// this.push('addText', target.displayName() + state.message4);
			// }
		// }, this);
		if(results.revived) {
			this.push('popBaseLine');
			this.push('pushBaseLine');
			//this.push('addText', target.displayName() + " can function again!");
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
			this.push('addText', fmt.format(target.displayName(), TextManager.param(paramId)));
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
 