//=============================================================================
// TurnBasedStrategySprites.js
//=============================================================================

/*:
 *
 * @plugindesc Sprite objects for a turn based strategy game
 *
 * @author Darlos9D
 *
 * @help
 *
 * This plugin does not provide any commands.
 *
 */
 
//-----------------------------------------------------------------------------
// Sprite_TbsRange
//
// The sprite for showing the tiles a character can move to, or their actions
// can reach.

function Sprite_TbsRange() {
    this.initialize.apply(this, arguments);
}

Sprite_TbsRange.prototype = Object.create(Sprite.prototype);
Sprite_TbsRange.prototype.constructor = Sprite_TbsRange;

Sprite_TbsRange.prototype.initialize = function(x, y, color) {
    Sprite.prototype.initialize.call(this);
	this._color = color;
	this._mapX = x;
	this._mapY = y;
    this.createBitmap();
    this._frameCount = 0;
	this.z = 2;
	this.opacity = 127;
    this.visible = true;
};

Sprite_TbsRange.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updatePosition();
    this.updateAnimation();
};

Sprite_TbsRange.prototype.createBitmap = function() {
    var tileWidth = $gameMap.tileWidth();
    var tileHeight = $gameMap.tileHeight();
    this.bitmap = new Bitmap(tileWidth, tileHeight);
    this.bitmap.fillAll(this._color);
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.blendMode = Graphics.BLEND_NORMAL;
    this.updatePosition();
};

Sprite_TbsRange.prototype.updatePosition = function() {
    var tileWidth = $gameMap.tileWidth();
    var tileHeight = $gameMap.tileHeight();
    var x = this._mapX;
    var y = this._mapY;
    this.x = ($gameMap.adjustX(x) + 0.5) * tileWidth;
    this.y = ($gameMap.adjustY(y) + 0.5) * tileHeight;
};

Sprite_TbsRange.prototype.updateAnimation = function() {
	var changeFrames = 20;
    this._frameCount++;
    this._frameCount %= (changeFrames * 2);
	
	var brightness = 0;
	if(this._frameCount <= 20) {
		brightness = (changeFrames - this._frameCount) / changeFrames;
	} else {
		brightness = (this._frameCount - changeFrames) / changeFrames;
	}
	var colorPart = Math.round(brightness * 255).toString(16);
	if(colorPart.length === 1) { colorPart = "0" + colorPart; }
	var color = "#" + colorPart + colorPart + colorPart;
	if(this._color === 'red') {
		var color = "#" + colorPart + "0000";
	} else if(this._color === 'yellow') {
		var color = '#' + colorPart + colorPart + "00";
	}
    this.bitmap.fillAll(color);
};

//-----------------------------------------------------------------------------
// Sprite_TbsBodyPartDamage
//
// The sprite for showing the damage of a battler's body part

function Sprite_TbsBodyPartDamage() {
    this.initialize.apply(this, arguments);
}

Sprite_TbsBodyPartDamage.prototype = Object.create(Sprite.prototype);
Sprite_TbsBodyPartDamage.prototype.constructor = Sprite_TbsRange;

Sprite_TbsBodyPartDamage.prototype.initialize = function(x, y, position, damage) {
    Sprite.prototype.initialize.call(this);
	this._position = position;
	this._damage = damage;
	this._mapX = x;
	this._mapY = y;
    this.createDamageBitmap();
	this.z = 9;
	this.opacity = 255;
    this.visible = true;
};

Sprite_TbsBodyPartDamage.prototype.update = function() {
    Sprite.prototype.update.call(this);
	this.updatePosition();
};

Sprite_TbsBodyPartDamage.prototype.createDamageBitmap = function() {
    var spriteWidth = $gameMap.tileWidth() * 0.375;
    var spriteHeight = $gameMap.tileHeight() * 0.375;
    this.bitmap = new Bitmap(spriteWidth, spriteHeight);
	var color = 'green';
	if(this._damage === 1) {
		color = 'yellow';
	} else if (this._damage >= 2) {
		color = 'red';
	}
    this.bitmap.fillAll(color);
	var borderThickness = 3;
	this.bitmap.fillRect(0, 0, borderThickness, spriteHeight, 'black');
	this.bitmap.fillRect(0, 0, spriteWidth, borderThickness, 'black');
	this.bitmap.fillRect(spriteWidth - borderThickness, 0, borderThickness, spriteHeight, 'black');
	this.bitmap.fillRect(0, spriteHeight - borderThickness, spriteWidth, borderThickness, 'black');
	var innerBorderThickness = 1;
	this.bitmap.fillRect(1, 1, innerBorderThickness, spriteHeight-2, 'white');
	this.bitmap.fillRect(1, 1, spriteWidth-2, innerBorderThickness, 'white');
	this.bitmap.fillRect(spriteWidth - innerBorderThickness-1, 1, innerBorderThickness, spriteHeight-2, 'white');
	this.bitmap.fillRect(1, spriteHeight - innerBorderThickness-1, spriteWidth-2, innerBorderThickness, 'white');
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.blendMode = Graphics.BLEND_NORMAL;
	this.updatePosition();
};

Sprite_TbsBodyPartDamage.prototype.updatePosition = function() {
	var tileWidth = $gameMap.tileWidth();
    var tileHeight = $gameMap.tileHeight();
    var x = this._mapX;
    var y = this._mapY;
	if(this._position === 'upperLeft' || this._position === 'lowerLeft') {
		this.x = ($gameMap.adjustX(x) + 0.8125) * tileWidth;
	} else {
		this.x = ($gameMap.adjustX(x) + 0.1875) * tileWidth;
	}
	if(this._position === 'upperLeft' || this._position === 'upperRight') {
		this.y = ($gameMap.adjustY(y) + 0.8125) * tileHeight - 6;
	} else {
		this.y = ($gameMap.adjustY(y) + 0.1875) * tileHeight - 6;
	}
};

(function() {
	//sprite base
	Sprite_Base.prototype.initialize = function() {
		Sprite.prototype.initialize.call(this);
		this._animationSprites = [];
		this._ongoingAnimationSprites = [];
		this._effectTarget = this;
		this._hiding = false;
	};
	
	Sprite_Base.prototype.startOngoingAnimation = function(animation, mirror, delay) {
		var sprite = new Sprite_Animation();
		sprite.setup(this._effectTarget, animation, mirror, delay);
		this.parent.addChild(sprite);
		this._ongoingAnimationSprites.push(sprite);
		return sprite;
	};
	
	Sprite_Base.prototype.stopOngoingAnimations = function() {
		var sprites = this._ongoingAnimationSprites.clone();
		this._ongoingAnimationSprites = [];
		sprites.forEach(function (sprite) {
			sprite.stop();
			sprite.remove();
		});
	};
	
	Sprite_Base.prototype.updateAnimationSprites = function() {
		if (this._animationSprites.length > 0) {
			var sprites = this._animationSprites.clone();
			this._animationSprites = [];
			for (var i = 0; i < sprites.length; i++) {
				var sprite = sprites[i];
				if (sprite.isPlaying()) {
					this._animationSprites.push(sprite);
				} else {
					sprite.remove();
				}
			}
		}
		if (this._ongoingAnimationSprites.length > 0) {
			var sprites = this._ongoingAnimationSprites.clone();
			this._ongoingAnimationSprites = [];
			for (var i = 0; i < sprites.length; i++) {
				var sprite = sprites[i];
				if (sprite.isPlaying()) {
					this._ongoingAnimationSprites.push(sprite);
				} else {
					sprite.remove();
				}
			}
		}
	};
	
	Sprite_Base.prototype.startAnimation = function(animation, mirror, delay, variance) {
		var sprite = new Sprite_Animation();
		var varianceX = 0;
		var varianceY = 0;
		if(variance !== undefined) {
			var angle = Math.random() * Math.PI;
			varianceX = Math.cos(angle) * Math.floor(variance*10);
			varianceY = Math.sin(angle) * Math.floor(variance*10);
		}
		sprite.setup(this._effectTarget, animation, mirror, delay, varianceX, varianceY);
		this.parent.addChild(sprite);
		this._animationSprites.push(sprite);
	};
	
	//sprite battler
	Sprite_Battler.prototype.setupAnimation = function() {
		if(this._battler.isOngoingAnimationEndRequested()) {
			this.stopOngoingAnimations();
		}
		this._battler.updateCurrentlyOngoingAnims();
		while (this._battler.isAnimationRequested()) {
			var data = this._battler.shiftAnimation();
			var animation = $dataAnimations[data.animationId];
			var mirror = data.mirror;
			var delay = animation.position === 3 ? 0 : data.delay;
			this.startAnimation(animation, mirror, delay, data.variance);
			for (var i = 0; i < this._animationSprites.length; i++) {
				var sprite = this._animationSprites[i];
				sprite.visible = this._battler.isSpriteVisible();
			}
		}
		while (this._battler.isOngoingAnimationRequested()) {
			var data = this._battler.shiftOngoingAnimation();
			var animation = $dataAnimations[data.animationId];
			var mirror = data.mirror;
			var delay = animation.position === 3 ? 0 : data.delay;
			var sprite = this.startOngoingAnimation(animation, mirror, delay);
			for (var i = 0; i < this._ongoingAnimationSprites.length; i++) {
				var sprite = this._ongoingAnimationSprites[i];
				sprite.visible = this._battler.isSpriteVisible();
			}
			var currentlyOngoingAnim = {};
			currentlyOngoingAnim.data = data;
			currentlyOngoingAnim.time = animation.frames.length * sprite.getRate();
			this._battler.addCurrentlyOngoingAnim(currentlyOngoingAnim);
		}
		var ongoingAnimations = this._battler.ongoingAnimationsToReplay();
		var that = this;
		ongoingAnimations.forEach(function (anim) {
			var data = anim.data;
			var animation = $dataAnimations[data.animationId];
			var mirror = data.mirror;
			var delay = animation.position === 3 ? 0 : data.delay;
			var sprite = that.startOngoingAnimation(animation, mirror, delay);
			for (var i = 0; i < that._ongoingAnimationSprites.length; i++) {
				var sprite = that._ongoingAnimationSprites[i];
				sprite.visible = that._battler.isSpriteVisible();
			}
			anim.time = animation.frames.length * sprite.getRate();
			that._battler.addCurrentlyOngoingAnim(anim);
		});
	};
	
	Sprite_Battler.prototype.setupDamagePopup = function() {
		if (this._battler.isDamagePopupRequested()) {
			var results = this._battler.getTbsResults();
			var totalStress = results.stress.head + results.stress.torso + results.stress.leftArm
				+ results.stress.rightArm + results.stress.leftLeg + results.stress.rightLeg
				+ results.stress.leftHeld + results.stress.rightHeld + results.stress.other - results.heal.stress;
			this.setupSingleDamagePopup(totalStress != 0, totalStress, "stress", false, 90, -60);
			if(results.dodged) {
				this.setupSingleDamagePopup(false, 0, "dodged");
			} else {
				var totalDamage = Math.floor(results.damage.head*2
					+ results.damage.torso
					+ results.damage.leftArm*0.5
					+ results.damage.rightArm*0.5
					+ results.damage.leftLeg*0.5
					+ results.damage.rightLeg*0.5);
				var crit = results.critical.mind || results.critical.torso || results.critical.mind ||
					results.critical.leftArm || results.critical.rightArm ||
					results.critical.leftLeg || results.critical.rightLeg;
				var resultsType = "physicalDamage";
				if(
					(results.hit.leftHeld || results.hit.rightHeld) &&
					!results.hit.mind && !results.hit.head && !results.hit.torso &&
					!results.hit.leftArm && !results.hit.rightArm &&
					!results.hit.leftLeg && !results.hit.rightLeg
				) {
					resultsType = "blocked";
				}
				this.setupSingleDamagePopup(true, totalDamage - results.heal.core, resultsType, crit);
				
				// var leftArmHit = results.hit.leftArm;
				// var leftArmDamage = results.damage.leftArm - results.heal.leftArm;
				// var leftArmCrit = results.critical.leftArm;
				// var leftArmResultsType = "physicalDamage";
				// if(!results.hit.leftArm && results.hit.leftHeld) {
					// leftArmHit = true;
					// leftArmDamage = 0;
					// leftArmCrit = false;
					// leftArmResultsType = "blocked";
				// }
				// this.setupSingleDamagePopup(leftArmHit, leftArmDamage, leftArmResultsType, leftArmCrit, -90);
					
				// var rightArmHit = results.hit.rightArm;
				// var rightArmDamage = results.damage.rightArm - results.heal.rightArm;
				// var rightArmCrit = results.critical.rightArm;
				// var rightArmResultsType = "physicalDamage";
				// if(!results.hit.rightArm && results.hit.rightHeld) {
					// rightArmHit = true;
					// rightArmDamage = 0;
					// rightArmCrit = false;
					// rightArmResultsType = "blocked";
				// }
				// this.setupSingleDamagePopup(rightArmHit, rightArmDamage, rightArmResultsType, rightArmCrit, 90);
				
				// this.setupSingleDamagePopup(results.hit.head, results.damage.head - results.heal.head,
					// "physicalDamage", results.critical.head, 0, -60);
				// this.setupSingleDamagePopup(results.hit.torso, results.damage.torso - results.heal.torso,
					// "physicalDamage");
				// this.setupSingleDamagePopup(results.hit.leftLeg, results.damage.leftLeg - results.heal.leftLeg,
					// "physicalDamage", results.critical.leftLeg, -45, 60);
				// this.setupSingleDamagePopup(results.hit.rightLeg, results.damage.rightLeg - results.heal.rightLeg,
					// "physicalDamage", results.critical.rightLeg, 45, 60);
				// this.setupSingleDamagePopup(results.hit.mind, results.damage.mind - results.heal.mind,
					// "mentalDamage", results.critical.mind, -90, -60);
				// this.setupSingleDamagePopup(totalStress != 0, totalStress, "stress", false, 90, -60);
			}
			this._battler.clearDamagePopup();
			this._battler.clearResult();
			this._battler.clearTbsResults();
		}
	};
	
	Sprite_Battler.prototype.setupSingleDamagePopup = function(hit, numValue, resultType, critical, xOffset, yOffset) {
		if(!hit && resultType !== "dodged") { return; }
		var sprite = new Sprite_Damage();
		sprite.x = this.x + this.damageOffsetX() + (xOffset === undefined ? 0 : xOffset);
		sprite.y = this.y + this.damageOffsetY() + (yOffset === undefined ? 0 : yOffset);
		sprite.setupManual(numValue, resultType, critical);
		this._damages.push(sprite);
		this.parent.addChild(sprite);
	};
	
	//sprite actor
	Sprite_Actor.prototype.initMembers = function() {
		Sprite_Battler.prototype.initMembers.call(this);
		this._battlerName = '';
		this._motion = null;
		this._motionCount = 0;
		this._pattern = 0;
		this._motionSpeed = [];
		this.createShadowSprite();
		this.createWeaponSprite();
		this.createMainSprite();
		this.createStateSprite();
	};

	Sprite_Actor.prototype.setBattler = function(battler) {
		Sprite_Battler.prototype.setBattler.call(this, battler);
		var changed = (battler !== this._actor);
		if (changed) {
			this._actor = battler;
			var entryMotion = true;
			if (battler) {
				this.setHome(battler.screenX(), battler.screenY());
				entryMotion = battler.shouldMoveIn();
			}
			if(entryMotion) {
				this.startEntryMotion();
			} else {
				this.startMove(0, 0, 0);
			}
			this._stateSprite.setup(battler);
		}
	};
	
	Sprite_Actor.prototype.setupMotion = function() {
		if (this._actor.isMotionRequested()) {
			this.startMotion(this._actor.motionType(), this._actor.motionSpeed());
			this._actor.clearMotion();
		}
	};
	
	Sprite_Actor.prototype.setupWeaponAnimation = function() {
		if (this._actor.isWeaponAnimationRequested()) {
			this._weaponSprite.setup(this._actor.weaponImageId(), this._actor.animationWait());
			this._actor.clearWeaponAnimation();
		}
	};
	
	Sprite_Actor.prototype.startMotion = function(motionType, motionSpeed) {
		var newMotion = Sprite_Actor.MOTIONS[motionType];
		//if (this._motion !== newMotion) {
			this._motion = newMotion;
			this._motionCount = 0;
			this._pattern = 0;
			this._motionSpeed = motionSpeed ? motionSpeed : [];
		//}
	};

	Sprite_Actor.prototype.motionSpeed = function() {
		var motionSpeed = this._motionSpeed[this._pattern];
		return motionSpeed === undefined ? 12 : motionSpeed;
	};
	
	//sprite weapon
	Sprite_Weapon.prototype.initMembers = function() {
		this._weaponImageId = 0;
		this._animationCount = 0;
		this._pattern = 0;
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		this.x = -16;
		this._animationWait = [];
	};

	Sprite_Weapon.prototype.setup = function(weaponImageId, animationWait) {
		this._weaponImageId = weaponImageId;
		this._animationCount = 0;
		this._pattern = 0;
		this._animationWait = animationWait ? animationWait : [];
		this.loadBitmap();
		this.updateFrame();
	};
	
	Sprite_Weapon.prototype.animationWait = function() {
		var animationWait = this._animationWait[this._pattern];
		return animationWait === undefined ? 12 : animationWait;
	};
	
	//sprite enemy
	Sprite_Enemy.prototype.setBattler = function(battler) {
		Sprite_Battler.prototype.setBattler.call(this, battler);
		this._enemy = battler;
		this.setHome(battler.screenX(), battler.screenY());
		this._stateIconSprite.setup(battler);
	};
	
	Sprite_Enemy.prototype.updateFrame = function() {
		Sprite_Battler.prototype.updateFrame.call(this);
		var frameHeight = this.bitmap ? this.bitmap.height : 0;
		if (this._effectType === 'bossCollapse') {
			frameHeight = this._effectDuration;
		}
		this.setFrame(0, 0, this.bitmap ? this.bitmap.width : 0, frameHeight);
	};
	
	Sprite_Enemy.prototype.updateStateSprite = function() {
		this._stateIconSprite.y = -Math.round(((this.bitmap ? this.bitmap.height : 0) + 40) * 0.9);
		if (this._stateIconSprite.y < 20 - this.y) {
			this._stateIconSprite.y = 20 - this.y;
		}
	};
	
	//sprite animation
	Sprite_Animation.prototype.initMembers = function() {
		this._target = null;
		this._animation = null;
		this._mirror = false;
		this._delay = 0;
		this._rate = 4;
		this._duration = 0;
		this._flashColor = [0, 0, 0, 0];
		this._flashDuration = 0;
		this._screenFlashDuration = 0;
		this._hidingDuration = 0;
		this._bitmap1 = null;
		this._bitmap2 = null;
		this._cellSprites = [];
		this._screenFlashSprite = null;
		this._duplicated = false;
		this._varianceX = 0;
		this._varianceY = 0;
		this.z = 8;
	};

	Sprite_Animation.prototype.setup = function(target, animation, mirror, delay, varianceX, varianceY) {
		this._target = target;
		this._animation = animation;
		this._mirror = mirror;
		this._delay = delay;
		this._varianceX = varianceX === undefined ? 0 : varianceX;
		this._varianceY = varianceY === undefined ? 0 : varianceY;
		if (this._animation) {
			this.remove();
			this.setupRate();
			this.setupDuration();
			this.loadBitmaps();
			this.createSprites();
		}
	};
	
	Sprite_Animation.prototype.getRate = function() {
		return this._rate;
	};
	
	Sprite_Animation.prototype.stop = function() {
		this._duration = 0;
	};
	
	Sprite_Animation.prototype.updatePosition = function() {
		if (this._animation.position === 3) {
			this.x = this.parent.width / 2;
			this.y = this.parent.height / 2;
		} else {
			var parent = this._target.parent;
			var grandparent = parent ? parent.parent : null;
			this.x = this._target.x;
			this.y = this._target.y;
			if (this.parent === grandparent) {
				this.x += parent.x;
				this.y += parent.y;
			}
			if (this._animation.position === 0) {
				this.y -= this._target.height;
			} else if (this._animation.position === 1) {
				this.y -= this._target.height / 2;
			}
		}
		this.x += this._varianceX;
		this.y += this._varianceY;
	};
	
	//sprite damage
	Sprite_Damage.prototype.setupManual = function(numValue, resultType, critical) {
		if (resultType === "dodged") {
			this.createMiss();
		} else if (resultType === "blocked") {
			this.createBlock();
		} else if (resultType === "physicalDamage") {
			this.createDigits(0, numValue);
		} else if (resultType === "mentalDamage") {
			this.createDigits(5, numValue);
		} else if (resultType === "stress") {
			this.createDigits(2, numValue);
		}
		if (critical) {
			this.setupCriticalEffect();
		}
	};
	
	Sprite_Damage.prototype.createBlock = function() {
		var w = this.digitWidth();
		var h = this.digitHeight();
		var sprite = this.createChildSprite();
		sprite.setFrame(4 * w, 4 * h, 5 * w, h);
		sprite.dy = 0;
	};
	
	Sprite_Damage.prototype.digitHeight = function() {
		return this._damageBitmap ? this._damageBitmap.height / 7 : 0;
	};
	
	//sprite state icon
	Sprite_StateIcon.prototype.updateIcon = function() {
		var icons = [];
		if (this._battler && !this._battler.isDown()) {
			icons = this._battler.allIcons();
		}
		if (icons.length > 0) {
			this._animationIndex++;
			if (this._animationIndex >= icons.length) {
				this._animationIndex = 0;
			}
			this._iconIndex = icons[this._animationIndex];
		} else {
			this._animationIndex = 0;
			this._iconIndex = 0;
		}
	};
	
	//spriteset map
	Spriteset_Map.prototype.initialize = function() {
		Spriteset_Base.prototype.initialize.call(this);
		if(!this._tbsCharacterSprites) {
			this._tbsCharacterSprites = [];
		}
		this._rangeTileSprites = [];
		this._bodyPartDamageSprites = [];
		this._tbsAoeSprites = [];
	};
	
	Spriteset_Map.prototype.createCharacters = function() {
		this._characterSprites = [];
		this._tbsCharacterSprites = [];
		$gameMap.events().forEach(function(event) {
			this._characterSprites.push(new Sprite_Character(event));
		}, this);
		$gameMap.vehicles().forEach(function(vehicle) {
			this._characterSprites.push(new Sprite_Character(vehicle));
		}, this);
		$gamePlayer.followers().reverseEach(function(follower) {
			this._characterSprites.push(new Sprite_Character(follower));
		}, this);
		var that = this;
		this._characterSprites.push(new Sprite_Character($gamePlayer));
		$gameMap.tbsForces().forEach(function (force) {
			force.actors.forEach(function (actor) {
				if(actor.chara) {
					var sprite = new Sprite_Character(actor.chara);
					that._characterSprites.push(sprite);
					that._tbsCharacterSprites.push(sprite);
				}
			});
		});
		for (var i = 0; i < this._characterSprites.length; i++) {
			this._tilemap.addChild(this._characterSprites[i]);
		}
	};
	
	Spriteset_Map.prototype.updateTilemap = function() {
		if($gameTemp.shouldClearTbsCharacters()) {
			$gameTemp.setShouldClearTbsCharacters(false);
			this.clearTbsCharacters();
		}
		var charasToAdd = $gameTemp.tbsCharactersToAdd();
		var that = this;
		charasToAdd.forEach(function (chara) {
			var sprite = new Sprite_Character(chara);
			that._characterSprites.push(sprite);
			that._tbsCharacterSprites.push(sprite);
			that._tilemap.addChild(sprite);
		});
		$gameTemp.clearTbsCharactersToAdd();
		
		if($gameTemp.shouldClearTbsAoeSprites()) {
			$gameTemp.setShouldClearTbsAoeSprites(false);
			this.clearTbsAoeSprites();
		}
		var aoeSpritesToAdd = $gameTemp.tbsAoeSpritesToAdd();
		aoeSpritesToAdd.forEach(function (aoeSprite) {
			var sprite = new Sprite_Character(aoeSprite);
			that._characterSprites.push(sprite);
			that._tbsAoeSprites.push(sprite);
			that._tilemap.addChild(sprite);
		});
		$gameTemp.clearTbsAoeSpritesToAdd();
		
		if($gameTemp.shouldClearTbsRangeTiles()) {
			$gameTemp.setShouldClearTbsRangeTiles(false);
			this.clearTbsRangeTiles();
			$gameTemp.setRangedSpritesExist(false);
		}
		var rangeTilesToAdd = $gameTemp.tbsRangeTilesToAdd();
		rangeTilesToAdd.forEach(function (tile) {
			var sprite = new Sprite_TbsRange(tile.x, tile.y, tile.color);
			that._rangeTileSprites.push(sprite);
			that._tilemap.addChild(sprite);
		});
		if(rangeTilesToAdd.length > 0) {
			$gameTemp.setRangedSpritesExist(true);
		}
		$gameTemp.clearTbsRangeTilesToAdd();
		
		if($gameTemp.shouldClearTbsDamageSprites()) {
			$gameTemp.setShouldClearTbsDamageSprites(false);
			this.clearTbsDamageSprites();
			$gameTemp.setDamageSpritesExist(false);
		}
		var damageSpritesToAdd = $gameTemp.tbsDamageSpritesToAdd();
		damageSpritesToAdd.forEach(function (spriteToAdd) {
			var sprite = new Sprite_TbsBodyPartDamage(spriteToAdd.x, spriteToAdd.y, spriteToAdd.position, spriteToAdd.damage);
			that._bodyPartDamageSprites.push(sprite);
			that._tilemap.addChild(sprite);
		});
		if(damageSpritesToAdd.length > 0) {
			$gameTemp.setDamageSpritesExist(true);
		}
		$gameTemp.clearTbsDamageSpritesToAdd();
		
		this._tilemap.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
		this._tilemap.origin.y = $gameMap.displayY() * $gameMap.tileHeight();
	};
	
	Spriteset_Map.prototype.clearTbsCharacters = function() {
		var that = this;
		this._tbsCharacterSprites.forEach(function (sprite) {
			that._tilemap.removeChild(sprite);
		});
		this._tbsCharacterSprites = [];
	};
	
	Spriteset_Map.prototype.clearTbsAoeSprites = function() {
		var that = this;
		this._tbsAoeSprites.forEach(function (sprite) {
			that._tilemap.removeChild(sprite);
		});
		this._tbsAoeSprites = [];
	};
	
	Spriteset_Map.prototype.clearTbsRangeTiles = function() {
		var that = this;
		this._rangeTileSprites.forEach(function (tile) {
			that._tilemap.removeChild(tile);
		});
		this._rangeTileSprites = [];
	};
	
	Spriteset_Map.prototype.clearTbsDamageSprites = function() {
		var that = this;
		this._bodyPartDamageSprites.forEach(function (sprite) {
			that._tilemap.removeChild(sprite);
		});
		this._bodyPartDamageSprites = [];
	};
	
	//spriteset battle
	Spriteset_Battle.prototype.createLowerLayer = function() {
		Spriteset_Base.prototype.createLowerLayer.call(this);
		this.createBackground();
		this.createBattleField();
		this.createBattleback();
		this.createEnemies();
		this.createActors();
	};
	
	Spriteset_Battle.prototype.createEnemies = function() {
		var centerY = Graphics.boxHeight * 0.5;
		var scaleFactor = 0.5;
		var enemies = [];
		var tbsActors = [];
		tbsActors.push($gameMap.getTbsSelectedActor());
		var tbsTargets = $gameMap.getTbsActionTargets();
		tbsActors.forEach(function (tbsActor) {
			if(!tbsActor.isParty) {
				enemies.push(tbsActor.battler);
			}
		});
		tbsTargets.forEach(function (tbsTarget) {
			if(!tbsTarget.isParty && tbsActors.indexOf(tbsTarget) === -1) {
				enemies.push(tbsTarget.battler);
			}
		});
		var sprites = [];
		for (var i = 0; i < enemies.length; i++) {
			sprites[i] = new Sprite_Enemy(enemies[i]);
			var scale = (((sprites[i].y / centerY) - 1) * scaleFactor) + 1;
			sprites[i].scale.x = scale;
			sprites[i].scale.y = scale;
		}
		sprites.sort(this.compareEnemySprite.bind(this));
		for (var j = 0; j < sprites.length; j++) {
			this._battleField.addChild(sprites[j]);
		}
		this._enemySprites = sprites;
	};

	Spriteset_Battle.prototype.compareEnemySprite = function(a, b) {
		if (a.y !== b.y) {
			return a.y - b.y;
		} else {
			return b.spriteId - a.spriteId;
		}
	};

	Spriteset_Battle.prototype.createActors = function() {
		var centerY = Graphics.boxHeight * 0.5;
		var scaleFactor = 0.5;
		var actors = [];
		var tbsActors = [];
		tbsActors.push($gameMap.getTbsSelectedActor());
		var tbsTargets = $gameMap.getTbsActionTargets();
		tbsActors.forEach(function (tbsActor) {
			if(tbsActor.isParty) {
				actors.push(tbsActor.battler);
			}
		});
		tbsTargets.forEach(function (tbsTarget) {
			if(tbsTarget.isParty && tbsActors.indexOf(tbsTarget) === -1) {
				actors.push(tbsTarget.battler);
			}
		});
		var sprites = [];
		for (var i = 0; i < actors.length; i++) {
			sprites[i] = new Sprite_Actor();
			sprites[i].setBattler(actors[i]);
			var scale = (((sprites[i].y / centerY) - 1) * scaleFactor) + 1;
			sprites[i].scale.x = scale;
			sprites[i].scale.y = scale;
		}
		sprites.sort(this.compareEnemySprite.bind(this));
		for (var i = 0; i < sprites.length; i++) {
			this._battleField.addChild(sprites[i]);
		}
		this._actorSprites = sprites;
	};

	Spriteset_Battle.prototype.updateActors = function() {
		//var members = $gameParty.battleMembers();
		//for (var i = 0; i < this._actorSprites.length; i++) {
		//	this._actorSprites[i].setBattler(members[i]);
		//}
	};
	
	Spriteset_Battle.prototype.isBusy = function() {
		return false; //this.isAnimationPlaying() || this.isAnyoneMoving();
	};
})();
