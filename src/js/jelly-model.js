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


/****************************************************************************************************
 *
 * MODEL
 *
 ****************************************************************************************************/

/**************************************************
 *
 * SpeakProcess
 *
 **************************************************/
Jelly.SpeakProcess = function(object){
    this.results = [];
    this.resultIndex = -1;
    this.init(object);
};
Jelly.SpeakProcess.prototype.init = function(object){
    for (var key in object)
        this[key]= object[key];
    return this;
};


/**************************************************
 *
 * SpeakResult
 *
 **************************************************/
Jelly.SpeakResult = function(object){
    this.time = null;
    this.type = Jelly.SpeakResult.TYPE_SPEECH;
    this.confidence = null;
    this.script = null;
    this.analysis = null;
    this.init(object);
};
Jelly.SpeakResult.prototype.init = function(object){
    for (var key in object)
        this[key]= object[key];
    return this;
};
Jelly.SpeakResult.TYPE_SPEECH = 1;
Jelly.SpeakResult.TYPE_TEXT = 2;


/**************************************************
 *
 * JellyCommand
 *
 **************************************************/
Jelly.JellyCommand = function(object){
    this.command;
    this.parameter;
};
Jelly.JellyCommand.prototype.init = function(object){
    for (var key in object)
        this[key]= object[key];
    return this;
};


