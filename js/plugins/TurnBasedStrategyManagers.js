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
	this._nonFollowupsAllDodged = true;
	this._targetsOnLeft = false;
    this._subject = null;
    this._action = null;
	this._resultsArray = [];
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
};

BattleManager.resetNonFollowupsAllDodged = function() {
	this._nonFollowupsAllDodged = true;
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

BattleManager.refreshLeftActorStatusWindow = function() {
	if(this._leftActorStatusWindow) {
		if(this._targetsOnLeft) {
			this._leftActorStatusWindow.setTbsActor(this._tbsTargets[0]);
			this._curWindowTarget = this._tbsTargets[0];
		} else {
			this._leftActorStatusWindow.setTbsActor(this._tbsActors[0]);
		}
	}
};

BattleManager.refreshRightActorStatusWindow = function() {
	if(this._rightActorStatusWindow) {
		if(this._targetsOnLeft) {
			this._rightActorStatusWindow.setTbsActor(this._tbsActors[0]);
		} else {
			this._rightActorStatusWindow.setTbsActor(this._tbsTargets[0]);
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
	this._tbsTargets.forEach(function (target) {
		var results = that.combatMath(subject.battler, that._tbsActionInfo, target.battler, that._tbsTargetsByHit);
		if(!results.skipTarget) {
			targets.push(target);
			that._resultsArray.push(results);
		}
	});
	this._tbsTargets = targets;
	if(this._targetsOnLeft) {
		this.refreshLeftActorStatusWindow();
		this.refreshLeftActorNameWindow();
	} else {
		this.refreshRightActorStatusWindow();
		this.refreshRightActorNameWindow();
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
		var target = this._tbsTargets.shift();
		var results = this._resultsArray.shift();
        this.invokeAction(this._subject.battler, target.battler, results);
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

BattleManager.invokeAction = function(subject, target, results) {
    this._logWindow.push('pushBaseLine');
    //if (Math.random() < this._action.itemCnt(target)) {
    //    this.invokeCounterAttack(subject, target);
    //} else if (Math.random() < this._action.itemMrf(target)) {
    //    this.invokeMagicReflection(subject, target);
    //} else {
        this.invokeNormalAction(subject, target, results);
    //}
    //subject.setLastTarget(target);
    this._logWindow.push('popBaseLine');
    this.refreshStatus();
};

BattleManager.invokeNormalAction = function(subject, target, results) {
    //var realTarget = this.applySubstitute(target);
    //this._action.apply(realTarget);
	this.applyActionResults(results, target);
	this._logWindow.displayActionResults(subject, target, results);
};

BattleManager.combatMath = function(subject, actionInfo, target, targetsByHit) {
	var battlersByHit = [];
	targetsByHit.forEach(function (targets) {
		var battlers = targets.map(function (hitTarget) { return hitTarget.battler; });
		battlersByHit.push(battlers);
	});
	
	var targetHeadProt = target.protection("head");
	var targetTorsoProt = target.protection("torso");
	var targetLeftArmProt = target.protection("leftArm");
	var targetRightArmProt = target.protection("rightArm");
	var targetLeftLegProt = target.protection("leftLeg");
	var targetRightLegProt = target.protection("rightLeg");
	var targetMentalProt = target.mentalProtection();
	var i;
	var results = {};
	results.stress = {};
	results.stress.head = 0;
	results.stress.torso = 0;
	results.stress.leftArm = 0;
	results.stress.rightArm = 0;
	results.stress.leftLeg = 0;
	results.stress.rightLeg = 0;
	results.stress.mind = 0;
	results.stress.other = 0;
	results.damage = {};
	results.damage.head = 0;
	results.damage.torso = 0;
	results.damage.leftArm = 0;
	results.damage.rightArm = 0;
	results.damage.leftLeg = 0;
	results.damage.rightLeg = 0;
	results.damage.mind = 0;
	results.heal = {};
	results.heal.stress = 0;
	results.heal.head = 0;
	results.heal.torso = 0;
	results.heal.leftArm = 0;
	results.heal.rightArm = 0;
	results.heal.leftLeg = 0;
	results.heal.rightLeg = 0;
	results.heal.mind = 0;
	results.dodged = true;
	results.hit = {};
	results.hit.mind = false;
	results.hit.head = false;
	results.hit.torso = false;
	results.hit.leftArm = false;
	results.hit.rightArm = false;
	results.hit.leftLeg = false;
	results.hit.rightLeg = false;
	results.buffs = [];
	results.downed = false;
	results.revived = false;
	results.shouldPassTurn = true;
	results.animationIds = [];
	results.ongoingAnimationIds = [];
	results.skipTarget = true;
	var hitDodged = true;
	if(target.blankDummy()) {
		results.shouldPassTurn = false;
		return results;
	}
	var action = actionInfo.action;
	for(i = 0; i < action.hits.length; i++) {
		if(battlersByHit[i].indexOf(target) === -1) { continue; }
		var hit = action.hits[i];
		if((hit.rangeType === "followUp" && this._nonFollowupsAllDodged)
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
			var acc = accBonus + accSkill;
			
			var hitDamage = this.getCompleteDamage(subject, actionInfo, hit);
			
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
					if(this._tbsTargetPart != undefined && this._tbsTargetPart != "mobility" && this._tbsTargetPart != "vital") {
						hitResult.dodged = false;
						hitResult.hit[this._tbsTargetPart] = true;
					} else {
						var bodyPartAccRoll = this.rollForRanks(acc, subjectStress);
						var targetingMobility = this._tbsTargetPart === "mobility";
						var defendingWithLegs = target.limbsType() === "winged" && target.isFlying();
						var leftDefendingLimbProt = defendingWithLegs ? targetLeftLegProt : targetLeftArmProt;
						var rightDefendingLimbProt = defendingWithLegs ? targetRightLegProt : targetRightArmProt;
						var leftLimbDamagePotential = this.getPartDamagePotential(hitDamage, leftDefendingLimbProt);
						var rightLimbDamagePotential = this.getPartDamagePotential(hitDamage, rightDefendingLimbProt);
						var leftLimbFirst = false;
						if(leftLimbDamagePotential < rightLimbDamagePotential) {
							leftLimbFirst = true;
						} else if (leftLimbDamagePotential === rightLimbDamagePotential) {
							if(target.handedness() === "right") {
								leftLimbFirst = true;
							}
						}
						var firstLimbProt = leftDefendingLimbProt;
						var secondLimbProt = rightDefendingLimbProt;
						if(!leftLimbFirst) {
							firstLimbProt = rightDefendingLimbProt;
							secondLimbProt = leftDefendingLimbProt;
						}
						
						var criticalPartProt = targetHeadProt;
						var vitalPartProt = targetTorsoProt;
						var leftMobilityFirst = false;
						if(targetingMobility) {
							var leftMobilityLimbProt = defendingWithLegs ? targetLeftArmProt : targetLeftLegProt;
							var rightMobilityLimbProt = defendingWithLegs ? targetRightArmProt : targetRightLegProt ;
							var leftMobilityDamagePotential = this.getPartDamagePotential(hitDamage, leftMobilityLimbProt);
							var rightMobilityDamagePotential = this.getPartDamagePotential(hitDamage, rightMobilityLimbProt);
							if(leftMobilityDamagePotential < rightMobilityDamagePotential) {
								leftMobilityFirst = true;
							} else if (leftMobilityDamagePotential === rightMobilityDamagePotential) {
								if(target.handedness() === "right") {
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
						
						var eva = target.totalSkill("physEvade");
						if(isSolid) {
							hitResult = this.calculateBodyPartHit(targetStress, bodyPartAccRoll, eva,
								criticalPartProt.defense.solid,
								vitalPartProt.defense.solid,
								firstLimbProt.defense.solid,
								secondLimbProt.defense.solid,
								leftLimbFirst,
								targetingMobility,
								leftMobilityFirst,
								defendingWithLegs,
								target.isDown());
						} else if (isFluid) {
							hitResult = this.calculateBodyPartHit(targetStress, bodyPartAccRoll, eva,
								criticalPartProt.defense.fluid,
								vitalPartProt.defense.fluid,
								firstLimbProt.defense.fluid,
								secondLimbProt.defense.fluid,
								leftLimbFirst,
								targetingMobility,
								leftMobilityFirst,
								defendingWithLegs,
								target.isDown());
						}
					}
					if(isMental && !hitResult.dodged) {
						hitResult.hit.mind = true;
					}
				} else if(isMental) {
					var bodyPartAccRoll = this.rollForRanks(acc, subjectStress);
					var eva = target.totalSkill("mentalEvade");
					hitResult = this.calculateMentalHit(targetStress, bodyPartAccRoll, eva,
						targetMentalProt.defense,
						target.isDown());
				}
			}
			if(!hitResult.dodged) {
				if(hitResult.hit.head || hitResult.hit.torso || hitResult.hit.leftArm || hitResult.hit.rightArm
					|| hitResult.hit.leftLeg || hitResult.hit.rightLeg) {
					var eva = target.totalSkill("physEvade");
					var tripEva = target.totalSkill("tripEvade");
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
							target.getDamage("head"),
							target.isDown(),
							true);
						results.stress.head += damageResult.stress > 0 ? damageResult.stress + 1 : 0;
						results.damage.head += damageResult.damage;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
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
							target.getDamage("torso"),
							target.isDown(),
							false);
						results.stress.torso += damageResult.stress;
						results.damage.torso += damageResult.damage;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
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
							target.getDamage("leftArm"),
							target.isDown(),
							target.limbsType() === "winged" && target.isFlying());
						results.stress.leftArm += damageResult.stress;
						results.damage.leftArm += damageResult.damage;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
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
							target.getDamage("rightArm"),
							target.isDown(),
							target.limbsType() === "winged" && target.isFlying());
						results.stress.rightArm += damageResult.stress;
						results.damage.rightArm += damageResult.damage;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
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
							target.getDamage("leftLeg"),
							target.isDown(),
							target.limbsType() !== "quadrupedal" && (target.limbsType() !== "winged" || !target.isFlying()));
						results.stress.leftLeg += damageResult.stress > 0 ? damageResult.stress + 1 : 0;
						results.damage.leftLeg += damageResult.damage;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
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
							target.getDamage("rightLeg"),
							target.isDown(),
							target.limbsType() !== "quadrupedal" && (target.limbsType() !== "winged" || !target.isFlying()));
						results.stress.rightLeg += damageResult.stress > 0 ? damageResult.stress + 1 : 0;
						results.damage.rightLeg += damageResult.damage;
						if(damageResult.stress > 0 || damageResult.damage > 0) {
							results.shouldPassTurn = false;
						}
					}
				}
				if(hitResult.hit.mind) {
					var damageAccRoll = this.rollForRanks(acc, subjectStress);
					results.hit.mind = true;
					var eva = target.totalSkill("mentalEvade");
					var damageResult = this.resolveMentalDamage(
						hitDamage, 
						damageAccRoll, 
						eva, 
						targetMentalProt, 
						target.mentalToughness(), 
						targetStress,
						target.getDamage("mind"),
						target.isDown());
					results.stress.mind += damageResult.stress > 0 ? damageResult.stress + 1 : 0;
					results.damage.mind += damageResult.damage;
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
				results.heal.stress += heal.stress;
			}
			if(heal.damage !== undefined) {
				if(this._tbsTargetPart != undefined && this._tbsTargetPart != "mobility" && this._tbsTargetPart != "vital") {
					results.heal[this._tbsTargetPart] = heal.damage;
					results.stress.other = Math.floor(Math.min(target.getDamage(this._tbsTargetPart), heal.damage) / 2);
				} else {
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
					var stressFromHealing = Math.min(target.getDamage("head"), heal.damage) / 2;
					stressFromHealing += Math.min(target.getDamage("torso"), heal.damage) / 2;
					stressFromHealing += Math.min(target.getDamage("leftArm"), heal.damage) / 2;
					stressFromHealing += Math.min(target.getDamage("rightArm"), heal.damage) / 2;
					stressFromHealing += Math.min(target.getDamage("leftLeg"), heal.damage) / 2;
					stressFromHealing += Math.min(target.getDamage("rightLeg"), heal.damage) / 2;
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
				results.buffs.push(newBuff);
			});
		}
		if(hitDodged && hit.missAnimationId !== undefined && hit.missAnimationId > 0) {
			results.animationIds.push(hit.missAnimationId);
			results.ongoingAnimationIds.push(hit.ongoingMissAnimationId);
		} else if(!hitDodged && hit.animationId !== undefined && hit.animationId > 0) {
			results.animationIds.push(hit.animationId);
			results.ongoingAnimationIds.push(hit.ongoingAnimationId);
		}
		if(!hitDodged) {
			this._nonFollowupsAllDodged = false;
		}
	}
	return results;
};

BattleManager.getPartDamagePotential = function(damage, partProt) {
	var damagePotential = Math.max(0, damage.blunt - (partProt.defense.solid > 1 ? partProt.armor.blunt : 0));
	damagePotential += Math.max(0, damage.cut - (partProt.defense.solid > 1 ? partProt.armor.cut : 0));
	damagePotential += Math.max(0, damage.keen - (partProt.defense.solid > 1 ? partProt.armor.cut : 0));
	damagePotential += Math.max(0, damage.thrust - (partProt.defense.solid > 2 ? partProt.armor.cut : 0));
	damagePotential += Math.max(0, damage.lightning - (partProt.defense.solid > 2 ? partProt.armor.conducted : 0));
	damagePotential += damage.stiletto;
	damagePotential += Math.max(0, damage.bullet - (partProt.defense.solid > 2 ? partProt.armor.bullet : 0));
	damagePotential += Math.max(0, damage.fire - (partProt.defense.fluid > 2 ? partProt.armor.fire : 0));
	damagePotential += Math.max(0, damage.ice - (partProt.defense.fluid > 2 ? partProt.armor.ice : 0));
	damagePotential += Math.max(0, damage.corrosion - (partProt.defense.fluid > 2 ? partProt.armor.corrosion : 0));
	return damagePotential;
};

BattleManager.getCompleteDamage = function(subject, actionInfo, hit) {
	var damage = hit.damage;
	var completeDamage = {};
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
		var denom = actualUsedParts.length * 2 + 1;
		var numer = denom;
		if(actualUsedParts.indexOf("mind") >= 0 && subject.getDamage("mind") >= 1) {
			numer -= 2;
		}
		if(actualUsedParts.indexOf("head") >= 0 && subject.getDamage("head") >= 1) {
			numer -= 2;
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

BattleManager.calculateBodyPartHit = function(stress, accRoll, dodgeEva, criticalDef, vitalDef, firstLimbDef, secondLimbDef, leftLimbFirst, targetingMobility, leftMobilityFirst, defendingWithLegs, isDown) {
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
	results.evaResultBeat = 0;
	results.evaResultUnder = 0;
	results.beatBy = 0;
	var totalEva = dodgeEva;
	totalEva += criticalDef + dodgeEva;
	totalEva += vitalDef + dodgeEva;
	totalEva += firstLimbDef + dodgeEva;
	totalEva += secondLimbDef + dodgeEva;
	var dodgeEvaPercent = 0;
	var criticalEvaPercent = 0;
	var vitalEvaPercent = 0;
	var firstLimbEvaPercent = 0;
	var secondLimbEvaPercent = 0;
	if(totalEva > 0) {
		dodgeEvaPercent = dodgeEva / totalEva;
		criticalEvaPercent = (criticalDef + dodgeEva) / totalEva;
		vitalEvaPercent = (vitalDef + dodgeEva) / totalEva;
		firstLimbEvaPercent = (firstLimbDef + dodgeEva) / totalEva;
		secondLimbEvaPercent = (secondLimbDef + dodgeEva) / totalEva;
	}
	var evaRoll = this.rollForRanks(totalEva, isDown ? 5 : stress);
	var dodgeEvaRoll = evaRoll * dodgeEvaPercent;
	var criticalEvaRoll = evaRoll * criticalEvaPercent;
	var vitalEvaRoll = evaRoll * vitalEvaPercent;
	var firstLimbEvaRoll = evaRoll * firstLimbEvaPercent;
	var secondLimbEvaRoll = evaRoll * secondLimbEvaPercent;
	if(accRoll >= dodgeEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll + vitalEvaRoll + criticalEvaRoll) {
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
		results.evaResultBeat = dodgeEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll + vitalEvaRoll + criticalEvaRoll;
		results.beatBy = accRoll - (dodgeEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll + vitalEvaRoll + criticalEvaRoll);
	} else if(accRoll >= dodgeEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll + vitalEvaRoll) {
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
		results.evaResultBeat = dodgeEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll + vitalEvaRoll;
		results.evaResultUnder = dodgeEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll + vitalEvaRoll + criticalEvaRoll;
		results.beatBy = accRoll - (dodgeEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll + vitalEvaRoll);
	} else if(accRoll >= dodgeEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll) {
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
		results.evaResultBeat = dodgeEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll;
		results.evaResultUnder = dodgeEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll + vitalEvaRoll;
		results.beatBy = accRoll - (dodgeEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll);
	} else if(accRoll >= dodgeEvaRoll + firstLimbEvaRoll) {
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
		results.evaResultBeat = dodgeEvaRoll + firstLimbEvaRoll;
		results.evaResultUnder = dodgeEvaRoll + firstLimbEvaRoll + secondLimbEvaRoll;
		results.beatBy = accRoll - (dodgeEvaRoll + firstLimbEvaRoll);
	} else if(accRoll >= dodgeEvaRoll) {
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
		results.evaResultBeat = dodgeEvaRoll;
		results.evaResultUnder = dodgeEvaRoll + firstLimbEvaRoll;
		results.beatBy = accRoll - dodgeEvaRoll;
	} else {
		results.dodged = true;
		results.evaResultBeat = 0;
		results.evaResultUnder = dodgeEvaRoll;
		results.beatBy = accRoll;
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
	results.evaResultBeat = 0;
	results.evaResultUnder = 0;
	results.beatBy = 0;
	var totalEva = dodgeEva;
	totalEva += mentalDef + dodgeEva;
	var dodgeEvaPercent = 0;
	var mindEvaPercent = 0;
	if(totalEva > 0) {
		dodgeEvaPercent = dodgeEva / totalEva;
		mindEvaPercent = (mentalDef + dodgeEva) / totalEva;
	}
	var evaRoll = this.rollForRanks(totalEva, isDown ? 5 : stress);
	var dodgeEvaRoll = evaRoll * dodgeEvaPercent;
	var mindEvaRoll = evaRoll * mindEvaPercent;
	if (accRoll >= dodgeEvaPercent + mindEvaRoll) {
		results.hit.mind = true;
		results.evaResultBeat = dodgeEvaRoll + mindEvaRoll;
		results.beatBy = accRoll - (dodgeEvaRoll + mindEvaRoll);
	} else if (accRoll >= dodgeEvaPercent) {
		results.hit.mind = true;
		results.evaResultBeat = dodgeEvaRoll;
		results.evaResultUnder = dodgeEvaRoll + mindEvaRoll;
		results.beatBy = accRoll - dodgeEvaRoll;
	} else {
		results.dodged = true;
		results.evaResultBeat = 0;
		results.evaResultUnder = dodgeEvaRoll;
		results.beatBy = accRoll;
	}
	return results;
};

BattleManager.resolvePhysicalDamage = function(hitDamage, accRoll, eva, tripEva, partProt, tough, stress, partDam, isDown, extraStress) {
	var solidEva = eva + partProt.defense.solid;
	var fluidEva = eva + partProt.defense.fluid;
	var solidEvaRoll = this.rollForRanks(solidEva, isDown ? 5 : stress);
	var tripEvaRoll = this.rollForRanks(tripEva, isDown ? 5 : stress);
	var fluidEvaRoll = this.rollForRanks(fluidEva, isDown ? 5 : stress);
	var solidDamScale = solidEvaRoll <= 0 ? (accRoll <= 0 ? 1 : 2) : Math.min(2, accRoll / solidEvaRoll);
	var tripDamScale = tripEvaRoll <= 0 ? (accRoll <= 0 ? 1 : 2) : Math.min(2, accRoll / tripEvaRoll);
	var fluidDamScale = fluidEvaRoll <= 0 ? (accRoll <= 0 ? 1 : 2) : Math.min(2, accRoll / fluidEvaRoll);
	
	var solidRegularBypass = false;
	var solidThrustBypass = false;
	var solidStilettoBypass = false;
	var fluidBypass = false;
	
	if(partProt.coverage.solid >= 3) {
		solidThrustBypass = solidDamScale >= 2;
		solidStilettoBypass = solidDamScale >= 1.5;
	} else if(partProt.coverage.solid >= 2) {
		solidRegularBypass = solidDamScale >= 2;
		solidThrustBypass = solidDamScale >= 1.5;
		solidStilettoBypass = solidDamScale >= 1;
	} else if(partProt.coverage.solid >= 1) {
		solidRegularBypass = solidDamScale >= 1.5;
		solidThrustBypass = solidDamScale >= 1;
		solidStilettoBypass = solidDamScale >= 0.5;
	} else {
		solidRegularBypass = solidDamScale >= 1;
		solidThrustBypass = solidDamScale >= 0.5;
		solidStilettoBypass = true;
	}
	
	if(partProt.coverage.fluid >= 3) {
		
	} else if(partProt.coverage.fluid >= 2) {
		fluidBypass = fluidDamScale >= 1.5;
	} else if(partProt.coverage.fluid >= 1) {
		fluidBypass = fluidDamScale >= 1;
	} else {
		fluidBypass = fluidDamScale >= 0.5;
	}
	
	var bluntPow = hitDamage.blunt;
	var finalCutPow = Math.max(0, solidDamScale * hitDamage.cut - (solidRegularBypass ? 0 : partProt.armor.cut));
	bluntPow += Math.max(0, solidDamScale * hitDamage.cut - finalCutPow) / 2;
	var finalKeenPow = Math.max(0, solidDamScale * hitDamage.keen - (solidRegularBypass ? 0 : partProt.armor.cut));
	bluntPow += Math.max(0, solidDamScale * hitDamage.keen - finalKeenPow) / 4;
	var finalThrustPow = Math.max(0, solidDamScale * hitDamage.thrust - (solidThrustBypass ? 0 : partProt.armor.cut));
	bluntPow += Math.max(0, solidDamScale * hitDamage.thrust - finalThrustPow) / 4;
	var finalStilettoPow = Math.max(0, solidDamScale * hitDamage.stiletto - (solidStilettoBypass ? 0 : partProt.armor.cut));
	bluntPow += Math.max(0, solidDamScale * hitDamage.stiletto - finalStilettoPow) / 8;
	//TODO: make bullet damage do less if its too powerful (overpenetration)
	var finalBulletPow = Math.max(0, solidDamScale * hitDamage.bullet - (solidThrustBypass ? 0 : partProt.armor.bullet));
	bluntPow += Math.max(0, solidDamScale * hitDamage.bullet - finalBulletPow);
	var finalBluntPow = Math.max(0, solidDamScale * bluntPow - (solidRegularBypass ? 0 : partProt.armor.blunt));
	
	var finalFirePow = Math.max(0, fluidDamScale * hitDamage.fire - (fluidBypass ? 0 : partProt.armor.fire));
	var finalIcePow = Math.max(0, fluidDamScale * hitDamage.ice - (fluidBypass ? 0 : partProt.armor.ice));
	var finalCorrosionPow = Math.max(0, fluidDamScale * hitDamage.corrosion - (fluidBypass ? 0 : partProt.armor.corrosion));
	
	finalFirePow += Math.max(0, solidDamScale * hitDamage.lightning - (solidThrustBypass ? 0 : partProt.armor.conducted));
	
	var finalPow = Math.max(0, (finalBluntPow + finalCutPow + finalKeenPow + finalThrustPow + finalStilettoPow
		+ finalBulletPow + finalFirePow + finalIcePow + finalCorrosionPow) - tough);
	
	var stressInflicted = finalPow > 0 ? 1 : 0;
	
	var finalDamage = Math.max(0, Math.ceil(finalPow / tough - 1));
	
	stressInflicted += finalDamage;
	
	stressInflicted += Math.max(0, Math.ceil((tripDamScale * hitDamage.trip) / tough - 1));
	
	var returnObj = {};
	returnObj.stress = extraStress ? stressInflicted + 1 : stressInflicted;
	returnObj.damage = finalDamage;
	return returnObj;
};

BattleManager.resolveMentalDamage = function(hitDamage, accRoll, eva, partProt, tough, stress, partDam, isDown) {
	var totalEva = eva + partProt.defense;
	var evaRoll = this.rollForRanks(totalEva, isDown ? 5 : stress);
	var damScale = evaRoll <= 0 ? (accRoll <= 0 ? 1 : 2) : Math.min(2, accRoll / evaRoll);
	
	var bypass = false;
	if(partProt.defense >= 3) {
		
	} else if(partProt.defense >= 2) {
		bypass = damScale >= 1.5;
	} else if(partProt.defense >= 1) {
		bypass = damScale >= 1;
	} else {
		bypass = damScale >= 0.5;
	}
	
	var finalPow = Math.max(0, damScale * hitDamage.mental - (bypass ? 0 : partProt.armor));
	
	var stress = finalPow > 0 ? 1 : 0;
	
	var finalDamage = Math.max(0, Math.ceil(finalPow / tough - 1));
	
	stress += finalDamage;
	
	var returnObj = {};
	returnObj.stress = stress + 1;
	returnObj.damage = finalDamage;
	return returnObj;
};

BattleManager.rollForRanks = function(ranks, stress) {
	var adjustStress = Math.max(0, Math.min(5, stress));
	var adjustedRanks = Math.max(1, ranks + 2 - adjustStress);
	if(adjustStress >= 5) {
		adjustedRanks = Math.max(1, Math.floor(adjustedRanks / 2));
	}
	var result = 0;
	while(adjustedRanks > 0) {
		result += this.rollDie();
		adjustedRanks--;
	}
	return result;
};

BattleManager.rollDie = function() {
	var dSixResult = Math.floor(Math.random() * Math.floor(6)) + 1;
	if(dSixResult == 1 || dSixResult == 6) {
		return 0;
	}
	if(dSixResult == 2 || dSixResult == 5) {
		return 1;
	}
	return 2;
};

BattleManager.applyActionResults = function(results, target) {
	if(target.blankDummy()) { return; }
	var initialDownState = target.isDown();
	var totalStress = results.stress.other + results.stress.mind + results.stress.head + results.stress.torso
		+ results.stress.leftArm + results.stress.rightArm + results.stress.leftLeg + results.stress.rightLeg;
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
