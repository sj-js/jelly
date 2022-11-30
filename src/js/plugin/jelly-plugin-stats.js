/***************************************************************************
 * [Node.js] import
 ***************************************************************************/
try{
    var crossman = require('@sj-js/crossman');
    var KeyMan = require('@sj-js/keyman');
    var Jelly = require('../jelly');
    var ready = crossman.ready,
        getClazz = crossman.getClazz,
        getData = crossman.getData,
        getEl = crossman.getEl,
        SjEvent = crossman.SjEvent
    ;
}catch(e){}

/***************************************************************************
 *
 * Jelly - Command Listener
 *
 ***************************************************************************/
Jelly.PluginStats = function(){
    this.name = '';
    this.parent = null;
    this.statusSetuped = false;

    //TODO: Test...
    this.listener = new Listener();
};
Jelly.PluginStats.prototype.setup = function(parent){
    var that = this;
    var popman = parent.popman;
    var keyman = parent.keyman;
    ready(function(){
        popman.add(popman.new({
            id:'pop-stats',
            exp:'(90%)*/(10%)*',
            modeDark: false,
            closebyesc: true,
            closebyclickout: true,
            add:function(data){
                getEl(data.element).style('text-align:left; font-family: monospace;')
            },
        }));
    });

    this.parent
        .addEventListenerByEventName(Jelly.EVENT_NOMORESPEECH, function(data){
            // popman.close('pop-stats');
        })
        .addEventListenerByEventName(Jelly.EVENT_RESULT, function(result){
            var pop = popman.pop('pop-stats');
            that.makePopForRecogStats(result.results, result.resultIndex);
            pop.element.parentNode.scrollTop = pop.element.parentNode.scrollHeight;

        });
};
Jelly.PluginStats.prototype.start = function(){

};
Jelly.PluginStats.prototype.end = function(){

};
Jelly.PluginStats.prototype.dispose = function(){

};





Jelly.PluginStats.prototype.makePopForRecogStats = function(results, idx){
    var that = this;
    var parent = that.parent;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var popStats = popman.getPop('pop-stats');
    var divSpeakStats = popStats.element;

    //Clear
    divSpeakStats.innerHTML = '';

    var listener = this.listener;

    //Make
    for (var i=0, result, isFinal, script, confidence; i<results.length; i++){
        result = results[i];
        isFinal = result.isFinal;
        script = result[0].transcript;
        confidence = result[0].confidence;

        //- Calculate
        let flowed = listener.analysisScript(script, isFinal, i);
        if (!isFinal)
            console.debug(">> ", flowed.index, flowed.script, isFinal, flowed);
        listener.readFlowed(flowed, i);

        //- View
        //TODO: 꾸미기
        script = kkumiki(flowed);
        var ridxExp = (i == idx) ? '>> ' : '&nbsp;&nbsp;&nbsp;';
        var expressionForConfidence = ridxExp + '[' +Jelly.makeGageExpression(confidence) +'] ' +i+ ') ';
        if (isFinal){
            getEl(divSpeakStats).addEl('<div>' +expressionForConfidence+ '<span style="font-weight:bold">' +script+ '</span></div>');
        }else{
            getEl(divSpeakStats).addEl('<div>' +expressionForConfidence+ '<span>' +script+ '</span></div>');
        }
    }

};


function kkumiki(flowed){
    var script = flowed.script;
    for (var i=flowed.commands.length -1; i>-1; i--){
        var command = flowed.commands[i];
        var leftString = script.substring(0, command.startIndexOnFlowed);
        var cropedMaybeCommandString = script.substring(command.startIndexOnFlowed, command.endIndexOnFlowed +1);
        var rightString = script.substring(command.endIndexOnFlowed);

        script = leftString + kkumiki_command(cropedMaybeCommandString, command) + rightString;
    }
    // script = flowed.script.substring(0, flowed.startIndexOnFlowed -1) +" >> "+ flowed.script.substring(flowed.startIndexOnFlowed -1);
    return script;
}

function kkumiki_command(cropedString, command){
    var result = "";
    if (command.commandString == cropedString){
        result = "<span style='color:deepskyblue;'>" + command.commandString + "</span>";
    }else{
        result = cropedString+ "(<span style='color:deepskyblue;'>" + command.commandString + "</span>)";
    }
    return result;
}












/**************************************************
 *
 * Flowed
 *
 **************************************************/
function Flowed(){
    this.script = "";
    this.index = -1;
    this.commands = [];
    this.time = new Date().getTime();
    this.updatedTime;
}

Flowed.prototype.setupIndex = function(index){
    this.index = index;
    return this;
};

Flowed.prototype.updateTime = function(){
    this.updatedTime = new Date().getTime();
    return this;
};

Flowed.prototype.update = function(script){
    //1. Analysis
    var beforeScript = this.script;
    var newPart;
    var gap;
    if (beforeScript === null || beforeScript === undefined){
        gap = script.length;
    }else{
        gap = script.length - beforeScript.length;
    }

    //2. Update
    if (script != beforeScript){
        this.script = script;
        this.updateTime();
    }

    return this;
};

Flowed.prototype.addCommand = function(command){
    var length = command.commandString.length;
    this.commands.push(command);
    return this;
};

Flowed.prototype.getLastCommandStartIndex = function(){
    if (this.commands.length > 0){
        var lastCommand = this.commands[this.commands.length -1];
        return lastCommand.startIndexOnFlowed;
    }
    return 0;
};

Flowed.prototype.getLastCommandEndIndex = function(){
    if (this.commands.length > 0){
        var lastCommand = this.commands[this.commands.length -1];
        return lastCommand.endIndexOnFlowed;
    }
    return 0;
};


/**************************************************
 *
 * Command
 *
 **************************************************/
function Command(startIndexOnFlowed, endIndexOnFlowed, commandString){
    this.startIndexOnFlowed = startIndexOnFlowed;
    this.endIndexOnFlowed = endIndexOnFlowed;
    this.commandString = commandString;
    this.time = new Date().getTime();
}


/**************************************************
 *
 * Listener
 *
 **************************************************/
function Listener(){
    this.commandMap = {};
    this.testCheckAlreadyFlowedMap = {};
    this.flows = [];

    this.commandStack = [];
    this.commandTimeLimit = 1000;
    this.lastCommandTime = -1;
    this.lastCommandKey = "";
}

Listener.prototype.add = function(commandString, func){
    if (commandString instanceof Array){
        for (var i in commandString){
            var string = commandString[i];
            this.add(string, func);
        }
        return this;
    }

    this.commandMap[commandString] = func;
    return this;
};

Listener.prototype.analysisScript = function(script, isFinal, i){
    var command = null;

    //1. Check - new script?
    var flowed = this.testCheckAlreadyFlowedMap[i];
    var prevFlowed = this.testCheckAlreadyFlowedMap[i -1];
    if (flowed == null){
        //New
        flowed = this.newFlowed(i);
        console.error(flowed, "[NEW]", i, "새로운 Flowed");
    }else{
        var currentTime = new Date().getTime();
        var elapsedTime = currentTime - flowed.updatedTime;
        if (prevFlowed && prevFlowed.updatedTime > flowed.updatedTime){
            //New
            flowed = this.newFlowed(i);
            console.error(flowed, "[RENEW]", i, "새로운 Flowed - 미확정 Flowed");
        }
        // else if (elapsedTime > 2000 && flowed.getLastCommandEndIndex() > script.length){
        else if (elapsedTime > 2000 && flowed.script != script){
            //New
            flowed = this.newFlowed(i);
            console.error(flowed, "[RENEW]", i, "새로운 Flowed - 오래된 Flowed");
        }
        else{
            //None
        }
    }

    //2. Analysis
    flowed.update(script);

    return flowed;
};

Listener.prototype.newFlowed = function(i){
    var flowed = new Flowed().setupIndex(i);
    this.testCheckAlreadyFlowedMap[i] = flowed;
    this.flows.push(flowed);

    return flowed;
};

Listener.prototype.readFlowed = function(flowed, event){
    var readTarget = flowed.script.substring(flowed.getLastCommandEndIndex());

    let commandMap = this.commandMap;
    let keys = Object.keys(commandMap);
    let index, key, func, command;
    for (index in keys){
        key = keys[index];
        var foundCommandIndex = readTarget.indexOf(key);
        if (foundCommandIndex  != -1){
            func = commandMap[key];

            //Confirm command
            try{
                command = new Command(
                    flowed.getLastCommandEndIndex() + foundCommandIndex,
                    flowed.getLastCommandEndIndex() + foundCommandIndex + key.length,
                    key
                );
                flowed.addCommand(command);

                console.debug(
                    "[COMMAND]",
                    flowed.index,
                    readTarget,
                    (flowed.getLastCommandStartIndex() +"~"+ flowed.getLastCommandEndIndex())
                );

                this.executeComand(command, func, event );

            }catch(e){
                //ignore
            }
        }
    }

};



Listener.prototype.executeComand = function(command, func, event){
    const currentTime = new Date().getTime();

    //Validate
    //- Limit - Time Limit.. //TODO: 임시 체크
    // if (currentTime < lastCommandTime + commandTimeLimit){
    //     console.error("Limit!!", currentTime, lastCommandTime, currentTime < lastCommandTime + commandTimeLimit)
    //     return;
    // }

    //- Dup - No Double Command
    // if (lastCommandKey == command.command){
    //     console.error("Dup!", command.command, lastCommandKey);
    //     return;
    // }

    //Execute
    func(event);

    //Stack //TODO:　바로 실행하지 말고 좀 생각해서! 실행해보자!
    //TODO: 근시간안에 flowed 다음 prevFlowed에서 명령이 발생한다면 중복으로 이해하고 실행금지를 고려해야합니다.
    this.commandStack.push(command);
    this.lastCommandTime = command.time;
    this.lastCommandKey = command.commandString;
};