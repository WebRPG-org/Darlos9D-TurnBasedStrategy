//=============================================================================
// TurnBasedStrategyScenes.js
//=============================================================================

/*:
 *
 * @plugindesc Scene handling for a turn based strategy game
 *
 * @author Darlos9D
 *
 * @help
 *
 * This plugin does not provide any commands.
 *
 */
 
(function() {
	//base
	Scene_Base.prototype.checkGameover = function() {
		if ($gameParty.isAllDead()) {
			//SceneManager.goto(Scene_Gameover);
		}
	};
	
	//map
	Scene_Map.prototype.initialize = function() {
		Scene_Base.prototype.initialize.call(this);
		this._waitCount = 0;
		this._encounterEffectDuration = 0;
		this._mapLoaded = false;
		this._touchCount = 0;
		this._oldBreadcrumbs = [];
		this._tbsBattleJustStarted = true;
		SoundManager.loadTbsBattleStartSound();
		SoundManager.loadWindowOpenCloseSound();
		SoundManager.loadDeflectionSound();
		SoundManager.loadStressSound();
	};
	
	Scene_Map.prototype.isSceneMap = function() {
		return true;
	};
	
	Scene_Map.prototype.update = function() {
		this.updateBasedOnTbsBattle();
		this.updateDestination();
		this.updateMainMultiply();
		if (this.isSceneChangeOk()) {
			this.updateScene();
		} else if (SceneManager.isNextScene(Scene_Battle)) {
			this.updateEncounterEffect();
		}
		this.updateWaitCount();
		Scene_Base.prototype.update.call(this);
	};
	
	Scene_Map.prototype.updateBasedOnTbsBattle = function() {
		if($gameMap.tbsBattleMode()
			&& $gameMap.tbsTurnMode() != "victory" && $gameMap.tbsTurnMode() != "gameOver") {
			var force = $gameMap.currentForce();
			if(!force || !force.isParty || $gameMap.tbsTurnMode() === "actionBattleScene") {
				this._tbsActorWindow.close();
				this._tbsActorWindow.deactivate();
				this._tbsActorWindow.shouldOpenActionTypeWindow(false);
				this._tbsActorWindow.shouldPassTurn(false);
				this._tbsActorWindow.shouldActivateSurvey(false);
				this._tbsActionTypeWindow.close();
				this._tbsActionTypeWindow.deactivate();
				this._tbsActionTypeWindow.shouldOpenActorWindow(false);
				this._tbsActionTypeWindow.shouldOpenActionWindow(false);
				this._tbsActionTypeWindow.shouldActivateManualMove(false);
				this._tbsActionWindow.close();
				this._tbsActionWindow.deactivate();
				this._tbsActionWindow.shouldOpenActionTypeWindow(false);
				this._tbsActionWindow.shouldOpenTargetWindow(false);
				this._tbsActionWindow.shouldActivateManualTarget(false);
				this._tbsTargetWindow.close();
				this._tbsTargetWindow.deactivate();
				this._tbsTargetWindow.shouldOpenActionWindow(false);
				this._tbsTargetWindow.shouldOpenTargetPartWindow(false);
				this._tbsTargetWindow.shouldActivateManualTarget(false);
				this._tbsTargetPartWindow.close();
				this._tbsTargetPartWindow.deactivate();
				this._tbsTargetPartWindow.shouldOpenTargetWindow(false);
				this._tbsTargetPartWindow.shouldActivateManualTarget(false);
				if($gameMap.tbsTurnMode() === "actionBattleScene") {
					this._tbsBreadcrumbWindowOne.close();
					this._tbsBreadcrumbWindowOne.setBreadcrumbInfo(undefined);
					this._tbsBreadcrumbWindowTwo.close();
					this._tbsBreadcrumbWindowTwo.setBreadcrumbInfo(undefined);
					this._tbsBreadcrumbWindowThree.close();
					this._tbsBreadcrumbWindowThree.setBreadcrumbInfo(undefined);
					this._tbsBreadcrumbWindowFour.close();
					this._tbsBreadcrumbWindowFour.setBreadcrumbInfo(undefined);
				}
				this.updateBreadcrumbs();
				return;
			}
			if($gameMap.checkTbsTurnJustStarted()) {
				this._tbsActorWindow.show();
				this._tbsActorWindow.open();
				this._tbsActorWindow.activate();
				this._tbsActorWindow.setActors(force.actors);
				this._tbsActorWindow.selectFirstEnabledItem();
				this._tbsActorWindow.refreshWindowContents();
				this._tbsActorWindow.shouldOpenActionTypeWindow(false);
				this._tbsActorWindow.shouldPassTurn(false);
				this._tbsActorWindow.shouldActivateSurvey(false);
				this._tbsActionTypeWindow.close();
				this._tbsActionTypeWindow.deactivate();
				this._tbsActionTypeWindow.shouldOpenActorWindow(false);
				this._tbsActionTypeWindow.shouldOpenActionWindow(false);
				this._tbsActionTypeWindow.shouldActivateManualMove(false);
				this._tbsActionWindow.close();
				this._tbsActionWindow.deactivate();
				this._tbsActionWindow.shouldOpenActionTypeWindow(false);
				this._tbsActionWindow.shouldOpenTargetWindow(false);
				this._tbsActionWindow.shouldActivateManualTarget(false);
				this._tbsTargetWindow.close();
				this._tbsTargetWindow.deactivate();
				this._tbsTargetWindow.shouldOpenActionWindow(false);
				this._tbsTargetWindow.shouldOpenTargetPartWindow(false);
				this._tbsTargetWindow.shouldActivateManualTarget(false);
				this._tbsTargetPartWindow.close();
				this._tbsTargetPartWindow.deactivate();
				this._tbsTargetPartWindow.shouldOpenTargetWindow(false);
				this._tbsTargetPartWindow.shouldActivateManualTarget(false);
				$gameMap.setBreadcrumbStage("selectingActor");
			}
			if($gameMap.checkTbsCancelMoveJustEnded()) {
				this._tbsActorWindow.close();
				this._tbsActorWindow.deactivate();
				this._tbsActorWindow.shouldOpenActionTypeWindow(false);
				this._tbsActorWindow.shouldPassTurn(false);
				this._tbsActorWindow.shouldActivateSurvey(false);
				this._tbsActionTypeWindow.refresh();
				this._tbsActionTypeWindow.show();
				this._tbsActionTypeWindow.open();
				this._tbsActionTypeWindow.activate();
				this._tbsActionWindow.close();
				this._tbsActionWindow.deactivate();
				this._tbsActionWindow.shouldOpenActionTypeWindow(false);
				this._tbsActionWindow.shouldOpenTargetWindow(false);
				this._tbsActionWindow.shouldActivateManualTarget(false);
				this._tbsTargetWindow.close();
				this._tbsTargetWindow.deactivate();
				this._tbsTargetWindow.shouldOpenActionWindow(false);
				this._tbsTargetWindow.shouldOpenTargetPartWindow(false);
				this._tbsTargetWindow.shouldActivateManualTarget(false);
				this._tbsTargetPartWindow.close();
				this._tbsTargetPartWindow.deactivate();
				this._tbsTargetPartWindow.shouldOpenTargetWindow(false);
				this._tbsTargetPartWindow.shouldActivateManualTarget(false);
				$gameMap.setBreadcrumbStage("actor");
			}
			if(this.isOkWhileControllingCursor()) {
				if(($gameMap.tbsTurnMode() === "manualMove" && $gameMap.getTbsActorAtPosition($gamePlayer.x, $gamePlayer.y, true))
					|| ($gameMap.tbsTurnMode() === "manualTarget" && !$gameMap.isCursorInActionField())
					|| $gameMap.tbsTurnMode() === "survey") {
					SoundManager.playBuzzer();
				} else {
					SoundManager.playOk();
					if($gameMap.tbsTurnMode() === "manualMove") {
						this._tbsActionTypeWindow.refresh();
						this._tbsActionTypeWindow.show();
						this._tbsActionTypeWindow.open();
						this._tbsActionTypeWindow.activate();
						$gameMap.setTbsTurnMode("selectActorActionType");
						$gameMap.setBreadcrumbStage("actor");
					} else if($gameMap.tbsTurnMode() === "manualTarget") {
						this._tbsTargetNameWindow.close();
						var selectedTarget = $gameMap.getTbsActorAtPosition($gameMap.getTbsActionTargetLocationX(), $gameMap.getTbsActionTargetLocationY());
						var actionInfo = $gameMap.getTbsSelectedActionInfo();
						if(selectedTarget && (actionInfo.canTargetBodyPart || (actionInfo.canTargetDownedBodyPart && selectedTarget.battler.isDown()))) {
							this._tbsTargetPartWindow.refreshWindowContents();
							this._tbsTargetPartWindow.show();
							this._tbsTargetPartWindow.open();
							this._tbsTargetPartWindow.activate();
							this._tbsTargetPartFromManualTarget = true;
							$gameMap.setTbsTurnMode("selectTargetPart");
							$gameMap.setBreadcrumbStage("target");
						} else {
							this._tbsActorStatusWindow.setTbsActor(undefined);
							this._tbsActorStatusWindow.close();
							$gameMap.setTbsTurnMode("executeAction");
						}
					}
				}
			} else if(this.isCancellingWhileControllingCursor()) {
				SoundManager.playCancel();
				if ($gameMap.tbsTurnMode() === "survey") {
					this._tbsActorWindow.show();
					this._tbsActorWindow.open();
					this._tbsActorWindow.activate();
					this._tbsActorWindow.refreshWindowContents();
					this._tbsTargetNameWindow.close();
					$gameMap.setTbsTurnMode("selectActorActionType");
					$gameMap.setBreadcrumbStage("selectingActor");
				} else if($gameMap.tbsTurnMode() === "manualMove") {
					$gameMap.setTbsTurnMode("cancelMove");
				} else if($gameMap.tbsTurnMode() === "manualTarget") {
					if(this._tbsTargetWindow.hasAlliesOrEnemies() && !this._tbsActionWindow.isOnlyTargetSelf()) {
						this._tbsTargetWindow.show();
						this._tbsTargetWindow.open();
						this._tbsTargetWindow.activate();
					} else {
						this._tbsActionWindow.refreshWindowContents();
						this._tbsActionWindow.show();
						this._tbsActionWindow.open();
						this._tbsActionWindow.activate();
						$gameMap.setBreadcrumbStage("actor");
					}
					$gameMap.setTbsTurnMode("selectActionTarget");
					this._tbsTargetNameWindow.close();
				}
			}
			if($gameMap.tbsTurnMode() === "survey" || $gameMap.tbsTurnMode() === "manualTarget") {
				var tbsActor = $gameMap.getTbsActorAtPosition($gamePlayer.x, $gamePlayer.y);
				if(tbsActor) {
					this._tbsActorStatusWindow.setTbsActor(tbsActor);
					this._tbsActorStatusWindow.show();
					this._tbsActorStatusWindow.open();
					this._tbsTargetNameWindow.setTargetActor(tbsActor);
					this._tbsTargetNameWindow.show();
					this._tbsTargetNameWindow.open();
				} else {
					this._tbsActorStatusWindow.setTbsActor(undefined);
					this._tbsActorStatusWindow.close();
					this._tbsTargetNameWindow.close();
				}
				if($gameMap.tbsTurnMode() === "manualTarget") {
					if($gamePlayer.isMoving()) {
						$gameMap.clearTbsAoeSprites();
					} else {
						$gameMap.spawnTbsAoeSprites();
					}
				}
			}
			this.updateBreadcrumbs();
		} else {
			this._tbsActorWindow.close();
			this._tbsActorWindow.deactivate();
			this._tbsActorWindow.shouldOpenActionTypeWindow(false);
			this._tbsActorWindow.shouldPassTurn(false);
			this._tbsActorWindow.shouldActivateSurvey(false);
			this._tbsActionTypeWindow.close();
			this._tbsActionTypeWindow.deactivate();
			this._tbsActionTypeWindow.shouldOpenActorWindow(false);
			this._tbsActionTypeWindow.shouldOpenActionWindow(false);
			this._tbsActionTypeWindow.shouldActivateManualMove(false);
			this._tbsActionWindow.close();
			this._tbsActionWindow.deactivate();
			this._tbsActionWindow.shouldOpenActionTypeWindow(false);
			this._tbsActionWindow.shouldOpenTargetWindow(false);
			this._tbsActionWindow.shouldActivateManualTarget(false);
			this._tbsTargetWindow.close();
			this._tbsTargetWindow.deactivate();
			this._tbsTargetWindow.shouldOpenActionWindow(false);
			this._tbsTargetWindow.shouldOpenTargetPartWindow(false);
			this._tbsTargetWindow.shouldActivateManualTarget(false);
			this._tbsTargetPartWindow.close();
			this._tbsTargetPartWindow.deactivate();
			this._tbsTargetPartWindow.shouldOpenTargetWindow(false);
			this._tbsTargetPartWindow.shouldActivateManualTarget(false);
			this._tbsBreadcrumbWindowOne.close();
			this._tbsBreadcrumbWindowOne.setBreadcrumbInfo(undefined);
			this._tbsBreadcrumbWindowTwo.close();
			this._tbsBreadcrumbWindowTwo.setBreadcrumbInfo(undefined);
			this._tbsBreadcrumbWindowThree.close();
			this._tbsBreadcrumbWindowThree.setBreadcrumbInfo(undefined);
			this._tbsBreadcrumbWindowFour.close();
			this._tbsBreadcrumbWindowFour.setBreadcrumbInfo(undefined);
			$gameMap.setBreadcrumbStage("none");
			this._tbsBattleJustStarted = true;
		}
	};
	
	Scene_Map.prototype.updateBreadcrumbs = function() {
		var breadcrumbs = $gameMap.getBreadcrumbs();
		var breadcrumbsDifferent = false;
		if(breadcrumbs.length !== this._oldBreadcrumbs.length) {
			breadcrumbsDifferent = true;
		} else {
			var i;
			for(i = 0; i < breadcrumbs.length; i++) {
				if(breadcrumbs[i] !== this._oldBreadcrumbs[i]) {
					breadcrumbsDifferent = true;
					break;
				}
			}
		}
		if(breadcrumbsDifferent) {
			if((!this._tbsBreadcrumbWindowOne.isClosed() && this._tbsBreadcrumbWindowOne.visible)
				|| (!this._tbsBreadcrumbWindowTwo.isClosed() && this._tbsBreadcrumbWindowTwo.visible)
				|| (!this._tbsBreadcrumbWindowThree.isClosed() && this._tbsBreadcrumbWindowThree.visible)
				|| (!this._tbsBreadcrumbWindowFour.isClosed() && this._tbsBreadcrumbWindowFour.visible)) {
				SoundManager.playWindowOpenCloseSound();
			}
			this._tbsBreadcrumbWindowOne.close();
			this._tbsBreadcrumbWindowOne.setBreadcrumbInfo(undefined);
			this._tbsBreadcrumbWindowTwo.close();
			this._tbsBreadcrumbWindowTwo.setBreadcrumbInfo(undefined);
			this._tbsBreadcrumbWindowThree.close();
			this._tbsBreadcrumbWindowThree.setBreadcrumbInfo(undefined);
			this._tbsBreadcrumbWindowFour.close();
			this._tbsBreadcrumbWindowFour.setBreadcrumbInfo(undefined);
			var windowNum = 5 - breadcrumbs.length;
			var that = this;
			breadcrumbs.forEach(function (breadcrumb) {
				if(windowNum === 1) {
					that._tbsBreadcrumbWindowOne.setBreadcrumbInfo(breadcrumb);
				} else if(windowNum === 2) {
					that._tbsBreadcrumbWindowTwo.setBreadcrumbInfo(breadcrumb);
				} else if(windowNum === 3) {
					that._tbsBreadcrumbWindowThree.setBreadcrumbInfo(breadcrumb);
				} else if(windowNum === 4) {
					that._tbsBreadcrumbWindowFour.setBreadcrumbInfo(breadcrumb);
					that._tbsBreadcrumbWindowFour.playSounds(true, that._tbsBattleJustStarted);
					that._tbsBattleJustStarted = false;
				}
				windowNum++;
			});
		}
		this._oldBreadcrumbs = breadcrumbs;
	};
	
	Scene_Map.prototype.isOkWhileControllingCursor = function() {
		return ($gameMap.tbsTurnMode() === "survey" || $gameMap.tbsTurnMode() === "manualMove" || $gameMap.tbsTurnMode() === "manualTarget")
			&& Input.isTriggered('ok') && !$gameMap.tbsCursorIsFocusing() && !$gamePlayer.isMoving() && !$gameTemp.isDestinationValid()
			&& (!this._tbsActionTypeWindow.visible || this._tbsActionTypeWindow.isClosed())
			&& (!this._tbsActionWindow.visible || this._tbsActionWindow.isClosed())
			&& (!this._tbsTargetWindow.visible || this._tbsTargetWindow.isClosed());
	};
	
	Scene_Map.prototype.isCancellingWhileControllingCursor = function() {
		return ($gameMap.tbsTurnMode() === "survey" || $gameMap.tbsTurnMode() === "manualMove" || $gameMap.tbsTurnMode() === "manualTarget")
			&& (Input.isTriggered('cancel') || TouchInput.isCancelled())
			&& !$gameMap.tbsCursorIsFocusing() && !$gamePlayer.isMoving() && !$gameTemp.isDestinationValid()
			&& (!this._tbsActionTypeWindow.visible || this._tbsActionTypeWindow.isClosed())
			&& (!this._tbsActionWindow.visible || this._tbsActionWindow.isClosed())
			&& (!this._tbsTargetWindow.visible || this._tbsTargetWindow.isClosed());
	};
	
	Scene_Map.prototype.createAllWindows = function() {
		this.createMessageWindow();
		this.createScrollTextWindow();
		this.createTbsActorStatusWindow();
		this.createTbsActorWindow();
		this.createTbsActionTypeWindow();
		this.createTbsActionInfoWindow();
		this.createTbsActionWindow();
		this.createTbsTargetWindow();
		this.createTbsTargetNameWindow();
		this.createTbsTargetPartWindow();
		this.createTbsBreadcrumbWindows();
	};

	Scene_Map.prototype.createTbsActorStatusWindow = function() {
		var wx = Graphics.boxWidth - Window_TbsActorStatus.prototype.windowWidth();
		this._tbsActorStatusWindow = new Window_TbsActorStatus(wx, 0);
		this.addWindow(this._tbsActorStatusWindow);
		this._tbsActorStatusWindow.hide();
		this._tbsActorStatusWindow.close();
	};

	Scene_Map.prototype.createTbsActorWindow = function() {
		this._tbsActorWindow = new Window_TbsActor(0, 0);
		this._tbsActorWindow.setHandler('ok',     this.onActorOk.bind(this));
		this._tbsActorWindow.setHandler('cancel',     this.onActorCancel.bind(this));
		this.addWindow(this._tbsActorWindow);
		this._tbsActorWindow.hide();
		this._tbsActorWindow.close();
		this._tbsActorWindow.deactivate();
		this._tbsActorWindow.setActorStatusWindow(this._tbsActorStatusWindow);
	};

	Scene_Map.prototype.createTbsActionTypeWindow = function() {
		this._tbsActionTypeWindow = new Window_TbsActionType(0, 0);
		this._tbsActionTypeWindow.setHandler('action',     this.commandAction.bind(this));
		this._tbsActionTypeWindow.setHandler('move',     this.commandMove.bind(this));
		this._tbsActionTypeWindow.setHandler('cancel',     this.commandActionTypeCancel.bind(this));
		this.addWindow(this._tbsActionTypeWindow);
		this._tbsActionTypeWindow.hide();
		this._tbsActionTypeWindow.close();
		this._tbsActionTypeWindow.deactivate();
		this._tbsActorWindow.setActionTypeWindow(this._tbsActionTypeWindow);
		this._tbsActionTypeWindow.setActorWindow(this._tbsActorWindow);
	};

	Scene_Map.prototype.createTbsActionInfoWindow = function() {
		var wx = Graphics.boxWidth - 298;
		var wy = Graphics.boxHeight - (7 * 36 + 18 * 2);
		this._tbsActionInfoWindow = new Window_TbsActionInfo(wx, wy);
		this.addWindow(this._tbsActionInfoWindow);
		this._tbsActionInfoWindow.hide();
	};

	Scene_Map.prototype.createTbsActionWindow = function() {
		this._tbsActionWindow = new Window_TbsAction(0, 0);
		this._tbsActionWindow.setHandler('ok',     this.onActionOk.bind(this));
		this._tbsActionWindow.setHandler('cancel',     this.onActionCancel.bind(this));
		this.addWindow(this._tbsActionWindow);
		this._tbsActionWindow.hide();
		this._tbsActionWindow.close();
		this._tbsActionWindow.deactivate();
		this._tbsActionTypeWindow.setActionWindow(this._tbsActionWindow);
		this._tbsActionWindow.setActionTypeWindow(this._tbsActionTypeWindow);
		this._tbsActionWindow.setActionInfoWindow(this._tbsActionInfoWindow);
	};

	Scene_Map.prototype.createTbsTargetWindow = function() {
		this._tbsTargetWindow = new Window_TbsTarget(0, 0);
		this._tbsTargetWindow.setHandler('ok',     this.onTargetOk.bind(this));
		this._tbsTargetWindow.setHandler('cancel',     this.onTargetCancel.bind(this));
		this._tbsTargetWindow.setHandler('control',     this.onTargetSwitchGroups.bind(this));
		this._tbsTargetWindow.setHandler('shift',     this.onTargetSwitchGroups.bind(this));
		this.addWindow(this._tbsTargetWindow);
		this._tbsTargetWindow.hide();
		this._tbsTargetWindow.close();
		this._tbsTargetWindow.deactivate();
		this._tbsTargetWindow.setActionWindow(this._tbsActionWindow);
		this._tbsActionWindow.setTargetWindow(this._tbsTargetWindow);
		this._tbsTargetWindow.setActorStatusWindow(this._tbsActorStatusWindow);
	};

	Scene_Map.prototype.createTbsTargetNameWindow = function() {
		this._tbsTargetNameWindow = new Window_TbsTargetName(0, 0);
		this.addWindow(this._tbsTargetNameWindow);
		this._tbsTargetNameWindow.hide();
		this._tbsTargetNameWindow.close();
		this._tbsTargetNameWindow.deactivate();
	};

	Scene_Map.prototype.createTbsTargetPartWindow = function() {
		this._tbsTargetPartWindow = new Window_TbsTargetPart(0, 0);
		this._tbsTargetPartWindow.setHandler('targetPart',     this.onTargetPartOk.bind(this));
		this._tbsTargetPartWindow.setHandler('cancel',     this.onTargetPartCancel.bind(this));
		this.addWindow(this._tbsTargetPartWindow);
		this._tbsTargetPartWindow.hide();
		this._tbsTargetPartWindow.close();
		this._tbsTargetPartWindow.deactivate();
		this._tbsTargetPartWindow.setTargetWindow(this._tbsTargetWindow);
		this._tbsTargetWindow.setTargetPartWindow(this._tbsTargetPartWindow);
	};

	Scene_Map.prototype.createTbsBreadcrumbWindows = function() {
		this._tbsBreadcrumbWindowOne = new Window_TbsBreadcrumb(0, Graphics.boxHeight - 288);
		this._tbsBreadcrumbWindowTwo = new Window_TbsBreadcrumb(0, Graphics.boxHeight - 216);
		this._tbsBreadcrumbWindowThree = new Window_TbsBreadcrumb(0, Graphics.boxHeight - 144);
		this._tbsBreadcrumbWindowFour = new Window_TbsBreadcrumb(0, Graphics.boxHeight - 72);
		this.addWindow(this._tbsBreadcrumbWindowOne);
		this.addWindow(this._tbsBreadcrumbWindowTwo);
		this.addWindow(this._tbsBreadcrumbWindowThree);
		this.addWindow(this._tbsBreadcrumbWindowFour);
		this._tbsBreadcrumbWindowOne.hide();
		this._tbsBreadcrumbWindowOne.close();
		this._tbsBreadcrumbWindowOne.deactivate();
		this._tbsBreadcrumbWindowTwo.hide();
		this._tbsBreadcrumbWindowTwo.close();
		this._tbsBreadcrumbWindowTwo.deactivate();
		this._tbsBreadcrumbWindowThree.hide();
		this._tbsBreadcrumbWindowThree.close();
		this._tbsBreadcrumbWindowThree.deactivate();
		this._tbsBreadcrumbWindowFour.hide();
		this._tbsBreadcrumbWindowFour.close();
		this._tbsBreadcrumbWindowFour.deactivate();
		this._tbsBreadcrumbWindowOne.addOtherBreadcrumbWindow(this._tbsBreadcrumbWindowTwo);
		this._tbsBreadcrumbWindowOne.addOtherBreadcrumbWindow(this._tbsBreadcrumbWindowThree);
		this._tbsBreadcrumbWindowOne.addOtherBreadcrumbWindow(this._tbsBreadcrumbWindowFour);
		this._tbsBreadcrumbWindowTwo.addOtherBreadcrumbWindow(this._tbsBreadcrumbWindowOne);
		this._tbsBreadcrumbWindowTwo.addOtherBreadcrumbWindow(this._tbsBreadcrumbWindowThree);
		this._tbsBreadcrumbWindowTwo.addOtherBreadcrumbWindow(this._tbsBreadcrumbWindowFour);
		this._tbsBreadcrumbWindowThree.addOtherBreadcrumbWindow(this._tbsBreadcrumbWindowOne);
		this._tbsBreadcrumbWindowThree.addOtherBreadcrumbWindow(this._tbsBreadcrumbWindowTwo);
		this._tbsBreadcrumbWindowThree.addOtherBreadcrumbWindow(this._tbsBreadcrumbWindowFour);
		this._tbsBreadcrumbWindowFour.addOtherBreadcrumbWindow(this._tbsBreadcrumbWindowOne);
		this._tbsBreadcrumbWindowFour.addOtherBreadcrumbWindow(this._tbsBreadcrumbWindowTwo);
		this._tbsBreadcrumbWindowFour.addOtherBreadcrumbWindow(this._tbsBreadcrumbWindowThree);
	};
	
	Scene_Map.prototype.onActorOk = function() {
		if(this._tbsActorWindow.isOnPass()) {
			this._tbsActorWindow.shouldPassTurn(true);
		} else {
			this._tbsActorWindow.shouldOpenActionTypeWindow(true);
			$gameMap.setBreadcrumbStage("actor");
		}
		this._tbsActorWindow.close();
		this._tbsActorWindow.deactivate();
	};
	
	Scene_Map.prototype.onActorCancel = function() {
		SoundManager.playCancel();
		this._tbsActorWindow.shouldActivateSurvey(true);
		this._tbsActorWindow.close();
		this._tbsActorWindow.deactivate();
		$gameMap.setBreadcrumbStage("surveying");
	};
	
	Scene_Map.prototype.commandActionTypeCancel = function() {
		if(this._tbsActionTypeWindow.isMoveEnabled()) {
			this._tbsActionTypeWindow.shouldOpenActorWindow(true);
			$gameMap.setBreadcrumbStage("selectingActor");
		} else {
			this._tbsActionTypeWindow.shouldActivateManualMove(true);
		}
		this._tbsActionTypeWindow.deactivate();
		this._tbsActionTypeWindow.close();
		SoundManager.playCancel();
	};
	
	Scene_Map.prototype.commandAction = function() {
		this._tbsActionTypeWindow.shouldOpenActionWindow(true);
		this._tbsActionTypeWindow.close();
		this._tbsActionTypeWindow.deactivate();
		$gameMap.setTbsTurnMode("selectActionTarget");
	};
	
	Scene_Map.prototype.commandMove = function() {
		this._tbsActionTypeWindow.shouldActivateManualMove(true);
		this._tbsActionTypeWindow.deactivate();
		this._tbsActionTypeWindow.close();
	};
	
	Scene_Map.prototype.onActionOk = function() {
		if(this._tbsTargetWindow.hasAlliesOrEnemies() && !this._tbsActionWindow.isOnlyTargetSelf()) {
			this._tbsActionWindow.shouldOpenTargetWindow(true);
		} else {
			this._tbsActionWindow.shouldActivateManualTarget(true);
		}
		this._tbsActionWindow.close();
		this._tbsActionWindow.deactivate();
		$gameMap.setBreadcrumbStage("action");
	};
	
	Scene_Map.prototype.onActionCancel = function() {
		this._tbsActionWindow.shouldOpenActionTypeWindow(true);
		this._tbsActionWindow.close();
		this._tbsActionWindow.deactivate();
		$gameMap.setTbsTurnMode("selectActorActionType");
	};
	
	Scene_Map.prototype.onTargetOk = function() {
		if(this._tbsTargetWindow.isOnManualTarget()) {
			this._tbsTargetWindow.shouldActivateManualTarget(true);
		} else {
			var actionInfo = $gameMap.getTbsSelectedActionInfo();
			var selectedTarget = $gameMap.getTbsActorAtPosition($gameMap.getTbsActionTargetLocationX(), $gameMap.getTbsActionTargetLocationY());
			if(selectedTarget && (actionInfo.canTargetBodyPart || (actionInfo.canTargetDownedBodyPart && selectedTarget.battler.isDown()))) {
				this._tbsTargetWindow.shouldOpenTargetPartWindow(true);
				this._tbsTargetPartFromManualTarget = false;
				$gameMap.setTbsTurnMode("selectTargetPart");
				$gameMap.setBreadcrumbStage("target");
			} else {
				$gameMap.setTbsTurnMode("executeAction");
			}
		}
		this._tbsTargetWindow.close();
		this._tbsTargetWindow.deactivate();
	};
	
	Scene_Map.prototype.onTargetCancel = function() {
		this._tbsTargetWindow.shouldOpenActionWindow(true);
		this._tbsTargetWindow.close();
		this._tbsTargetWindow.deactivate();
		$gameMap.setTbsActionTargetLocation(-1, -1);
		$gameMap.setBreadcrumbStage("actor");
	};
	
	Scene_Map.prototype.onTargetSwitchGroups = function() {
		this._tbsTargetWindow.switchShownGroup();
	};
	
	Scene_Map.prototype.onTargetPartOk = function() {
		this._tbsTargetPartWindow.close();
		this._tbsTargetPartWindow.deactivate();
		$gameMap.setTbsTurnMode("executeAction");
	};
	
	Scene_Map.prototype.onTargetPartCancel = function() {
		if(this._tbsTargetPartFromManualTarget) {
			this._tbsTargetPartWindow.shouldActivateManualTarget(true);
		} else {
			this._tbsTargetPartWindow.shouldOpenTargetWindow(true);
			$gameMap.setTbsTurnMode("selectActionTarget");
		}
		this._tbsTargetPartWindow.close();
		this._tbsTargetPartWindow.deactivate();
		$gameMap.setBreadcrumbStage("action");
	};
	
	Scene_Map.prototype.launchBattle = function() {
		//BattleManager.saveBgmAndBgs();
		this.stopAudioOnBattleStart();
		//SoundManager.playBattleStart();
		this.startEncounterEffect();
		this._mapNameWindow.hide();
	};
	
	Scene_Map.prototype.startEncounterEffect = function() {
		//this._spriteset.hideCharacters();
		this._encounterEffectDuration = this.encounterEffectSpeed();
	};
	
	Scene_Map.prototype.updateEncounterEffect = function() {
		if (this._encounterEffectDuration > 0) {
			this._encounterEffectDuration = 0;
			//BattleManager.playBattleBgm();
			this.startFadeOut(this.fadeSpeed());
		}
	};
	
	Scene_Map.prototype.isMenuEnabled = function() {
		return $gameSystem.isMenuEnabled() && !$gameMap.isEventRunning() && !$gameMap.tbsBattleMode();
	};
	
	Scene_Map.prototype.updateEncounter = function() {
		if($gameMap.isInActionBattleScene()) {
			var actors = [];
			actors.push($gameMap.getTbsSelectedActor());
			var actionInfo = $gameMap.getTbsSelectedActionInfo();
			var targets = $gameMap.getTbsActionTargets();
			var targetsByHit = $gameMap.getTbsActionTargetsByHit();
			var targetX = $gameMap.getTbsActionTargetLocationX();
			var targetY = $gameMap.getTbsActionTargetLocationY();
			var targetPart = $gameMap.getTbsActionTargetPart();
			if(targets && targets.length > 0) {
				BattleManager.setup(actors, actionInfo, targetX, targetY, targets, targetsByHit, targetPart);
				BattleManager.onEncounter();
				SceneManager.push(Scene_Battle);
			} else {
				$gameMap.setInActionBattleScene(false);
			}
		}
	};
	
	Scene_Map.prototype.stopAudioOnBattleStart = function() {
		
	};
	
	//battle
	Scene_Battle.prototype.start = function() {
		Scene_Base.prototype.start.call(this);
		this.startFadeIn(this.fadeSpeed(), false);
		//BattleManager.playBattleBgm();
		BattleManager.startBattle();
	};
	
	Scene_Battle.prototype.createDisplayObjects = function() {
		this.createSpriteset();
		this.createWindowLayer();
		this.createAllWindows();
		BattleManager.setLogWindow(this._logWindow);
		BattleManager.setLeftActorStatusWindow(this._tbsLeftActorStatusWindow);
		BattleManager.setRightActorStatusWindow(this._tbsRightActorStatusWindow);
		BattleManager.setLeftActorNameWindow(this._tbsLeftActorNameWindow);
		BattleManager.setRightActorNameWindow(this._tbsRightActorNameWindow);
		BattleManager.setStatusWindow(this._statusWindow);
		BattleManager.setSpriteset(this._spriteset);
		this._logWindow.setSpriteset(this._spriteset);
	};
	
	Scene_Battle.prototype.createAllWindows = function() {
		this.createLogWindow();
		this.createStatusWindow();
		this.createPartyCommandWindow();
		this.createActorCommandWindow();
		this.createHelpWindow();
		this.createSkillWindow();
		this.createItemWindow();
		this.createActorWindow();
		this.createEnemyWindow();
		this.createMessageWindow();
		this.createScrollTextWindow();
		this.createTbsLeftActorStatusWindow();
		this.createTbsRightActorStatusWindow();
		this.createTbsLeftActorNameWindow();
		this.createTbsRightActorNameWindow();
	};
	
	Scene_Battle.prototype.createStatusWindow = function() {
		this._statusWindow = new Window_BattleStatus();
		this.addWindow(this._statusWindow);
		this._statusWindow.hide();
	};

	Scene_Battle.prototype.createTbsLeftActorStatusWindow = function() {
		var wy = Graphics.boxHeight - Window_TbsActorStatus.prototype.windowHeight();
		this._tbsLeftActorStatusWindow = new Window_TbsActorStatus(0, wy);
		this.addWindow(this._tbsLeftActorStatusWindow);
	};

	Scene_Battle.prototype.createTbsRightActorStatusWindow = function() {
		var wx = Graphics.boxWidth - Window_TbsActorStatus.prototype.windowWidth();
		var wy = Graphics.boxHeight - Window_TbsActorStatus.prototype.windowHeight();
		this._tbsRightActorStatusWindow = new Window_TbsActorStatus(wx, wy);
		this.addWindow(this._tbsRightActorStatusWindow);
	};

	Scene_Battle.prototype.createTbsLeftActorNameWindow = function() {
		var wx = this._tbsLeftActorStatusWindow.width;
		var wy = this._tbsLeftActorStatusWindow.y;
		this._tbsLeftActorNameWindow = new Window_TbsTargetName(wx, wy);
		this.addWindow(this._tbsLeftActorNameWindow);
	};

	Scene_Battle.prototype.createTbsRightActorNameWindow = function() {
		var wx = Graphics.boxWidth - this._tbsRightActorStatusWindow.width - Window_TbsTargetName.prototype.windowWidth();
		var wy = Graphics.boxHeight - Window_TbsTargetName.prototype.windowHeight();
		this._tbsRightActorNameWindow = new Window_TbsTargetName(wx, wy);
		this.addWindow(this._tbsRightActorNameWindow);
	};
	
	//item base
	Scene_ItemBase.prototype.determineItem = function() {
		var actionInfo = this.actionInfo();
		if (actionInfo && actionInfo.action && this.actionIsEnabled(actionInfo.action)) {
			this.showSubWindow(this._actorWindow);
			this._actorWindow.selectForActionInfo(actionInfo);
		}
	};
	
	Scene_ItemBase.prototype.actionInfo = function() {
		return this._itemWindow.actionInfo();
	};
	
	Scene_ItemBase.prototype.actionIsEnabled = function(action) {
		return this._itemWindow.isEnabled(action);
	};
	
	Scene_ItemBase.prototype.onActorOk = function() {
		if (this.canUseAction()) {
			this.useAction();
		} else {
			SoundManager.playBuzzer();
		}
	};
	
	Scene_ItemBase.prototype.actionTargetActors = function() {
		if (this.actionIsForAll()) {
			return $gameParty.members();
		} else {
			return [$gameParty.members()[this._actorWindow.index()]];
		}
	};
	
	Scene_ItemBase.prototype.actionIsForAll = function() {
		var actionInfo = this.actionInfo();
		if(!actionInfo || !actionInfo.action) { return false; }
		var action = actionInfo.action;
		var hits = action.hits;
		return hits && hits.length > 0 &&
			hits.some(function(hit) { return hit.aoe !== undefined && hit.aoe >= 2 && hit.heal
				&& ((hit.heal.damage !== undefined && hit.heal.damage > 0)
				|| (hit.heal.stress !== undefined && hit.heal.stress > 0)); });
	};
	
	Scene_ItemBase.prototype.canUseAction = function() {
		var user = this.user();
		if(!user || !user.canUseAction(this.actionInfo())) { return false; }
		return this.isActionEffectsValid();
	};
	
	Scene_ItemBase.prototype.isActionEffectsValid = function() {
		var actionInfo = this.actionInfo();
		if(!actionInfo || !actionInfo.action || !actionInfo.action.hits || actionInfo.action.hits.length == 0) { return false; }
		var hits = actionInfo.action.hits;
		
		return this.actionTargetActors().some(function(target) {
			return hits.some(function(hit) {
				return target.isHitValid(hit);
			});
		});
	};
	
	Scene_ItemBase.prototype.applyAction = function() {
		var actionInfo = this.actionInfo();
		if(!actionInfo || !actionInfo.action || !actionInfo.action.hits || actionInfo.action.hits.length == 0) { return false; }
		var hits = actionInfo.action.hits;
		
		this.actionTargetActors().forEach(function(target) {
			hits.forEach(function (hit) {
				if(target.isHitValid(hit)) {
					target.applyHit(hit);
				}
			});
		});
		//TODO: replace this
		//action.applyGlobal();
	};
	
	Scene_ItemBase.prototype.onActorCancel = function() {
		this._actorWindow.setDisplayMode(false);
		this.hideSubWindow(this._actorWindow);
	};
	
	//item
	Scene_Item.prototype.create = function() {
		Scene_ItemBase.prototype.create.call(this);
		this.createHelpWindow();
		this._helpWindow.hide();
		this.createCategoryWindow();
		this.createStatusWindow();
		this.createDescriptionWindow();
		this.createItemWindow();
		this.createActorWindow();
	};
	
	Scene_Item.prototype.createCategoryWindow = function() {
		this._categoryWindow = new Window_ItemCategory();
		this._categoryWindow.setHelpWindow(this._helpWindow);
		this._categoryWindow.y = 0;
		this._categoryWindow.setHandler('ok',     this.onCategoryOk.bind(this));
		this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
		this.addWindow(this._categoryWindow);
	};
	
	Scene_Item.prototype.createStatusWindow = function() {
		var wx = 149;
		var wy = this._categoryWindow.height;
		this._statusWindow = new Window_ItemStatus(wx, wy);
		this._categoryWindow.setStatusWindow(this._statusWindow);
		this.addWindow(this._statusWindow);
		this._statusWindow.hide();
	};

	Scene_Item.prototype.createDescriptionWindow = function() {
		var wx = this._statusWindow.x;
		var wy = this._statusWindow.y;
		var ww = this._statusWindow.width;
		var wh = this._statusWindow.height;
		this._descriptionWindow = new Window_SkillDescription(wx, wy, ww, wh);
		this._categoryWindow.setDescriptionWindow(this._descriptionWindow);
		this.addWindow(this._descriptionWindow);
	};
	
	Scene_Item.prototype.createItemWindow = function() {
		var wy = this._statusWindow.y + this._statusWindow.height;
		var wh = Graphics.boxHeight - wy;
		this._itemWindow = new Window_ItemList(0, wy, Graphics.boxWidth, wh);
		this._itemWindow.setHelpWindow(this._helpWindow);
		this._itemWindow.setStatusWindow(this._statusWindow);
		this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
		this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
		this._itemWindow.setHandler('control', this.nextStatusPage.bind(this));
		this._itemWindow.setHandler('shift',   this.prevStatusPage.bind(this));
		this.addWindow(this._itemWindow);
		this._categoryWindow.setItemWindow(this._itemWindow);
	};
	
	Scene_Item.prototype.onCategoryOk = function() {
		this._descriptionWindow.hide();
		this._statusWindow.show();
		this._itemWindow.activate();
		this._itemWindow.selectLast();
	};

	Scene_Item.prototype.onItemOk = function() {
		$gameParty.setLastItem(this.item());
		this.determineItem();
	};

	Scene_Item.prototype.onItemCancel = function() {
		this._descriptionWindow.show();
		this._statusWindow.hide();
		this._itemWindow.deselect();
		this._categoryWindow.activate();
	};

	Scene_Item.prototype.useItem = function() {
		Scene_ItemBase.prototype.useItem.call(this);
		this._itemWindow.redrawCurrentItem();
	};
	
	Scene_Item.prototype.nextStatusPage = function() {
		this._statusWindow.nextStatusPage();
	};
	
	Scene_Item.prototype.prevStatusPage = function() {
		this._statusWindow.prevStatusPage();
	};
	
	//skill
	Scene_Skill.prototype.create = function() {
		Scene_ItemBase.prototype.create.call(this);
		this.createHelpWindow();
		this._helpWindow.hide();
		this.createCharacterInfoWindow();
		this.createActionInfoWindow();
		this.createSkillTypeWindow();
		this.createDescriptionWindow();
		this.createItemWindow();
		this.createActorWindow();
		this.refreshActor();
	};
	
	Scene_Skill.prototype.createCharacterInfoWindow = function() {
		this._characterInfoWindow = new Window_SkillCharacterInfo();
		this.addWindow(this._characterInfoWindow);
	};

	Scene_Skill.prototype.createActionInfoWindow = function() {
		var wy = this._characterInfoWindow.height;
		this._actionInfoWindow = new Window_SkillActionInfo(wy);
		this.addWindow(this._actionInfoWindow);
		this._actionInfoWindow.hide();
	};
	
	Scene_Skill.prototype.createSkillTypeWindow = function() {
		var wy = this._characterInfoWindow.height;
		this._skillTypeWindow = new Window_SkillType(0, wy);
		this._skillTypeWindow.setHelpWindow(this._helpWindow);
		this._skillTypeWindow.setHandler('skill',    this.commandSkill.bind(this));
		this._skillTypeWindow.setHandler('cancel',   this.popScene.bind(this));
		this._skillTypeWindow.setHandler('pagedown', this.nextActor.bind(this));
		this._skillTypeWindow.setHandler('pageup',   this.previousActor.bind(this));
		this.addWindow(this._skillTypeWindow);
	};

	Scene_Skill.prototype.createDescriptionWindow = function() {
		var wx = this._actionInfoWindow.width;
		var wy = this._characterInfoWindow.height;
		var ww = Graphics.boxWidth - this._actionInfoWindow.width;
		var wh = this._actionInfoWindow.height;
		this._descriptionWindow = new Window_SkillDescription(wx, wy, ww, wh);
		this._skillTypeWindow.setDescriptionWindow(this._descriptionWindow);
		this.addWindow(this._descriptionWindow);
	};

	Scene_Skill.prototype.createItemWindow = function() {
		var wy = this._actionInfoWindow.y + this._actionInfoWindow.height;
		var wh = Graphics.boxHeight - wy;
		this._itemWindow = new Window_SkillList(wy, wh);
		this._itemWindow.setHelpWindow(this._helpWindow);
		this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
		this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
		this._itemWindow.setActionInfoWindow(this._actionInfoWindow);
		this._itemWindow.setDescriptionWindow(this._descriptionWindow);
		this._skillTypeWindow.setSkillWindow(this._itemWindow);
		this.addWindow(this._itemWindow);
	};

	Scene_Skill.prototype.refreshActor = function() {
		var actor = this.actor();
		this._characterInfoWindow.setActor(actor);
		this._skillTypeWindow.setActor(actor);
		this._itemWindow.setActor(actor);
	};

	Scene_Skill.prototype.commandSkill = function() {
		this._itemWindow.activate();
		this._itemWindow.selectLast();
		this._skillTypeWindow.hide();
		this._actionInfoWindow.show();
	};

	Scene_Skill.prototype.onItemCancel = function() {
		this._actionInfoWindow.setActionInfo(undefined);
		this._itemWindow.deselect();
		this._skillTypeWindow.activate();
		this._skillTypeWindow.show();
		this._actionInfoWindow.hide();
	};
	
	Scene_ItemBase.prototype.useAction = function() {
		this.playSeForItem();
		var user = this.user();
		if(user) {
			if(user.useActionEquip(this.actionInfo())) {
				this._actorWindow.setDisplayMode(true);
			}
		}
		this.applyAction();
		this.checkGameover();
		this._actorWindow.refresh();
		this._itemWindow.refresh();
	};
	
	//equip
	Scene_Equip.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createCharacterInfoWindow();
		this.createHelpWindow();
		this._helpWindow.hide();
		this.createSlotWindow();
		this.createCommandWindow();
		this.createStatusWindow();
		this.createItemWindow();
		this.refreshActor();
	};
	
	Scene_Equip.prototype.createCharacterInfoWindow = function() {
		this._characterInfoWindow = new Window_EquipCharacterInfo();
		this.addWindow(this._characterInfoWindow);
	};

	Scene_Equip.prototype.createSlotWindow = function() {
		var wy = this._characterInfoWindow.height;
		this._slotWindow = new Window_EquipSlot(wy);
		this._slotWindow.setHelpWindow(this._helpWindow);
		this._slotWindow.setHandler('ok',       this.onSlotOk.bind(this));
		this._slotWindow.setHandler('cancel',   this.onSlotCancel.bind(this));
		this._slotWindow.setHandler('control', this.nextStatusPage.bind(this));
		this._slotWindow.setHandler('shift',   this.prevStatusPage.bind(this));
		this.addWindow(this._slotWindow);
	};
	
	Scene_Equip.prototype.createCommandWindow = function() {
		var wx = this._slotWindow.width;
		var wy = this._characterInfoWindow.height;
		var ww = Graphics.boxWidth - this._slotWindow.width;
		this._commandWindow = new Window_EquipCommand(wx, wy, ww);
		this._commandWindow.setHelpWindow(this._helpWindow);
		this._commandWindow.setSlotWindow(this._slotWindow);
		this._commandWindow.setHandler('equipWeapons',    this.commandEquip.bind(this, "weapons"));
		this._commandWindow.setHandler('equipAccessories', this.commandEquip.bind(this, "accessories"));
		this._commandWindow.setHandler('equipItems',    this.commandEquip.bind(this, "items"));
		this._commandWindow.setHandler('cancel',   this.popScene.bind(this));
		this._commandWindow.setHandler('pagedown', this.nextActor.bind(this));
		this._commandWindow.setHandler('pageup',   this.previousActor.bind(this));
		this.addWindow(this._commandWindow);
	};
	
	Scene_Equip.prototype.createStatusWindow = function() {
		var wx = this._slotWindow.width;
		var wy = this._characterInfoWindow.height;
		var ww = Graphics.boxWidth - this._slotWindow.width;
		var wh = this._slotWindow.height;
		this._statusWindow = new Window_TbsEquipStatus(wx, wy, ww, wh);
		this.addWindow(this._statusWindow);
		this._statusWindow.hide();
		this._slotWindow.setStatusWindow(this._statusWindow);
	};

	Scene_Equip.prototype.createItemWindow = function() {
		var wx = 0;
		var wy = this._statusWindow.y + this._statusWindow.height;
		var ww = Graphics.boxWidth;
		var wh = Graphics.boxHeight - wy;
		this._itemWindow = new Window_EquipItem(wx, wy, ww, wh);
		this._itemWindow.setHelpWindow(this._helpWindow);
		this._itemWindow.setStatusWindow(this._statusWindow);
		this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
		this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
		this._itemWindow.setHandler('control', this.nextStatusPage.bind(this));
		this._itemWindow.setHandler('shift',   this.prevStatusPage.bind(this));
		this._slotWindow.setItemWindow(this._itemWindow);
		this.addWindow(this._itemWindow);
	};

	Scene_Equip.prototype.refreshActor = function() {
		var actor = this.actor();
		this._characterInfoWindow.setActor(actor);
		this._statusWindow.setActor(actor);
		this._slotWindow.setActor(actor);
		this._itemWindow.setActor(actor);
	};

	Scene_Equip.prototype.commandEquip = function(slotsType) {
		this._slotWindow.setSlotsType(slotsType);
		this._slotWindow.activate();
		this._slotWindow.select(0);
		this._commandWindow.hide();
		this._statusWindow.show();
		this._itemWindow.showItems(true);
	};

	Scene_Equip.prototype.onSlotCancel = function() {
		this._slotWindow.setSlotsType("none");
		this._slotWindow.deselect();
		this._commandWindow.activate();
		this._commandWindow.show();
		this._statusWindow.hide();
		this._itemWindow.showItems(false);
	};
	
	Scene_Equip.prototype.onItemOk = function() {
		SoundManager.playEquip();
		this.actor().changeEquip(this._slotWindow.index() + this._slotWindow.slotsOffset(), this._itemWindow.item());
		this._slotWindow.activate();
		this._slotWindow.refresh();
		this._itemWindow.deselect();
		this._itemWindow.refresh();
		this._statusWindow.refresh();
	};
	
	Scene_Equip.prototype.nextStatusPage = function() {
		this._statusWindow.nextStatusPage();
	};
	
	Scene_Equip.prototype.prevStatusPage = function() {
		this._statusWindow.prevStatusPage();
	};
})();
 