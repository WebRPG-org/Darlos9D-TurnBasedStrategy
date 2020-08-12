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
        var ty = y + (lineHeight-this.standardCharacterHeight())/2;
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
	var txAligned = tx;
	if(align === 'right') {
		txAligned += maxWidth - this.standardCharacterWidth() * text.length;
	} else if(align === 'center') {
		txAligned += Math.round(maxWidth / 2 - this.standardCharacterWidth() * (text.length / 2));
	}
	txAligned = (Math.floor(txAligned / 3) + (align === 'center' || align === 'right' ? 0 : 1)) * 3
	for(let i = 0; i < text.length; i++) {
		var curX = txAligned + i * this.standardCharacterWidth();
		if(curX < tx) { continue; }
		if(curX + this.standardCharacterWidth() > tx + maxWidth) { break; }
		this._drawCharacter(text[i], colorIndex, txAligned + i * this.standardCharacterWidth(), ty);
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
	return 5*this.standardPixelSize();
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