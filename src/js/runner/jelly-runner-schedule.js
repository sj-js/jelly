/***************************************************************************
 * [Node.js] import
 ***************************************************************************/
try{
    var Jelly = require('../jelly');

    var crossman = require('@sj-js/crossman');
    var ready = crossman.ready,
        getClazz = crossman.getClazz,
        getData = crossman.getData,
        SjEvent = crossman.SjEvent
    ;

    var WorkItem = require('../model/work-item');

}catch(e){}


/**************************************************
 *
 * RUNNER - schedule
 *
 **************************************************/
Jelly.ScheduleRunner = function(object){
    this.type = Jelly.TYPE_RUNNER_SCHEDULE;
    this.parent = null;
    this.timeManExp = null;
    this.cycleTime = null;
    if (typeof object == 'string'){
        this.timeManExp = object;
    }else if (typeof object == 'number'){
        this.cycleTime = object;
    }
    // this.init(object);
};


Jelly.ScheduleRunner.prototype.init = function(object){
    for (var key in object)
        this[key]= object[key];
    return this;
};
Jelly.ScheduleRunner.prototype.setup = function(parent){
    return this;
};
Jelly.ScheduleRunner.prototype.getExpression = function(){
    if (this.timeManExp)
        return this.timeManExp;
    return 'cycle(' +this.cycleTime+ ')';
};
Jelly.ScheduleRunner.prototype.getRemainingTime = function(){
    var result = 0;
    return result;
};





/****************************************************************************************************
 *
 * PROCESS - Schedule
 *
 ****************************************************************************************************/
Jelly.prototype.startWorkProcess = function(){
    var that = this;
    var stackToNextWork = [];
    var workItem;
    while (this.stackToWork.length != 0){
        try{
            // console.log(this.stackToWork.length, this.stackToWork);
            workItem = this.stackToWork.splice(0, 1)[0];
            if (workItem instanceof WorkItem){
                workItem.run();
            }else{
                console.error(workItem);
                workItem();
            }
        }catch(e){
            console.error(e);
        }finally{
            //Check Next Work
            if (workItem instanceof WorkItem){
                if (workItem.checkMoreWork())
                    stackToNextWork.push(workItem);
            }
        }
    }

    while (stackToNextWork.length != 0){
        workItem = stackToNextWork.splice(0, 1)[0];
        this.stackToWork.push(workItem);
    }

    setTimeout(function(){ that.startWorkProcess(); }, that.timeToWatch);
    return this;
};

Jelly.prototype.addWork = function(workItem){
    if (workItem instanceof Array){
        for (var i=0; i<workItem.length; i++){
            this.addWork(workItem[i]);
        }
        return;
    }
    this.stackToWork.push(workItem);
    return this;
};






