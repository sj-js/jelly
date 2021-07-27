/***************************************************************************
 * [Node.js] import
 ***************************************************************************/
try{
    var crossman = require('@sj-js/crossman');
    var ready = crossman.ready,
        getClazz = crossman.getClazz,
        getData = crossman.getData,
        SjEvent = crossman.SjEvent
    ;
}catch(e){}

/*****************************************************************************************************************************
 *
 * Jelly - Command Listener
 *
 *****************************************************************************************************************************/
Jelly.Plugin = function(){
    this.event = new SjEvent();

    this.name = '';
    this.parent = null;
    this.statusSetuped = false;

    this.defaultClazz = [Jelly.Plugin.CLASS_ICON_DEFAULT];

    this.currentSetupRunnerIcon = null;

    /** Status Checker **/
    this.statusChecker = null;
    this.cycleTimeForStatusChecker = 5000;
    this.checkerNameMap = {};

    /** Position Shortcut Key **/
    this.elementForPositionShortcutKeyList = [];

    this.classForIconStatusOn = 'jelly-icon-status-on';
    this.classForIconStatusOff = 'jelly-icon-status-off';
    this.classForIconStatusPending = 'jelly-icon-status-pending';
};
Jelly.Plugin.CLASS_ICON_DEFAULT = 'jelly-plugin-icon-manager-default';
Jelly.Plugin.CLASS_ICON_TOGGLE = 'jelly-plugin-icon-manager-toggle';



/**************************************************
 *
 * EVENT
 *
 **************************************************/
Jelly.Plugin.prototype.addEventListener               = function(element, eventName, eventFunc){ return this.event.addEventListener(element, eventName, eventFunc); };
Jelly.Plugin.prototype.addEventListenerByEventName    = function(eventName, eventFunc){ this.event.addEventListenerByEventName(eventName, eventFunc); return this; };
Jelly.Plugin.prototype.hasEventListener               = function(element, eventName, eventFunc){ return this.event.hasEventListener(element, eventName, eventFunc); };
Jelly.Plugin.prototype.hasEventListenerByEventName    = function(eventName, eventFunc){ return this.event.hasEventListenerByEventName(eventName, eventFunc); };
Jelly.Plugin.prototype.hasEventListenerByEventFunc    = function(eventFunc){ return this.event.hasEventListenerByEventFunc(eventFunc); };
Jelly.Plugin.prototype.removeEventListener            = function(element, eventName, eventFunc){ return this.event.removeEventListener(element, eventName, eventFunc); };
Jelly.Plugin.prototype.removeEventListenerByEventName = function(eventName, eventFunc){ return this.event.removeEventListenerByEventName(eventName, eventFunc); };
Jelly.Plugin.prototype.removeEventListenerByEventFunc = function(eventFunc){ return this.event.removeEventListenerByEventFunc(eventFunc); };
Jelly.Plugin.prototype.execEventListener              = function(element, eventName, event){ return this.event.execEventListener(element, eventName, event); };
Jelly.Plugin.prototype.execEventListenerByEventName   = function(eventName, event){ return this.event.execEventListenerByEventName(eventName, event); };



/**************************************************
 *
 * OPTION
 *
 **************************************************/



/**************************************************
 *
 * SETUP
 *
 **************************************************/
Jelly.Plugin.prototype.setup = function(parent){
};
Jelly.Plugin.prototype.start = function(){
};
Jelly.Plugin.prototype.end = function(){
};
Jelly.Plugin.prototype.dispose = function(){
};








