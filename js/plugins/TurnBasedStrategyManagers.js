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

SoundManager.getSkillUpgradeSound = function() {
	var skillUpgradeSound = {};
	skillUpgradeSound.name = "Decision5";
	skillUpgradeSound.pan = 0;
	skillUpgradeSound.pitch = 100;
	skillUpgradeSound.volume = 90;
	return skillUpgradeSound;
};

SoundManager.getSkillDowngradeSound = function() {
	var skillDowngradeSound = {};
	skillDowngradeSound.name = "Cancel3";
	skillDowngradeSound.pan = 0;
	skillDowngradeSound.pitch = 100;
	skillDowngradeSound.volume = 90;
	return skillDowngradeSound;
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

SoundManager.loadSkillUpgradeSound = function() {
	if ($dataSystem) {
		AudioManager.loadStaticSe(this.getSkillUpgradeSound());
	}
};

SoundManager.loadSkillDowngradeSound = function() {
	if ($dataSystem) {
		AudioManager.loadStaticSe(this.getSkillDowngradeSound());
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

SoundManager.playSkillUpgradeSound = function() {
	if ($dataSystem) {
		AudioManager.playStaticSe(this.getSkillUpgradeSound());
	}
};

SoundManager.playSkillDowngradeSound = function() {
	if ($dataSystem) {
		AudioManager.playStaticSe(this.getSkillDowngradeSound());
	}
};

//Battle
BattleManager.setup = function(
		tbsActors, tbsActionInfo, tbsTargetX, tbsTargetY, tbsTargets,
		tbsTargetsByHit, tbsTargetPart, rangedDistance
) {
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
	this._rangedDistance = rangedDistance;
	this._processedHitGroups = this.processHitGroups(this._tbsActionInfo.action.hitGroups);
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
	this._processedHitGroups = [];
	this._tbsTargets = [];
	this._tbsTargetsByHit = [];
	this._nonSkippedtargets = [];
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
	this._firstTarget = true;
	this._equipmentBaseToughness = 5;
	this._rangedDistance = 0;
};

BattleManager.processHitGroups = function(hitGroups) {
	var processedHitGroups = [];
	hitGroups.forEach(function (hitGroup) {
		var processedGroup = {};
		processedGroup.hitGroup = hitGroup;
		processedGroup.delay = hitGroup.delay === undefined ? 0 : hitGroup.delay;
		processedGroup.accuracyReduction = 0;
		processedHitGroups.push(processedGroup);
		if(hitGroup.multiple === undefined && hitGroup.multipleDelay === undefined) { return; }
		var curMultiple = 1;
		while(curMultiple < hitGroup.multiple) {
			var processedGroup = {};
			processedGroup.hitGroup = hitGroup;
			processedGroup.delay = (hitGroup.delay === undefined ? 0 : hitGroup.delay) + hitGroup.multipleDelay*curMultiple;
			processedGroup.accuracyReduction = hitGroup.accuracyDegradation === undefined ? 0 : hitGroup.accuracyDegradation*curMultiple;
			processedHitGroups.push(processedGroup);
			curMultiple++;
		}
	});
	return processedHitGroups;
};

BattleManager.setLeftActorStatusWindow = function(actorStatusWindow) {
    this._leftActorStatusWindow = actorStatusWindow;
	this.refreshLeftActorStatusWindow();
};

BattleManager.setRightActorStatusWindow = function(actorStatusWindow) {
    this._rightActorStatusWindow = actorStatusWindow;
	this.refreshRightActorStatusWindow();
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
		
		this._tbsTargets.forEach(function (tbsTarget) {
			var targetIsActor = false;
			this._tbsActors.forEach(function (tbsActor) {
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
		},this);
	} else {
		this._tbsActors.forEach(function (tbsActor) {
			var offset = BattleManager.getBattleOffset(tbsActor.chara.x, tbsActor.chara.y, targetsCenterMapX, targetsCenterMapY, baseMapAngle);
			tbsActor.battler.setShouldMoveIn(true);
			tbsActor.battler.setScreenPos(centerX + offset.x, centerY + offset.y);
		});
		
		this._tbsTargets.forEach(function (tbsTarget) {
			var targetIsActor = false;
			this._tbsActors.forEach(function (tbsActor) {
				if(tbsTarget === tbsActor) {
					targetIsActor = true;
				}
			});
			if(!targetIsActor) {
				var offset = BattleManager.getBattleOffset(tbsTarget.chara.x, tbsTarget.chara.y, targetsCenterMapX, targetsCenterMapY, baseMapAngle);
				tbsTarget.battler.setShouldMoveIn(false);
				tbsTarget.battler.setScreenPos(centerX + offset.x, centerY + offset.y);
			}
		},this);
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
	this._tbsActors[0].battler.useActionItem(this._tbsActionInfo);
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
	} else {
		this.refreshRightActorStatusWindow();
	}
	var i;
	for(i = 0; i < this._processedHitGroups.length; i++) {
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
			} else {
				this._rightActorStatusWindow.close();
				this._rightActorStatusWindow.setShouldReOpen(true);
				this.refreshRightActorStatusWindow();
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
		for(i = 0; i < this._processedHitGroups.length; i++) {
			var processedHitGroup = this._processedHitGroups[i];
			var delay = processedHitGroup.delay;
			if(delay == this._actionTimer) {
				this._resultsPerGroup[i] = this.combatMath(
					this._subject.battler, this._tbsActionInfo, processedHitGroup,
					this._tbsTargets[0].battler, this._tbsTargetsByHit, i, undefined, this._rangedDistance
				);
				this._hitMissDelay[i] = this._logWindow.showInitialAnimations(
					this._subject.battler,
					processedHitGroup.hitGroup,
					this._firstTarget ? this._resultsPerGroup[i].initialAnimationIds : this._resultsPerGroup[i].secondaryInitialAnimationIds,
					this._tbsTargets[0].battler,
					this._showCastAnimation,
					this._firstTarget
				);
				this._showCastAnimation = false;
			}
			if(this._actionTimer < delay) {
				noHitGroupsLeft = false;
			}
		}
		for(i = 0; i < this._processedHitGroups.length; i++) {
			if(this._hitMissDelay[i] !== undefined) {
				if(this._hitMissDelay[i] <= 0) {
					this._hitMissDelay[i] = undefined;
					this._logWindow.showHitMissAnimations(
						this._subject.battler,
						this._tbsTargets[0].battler,
						this._resultsPerGroup[i],
						this._firstTarget
					);
					this.applyActionResults(this._resultsPerGroup[i], this._subject.battler, this._tbsTargets[0].battler);
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
			this._nonSkippedtargets.push(this._tbsTargets.shift());
			while(this._tbsTargets.length > 0 && this.shouldSkipTarget(this._processedHitGroups, this._tbsTargets[0].battler, this._tbsTargetsByHit)) {
				this._tbsTargets.shift();
			}
			if(this._tbsTargets.length <= 0) {
				this._nonSkippedtargets.forEach(function (tbsTarget) {
					tbsTarget.battler.setRoundBuffs(0);
				});
				var subjectRoundBuffs = 0;
				this._resultsPerGroup.forEach(function (results) {
					subjectRoundBuffs += results.subjectRoundBuffs;
				}, this);
				this._subject.battler.setRoundBuffs(subjectRoundBuffs);
				if(this._tbsActionInfo.action.stressCost !== undefined) {
					this._subject.battler.adjustStress(this._tbsActionInfo.action.stressCost);
					this._logWindow.showStressCost(this._subject.battler, this._tbsActionInfo.action.stressCost);
				}
			}
			this.invokeAction(this._subject.battler, target.battler, this._resultsPerGroup);
			this._resultsPerGroup = [];
			this._hitMissDelay = [];
			this._actionTimer = 0;
			this._firstTarget = false;
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
	totalResults.damage.core = 0;
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
	totalResults.heal.core = 0;
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
	totalResults.focus = 0;
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
		totalResults.damage.core += results.damage.core;
		totalResults.heal.stress += results.heal.stress;
		totalResults.heal.head += results.heal.head;
		totalResults.heal.torso += results.heal.torso;
		totalResults.heal.leftArm += results.heal.leftArm;
		totalResults.heal.rightArm += results.heal.rightArm;
		totalResults.heal.leftLeg += results.heal.leftLeg;
		totalResults.heal.rightLeg += results.heal.rightLeg;
		totalResults.heal.mind += results.heal.mind;
		totalResults.heal.core += results.heal.core;
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
		totalResults.focus += results.focus;
		totalResults.downed = results.downed ? true : totalResults.downed;
		totalResults.revived = results.revived ? true : totalResults.revived;
		totalResults.dodged = results.dodged ? totalResults.dodged : false;
	});
	this._logWindow.displayActionResults(subject, target, totalResults);
};

BattleManager.shouldSkipTarget = function(processedHitGroups, target, targetsByHit) {
	var shouldSkip = true;
	var hitGroupIndex = 0;
	processedHitGroups.forEach(function (processedHitGroup) {
		var hitGroup = processedHitGroup.hitGroup;
		var battlersByHit = [];
		targetsByHit[hitGroupIndex].forEach(function (targets) {
			var battlers = targets.map(function (hitTarget) { return hitTarget.battler; });
			battlersByHit.push(battlers);
		});
		for(i = 0; i < hitGroup.hits.length; i++) {
			if(battlersByHit[i].indexOf(target) === -1) { continue; }
			var hit = hitGroup.hits[i];
			if((hit.rangeType === "followUp" && this._nonFollowupsAllDodged[hitGroupIndex])
				|| (hit.randomTarget && Math.random() < 0.5))
			{
				continue;
			}
			shouldSkip = false;
			break;
		}
		hitGroupIndex++;
	},this);
	return shouldSkip;
};

BattleManager.combatMath = function(subject, actionInfo, processedHitGroup, target, targetsByHit, hitGroupIndex, targetingType, rangedDistance) {
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
	
	var physEvaSkill = target.totalSkill("physEvade");
	var defenseSkill = target.defenseSkill();
	var reflexSkill = target.reflexSkill();
	var defenseTestDice = physEvaSkill > defenseSkill ? physEvaSkill - defenseSkill : defenseSkill - physEvaSkill;
	var defenseCrisisDice = physEvaSkill > defenseSkill ? defenseSkill : physEvaSkill;
	var reflexTestDice = physEvaSkill > reflexSkill ? physEvaSkill - reflexSkill : reflexSkill - physEvaSkill;
	var reflexCrisisDice = physEvaSkill > reflexSkill ? reflexSkill : physEvaSkill;
	
	var mentalEvaSkill = target.totalSkill("mentalEvade");
	var mentalArmorSkill = 1;
	var mentalTestDice = mentalEvaSkill > mentalArmorSkill ? mentalEvaSkill - mentalArmorSkill : mentalArmorSkill - mentalEvaSkill;
	var mentalCrisisDice = mentalEvaSkill > mentalArmorSkill ? mentalArmorSkill : mentalEvaSkill;
	
	var tripEvaSkill = target.totalSkill("tripEvade");
	var tripTestDice = tripEvaSkill > reflexSkill ? tripEvaSkill - reflexSkill : reflexSkill - tripEvaSkill;
	var tripCrisisDice = tripEvaSkill > reflexSkill ? reflexSkill : tripEvaSkill;
	
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
	results.heal.core = 0;
	results.focus = 0;
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
	results.secondaryInitialAnimationIds = [];
	results.animationIds = [];
	results.secondaryAnimationIds = [];
	results.animationVariances = [];
	results.secondaryAnimationVariances = [];
	results.ongoingAnimationIds = [];
	results.skipTarget = true;
	results.subjectStress = 0;
	results.subjectRoundBuffs = 0;
	var hitDodged = true;
	var hitGroup = processedHitGroup.hitGroup;
	if(target.blankDummy()) {
		for(i = 0; i < hitGroup.hits.length; i++) {
			var multipleHits = 1;
			if(hitGroup.hits[i].multipleHits !== undefined) {
				multipleHits = hitGroup.hits[i].multipleHits;
			}
			while(multipleHits > 0) {
				multipleHits--;
				var hit = hitGroup.hits[i];
				if(hit.initialAnimationId !== undefined && hit.initialAnimationId > 0) {
					results.initialAnimationIds.push(hit.initialAnimationId);
				}
				if(hit.secondaryInitialAnimationId !== undefined && hit.secondaryInitialAnimationId > 0) {
					results.secondaryInitialAnimationIds.push(hit.secondaryInitialAnimationId);
				}
				if(hit.missAnimationId !== undefined && hit.missAnimationId > 0) {
					results.animationIds.push(hit.missAnimationId);
				}
				if(hit.ongoingMissAnimationId !== undefined && hit.ongoingMissAnimationId > 0) {
					results.ongoingAnimationIds.push(hit.ongoingMissAnimationId);
				}
				if(hit.secondaryMissAnimationId !== undefined && hit.secondaryMissAnimationId > 0) {
					results.secondaryAnimationIds.push(hit.secondaryMissAnimationId);
				}
			}
		}
		results.shouldPassTurn = false;
		return results;
	}
	for(i = 0; i < hitGroup.hits.length; i++) {
		var multipleHits = 1;
		if(hitGroup.hits[i].multipleHits !== undefined) {
			multipleHits = hitGroup.hits[i].multipleHits;
		}
		while(multipleHits > 0) {
			multipleHits--;
			if(battlersByHit[i].indexOf(target) === -1) { continue; }
			var hit = hitGroup.hits[i];
			if((hit.rangeType === "followUp" && this._nonFollowupsAllDodged[hitGroupIndex])
				|| (hit.randomTarget && Math.random() < 0.2))
			{
				continue;
			}
			results.skipTarget = false;
			var variance = 0;
			var damage = hit.damage;
			if(damage) {
				var subjectStress = subject.stress();
				var targetStress = target.stress();
				
				var physDamageBonus = 0;
				if(!hit.ignoreUserStrength && (hit.rangeType === "melee" || hit.rangeType === "thrown")) {
					physDamageBonus = subject.strength();
				}
				
				var hitDamage = this.getCompleteDamage(subject, actionInfo, hit);
				if(hitDamage.blunt !== undefined) { hitDamage.blunt += physDamageBonus; }
				if(hitDamage.cut !== undefined) { hitDamage.cut += physDamageBonus; }
				if(hitDamage.keen !== undefined) { hitDamage.keen += physDamageBonus; }
				if(hitDamage.thrust !== undefined) { hitDamage.thrust += physDamageBonus; }
				if(hitDamage.stiletto !== undefined) { hitDamage.stiletto += physDamageBonus; }
				if(hitDamage.trip !== undefined) { hitDamage.trip += physDamageBonus; }
				
				var dicePool = {};
				dicePool.skill = 0;
				dicePool.expert = 0;
				dicePool.buff = 0;
				dicePool.test = 0;
				dicePool.crisis = 0;
				dicePool.debuff = 0;
				dicePool.tripTest = tripTestDice;
				dicePool.tripCrisis = tripCrisisDice;
				dicePool.mentalTest = mentalTestDice;
				dicePool.mentalCrisis = mentalCrisisDice;
				
				var skillDiceReduction = hit.accuracyPenalty === undefined ? 0 : hit.accuracyPenalty;
				
				var testDiceReduction = hit.evasionPenalty === undefined ? 0 : hit.evasionPenalty;
				dicePool.debuff = subjectStress + processedHitGroup.accuracyReduction + hitDamage.damageReduction + target.roundBuffs();
				dicePool.buff = targetStress + subject.roundBuffs();
				
				if(hit.accuracyDropoffDistance !== undefined && rangedDistance !== undefined) {
					var accuracyDropoff = (rangedDistance*2) / hit.accuracyDropoffDistance;
					variance = Math.random() * accuracyDropoff;
					dicePool.debuff += Math.floor(accuracyDropoff);
				}
				
				var parryable = false;
				var accSkill = 0;
				if(hit.ignoreUserAccuracy) {
					accSkill = hit.accuracy == undefined ? 0 : hit.accuracy;
					dicePool.buff -= subject.roundBuffs();
				} else {
					switch(hit.rangeType) {
						case "melee":
							accSkill = subject.totalSkill("meleeAcc");
							parryable = true;
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
				var abilitySkill = 0;
				if(hit.abilitySkillUsed === undefined) {
					abilitySkill = hit.abilitySkill === undefined ? 0 : hit.abilitySkill;
				} else {
					abilitySkill = subject.totalSkill(hit.abilitySkillUsed);
				}
				
				dicePool.skill = accSkill > abilitySkill ? accSkill - abilitySkill : abilitySkill - accSkill;
				dicePool.expert = accSkill > abilitySkill ? abilitySkill : accSkill;
				
				var skillDice = dicePool.skill;
				dicePool.skill -= Math.min(dicePool.skill, skillDiceReduction);
				skillDiceReduction -= skillDice;
				if(skillDiceReduction > 0) {
					dicePool.expert -= Math.min(dicePool.expert, skillDiceReduction);
				}
				
				if(dicePool.skill <= 0 && dicePool.expert <= 0 && dicePool.buff <= 0) {
					dicePool.buff = 1;
				}
				
				if(hit.evadedBy === "defense") {
					dicePool.test = defenseTestDice;
					dicePool.crisis = defenseCrisisDice;
				} else if(hit.evadedBy === "reflex") {
					dicePool.test = reflexTestDice;
					dicePool.crisis = reflexCrisisDice;
				}
				
				var testDice = dicePool.test;
				dicePool.test -= Math.min(dicePool.test, testDiceReduction);
				testDiceReduction -= testDice;
				if(testDiceReduction > 0) {
					dicePool.crisis -= Math.min(dicePool.crisis, testDiceReduction);
				}
				
				var mentalTestDice = dicePool.mentalTest;
				dicePool.mentalTest -= Math.min(dicePool.mentalTest, testDiceReduction);
				testDiceReduction -= mentalTestDice;
				if(testDiceReduction > 0) {
					dicePool.mentalCrisis -= Math.min(dicePool.mentalCrisis, testDiceReduction);
				}
				
				var isSolid = hitDamage.blunt !== undefined
					|| hitDamage.cut !== undefined
					|| hitDamage.keen !== undefined
					|| hitDamage.thrust !== undefined
					|| hitDamage.stiletto !== undefined
					|| hitDamage.bullet !== undefined
					|| hitDamage.lightning !== undefined
					|| hitDamage.trip !== undefined;
				
				var isFluid = hitDamage.fire !== undefined
					|| hitDamage.ice !== undefined
					|| hitDamage.corrosion !== undefined;
				
				var isMental = hitDamage.psychic !== undefined;
				
				var hitResult = {};
				hitResult.dodged = true;
				hitResult.subjectStress = 0;
				hitResult.targetStress = 0;
				var cleaves = true;
				if(hit.aoe !== undefined && hit.aoe > 0 && hit.aoeType !== "regularHit") {
					if(isSolid || isFluid) {
						cleaves = false;
						hitResult.targetStress = 1;
						hitResult.head = this.calculateSinglePartHit(hitResult, dicePool, parryable, true);
						hitResult.torso = this.calculateSinglePartHit(hitResult, dicePool, parryable);
						hitResult.leftArm = this.calculateSinglePartHit(hitResult, dicePool, parryable);
						hitResult.rightArm = this.calculateSinglePartHit(hitResult, dicePool, parryable);
						hitResult.leftLeg = this.calculateSinglePartHit(hitResult, dicePool, parryable);
						hitResult.rightLeg = this.calculateSinglePartHit(hitResult, dicePool, parryable);
						if(targetLeftHeldProt.defense.solid > 0) {
							hitResult.leftHeld = this.calculateSinglePartHit(hitResult, dicePool, parryable);
						}
						if(targetRightHeldProt.defense.solid > 0) {
							hitResult.rightHeld = this.calculateSinglePartHit(hitResult, dicePool, parryable);
						}
					}
					if(isMental) {
						
					}
				} else {
					if(isSolid || isFluid) {
						if(targetingType === undefined && this._tbsTargetPart != undefined && this._tbsTargetPart != "mobility" && this._tbsTargetPart != "vital") {
							hitResult.targetStress = 1;
							hitResult[this._tbsTargetPart] = this.calculateSinglePartHit(hitResult, dicePool, parryable, this._tbsTargetPart === "head");
						} else {
							var targetingMobility = this._tbsTargetPart === "mobility";
							var defendingWithLegs = target.limbsType() === "winged" && target.isFlying();
							var leftDefendingLimbProt = defendingWithLegs ? targetLeftLegProt : targetLeftArmProt;
							var rightDefendingLimbProt = defendingWithLegs ? targetRightLegProt : targetRightArmProt;
							var leftDefendingHeldProt = targetLeftHeldProt;
							var rightDefendingHeldProt = targetRightHeldProt;
							var leftLimbDamagePotential = this.getPartDamagePotential(hitDamage, leftDefendingLimbProt);
							var rightLimbDamagePotential = this.getPartDamagePotential(hitDamage, rightDefendingLimbProt);
							var leftHeldDamagePotential = this.getPartDamagePotential(hitDamage, leftDefendingHeldProt);
							var rightHeldDamagePotential = this.getPartDamagePotential(hitDamage, rightDefendingHeldProt);
							
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
							
							var leftHeldFirst = false;
							var firstHeldDefense = 0;
							var secondHeldDefense = 0;
							if(target.equips()[0] && target.equips()[1]) {
								if(leftHeldDamagePotential < rightHeldDamagePotential) {
									leftHeldFirst = true;
								} else if (leftHeldDamagePotential === rightHeldDamagePotential) {
									if(Math.random() >= 0.5) {
										leftHeldFirst = false;
									} else {
										leftHeldFirst = true;
									}
								}
								firstHeldDefense = rightDefendingHeldProt.defense.solid;
								secondHeldDefense = leftDefendingHeldProt.defense.solid;
								if(leftHeldFirst) {
									firstHeldDefense = leftDefendingHeldProt.defense.solid;
									secondHeldDefense = rightDefendingHeldProt.defense.solid;
								}
							} else if(target.equips()[0]) {
								firstHeldDefense = rightDefendingHeldProt.defense.solid;
								if(target.handedness() === "left") {
									leftHeldFirst = true;
									firstHeldDefense = leftDefendingHeldProt.defense.solid;
								}
							} else if(target.equips()[1]) {
								firstHeldDefense = rightDefendingHeldProt.defense.solid;
								if(target.handedness() === "right") {
									leftHeldFirst = true;
									firstHeldDefense = leftDefendingHeldProt.defense.solid;
								}
							}
							
							var leftMobilityFirst = false;
							if(targetingMobility) {
								var leftMobilityLimbProt = defendingWithLegs ? targetLeftArmProt : targetLeftLegProt;
								var rightMobilityLimbProt = defendingWithLegs ? targetRightArmProt : targetRightLegProt ;
								var leftMobilityDamagePotential = this.getPartDamagePotential(hitDamage, leftMobilityLimbProt);
								var rightMobilityDamagePotential = this.getPartDamagePotential(hitDamage, rightMobilityLimbProt);
								if(leftMobilityDamagePotential < rightMobilityDamagePotential) {
									leftMobilityFirst = true;
								} else if (leftMobilityDamagePotential === rightMobilityDamagePotential) {
									if(Math.random() >= 0.5) {
										leftMobilityFirst = false;
									} else {
										leftMobilityFirst = true;
									}
								}
							}
							
							this.calculatePhysicalHit(
								hitResult,
								dicePool,
								leftLimbFirst,
								leftHeldFirst,
								targetingMobility,
								leftMobilityFirst,
								defendingWithLegs,
								targetingType,
								firstHeldDefense,
								secondHeldDefense,
								parryable
							);
						}
						if(isMental && !hitResult.dodged) {
							
						}
					} else if(isMental) {
						this.calculateMentalHit(
							hitResult,
							dicePool
						);
					}
				}
				results.subjectStress += hitResult.subjectStress;
				results.stress.other += hitResult.targetStress;
				if(!hitResult.dodged) {
					if(hitResult.head || hitResult.torso || hitResult.leftArm || hitResult.rightArm
						|| hitResult.leftLeg || hitResult.rightLeg || hitResult.leftHeld || hitResult.rightHeld) {
						if(hitResult.head) {
							results.hit.head = true;
							var damageResult = this.resolvePhysicalDamage(
								hitResult.head,
								hitDamage,
								targetHeadProt,
								target.toughness(),
								dicePool,
								cleaves,
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
						if(hitResult.torso) {
							results.hit.torso = true;
							var damageResult = this.resolvePhysicalDamage(
								hitResult.torso,
								hitDamage,
								targetTorsoProt,
								target.toughness()*2,
								dicePool,
								cleaves,
								false
							);
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
						if(hitResult.leftArm) {
							results.hit.leftArm = true;
							var damageResult = this.resolvePhysicalDamage(
								hitResult.leftArm,
								hitDamage,
								targetLeftArmProt,
								target.toughness(),
								dicePool,
								cleaves,
								target.limbsType() === "winged" && target.isFlying()
							);
							results.stress.leftArm += damageResult.stress;
							results.damage.leftArm += damageResult.damage;
							results.critical.leftArm = damageResult.critical ? true : results.critical.leftArm;
							if(damageResult.stress > 0 || damageResult.damage > 0) {
								results.shouldPassTurn = false;
							}
							if(target.limbsType() !== "winged" || !target.isFlying() && results.shouldCleave) {
								var cleaveResults = this.cleaveMath(subject, actionInfo, hit, processedHitGroup.accuracyReduction, target, targetsByHit, hitGroupIndex, damageResult, "vitalOnly", rangedDistance);
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
						if(hitResult.rightArm) {
							results.hit.rightArm = true;
							var damageResult = this.resolvePhysicalDamage(
								hitResult.rightArm,
								hitDamage,
								targetRightArmProt,
								target.toughness(),
								dicePool,
								cleaves,
								target.limbsType() === "winged" && target.isFlying()
							);
							results.stress.rightArm += damageResult.stress;
							results.damage.rightArm += damageResult.damage;
							results.critical.rightArm = damageResult.critical ? true : results.critical.rightArm;
							if(damageResult.stress > 0 || damageResult.damage > 0) {
								results.shouldPassTurn = false;
							}
							if(target.limbsType() !== "winged" || !target.isFlying() && results.shouldCleave) {
								var cleaveResults = this.cleaveMath(subject, actionInfo, hit, processedHitGroup.accuracyReduction, target, targetsByHit, hitGroupIndex, damageResult, "vitalOnly", rangedDistance);
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
						if(hitResult.leftLeg) {
							results.hit.leftLeg = true;
							var damageResult = this.resolvePhysicalDamage(
								hitResult.leftLeg,
								hitDamage,
								targetLeftLegProt,
								target.toughness(),
								dicePool,
								cleaves,
								target.limbsType() !== "quadrupedal" && (target.limbsType() !== "winged" || !target.isFlying())
							);
							results.stress.leftLeg += damageResult.stress;
							results.damage.leftLeg += damageResult.damage;
							results.critical.leftLeg = damageResult.critical ? true : results.critical.leftLeg;
							if(damageResult.stress > 0 || damageResult.damage > 0) {
								results.shouldPassTurn = false;
							}
							if(target.limbsType() === "winged" && target.isFlying() && results.shouldCleave) {
								var cleaveResults = this.cleaveMath(subject, actionInfo, hit, processedHitGroup.accuracyReduction, target, targetsByHit, hitGroupIndex, damageResult, "vitalOnly", rangedDistance);
								results.hit.torso = cleaveResults.hit.torso ? true : results.hit.torso;
								results.hit.head = cleaveResults.hit.head ? true : results.hit.head;
								results.stress.torso += cleaveResults.stress.torso;
								results.stress.head += cleaveResults.stress.head;
								results.damage.torso += cleaveResults.damage.torso;
								results.damage.head += cleaveResults.damage.head;
							}
						}
						if(hitResult.rightLeg) {
							results.hit.rightLeg = true;
							var damageResult = this.resolvePhysicalDamage(
								hitResult.rightLeg,
								hitDamage,
								targetRightLegProt,
								target.toughness(),
								dicePool,
								cleaves,
								target.limbsType() !== "quadrupedal" && (target.limbsType() !== "winged" || !target.isFlying())
							);
							results.stress.rightLeg += damageResult.stress;
							results.damage.rightLeg += damageResult.damage;
							results.critical.rightLeg = damageResult.critical ? true : results.critical.rightLeg;
							if(damageResult.stress > 0 || damageResult.damage > 0) {
								results.shouldPassTurn = false;
							}
							if(target.limbsType() === "winged" && target.isFlying() && results.shouldCleave) {
								var cleaveResults = this.cleaveMath(subject, actionInfo, hit, processedHitGroup.accuracyReduction, target, targetsByHit, hitGroupIndex, damageResult, "vitalOnly", rangedDistance);
								results.hit.torso = cleaveResults.hit.torso ? true : results.hit.torso;
								results.hit.head = cleaveResults.hit.head ? true : results.hit.head;
								results.stress.torso += cleaveResults.stress.torso;
								results.stress.head += cleaveResults.stress.head;
								results.damage.torso += cleaveResults.damage.torso;
								results.damage.head += cleaveResults.damage.head;
							}
						}
						if(hitResult.leftHeld) {
							results.hit.leftHeld = true;
							var damageResult = this.resolvePhysicalDamage(
								hitResult.leftHeld,
								hitDamage,
								targetLeftHeldProt, 
								this._equipmentBaseToughness,
								dicePool,
								cleaves,
								false
							);
							results.stress.leftHeld += damageResult.stress;
							if(damageResult.stress > 0 || damageResult.damage > 0) {
								results.shouldPassTurn = false;
							}
							if(results.shouldCleave) {
								var cleaveResults = this.cleaveMath(subject, actionInfo, hit, processedHitGroup.accuracyReduction, target, targetsByHit, hitGroupIndex, damageResult, "limbsAndVital", rangedDistance);
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
						if(hitResult.rightHeld) {
							results.hit.rightHeld = true;
							var damageResult = this.resolvePhysicalDamage(
								hitResult.rightHeld,
								hitDamage,
								targetRightHeldProt,
								this._equipmentBaseToughness,
								dicePool,
								cleaves,
								false
							);
							results.stress.rightHeld += damageResult.stress;
							if(damageResult.stress > 0 || damageResult.damage > 0) {
								results.shouldPassTurn = false;
							}
							if(results.shouldCleave) {
								var cleaveResults = this.cleaveMath(subject, actionInfo, hit, processedHitGroup.accuracyReduction, target, targetsByHit, hitGroupIndex, damageResult, "limbsAndVital", rangedDistance);
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
								var conductResults = this.conductMath(target, damageResult, "rightHeld");
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
					if(hitResult.mind) {
						results.hit.mind = true;
						var damageResult = this.resolveMentalDamage(
							hitResult.mind,
							hitDamage, 
							targetMentalProt, 
							target.mentalToughness(), 
							true);
						results.stress.mind += damageResult.stress;
						results.damage.mind += damageResult.damage;
						results.critical.mind = damageResult.critical ? true : results.critical.mind;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
						}
					}
					hitDodged = false;
					results.dodged = false;
					results.stress.other += hitDamage.stress !== undefined ? hitDamage.stress : 0;
				}
			}
			var heal = hit.heal;
			if(heal) {
				hitDodged = false;
				results.dodged = false;
				results.shouldPassTurn = false;
				
				var dicePool = {};
				dicePool.skill = 0;
				dicePool.expert = 0;
				dicePool.buff = 0;
				
				var skillDiceReduction = hit.accuracyPenalty === undefined ? 0 : hit.accuracyPenalty;
				
				var testDiceReduction = hit.evasionPenalty === undefined ? 0 : hit.evasionPenalty;
				var hitSupport = this.getCompleteSupport(subject, actionInfo, hit);
				dicePool.debuff = subjectStress + processedHitGroup.accuracyReduction + hitSupport.supportReduction + target.roundBuffs();
				dicePool.buff = targetStress + subject.roundBuffs();
				
				if(hit.accuracyDropoffDistance !== undefined && rangedDistance !== undefined) {
					var accuracyDropoff = (rangedDistance*2) / hit.accuracyDropoffDistance;
					variance = Math.random() * accuracyDropoff;
					dicePool.debuff += Math.floor(accuracyDropoff);
				}
				
				var parryable = false;
				var accSkill = 0;
				if(hit.ignoreUserAccuracy) {
					accSkill = hit.accuracy == undefined ? 0 : hit.accuracy;
					dicePool.buff -= subject.roundBuffs();
				} else {
					accSkill = subject.totalSkill("manualDex");
				}
				var abilitySkill = 0;
				if(hit.abilitySkillUsed === undefined) {
					abilitySkill = hit.abilitySkill === undefined ? 0 : hit.abilitySkill;
				} else {
					abilitySkill = subject.totalSkill(hit.abilitySkillUsed);
				}
				
				dicePool.skill = accSkill > abilitySkill ? accSkill - abilitySkill : abilitySkill - accSkill;
				dicePool.expert = accSkill > abilitySkill ? abilitySkill : accSkill;
				
				var skillDice = dicePool.skill;
				dicePool.skill -= Math.min(dicePool.skill, skillDiceReduction);
				skillDiceReduction -= skillDice;
				if(skillDiceReduction > 0) {
					dicePool.expert -= Math.min(dicePool.expert, skillDiceReduction);
				}
				
				if(dicePool.skill <= 0 && dicePool.expert <= 0 && dicePool.buff <= 0) {
					dicePool.buff = 1;
				}
				
				if(hitSupport.stress !== undefined) {
					var stressHealRoll = this.rollSkillDice(dicePool.skill, dicePool.expert, dicePool.buff);
					var stressRoll = this.rollTestDice(0, 0, subject.stress());
					
					stressHealRoll.bonuses += stressHealRoll.rareBonuses * 2;
					stressHealRoll.hits -= stressRoll.misses;
					stressHealRoll.bonuses -= stressRoll.penalties;
					
					results.heal.stress += hitSupport.stress + stressHealRoll.hits;
				}
				if(hitSupport.damage !== undefined) {
					var healRoll = this.rollSkillDice(dicePool.skill, dicePool.expert, dicePool.buff);
					var stressRoll = this.rollTestDice(0, 0, subject.stress());
					
					healRoll.bonuses += healRoll.rareBonuses * 2;
					healRoll.hits -= stressRoll.misses;
					healRoll.bonuses -= stressRoll.penalties;
					
					var healing = hitSupport.damage + healRoll.hits;
					
					results.heal.core += healing;
					var tough = target.toughness();
					
					var partHealing = healing;
					var stressReduction = healRoll.bonuses;
					if(partHealing > 0) {
						results.hit.head = true;
						results.heal.head += partHealing > target.getDamage("head") ? target.getDamage("head") : partHealing;
						var healStress = Math.floor((results.heal.head / (tough/2)) * 2);
						results.stress.head += Math.max(0, healStress - stressReduction);
						partHealing -= target.getDamage("head");
						stressReduction = Math.max(0, stressReduction - healStress);
					}
					if(partHealing > 0) {
						results.hit.torso = true;
						results.heal.torso += partHealing > target.getDamage("torso") ? target.getDamage("torso") : partHealing;
						var healStress = Math.floor(results.heal.torso / (tough/2));
						results.stress.torso += Math.max(0, healStress - stressReduction);
						partHealing -= target.getDamage("torso");
						stressReduction = Math.max(0, stressReduction - healStress);
					}
					var limbLoops = 0;
					var leg = Math.random() >= 0.5 ? "leftLeg" : "rightLeg";
					while(partHealing > 0 && limbLoops < 2) {
						results.hit[leg] = true;
						results.heal[leg] += partHealing > target.getDamage(leg) ? target.getDamage(leg) : partHealing;
						var healStress = Math.floor((results.heal[leg] / (tough/2)) * 2);
						results.stress[leg] += Math.max(0, healStress - stressReduction);
						partHealing -= target.getDamage(leg);
						stressReduction = Math.max(0, stressReduction - healStress);
						leg = leg === "leftLeg" ? "rightLeg" : "leftLeg";
						limbLoops++;
					}
					limbLoops = 0;
					var arm = Math.random() >= 0.5 ? "leftArm" : "rightArm";
					while(partHealing > 0 && limbLoops < 2) {
						results.hit[arm] = true;
						results.heal[arm] += partHealing > target.getDamage(arm) ? target.getDamage(arm) : partHealing;
						var healStress = Math.floor(results.heal[arm] / (tough/2));
						results.stress[arm] += Math.max(0, healStress - stressReduction);
						partHealing -= target.getDamage(leg);
						stressReduction = Math.max(0, stressReduction - healStress);
						arm = arm === "leftArm" ? "rightArm" : "leftArm";
						limbLoops++;
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
			if(hit.focus !== undefined) {
				hitDodged = false;
				results.dodged = false;
				results.shouldPassTurn = false;
				
				var dicePool = {};
				dicePool.skill = 0;
				dicePool.expert = 0;
				dicePool.buff = 0;
				
				var skillDiceReduction = hit.accuracyPenalty === undefined ? 0 : hit.accuracyPenalty;
				
				var testDiceReduction = hit.evasionPenalty === undefined ? 0 : hit.evasionPenalty;
				var hitSupport = this.getCompleteSupport(subject, actionInfo, hit);
				dicePool.debuff = subjectStress + processedHitGroup.accuracyReduction + hitSupport.supportReduction + target.roundBuffs();
				dicePool.buff = targetStress + subject.roundBuffs();
				
				if(hit.accuracyDropoffDistance !== undefined && rangedDistance !== undefined) {
					var accuracyDropoff = (rangedDistance*2) / hit.accuracyDropoffDistance;
					variance = Math.random() * accuracyDropoff;
					dicePool.debuff += Math.floor(accuracyDropoff);
				}
				
				var parryable = false;
				var accSkill = 0;
				if(hit.ignoreUserAccuracy) {
					accSkill = hit.accuracy == undefined ? 0 : hit.accuracy;
					dicePool.buff -= subject.roundBuffs();
				} else {
					accSkill = subject.totalSkill("manualDex");
				}
				var abilitySkill = 0;
				if(hit.abilitySkillUsed === undefined) {
					abilitySkill = hit.abilitySkill === undefined ? 0 : hit.abilitySkill;
				} else {
					abilitySkill = subject.totalSkill(hit.abilitySkillUsed);
				}
				
				dicePool.skill = accSkill > abilitySkill ? accSkill - abilitySkill : abilitySkill - accSkill;
				dicePool.expert = accSkill > abilitySkill ? abilitySkill : accSkill;
				
				var skillDice = dicePool.skill;
				dicePool.skill -= Math.min(dicePool.skill, skillDiceReduction);
				skillDiceReduction -= skillDice;
				if(skillDiceReduction > 0) {
					dicePool.expert -= Math.min(dicePool.expert, skillDiceReduction);
				}
				
				if(dicePool.skill <= 0 && dicePool.expert <= 0 && dicePool.buff <= 0) {
					dicePool.buff = 1;
				}
				
				if(hitSupport.focus !== undefined) {
					var focusGainRoll = this.rollSkillDice(dicePool.skill, dicePool.expert, dicePool.buff);
					var stressRoll = this.rollTestDice(0, 0, subject.stress());
					
					focusGainRoll.bonuses += focusGainRoll.rareBonuses * 2;
					focusGainRoll.hits -= stressRoll.misses;
					focusGainRoll.bonuses -= stressRoll.penalties;
					
					results.focus += hitSupport.focus + focusGainRoll.hits;
				}
			}
			if(hit.rollInitiative) {
				hitDodged = false;
				results.dodged = false;
				results.shouldPassTurn = false;
				var stressRecovery = subject.stressRecovery();
				var perception = subject.totalSkill("perception");
				var reflex = subject.reflexSkill();
				var stress = Math.max(0, subject.stress() - stressRecovery);
				results.heal.stress += stressRecovery;
				var roundBuffs = subject.roundBuffs();
				var skillDice = perception > reflex ? perception - reflex : reflex - perception;
				var expertDice = perception > reflex ? reflex : perception;
				var buffDice = roundBuffs;
				var debuffDice = stress;
				var initiativeRoll = this.rollSkillDice(skillDice, expertDice, buffDice);
				var stressRoll = this.rollTestDice(0, 0, debuffDice);
				initiativeRoll.bonuses += initiativeRoll.rareBonuses * 2;
				initiativeRoll.hits -= stressRoll.misses;
				initiativeRoll.bonuses -= stressRoll.penalties;
				if(initiativeRoll.bonuses > stress) {
					results.subjectRoundBuffs += initiativeRoll.bonuses - stress;
				}
				if(initiativeRoll.bonuses > 0) {
					results.heal.stress += initiativeRoll.bonuses;
				}
			}
			if(hit.initialAnimationId !== undefined && hit.initialAnimationId > 0) {
				results.initialAnimationIds.push(hit.initialAnimationId);
			}
			if(hit.secondaryInitialAnimationId !== undefined && hit.secondaryInitialAnimationId > 0) {
				results.secondaryInitialAnimationIds.push(hit.secondaryInitialAnimationId);
			}
			if(hitDodged) {
				if(hit.missAnimationId !== undefined && hit.missAnimationId > 0) {
					results.animationIds.push(hit.missAnimationId);
				}
				if(hit.ongoingMissAnimationId !== undefined && hit.ongoingMissAnimationId > 0) {
					results.ongoingAnimationIds.push(hit.ongoingMissAnimationId);
				}
				if(hit.secondaryMissAnimationId !== undefined && hit.secondaryMissAnimationId > 0) {
					results.secondaryAnimationIds.push(hit.secondaryMissAnimationId);
				}
			} else {
				if(hit.animationId !== undefined && hit.animationId > 0) {
					results.animationIds.push(hit.animationId);
					results.animationVariances.push(variance);
				}
				if(hit.ongoingAnimationId !== undefined && hit.ongoingAnimationId > 0) {
					results.ongoingAnimationIds.push(hit.ongoingAnimationId);
				}
				if(hit.secondaryAnimationId !== undefined && hit.secondaryAnimationId > 0) {
					results.secondaryAnimationIds.push(hit.secondaryAnimationId);
					results.secondaryAnimationVariances.push(variance);
				}
			}
			if(!hitDodged) {
				this._nonFollowupsAllDodged[hitGroupIndex] = false;
			}
		}
	}
	return results;
};

BattleManager.cleaveMath = function(
	subject,
	actionInfo,
	hit,
	accuracyReduction,
	target,
	targetsByHit,
	hitGroupIndex,
	damageResult,
	targetingType,
	rangedDistance
) {
	var hitGroup = {};
	hitGroup.hits = [];
	var newHit = {};
	newHit.rangeType = hit.rangeType;
	newHit.evasionPenalty = hit.evasionPenalty;
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
	var processedHitGroup = {};
	processedHitGroup.hitGroup = hitGroup;
	processedHitGroup.delay = 0;
	processedHitGroup.accuracyReduction = accuracyReduction;
	return this.combatMath(
		subject,
		actionInfo,
		processedHitGroup,
		target,
		targetsByHit,
		hitGroupIndex,
		targetingType,
		rangedDistance
	);
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
			conductResults.damage.torso += lightningPow;
			conductResults.stress.torso += 1;
			break;
		case "torso":
			var random = Math.random();
			if(target.limbsType() === "quadrupedal") {
				if(random >= 0.75) {
					conductResults = this.conductMath(target, damageResult, "leftArm");
					conductResults.damage.leftArm += lightningPow;
					conductResults.stress.leftArm += 1;
				} else if(random >= 0.5) {
					conductResults = this.conductMath(target, damageResult, "rightArm");
					conductResults.damage.rightArm += lightningPow;
					conductResults.stress.rightArm += 1;
				} else if(random >= 0.25) {
					conductResults = this.conductMath(target, damageResult, "leftLeg");
					conductResults.damage.leftLeg += lightningPow;
					conductResults.stress.leftLeg += 1;
				} else {
					conductResults = this.conductMath(target, damageResult, "rightLeg");
					conductResults.damage.rightLeg += lightningPow;
					conductResults.stress.rightLeg += 1;
				}
			} else {
				var doubleStress = target.limbsType() === "winged" && target.isFlying() ? 1 : 2;
				if(random >= 0.5) {
					conductResults = this.conductMath(target, damageResult, "leftLeg");
					conductResults.damage.leftLeg += lightningPow;
					conductResults.stress.leftLeg += doubleStress;
				} else {
					conductResults = this.conductMath(target, damageResult, "rightLeg");
					conductResults.damage.rightLeg += lightningPow;
					conductResults.stress.rightLeg += doubleStress;
				}
			}
			break;
		case "leftArm":
		case "rightArm":
			if(target.limbsType() !== "quadrupedal") {
				conductResults = this.conductMath(target. damageResult, "torso");
				conductResults.damage.torso += lightningPow;
				conductResults.stress.torso += 1;
			}
			break;
		case "leftHeld":
			var doubleStress = target.limbsType() === "winged" && target.isFlying() ? 2 : 1;
			conductResults = this.conductMath(target, damageResult, "leftArm");
			conductResults.damage.leftArm += lightningPow;
			conductResults.stress.leftArm += doubleStress;
			break;
		case "rightHeld":
			var doubleStress = target.limbsType() === "winged" && target.isFlying() ? 2 : 1;
			conductResults = this.conductMath(target, damageResult, "rightArm");
			conductResults.damage.rightArm += lightningPow;
			conductResults.stress.rightArm += doubleStress;
			break;
	}
	return conductResults;
};

BattleManager.getPartDamagePotential = function(damage, partProt) {
	var damagePotential = damage.blunt !== undefined ? Math.max(0, damage.blunt - partProt.armor.blunt) : 0;
	damagePotential += damage.cut !== undefined ? Math.max(0, damage.cut - partProt.armor.cut) : 0;
	damagePotential += damage.keen !== undefined ? Math.max(0, damage.keen - partProt.armor.cut) : 0;
	damagePotential += damage.thrust !== undefined ? Math.max(0, damage.thrust - partProt.armor.cut) : 0;
	damagePotential += damage.stiletto !== undefined ? Math.max(0, damage.stiletto - partProt.armor.cut) : 0;
	damagePotential += damage.bullet !== undefined ? Math.max(0, damage.bullet - partProt.armor.bullet) : 0;
	damagePotential += damage.fire !== undefined ? Math.max(0, damage.fire - partProt.armor.fire) : 0;
	damagePotential += damage.ice !== undefined ? Math.max(0, damage.ice - partProt.armor.ice) : 0;
	damagePotential += damage.corrosion !== undefined ? Math.max(0, damage.corrosion - partProt.armor.corrosion) : 0;
	damagePotential += damage.lightning !== undefined ? Math.max(0, damage.lightning - partProt.armor.conducted) : 0;
	
	return damagePotential;
};

BattleManager.getUsedParts = function(subject, actionInfo, hit) {
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
	return actualUsedParts;
};

BattleManager.getCompleteDamage = function(subject, actionInfo, hit) {
	var damage = hit.damage;
	var completeDamage = {};
	completeDamage.overkillType = hit.overkillType;
	if(!damage) {
		damage = {};
	}
	var actualUsedParts = this.getUsedParts(subject, actionInfo, hit);
	var damageReduction = 0;
	if(subject && actualUsedParts.length > 0) {
		var denom = actualUsedParts.length;
		var numer = 0;
		var tough = subject.toughness();
		if(actualUsedParts.indexOf("mind") >= 0) {
			numer += subject.getDamage("mind") >= tough ? 3 : (subject.getDamage("mind") >= tough/2 ? 1 : 0);
		}
		if(actualUsedParts.indexOf("head") >= 0) {
			numer += subject.getDamage("head") >= tough ? 3 : (subject.getDamage("head") >= tough/2 ? 1 : 0);
		}
		if(actualUsedParts.indexOf("torso") >= 0) {
			numer += subject.getDamage("torso") >= tough*2 ? 3 : (subject.getDamage("torso") >= tough ? 1 : 0);
		}
		if(actualUsedParts.indexOf("leftArm") >= 0) {
			numer += subject.getDamage("leftArm") >= tough ? 3 : (subject.getDamage("leftArm") >= tough/2 ? 1 : 0);
		}
		if(actualUsedParts.indexOf("rightArm") >= 0) {
			numer += subject.getDamage("rightArm") >= tough ? 3 : (subject.getDamage("rightArm") >= tough/2 ? 1 : 0);
		}
		if(actualUsedParts.indexOf("leftLeg") >= 0) {
			numer += subject.getDamage("leftLeg") >= tough ? 3 : (subject.getDamage("leftLeg") >= tough/2 ? 1 : 0);
		}
		if(actualUsedParts.indexOf("rightLeg") >= 0) {
			numer += subject.getDamage("rightLeg") >= tough ? 3 : (subject.getDamage("rightLeg") >= tough/2 ? 1 : 0);
		}
		damageReduction = Math.floor(numer / denom);
	}
	
	completeDamage.damageReduction = damageReduction;
	completeDamage.stress = damage.stress !== undefined ? damage.stress - damageReduction : undefined;
	completeDamage.trip = damage.trip !== undefined ? damage.trip - damageReduction : undefined;
	completeDamage.blunt = damage.blunt !== undefined ? damage.blunt - damageReduction : undefined;
	completeDamage.cut = damage.cut !== undefined ? damage.cut - damageReduction : undefined;
	completeDamage.keen = damage.keen !== undefined ? damage.keen - damageReduction : undefined;
	completeDamage.thrust = damage.thrust !== undefined ? damage.thrust - damageReduction : undefined;
	completeDamage.stiletto = damage.stiletto !== undefined ? damage.stiletto - damageReduction : undefined;
	completeDamage.bullet = damage.bullet !== undefined ? damage.bullet - damageReduction : undefined;
	completeDamage.fire = damage.fire !== undefined ? damage.fire - damageReduction : undefined;
	completeDamage.ice = damage.ice !== undefined ? damage.ice - damageReduction : undefined;
	completeDamage.lightning = damage.lightning !== undefined ? damage.lightning - damageReduction : undefined;
	completeDamage.corrosion = damage.corrosion !== undefined ? damage.corrosion - damageReduction : undefined;
	completeDamage.psychic = damage.psychic !== undefined ? damage.psychic - damageReduction : undefined;
	return completeDamage;
};

BattleManager.getCompleteSupport = function(subject, actionInfo, hit) {
	var heal = hit.heal;
	var focus = hit.focus;
	var completeSupport = {};
	if(!heal) {
		heal = {};
	}
	var actualUsedParts = this.getUsedParts(subject, actionInfo, hit);
	var supportReduction = 0;
	if(subject && actualUsedParts.length > 0) {
		var denom = actualUsedParts.length;
		var numer = 0;
		var tough = subject.toughness();
		if(actualUsedParts.indexOf("mind") >= 0) {
			numer += subject.getDamage("mind") >= tough ? 3 : (subject.getDamage("mind") >= tough/2 ? 1 : 0);
		}
		if(actualUsedParts.indexOf("head") >= 0) {
			numer += subject.getDamage("head") >= tough ? 3 : (subject.getDamage("head") >= tough/2 ? 1 : 0);
		}
		if(actualUsedParts.indexOf("torso") >= 0) {
			numer += subject.getDamage("torso") >= tough*2 ? 3 : (subject.getDamage("torso") >= tough ? 1 : 0);
		}
		if(actualUsedParts.indexOf("leftArm") >= 0) {
			numer += subject.getDamage("leftArm") >= tough ? 3 : (subject.getDamage("leftArm") >= tough/2 ? 1 : 0);
		}
		if(actualUsedParts.indexOf("rightArm") >= 0) {
			numer += subject.getDamage("rightArm") >= tough ? 3 : (subject.getDamage("rightArm") >= tough/2 ? 1 : 0);
		}
		if(actualUsedParts.indexOf("leftLeg") >= 0) {
			numer += subject.getDamage("leftLeg") >= tough ? 3 : (subject.getDamage("leftLeg") >= tough/2 ? 1 : 0);
		}
		if(actualUsedParts.indexOf("rightLeg") >= 0) {
			numer += subject.getDamage("rightLeg") >= tough ? 3 : (subject.getDamage("rightLeg") >= tough/2 ? 1 : 0);
		}
		supportReduction = Math.floor(numer / denom);
	}
	
	completeSupport.supportReduction = supportReduction;
	completeSupport.stress = heal.stress !== undefined ? heal.stress - supportReduction : undefined;
	completeSupport.damage = heal.damage !== undefined ? heal.damage - supportReduction : undefined;
	completeSupport.focus = focus !== undefined ? focus - supportReduction : undefined;
	return completeSupport;
};

BattleManager.calculateSinglePartHit = function(hitResult, dicePool, parryable, hardToHit) {
	var partResult = {};
	partResult.damageBonus = 0;
	partResult.rareDamageBonus = 0;
	
	var skillRoll = this.rollSkillDice(dicePool.skill, dicePool.expert, dicePool.buff);
	var testRoll = this.rollTestDice(dicePool.test, dicePool.crisis, dicePool.debuff);
	
	var bonuses = skillRoll.bonuses - testRoll.penalties;
	
	var misses = testRoll.misses + (hardToHit ? 1 : 0);
	if(skillRoll.hits <= misses) {
		//miss
		//determine bonuses
		hitResult.targetStress += bonuses > 0 ? bonuses : 0;
		
		//determine rare bonuses
		hitResult.targetStress += skillRoll.rareBonuses*2;
		
		//determine penalties
		if(parryable) {
			hitResult.subjectStress += bonuses < 0 ? -bonuses : 0;
		}
		
		//determine rare penalties
		if(parryable) {
			hitResult.subjectStress += testRoll.rarePenalties * 2;
		}
		
		return undefined;
	}
	
	//hit
	hitResult.dodged = false;
	partResult.damageBonus = skillRoll.hits - misses;
	partResult.rareDamageBonus = skillRoll.rareBonuses;
	
	//determine bonuses
	hitResult.targetStress += bonuses > 0 ? bonuses : 0;
	
	//determine rare bonuses
	hitResult.targetStress += skillRoll.rareBonuses*2;
		
	//determine penalties
	if(parryable) {
		hitResult.subjectStress += bonuses < 0 ? -bonuses : 0;
	}
	
	//determine rare penalties
	if(parryable) {
		hitResult.subjectStress += testRoll.rarePenalties * 2;
	}
	
	return partResult;
};

BattleManager.calculatePhysicalHit = function(
	hitResult,
	dicePool,
	leftLimbFirst,
	leftHeldFirst,
	targetingMobility,
	leftMobilityFirst,
	defendingWithLegs,
	targetingType,
	firstHeldDefense,
	secondHeldDefense,
	parryable
) {
	hitResult.targetStress = 1;
	var damageBonus = 0;
	var rareDamageBonus = 0;
	var partHit = undefined;
	
	var skillRoll = this.rollSkillDice(dicePool.skill, dicePool.expert, dicePool.buff);
	var testRoll = this.rollTestDice(dicePool.test, dicePool.crisis, dicePool.debuff);
	
	var bonuses = skillRoll.bonuses - testRoll.penalties;
	
	if(skillRoll.hits <= testRoll.misses) {
		//miss
		//determine bonuses
		hitResult.targetStress += bonuses > 0 ? bonuses : 0;
		
		//determine rare bonuses
		hitResult.targetStress += skillRoll.rareBonuses*2;
		
		//determine penalties
		if(parryable) {
			hitResult.subjectStress += bonuses < 0 ? -bonuses : 0;
		}
		
		//determine rare penalties
		var rarePenalties = testRoll.rarePenalties;
		if(rarePenalties > 0) {
			hitResult.targetStress--;
			rarePenalties--;
		}
		if(parryable) {
			hitResult.subjectStress += rarePenalties*2;
		}
		
		return;
	}
	
	//hit
	hitResult.dodged = false;
	damageBonus = skillRoll.hits - testRoll.misses;
	rareDamageBonus = skillRoll.rareBonuses;
		
	//determine penalties
	if(parryable) {
		hitResult.subjectStress += bonuses < 0 ? -bonuses : 0;
	}
	
	//determine rare penalties
	if(parryable) {
		hitResult.subjectStress += testRoll.rarePenalties * 2;
	}
	
	//determine part hit
	var partSelect = Math.max(0, bonuses);
	if(targetingType === "limbsAndVital") {
		partSelect += firstHeldDefense + secondHeldDefense;
	} else if(targetingType === "vitalOnly") {
		partSelect += firstHeldDefense + secondHeldDefense + 2;
	}
	if(partSelect < firstHeldDefense) {
		if(leftHeldFirst) {
			partHit = "leftHeld";
		} else {
			partHit = "rightHeld";
		}
	} else if(partSelect < firstHeldDefense + secondHeldDefense) {
		if(leftHeldFirst) {
			partHit = "rightHeld";
		} else {
			partHit = "leftHeld";
		}
	} else if(partSelect < firstHeldDefense + secondHeldDefense + 1) {
		if(defendingWithLegs) {
			if(leftLimbFirst) {
				partHit = "leftLeg";
			} else {
				partHit = "rightLeg";
			}
		} else {
			if(leftLimbFirst) {
				partHit = "leftArm";
			} else {
				partHit = "rightArm";
			}
		}
	} else if(partSelect < firstHeldDefense + secondHeldDefense + 2) {
		if(defendingWithLegs) {
			if(leftLimbFirst) {
				partHit = "rightLeg";
			} else {
				partHit = "leftLeg";
			}
		} else {
			if(leftLimbFirst) {
				partHit = "rightArm";
			} else {
				partHit = "leftArm";
			}
		}
	} else if(partSelect < firstHeldDefense + secondHeldDefense + 3) {
		if(targetingMobility) {
			if(defendingWithLegs) {
				if(leftMobilityFirst) {
					partHit = "leftArm";
				} else {
					partHit = "rightArm";
				}
			} else {
				if(leftMobilityFirst) {
					partHit = "leftLeg";
				} else {
					partHit = "rightLeg";
				}
			}
		} else {
			partHit = "torso";
		}
	} else if(partSelect < firstHeldDefense + secondHeldDefense + 4) {
		if(targetingMobility) {
			if(defendingWithLegs) {
				if(leftMobilityFirst) {
					partHit = "rightArm";
				} else {
					partHit = "leftArm";
				}
			} else {
				if(leftMobilityFirst) {
					partHit = "rightLeg";
				} else {
					partHit = "leftLeg";
				}
			}
		} else {
			partHit = "torso";
		}
	} else {
		if(targetingMobility) {
			if(defendingWithLegs) {
				if(leftMobilityFirst) {
					partHit = "rightArm";
				} else {
					partHit = "leftArm";
				}
			} else {
				if(leftMobilityFirst) {
					partHit = "rightLeg";
				} else {
					partHit = "leftLeg";
				}
			}
		} else {
			partHit = "head";
		}
		
		//determine bonuses
		hitResult.targetStress += partSelect - (firstHeldDefense + secondHeldDefense + 4);
	}
	
	hitResult[partHit] = {};
	hitResult[partHit].damageBonus = damageBonus;
	hitResult[partHit].rareDamageBonus = rareDamageBonus;
};

BattleManager.calculateMentalHit = function(hitResult, dicePool) {
	return;
};

BattleManager.resolvePhysicalDamage = function(hitResult, hitDamage, partProt, tough, dicePool, cleaves, extraStress)
{
	var returnObj = {};
	returnObj.stress = 0;
	returnObj.damage = 0;
	returnObj.remainingPower = {};
	returnObj.remainingPower.blunt = 0;
	returnObj.remainingPower.cut = 0;
	returnObj.remainingPower.keen = 0;
	returnObj.remainingPower.thrust = 0;
	returnObj.remainingPower.stiletto = 0;
	returnObj.remainingPower.bullet = 0;
	returnObj.remainingPower.fire = 0;
	returnObj.remainingPower.ice = 0;
	returnObj.remainingPower.corrosion = 0;
	returnObj.remainingPower.lightning = 0;
	returnObj.critical = false;
	returnObj.shouldCleave = false;
	returnObj.shouldConduct = false;
	
	var roundedTough = Math.floor(tough);
	
	var bluntPow = 0;
	
	if(hitDamage.cut !== undefined) {
		var power = Math.max(0, hitDamage.cut +
			hitResult.damageBonus +
			hitResult.rareDamageBonus*2);
		var damage = Math.max(0, power - partProt.armor.cut);
		if(damage < power) {
			bluntPow += Math.floor((power - damage) / 2);
		}
		returnObj.damage += damage < tough ? damage : roundedTough;
		returnObj.remainingPower.cut = Math.max(0, damage - roundedTough);
	}
	
	if(hitDamage.keen !== undefined) {
		var power = Math.max(0, hitDamage.keen +
			hitResult.damageBonus +
			hitResult.rareDamageBonus*2);
		var damage = Math.max(0, power - partProt.armor.cut);
		if(damage < power) {
			bluntPow += Math.floor((power - damage) / 4);
		}
		returnObj.damage += damage < tough ? damage : roundedTough;
		returnObj.remainingPower.keen = Math.max(0, damage - roundedTough);
	}
	
	if(hitDamage.thrust !== undefined) {
		var power = Math.max(0, hitDamage.thrust +
			hitResult.damageBonus +
			hitResult.rareDamageBonus);
		var damage = Math.max(0, power - Math.max(0, 
			partProt.armor.cut -
			hitResult.rareDamageBonus*2
		));
		if(damage < power) {
			bluntPow += Math.floor((power - damage) / 4);
		}
		returnObj.damage += damage < tough ? damage : roundedTough;
		returnObj.remainingPower.thrust = Math.max(0, damage - roundedTough);
		returnObj.critical = hitResult.rareDamageBonus > 0 ? true : returnObj.critical;
	}
	
	if(hitDamage.stiletto !== undefined) {
		var power = Math.max(0, hitDamage.stiletto + hitResult.rareDamageBonus);
		var damage = Math.max(0, power - Math.max(0,
			partProt.armor.cut -
			(hitResult.damageBonus*2 + hitResult.rareDamageBonus*2)
		));
		if(damage < power) {
			bluntPow += Math.floor((power - damage) / 8);
		}
		returnObj.damage += damage < tough ? damage : roundedTough;
		returnObj.remainingPower.stiletto = Math.max(0, damage - roundedTough);
		returnObj.critical = hitResult.damageBonus > 0 || hitResult.rareDamageBonus > 0 ? true : returnObj.critical;
	}
	
	if(hitDamage.bullet !== undefined) {
		var power = Math.max(0, hitDamage.bullet +
			hitResult.damageBonus +
			hitResult.rareDamageBonus);
		var damage = Math.max(0, power - Math.max(0, 
			partProt.armor.bullet -
			hitResult.rareDamageBonus*2
		));
		if(damage < power) {
			bluntPow += power - damage;
		}
		returnObj.remainingPower.bullet = Math.max(0, damage - roundedTough);
		if(returnObj.remainingPower.bullet > 0) {
			damage = Math.max(Math.floor(damage/2), Math.floor((tough / damage) * damage));
		}
		returnObj.damage += damage < tough ? damage : roundedTough;
		returnObj.critical = hitResult.rareDamageBonus > 0 ? true : returnObj.critical;
	}
	
	var tripPow = 0;
	if(hitDamage.blunt !== undefined || bluntPow > 0) {
		var power = bluntPow;
		if(hitDamage.blunt !== undefined) {
			power += Math.max(0, hitDamage.blunt + hitResult.damageBonus + hitResult.rareDamageBonus*2);
		}
		var damage = Math.max(0, power - partProt.armor.blunt);
		returnObj.damage += damage < tough ? damage : roundedTough;
		returnObj.remainingPower.blunt = Math.max(0, damage - roundedTough);
		if(damage < power) {
			tripPow += power - damage;
		}
	}
	
	if(hitDamage.fire !== undefined) {
		var power = Math.max(0, hitDamage.fire + hitResult.rareDamageBonus);
		var damage = Math.max(0, power - Math.max(0, 
			partProt.armor.fire -
			(hitResult.damageBonus*2 + hitResult.rareDamageBonus*2)
		));
		returnObj.damage += damage < tough ? damage : roundedTough;
		returnObj.remainingPower.fire = Math.max(0, damage - roundedTough);
		returnObj.critical = hitResult.damageBonus > 0 || hitResult.rareDamageBonus > 0 ? true : returnObj.critical;
	}
	
	if(hitDamage.ice !== undefined) {
		var power = Math.max(0, hitDamage.ice + hitResult.rareDamageBonus);
		var damage = Math.max(0, power - Math.max(0, 
			partProt.armor.ice -
			(hitResult.damageBonus*2 + hitResult.rareDamageBonus*2)
		));
		returnObj.damage += damage < tough ? damage : roundedTough;
		returnObj.remainingPower.ice = Math.max(0, damage - roundedTough);
		returnObj.critical = hitResult.damageBonus > 0 || hitResult.rareDamageBonus > 0 ? true : returnObj.critical;
	}
	
	if(hitDamage.corrosion !== undefined) {
		var power = Math.max(0, hitDamage.corrosion + hitResult.rareDamageBonus);
		var damage = Math.max(0, power - Math.max(0, 
			partProt.armor.corrosion -
			(hitResult.damageBonus*2 + hitResult.rareDamageBonus*2)
		));
		returnObj.damage += damage < tough ? damage : roundedTough;
		returnObj.remainingPower.corrosion = Math.max(0, damage - roundedTough);
		returnObj.critical = hitResult.damageBonus > 0 || hitResult.rareDamageBonus > 0 ? true : returnObj.critical;
	}
	
	if(hitDamage.lightning !== undefined) {
		var power = Math.max(0, hitDamage.lightning + hitResult.rareDamageBonus);
		var damage = Math.max(0, power - Math.max(0, 
			partProt.armor.conducted -
			(hitResult.damageBonus*2 + hitResult.rareDamageBonus*2)
		));
		returnObj.damage += damage < tough ? damage : roundedTough;
		returnObj.remainingPower.lightning = Math.max(0, damage - roundedTough);
		returnObj.critical = hitResult.damageBonus > 0 || hitResult.rareDamageBonus > 0 ? true : returnObj.critical;
	}
	
	if(hitDamage.trip !== undefined || tripPow > 0) {
		var power = tripPow;
		if(hitDamage.trip !== undefined) {
			power += Math.max(0, hitDamage.trip + hitResult.damageBonus + hitResult.rareDamageBonus*2);
		}
		var skillResult = this.rollSkillDice(power, 0 , dicePool.buff);
		var testResult = this.rollTestDice(dicePool.tripTest, dicePool.tripCrisis, dicePool.debuff);
		var tripStress = skillResult.hits > testResult.misses ? skillResult.hits - testResult.misses : 0;
		returnObj.stress += tripStress * (extraStress ? 2 : 1);
	}
	
	returnObj.shouldCleave = cleaves && (returnObj.remainingPower.blunt > 0 ||
			returnObj.remainingPower.cut > 0 ||
			returnObj.remainingPower.keen > 0 ||
			returnObj.remainingPower.thrust > 0 ||
			returnObj.remainingPower.stiletto > 0 ||
			returnObj.remainingPower.bullet > 0 ||
			returnObj.remainingPower.fire > 0 ||
			returnObj.remainingPower.ice > 0 ||
			returnObj.remainingPower.corrosion > 0);
	returnObj.shouldConduct = cleaves && returnObj.remainingPower.lightning > 0;
	
	returnObj.stress += Math.floor((returnObj.damage / (tough/2)) * (extraStress ? 2 : 1));
	
	return returnObj;
};

BattleManager.resolveMentalDamage = function(hitResult, hitDamage, partProt, tough, extraStress) {
	var returnObj = {};
	returnObj.stress = 0;
	returnObj.damage = 0;
	returnObj.critical = false;
	return returnObj;
};

BattleManager.rollSkillDice = function(skillDice, expertDice, buffDice) {
	var results = {};
	results.hits = 0;
	results.bonuses = 0;
	results.rareBonuses = 0;
	
	skillDice = !skillDice
		|| typeof(skillDice) !== "number"
		|| skillDice < 0
		? 0 : Math.floor(skillDice);
	expertDice = !expertDice
		|| typeof(expertDice) !== "number"
		|| expertDice < 0
		? 0 : Math.floor(expertDice);
	buffDice = !buffDice
		|| typeof(buffDice) !== "number"
		|| buffDice < 0
		? 0 : Math.floor(buffDice);
		
	while(skillDice > 0) {
		var roll = this.rollDie(8);
		switch(roll) {
		case 1:
			break;
		case 2:
		case 3:
			results.hits++;
			break;
		case 4:
			results.hits += 2;
			break;
		case 5:
		case 6:
			results.bonuses++;
			break;
		case 7:
			results.hits++;
			results.bonuses++;
			break;
		case 8:
			results.bonuses += 2;
			break;
		}
		
		skillDice--;
	}
		
	while(expertDice > 0) {
		var roll = this.rollDie(12);
		switch(roll) {
		case 1:
			break;
		case 2:
		case 3:
			results.hits++;
			break;
		case 4:
		case 5:
			results.hits += 2;
			break;
		case 6:
			results.bonuses++;
			break;
		case 7:
		case 8:
		case 9:
			results.hits++;
			results.bonuses++;
			break;
		case 10:
		case 11:
			results.bonuses += 2;
			break;
		case 12:
			results.hits++;
			results.rareBonuses++;
			break;
		}
		
		expertDice--;
	}
		
	while(buffDice > 0) {
		var roll = this.rollDie(6);
		switch(roll) {
		case 1:
		case 2:
			break;
		case 3:
			results.hits++;
			break;
		case 4:
			results.hits++;
			results.bonuses++;
			break;
		case 5:
			results.bonuses += 2;
			break;
		case 6:
			results.bonuses++;
			break;
		}
		
		buffDice--;
	}
	
	return results;
};

BattleManager.rollTestDice = function(testDice, crisisDice, debuffDice) {
	var results = {};
	results.misses = 0;
	results.penalties = 0;
	results.rarePenalties = 0;
	
	testDice = !testDice
		|| typeof(testDice) !== "number"
		|| testDice < 0
		? 0 : Math.floor(testDice);
	crisisDice = !crisisDice
		|| typeof(crisisDice) !== "number"
		|| crisisDice < 0
		? 0 : Math.floor(crisisDice);
	debuffDice = !debuffDice
		|| typeof(debuffDice) !== "number"
		|| debuffDice < 0
		? 0 : Math.floor(debuffDice);
		
	while(testDice > 0) {
		var roll = this.rollDie(8);
		switch(roll) {
		case 1:
			break;
		case 2:
			results.misses++;
			break;
		case 3:
			results.misses += 2;
			break;
		case 4:
		case 5:
		case 6:
			results.penalties++;
			break;
		case 7:
			results.penalties += 2;
			break;
		case 8:
			results.misses++;
			results.penalties++;
			break;
		}
		
		testDice--;
	}
		
	while(crisisDice > 0) {
		var roll = this.rollDie(12);
		switch(roll) {
		case 1:
			break;
		case 2:
		case 3:
			results.misses++;
			break;
		case 4:
		case 5:
			results.misses += 2;
			break;
		case 6:
		case 7:
			results.penalties++;
			break;
		case 8:
		case 9:
			results.misses++;
			results.penalties++;
			break;
		case 10:
		case 11:
			results.penalties += 2;
			break;
		case 12:
			results.misses++;
			results.rarePenalties++;
			break;
		}
		
		crisisDice--;
	}
		
	while(debuffDice > 0) {
		var roll = this.rollDie(6);
		switch(roll) {
		case 1:
		case 2:
			break;
		case 3:
		case 4:
			results.misses++;
			break;
		case 5:
		case 6:
			results.penalties++;
			break;
		}
		
		debuffDice--;
	}
	
	return results;
};

BattleManager.rollDie = function(size) {
	size = !size
		|| typeof(size) !== "number"
		|| size < 1
		? 6 : Math.floor(size);
	
	return Math.floor(Math.random() * Math.floor(size)) + 1;
};

BattleManager.applyActionResults = function(results, subject, target) {
	subject.adjustStress(results.subjectStress);
	if(!target || target.blankDummy()) { return; }
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
	var totalDamage = Math.floor(results.damage.head*2
					+ results.damage.torso
					+ results.damage.leftArm*0.5
					+ results.damage.rightArm*0.5
					+ results.damage.leftLeg*0.5
					+ results.damage.rightLeg*0.5);
	target.adjustDamage("core", totalDamage - results.heal.core);
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
	target.adjustRoundBuffs(results.focus);
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
