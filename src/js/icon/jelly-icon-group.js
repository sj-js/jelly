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

/**************************************************
 *
 * ICON-GROUP
 *
 **************************************************/
Jelly.IconGroup = getClazz(function(object){
    SjEvent.apply(this, arguments);

    this.parent = null;
    this.modeVisible = true;
    this.modeEnable = true;
    this.modeSystem = false;

    this.id = '';
    this.title = '';
    this.html = '';
    this.url = null;
    this.clazz = null;
    this.command = null;
    this.commandForOff = null;
    this.commandForPending = null;
    this.status = null;
    this.lastStatus = null;
    this.parameter = null;
    this.runnerList = [];

    this.objElement = null;
    this.data = {};

    this.modeStatusCheck = null;

    if (object){
        if (typeof object == 'string'){
            this.id = object;
        }else{
            this.init(object);
        }
    }
    this.setModeEnable(this.modeEnable);
})
.extend(SjEvent)
.returnFunction();

Jelly.Icon.STATUS_OFF= 0;
Jelly.Icon.STATUS_ON = 1;
Jelly.Icon.STATUS_PENDING = 2;
Jelly.Icon.EVENT_CHANGESTATUS = 'changestatus';





/**************************************************
 *
 * EVENT
 *
 **************************************************/
// Jelly.Icon.prototype.addEventListener               = function(element, eventName, eventFunc){ return this.event.addEventListener(element, eventName, eventFunc); };
// Jelly.Icon.prototype.addEventListenerByEventName    = function(eventName, eventFunc){ this.event.addEventListenerByEventName(eventName, eventFunc); return this; };
// Jelly.Icon.prototype.hasEventListener               = function(element, eventName, eventFunc){ return this.event.hasEventListener(element, eventName, eventFunc); };
// Jelly.Icon.prototype.hasEventListenerByEventName    = function(eventName, eventFunc){ return this.event.hasEventListenerByEventName(eventName, eventFunc); };
// Jelly.Icon.prototype.hasEventListenerByEventFunc    = function(eventFunc){ return this.event.hasEventListenerByEventFunc(eventFunc); };
// Jelly.Icon.prototype.removeEventListener            = function(element, eventName, eventFunc){ return this.event.removeEventListener(element, eventName, eventFunc); };
// Jelly.Icon.prototype.removeEventListenerByEventName = function(eventName, eventFunc){ return this.event.removeEventListenerByEventName(eventName, eventFunc); };
// Jelly.Icon.prototype.removeEventListenerByEventFunc = function(eventFunc){ return this.event.removeEventListenerByEventFunc(eventFunc); };
// Jelly.Icon.prototype.execEventListener              = function(element, eventName, event){ return this.event.execEventListener(element, eventName, event); };
// Jelly.Icon.prototype.execEventListenerByEventName   = function(eventName, event){ return this.event.execEventListenerByEventName(eventName, event); };





Jelly.Icon.prototype.init = function(object){
    for (var key in object)
        this[key]= object[key];
    return this;
};
Jelly.Icon.prototype.setTitle = function(title){
    this.title = title;
    return this;
};
Jelly.Icon.prototype.setHTML = function(html){
    this.html = html;
    return this;
};
Jelly.Icon.prototype.setURL = function(url){
    this.url = url;
    return this;
};
Jelly.Icon.prototype.setData = function(data){
    for (var key in data){
        this.data[key] = data[key];
    }
    return this;
};
Jelly.Icon.prototype.setClass = function(clazz){
    if (! (clazz instanceof Array))
        clazz = [clazz];
    this.clazz = clazz;
    return this;
};
Jelly.Icon.prototype.setCommand = function(command){
    this.command = command;
    return this;
};
Jelly.Icon.prototype.setModeStatusCheck = function(mode, func){
    this.modeStatusCheck = mode;
    if (func)
        this.statusChecker = func;
    return this;
};
Jelly.Icon.prototype.setModeVisible = function(mode){
    this.modeVisible = mode;
    return this;
};
Jelly.Icon.prototype.setModeEnable = function(mode){
    this.modeEnable = mode;
    var toClass = (this.modeEnable) ? 'jelly-icon-enabled' : 'jelly-icon-disabled';
    if (this.objElement)
        getEl(this.objElement).removeClass(['jelly-icon-enabled', 'jelly-icon-disabled']).addClass(toClass);
    return this;
};
Jelly.Icon.prototype.setModeSystem = function(mode){
    this.modeSystem = mode;
    return this;
};
Jelly.Icon.prototype.setRunner = function(runnerObject){
    this.runnerList = [];
    return this.addRunner(runnerObject);
};
Jelly.Icon.prototype.addRunner = function(runnerObject){
    if (! (runnerObject instanceof Array))
        runnerObject = [runnerObject];
    for (var i=0, runner; i<runnerObject.length; i++){
        runner = runnerObject[i];
        this.runnerList.push(runner);
    }
    return this;
};
Jelly.Icon.prototype.removeRunner = function(runnerObject){
    if (! (runnerObject instanceof Array))
        runnerObject = [runnerObject];
    for (var i=0; i<runnerObject.length; i++){
        var foundIndex = this.runnerList.indexOf(runnerObject[i]);
        if (foundIndex != -1)
            this.runnerList.splice(foundIndex, 1);
    }
    return this;
};



Jelly.Icon.prototype.getKeyRunnerList = function(runnerObject){
    var resultList = [];
    return resultList;
};
Jelly.Icon.prototype.getSpeechRunnerList = function(runnerObject){
    var resultList = [];
    return resultList;
};
Jelly.Icon.prototype.getScheduleRunnerList = function(runnerObject){
    var resultList = [];
    return resultList;
};


Jelly.Icon.prototype.runCommand = function(parameter){
    if (!this.modeEnable)
        return;
    var that = this;
    var parent = this.parent;
    //- Check Parameter
    parameter = (parameter) ? parameter : {};
    parameter.icon = this;
    parameter.status = this.status;
    //- Check Command
    var command = this.command;
    //- Status - Pending
    if (this.modeStatusCheck)
        this.status = Jelly.Icon.STATUS_PENDING;
    //- Run Command
    if (!this.command && this.url)
        return parent.openWindowWithURL(this);
    var callbackWhenResolved = function(){
        that.checkStatus();
    };
    parent.runCommand(command, parameter, callbackWhenResolved);
};


Jelly.Icon.prototype.removeFromParent = function(){
    this.parent.removeIcon(this);
};

Jelly.Icon.prototype.checkStatus = function(){
    if (this.modeStatusCheck && this.statusChecker){
        var that = this;
        var callbackWhenResolved = function(status){
            that.status = Jelly.Icon.checkBooleanStatus(status);
            /** Event **/
            that.execEventListenerByEventName(Jelly.Icon.EVENT_CHANGESTATUS, that);
        };
        this.statusChecker(callbackWhenResolved);
    }
    return this;
};





Jelly.Icon.checkBooleanStatus = function(boolean){
    if (boolean == true){
        return Jelly.Icon.STATUS_ON;
    }else if (boolean == false){
        return Jelly.Icon.STATUS_OFF;
    }
    return boolean;
}


