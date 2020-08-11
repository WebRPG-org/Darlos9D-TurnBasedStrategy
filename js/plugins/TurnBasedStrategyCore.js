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
    // Note: Firefox has a bug with textBaseline: Bug 737852
    //       So we use 'alphabetic' here.
    if (text !== undefined) {
        var tx = x;
        var ty = y + lineHeight - (lineHeight - this.fontSize * 0.7) / 2;
        var context = this._context;
        var alpha = context.globalAlpha;
        maxWidth = maxWidth || 0xffffffff;
        if (align === 'center') {
            tx += maxWidth / 2;
        }
        if (align === 'right') {
            tx += maxWidth;
        }
        context.save();
        context.font = this._makeFontNameText();
        context.textAlign = align;
        context.textBaseline = 'alphabetic';
        context.globalAlpha = 1;
        this._drawTextOutline(text, tx, ty, maxWidth);
        context.globalAlpha = alpha;
        this._drawTextBody(text, tx, ty, maxWidth);
        context.restore();
        this._setDirty();
    }
};

Bitmap.prototype._drawTextBody = function(text, tx, ty, maxWidth) {
    var context = this._context;
	var measuredText = context.measureText(text);
    context.imageSmoothingEnabled = false;
    context.fillStyle = this.textColor;
	var textWidth = text.length * this.standardCharacterWidth();
    context.fillText(text, tx, ty, maxWidth);
};

Bitmap.prototype.standardFontSize = function() {
    return 28;
};

Bitmap.prototype.standardCharacterWidth = function() {
	return 14;
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