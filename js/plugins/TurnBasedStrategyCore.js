//=============================================================================
// TurnBasedStrategyCore.js
//=============================================================================

/*:
 *
 * @plugindesc Core changes for a turn based strategy game
 *
 * @author Darlos9D
 *
 * @help
 *
 * This plugin does not provide any commands.
 *
 */
 
//bitmap
Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
    if (text !== undefined && lineHeight >= this.standardCharacterHeight()) {
        var tx = x;
        var ty = Math.floor((y + (lineHeight-this.standardCharacterHeight())/2) / this.standardPixelSize()) * this.standardPixelSize();
        var context = this._context;
        var alpha = context.globalAlpha;
        maxWidth = maxWidth || Graphics.boxWidth - x;
        context.save();
        this._drawTextBody(text, tx, ty, maxWidth, align);
        context.restore();
        this._setDirty();
    }
};

Bitmap.prototype._drawTextBody = function(text, tx, ty, maxWidth, align) {
    var context = this._context;
	var alpha = context.globalAlpha;
	context.globalAlpha = 1;
    context.imageSmoothingEnabled = false;
	var colorIndex = 0;
	if(alpha == 1) {
		switch(this.textColor) {
		case '#797979':
			colorIndex = 1;
			break;
		case '#000000':
			colorIndex = 2;
			break;
		case '#db4161':
			colorIndex = 3;
			break;
		case '#ff7930':
			colorIndex = 4;
			break;
		case '#edb320':
			colorIndex = 5;
			break;
		case '#49aa10':
			colorIndex = 6;
			break;
		case '#4141ff':
			colorIndex = 7;
			break;
		case '#db41c3':
			colorIndex = 8;
			break;
		}
	} else {
		colorIndex = 1;
	}
	var actualText = text+"";
	var txAligned = tx;
	if(align === 'right') {
		txAligned += maxWidth - this.standardCharacterWidth() * actualText.length;
	} else if(align === 'center') {
		txAligned += Math.floor((maxWidth / 2 - this.standardCharacterWidth() * (actualText.length / 2))/this.standardPixelSize()) * this.standardPixelSize();
	}
	for(let i = 0; i < actualText.length; i++) {
		var curX = txAligned + i * this.standardCharacterWidth();
		if(curX < tx) { continue; }
		if(curX + this.standardCharacterWidth() > tx + maxWidth) { break; }
		this._drawCharacter(actualText[i], colorIndex, txAligned + i * this.standardCharacterWidth(), ty);
	}
	context.globalAlpha = alpha;
};

Bitmap.prototype._drawCharacter = function(character, colorIndex, x, y) {
    var bitmap = ImageManager.loadSystem('TextFont');
    var pw = this.standardCharacterWidth();
    var ph = this.standardCharacterHeight();
    var sx = pw * (character.charCodeAt(0)-33);
    var sy = ph * colorIndex;
    this.blt(bitmap, sx, sy, pw, ph, x, y);
};

Bitmap.prototype.measureTextWidth = function(text) {
    return text.length*this.standardCharacterWidth();
};

Bitmap.prototype.standardPixelSize = function() {
	return 3;
};

Bitmap.prototype.standardFontSize = function() {
    return 28;
};

Bitmap.prototype.standardCharacterHeight = function() {
	return 8*this.standardPixelSize();
};

Bitmap.prototype.standardCharacterWidth = function() {
	return 6*this.standardPixelSize();
};

//touch input
TouchInput.isPressed = function() {
    return false;
};

TouchInput.isTriggered = function() {
    return false;
};

TouchInput.isCancelled = function() {
    return false;
};

TouchInput.isMoved = function() {
    return false;
};

TouchInput.isReleased = function() {
    return false;
};

//window
/**
 * @method _refreshCursor
 * @private
 */
Window.prototype._refreshCursor = function() {
    var pad = this._padding;
    var x = this._cursorRect.x + pad - this.origin.x;
    var y = this._cursorRect.y + pad - this.origin.y;
    var w = this._cursorRect.width;
    var h = this._cursorRect.height;
    var x2 = Math.max(x, pad);
    var y2 = Math.max(y, pad);
    var ox = x - x2;
    var oy = y - y2;
    var w2 = Math.min(w, this._width - pad - x2);
    var h2 = Math.min(h, this._height - pad - y2);
    var bitmap = new Bitmap(w2, h2);

    this._windowCursorSprite.bitmap = bitmap;
    this._windowCursorSprite.setFrame(0, 0, w2, h2);
    this._windowCursorSprite.move(x2, y2);

    if (w > 0 && h > 0 && this._windowskin) {
        var skin = this._windowskin;
        var p = 96;
		var q = 48;
        var r = 5*bitmap.standardPixelSize();
        bitmap.blt(skin, p, p, r, r, ox, oy);
        bitmap.blt(skin, p+q-r, p, r, r, ox+w-r, oy);
        bitmap.blt(skin, p, p+q-r, r, r, ox, oy+h-r);
        bitmap.blt(skin, p+q-r, p+q-r, r, r, ox+w-r, oy+h-r);
    }
};

/**
 * @method _updateCursor
 * @private
 */
Window.prototype._updateCursor = function() {
    this._windowCursorSprite.alpha = 1;
    this._windowCursorSprite.visible = this.isOpen();
};