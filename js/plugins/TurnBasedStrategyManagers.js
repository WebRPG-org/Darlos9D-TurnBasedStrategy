//=============================================================================
// TurnBasedStrategyManagers.js
//=============================================================================

/*:
 *
 * @plugindesc Manager objects for a turn based strategy game
 *
 * @author Darlos9D
 *
 * @help
 *
 * This plugin does not provide any commands.
 *
 */

//Sound
SoundManager.getTbsBattleStartSound = function() {
	var tbsBattleStartSound = {};
	tbsBattleStartSound.name = "Saint9";
	tbsBattleStartSound.pan = 0;
	tbsBattleStartSound.pitch = 100;
	tbsBattleStartSound.volume = 90;
	return tbsBattleStartSound;
};

SoundManager.getWindowOpenCloseSound = function() {
	var windowOpenCloseSound = {};
	windowOpenCloseSound.name = "Wind7";
	windowOpenCloseSound.pan = 0;
	windowOpenCloseSound.pitch = 150;
	windowOpenCloseSound.volume = 90;
	return windowOpenCloseSound;
};

SoundManager.getDeflectionSound = function() {
	var deflectionSound = {};
	deflectionSound.name = "Sword7";
	deflectionSound.pan = 0;
	deflectionSound.pitch = 100;
	deflectionSound.volume = 90;
	return deflectionSound;
};

SoundManager.getStressSound = function() {
	var stressSound = {};
	stressSound.name = "Blow10";
	stressSound.pan = 0;
	stressSound.pitch = 100;
	stressSound.volume = 90;
	return stressSound;
};

SoundManager.loadTbsBattleStartSound = function() {
	if ($dataSystem) {
		AudioManager.loadStaticSe(this.getTbsBattleStartSound());
	}
};

SoundManager.loadWindowOpenCloseSound = function() {
	if ($dataSystem) {
		AudioManager.loadStaticSe(this.getWindowOpenCloseSound());
	}
};

SoundManager.loadDeflectionSound = function() {
	if ($dataSystem) {
		AudioManager.loadStaticSe(this.getDeflectionSound());
	}
};

SoundManager.loadStressSound = function() {
	if ($dataSystem) {
		AudioManager.loadStaticSe(this.getStressSound());
	}
};

SoundManager.playTbsBattleStartSound = function() {
	if ($dataSystem) {
		AudioManager.playStaticSe(this.getTbsBattleStartSound());
	}
};

SoundManager.playWindowOpenCloseSound = function() {
	if ($dataSystem) {
		AudioManager.playStaticSe(this.getWindowOpenCloseSound());
	}
};

SoundManager.playDeflectionSound = function() {
	if ($dataSystem) {
		AudioManager.playStaticSe(this.getDeflectionSound());
	}
};

SoundManager.playStressSound = function() {
	if ($dataSystem) {
		AudioManager.playStaticSe(this.getStressSound());
	}
};

//Battle
BattleManager.setup = function(tbsActors, tbsActionInfo, tbsTargetX, tbsTargetY, tbsTargets, tbsTargetsByHit, tbsTargetPart) {
    this.initMembers();
	this._tbsActors = tbsActors;
	this._tbsActionInfo = tbsActionInfo;
	this._tbsTargetX = tbsTargetX;
	this._tbsTargetY = tbsTargetY;
	this._tbsTargets = tbsTargets.clone();
	this._tbsOriginalTargets = tbsTargets;
	this._tbsTargetsByHit = tbsTargetsByHit;
	this._tbsTargetPart = tbsTargetPart;
    this._canEscape = false;
    this._canLose = false;
	this._shouldPassTurn = true;
	this._actionFinished = false;
	this.figureOutBattlerPositions();
	this.refreshLeftActorStatusWindow();
	this.refreshRightActorStatusWindow();
    $gameScreen.onBattleStart();
	//this.startTurn();
};

BattleManager.initMembers = function() {
    this._phase = 'init';
    this._canEscape = false;
    this._canLose = false;
    this._battleTest = false;
    this._eventCallback = null;
    this._preemptive = false;
    this._surprise = false;
    this._actorIndex = -1;
    this._actionForcedBattler = null;
    this._mapBgm = null;
    this._mapBgs = null;
    this._actionBattlers = [];
	this._tbsActors = [];
	this._tbsActionInfo = null;
	this._tbsTargets = [];
	this._tbsTargetsByHit = [];
	this._targetsOnLeft = false;
    this._subject = null;
    this._action = null;
    this._logWindow = null;
    this._leftActorStatusWindow = null;
    this._rightActorStatusWindow = null;
    this._statusWindow = null;
    this._spriteset = null;
    this._escapeRatio = 0;
    this._escaped = false;
    this._rewards = {};
	this._shouldPassTurn = true;
	this._curWindowTarget = null;
	this._switchTargetTime = 30;
	this._curSwitchTargetTime = -1;
	this._actionFinished = false;
	this._curTarget = null;
	this._resultsPerGroup = [];
	this._nonFollowupsAllDodged = [];
	this._actionTimer = 0;
	this._hitMissDelay = [];
	this._showCastAnimation = true;
	this._equipmentBaseToughness = 8;
	this._accMult = 10;
	this._evaMult = 10;
	this._accEvaSkillMult = 2;
	this._damageMult = 10;
	this._armorMult = 10;
	this._damageStressDivisor = 2.5;
	this._baseHitStress = 20;
};

BattleManager.setLeftActorStatusWindow = function(actorStatusWindow) {
    this._leftActorStatusWindow = actorStatusWindow;
	this.refreshLeftActorStatusWindow();
};

BattleManager.setRightActorStatusWindow = function(actorStatusWindow) {
    this._rightActorStatusWindow = actorStatusWindow;
	this.refreshRightActorStatusWindow();
};

BattleManager.setLeftActorNameWindow = function(actorNameWindow) {
    this._leftActorNameWindow = actorNameWindow;
	this.refreshLeftActorNameWindow(true);
};

BattleManager.setRightActorNameWindow = function(actorNameWindow) {
    this._rightActorNameWindow = actorNameWindow;
	this.refreshRightActorNameWindow(true);
};

BattleManager.refreshLeftActorStatusWindow = function(forceRefresh) {
	if(this._leftActorStatusWindow) {
		if(this._targetsOnLeft) {
			this._leftActorStatusWindow.setTbsActor(this._tbsTargets[0], forceRefresh);
			this._curWindowTarget = this._tbsTargets[0];
		} else {
			this._leftActorStatusWindow.setTbsActor(this._tbsActors[0], forceRefresh);
		}
	}
};

BattleManager.refreshRightActorStatusWindow = function(forceRefresh) {
	if(this._rightActorStatusWindow) {
		if(this._targetsOnLeft) {
			this._rightActorStatusWindow.setTbsActor(this._tbsActors[0], forceRefresh);
		} else {
			this._rightActorStatusWindow.setTbsActor(this._tbsTargets[0], forceRefresh);
			this._curWindowTarget = this._tbsTargets[0];
		}
	}
};

BattleManager.refreshLeftActorNameWindow = function(rightNow) {
	if(this._leftActorNameWindow) {
		var newActor = this._targetsOnLeft ? this._tbsTargets[0] : this._tbsActors[0];
		if(rightNow) {
			this._leftActorNameWindow.setTargetActor(newActor);
		} else {
			this._leftActorNameWindow.setTargetAndPosOnOpen(newActor);
		}
	}
};

BattleManager.refreshRightActorNameWindow = function(rightNow) {
	if(this._rightActorNameWindow) {
		var newActor = this._targetsOnLeft ? this._tbsActors[0] : this._tbsTargets[0];
		if(rightNow) {
			this._rightActorNameWindow.setTargetActor(newActor, true);
		} else {
			this._rightActorNameWindow.setTargetAndPosOnOpen(newActor, true);
		}
	}
};

BattleManager.refreshStatus = function() {
    this._statusWindow.refresh();
    this._leftActorStatusWindow.refresh();
    this._rightActorStatusWindow.refresh();
};

BattleManager.saveBgmAndBgs = function() {
    this._mapBgm = AudioManager.saveBgm();
    //this._mapBgs = AudioManager.saveBgs();
};

BattleManager.playBattleBgm = function() {
    AudioManager.playBgm($gameSystem.battleBgm());
    //AudioManager.stopBgs();
};

BattleManager.replayBgmAndBgs = function() {
    if (this._mapBgm) {
        AudioManager.replayBgm(this._mapBgm);
    } else {
        AudioManager.stopBgm();
    }
    //if (this._mapBgs) {
    //    AudioManager.replayBgs(this._mapBgs);
    //}
};

BattleManager.figureOutBattlerPositions = function() {
	var leftCenterX = Graphics.boxWidth * 0.25;
	var centerX = Graphics.boxWidth * 0.5;
	var centerY = Graphics.boxHeight * 0.6;
	var rightCenterX = Graphics.boxWidth * 0.75;
	var actorsCenterMapX = this._tbsActors[0].chara.x;
	var actorsCenterMapY = this._tbsActors[0].chara.y;
	var targetsCenterMapX = this._tbsTargetX;
	var targetsCenterMapY = this._tbsTargetY;
	
	var targetsOnLeft = this._tbsActors[0].isParty;
	var xDiff = targetsOnLeft ? actorsCenterMapX - targetsCenterMapX : targetsCenterMapX - actorsCenterMapX;
	var yDiff = targetsOnLeft ? actorsCenterMapY - targetsCenterMapY : targetsCenterMapY - actorsCenterMapY;
	var baseMapAngle = Math.atan2(yDiff, xDiff);
	
	if(this._tbsTargets.indexOf(this._tbsActors[0]) === -1) {
		this._tbsActors.forEach(function (tbsActor) {
			tbsActor.battler.setShouldMoveIn(true);
			var offset = BattleManager.getBattleOffset(tbsActor.chara.x, tbsActor.chara.y, actorsCenterMapX, actorsCenterMapY, baseMapAngle);
			if(targetsOnLeft) {
				tbsActor.battler.setScreenPos(rightCenterX + offset.x, centerY + offset.y);
			} else {
				tbsActor.battler.setScreenPos(leftCenterX + offset.x, centerY + offset.y);
			}
		});
		
		var that = this;
		this._tbsTargets.forEach(function (tbsTarget) {
			var targetIsActor = false;
			that._tbsActors.forEach(function (tbsActor) {
				if(tbsTarget === tbsActor) {
					targetIsActor = true;
				}
			});
			if(!targetIsActor) {
				tbsTarget.battler.setShouldMoveIn(false);
				var offset = BattleManager.getBattleOffset(tbsTarget.chara.x, tbsTarget.chara.y, targetsCenterMapX, targetsCenterMapY, baseMapAngle);
				if(targetsOnLeft) {
					tbsTarget.battler.setScreenPos(leftCenterX + offset.x, centerY + offset.y);
				} else {
					tbsTarget.battler.setScreenPos(rightCenterX + offset.x, centerY + offset.y);
				}
			}
		});
	} else {
		this._tbsActors.forEach(function (tbsActor) {
			var offset = BattleManager.getBattleOffset(tbsActor.chara.x, tbsActor.chara.y, targetsCenterMapX, targetsCenterMapY, baseMapAngle);
			tbsActor.battler.setShouldMoveIn(true);
			tbsActor.battler.setScreenPos(centerX + offset.x, centerY + offset.y);
		});
		
		var that = this;
		this._tbsTargets.forEach(function (tbsTarget) {
			var targetIsActor = false;
			that._tbsActors.forEach(function (tbsActor) {
				if(tbsTarget === tbsActor) {
					targetIsActor = true;
				}
			});
			if(!targetIsActor) {
				var offset = BattleManager.getBattleOffset(tbsTarget.chara.x, tbsTarget.chara.y, targetsCenterMapX, targetsCenterMapY, baseMapAngle);
				tbsTarget.battler.setShouldMoveIn(false);
				tbsTarget.battler.setScreenPos(centerX + offset.x, centerY + offset.y);
			}
		});
	}
	this._targetsOnLeft = targetsOnLeft;
};

BattleManager.getBattleOffset = function(actorMapX, actorMapY, centerMapX, centerMapY, baseMapAngle) {
	var xScale = 100;
	var yScale = xScale * 0.75;
	var offset = {};
	offset.x = 0;
	offset.y = 0;
	var xDiff = actorMapX - centerMapX;
	var yDiff = actorMapY - centerMapY;
	var actorAngle = Math.atan2(yDiff, xDiff) - baseMapAngle;
	if(actorAngle > Math.PI) {
		actorAngle = -Math.PI + (actorAngle - Math.PI);
	} else if(actorAngle < -Math.PI) {
		actorAngle = Math.PI + (actorAngle + Math.PI);
	}
	var actorHypLength = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
	offset.x = (Math.cos(actorAngle) * actorHypLength) * xScale;
	offset.y = (Math.sin(actorAngle) * actorHypLength) * yScale;
	return offset;
};

BattleManager.ratePreemptive = function() {
    return 0;
};

BattleManager.rateSurprise = function() {
    return 0;
};

BattleManager.makeEscapeRatio = function() {
    this._escapeRatio = 0;
};

BattleManager.updateEventMain = function() {
    //$gameTroop.updateInterpreter();
    $gameParty.requestMotionRefresh();
    //if ($gameTroop.isEventRunning() || this.checkBattleEnd()) {
    //    return true;
    //}
    //$gameTroop.setupBattleEvent();
    //if ($gameTroop.isEventRunning() || SceneManager.isSceneChanging()) {
    //    return true;
    //}
    return false;
};

BattleManager.update = function() {
    if (!this.isBusy() && !this.updateEvent()) {
        switch (this._phase) {
        case 'start':
            this.startTurn();
            break;
        case 'turn':
            this.updateTurn();
            break;
        case 'action':
            this.updateAction();
            break;
        case 'turnEnd':
            this.updateTurnEnd();
            break;
        case 'battleEnd':
            this.updateBattleEnd();
            break;
        }
    }
};

BattleManager.startBattle = function() {
    this._phase = 'start';
    $gameSystem.onBattleStart();
    $gameParty.onBattleStart();
    $gameTroop.onBattleStart();
    //this.displayStartMessages();
};

BattleManager.startTurn = function() {
    this._phase = 'turn';
    this.clearActor();
    this.makeActionOrders();
    //$gameParty.requestMotionRefresh();
    this._logWindow.startTurn();
};

BattleManager.updateTurn = function() {
    //$gameParty.requestMotionRefresh();
    if (!this._subject) {
        this._subject = this.getNextSubject();
    }
    if (this._subject) {
        this.processTurn();
    } else {
        this.endTurn();
    }
};

BattleManager.processTurn = function() {
    var subject = this._subject;
    if (!this._actionFinished) {
        this.startAction();
    } else {
        subject.battler.onAllActionsEnd();
        this.refreshStatus();
        this._logWindow.displayAutoAffectedStatus(subject.battler);
        this._logWindow.displayCurrentState(subject.battler);
        this._logWindow.displayRegeneration(subject.battler);
        this._subject = this.getNextSubject();
    }
};

BattleManager.endTurn = function() {
    this._phase = 'turnEnd';
    this._preemptive = false;
    this._surprise = false;
	this._tbsActors[0].battler.useActionEquip(this._tbsActionInfo);
    this.allBattleMembers().forEach(function(tbsActor) {
		tbsActor.battler.clearCurrentlyOngoingAnims();
        tbsActor.battler.onTurnEnd();
        this.refreshStatus();
        this._logWindow.displayAutoAffectedStatus(tbsActor.battler);
        this._logWindow.displayRegeneration(tbsActor.battler);
    }, this);
};

BattleManager.updateTurnEnd = function() {
	SceneManager.pop();
	$gameMap.setInActionBattleScene(false);
    //this.startInput();
};

BattleManager.allBattleMembers = function() {
    return this._tbsActors.concat(this._tbsOriginalTargets);
};

BattleManager.getNextSubject = function() {
    for (;;) {
        var battler = this._actionBattlers.shift();
        if (!battler) {
            return null;
        }
        return battler;
    }
};

BattleManager.makeActionOrders = function() {
	this._actionBattlers = this._tbsActors.length > 0 ? this._tbsActors.slice(0, 1) : [];
};

BattleManager.startAction = function() {
    var subject = this._subject;
    var action = this._tbsActionInfo.action;
    var targets = [];
	var that = this;
	if(this._targetsOnLeft) {
		this.refreshLeftActorStatusWindow();
		this.refreshLeftActorNameWindow();
	} else {
		this.refreshRightActorStatusWindow();
		this.refreshRightActorNameWindow();
	}
	var i;
	for(i = 0; i < this._tbsActionInfo.action.hitGroups.length; i++) {
		this._nonFollowupsAllDodged[i] = true;
	}
    this._phase = 'action';
    this._action = action;
    //subject.useItem(action.item());
    //this._action.applyGlobal();
    this.refreshStatus();
    this._logWindow.startAction(subject.battler, action, targets);
};

BattleManager.updateAction = function() {
    if (this._tbsTargets.length > 0) {
		if(this._curWindowTarget !== this._tbsTargets[0]) {
			if(this._targetsOnLeft) {
				this._leftActorStatusWindow.close();
				this._leftActorStatusWindow.setShouldReOpen(true);
				this.refreshLeftActorStatusWindow();
				this._leftActorNameWindow.close();
				this._leftActorNameWindow.setShouldReOpen(true);
				this.refreshLeftActorNameWindow();
			} else {
				this._rightActorStatusWindow.close();
				this._rightActorStatusWindow.setShouldReOpen(true);
				this.refreshRightActorStatusWindow();
				this._rightActorNameWindow.close();
				this._rightActorNameWindow.setShouldReOpen(true);
				this.refreshRightActorNameWindow();
			}
			this._curSwitchTargetTime = this._switchTargetTime;
			this._logWindow.clear();
		}
		if(!this._leftActorStatusWindow.isOpen() || !this._rightActorStatusWindow.isOpen()) {
			return;
		}
		if(this._curSwitchTargetTime > 0) {
			this._curSwitchTargetTime--;
			return;
		}
		this._curSwitchTargetTime = -1;
		
		var noHitGroupsLeft = true;
		var noHitMissDelaysLeft = true;
		var i;
		for(i = 0; i < this._tbsActionInfo.action.hitGroups.length; i++) {
			var hitGroup = this._tbsActionInfo.action.hitGroups[i];
			var delay = hitGroup.delay === undefined || hitGroup.delay < 0 ? 0 : hitGroup.delay;
			if(delay == this._actionTimer) {
				this._resultsPerGroup[i] = this.combatMath(this._subject.battler, this._tbsActionInfo, hitGroup, this._tbsTargets[0].battler, this._tbsTargetsByHit, i);
				this._hitMissDelay[i] = this._logWindow.showInitialAnimations(this._subject.battler, hitGroup, this._resultsPerGroup[i].initialAnimationIds, this._tbsTargets[0].battler, this._showCastAnimation);
				this._showCastAnimation = false;
			}
			if(this._actionTimer < delay) {
				noHitGroupsLeft = false;
			}
		}
		for(i = 0; i < this._tbsActionInfo.action.hitGroups.length; i++) {
			if(this._hitMissDelay[i] !== undefined) {
				if(this._hitMissDelay[i] <= 0) {
					this._hitMissDelay[i] = undefined;
					this._logWindow.showHitMissAnimations(this._tbsTargets[0].battler, this._resultsPerGroup[i]);
					this.applyActionResults(this._resultsPerGroup[i], this._tbsTargets[0].battler);
					this.refreshLeftActorStatusWindow(true);
					this.refreshRightActorStatusWindow(true);
				} else {
					this._hitMissDelay[i]--;
				}
				noHitMissDelaysLeft = false;
			}
		}
		
		this._actionTimer++;
		if(noHitGroupsLeft && noHitMissDelaysLeft && !this._spriteset.isAnimationPlaying()) {
			var target = this._tbsTargets[0];
			this._tbsTargets.shift();
			while(this._tbsTargets.length > 0 && this.shouldSkipTarget(this._tbsActionInfo.action.hitGroups, this._tbsTargets[0].battler, this._tbsTargetsByHit)) {
				this._tbsTargets.shift();
			}
			if(this._tbsTargets.length <= 0) {
				if(this._tbsActionInfo.action.stressCost !== undefined) {
					this._subject.battler.adjustStress(this._tbsActionInfo.action.stressCost);
					this._logWindow.showStressCost(this._subject.battler, this._tbsActionInfo.action.stressCost);
				}
			}
			this.invokeAction(this._subject.battler, target.battler, this._resultsPerGroup);
			this._resultsPerGroup = [];
			this._hitMissDelay = [];
			this._actionTimer = 0;
		}
    } else {
        this.endAction();
    }
};

BattleManager.endAction = function() {
    this._logWindow.endAction(this._subject.battler);
    this._phase = 'turn';
	this._actionFinished = true;
	$gameMap.setShouldPassTurn(this._shouldPassTurn);
};

BattleManager.invokeAction = function(subject, target, resultsPerGroup) {
    this._logWindow.push('pushBaseLine');
    //if (Math.random() < this._action.itemCnt(target)) {
    //    this.invokeCounterAttack(subject, target);
    //} else if (Math.random() < this._action.itemMrf(target)) {
    //    this.invokeMagicReflection(subject, target);
    //} else {
        this.invokeNormalAction(subject, target, resultsPerGroup);
    //}
    //subject.setLastTarget(target);
    this._logWindow.push('popBaseLine');
    this.refreshStatus();
};

BattleManager.invokeNormalAction = function(subject, target, resultsPerGroup) {
    //var realTarget = this.applySubstitute(target);
    //this._action.apply(realTarget);
	var totalResults = {};
	totalResults.stress = {};
	totalResults.stress.head = 0;
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
	totalResults.dodged = true;
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
	resultsPerGroup.forEach(function (results) {
		totalResults.stress.head += results.stress.head;
		totalResults.stress.torso += results.stress.torso;
		totalResults.stress.leftArm += results.stress.leftArm;
		totalResults.stress.rightArm += results.stress.rightArm;
		totalResults.stress.leftLeg += results.stress.leftLeg;
		totalResults.stress.rightLeg += results.stress.rightLeg;
		totalResults.stress.leftHeld += results.stress.leftHeld;
		totalResults.stress.rightHeld += results.stress.rightHeld;
		totalResults.stress.mind += results.stress.mind;
		totalResults.stress.other += results.stress.other;
		totalResults.damage.head += results.damage.head;
		totalResults.damage.torso += results.damage.torso;
		totalResults.damage.leftArm += results.damage.leftArm;
		totalResults.damage.rightArm += results.damage.rightArm;
		totalResults.damage.leftLeg += results.damage.leftLeg;
		totalResults.damage.rightLeg += results.damage.rightLeg;
		totalResults.damage.mind += results.damage.mind;
		totalResults.heal.stress += results.heal.stress;
		totalResults.heal.head += results.heal.head;
		totalResults.heal.torso += results.heal.torso;
		totalResults.heal.leftArm += results.heal.leftArm;
		totalResults.heal.rightArm += results.heal.rightArm;
		totalResults.heal.leftLeg += results.heal.leftLeg;
		totalResults.heal.rightLeg += results.heal.rightLeg;
		totalResults.heal.mind += results.heal.mind;
		totalResults.hit.mind = results.hit.mind ? true : totalResults.hit.mind;
		totalResults.hit.head = results.hit.head ? true : totalResults.hit.head;
		totalResults.hit.torso = results.hit.torso ? true : totalResults.hit.torso;
		totalResults.hit.leftArm = results.hit.leftArm ? true : totalResults.hit.leftArm;
		totalResults.hit.rightArm = results.hit.rightArm ? true : totalResults.hit.rightArm;
		totalResults.hit.leftLeg = results.hit.leftLeg ? true : totalResults.hit.leftLeg;
		totalResults.hit.rightLeg = results.hit.rightLeg ? true : totalResults.hit.rightLeg;
		totalResults.hit.leftHeld = results.hit.leftHeld ? true : totalResults.hit.leftHeld;
		totalResults.hit.rightHeld = results.hit.rightHeld ? true : totalResults.hit.rightHeld;
		totalResults.critical.mind = results.critical.mind ? true : totalResults.critical.mind;
		totalResults.critical.head = results.critical.head ? true : totalResults.critical.head;
		totalResults.critical.torso = results.critical.torso ? true : totalResults.critical.torso;
		totalResults.critical.leftArm = results.critical.leftArm ? true : totalResults.critical.leftArm;
		totalResults.critical.rightArm = results.critical.rightArm ? true : totalResults.critical.rightArm;
		totalResults.critical.leftLeg = results.critical.leftLeg ? true : totalResults.critical.leftLeg;
		totalResults.critical.rightLeg = results.critical.rightLeg ? true : totalResults.critical.rightLeg;
		totalResults.buffs = results.buffs.concat(results.buffs);
		totalResults.downed = results.downed ? true : totalResults.downed;
		totalResults.revived = results.revived ? true : totalResults.revived;
		totalResults.dodged = results.dodged ? totalResults.dodged : false;
	});
	this._logWindow.displayActionResults(subject, target, totalResults);
};

BattleManager.shouldSkipTarget = function(hitGroups, target, targetsByHit) {
	var shouldSkip = true;
	var hitGroupIndex = 0;
	var that = this;
	hitGroups.forEach(function (hitGroup) {
		var battlersByHit = [];
		targetsByHit[hitGroupIndex].forEach(function (targets) {
			var battlers = targets.map(function (hitTarget) { return hitTarget.battler; });
			battlersByHit.push(battlers);
		});
		for(i = 0; i < hitGroup.hits.length; i++) {
			if(battlersByHit[i].indexOf(target) === -1) { continue; }
			var hit = hitGroup.hits[i];
			if((hit.rangeType === "followUp" && that._nonFollowupsAllDodged[hitGroupIndex])
				|| (hit.randomTarget && Math.random() < 0.5))
			{
				continue;
			}
			shouldSkip = false;
			break;
		}
		hitGroupIndex++;
	});
	return shouldSkip;
};

BattleManager.combatMath = function(subject, actionInfo, hitGroup, target, targetsByHit, hitGroupIndex, targetingType) {
	var battlersByHit = [];
	targetsByHit[hitGroupIndex].forEach(function (targets) {
		var battlers = targets.map(function (hitTarget) { return hitTarget.battler; });
		battlersByHit.push(battlers);
	});
	
	var targetLeftHeldProt = target.protection("leftHeld");
	var targetRightHeldProt = target.protection("rightHeld");
	var targetHeadProt = target.protection("head");
	var targetTorsoProt = target.protection("torso");
	var targetLeftArmProt = target.protection("leftArm");
	var targetRightArmProt = target.protection("rightArm");
	var targetLeftLegProt = target.protection("leftLeg");
	var targetRightLegProt = target.protection("rightLeg");
	var targetMentalProt = target.mentalProtection();
	targetLeftHeldProt.defense.solid *= this._evaMult;
	targetLeftHeldProt.defense.fluid *= this._evaMult;
	targetLeftHeldProt.armor.blunt *= this._armorMult;
	targetLeftHeldProt.armor.cut *= this._armorMult;
	targetLeftHeldProt.armor.bullet *= this._armorMult;
	targetLeftHeldProt.armor.fire *= this._armorMult;
	targetLeftHeldProt.armor.ice *= this._armorMult;
	targetLeftHeldProt.armor.corrosion *= this._armorMult;
	targetLeftHeldProt.armor.conducted *= this._armorMult;
	targetRightHeldProt.defense.solid *= this._evaMult;
	targetRightHeldProt.defense.fluid *= this._evaMult;
	targetRightHeldProt.armor.blunt *= this._armorMult;
	targetRightHeldProt.armor.cut *= this._armorMult;
	targetRightHeldProt.armor.bullet *= this._armorMult;
	targetRightHeldProt.armor.fire *= this._armorMult;
	targetRightHeldProt.armor.ice *= this._armorMult;
	targetRightHeldProt.armor.corrosion *= this._armorMult;
	targetRightHeldProt.armor.conducted *= this._armorMult;
	targetHeadProt.defense.solid *= this._evaMult;
	targetHeadProt.defense.fluid *= this._evaMult;
	targetHeadProt.armor.blunt *= this._armorMult;
	targetHeadProt.armor.cut *= this._armorMult;
	targetHeadProt.armor.bullet *= this._armorMult;
	targetHeadProt.armor.fire *= this._armorMult;
	targetHeadProt.armor.ice *= this._armorMult;
	targetHeadProt.armor.corrosion *= this._armorMult;
	targetHeadProt.armor.conducted *= this._armorMult;
	targetTorsoProt.defense.solid *= this._evaMult;
	targetTorsoProt.defense.fluid *= this._evaMult;
	targetTorsoProt.armor.blunt *= this._armorMult;
	targetTorsoProt.armor.cut *= this._armorMult;
	targetTorsoProt.armor.bullet *= this._armorMult;
	targetTorsoProt.armor.fire *= this._armorMult;
	targetTorsoProt.armor.ice *= this._armorMult;
	targetTorsoProt.armor.corrosion *= this._armorMult;
	targetTorsoProt.armor.conducted *= this._armorMult;
	targetLeftArmProt.defense.solid *= this._evaMult;
	targetLeftArmProt.defense.fluid *= this._evaMult;
	targetLeftArmProt.armor.blunt *= this._armorMult;
	targetLeftArmProt.armor.cut *= this._armorMult;
	targetLeftArmProt.armor.bullet *= this._armorMult;
	targetLeftArmProt.armor.fire *= this._armorMult;
	targetLeftArmProt.armor.ice *= this._armorMult;
	targetLeftArmProt.armor.corrosion *= this._armorMult;
	targetLeftArmProt.armor.conducted *= this._armorMult;
	targetRightArmProt.defense.solid *= this._evaMult;
	targetRightArmProt.defense.fluid *= this._evaMult;
	targetRightArmProt.armor.blunt *= this._armorMult;
	targetRightArmProt.armor.cut *= this._armorMult;
	targetRightArmProt.armor.bullet *= this._armorMult;
	targetRightArmProt.armor.fire *= this._armorMult;
	targetRightArmProt.armor.ice *= this._armorMult;
	targetRightArmProt.armor.corrosion *= this._armorMult;
	targetRightArmProt.armor.conducted *= this._armorMult;
	targetLeftLegProt.defense.solid *= this._evaMult;
	targetLeftLegProt.defense.fluid *= this._evaMult;
	targetLeftLegProt.armor.blunt *= this._armorMult;
	targetLeftLegProt.armor.cut *= this._armorMult;
	targetLeftLegProt.armor.bullet *= this._armorMult;
	targetLeftLegProt.armor.fire *= this._armorMult;
	targetLeftLegProt.armor.ice *= this._armorMult;
	targetLeftLegProt.armor.corrosion *= this._armorMult;
	targetLeftLegProt.armor.conducted *= this._armorMult;
	targetRightLegProt.defense.solid *= this._evaMult;
	targetRightLegProt.defense.fluid *= this._evaMult;
	targetRightLegProt.armor.blunt *= this._armorMult;
	targetRightLegProt.armor.cut *= this._armorMult;
	targetRightLegProt.armor.bullet *= this._armorMult;
	targetRightLegProt.armor.fire *= this._armorMult;
	targetRightLegProt.armor.ice *= this._armorMult;
	targetRightLegProt.armor.corrosion *= this._armorMult;
	targetRightLegProt.armor.conducted *= this._armorMult;
	targetMentalProt.defense *= this._evaMult;
	targetMentalProt.armor *= this._armorMult;
	var i;
	var results = {};
	results.stress = {};
	results.stress.head = 0;
	results.stress.torso = 0;
	results.stress.leftArm = 0;
	results.stress.rightArm = 0;
	results.stress.leftLeg = 0;
	results.stress.rightLeg = 0;
	results.stress.leftHeld = 0;
	results.stress.rightHeld = 0;
	results.stress.mind = 0;
	results.stress.other = 0;
	results.damage = {};
	results.damage.head = 0;
	results.damage.torso = 0;
	results.damage.leftArm = 0;
	results.damage.rightArm = 0;
	results.damage.leftLeg = 0;
	results.damage.rightLeg = 0;
	results.damage.leftHeld = 0;
	results.damage.rightHeld = 0;
	results.damage.mind = 0;
	results.heal = {};
	results.heal.stress = 0;
	results.heal.head = 0;
	results.heal.torso = 0;
	results.heal.leftArm = 0;
	results.heal.rightArm = 0;
	results.heal.leftLeg = 0;
	results.heal.rightLeg = 0;
	results.heal.leftHeld = 0;
	results.heal.rightHeld = 0;
	results.heal.mind = 0;
	results.dodged = true;
	results.hit = {};
	results.hit.leftHeld = false;
	results.hit.rightHeld = false;
	results.hit.mind = false;
	results.hit.head = false;
	results.hit.torso = false;
	results.hit.leftArm = false;
	results.hit.rightArm = false;
	results.hit.leftLeg = false;
	results.hit.rightLeg = false;
	results.critical = {};
	results.critical.mind = false;
	results.critical.head = false;
	results.critical.torso = false;
	results.critical.leftArm = false;
	results.critical.rightArm = false;
	results.critical.leftLeg = false;
	results.critical.rightLeg = false;
	results.buffs = [];
	results.downed = false;
	results.revived = false;
	results.shouldPassTurn = true;
	results.initialAnimationIds = [];
	results.animationIds = [];
	results.ongoingAnimationIds = [];
	results.skipTarget = true;
	var hitDodged = true;
	if(target.blankDummy()) {
		results.shouldPassTurn = false;
		return results;
	}
	for(i = 0; i < hitGroup.hits.length; i++) {
		if(battlersByHit[i].indexOf(target) === -1) { continue; }
		var hit = hitGroup.hits[i];
		if((hit.rangeType === "followUp" && this._nonFollowupsAllDodged[hitGroupIndex])
			|| (hit.randomTarget && Math.random() < 0.5))
		{
			continue;
		}
		results.skipTarget = false;
		var damage = hit.damage;
		if(damage) {
			var subjectStress = subject.stress();
			var targetStress = target.stress();
			
			var accBonus = hit.accuracyBonus === undefined ? 0 : hit.accuracyBonus;
			var accSkill = 0;
			if(!hit.ignoreUserAccuracy) {
				switch(hit.rangeType) {
					case "melee":
						accSkill = subject.totalSkill("meleeAcc");
						break;
					case "thrown":
					case "fired":
					case "followUp":
						accSkill = subject.totalSkill("rangedAcc");
						break;
					case "mental":
						accSkill = subject.totalSkill("mentalAcc");
						break;
				}
			}
			var acc = (accBonus + accSkill * this._accEvaSkillMult) * this._accMult;
			
			var hitDamage = this.getCompleteDamage(subject, actionInfo, hit);
			hitDamage.blunt *= this._damageMult;
			hitDamage.cut *= this._damageMult;
			hitDamage.keen *= this._damageMult;
			hitDamage.thrust *= this._damageMult;
			hitDamage.stiletto *= this._damageMult;
			hitDamage.bullet *= this._damageMult;
			hitDamage.lightning *= this._damageMult;
			hitDamage.trip *= this._damageMult;
			hitDamage.fire *= this._damageMult;
			hitDamage.ice *= this._damageMult;
			hitDamage.corrosion *= this._damageMult;
			hitDamage.psychic *= this._damageMult;
			
			var isSolid = hitDamage.blunt > 0
				|| hitDamage.cut > 0
				|| hitDamage.keen > 0
				|| hitDamage.thrust > 0
				|| hitDamage.stiletto > 0
				|| hitDamage.bullet > 0
				|| hitDamage.lightning > 0
				|| hitDamage.trip > 0;
			
			var isFluid = hitDamage.fire > 0
				|| hitDamage.ice > 0
				|| hitDamage.corrosion > 0;
			
			var isMental = hitDamage.psychic > 0;
			
			var hitResult = {};
			hitResult.dodged = true;
			hitResult.hit = {};
			hitResult.hit.leftHeld = false;
			hitResult.hit.rightHeld = false;
			hitResult.hit.head = false;
			hitResult.hit.torso = false;
			hitResult.hit.leftArm = false;
			hitResult.hit.rightArm = false;
			hitResult.hit.leftLeg = false;
			hitResult.hit.rightLeg = false;
			hitResult.hit.mind = false;
			hitResult.evaResultBeat = 0;
			hitResult.evaResultUnder = 0;
			hitResult.beatBy = 0;
			if(hit.aoe !== undefined && hit.aoe > 0) {
				if(isSolid || isFluid) {
					hitResult.dodged = false;
					hitResult.hit.leftHeld = true;
					hitResult.hit.rightHeld = true;
					hitResult.hit.head = true;
					hitResult.hit.torso = true;
					hitResult.hit.leftArm = true;
					hitResult.hit.rightArm = true;
					hitResult.hit.leftLeg = true;
					hitResult.hit.rightLeg = true;
				}
				if(isMental) {
					hitResult.dodged = false;
					hitResult.hit.mind = true;
				}
			} else {
				if(isSolid || isFluid) {
					if(targetingType === undefined && this._tbsTargetPart != undefined && this._tbsTargetPart != "mobility" && this._tbsTargetPart != "vital") {
						hitResult.dodged = false;
						hitResult.hit[this._tbsTargetPart] = true;
					} else {
						var bodyPartAccRoll = this.rollForRanks(acc, subjectStress);
						var targetingMobility = this._tbsTargetPart === "mobility";
						var defendingWithLegs = target.limbsType() === "winged" && target.isFlying();
						var leftDefendingLimbProt = defendingWithLegs ? targetLeftLegProt : targetLeftArmProt;
						var rightDefendingLimbProt = defendingWithLegs ? targetRightLegProt : targetRightArmProt;
						var leftDefendingHeldProt = targetLeftArmProt;
						var rightDefendingHeldProt = targetRightArmProt;
						var leftLimbDamagePotential = this.getPartDamagePotential(hitDamage, leftDefendingLimbProt, target.toughness());
						var rightLimbDamagePotential = this.getPartDamagePotential(hitDamage, rightDefendingLimbProt, target.toughness());
						var leftHeldDamagePotential = this.getPartDamagePotential(hitDamage, leftDefendingHeldProt, target.toughness(), true);
						var rightHeldDamagePotential = this.getPartDamagePotential(hitDamage, rightDefendingHeldProt, target.toughness(), true);
						
						var leftLimbFirst = false;
						if(leftLimbDamagePotential < rightLimbDamagePotential) {
							leftLimbFirst = true;
						} else if (leftLimbDamagePotential === rightLimbDamagePotential) {
							if(Math.random() >= 0.5) {
								leftLimbFirst = false;
							} else {
								leftLimbFirst = true;
							}
						}
						var firstLimbProt = leftDefendingLimbProt;
						var secondLimbProt = rightDefendingLimbProt;
						if(!leftLimbFirst) {
							firstLimbProt = rightDefendingLimbProt;
							secondLimbProt = leftDefendingLimbProt;
						}
						
						var leftHeldFirst = false;
						var useFirstHeld = false;
						var useSecondHeld = false;
						if(target.equips()[0] && target.equips()[1]) {
							useFirstHeld = true;
							useSecondHeld = true;
							if(leftHeldDamagePotential < rightHeldDamagePotential) {
								leftHeldFirst = true;
							} else if (leftHeldDamagePotential === rightHeldDamagePotential) {
								if(Math.random() >= 0.5) {
									leftHeldFirst = false;
								} else {
									leftHeldFirst = true;
								}
							}
						} else if(target.equips()[0]) {
							if(target.handedness === "left") {
								leftHeldFirst = true;
							}
							useFirstHeld = true;
						} else if(target.equips()[1]) {
							if(target.handedness === "right") {
								leftHeldFirst = true;
								useFirstHeld = true;
							}
							useFirstHeld = true;
						}
						
						
						var firstHeldProt = leftDefendingHeldProt;
						var secondHeldProt = rightDefendingHeldProt;
						if(!leftHeldFirst) {
							firstHeldProt = rightDefendingHeldProt;
							secondHeldProt = leftDefendingHeldProt;
						}
						
						var criticalPartProt = targetHeadProt;
						var vitalPartProt = targetTorsoProt;
						var leftMobilityFirst = false;
						if(targetingMobility) {
							var leftMobilityLimbProt = defendingWithLegs ? targetLeftArmProt : targetLeftLegProt;
							var rightMobilityLimbProt = defendingWithLegs ? targetRightArmProt : targetRightLegProt ;
							var leftMobilityDamagePotential = this.getPartDamagePotential(hitDamage, leftMobilityLimbProt, target.toughness());
							var rightMobilityDamagePotential = this.getPartDamagePotential(hitDamage, rightMobilityLimbProt, target.toughness());
							if(leftMobilityDamagePotential < rightMobilityDamagePotential) {
								leftMobilityFirst = true;
							} else if (leftMobilityDamagePotential === rightMobilityDamagePotential) {
								if(Math.random() >= 0.5) {
									leftMobilityFirst = false;
								} else {
									leftMobilityFirst = true;
								}
							}
							vitalPartProt = leftMobilityLimbProt;
							criticalPartProt = rightMobilityLimbProt;
							if(!leftMobilityFirst) {
								vitalPartProt = rightMobilityLimbProt;
								criticalPartProt = leftMobilityLimbProt;
							}
						}
						
						var eva = (target.totalSkill("physEvade") * this._accEvaSkillMult) * this._evaMult;
						if(isSolid) {
							hitResult = this.calculateBodyPartHit(targetStress, bodyPartAccRoll, eva,
								criticalPartProt.defense.solid,
								vitalPartProt.defense.solid,
								firstLimbProt.defense.solid,
								secondLimbProt.defense.solid,
								firstHeldProt.defense.solid,
								secondHeldProt.defense.solid,
								leftLimbFirst,
								leftHeldFirst,
								targetingMobility,
								leftMobilityFirst,
								defendingWithLegs,
								target.isDown(),
								targetingType,
								useFirstHeld,
								useSecondHeld);
						} else if (isFluid) {
							hitResult = this.calculateBodyPartHit(targetStress, bodyPartAccRoll, eva,
								criticalPartProt.defense.fluid,
								vitalPartProt.defense.fluid,
								firstLimbProt.defense.fluid,
								secondLimbProt.defense.fluid,
								firstHeldProt.defense.fluid,
								secondHeldProt.defense.fluid,
								leftLimbFirst,
								leftHeldFirst,
								targetingMobility,
								leftMobilityFirst,
								defendingWithLegs,
								target.isDown(),
								targetingType,
								useFirstHeld,
								useSecondHeld);
						}
					}
					if(isMental && !hitResult.dodged) {
						hitResult.hit.mind = true;
					}
				} else if(isMental) {
					var bodyPartAccRoll = this.rollForRanks(acc, subjectStress);
					var eva = (target.totalSkill("mentalEvade") * this._accEvaSkillMult) * this._evaMult;
					hitResult = this.calculateMentalHit(targetStress, bodyPartAccRoll, eva,
						targetMentalProt.defense,
						target.isDown());
				}
			}
			if(!hitResult.dodged) {
				if(hitResult.hit.head || hitResult.hit.torso || hitResult.hit.leftArm || hitResult.hit.rightArm
					|| hitResult.hit.leftLeg || hitResult.hit.rightLeg || hitResult.hit.leftHeld || hitResult.hit.rightHeld) {
					var eva = (target.totalSkill("physEvade") * this._accEvaSkillMult) * this._evaMult;
					var tripEva = (target.totalSkill("tripEvade") * this._accEvaSkillMult) * this._evaMult;
					if(hitResult.hit.head) {
						var damageAccRoll = this.rollForRanks(acc, subjectStress);
						results.hit.head = true;
						var damageResult = this.resolvePhysicalDamage(
							hitDamage, 
							damageAccRoll, 
							eva,
							tripEva,
							targetHeadProt, 
							target.toughness(), 
							targetStress,
							target.isDown(),
							true);
						results.stress.head += damageResult.stress;
						results.damage.head += damageResult.damage;
						results.critical.head = damageResult.critical ? true : results.critical.head;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
						}
						if(damageResult.shouldConduct) {
							var conductResults = this.conductMath(target, damageResult, "head");
							results.stress.torso += conductResults.stress.torso;
							results.stress.leftArm += conductResults.stress.leftArm;
							results.stress.rightArm += conductResults.stress.rightArm;
							results.stress.leftLeg += conductResults.stress.leftLeg;
							results.stress.rightLeg += conductResults.stress.rightLeg;
							results.damage.torso += conductResults.damage.torso;
							results.damage.leftArm += conductResults.damage.leftArm;
							results.damage.rightArm += conductResults.damage.rightArm;
							results.damage.leftLeg += conductResults.damage.leftLeg;
							results.damage.rightLeg += conductResults.damage.rightLeg;
							results.hit.torso = conductResults.damage.torso > 0 ? true : results.hit.torso;
							results.hit.leftArm = conductResults.damage.leftArm > 0 ? true : results.hit.leftArm;
							results.hit.rightArm = conductResults.damage.rightArm > 0 ? true : results.hit.rightArm;
							results.hit.leftLeg = conductResults.damage.leftLeg > 0 ? true : results.hit.leftLeg;
							results.hit.rightLeg = conductResults.damage.rightLeg > 0 ? true : results.hit.rightLeg;
							results.critical.torso = conductResults.damage.torso > 0 && damageResult.critical
								? true : results.critical.torso;
							results.critical.leftArm = conductResults.damage.leftArm > 0 && damageResult.critical
								? true : results.critical.leftArm;
							results.critical.rightArm = conductResults.damage.rightArm > 0 && damageResult.critical
								? true : results.critical.rightArm;
							results.critical.leftLeg = conductResults.damage.leftLeg > 0 && damageResult.critical
								? true : results.critical.leftLeg;
							results.critical.rightLeg = conductResults.damage.rightLeg > 0 && damageResult.critical
								? true : results.critical.rightLeg;
						}
					}
					if(hitResult.hit.torso) {
						var damageAccRoll = this.rollForRanks(acc, subjectStress);
						results.hit.torso = true;
						var damageResult = this.resolvePhysicalDamage(
							hitDamage, 
							damageAccRoll, 
							eva,
							tripEva,
							targetTorsoProt, 
							target.toughness(), 
							targetStress,
							target.isDown(),
							false);
						results.stress.torso += damageResult.stress;
						results.damage.torso += damageResult.damage;
						results.critical.torso = damageResult.critical ? true : results.critical.torso;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
						}
						if(damageResult.shouldConduct) {
							var conductResults = this.conductMath(target, damageResult, "torso");
							results.stress.leftArm += conductResults.stress.leftArm;
							results.stress.rightArm += conductResults.stress.rightArm;
							results.stress.leftLeg += conductResults.stress.leftLeg;
							results.stress.rightLeg += conductResults.stress.rightLeg;
							results.damage.leftArm += conductResults.damage.leftArm;
							results.damage.rightArm += conductResults.damage.rightArm;
							results.damage.leftLeg += conductResults.damage.leftLeg;
							results.damage.rightLeg += conductResults.damage.rightLeg;
							results.hit.leftArm = conductResults.damage.leftArm > 0 ? true : results.hit.leftArm;
							results.hit.rightArm = conductResults.damage.rightArm > 0 ? true : results.hit.rightArm;
							results.hit.leftLeg = conductResults.damage.leftLeg > 0 ? true : results.hit.leftLeg;
							results.hit.rightLeg = conductResults.damage.rightLeg > 0 ? true : results.hit.rightLeg;
							results.critical.leftArm = conductResults.damage.leftArm > 0 && damageResult.critical
								? true : results.critical.leftArm;
							results.critical.rightArm = conductResults.damage.rightArm > 0 && damageResult.critical
								? true : results.critical.rightArm;
							results.critical.leftLeg = conductResults.damage.leftLeg > 0 && damageResult.critical
								? true : results.critical.leftLeg;
							results.critical.rightLeg = conductResults.damage.rightLeg > 0 && damageResult.critical
								? true : results.critical.rightLeg;
						}
					}
					if(hitResult.hit.leftArm) {
						var damageAccRoll = this.rollForRanks(acc, subjectStress);
						results.hit.leftArm = true;
						var damageResult = this.resolvePhysicalDamage(
							hitDamage, 
							damageAccRoll, 
							eva,
							tripEva,
							targetLeftArmProt, 
							target.toughness(), 
							targetStress,
							target.isDown(),
							target.limbsType() === "winged" && target.isFlying());
						results.stress.leftArm += damageResult.stress;
						results.damage.leftArm += damageResult.damage;
						results.critical.leftArm = damageResult.critical ? true : results.critical.leftArm;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
						}
						if(target.limbsType() !== "winged" || !target.isFlying() && results.shouldCleave) {
							var cleaveResults = this.cleaveMath(subject, actionInfo, hit, target, targetsByHit, hitGroupIndex, damageResult, "vitalOnly");
							results.hit.torso = cleaveResults.hit.torso ? true : results.hit.torso;
							results.hit.head = cleaveResults.hit.head ? true : results.hit.head;
							results.stress.torso += cleaveResults.stress.torso;
							results.stress.head += cleaveResults.stress.head;
							results.damage.torso += cleaveResults.damage.torso;
							results.damage.head += cleaveResults.damage.head;
						}
						if(damageResult.shouldConduct) {
							var conductResults = this.conductMath(target, damageResult, "leftArm");
							results.stress.torso += conductResults.stress.torso;
							results.stress.leftLeg += conductResults.stress.leftLeg;
							results.stress.rightLeg += conductResults.stress.rightLeg;
							results.damage.torso += conductResults.damage.torso;
							results.damage.leftLeg += conductResults.damage.leftLeg;
							results.damage.rightLeg += conductResults.damage.rightLeg;
							results.hit.torso = conductResults.damage.torso > 0 ? true : results.hit.torso;
							results.hit.leftLeg = conductResults.damage.leftLeg > 0 ? true : results.hit.leftLeg;
							results.hit.rightLeg = conductResults.damage.rightLeg > 0 ? true : results.hit.rightLeg;
							results.critical.torso = conductResults.damage.torso > 0 && damageResult.critical
								? true : results.critical.torso;
							results.critical.leftLeg = conductResults.damage.leftLeg > 0 && damageResult.critical
								? true : results.critical.leftLeg;
							results.critical.rightLeg = conductResults.damage.rightLeg > 0 && damageResult.critical
								? true : results.critical.rightLeg;
						}
					}
					if(hitResult.hit.rightArm) {
						var damageAccRoll = this.rollForRanks(acc, subjectStress);
						results.hit.rightArm = true;
						var damageResult = this.resolvePhysicalDamage(
							hitDamage, 
							damageAccRoll, 
							eva,
							tripEva,
							targetRightArmProt, 
							target.toughness(), 
							targetStress,
							target.isDown(),
							target.limbsType() === "winged" && target.isFlying());
						results.stress.rightArm += damageResult.stress;
						results.damage.rightArm += damageResult.damage;
						results.critical.rightArm = damageResult.critical ? true : results.critical.rightArm;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
						}
						if(target.limbsType() !== "winged" || !target.isFlying() && results.shouldCleave) {
							var cleaveResults = this.cleaveMath(subject, actionInfo, hit, target, targetsByHit, hitGroupIndex, damageResult, "vitalOnly");
							results.hit.torso = cleaveResults.hit.torso ? true : results.hit.torso;
							results.hit.head = cleaveResults.hit.head ? true : results.hit.head;
							results.stress.torso += cleaveResults.stress.torso;
							results.stress.head += cleaveResults.stress.head;
							results.damage.torso += cleaveResults.damage.torso;
							results.damage.head += cleaveResults.damage.head;
						}
						if(damageResult.shouldConduct) {
							var conductResults = this.conductMath(target, damageResult, "rightArm");
							results.stress.torso += conductResults.stress.torso;
							results.stress.leftLeg += conductResults.stress.leftLeg;
							results.stress.rightLeg += conductResults.stress.rightLeg;
							results.damage.torso += conductResults.damage.torso;
							results.damage.leftLeg += conductResults.damage.leftLeg;
							results.damage.rightLeg += conductResults.damage.rightLeg;
							results.hit.torso = conductResults.damage.torso > 0 ? true : results.hit.torso;
							results.hit.leftLeg = conductResults.damage.leftLeg > 0 ? true : results.hit.leftLeg;
							results.hit.rightLeg = conductResults.damage.rightLeg > 0 ? true : results.hit.rightLeg;
							results.critical.torso = conductResults.damage.torso > 0 && damageResult.critical
								? true : results.critical.torso;
							results.critical.leftLeg = conductResults.damage.leftLeg > 0 && damageResult.critical
								? true : results.critical.leftLeg;
							results.critical.rightLeg = conductResults.damage.rightLeg > 0 && damageResult.critical
								? true : results.critical.rightLeg;
						}
					}
					if(hitResult.hit.leftLeg) {
						var damageAccRoll = this.rollForRanks(acc, subjectStress);
						results.hit.leftLeg = true;
						var damageResult = this.resolvePhysicalDamage(
							hitDamage, 
							damageAccRoll, 
							eva,
							tripEva,
							targetLeftLegProt, 
							target.toughness(), 
							targetStress,
							target.isDown(),
							target.limbsType() !== "quadrupedal" && (target.limbsType() !== "winged" || !target.isFlying()));
						results.stress.leftLeg += damageResult.stress;
						results.damage.leftLeg += damageResult.damage;
						results.critical.leftLeg = damageResult.critical ? true : results.critical.leftLeg;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
						}
						if(target.limbsType() === "winged" && target.isFlying() && results.shouldCleave) {
							var cleaveResults = this.cleaveMath(subject, actionInfo, hit, target, targetsByHit, hitGroupIndex, damageResult, "vitalOnly");
							results.hit.torso = cleaveResults.hit.torso ? true : results.hit.torso;
							results.hit.head = cleaveResults.hit.head ? true : results.hit.head;
							results.stress.torso += cleaveResults.stress.torso;
							results.stress.head += cleaveResults.stress.head;
							results.damage.torso += cleaveResults.damage.torso;
							results.damage.head += cleaveResults.damage.head;
						}
					}
					if(hitResult.hit.rightLeg) {
						var damageAccRoll = this.rollForRanks(acc, subjectStress);
						results.hit.rightLeg = true;
						var damageResult = this.resolvePhysicalDamage(
							hitDamage, 
							damageAccRoll, 
							eva,
							tripEva,
							targetRightLegProt, 
							target.toughness(), 
							targetStress,
							target.isDown(),
							target.limbsType() !== "quadrupedal" && (target.limbsType() !== "winged" || !target.isFlying()));
						results.stress.rightLeg += damageResult.stress;
						results.damage.rightLeg += damageResult.damage;
						results.critical.rightLeg = damageResult.critical ? true : results.critical.rightLeg;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
						}
						if(target.limbsType() === "winged" && target.isFlying() && results.shouldCleave) {
							var cleaveResults = this.cleaveMath(subject, actionInfo, hit, target, targetsByHit, hitGroupIndex, damageResult, "vitalOnly");
							results.hit.torso = cleaveResults.hit.torso ? true : results.hit.torso;
							results.hit.head = cleaveResults.hit.head ? true : results.hit.head;
							results.stress.torso += cleaveResults.stress.torso;
							results.stress.head += cleaveResults.stress.head;
							results.damage.torso += cleaveResults.damage.torso;
							results.damage.head += cleaveResults.damage.head;
						}
					}
					if(hitResult.hit.leftHeld) {
						var damageAccRoll = this.rollForRanks(acc, subjectStress);
						results.hit.leftHeld = true;
						var damageResult = this.resolvePhysicalDamage(
							hitDamage, 
							damageAccRoll, 
							eva,
							tripEva,
							targetLeftHeldProt, 
							this._equipmentBaseToughness, 
							targetStress,
							target.isDown(),
							false,
							true);
						results.stress.leftHeld += damageResult.stress;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
						}
						if(results.shouldCleave) {
							var cleaveResults = this.cleaveMath(subject, actionInfo, hit, target, targetsByHit, hitGroupIndex, damageResult, "limbsAndVital");
							results.hit.torso = cleaveResults.hit.torso ? true : results.hit.torso;
							results.hit.head = cleaveResults.hit.head ? true : results.hit.head;
							results.hit.leftArm = cleaveResults.hit.leftArm ? true : results.hit.leftArm;
							results.hit.rightArm = cleaveResults.hit.rightArm ? true : results.hit.rightArm;
							results.hit.leftLeg = cleaveResults.hit.leftLeg ? true : results.hit.leftLeg;
							results.hit.rightLeg = cleaveResults.hit.rightLeg ? true : results.hit.rightLeg;
							results.stress.torso += cleaveResults.stress.torso;
							results.stress.head += cleaveResults.stress.head;
							results.stress.leftArm += cleaveResults.stress.leftArm;
							results.stress.rightArm += cleaveResults.stress.rightArm;
							results.stress.leftLeg += cleaveResults.stress.leftLeg;
							results.stress.rightLeg += cleaveResults.stress.rightLeg;
							results.damage.torso += cleaveResults.damage.torso;
							results.damage.head += cleaveResults.damage.head;
							results.damage.leftArm += cleaveResults.damage.leftArm;
							results.damage.rightArm += cleaveResults.damage.rightArm;
							results.damage.leftLeg += cleaveResults.damage.leftLeg;
							results.damage.rightLeg += cleaveResults.damage.rightLeg;
						}
						if(damageResult.shouldConduct) {
							var conductResults = this.conductMath(target, damageResult, "leftHeld");
							results.stress.torso += conductResults.stress.torso;
							results.stress.leftArm += conductResults.stress.leftArm;
							results.stress.rightArm += conductResults.stress.rightArm;
							results.stress.leftLeg += conductResults.stress.leftLeg;
							results.stress.rightLeg += conductResults.stress.rightLeg;
							results.damage.torso += conductResults.damage.torso;
							results.damage.leftArm += conductResults.damage.leftArm;
							results.damage.rightArm += conductResults.damage.rightArm;
							results.damage.leftLeg += conductResults.damage.leftLeg;
							results.damage.rightLeg += conductResults.damage.rightLeg;
							results.hit.torso = conductResults.damage.torso > 0 ? true : results.hit.torso;
							results.hit.leftArm = conductResults.damage.leftArm > 0 ? true : results.hit.leftArm;
							results.hit.rightArm = conductResults.damage.rightArm > 0 ? true : results.hit.rightArm;
							results.hit.leftLeg = conductResults.damage.leftLeg > 0 ? true : results.hit.leftLeg;
							results.hit.rightLeg = conductResults.damage.rightLeg > 0 ? true : results.hit.rightLeg;
							results.critical.torso = conductResults.damage.torso > 0 && damageResult.critical
								? true : results.critical.torso;
							results.critical.leftArm = conductResults.damage.leftArm > 0 && damageResult.critical
								? true : results.critical.leftArm;
							results.critical.rightArm = conductResults.damage.rightArm > 0 && damageResult.critical
								? true : results.critical.rightArm;
							results.critical.leftLeg = conductResults.damage.leftLeg > 0 && damageResult.critical
								? true : results.critical.leftLeg;
							results.critical.rightLeg = conductResults.damage.rightLeg > 0 && damageResult.critical
								? true : results.critical.rightLeg;
						}
					}
					if(hitResult.hit.rightHeld) {
						var damageAccRoll = this.rollForRanks(acc, subjectStress);
						results.hit.rightHeld = true;
						var damageResult = this.resolvePhysicalDamage(
							hitDamage, 
							damageAccRoll, 
							eva,
							tripEva,
							targetRightHeldProt, 
							this._equipmentBaseToughness, 
							targetStress,
							target.isDown(),
							false,
							true);
						results.stress.rightHeld += damageResult.stress;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
						}
						if(results.shouldCleave) {
							var cleaveResults = this.cleaveMath(subject, actionInfo, hit, target, targetsByHit, hitGroupIndex, damageResult, "limbsAndVital");
							results.hit.torso = cleaveResults.hit.torso ? true : results.hit.torso;
							results.hit.head = cleaveResults.hit.head ? true : results.hit.head;
							results.hit.leftArm = cleaveResults.hit.leftArm ? true : results.hit.leftArm;
							results.hit.rightArm = cleaveResults.hit.rightArm ? true : results.hit.rightArm;
							results.hit.leftLeg = cleaveResults.hit.leftLeg ? true : results.hit.leftLeg;
							results.hit.rightLeg = cleaveResults.hit.rightLeg ? true : results.hit.rightLeg;
							results.stress.torso += cleaveResults.stress.torso;
							results.stress.head += cleaveResults.stress.head;
							results.stress.leftArm += cleaveResults.stress.leftArm;
							results.stress.rightArm += cleaveResults.stress.rightArm;
							results.stress.leftLeg += cleaveResults.stress.leftLeg;
							results.stress.rightLeg += cleaveResults.stress.rightLeg;
							results.damage.torso += cleaveResults.damage.torso;
							results.damage.head += cleaveResults.damage.head;
							results.damage.leftArm += cleaveResults.damage.leftArm;
							results.damage.rightArm += cleaveResults.damage.rightArm;
							results.damage.leftLeg += cleaveResults.damage.leftLeg;
							results.damage.rightLeg += cleaveResults.damage.rightLeg;
						}
						if(damageResult.shouldConduct) {
							this.conductMath(target, damageResult, "rightHeld");
							results.stress.torso += conductResults.stress.torso;
							results.stress.leftArm += conductResults.stress.leftArm;
							results.stress.rightArm += conductResults.stress.rightArm;
							results.stress.leftLeg += conductResults.stress.leftLeg;
							results.stress.rightLeg += conductResults.stress.rightLeg;
							results.damage.torso += conductResults.damage.torso;
							results.damage.leftArm += conductResults.damage.leftArm;
							results.damage.rightArm += conductResults.damage.rightArm;
							results.damage.leftLeg += conductResults.damage.leftLeg;
							results.damage.rightLeg += conductResults.damage.rightLeg;
							results.hit.torso = conductResults.damage.torso > 0 ? true : results.hit.torso;
							results.hit.leftArm = conductResults.damage.leftArm > 0 ? true : results.hit.leftArm;
							results.hit.rightArm = conductResults.damage.rightArm > 0 ? true : results.hit.rightArm;
							results.hit.leftLeg = conductResults.damage.leftLeg > 0 ? true : results.hit.leftLeg;
							results.hit.rightLeg = conductResults.damage.rightLeg > 0 ? true : results.hit.rightLeg;
							results.critical.torso = conductResults.damage.torso > 0 && damageResult.critical
								? true : results.critical.torso;
							results.critical.leftArm = conductResults.damage.leftArm > 0 && damageResult.critical
								? true : results.critical.leftArm;
							results.critical.rightArm = conductResults.damage.rightArm > 0 && damageResult.critical
								? true : results.critical.rightArm;
							results.critical.leftLeg = conductResults.damage.leftLeg > 0 && damageResult.critical
								? true : results.critical.leftLeg;
							results.critical.rightLeg = conductResults.damage.rightLeg > 0 && damageResult.critical
								? true : results.critical.rightLeg;
						}
					}
				}
				if(hitResult.hit.mind) {
					var damageAccRoll = this.rollForRanks(acc, subjectStress);
					results.hit.mind = true;
					var eva = (target.totalSkill("mentalEvade") * this._accEvaSkillMult) * this._evaMult;
					var damageResult = this.resolveMentalDamage(
						hitDamage, 
						damageAccRoll, 
						eva, 
						targetMentalProt, 
						target.mentalToughness(), 
						targetStress,
						target.isDown());
					results.stress.mind += damageResult.stress;
					results.damage.mind += damageResult.damage;
					results.critical.mind = damageResult.critical ? true : results.critical.mind;
					if(damageResult.stress > 0 || damageResult.damage > 0) {
						results.shouldPassTurn = false;
					}
				}
				hitDodged = false;
				results.dodged = false;
				results.stress.other += hitDamage.stress;
			}
		}
		var heal = hit.heal;
		if(heal) {
			hitDodged = false;
			results.dodged = false;
			results.shouldPassTurn = false;
			if(heal.stress !== undefined) {
				results.heal.stress += heal.stress ;
			}
			if(heal.damage !== undefined) {
				if((hit.aoe === undefined || hit.aoe <= 0) && this._tbsTargetPart != undefined) {
					results.heal[this._tbsTargetPart] = heal.damage;
					results.stress.other = Math.floor(Math.min(target.getDamage(this._tbsTargetPart), heal.damage) / this._damageStressDivisor);
				} else if(hit.aoe !== undefined && hit.aoe >= 1) {
					results.heal.head += heal.damage;
					results.heal.torso += heal.damage;
					results.heal.leftArm += heal.damage;
					results.heal.rightArm += heal.damage;
					results.heal.leftLeg += heal.damage;
					results.heal.rightLeg += heal.damage;
					results.hit.head = true;
					results.hit.torso = true;
					results.hit.leftArm = true;
					results.hit.rightArm = true;
					results.hit.leftLeg = true;
					results.hit.rightLeg = true;
					var stressFromHealing = Math.min(target.getDamage("head"), heal.damage) / this._damageStressDivisor;
					stressFromHealing += Math.min(target.getDamage("torso"), heal.damage) / this._damageStressDivisor;
					stressFromHealing += Math.min(target.getDamage("leftArm"), heal.damage) / this._damageStressDivisor;
					stressFromHealing += Math.min(target.getDamage("rightArm"), heal.damage) / this._damageStressDivisor;
					stressFromHealing += Math.min(target.getDamage("leftLeg"), heal.damage) / this._damageStressDivisor;
					stressFromHealing += Math.min(target.getDamage("rightLeg"), heal.damage) / this._damageStressDivisor;
					results.stress.other += Math.floor(stressFromHealing);
				}
			}
		}
		var buffs = hit.buffs;
		if(buffs) {
			buffs.forEach(function (buff) {
				hitDodged = false;
				results.dodged = false;
				results.shouldPassTurn = false;
				var newBuff = {};
				newBuff.duration = buff.duration === undefined ? 1 : buff.duration;
				newBuff.iconId = buff.iconId === undefined ? 0 : buff.iconId;
				newBuff.protection = {};
				newBuff.protection.mind = {};
				newBuff.protection.mind.defense = 0;
				newBuff.protection.fullBody = {};
				newBuff.protection.fullBody.defense = {};
				newBuff.protection.fullBody.defense.solid = 0;
				newBuff.protection.fullBody.defense.fluid = 0;
				newBuff.protection.head = {};
				newBuff.protection.head.defense = {};
				newBuff.protection.head.defense.solid = 0;
				newBuff.protection.head.defense.fluid = 0;
				newBuff.protection.torso = {};
				newBuff.protection.torso.defense = {};
				newBuff.protection.torso.defense.solid = 0;
				newBuff.protection.torso.defense.fluid = 0;
				newBuff.protection.leftArm = {};
				newBuff.protection.leftArm.defense = {};
				newBuff.protection.leftArm.defense.solid = 0;
				newBuff.protection.leftArm.defense.fluid = 0;
				newBuff.protection.rightArm = {};
				newBuff.protection.rightArm.defense = {};
				newBuff.protection.rightArm.defense.solid = 0;
				newBuff.protection.rightArm.defense.fluid = 0;
				newBuff.protection.leftLeg = {};
				newBuff.protection.leftLeg.defense = {};
				newBuff.protection.leftLeg.defense.solid = 0;
				newBuff.protection.leftLeg.defense.fluid = 0;
				newBuff.protection.rightLeg = {};
				newBuff.protection.rightLeg.defense = {};
				newBuff.protection.rightLeg.defense.solid = 0;
				newBuff.protection.rightLeg.defense.fluid = 0;
				if(buff.protection) {
					var protection = buff.protection;
					if(protection.fullBody) {
						var fullBody = protection.fullBody;
						if(fullBody.defense) {
							var defense = fullBody.defense;
							newBuff.protection.fullBody.defense.solid = defense.solid === undefined ? 0 : defense.solid;
							newBuff.protection.fullBody.defense.fluid = defense.fluid === undefined ? 0 : defense.fluid;
						}
					}
					if(protection.mental) {
						var mental = protection.mental;
						newBuff.protection.mind.defense = mental.defense === undefined ? 0 : mental.defense;
					}
				}
				newBuff.core = {};
				newBuff.core.physEvade = 0;
				newBuff.core.tripEvade = 0;
				newBuff.core.mentalEvade = 0;
				if(buff.core) {
					newBuff.core.physEvade = buff.core.physEvade === undefined ? 0 : buff.core.physEvade;
					newBuff.core.tripEvade = buff.core.tripEvade === undefined ? 0 : buff.core.tripEvade;
					newBuff.core.mentalEvade = buff.core.mentalEvade === undefined ? 0 : buff.core.mentalEvade;
				}
				results.buffs.push(newBuff);
			});
		}
		if(hit.initialAnimationId !== undefined && hit.initialAnimationId > 0) {
			results.initialAnimationIds.push(hit.initialAnimationId);
		}
		if(hitDodged) {
			if(hit.missAnimationId !== undefined && hit.missAnimationId > 0) {
				results.animationIds.push(hit.missAnimationId);
			}
			if(hit.ongoingMissAnimationId !== undefined && hit.ongoingMissAnimationId > 0) {
				results.ongoingAnimationIds.push(hit.ongoingMissAnimationId);
			}
		} else {
			if(hit.animationId !== undefined && hit.animationId > 0) {
				results.animationIds.push(hit.animationId);
			}
			if(hit.ongoingAnimationId !== undefined && hit.ongoingAnimationId > 0) {
				results.ongoingAnimationIds.push(hit.ongoingAnimationId);
			}
		}
		if(!hitDodged) {
			this._nonFollowupsAllDodged[hitGroupIndex] = false;
		}
	}
	return results;
};

BattleManager.cleaveMath = function(subject, actionInfo, hit, target, targetsByHit, hitGroupIndex, damageResult, targetingType) {
	var hitGroup = {};
	hitGroup.hits = [];
	var newHit = {};
	newHit.rangeType = hit.rangeType;
	newHit.accuracyBonus = hit.accuracyBonus;
	newHit.usesParts = hit.usesParts;
	newHit.damage = {};
	if(damageResult.remainingPower.blunt > 0) { newHit.damage.blunt = damageResult.remainingPower.blunt; }
	if(damageResult.remainingPower.cut > 0) { newHit.damage.cut = damageResult.remainingPower.cut; }
	if(damageResult.remainingPower.keen > 0) { newHit.damage.keen = damageResult.remainingPower.keen; }
	if(damageResult.remainingPower.thrust > 0) { newHit.damage.thrust = damageResult.remainingPower.thrust; }
	if(damageResult.remainingPower.stiletto > 0) { newHit.damage.stiletto = damageResult.remainingPower.stiletto; }
	if(damageResult.remainingPower.bullet > 0) { newHit.damage.bullet = damageResult.remainingPower.bullet; }
	if(damageResult.remainingPower.fire > 0) { newHit.damage.fire = damageResult.remainingPower.fire; }
	if(damageResult.remainingPower.ice > 0) { newHit.damage.ice = damageResult.remainingPower.ice; }
	if(damageResult.remainingPower.corrosion > 0) { newHit.damage.corrosion = damageResult.remainingPower.corrosion; }
	hitGroup.hits.push(newHit);
	return this.combatMath(subject, actionInfo, hitGroup, target, targetsByHit, hitGroupIndex, targetingType);
};

BattleManager.conductMath = function(target, damageResult, startingPart) {
	var conductResults = {};
	conductResults.damage = {};
	conductResults.stress = {};
	conductResults.damage.torso = 0;
	conductResults.damage.leftArm = 0;
	conductResults.damage.rightArm = 0;
	conductResults.damage.leftLeg = 0;
	conductResults.damage.rightLeg = 0;
	conductResults.stress.torso = 0;
	conductResults.stress.leftArm = 0;
	conductResults.stress.rightArm = 0;
	conductResults.stress.leftLeg = 0;
	conductResults.stress.rightLeg = 0;
	var tough = target.toughness();
	var lightningPow = damageResult.remainingPower.lightning;
	if(lightningPow <= 0) {
		return conductResults;
	}
	switch(startingPart) {
		case "head":
			conductResults = this.conductMath(target, damageResult, "torso");
			conductResults.damage.torso += Math.max(0, Math.ceil(lightningPow / tough - 1));
			conductResults.stress.torso += this._baseHitStress * 2 + Math.floor(conductResults.damage.torso / this._damageStressDivisor);
			break;
		case "torso":
			var random = Math.random();
			if(target.limbsType() === "quadrupedal") {
				if(random >= 0.75) {
					conductResults = this.conductMath(target, damageResult, "leftArm");
					conductResults.damage.leftArm += Math.max(0, Math.ceil(lightningPow / tough - 1));
					conductResults.stress.leftArm += this._baseHitStress + Math.floor(conductResults.damage.leftArm / this._damageStressDivisor);
				} else if(random >= 0.5) {
					conductResults = this.conductMath(target, damageResult, "rightArm");
					conductResults.damage.rightArm += Math.max(0, Math.ceil(lightningPow / tough - 1));
					conductResults.stress.rightArm += this._baseHitStress + Math.floor(conductResults.damage.rightArm / this._damageStressDivisor);
				} else if(random >= 0.25) {
					conductResults = this.conductMath(target, damageResult, "leftLeg");
					conductResults.damage.leftLeg += Math.max(0, Math.ceil(lightningPow / tough - 1));
					conductResults.stress.leftLeg += this._baseHitStress + Math.floor(conductResults.damage.leftLeg / this._damageStressDivisor);
				} else {
					conductResults = this.conductMath(target, damageResult, "rightLeg");
					conductResults.damage.rightLeg += Math.max(0, Math.ceil(lightningPow / tough - 1));
					conductResults.stress.rightLeg += this._baseHitStress + Math.floor(conductResults.damage.rightLeg / this._damageStressDivisor);
				}
			} else {
				var extraStress = target.limbsType() === "winged" && target.isFlying() ? 0 : this._baseHitStress;
				if(random >= 0.5) {
					conductResults = this.conductMath(target, damageResult, "leftLeg");
					conductResults.damage.leftLeg += Math.max(0, Math.ceil(lightningPow / tough - 1));
					conductResults.stress.leftLeg += this._baseHitStress + extraStress + Math.floor(conductResults.damage.leftLeg / this._damageStressDivisor);
				} else {
					conductResults = this.conductMath(target, damageResult, "rightLeg");
					conductResults.damage.rightLeg += Math.max(0, Math.ceil(lightningPow / tough - 1));
					conductResults.stress.rightLeg += this._baseHitStress + extraStress + Math.floor(conductResults.damage.rightLeg / this._damageStressDivisor);
				}
			}
			break;
		case "leftArm":
		case "rightArm":
			if(target.limbsType() !== "quadrupedal") {
				conductResults = this.conductMath(target. damageResult, "torso");
				conductResults.damage.torso += Math.max(0, Math.ceil(lightningPow / tough - 1));
				conductResults.stress.torso += this._baseHitStress + Math.floor(conductResults.damage.torso / this._damageStressDivisor);
			}
			break;
		case "leftHeld":
			conductResults = this.conductMath(target, damageResult, "leftArm");
			conductResults.damage.leftArm += Math.max(0, Math.ceil(lightningPow / tough - 1));
			conductResults.stress.leftArm += this._baseHitStress + Math.floor(conductResults.damage.leftArm / this._damageStressDivisor);
			break;
		case "rightHeld":
			conductResults = this.conductMath(target, damageResult, "rightArm");
			conductResults.damage.rightArm += Math.max(0, Math.ceil(lightningPow / tough - 1));
			conductResults.stress.rightArm += Math.floor(damageResult.remainingPower.lightning / this._damageStressDivisor);
			break;
	}
	return conductResults;
};

BattleManager.getPartDamagePotential = function(damage, partProt, tough, fullCoverage) {
	var solidCoverage = fullCoverage ? 100 : Math.min(100, partProt.defense.solid);
	var fluidCoverage = fullCoverage ? 100 : Math.min(100, partProt.defense.fluid);
	var solidRegularBypass = 1.5 > (solidCoverage / 100) * 2.5;
	var solidThrustBypass = 1.5 > (solidCoverage / 100) * 1.66;
	var solidStilettoBypass = 1.5 > (solidCoverage / 100) * 1.49;
	var fluidBypass = 1.5 >= (fluidCoverage / 100) * 1.66;
	
	var damagePotential = Math.max(0, damage.blunt - (solidRegularBypass ? partProt.armor.blunt + tough : tough));
	damagePotential += Math.max(0, damage.cut - (solidRegularBypass ? partProt.armor.cut + tough : tough));
	damagePotential += Math.max(0, damage.keen - (solidRegularBypass ? partProt.armor.cut + tough : tough));
	damagePotential += Math.max(0, damage.thrust - (solidThrustBypass ? partProt.armor.cut + tough : tough));
	damagePotential += Math.max(0, damage.lightning - (solidThrustBypass ? partProt.armor.conducted + tough : tough));
	damagePotential += Math.max(0, damage.stiletto - (solidStilettoBypass ? partProt.armor.cut + tough : tough));
	damagePotential += Math.max(0, damage.bullet - (solidThrustBypass ? partProt.armor.bullet + tough : tough));
	damagePotential += Math.max(0, damage.fire - (fluidBypass ? partProt.armor.fire + tough : tough));
	damagePotential += Math.max(0, damage.ice - (fluidBypass ? partProt.armor.ice + tough : tough));
	damagePotential += Math.max(0, damage.corrosion - (fluidBypass ? partProt.armor.corrosion + tough : tough));
	return damagePotential;
};

BattleManager.getCompleteDamage = function(subject, actionInfo, hit) {
	var damage = hit.damage;
	var completeDamage = {};
	completeDamage.overkillType = hit.overkillType;
	if(!damage) {
		damage = {};
	}
	var usesParts = hit.usesParts;
	var actualUsedParts = [];
	if(usesParts) {
		usesParts.forEach(function (usesPart) {
			if(usesPart === "mind" || usesPart === "head" || usesPart === "torso"
				|| usesPart === "leftArm" || usesPart === "rightArm" || usesPart === "leftLeg" || usesPart === "rightLeg") {
				if(subject && subject.limbsType() === "winged" && subject.isFlying()
					&& (usesPart === "leftArm" || usesPart === "rightArm" || usesPart === "leftLeg" || usesPart === "rightLeg")) {
					switch(usesPart) {
						case "leftArm":
							actualUsedParts.push("leftLeg");
							break;
						case "rightArm":
							actualUsedParts.push("rightLeg");
							break;
						case "leftLeg":
							actualUsedParts.push("leftArm");
							break;
						case "rightLeg":
							actualUsedParts.push("rightArm");
							break;
					}
				} else {
					actualUsedParts.push(usesPart);
				}
			}
		});
		if(usesParts.indexOf("bestLimb") >= 0) {
			if(subject && subject.handedness() === "left") {
				if(subject && subject.limbsType() === "winged" && subject.isFlying()) {
					actualUsedParts.push("leftLeg");
				} else {
					actualUsedParts.push("leftArm");
				}
			} else {
				if(subject && subject.limbsType() === "winged" && subject.isFlying()) {
					actualUsedParts.push("rightLeg");
				} else {
					actualUsedParts.push("rightArm");
				}
			}
		}
		if(usesParts.indexOf("equippedOn") >= 0 && actionInfo.sourceEquipSlotId !== undefined) {
			if((actionInfo.sourceEquipSlotId === 0 || actionInfo.sourceEquipSlotId === 1)
				&& actionInfo.sourceEquip.hands && actionInfo.sourceEquip.hands >= 2) {
				actualUsedParts.push("leftArm");
				actualUsedParts.push("rightArm");
			} else if(actionInfo.sourceEquipSlotId === 0) {
				if(subject && subject.handedness() === "left") {
					if(subject && subject.limbsType() === "winged" && subject.isFlying()) {
						actualUsedParts.push("leftLeg");
					} else {
						actualUsedParts.push("leftArm");
					}
				} else {
					if(subject && subject.limbsType() === "winged" && subject.isFlying()) {
						actualUsedParts.push("rightLeg");
					} else {
						actualUsedParts.push("rightArm");
					}
				}
			} else if(actionInfo.sourceEquipSlotId === 1) {
				if(subject && subject.handedness() != "left") {
					if(subject && subject.limbsType() === "winged" && subject.isFlying()) {
						actualUsedParts.push("leftLeg");
					} else {
						actualUsedParts.push("leftArm");
					}
				} else {
					if(subject && subject.limbsType() === "winged" && subject.isFlying()) {
						actualUsedParts.push("rightLeg");
					} else {
						actualUsedParts.push("rightArm");
					}
				}
			}
		}
		if(actualUsedParts.indexOf("torso") === -1
			&& (usesParts.indexOf("leftArm") >= 0 || usesParts.indexOf("rightArm") >=0 || usesParts.indexOf("head") >= 0
			|| usesParts.indexOf("leftLeg") >= 0 || usesParts.indexOf("rightLeg") >= 0)) {
			actualUsedParts.push("torso");
		}
		if(subject && subject.limbsType() === "winged" && subject.isFlying()) {
			if(actualUsedParts.indexOf("leftArm") === -1 && usesParts.indexOf("torso") >= 0) {
				actualUsedParts.push("leftArm");
			}
			if(actualUsedParts.indexOf("rightArm") === -1 && usesParts.indexOf("torso") >= 0) {
				actualUsedParts.push("rightArm");
			}
		} else {
			if(actualUsedParts.indexOf("leftLeg") === -1 && usesParts.indexOf("torso") >= 0) {
				actualUsedParts.push("leftLeg");
			}
			if(actualUsedParts.indexOf("rightLeg") === -1 && usesParts.indexOf("torso") >= 0) {
				actualUsedParts.push("rightLeg");
			}
		}
	}
	var damageScale = 1;
	if(subject && actualUsedParts.length > 0) {
		var denom = actualUsedParts.length * 200;
		var numer = denom;
		if(actualUsedParts.indexOf("mind") >= 0) {
			numer -= subject.getDamage("mind");
		}
		if(actualUsedParts.indexOf("head") >= 0) {
			numer -= subject.getDamage("head");
		}
		if(actualUsedParts.indexOf("torso") >= 0) {
			numer -= subject.getDamage("torso");
		}
		if(actualUsedParts.indexOf("leftArm") >= 0) {
			numer -= subject.getDamage("leftArm");
		}
		if(actualUsedParts.indexOf("rightArm") >= 0) {
			numer -= subject.getDamage("rightArm");
		}
		if(actualUsedParts.indexOf("leftLeg") >= 0) {
			numer -= subject.getDamage("leftLeg");
		}
		if(actualUsedParts.indexOf("rightLeg") >= 0) {
			numer -= subject.getDamage("rightLeg");
		}
		damageScale = numer / denom;
	}
	
	completeDamage.stress = damage.stress !== undefined ? damage.stress * damageScale : 0;
	completeDamage.trip = damage.trip !== undefined ? damage.trip * damageScale : 0;
	completeDamage.blunt = damage.blunt !== undefined ? damage.blunt * damageScale : 0;
	completeDamage.cut = damage.cut !== undefined ? damage.cut * damageScale : 0;
	completeDamage.keen = damage.keen !== undefined ? damage.keen * damageScale : 0;
	completeDamage.thrust = damage.thrust !== undefined ? damage.thrust * damageScale : 0;
	completeDamage.stiletto = damage.stiletto !== undefined ? damage.stiletto * damageScale : 0;
	completeDamage.bullet = damage.bullet !== undefined ? damage.bullet * damageScale : 0;
	completeDamage.fire = damage.fire !== undefined ? damage.fire * damageScale : 0;
	completeDamage.ice = damage.ice !== undefined ? damage.ice * damageScale : 0;
	completeDamage.lightning = damage.lightning !== undefined ? damage.lightning * damageScale : 0;
	completeDamage.corrosion = damage.corrosion !== undefined ? damage.corrosion * damageScale : 0;
	completeDamage.psychic = damage.psychic !== undefined ? damage.psychic * damageScale : 0;
	return completeDamage;
};

BattleManager.calculateBodyPartHit = function(stress, accRoll, dodgeEva, criticalDef, vitalDef,
		firstLimbDef, secondLimbDef, firstHeldDef, secondHeldDef, leftLimbFirst, leftHeldFirst, targetingMobility, leftMobilityFirst,
		defendingWithLegs, isDown, targetingType, useFirstHeld, useSecondHeld)
{
	var results = {};
	results.dodged = false;
	results.hit = {};
	results.hit.leftHeld = false;
	results.hit.rightHeld = false;
	results.hit.head = false;
	results.hit.torso = false;
	results.hit.leftArm = false;
	results.hit.rightArm = false;
	results.hit.leftLeg = false;
	results.hit.rightLeg = false;
	results.hit.mind = false;
	var criticalEvaRoll = this.rollForRanks(dodgeEva, isDown ? 100 : stress);
	var vitalEvaRoll = this.rollForRanks(dodgeEva, isDown ? 100 : stress);
	var firstLimbEvaRoll = this.rollForRanks(dodgeEva, isDown ? 100 : stress);
	var secondLimbEvaRoll = this.rollForRanks(dodgeEva, isDown ? 100 : stress);
	var firstHeldEvaRoll = useFirstHeld ? this.rollForRanks(firstHeldDef + dodgeEva, isDown ? 100 : stress) : 0;
	var secondHeldEvaRoll = useSecondHeld ? this.rollForRanks(secondHeldDef + dodgeEva, isDown ? 100 : stress) : 0;
	if((targetingType === "vitalOnly" && accRoll > vitalEvaRoll + criticalEvaRoll)
		|| (targetingType === "limbsAndVital" && accRoll > firstLimbEvaRoll + secondLimbEvaRoll + vitalEvaRoll + criticalEvaRoll)
		|| (targetingType === undefined && accRoll > firstHeldEvaRoll + secondHeldEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll + vitalEvaRoll + criticalEvaRoll))
	{
		if(targetingMobility) {
			if(leftMobilityFirst) {
				if(defendingWithLegs) {
					results.hit.rightArm = true;
				} else {
					results.hit.rightLeg = true;
				}
			} else {
				if(defendingWithLegs) {
					results.hit.leftArm = true;
				} else {
					results.hit.leftLeg = true;
				}
			}
		} else {
			results.hit.head = true;
		}
	} else if((targetingType === "vitalOnly" && accRoll > vitalEvaRoll)
		|| (targetingType === "limbsAndVital" && accRoll > firstLimbEvaRoll + secondLimbEvaRoll + vitalEvaRoll)
		|| (targetingType === undefined && accRoll > firstHeldEvaRoll + secondHeldEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll + vitalEvaRoll))
	{
		if(targetingMobility) {
			if(leftMobilityFirst) {
				if(defendingWithLegs) {
					results.hit.leftArm = true;
				} else {
					results.hit.leftLeg = true;
				}
			} else {
				if(defendingWithLegs) {
					results.hit.rightArm = true;
				} else {
					results.hit.rightLeg = true;
				}
			}
		} else {
			results.hit.torso = true;
		}
	} else if(targetingType !== "vitalOnly"
		&& ((targetingType === "limbsAndVital" && accRoll > firstLimbEvaRoll + secondLimbEvaRoll)
		|| (targetingType === undefined && accRoll > firstHeldEvaRoll + secondHeldEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll)))
	{
		if(leftLimbFirst) {
			if(defendingWithLegs) {
				results.hit.rightLeg = true;
			} else {
				results.hit.rightArm = true;
			}
		} else {
			if(defendingWithLegs) {
				results.hit.leftLeg = true;
			} else {
				results.hit.leftArm = true;
			}
		}
	} else if(targetingType !== "vitalOnly"
		&& ((targetingType === "limbsAndVital" && accRoll > firstLimbEvaRoll)
		|| (targetingType === undefined && accRoll > firstHeldEvaRoll + secondHeldEvaRoll + firstLimbEvaRoll)))
	{
		if(leftLimbFirst) {
			if(defendingWithLegs) {
				results.hit.leftLeg = true;
			} else {
				results.hit.leftArm = true;
			}
		} else {
			if(defendingWithLegs) {
				results.hit.rightLeg = true;
			} else {
				results.hit.rightArm = true;
			}
		}
	} else if(useSecondHeld && targetingType === undefined && accRoll > firstHeldEvaRoll + secondHeldEvaRoll) {
		if(leftHeldFirst) {
			results.hit.rightHeld = true;
		} else {
			results.hit.leftHeld = true;
		}
	} else if(useFirstHeld && targetingType === undefined && accRoll > firstHeldEvaRoll) {
		if(useSecondHeld) {
			var dodgeRatio = (dodgeEva + secondHeldDef == 0) ? 0 : (dodgeEva / (dodgeEva + secondHeldDef));
			var dodgeAmount = dodgeRatio * secondHeldEvaRoll;
			if(accRoll > dodgeAmount) {
				if(leftHeldFirst) {
					results.hit.rightHeld = true;
				} else {
					results.hit.leftHeld = true;
				}
			} else {
				if(leftHeldFirst) {
					results.hit.leftHeld = true;
				} else {
					results.hit.rightHeld = true;
				}
			}
		} else {
			if(leftHeldFirst) {
				results.hit.leftHeld = true;
			} else {
				results.hit.rightHeld = true;
			}
		}
	} else {
		if(useFirstHeld) {
			var dodgeRatio = (dodgeEva + firstHeldDef == 0) ? 0 : (dodgeEva / (dodgeEva + firstHeldDef));
			var dodgeAmount = dodgeRatio * firstHeldEvaRoll;
			if(accRoll > dodgeAmount) {
				if(leftHeldFirst) {
					results.hit.leftHeld = true;
				} else {
					results.hit.rightHeld = true;
				}
			} else {
				results.dodged = true;
			}
		} else if(useSecondHeld) {
			var dodgeRatio = (dodgeEva + secondHeldDef == 0) ? 0 : (dodgeEva / (dodgeEva + secondHeldDef));
			var dodgeAmount = dodgeRatio * secondHeldEvaRoll;
			if(accRoll > dodgeAmount) {
				if(leftHeldFirst) {
					results.hit.rightHeld = true;
				} else {
					results.hit.leftHeld = true;
				}
			} else {
				results.dodged = true;
			}
		} else {
			results.dodged = true;
		}
	}
	return results;
};

BattleManager.calculateMentalHit = function(stress, accRoll, dodgeEva, mentalDef, isDown) {
	var results = {};
	results.dodged = false;
	results.hit = {};
	results.hit.head = false;
	results.hit.torso = false;
	results.hit.leftArm = false;
	results.hit.rightArm = false;
	results.hit.leftLeg = false;
	results.hit.rightLeg = false;
	results.hit.mind = false;
	var mindEvaRoll = this.rollForRanks(mentalDef + dodgeEva, isDown ? 100 : stress);
	if (accRoll > mindEvaRoll) {
		results.hit.mind = true;
	} else {
		results.dodged = true;
	}
	return results;
};

BattleManager.resolvePhysicalDamage = function(hitDamage, accRoll, eva, tripEva, partProt, tough, stress, isDown, extraStress, fullCoverage) {
	var solidDef = fullCoverage ? Math.max(100, partProt.defense.solid) : partProt.defense.solid;
	var fluidDef = fullCoverage ? Math.max(100, partProt.defense.fluid) : partProt.defense.fluid;
	var solidEva = eva + solidDef;
	var fluidEva = eva + fluidDef;
	var solidEvaRoll = this.rollForRanks(solidEva, isDown ? 100 : stress);
	var tripEvaRoll = this.rollForRanks(tripEva, isDown ? 100 : stress);
	var fluidEvaRoll = this.rollForRanks(fluidEva, isDown ? 100 : stress);
	var solidDamScale = solidEvaRoll <= 0 ? (accRoll <= 0 ? 1 : 1.5) : Math.max(0.5, Math.min(1.5, accRoll / solidEvaRoll));
	var tripDamScale = tripEvaRoll <= 0 ? (accRoll <= 0 ? 1 : 1.5) : Math.max(0.5, Math.min(1.5, accRoll / tripEvaRoll));
	var fluidDamScale = fluidEvaRoll <= 0 ? (accRoll <= 0 ? 1 : 1.5) : Math.max(0.5, Math.min(1.5, accRoll / fluidEvaRoll));
	
	var solidCoverage = Math.min(100, solidDef);
	var fluidCoverage = Math.min(100, fluidDef);
	var solidRegularBypass = solidDamScale > (solidCoverage / 100) * 2.5;
	var solidThrustBypass = solidDamScale > (solidCoverage / 100) * 1.66;
	var solidStilettoBypass = solidDamScale > (solidCoverage / 100) * 1.49;
	var fluidBypass = fluidDamScale >= (fluidCoverage / 100) * 1.66;
	
	var returnObj = {};
	returnObj.remainingPower = {};
	returnObj.critical = false;
	
	var bluntPow = hitDamage.blunt;
	var finalCutPow = Math.max(0, solidDamScale * hitDamage.cut - (solidRegularBypass ? tough : partProt.armor.cut + tough));
	bluntPow += Math.max(0, solidDamScale * hitDamage.cut - finalCutPow) / 2;
	var finalCutDamage = Math.max(0, Math.ceil(finalCutPow / tough - 1));
	returnObj.critical = finalCutDamage > 0 && solidRegularBypass ? true : returnObj.critical;
	
	var finalKeenPow = Math.max(0, solidDamScale * hitDamage.keen - (solidRegularBypass ? tough : partProt.armor.cut + tough));
	bluntPow += Math.max(0, solidDamScale * hitDamage.keen - finalKeenPow) / 4;
	var finalKeenDamage = Math.max(0, Math.ceil(finalKeenPow / tough - 1));
	returnObj.critical = finalKeenDamage > 0 && solidRegularBypass ? true : returnObj.critical;
	finalCutDamage += finalKeenDamage;
	
	var finalThrustPow = Math.max(0, solidDamScale * hitDamage.thrust - (solidThrustBypass ? tough : partProt.armor.cut + tough));
	bluntPow += Math.max(0, solidDamScale * hitDamage.thrust - finalThrustPow) / 4;
	var finalThrustDamage = Math.max(0, Math.ceil(finalThrustPow / tough - 1));
	returnObj.critical = finalThrustDamage > 0 && solidThrustBypass ? true : returnObj.critical;
	finalCutDamage += finalThrustDamage;
	
	var finalStilettoPow = Math.max(0, solidDamScale * hitDamage.stiletto - (solidStilettoBypass ? tough : partProt.armor.cut + tough));
	bluntPow += Math.max(0, solidDamScale * hitDamage.stiletto - finalStilettoPow) / 8;
	var finalStilettoDamage = Math.max(0, Math.ceil(finalStilettoPow / tough - 1));
	returnObj.critical = finalStilettoDamage > 0 && solidStilettoBypass ? true : returnObj.critical;
	finalCutDamage += finalStilettoDamage;
	
	var finalBulletPow = Math.max(0, solidDamScale * hitDamage.bullet - (solidThrustBypass ? tough : partProt.armor.bullet + tough));
	bluntPow += Math.max(0, solidDamScale * hitDamage.bullet - finalBulletPow);
	var finalBulletDamage = Math.max(0, Math.ceil(finalBulletPow / tough - 1));
	returnObj.critical = finalBulletDamage > 0 && solidThrustBypass ? true : returnObj.critical;
	returnObj.remainingPower.bullet = finalBulletPow > tough * 2 ? finalBulletPow - tough * 2 : 0;
	var bulletBluntPow = finalBulletPow > 0 ? finalBulletPow * Math.max(0, 1 - returnObj.remainingPower.bullet / finalBulletPow) : 0;
	
	var finalBluntPow = Math.max(0, solidDamScale * bluntPow - (solidRegularBypass ? tough : partProt.armor.blunt + tough));
	var finalBluntDamage = Math.max(0, Math.ceil(finalBluntPow / tough - 1));
	returnObj.critical = finalBluntDamage > 0 && solidRegularBypass ? true : returnObj.critical;
	var bulletBluntDamage = Math.max(0, Math.ceil(bulletBluntPow / tough - 1));
	finalBluntDamage += bulletBluntDamage;
	
	var finalFirePow = Math.max(0, fluidDamScale * hitDamage.fire - (fluidBypass ? tough : partProt.armor.fire + tough));
	var finalFireDamage = Math.max(0, Math.ceil(finalFirePow / tough - 1));
	returnObj.critical = finalFireDamage > 0 && fluidBypass ? true : returnObj.critical;
	
	var finalIcePow = Math.max(0, fluidDamScale * hitDamage.ice - (fluidBypass ? tough : partProt.armor.ice + tough));
	var finalIceDamage = Math.max(0, Math.ceil(finalIcePow / tough - 1));
	returnObj.critical = finalIceDamage > 0 && fluidBypass ? true : returnObj.critical;
	
	var finalCorrosionPow = Math.max(0, fluidDamScale * hitDamage.corrosion - (fluidBypass ? tough : partProt.armor.corrosion + tough));
	var finalCorrosionDamage = Math.max(0, Math.ceil(finalCorrosionPow / tough - 1));
	returnObj.critical = finalCorrosionDamage > 0 && fluidBypass ? true : returnObj.critical;
	
	var lightningFirePow = Math.max(0, solidDamScale * hitDamage.lightning - (solidThrustBypass ? tough : partProt.armor.conducted + tough));
	var lightningFireDamage = Math.max(0, Math.ceil(lightningFirePow / tough - 1));
	returnObj.critical = lightningFireDamage > 0 && solidThrustBypass ? true : returnObj.critical;
	finalFireDamage += lightningFireDamage;
	
	
	var stressInflicted = finalBluntPow > 0
		|| finalCutPow > 0
		|| finalKeenPow > 0
		|| finalThrustPow > 0
		|| finalStilettoPow > 0
		|| finalBulletPow > 0
		|| finalFirePow > 0
		|| finalIcePow > 0
		|| finalCorrosionPow > 0 ? this._baseHitStress : 0;
	
	returnObj.remainingPower.blunt = finalBluntPow > tough * 100 ? finalBluntPow - tough * 100 : 0;
	returnObj.remainingPower.cut = finalCutPow > tough * 100 ? finalCutPow - tough * 100 : 0;
	returnObj.remainingPower.keen = finalKeenPow > tough * 100 ? finalKeenPow - tough * 100 : 0;
	returnObj.remainingPower.thrust = finalThrustPow > tough * 100 ? finalThrustPow - tough * 100 : 0;
	returnObj.remainingPower.stiletto = finalStilettoPow > tough * 100 ? finalStilettoPow - tough * 100 : 0;
	returnObj.remainingPower.fire = finalFirePow > tough * 100 ? finalFirePow - tough * 100 : 0;
	returnObj.remainingPower.ice = finalIcePow > tough * 100 ? finalIcePow - tough * 100 : 0;
	returnObj.remainingPower.corrosion = finalCorrosionPow > tough * 100 ? finalCorrosionPow - tough * 100 : 0;
	returnObj.remainingPower.lightning = lightningFirePow;
	returnObj.shouldCleave = hitDamage.overkillType !== undefined && hitDamage.overkillType === "cleave"
		&& (returnObj.remainingPower.blunt > 0 || returnObj.remainingPower.cut > 0 || returnObj.remainingPower.keen
		|| returnObj.remainingPower.thrust || returnObj.remainingPower.stiletto || returnObj.remainingPower.corrosion
		|| returnObj.remainingPower.bullet);
	returnObj.shouldConduct = returnObj.remainingPower.lightning > 0;
	
	returnObj.damage = Math.min(100, finalBluntDamage + finalCutDamage
		+ finalBulletDamage + finalFireDamage + finalIceDamage + finalCorrosionDamage);
	
	stressInflicted += returnObj.damage / this._damageStressDivisor;
	stressInflicted += Math.max(0, Math.ceil((tripDamScale * hitDamage.trip) / tough - 1));
	
	returnObj.stress = Math.floor(extraStress && stressInflicted > 0 ? stressInflicted + this._baseHitStress : stressInflicted);
	
	return returnObj;
};

BattleManager.resolveMentalDamage = function(hitDamage, accRoll, eva, partProt, tough, stress, isDown) {
	var totalEva = eva + partProt.defense;
	var evaRoll = this.rollForRanks(totalEva, isDown ? 100 : stress);
	var damScale = evaRoll <= 0 ? (accRoll <= 0 ? 1 : 1.5) : Math.max(0.5, Math.min(1.5, accRoll / evaRoll));
	
	var bypass = damScale >= (Math.min(10, partProt.defense) / 100) * 1.66;
	
	var finalPow = Math.max(0, damScale * hitDamage.mental - (bypass ? tough : partProt.armor + tough));
	
	var stress = finalPow > 0 ? this._baseHitStress : 0;
	
	var finalDamage = Math.min(100, Math.max(0, Math.ceil(finalPow / tough - 1)));
	returnObj.critical = finalDamage > 0 && bypass;
	
	stress += finalDamage / this._damageStressDivisor;
	
	var returnObj = {};
	returnObj.stress = Math.floor(stress > 0 ? stress + this._baseHitStress : stress);
	returnObj.damage = finalDamage;
	return returnObj;
};

BattleManager.rollForRanks = function(ranks, stress) {
	var adjustStress = Math.max(0, Math.min(100, stress));
	var adjustedRanks = Math.max(0, ranks + 100 - adjustStress);
	if(adjustStress >= 5) {
		adjustedRanks = Math.max(0, Math.floor(adjustedRanks / 2));
	}
	return adjustedRanks > 0 ? this.rollDoubleDice(adjustedRanks) : 0;
};

BattleManager.rollDoubleDice = function(sides) {
	return this.rollDie(sides) + this.rollDie(sides);
};

BattleManager.rollDie = function(sides) {
	return Math.floor(Math.random() * Math.floor(sides + 1));
};

BattleManager.applyActionResults = function(results, target) {
	if(target.blankDummy()) { return; }
	var initialDownState = target.isDown();
	var totalStress = results.stress.other + results.stress.mind + results.stress.head + results.stress.torso
		+ results.stress.leftArm + results.stress.rightArm + results.stress.leftLeg + results.stress.rightLeg
		+ results.stress.leftHeld + results.stress.rightHeld;
	target.adjustStress(totalStress - results.heal.stress);
	target.adjustDamage("mind", results.damage.mind - results.heal.mind);
	target.adjustDamage("head", results.damage.head - results.heal.head);
	target.adjustDamage("torso", results.damage.torso - results.heal.torso);
	target.adjustDamage("leftArm", results.damage.leftArm - results.heal.leftArm);
	target.adjustDamage("rightArm", results.damage.rightArm - results.heal.rightArm);
	target.adjustDamage("leftLeg", results.damage.leftLeg - results.heal.leftLeg);
	target.adjustDamage("rightLeg", results.damage.rightLeg - results.heal.rightLeg);
	if(initialDownState != target.isDown()) {
		if(initialDownState) {
			results.revived = true;
		} else {
			results.downed = true;
		}
	}
	target.addTbsBuffs(results.buffs);
	if(this._shouldPassTurn) {
		this._shouldPassTurn = results.shouldPassTurn;
	}
};

BattleManager.invokeCounterAttack = function(subject, target) {
    var action = new Game_Action(target);
    action.setAttack();
    action.apply(subject);
    this._logWindow.displayCounter(target);
    this._logWindow.displayActionResults(subject, subject);
};

BattleManager.invokeMagicReflection = function(subject, target) {
    this._logWindow.displayReflection(target);
    this._action.apply(subject);
    this._logWindow.displayActionResults(subject, subject);
};
