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