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
	
	//boot
	Scene_Boot.prototype.loadSystemImages = function() {
		ImageManager.loadSystem('Window');
		ImageManager.loadSystem('IconSet');
		ImageManager.loadSystem('Balloon');
		ImageManager.loadSystem('Shadow1');
		ImageManager.loadSystem('Shadow2');
		ImageManager.loadSystem('Damage');
		ImageManager.loadSystem('States');
		ImageManager.loadSystem('Weapons1');
		ImageManager.loadSystem('Weapons2');
		ImageManager.loadSystem('Weapons3');
		ImageManager.loadSystem('ButtonSet');
		ImageManager.loadSystem('TextFont');
	};
	
	//title
	Scene_Title.prototype.createCommandWindow = function() {
		this._commandWindow = new Window_TitleCommand();
		this._commandWindow.setHandler('newGame',  this.commandNewGame.bind(this));
		this._commandWindow.setHandler('continue', this.commandContinue.bind(this));
		this._commandWindow.setHandler('options',  this.commandOptions.bind(this));
		this.addWindow(this._commandWindow);
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
		this._tbsBattleFadeSpeed = 12;
		this._tbsSurpriseRoundWindowTimer = 0;
		this._tbsNextRoundWindowTimer = 0;
		this._tbsNextRoundWindowTime = 30*3;
		this._infoWindows = [];
		this._messageWindows = [];
		this._suffixWindows = [];
		SoundManager.loadTbsBattleStartSound();
		SoundManager.loadWindowOpenCloseSound();
		SoundManager.loadDeflectionSound();
		SoundManager.loadStressSound();
	};
	
	Scene_Map.prototype.isSceneMap = function() {
		return true;
	};
	
	Scene_Map.prototype.isMenuCalled = function() {
		var returnVal = Input.isTriggered('menu') || TouchInput.isCancelled();
		if(returnVal && $gameMap.anyCloseableMessageWindows()) {
			$gameMap.closeCloseableMessageWindows();
			return false;
		}
		return returnVal;
	};
	
	Scene_Map.prototype.update = function() {
		this.updateMessageWindows();
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
	
	Scene_Map.prototype.updateMessageWindows = function() {
		if($gameMap.shouldCloseGoldWindow()) {
			this._goldWindow.close();
		}
		if($gameMap.shouldOpenGoldWindow()) {
			this._goldWindow.open();
		}
		if(this._goldWindow.isOpen()) {
			this._goldWindow.refresh();
		}
		
		if($gameMap.shouldCloseItemInfoWindow()) {
			this._itemInfoWindow.close();
		}
		var itemWindowInfo = $gameMap.shouldOpenItemInfoWindow();
		if(itemWindowInfo !== undefined) {
			this._itemInfoWindow.setActor(undefined);
			this._itemInfoWindow.setTempActor(undefined);
			if(itemWindowInfo.itemType === "item") {
				this._itemInfoWindow.setActionsItem($dataItems[itemWindowInfo.itemId]);
			this._itemInfoWindow.showActions();
			} else if(itemWindowInfo.itemType === "weapon") {
				this._itemInfoWindow.setActionsItem($dataWeapons[itemWindowInfo.itemId]);
			this._itemInfoWindow.showActions();
			} else if(itemWindowInfo.itemType === "armor") {
				this._itemInfoWindow.setActionsItem($dataArmors[itemWindowInfo.itemId]);
			this._itemInfoWindow.showProtection();
			}
			this._itemInfoWindow.open();
		}
		if(this._itemInfoWindow.isOpen()) {
			if (Input.isTriggered('pagedown')) {
				SoundManager.playCursor();
				this._itemInfoWindow.nextStatusPage();
			} else if (Input.isTriggered('pageup')) {
				SoundManager.playCursor();
				this._itemInfoWindow.prevStatusPage();
			}
		}
		
		var needToClose = $gameMap.needToCloseCloseableMessageWindows();
		var needToClearMessages = $gameMap.needToClearMessageWindows();
		var waitingOn = false;
		var closeablesRemaining = false;
		var highestInfoY = undefined;
		this._infoWindows.forEach(function (curWindow) {
			if(curWindow.isClosed() || curWindow.isClosing()) {
				if(curWindow.isClosing() && (highestInfoY == undefined || curWindow.y < highestInfoY)) {
					highestInfoY = curWindow.y;
				}
				return;
			}
			if(curWindow.isCloseable()) {
				if(needToClose && curWindow.isOpen()) {
					curWindow.close();
				} else {
					closeablesRemaining = true;
				}
			}
			if(curWindow.isCountingDown()) {
				curWindow.countDown();
			}
			if(curWindow.isWaitOn()) { waitingOn = true; }
			if(highestInfoY == undefined || curWindow.y < highestInfoY) {
				highestInfoY = curWindow.y;
			}
		});
		if(highestInfoY !== undefined && highestInfoY > 0) {
			this._infoWindows.forEach(function (curWindow) {
				if(curWindow.isClosed()) { return; }
				curWindow.y -= highestInfoY + curWindow.standardPadding()*(2/3);
			});
		}
		this._messageWindows.forEach(function (curWindow) {
			if(curWindow.isClosed() || curWindow.isClosing()) {
				return;
			}
			if(needToClearMessages) {
				curWindow.close();
				return;
			}
			if(curWindow.isCloseable()) {
				if(needToClose && curWindow.isOpen()) {
					curWindow.close();
				} else {
					closeablesRemaining = true;
				}
			}
			if(curWindow.isCountingDown()) {
				curWindow.countDown();
			}
			if(curWindow.isWaitOn()) { waitingOn = true; }
		});
		if(!closeablesRemaining) {
			$gameMap.clearCloseableMessageWindows();
		}
		if(!waitingOn) {
			$gameMap.clearWaitingOnMessageWindows();
		}
		
		var pendingMessages = $gameMap.getPendingMessages();
		pendingMessages.forEach(function (message) {
			this.createNewMessageWindow(message);
		}, this);
	};
	
	Scene_Map.prototype.createNewMessageWindow = function(message) {
		if(!message || !message.text || message.text.length <= 0) { return; }
		var windowToUse = undefined;
		var i;
		var indexToUse = 0;
		if(message.type === "infoLog") {
			windowToUse = this._infoWindows[0];
			for(i = 0; i < this._infoWindows.length; i++) {
				if(this._infoWindows[i].isOpen() || this._infoWindows[i].isOpening() || this._infoWindows[i].isClosing()) {
					windowToUse = this._infoWindows[i+1];
					indexToUse = i+1;
				}
			}
		} else if(message.type === "suffix") {
			windowToUse = this._suffixWindows[0];
			for(i = 0; i < this._suffixWindows.length; i++) {
				if(this._suffixWindows[i].isOpen() || this._suffixWindows[i].isOpening() || this._suffixWindows[i].isClosing()) {
					windowToUse = this._suffixWindows[i+1];
					indexToUse = i+1;
				}
			}
		} else {
			windowToUse = this._messageWindows[0];
			for(i = 0; i < this._messageWindows.length; i++) {
				if(this._messageWindows[i].isOpen() || this._messageWindows[i].isOpening() || this._messageWindows[i].isClosing()) {
					windowToUse = this._messageWindows[i+1];
					indexToUse = i+1;
				}
			}
		}
		if(!windowToUse) { return; }
		if(
			!message.suffix &&
			(message.duration == undefined ||
			message.duration < 0 ||
			message.closeable)
		) {
			$gameMap.setCloseableMessageWindowsExist();
		}
		if(message.waitOn) { $gameMap.setWaitingOnMessageWindows(); }
		var messageX = message.x;
		var messageY = message.y;
		if(message.type === "infoLog") {
			var messageX = -windowToUse.standardPadding()*(2/3);
			var messageY = -windowToUse.standardPadding()*(2/3);
		}
		windowToUse.setupAndShow(
			message.type,
			message.absolute,
			message.stayOnScreen,
			messageX,
			messageY,
			message.text,
			message.soundEffect,
			message.waitOn,
			message.duration,
			message.closeable
		);
		if(message.type === "suffix") {
			message.tbsActor.suffixWindow = windowToUse;
		}
		if(message.type === "infoLog") {
			var j;
			for(j = 0; j < this._infoWindows.length; j++) {
				if(indexToUse != j && this._infoWindows[j].isInfoLog() 
					&& (this._infoWindows[j].isOpen() || this._infoWindows[j].isOpening()))
				{
					windowToUse.y += this._infoWindows[j].height - this._infoWindows[j].standardPadding()*(2/3);
				}
			}
		}
	};
	
	Scene_Map.prototype.updateBasedOnTbsBattle = function() {
		if($gameMap.tbsBattleMode()
			&& $gameMap.tbsTurnMode() != "victory" && $gameMap.tbsTurnMode() != "gameOver")
		{
			if(this._tbsSurpriseRoundWindowTimer > 0) {
				this._tbsSurpriseRoundWindowTimer--;
				if(this._tbsSurpriseRoundWindowTimer <= 0) {
					this._tbsSurpriseRoundWindow.close();
				}
			}
			if(this._tbsNextRoundWindowTimer > 0) {
				this._tbsNextRoundWindowTimer--;
				if(this._tbsNextRoundWindowTimer <= 0) {
					this._tbsNextRoundWindow.close();
				}
			}
			if($gameMap.tbsTurnMode() != "setup" && $gameMap.checkTbsSurpriseRoundJustStarted()) {
				this._tbsSurpriseRoundWindow.show();
				this._tbsSurpriseRoundWindow.open();
				this._tbsSurpriseRoundWindowTimer = this._tbsNextRoundWindowTime;
			}
			if($gameMap.checkTbsRoundJustStarted()) {
				this._tbsNextRoundWindow.show();
				this._tbsNextRoundWindow.open();
				this._tbsNextRoundWindowTimer = this._tbsNextRoundWindowTime;
			}
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
					if(!$gameMap.isAnyTbsActionTargets(true)) {
						this._tbsNoTargetWindow.show();
						this._tbsNoTargetWindow.open();
					}
				} else {
					this._tbsNoTargetWindow.close();
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
				this._tbsActorWindow.refresh();
				this._tbsActorWindow.show();
				this._tbsActorWindow.open();
				this._tbsActorWindow.activate();
				this._tbsActorWindow.shouldOpenActionTypeWindow(false);
				this._tbsActorWindow.shouldPassTurn(false);
				this._tbsActorWindow.shouldActivateSurvey(false);
				this._tbsActorWindow.shouldActivateManualMove(false);
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
						this._tbsActionTypeWindow.select(0);
						this._tbsTargetWindow.setActionIndex(-1);
						$gameMap.setTbsTurnMode("selectActorActionType");
						$gameMap.setBreadcrumbStage("actor");
					} else if($gameMap.tbsTurnMode() === "manualTarget") {
						this._tbsTargetNameWindow.close();
						var selectedTarget = $gameMap.getTbsActorAtPosition($gamePlayer.x, $gamePlayer.y);
						var actionInfo = $gameMap.getTbsSelectedActionInfo();
						//if(selectedTarget && (actionInfo.canTargetBodyPart || (actionInfo.canTargetDownedBodyPart && selectedTarget.battler.isDown()))) {
						//	this._tbsTargetPartWindow.refreshWindowContents();
						//	this._tbsTargetPartWindow.show();
						//	this._tbsTargetPartWindow.open();
						//	this._tbsTargetPartWindow.activate();
						//	this._tbsTargetPartFromManualTarget = true;
						//	$gameMap.setTbsTurnMode("selectTargetPart");
						//	$gameMap.setBreadcrumbStage("target");
						//} else {
							this._tbsActorStatusWindow.setTbsActor(undefined);
							this._tbsActorStatusWindow.close();
							$gameMap.setTbsTurnMode("executeAction");
						//}
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
						this._tbsActionWindow.refreshWindowContents(true);
						this._tbsActionWindow.show();
						this._tbsActionWindow.open();
						this._tbsActionWindow.activate();
						this._tbsActorStatusWindow.setTbsActor(undefined);
						this._tbsActorStatusWindow.close();
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
			if($gameMap.tbsTurnMode() === "selectActionTarget" && $gameMap.getShouldOpenActionWindow()) {
				this._tbsActionWindow.refreshWindowContents();
				this._tbsActionWindow.show();
				this._tbsActionWindow.open();
				this._tbsActionWindow.activate();
				$gameMap.clearShouldOpenActionWindow();
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
			this._tbsNoTargetWindow.close();
			this._tbsSurpriseRoundWindow.close();
			this._tbsNextRoundWindow.close();
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
			breadcrumbs.forEach(function (breadcrumb) {
				if(windowNum === 1) {
					this._tbsBreadcrumbWindowOne.setBreadcrumbInfo(breadcrumb);
				} else if(windowNum === 2) {
					this._tbsBreadcrumbWindowTwo.setBreadcrumbInfo(breadcrumb);
				} else if(windowNum === 3) {
					this._tbsBreadcrumbWindowThree.setBreadcrumbInfo(breadcrumb);
				} else if(windowNum === 4) {
					this._tbsBreadcrumbWindowFour.setBreadcrumbInfo(breadcrumb);
					this._tbsBreadcrumbWindowFour.playSounds(true, this._tbsBattleJustStarted);
					this._tbsBattleJustStarted = false;
				}
				windowNum++;
			},this);
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
		this.createSuffixWindows();
		this.createMessageWindow();
		this.createInfoLogWindows();
		this.createConcurrentMessageWindows();
		this.createScrollTextWindow();
		this.createGoldWindow();
		this.createItemInfoWindow();
		this.createTbsActorStatusWindow();
		this.createTbsActorWindow();
		this.createTbsActionTypeWindow();
		this.createTbsSmallActorStatusWindow();
		this.createTbsActionInfoWindow();
		this.createTbsActionLevelWindow();
		this.createTbsActionWindow();
		this.createTbsTargetWindow();
		this.createTbsTargetNameWindow();
		this.createTbsTargetPartWindow();
		this.createTbsBreadcrumbWindows();
		this.createTbsNoTargetWindow();
		this.createTbsSurpriseRoundWindow();
		this.createTbsNextRoundWindow();
	};
	
	Scene_Map.prototype.createInfoLogWindows = function() {
		var i;
		var storedWindows = $gameTemp.storedInfoWindows();
		if(storedWindows) {
			this._infoWindows = storedWindows;
			for(i = 0; i < storedWindows.length; i++) {
				this.addWindow(storedWindows[i]);
			}
			return;
		}
		for(i = 0; i < 50; i++) {
			var concurrentWindow = new Window_ConcurrentWindow();
			this._infoWindows.push(concurrentWindow);
			this.addWindow(concurrentWindow);
		}
		$gameTemp.setStoredInfoWindows(this._infoWindows);
	};
	
	Scene_Map.prototype.createConcurrentMessageWindows = function() {
		var i;
		for(i = 0; i < 50; i++) {
			var concurrentWindow = new Window_ConcurrentWindow();
			this._messageWindows.push(concurrentWindow);
			this.addWindow(concurrentWindow);
		}
	};
	
	Scene_Map.prototype.createSuffixWindows = function() {
		var i;
		var storedWindows = $gameTemp.storedSuffixWindows();
		if(storedWindows) {
			this._suffixWindows = storedWindows;
			for(i = 0; i < storedWindows.length; i++) {
				this.addWindow(storedWindows[i]);
			}
			return;
		}
		for(i = 0; i < 50; i++) {
			var concurrentWindow = new Window_ConcurrentWindow();
			this._suffixWindows.push(concurrentWindow);
			this.addWindow(concurrentWindow);
		}
		$gameTemp.setStoredSuffixWindows(this._suffixWindows);
	};
	
	Scene_Map.prototype.createGoldWindow = function() {
		this._goldWindow = new Window_Gold(0, 0);
		this._goldWindow.y = Graphics.boxHeight - this._goldWindow.height;
		this._goldWindow.openness = 0;
		this.addWindow(this._goldWindow);
	};
	
	Scene_Map.prototype.createItemInfoWindow = function() {
		var wx = Graphics.boxWidth-Window_ItemStatus.prototype.windowWidth();
		var wy = 0; //Window_EquipCharacterInfo.prototype.windowHeight();
		this._itemInfoWindow = new Window_ItemStatus(wx, wy);
		this._itemInfoWindow.openness = 0;
		this.addWindow(this._itemInfoWindow);
	};

	Scene_Map.prototype.createTbsActorStatusWindow = function() {
		var wx = Graphics.boxWidth
			- Window_TbsActorStatus.prototype.windowWidth()
			+ Window_TbsActorStatus.prototype.standardPadding()*(2/3);
		this._tbsActorStatusWindow = new Window_TbsActorStatus(wx, -Window_TbsActorStatus.prototype.standardPadding()*(2/3));
		this.addWindow(this._tbsActorStatusWindow);
		this._tbsActorStatusWindow.hide();
		this._tbsActorStatusWindow.close();
	};

	Scene_Map.prototype.createTbsActorWindow = function() {
		this._tbsActorWindow = new Window_TbsActor(-Window_TbsActorStatus.prototype.standardPadding()*(2/3),
			-Window_TbsActorStatus.prototype.standardPadding()*(2/3));
		this._tbsActorWindow.setHandler('ok',     this.onActorOk.bind(this));
		this._tbsActorWindow.setHandler('cancel',     this.onActorCancel.bind(this));
		this.addWindow(this._tbsActorWindow);
		this._tbsActorWindow.hide();
		this._tbsActorWindow.close();
		this._tbsActorWindow.deactivate();
		this._tbsActorWindow.setActorStatusWindow(this._tbsActorStatusWindow);
	};

	Scene_Map.prototype.createTbsActionTypeWindow = function() {
		this._tbsActionTypeWindow = new Window_TbsActionType(-Window_TbsActorStatus.prototype.standardPadding()*(2/3),
			-Window_TbsActorStatus.prototype.standardPadding()*(2/3));
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

	Scene_Map.prototype.createTbsSmallActorStatusWindow = function() {
		this._tbsSmallActorStatusWindow = new Window_TbsSmallActorStatus();
		this.addWindow(this._tbsSmallActorStatusWindow);
		this._tbsSmallActorStatusWindow.hide();
		this._tbsSmallActorStatusWindow.close();
	};

	Scene_Map.prototype.createTbsActionInfoWindow = function() {
		var wx = Graphics.boxWidth - Window_TbsActionInfo.prototype.windowWidth() + Window_TbsActionInfo.prototype.standardPadding()*(2/3);
		this._tbsActionInfoWindow = new Window_TbsActionInfo(wx, -Window_TbsActionInfo.prototype.standardPadding()*(2/3));
		this.addWindow(this._tbsActionInfoWindow);
		this._tbsActionInfoWindow.hide();
		this._tbsActionInfoWindow.close();
	};
	
	Scene_Map.prototype.createTbsActionLevelWindow = function() {
		this._tbsActionLevelWindow = new Window_TbsActionLevel();
		this.addWindow(this._tbsActionLevelWindow);
		this._tbsActionLevelWindow.hide();
	};

	Scene_Map.prototype.createTbsActionWindow = function() {
		this._tbsActionWindow = new Window_TbsAction(-Window_TbsActorStatus.prototype.standardPadding()*(2/3),
			-Window_TbsActorStatus.prototype.standardPadding()*(2/3));
		this._tbsActionWindow.setHandler('ok',     this.onActionOk.bind(this));
		this._tbsActionWindow.setHandler('cancel',     this.onActionCancel.bind(this));
		this.addWindow(this._tbsActionWindow);
		this._tbsActionWindow.hide();
		this._tbsActionWindow.close();
		this._tbsActionWindow.deactivate();
		this._tbsActionTypeWindow.setActionWindow(this._tbsActionWindow);
		this._tbsActionWindow.setActionTypeWindow(this._tbsActionTypeWindow);
		this._tbsActionWindow.setActionInfoWindow(this._tbsActionInfoWindow);
		this._tbsActionWindow.setActionLevelWindow(this._tbsActionLevelWindow);
		this._tbsActionWindow.setSmallActorStatusWindow(this._tbsSmallActorStatusWindow);
	};

	Scene_Map.prototype.createTbsTargetWindow = function() {
		this._tbsTargetWindow = new Window_TbsTarget(-Window_TbsActorStatus.prototype.standardPadding()*(2/3),
			-Window_TbsActorStatus.prototype.standardPadding()*(2/3));
		this._tbsTargetWindow.setHandler('ok',     this.onTargetOk.bind(this));
		this._tbsTargetWindow.setHandler('cancel',     this.onTargetCancel.bind(this));
		this._tbsTargetWindow.setHandler('pagedown',     this.onTargetSwitchGroups.bind(this));
		this._tbsTargetWindow.setHandler('pageup',     this.onTargetSwitchGroups.bind(this));
		this.addWindow(this._tbsTargetWindow);
		this._tbsTargetWindow.hide();
		this._tbsTargetWindow.close();
		this._tbsTargetWindow.deactivate();
		this._tbsTargetWindow.setActionWindow(this._tbsActionWindow);
		this._tbsActionWindow.setTargetWindow(this._tbsTargetWindow);
		this._tbsTargetWindow.setActorStatusWindow(this._tbsActorStatusWindow);
	};

	Scene_Map.prototype.createTbsTargetNameWindow = function() {
		this._tbsTargetNameWindow = new Window_TbsTargetName(-Window_TbsActorStatus.prototype.standardPadding()*(2/3),
			-Window_TbsActorStatus.prototype.standardPadding()*(2/3));
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
		this._tbsBreadcrumbWindowOne = new Window_TbsBreadcrumb(-Window_TbsActorStatus.prototype.standardPadding()*(2/3),
			Graphics.boxHeight - 288 + Window_TbsActorStatus.prototype.standardPadding()*(2/3)*4);
		this._tbsBreadcrumbWindowTwo = new Window_TbsBreadcrumb(-Window_TbsActorStatus.prototype.standardPadding()*(2/3),
			Graphics.boxHeight - 216 + Window_TbsActorStatus.prototype.standardPadding()*(2/3)*3);
		this._tbsBreadcrumbWindowThree = new Window_TbsBreadcrumb(-Window_TbsActorStatus.prototype.standardPadding()*(2/3),
			Graphics.boxHeight - 144 + Window_TbsActorStatus.prototype.standardPadding()*(2/3)*2);
		this._tbsBreadcrumbWindowFour = new Window_TbsBreadcrumb(-Window_TbsActorStatus.prototype.standardPadding()*(2/3),
			Graphics.boxHeight - 72 + Window_TbsActorStatus.prototype.standardPadding()*(2/3));
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
	
	Scene_Map.prototype.createTbsNoTargetWindow = function() {
		this._tbsNoTargetWindow = new Window_TbsNoTarget();
		this.addWindow(this._tbsNoTargetWindow);
		this._tbsNoTargetWindow.hide();
		this._tbsNoTargetWindow.close();
		this._tbsNoTargetWindow.deactivate();
	};
	
	Scene_Map.prototype.createTbsSurpriseRoundWindow = function() {
		this._tbsSurpriseRoundWindow = new Window_TbsSurpriseRound();
		this.addWindow(this._tbsSurpriseRoundWindow);
		this._tbsSurpriseRoundWindow.hide();
		this._tbsSurpriseRoundWindow.close();
		this._tbsSurpriseRoundWindow.deactivate();
	};
	
	Scene_Map.prototype.createTbsNextRoundWindow = function() {
		this._tbsNextRoundWindow = new Window_TbsNextRound();
		this.addWindow(this._tbsNextRoundWindow);
		this._tbsNextRoundWindow.hide();
		this._tbsNextRoundWindow.close();
		this._tbsNextRoundWindow.deactivate();
	};
	
	Scene_Map.prototype.onActorOk = function() {
		if(this._tbsActorWindow.isOnPass()) {
			this._tbsActorWindow.shouldPassTurn(true);
		} else {
			this._tbsActorWindow.shouldActivateManualMove(true);
			$gameMap.setBreadcrumbStage("manualMove");
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
			$gameMap.setBreadcrumbStage("manualMove");
		}
		this._tbsActionTypeWindow.deactivate();
		this._tbsActionTypeWindow.close();
		$gameMap.setTbsSelectedActionType(undefined);
		SoundManager.playCancel();
	};
	
	Scene_Map.prototype.commandAction = function() {
		if(!$gameMap.isWaitingOnQueuedActions()) {
			this._tbsActionTypeWindow.shouldOpenActionWindow(true);
		}
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
			// if(selectedTarget && (actionInfo.canTargetBodyPart || (actionInfo.canTargetDownedBodyPart && selectedTarget.battler.isDown()))) {
				// this._tbsTargetWindow.shouldOpenTargetPartWindow(true);
				// this._tbsTargetPartFromManualTarget = false;
				// $gameMap.setTbsTurnMode("selectTargetPart");
				// $gameMap.setBreadcrumbStage("target");
			// } else {
				$gameMap.setTbsTurnMode("executeAction");
			//}
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
			this.startFadeOut(this._tbsBattleFadeSpeed);
		}
	};
	
	Scene_Map.prototype.isMenuEnabled = function() {
		return $gameSystem.isMenuEnabled() && !$gameMap.isEventRunning() && !$gameMap.tbsBattleMode();
	};
	
	Scene_Map.prototype.updateEncounter = function() {
		if($gameMap.isInActionBattleScene()) {
			var targets = $gameMap.getTbsActionTargets();
			if(targets && targets.length > 0) {
				var actors = [];
				actors.push($gameMap.getTbsSelectedActor());
				var actionInfo = $gameMap.getTbsSelectedActionInfo();
				var targetsByHit = $gameMap.getTbsActionTargetsByHit();
				var targetX = $gameMap.getTbsActionTargetLocationX();
				var targetY = $gameMap.getTbsActionTargetLocationY();
				var targetPart = $gameMap.getTbsActionTargetPart();
				var rangedDistance = $gameMap.getRangedDistance();
				BattleManager.setup(actors, actionInfo, targetX, targetY, targets, targetsByHit, targetPart, rangedDistance);
				BattleManager.onEncounter();
				SceneManager.push(Scene_Battle);
			} else {
				$gameMap.setInActionBattleScene(false);
			}
		}
	};
	
	Scene_Map.prototype.stopAudioOnBattleStart = function() {
		
	};
	
	Scene_Map.prototype.start = function() {
		Scene_Base.prototype.start.call(this);
		SceneManager.clearStack();
		if (this._transfer) {
			this.fadeInForTransfer();
			this._mapNameWindow.open();
			$gameMap.autoplay();
		} else if (this.needsFadeIn()) {
			this.startFadeIn($gameMap.tbsBattleMode() ? this._tbsBattleFadeSpeed : this.fadeSpeed(), false);
		}
		this.menuCalling = false;
	};
	
	//menu
	Scene_Menu.prototype.createCommandWindow = function() {
		this._commandWindow = new Window_MenuCommand(0, 0);
		this._commandWindow.setHandler('item',      this.commandItem.bind(this));
		this._commandWindow.setHandler('skill',     this.commandPersonal.bind(this));
		this._commandWindow.setHandler('equip',     this.commandPersonal.bind(this));
		this._commandWindow.setHandler('status',    this.commandPersonal.bind(this));
		this._commandWindow.setHandler('formation', this.commandFormation.bind(this));
		this._commandWindow.setHandler('options',   this.commandOptions.bind(this));
		this._commandWindow.setHandler('camp',   	this.commandCamp.bind(this));
		this._commandWindow.setHandler('save',      this.commandSave.bind(this));
		this._commandWindow.setHandler('gameEnd',   this.commandGameEnd.bind(this));
		this._commandWindow.setHandler('cancel',    this.popScene.bind(this));
		this.addWindow(this._commandWindow);
	};
	
	Scene_Menu.prototype.commandCamp = function() {
		$gameParty.members().forEach(function (member) {
			member.recoverAll();
		});
		this._statusWindow.refresh();
		this._commandWindow.activate();
		SoundManager.playUseSkill();
	};
	
	//battle
	Scene_Battle.prototype.initialize = function() {
		Scene_Base.prototype.initialize.call(this);
		this._tbsBattleFadeSpeed = 12;
	};
	
	Scene_Battle.prototype.start = function() {
		Scene_Base.prototype.start.call(this);
		this.startFadeIn(this._tbsBattleFadeSpeed, false);
		//BattleManager.playBattleBgm();
		BattleManager.startBattle();
	};
	
	Scene_Battle.prototype.stop = function() {
		Scene_Base.prototype.stop.call(this);
		if (this.needsSlowFadeOut()) {
			this.startFadeOut(this.slowFadeSpeed(), false);
		} else {
			this.startFadeOut(this._tbsBattleFadeSpeed, false);
		}
		this._statusWindow.close();
		this._partyCommandWindow.close();
		this._actorCommandWindow.close();
	};
	
	Scene_Battle.prototype.createDisplayObjects = function() {
		this.createSpriteset();
		this.createWindowLayer();
		this.createAllWindows();
		BattleManager.setLogWindow(this._logWindow);
		BattleManager.setLeftActorStatusWindow(this._tbsLeftActorStatusWindow);
		BattleManager.setRightActorStatusWindow(this._tbsRightActorStatusWindow);
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
	};
	
	Scene_Battle.prototype.createStatusWindow = function() {
		this._statusWindow = new Window_BattleStatus();
		this.addWindow(this._statusWindow);
		this._statusWindow.hide();
	};

	Scene_Battle.prototype.createTbsLeftActorStatusWindow = function() {
		var wx = -Window_TbsActorStatus.prototype.standardPadding()*(2/3);
		var wy = Graphics.boxHeight - Window_TbsActorStatus.prototype.windowHeight()
			+ Window_TbsActorStatus.prototype.standardPadding()*(2/3);
		this._tbsLeftActorStatusWindow = new Window_TbsActorStatus(wx, wy);
		this.addWindow(this._tbsLeftActorStatusWindow);
	};

	Scene_Battle.prototype.createTbsRightActorStatusWindow = function() {
		var wx = Graphics.boxWidth - Window_TbsActorStatus.prototype.windowWidth()
			+ Window_TbsActorStatus.prototype.standardPadding()*(2/3);
		var wy = -Window_TbsActorStatus.prototype.standardPadding()*(2/3);
		this._tbsRightActorStatusWindow = new Window_TbsActorStatus(wx, wy);
		this.addWindow(this._tbsRightActorStatusWindow);
	};
	
	//item base
	Scene_ItemBase.prototype.createActorBodyPartWindow = function() {
		this._actorBodyPartWindow = new Window_ActorBodyPart(0, 0);
		this._actorBodyPartWindow.setHandler('targetPart',     this.onActorBodyPartOk.bind(this));
		this._actorBodyPartWindow.setHandler('cancel',     this.onActorBodyPartCancel.bind(this));
		this.addWindow(this._actorBodyPartWindow);
		this._actorBodyPartWindow.hide();
		this._actorBodyPartWindow.deactivate();
	};
	
	Scene_ItemBase.prototype.determineItem = function() {
		var actionInfo = this.actionInfo();
		if (actionInfo && actionInfo.action && this.actionIsEnabled(actionInfo.action)) {
			this.showSubWindow(this._actorWindow);
			this._actorWindow.selectForActionInfo(actionInfo, this.user());
		}
	};
	
	Scene_ItemBase.prototype.actionInfo = function() {
		return this._itemWindow.actionInfo();
	};
	
	Scene_ItemBase.prototype.actionIsEnabled = function(action) {
		return this._itemWindow.isEnabled(action);
	};
	
	Scene_ItemBase.prototype.createActorWindow = function() {
		this._actorWindow = new Window_MenuActor();
		this._actorWindow.x = Graphics.boxWidth - this._actorWindow.width;
		this._actorWindow.setHandler('ok',     this.onActorOk.bind(this));
		this._actorWindow.setHandler('cancel', this.onActorCancel.bind(this));
		this.addWindow(this._actorWindow);
	};
	
	Scene_ItemBase.prototype.showSubWindow = function(window) {
		window.show();
		window.activate();
	};
	
	Scene_ItemBase.prototype.onActorOk = function() {
		if (this.canUseAction()) {
			// if(this.actionEffectTargetsBodyPart()) {
				// SoundManager.playOk();
				// this._actorWindow.deactivate();
				// this._actorBodyPartWindow.show();
				// this._actorBodyPartWindow.activate();
				// this._actorBodyPartWindow.select(0);
			// } else {
				this._actorBodyPart = undefined;
				this.useAction();
			//}
		} else {
			SoundManager.playBuzzer();
		}
	};
	
	Scene_ItemBase.prototype.onActorBodyPartOk = function() {
		this._actorBodyPart = undefined;
		switch(this._actorBodyPartWindow.currentExt()) {
			case 1:
				this._actorBodyPart = "head";
				break;
			case 2:
				this._actorBodyPart = "torso";
				break;
			case 3:
				this._actorBodyPart = "rightArm";
				break;
			case 4:
				this._actorBodyPart = "leftArm";
				break;
			case 5:
				this._actorBodyPart = "rightLeg";
				break;
			case 6:
				this._actorBodyPart = "leftLeg";
				break;
		}
		this.useAction();
	};
	
	Scene_ItemBase.prototype.onActorBodyPartCancel = function() {
		this._actorWindow.activate();
		this._actorBodyPartWindow.hide();
		this._actorBodyPartWindow.deactivate();
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
		var hitGroups = action.hitGroups;
		var user = this.user();
		var extraAoe = user == undefined ? 0 : user.baseRange();
		return hitGroups && hitGroups.length > 0 &&
			hitGroups.some(function(hitGroup) { if(!hitGroup.hits || hitGroup.hits.length == 0) { return false; }
				return hitGroup.hits.some(function (hit) { return hit.aoe !== undefined && hit.aoe + (hit.aoeUsesUserRange ? extraAoe : 0) >= 2 && hit.heal
				&& ((hit.heal.damage !== undefined && hit.heal.damage > 0)
				|| (hit.heal.stress !== undefined && hit.heal.stress > 0)); }); });
	};
	
	Scene_ItemBase.prototype.canUseAction = function() {
		var user = this.user();
		if(!user || !user.canUseAction(this.actionInfo())) { return false; }
		return this.isActionEffectsValid();
	};
	
	Scene_ItemBase.prototype.isActionEffectsValid = function() {
		var actionInfo = this.actionInfo();
		if(!actionInfo || !actionInfo.action || !actionInfo.action.hitGroups || actionInfo.action.hitGroups.length == 0) { return false; }
		var hitGroups = actionInfo.action.hitGroups;
		
		return this.actionTargetActors().some(function(target) {
			return hitGroups.some(function(hitGroup) {
				if(!hitGroup.hits || hitGroup.hits.length == 0) { return false; }
				return hitGroup.hits.some(function(hit) {
					return target.isHitValid(hit);
				});
			});
		});
	};
	
	Scene_ItemBase.prototype.actionEffectTargetsBodyPart = function() {
		var actionInfo = this.actionInfo();
		if(!actionInfo || !actionInfo.action || !actionInfo.action.hitGroups || actionInfo.action.hitGroups.length == 0) { return false; }
		var hitGroups = actionInfo.action.hitGroups;
		
		return hitGroups.some(function(hitGroup) {
			if(!hitGroup.hits || hitGroup.hits.length == 0) { return false; }
			return hitGroup.hits.some(function(hit) {
				if(hit.heal && hit.heal.damage !== undefined && hit.heal.damage > 0
					&& (hit.aoe == undefined)) { return true; }
				return false;
			});
		});
	};
	
	Scene_ItemBase.prototype.applyAction = function() {
		var actionInfo = this.actionInfo();
		if(!actionInfo || !actionInfo.action || !actionInfo.action.hitGroups || actionInfo.action.hitGroups.length == 0) { return false; }
		
		var hitGroups = actionInfo.action.hitGroups;
		
		this.actionTargetActors().forEach(function(target) {
			hitGroups.forEach(function (hitGroup) {
				if(!hitGroup.hits || hitGroup.hits.length == 0) { return; }
				hitGroup.hits.forEach(function (hit) {
					if(target.isHitValid(hit)) {
						target.applyHit(this.user(), actionInfo, hit);
					}
				}, this);
			}, this);
		}, this);
		//TODO: replace this
		//action.applyGlobal();
	};
	
	Scene_ItemBase.prototype.onActorCancel = function() {
		this._actorWindow.setDisplayMode(false);
		this.hideSubWindow(this._actorWindow);
	};
	
	Scene_ItemBase.prototype.useAction = function() {
		this.playSeForItem();
		var user = this.user();
		this.applyAction();
		if(user) {
			if(user.useActionItem(this.actionInfo()) || user.useActionMP(this.actionInfo())) {
				this._actorWindow.setDisplayMode(true);
			}
		}
		this.checkGameover();
		this._actorBodyPartWindow.hide();
		this._actorBodyPartWindow.deactivate();
		this._actorWindow.activate();
		this._actorWindow.refresh();
		this._itemWindow.refresh();
	};
	
	//item
	Scene_Item.prototype.create = function() {
		Scene_ItemBase.prototype.create.call(this);
		this.createTitleWindow();
		this.createHelpWindow();
		this._helpWindow.hide();
		this.createCategoryWindow();
		this.createItemWindow();
		this.createActorItemWindows();
		this.createStatusWindow();
		this.createItemNameWindow();
		this.createItemOptionsWindow();
		this.createActorWindow();
		this.createYesNoWindow();
		this.createActorBodyPartWindow();
	};
	
	Scene_Item.prototype.createTitleWindow = function() {
		this._titleWindow = new Window_MenuTitle();
		this._titleWindow.setTitle("Items");
		this.addWindow(this._titleWindow);
	};
	
	Scene_Item.prototype.createCategoryWindow = function() {
		this._categoryWindow = new Window_ItemCategory(this._titleWindow.height);
		this._categoryWindow.setHelpWindow(this._helpWindow);
		this._categoryWindow.setHandler('ok',     this.onCategoryOk.bind(this));
		this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
		this.addWindow(this._categoryWindow);
	};
	
	Scene_Item.prototype.createItemWindow = function() {
		var wx = this._categoryWindow.width;
		var wy = 0;
		this._itemWindow = new Window_ItemList(wx, wy, false);
		this._itemWindow.setHelpWindow(this._helpWindow);
		this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
		this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
		this._itemWindow.deactivate();
		this.addWindow(this._itemWindow);
		this._categoryWindow.setItemWindow(this._itemWindow);
	};
	
	Scene_Item.prototype.createActorItemWindows = function() {
		var wx = this._categoryWindow.width;
		var wy = 0;
		var i;
		this._actorItemWindows = [];
		this._actorItemNameWindows = [];
		for(i = 0; i < $gameParty.size(); i++) {
			var nameWindowYOffset = Window_ActorItemName.prototype.windowHeight() - Window_Base.prototype.standardCharacterHeight();
			this._actorItemNameWindows[i] = new Window_ActorItemName(wx, wy);
			this._actorItemNameWindows[i].setActor($gameParty.members()[i]);
			this._actorItemWindows[i] = new Window_ItemList(
				wx,
				wy + nameWindowYOffset,
				true
			);
			this._actorItemWindows[i].setHandler('ok',     this.onActorItemOk.bind(this));
			this._actorItemWindows[i].setHandler('cancel', this.onActorItemCancel.bind(this));
			this._actorItemWindows[i].setActor($gameParty.members()[i]);
			this._actorItemWindows[i].setNameWindowYOffset(nameWindowYOffset);
			this._actorItemWindows[i].setYStartPosition(0);
			this.addWindow(this._actorItemWindows[i]);
			this.addWindow(this._actorItemNameWindows[i]);
			if(i > 0) {
				this._actorItemWindows[i-1].setNextWindow(this._actorItemWindows[i]);
				this._actorItemWindows[i].setPreviousWindow(this._actorItemWindows[i-1]);
			}
			this._actorItemWindows[i].setActorNameWindow(this._actorItemNameWindows[i]);
			wy += Window_ItemList.prototype.partyWindowHeight() + nameWindowYOffset;
		}
		this._categoryWindow.setActorItemWindows(this._actorItemWindows);
	};

	Scene_Item.prototype.createStatusWindow = function() {
		var wx = Window_ItemOption.prototype.windowWidth();
		var wy = this._titleWindow.height-Window_Base.prototype.standardCharacterHeight();
		this._statusWindow = new Window_ItemStatus(wx, wy);
		this.addWindow(this._statusWindow);
		this._statusWindow.hide();
		this._itemWindow.setStatusWindow(this._statusWindow);
		this._actorItemWindows.forEach(function (itemWindow) {
			itemWindow.setStatusWindow(this._statusWindow);
		}, this);
	};
	
	Scene_Item.prototype.createItemNameWindow = function() {
		var wx = this._titleWindow.width;
		this._itemNameWindow = new Window_ItemName(wx);
		this._itemNameWindow.hide();
		this.addWindow(this._itemNameWindow);
		this._itemWindow.setItemNameWindow(this._itemNameWindow);
		this._actorItemWindows.forEach(function (itemWindow) {
			itemWindow.setItemNameWindow(this._itemNameWindow);
		}, this);
	};
	
	Scene_Item.prototype.createItemOptionsWindow = function() {
		var wy = this._categoryWindow.y + this._categoryWindow.height;
		this._itemOptionsWindow = new Window_ItemOption(0, wy);
		this._itemOptionsWindow.setHelpWindow(this._helpWindow);
		this._itemOptionsWindow.setHandler('use',    this.commandItemUse.bind(this));
		this._itemOptionsWindow.setHandler('stash',    this.commandItemStash.bind(this));
		this._itemOptionsWindow.setHandler('give',    this.commandItemGive.bind(this));
		this._itemOptionsWindow.setHandler('discard',    this.commandItemDiscard.bind(this));
		this._itemOptionsWindow.setHandler('cancel',   this.commandItemCancel.bind(this));
		this._itemOptionsWindow.setHandler('pagedown', this.nextStatusPage.bind(this));
		this._itemOptionsWindow.setHandler('pageup',   this.prevStatusPage.bind(this));
		this._itemOptionsWindow.hide();
		this._itemOptionsWindow.deactivate();
		this._itemWindow.setItemOptionsWindow(this._itemOptionsWindow);
		this._actorItemWindows.forEach(function (itemWindow) {
			itemWindow.setItemOptionsWindow(this._itemOptionsWindow);
		}, this);
		this.addWindow(this._itemOptionsWindow);
	};
	
	Scene_Item.prototype.createYesNoWindow = function() {
		var wy = this._itemOptionsWindow.y + this._itemOptionsWindow.height;
		this._yesNoWindow = new Window_YesNoConfirm(0, wy);
		this._yesNoWindow.setHandler('yes',    this.commandItemDiscardConfirm.bind(this));
		this._yesNoWindow.setHandler('no',    this.commandItemDiscardCancel.bind(this));
		this._yesNoWindow.setHandler('cancel',    this.commandItemDiscardCancel.bind(this));
		this.addWindow(this._yesNoWindow);
		this._yesNoWindow.hide();
		this._yesNoWindow.deactivate();
		this._yesNoWindow.deselect();
		this._itemOptionsWindow.setYesNoWindow(this._yesNoWindow);
		this._yesNoWindow.setYesText("Trash");
		this._yesNoWindow.setNoText("Don't");
	};
	
	Scene_Item.prototype.determineItem = function() {
		var actionInfo = this.actionInfo();
		if (actionInfo && actionInfo.action && this.actionIsEnabled(actionInfo.action)) {
			this._actorWindow.show();
			this._actorWindow.activate();
			this._actorWindow.selectForActionInfo(actionInfo, this.user());
			this._itemOptionsWindow.deactivate();
		}
	};
	
	Scene_Item.prototype.actionInfo = function() {
		return this._itemOptionsWindow.actionInfo();
	};
	
	Scene_Item.prototype.actionIsEnabled = function(action) {
		return true;
	};
	
	Scene_Item.prototype.user = function() {
		return this._itemOptionsWindow.actor();
	};
	
	Scene_Item.prototype.onActorCancel = function() {
		this._actorWindow.setDisplayMode(false);
		this._actorWindow.hide();
		this._actorWindow.deactivate();
		if(this._usedItemUp) {
			this.commandItemCancel();
			this._usedItemUp = false;
		} else {
			this._itemOptionsWindow.activate();
			this._itemOptionsWindow.refresh();
		}
	};
	
	Scene_Item.prototype.useAction = function() {
		this.playSeForItem();
		var user = this.user();
		this.applyAction();
		if(user) {
			if(user.useActionItem(this.actionInfo())) {
				this._actorWindow.setDisplayMode(true);
				this._usedItemUp = true;
			}
		}
		this.checkGameover();
		this._actorBodyPartWindow.hide();
		this._actorBodyPartWindow.deactivate();
		this._actorWindow.activate();
		this._actorWindow.refresh();
		this._itemWindow.refresh();
		this._actorItemWindows.forEach(function (itemWindow) {
			itemWindow.refresh();
		});
	};
	
	Scene_Item.prototype.onCategoryOk = function() {
		if(this._categoryWindow.index() == 0) {
			var first = true;
			this._actorItemWindows.forEach(function (itemWindow) {
				if(first && itemWindow.visible) {
					itemWindow.activate();
					itemWindow.select(0);
					first = false;
				} else {
					itemWindow.deactivate();
					itemWindow.deselect();
				}
			});
		} else if (this._categoryWindow.index() == 1 || this._categoryWindow.index() == 2){
			this._itemWindow.activate();
			this._itemWindow.select(0);
		}
	};

	Scene_Item.prototype.onActorItemOk = function() {
		this._actorItemWindows.forEach(function (itemWindow) {
			itemWindow.deactivate();
		});
		this._itemNameWindow.show();
		this._statusWindow.show();
		this._itemOptionsWindow.show();
		this._itemOptionsWindow.select(0);
		this._itemOptionsWindow.activate();
	};

	Scene_Item.prototype.onActorItemCancel = function() {
		this._actorItemWindows.forEach(function (itemWindow) {
			itemWindow.clearOrgSelect();
			itemWindow.deactivate();
			itemWindow.deselect();
			itemWindow.refresh();
		});
		this._itemOptionsWindow.setItem(undefined);
		this._itemOptionsWindow.setActor(undefined);
		this._categoryWindow.activate();
	};

	Scene_Item.prototype.onItemOk = function() {
		this._itemWindow.deactivate();
		this._itemNameWindow.show();
		this._statusWindow.show();
		this._itemOptionsWindow.show();
		this._itemOptionsWindow.select(0);
		this._itemOptionsWindow.activate();
	};

	Scene_Item.prototype.onItemCancel = function() {
		this._itemOptionsWindow.setItem(undefined);
		this._itemOptionsWindow.setActor(undefined);
		this._itemWindow.deselect();
		this._categoryWindow.activate();
	};

	Scene_Item.prototype.useItem = function() {
		Scene_ItemBase.prototype.useItem.call(this);
		this._itemWindow.redrawCurrentItem();
	};
	
	Scene_Item.prototype.commandItemUse = function() {
		this.determineItem();
	};
	
	Scene_Item.prototype.commandItemStash = function() {
		var actor = this._itemOptionsWindow.actor();
		var item = this._itemOptionsWindow.item();
		var itemIndex = this._itemOptionsWindow.itemIndex();
		actor.loseItemAtIndex(itemIndex);
		$gameParty.gainItem(item, 1, false);
		this.commandItemCancel();
	};
	
	Scene_Item.prototype.commandItemGive = function() {
		var actor = $gameParty.members()[this._itemOptionsWindow.index()];
		var item = this._itemOptionsWindow.item();
		actor.gainItem(item);
		$gameParty.gainItem(item, -1, false);
		this.commandItemCancel();
	};
	
	Scene_Item.prototype.commandItemDiscard = function() {
		this._itemOptionsWindow.deactivate();
		this._yesNoWindow.show();
		this._yesNoWindow.activate();
		this._yesNoWindow.select(1);
	};
	
	Scene_Item.prototype.commandItemDiscardConfirm = function() {
		var actor = this._itemOptionsWindow.actor();
		if(actor) {
			var itemIndex = this._itemOptionsWindow.itemIndex();
			actor.loseItemAtIndex(itemIndex);
		} else {
			var item = this._itemOptionsWindow.item();
			$gameParty.gainItem(item, -1, false);
		}
		this._yesNoWindow.hide();
		this._yesNoWindow.deactivate();
		this._yesNoWindow.deselect();
		this.commandItemCancel();
	};
	
	Scene_Item.prototype.commandItemDiscardCancel = function() {
		this._yesNoWindow.hide();
		this._yesNoWindow.deactivate();
		this._yesNoWindow.deselect();
		this._itemOptionsWindow.activate();
	};
	
	Scene_Item.prototype.commandItemCancel = function() {
		var activated = false;
		this._actorItemWindows.forEach(function (itemWindow) {
			if(itemWindow.lastWindowUsed()) {
				itemWindow.activate();
				itemWindow.clearLastWindowUsed();
				activated = true;
			} else {
				itemWindow.deactivate();
				itemWindow.deselect();
			}
			itemWindow.refresh();
		});
		if(!activated) {
			this._itemWindow.activate();
		}
		this._itemNameWindow.hide();
		this._statusWindow.hide();
		this._itemOptionsWindow.deactivate();
		this._itemOptionsWindow.hide();
		this._itemOptionsWindow.deselect();
		this._itemWindow.refresh();
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
		this.createTitleWindow();
		this.createActorNameWindow();
		this.createSkillTypeWindow();
		this.createActionInfoWindow();
		this.createDescriptionWindow();
		this.createItemWindow();
		this.createActorWindow();
		this.createActorBodyPartWindow();
		this.refreshActor();
	};
	
	Scene_Skill.prototype.createTitleWindow = function() {
		this._titleWindow = new Window_MenuTitle();
		this._titleWindow.setTitle("Techs");
		this.addWindow(this._titleWindow);
	};
	
	Scene_Skill.prototype.createActorNameWindow = function() {
		var wx = this._titleWindow.width;
		this._actorNameWindow = new Window_ActorName(wx);
		this.addWindow(this._actorNameWindow);
	};
	
	Scene_Skill.prototype.createSkillTypeWindow = function() {
		var wy = this._titleWindow.height;
		this._skillTypeWindow = new Window_SkillType(0, wy);
		this._skillTypeWindow.setHelpWindow(this._helpWindow);
		this._skillTypeWindow.setHandler('skill',    this.commandSkill.bind(this));
		this._skillTypeWindow.setHandler('cancel',   this.popScene.bind(this));
		this._skillTypeWindow.setHandler('pagedown', this.nextActor.bind(this));
		this._skillTypeWindow.setHandler('pageup',   this.previousActor.bind(this));
		this.addWindow(this._skillTypeWindow);
	};

	Scene_Skill.prototype.createActionInfoWindow = function() {
		var wy = this._titleWindow.height;
		this._actionInfoWindow = new Window_SkillActionInfo(wy);
		this.addWindow(this._actionInfoWindow);
		this._actionInfoWindow.hide();
	};

	Scene_Skill.prototype.createDescriptionWindow = function() {
		var wx = this._actionInfoWindow.width;
		var wy = this._actorNameWindow.height;
		this._descriptionWindow = new Window_SkillDescription(wx, wy);
		this._skillTypeWindow.setDescriptionWindow(this._descriptionWindow);
		this.addWindow(this._descriptionWindow);
	};

	Scene_Skill.prototype.createItemWindow = function() {
		var wy = this._actionInfoWindow.y + this._actionInfoWindow.height;
		this._itemWindow = new Window_SkillList(wy);
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
		actor.checkLearnedSkills();
		this._actorNameWindow.setActor(actor);
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
		this._slotWindow.setHandler('pagedown', this.nextStatusPage.bind(this));
		this._slotWindow.setHandler('pageup',   this.prevStatusPage.bind(this));
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
		this._commandWindow.setHandler('organizeItems',    this.commandOrganize.bind(this));
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
		this._itemWindow.setSlotWindow(this._slotWindow);
		this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
		this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
		this._itemWindow.setHandler('pagedown', this.nextStatusPage.bind(this));
		this._itemWindow.setHandler('pageup',   this.prevStatusPage.bind(this));
		this._commandWindow.setItemWindow(this._itemWindow);
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
	};
	
	Scene_Equip.prototype.commandOrganize = function() {
		this._slotWindow.setSlotsType("none");
		this._itemWindow.activate();
		this._itemWindow.select(0);
		this._commandWindow.hide();
		this._statusWindow.show();
	};

	Scene_Equip.prototype.onSlotCancel = function() {
		this._slotWindow.setSlotsType("none");
		this._slotWindow.deselect();
		this._commandWindow.activate();
		this._commandWindow.show();
		this._statusWindow.hide();
	};
	
	Scene_Equip.prototype.onItemOk = function() {
		if(this._itemWindow.organizeMode()) {
			if(this._itemWindow.isOrgSelected()) {
				SoundManager.playOk();
			} else {
				SoundManager.playEquip();
			}
		} else {
			SoundManager.playEquip();
			this.actor().changeEquip(this._slotWindow.index() + this._slotWindow.slotsOffset(),
				this._itemWindow.item(), this._itemWindow.index());
			this._slotWindow.activate();
			this._slotWindow.refresh();
			this._itemWindow.deselect();
			this._itemWindow.deactivate();
			this._statusWindow.refresh();
		}
		this._itemWindow.refresh();
	};
	
	Scene_Equip.prototype.onItemCancel = function() {
		if(this._itemWindow.organizeMode()) {
			if(this._itemWindow.isOrgSelected()) {
				this._itemWindow.clearOrgSelect();
			} else {
				this._itemWindow.deselect();
				this._itemWindow.deactivate();
				this._slotWindow.setSlotsType("none");
				this._slotWindow.deselect();
				this._commandWindow.activate();
				this._commandWindow.show();
				this._statusWindow.hide();
			}
		} else {
			this._itemWindow.deselect();
			this._itemWindow.deactivate();
			this._slotWindow.activate();
		}
	};
	
	Scene_Equip.prototype.nextStatusPage = function() {
		this._statusWindow.nextStatusPage();
	};
	
	Scene_Equip.prototype.prevStatusPage = function() {
		this._statusWindow.prevStatusPage();
	};
	
	//status
	Scene_Status.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this._statusWindow = new Window_Status();
		
		this._statusCommandWindow = new Window_StatusCommand(this._statusWindow.height);
		this._statusCommandWindow.setHandler('skills',		this.onSkillCommand.bind(this));
		this._statusCommandWindow.setHandler('attributes',	this.onAttributesCommand.bind(this));
		this._statusCommandWindow.setHandler('cancel',   	this.popScene.bind(this));
		this._statusCommandWindow.setHandler('pagedown', this.nextActor.bind(this));
		this._statusCommandWindow.setHandler('pageup',   this.previousActor.bind(this));
		this._statusCommandWindow.show();
		this._statusCommandWindow.activate();
		
		this._statusSkillsWindow = new Window_StatusSkills(this._statusWindow.height);
		this._statusSkillsWindow.setStatusWindow(this._statusWindow);
		this._statusSkillsWindow.setHandler('ok',   	this.onSkillOk.bind(this));
		this._statusSkillsWindow.setHandler('cancel',   this.onSkillCancel.bind(this));
		this._statusSkillsWindow.setHandler('pagedown', this.nextActor.bind(this));
		this._statusSkillsWindow.setHandler('pageup',   this.previousActor.bind(this));
		this._statusSkillsWindow.hide();
		this._statusSkillsWindow.deactivate();
		
		this._statusSkillOptionWindow = new Window_StatusSkillOption(
			Graphics.boxWidth-Window_StatusSkillOption.prototype.windowWidth(),
			this._statusSkillsWindow.y -
				(Window_StatusSkillOption.prototype.standardPadding()*2+Window_StatusSkillOption.prototype.lineHeight()*2)
		);
		this._statusSkillsWindow.setSkillOptionWindow(this._statusSkillOptionWindow);
		this._statusSkillOptionWindow.setHandler('upgrade',		this.onSkillOption.bind(this, 'upgrade'));
		this._statusSkillOptionWindow.setHandler('downgrade',	this.onSkillOption.bind(this, 'downgrade'));
		this._statusSkillOptionWindow.setHandler('cancel',		this.onSkillOptionCancel.bind(this));
		this._statusSkillOptionWindow.hide();
		this._statusSkillOptionWindow.deactivate();
		
		this._statusSkillConfirmWindow = new Window_YesNoConfirm(
			this._statusSkillOptionWindow.x,
			this._statusSkillOptionWindow.y -
				(Window_StatusSkillOption.prototype.standardPadding()*2+Window_StatusSkillOption.prototype.lineHeight()*2)
		);
		this._statusSkillConfirmWindow.setHandler('yes',    this.onConfirmYes.bind(this));
		this._statusSkillConfirmWindow.setHandler('no',    this.onConfirmCancel.bind(this));
		this._statusSkillConfirmWindow.setHandler('cancel',    this.onConfirmCancel.bind(this));
		this._statusSkillConfirmWindow.setYesText("Confirm");
		this._statusSkillConfirmWindow.setNoText("Cancel");
		this._statusSkillConfirmWindow.hide();
		this._statusSkillConfirmWindow.deactivate();
		
		this._statusSkillLearnedWindow = new Window_StatusSkillLearned();
		this._statusSkillLearnedWindow.setHandler(this.onLearnedInput.bind(this));
		this._statusSkillsWindow.setSkillLearnedWindow(this._statusSkillLearnedWindow);
		this._statusSkillLearnedWindow.hide();
		this._statusSkillLearnedWindow.deactivate();
		
		this._statusAttributesListWindow = new Window_StatusAttributesList(
			this._statusWindow.height,
			Graphics.boxHeight - this._statusWindow.height
		);
		this._statusAttributesListWindow.setHandler('ok',	this.onAttributesOk.bind(this));
		this._statusAttributesListWindow.setHandler('cancel',	this.onAttributesCancel.bind(this));
		this._statusAttributesListWindow.setHandler('pagedown', this.nextActor.bind(this));
		this._statusAttributesListWindow.setHandler('pageup',   this.previousActor.bind(this));
		this._statusAttributesListWindow.hide();
		this._statusAttributesListWindow.deactivate();
		
		this._statusAttributeDescriptionWindow = new Window_StatusAttributeDescription(
			this._statusAttributesListWindow.width,
			this._statusWindow.height,
			Graphics.boxWidth - this._statusAttributesListWindow.width,
			Graphics.boxHeight - this._statusWindow.height
		);
		this._statusAttributesListWindow.setAttributeDescriptionWindow(this._statusAttributeDescriptionWindow);
		this._statusAttributeDescriptionWindow.hide();
		this._statusAttributeDescriptionWindow.deactivate();
		
		this.addWindow(this._statusWindow);
		this.addWindow(this._statusCommandWindow);
		this.addWindow(this._statusSkillsWindow);
		this.addWindow(this._statusSkillOptionWindow);
		this.addWindow(this._statusSkillConfirmWindow);
		this.addWindow(this._statusSkillLearnedWindow);
		this.addWindow(this._statusAttributesListWindow);
		this.addWindow(this._statusAttributeDescriptionWindow);
		this.refreshActor();
		this._statusSkillsWindow.select(2);
	};
	
	Scene_Status.prototype.refreshActor = function() {
		var actor = this.actor();
		this._statusSkillsWindow.setActor(actor);
		this._statusAttributesListWindow.setActor(actor);
		var actions = actor.getAllSkillActionInfos().map(function (actionInfo) { return actionInfo.action; });
		var attributes = actor.getAttributes();
		this._statusSkillLearnedWindow.setOldActions(actions);
		this._statusSkillLearnedWindow.setOldAttributes(attributes);
	};
	
	Scene_Status.prototype.onActorChange = function() {
		this.refreshActor();
	};
	
	Scene_Status.prototype.onSkillCommand = function() {
		this._statusSkillsWindow.activate();
		this._statusSkillsWindow.show();
		this._statusCommandWindow.deactivate();
		this._statusCommandWindow.hide();
		this._statusSkillsWindow.select(2);
	};
	
	Scene_Status.prototype.onAttributesCommand = function() {
		this._statusCommandWindow.deactivate();
		this._statusCommandWindow.hide();
		this._statusAttributesListWindow.show();
		this._statusAttributesListWindow.activate();
		this._statusAttributesListWindow.select(0);
		this._statusAttributeDescriptionWindow.show();
	};
	
	Scene_Status.prototype.onSkillOk = function() {
		this._statusSkillsWindow.deactivate();
		this._statusSkillOptionWindow.show();
		this._statusSkillOptionWindow.activate();
	};
	
	Scene_Status.prototype.onSkillCancel = function() {
		this._statusSkillsWindow.deactivate();
		this._statusSkillsWindow.hide();
		this._statusCommandWindow.activate();
		this._statusCommandWindow.show();
	};
	
	Scene_Status.prototype.onSkillOption = function(option) {
		this._skillOption = option;
		this._statusSkillOptionWindow.deactivate();
		this._statusSkillConfirmWindow.show();
		this._statusSkillConfirmWindow.activate();
		this._statusSkillConfirmWindow.select(1);
	};
	
	Scene_Status.prototype.onSkillOptionCancel = function() {
		this._statusSkillsWindow.activate();
		this._statusSkillOptionWindow.hide();
		this._statusSkillOptionWindow.deactivate();
	};
	
	Scene_Status.prototype.onConfirmYes = function() {
		var actor = this.actor();
		var skill = this._statusSkillsWindow.currentSkill();
		var oldToughness = actor.toughness();
		var oldMaxMP = actor.maxMP();
		if(this._skillOption === "downgrade") {
			SoundManager.playSkillDowngradeSound();
			actor.adjustSkillXP(actor.skillDowngradeCost(skill));
			actor.adjustRespecXP(-actor.skillDowngradeCost(skill));
			actor.adjustSkillPoints(skill, -1);
		} else {
			SoundManager.playSkillUpgradeSound();
			actor.adjustSkillXP(-actor.skillUpgradeCost(skill));
			actor.adjustSkillPoints(skill, 1);
		}
		var newToughness = actor.toughness();
		var newMaxMP = actor.maxMP();
		if(newToughness > oldToughness) {
			actor.adjustDamage("core", (newToughness - oldToughness)*2);
			actor.adjustDamage("head", newToughness - oldToughness);
			actor.adjustDamage("torso", (newToughness - oldToughness)*2);
			actor.adjustDamage("leftArm", newToughness - oldToughness);
			actor.adjustDamage("rightArm", newToughness - oldToughness);
			actor.adjustDamage("leftLeg", newToughness - oldToughness);
			actor.adjustDamage("rightLeg", newToughness - oldToughness);
		}
		if(newMaxMP > oldMaxMP) {
			actor.adjustMPSpent(newMaxMP - oldMaxMP);
		}
		this._statusSkillsWindow.refresh();
		this._statusAttributesListWindow.refresh();
		this._statusSkillConfirmWindow.hide();
		this._statusSkillConfirmWindow.deactivate();
		this._statusSkillOptionWindow.hide();
		this._statusSkillOptionWindow.deactivate();
		var actions = actor.getAllSkillActionInfos().map(function (actionInfo) { return actionInfo.action; });
		var attributes = actor.getAttributes();
		this._statusSkillLearnedWindow.setNewActions(actions);
		this._statusSkillLearnedWindow.setNewAttributes(attributes);
		if(this._statusSkillLearnedWindow.isChangeInActions() || this._statusSkillLearnedWindow.isChangeInAttributes()) {
			this._statusSkillLearnedWindow.refresh();
			this._statusSkillLearnedWindow.show();
			this._statusSkillLearnedWindow.activate();
		} else {
			this._statusSkillLearnedWindow.setOldActions(actions);
			this._statusSkillLearnedWindow.setOldAttributes(attributes);
			this._statusSkillsWindow.activate();
		}
	};
	
	Scene_Status.prototype.onConfirmCancel = function() {
		this._statusSkillOptionWindow.activate();
		this._statusSkillConfirmWindow.hide();
		this._statusSkillConfirmWindow.deactivate();
	};
	
	Scene_Status.prototype.onLearnedInput = function() {
		var actor = this.actor();
		var actions = actor.getAllSkillActionInfos().map(function (actionInfo) { return actionInfo.action; });
		var attributes = actor.getAttributes();
		this._statusSkillLearnedWindow.hide();
		this._statusSkillLearnedWindow.deactivate();
		this._statusSkillLearnedWindow.setOldActions(actions);
		this._statusSkillLearnedWindow.setOldAttributes(attributes);
		this._statusSkillsWindow.activate();
	};
	
	Scene_Status.prototype.onAttributesOk = function() {
		
	};
	
	Scene_Status.prototype.onAttributesCancel = function() {
		this._statusCommandWindow.activate();
		this._statusCommandWindow.show();
		this._statusAttributesListWindow.hide();
		this._statusAttributesListWindow.deactivate();
		this._statusAttributeDescriptionWindow.hide();
	};
	
	// file
	Scene_File.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		DataManager.loadAllSavefileImages();
		this.createListWindow();
		this.createHelpWindow();
	};

	Scene_File.prototype.createListWindow = function() {
		var x = 0;
		var y = Window_Base.prototype.bigNesTileSize();
		this._listWindow = new Window_SavefileList(x, y);
		this._listWindow.setHandler('ok',     this.onSavefileOk.bind(this));
		this._listWindow.setHandler('cancel', this.popScene.bind(this));
		this._listWindow.select(this.firstSavefileIndex());
		this._listWindow.setTopRow(this.firstSavefileIndex() - 2);
		this._listWindow.setMode(this.mode());
		this._listWindow.refresh();
		this.addWindow(this._listWindow);
	};
	
	Scene_File.prototype.createHelpWindow = function() {
		this._helpWindow = new Window_Help(1);
		this._helpWindow.setText(this.helpWindowText());
		this.addWindow(this._helpWindow);
	};
	
	// name
	Scene_Name.prototype.onInputOk = function() {
		this._actor.setName(this._editWindow.name());
		this._actor.setNickname(this._editWindow.name());
		this.popScene();
	};
})();
 