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


/***************************************************************************
 *
 * Jelly
 *
 *      - Command Listener
 *
 ***************************************************************************/
Jelly = getClazz(function(object){
    SjEvent.apply(this, arguments);

    this.speechRecognizer = null;

    this.lastProcessResult = new Jelly.SpeakProcess();

    //Meta
    this.name = '젤리';
    this.nickName = ['잴리', '쟐리'];
    this.storagePath = '/jelly/icon';

    //Status
    this.statusCalledMyName = false;
    this.startTimeForCommand = null;
    this.endTimeForCommand = null;
    this.lastTimeSpeechInput = null;

    //Datas - Setup
    this.setupObject = {};
    //Temp
    this.commandObject = {};
    this.commandConditionObject = {};
    //Datas - Icon
    this.iconList = [];
    this.systemIconMap = {};
    this.userIconMap = {};
    //Datas - Runner
    this.keyRunnerMap = {};
    this.speechRunnerMap = {};
    this.scheduleRunnerMap = {};
    //Datas - Window
    this.urlOpenMap = {};

    //Plugin
    this.boxman = new BoxMan();
    this.popman = new PopMan();
    this.keyman = new KeyMan().addKeyHandler([new KeyMan.ShortcutKeyHandler(), new KeyMan.CommandKeyHandler()]);
    this.menuman = new MenuMan();
    this.variableman = new VariableMan();
    this.pluginList = [];

    //Log
    this.logStack = [];

    //Watch
    this.stackToWork = [];
    this.timeToWatch = 500;

    //Speech Retry Checker
    this.retryCount = 0;
    this.lastRetryTimeCheck = new Date().getTime();



    if (object)
        this.setup(object);


    var that = this;
    window.addEventListener('unload', function(){
        for (var iconId in that.urlOpenMap){
            var windowList = that.urlOpenMap[iconId];
            for (var i=0, targetWindow; i<windowList.length; i++){
                targetWindow = windowList[i];
                if (targetWindow && !targetWindow.closed){
                    targetWindow.close();
                }
            }
        }
    });
})
.extend(SjEvent)
.returnFunction();
// getClazz(Jelly).extend(SjEvent);


/***************************************************************************
 * [Node.js] exports
 ***************************************************************************/
try {
    module.exports = exports = Jelly;
} catch (e) {}


Jelly.TYPE_RUNNER_KEY = 'key';
Jelly.TYPE_RUNNER_SPEECH = 'speech';
Jelly.TYPE_RUNNER_SCHEDULE = 'schedule';
Jelly.EVENT_FINALRESULT = 'finalresult';
Jelly.EVENT_RESULT = 'result';
Jelly.EVENT_STARTSPEECH = 'startspeech';
Jelly.EVENT_ENDSPEECH = 'endspeech';
Jelly.EVENT_NOMORESPEECH = 'nomorespeech';
Jelly.EVENT_STOPSPEECH = 'stopspeech';





/*************************
 *
 * DETECT DOM SETUPED WITH POPMAN OPTION
 *
 *************************/
Jelly.prototype.detect = function(afterDetectFunc){
    var that = this;
    ready(function(){
        // getEl().ready(function(){
        var setupedElementList;
        /** 객체탐지 적용() **/
        setupedElementList = document.querySelectorAll('[data-jelly-click]');
        for (var j=0; j<setupedElementList.length; j++){
            that.setJellyClick(setupedElementList[j]);
        }
        /** 객체탐지 적용() **/
        setupedElementList = document.querySelectorAll('[data-jelly-enter]');
        for (var j=0; j<setupedElementList.length; j++){
            that.setJellyEnter(setupedElementList[j]);
        }
        /** Run Function After Detect **/
        if (afterDetectFunc)
            afterDetectFunc(that);
        if (that.hasEventListenerByEventName('afterdetect'))
            that.execEventListenerByEventName('afterdetect');
    });
    return this;
};
Jelly.prototype.afterDetect = function(func){
    this.addEventListenerByEventName('afterdetect', func);
    return this;
};
Jelly.prototype.beforeFirstPop = function(func){
    this.addEventListenerByEventName('beforefirstpop', func);
    return this;
};
Jelly.prototype.afterLastPop = function(func){
    this.addEventListenerByEventName('afterlastpop', func);
    return this;
};


Jelly.prototype.setJellyClick = function(element){
    getEl(element).addEventListener('click', function(){
        var command = element.getAttribute('data-jelly-click');
        jelly.runCommand(command);
    });
    return this;
};
Jelly.prototype.setJellyEnter = function(element){
    getEl(element).addEventListener('keydown', function(e){
        if (e.keyCode == 13){
            var command = element.getAttribute('data-jelly-enter');
            jelly.runCommand(command);
        }
    });
    return this;
};



/**************************************************
 *
 *  START
 *
 **************************************************/
Jelly.prototype.start = function(){
    var that = this;
    //Add Work
    this.addWork([
        //Check Log
        new WorkItem().setEnable(false).setCycle(2000).setFunc(function(){
            console.log('Wathcer-Checker>', new Date().getTime());
        }),
        //Check Command Timeout
        new WorkItem().setCycle(1000).setFunc(function(){
            if (WorkItem.checkElapsedTime(that.lastTimeSpeechInput, 4000)){
                if (that.statusCalledMyName)
                    that.stopListenCommand();
                that.execEventListenerByEventName(Jelly.EVENT_NOMORESPEECH, null);
            }
        }),
    ]);
    //Start Auto
    this.startSpeechRecognizer();
    this.startWorkProcess();
    return this;
};
Jelly.prototype.finish = function(){
    this.stopSpeechRecognizer();
    this.stopWorkProcess();
    this.removeAllWorkItem();
    return this;
};



/**************************************************
 *
 *  PLUGIN
 *
 **************************************************/
Jelly.prototype.addPlugin = function(plugin){
    if ( !(plugin instanceof Array) )
        plugin = [plugin];
    for (var i=0, pg; i<plugin.length; i++){
        pg = plugin[i];
        if (pg.statusSetuped)
            return;
        pg.statusSetuped = true;
        pg.parent = this;
        pg.setup(this);
        pg.start(this);
        this.pluginList.push(plugin[i]);
    }
    return this;
};
Jelly.prototype.findPlugin = function(plugin){
    for (var i=0, comparePlugin; i<this.pluginList.length; i++){
        comparePlugin = this.pluginList[i];
        if (comparePlugin instanceof plugin)
            return comparePlugin;
    }
    return null;
};
Jelly.prototype.removePlugin = function(plugin){
    if ( !(plugin instanceof Array) )
        plugin = [plugin];
    for (var i=0, pg; i<plugin.length; i++){
        pg = this.findPlugin(plugin[i]);
        if (!pg || !pg.statusSetuped)
            return;
        pg.end();
        pg.dispose();
        pg.statusSetuped = false;
        pg.parent = null;
        var foundIndex = this.pluginList.indexOf(pg);
        if (foundIndex != -1)
            this.pluginList.splice(foundIndex, 1);
    }
    return this;
};



/**************************************************
 *
 * SETUP
 *
 **************************************************/
Jelly.prototype.setup = function(setupObject){
    for (var key in setupObject){
        this.setupObject[key] = setupObject[key];
    }
    return this;
};



/**************************************************
 *
 * SETUP - ICON
 *
 **************************************************/
Jelly.prototype.setupCommandCondition = function(commandConditionObject){
    for (var key in commandConditionObject){
        var condition = commandConditionObject[key];
        if ( !(condition instanceof Array) )
            condition = [condition];
        if (!this.commandConditionObject[key])
            this.commandConditionObject[key] = [];
        for (var i=0; i<condition.length; i++){
            this.commandConditionObject[key].push(condition[i]);
        }
    }
    return this;
};
Jelly.prototype.setupSystemIcon = function(iconObject){
    var that = this;
    if ( !(iconObject instanceof Array))
        iconObject = [iconObject];
    for( var i=0, icon; i<iconObject.length; i++){
        icon = iconObject[i];
        //Something add class
        icon.setModeSystem(true);
    }
    this.setupUserIcon(iconObject);
    return this;
};
Jelly.prototype.setupUserIcon = function(iconObject){
    var that = this;
    if ( !(iconObject instanceof Array))
        iconObject = [iconObject];
    for( var i=0, icon; i<iconObject.length; i++){
        icon = iconObject[i];
        icon.parent = this;
        this.iconList.push(icon);

        /** Setup Runner **/
        for (var j=0, runner; j<icon.runnerList.length; j++){
            runner = icon.runnerList[j];
            runner.parent = icon;
            if (runner instanceof Jelly.KeyRunner){
                this.addKey(runner);
            }else if (runner instanceof Jelly.ScheduleRunner){
                this.addSchedule(runner);
            }else if (runner instanceof Jelly.SpeechRunner){
                this.addSpeech(runner);
            }
        }
    }
    return this;
};



/**************************************************
 *
 * SETUP - BOT
 *
 **************************************************/
Jelly.prototype.setupBot = function(botObject){
    var that = this;
    if ( !(botObject instanceof Array))
        botObject = [botObject];
    for( var i=0, icon; i<botObject.length; i++){
        icon = botObject[i];
        icon.parent = this;
        this.iconList.push(icon);

        /** Setup Runner **/
        for (var j=0, runner; j<icon.runnerList.length; j++){
            runner = icon.runnerList[j];
            runner.parent = icon;
            if (runner instanceof Jelly.KeyRunner){
                this.addKey(runner);
            }else if (runner instanceof Jelly.ScheduleRunner){
                this.addSchedule(runner);
            }else if (runner instanceof Jelly.SpeechRunner){
                this.addSpeech(runner);
            }
        }
    }
    return this;
};



/**************************************************
 *
 * SAVE & LOAD
 *
 **************************************************/
Jelly.prototype.saveIcon = function(sotragePathKey){
    this.execEventListenerByEventName('saveicon', null);
    return this;
};
Jelly.prototype.loadIcon = function(sotragePathKey){
    this.execEventListenerByEventName('loadicon', null);
    return this;
};



Jelly.prototype.getIcon = function(param){
    if (typeof param == 'string'){
        return this.getIconById(param);
    }else if (param instanceof Element){
        // return this.getIconByEl(param);
    }else{
        var resultList = this.getIconsByCondition(param);
        if (resultList != null && resultList.length > 0)
            return resultList[0];
    }
    return;
};
Jelly.prototype.getIcons = function(){
    return this.iconList;
}
BoxMan.prototype.getIconsByCondition = function(condition){
    var resultList = [];
    var iconList = this.iconList;
    for (var boxName in iconList){
        var obj = iconList[boxName];
        var result = getEl(obj).find(condition);
        if (result)
            resultList.push(result);
    }
    return resultList;
};
Jelly.prototype.getIconById = function(id){
    // var objElement = document.getElementById(id);
    // var icon = this.iconList[objElement.manid];
    for (var i=0, icon; i<this.iconList.length; i++){
        icon = this.iconList[i];
        if (icon.id == id){
            return icon;
        }
    }
    return null;
};
Jelly.prototype.getIconByEl = function(element){
    var iconList = this.iconList;
    if (element && element.manid){
        var manid = element.manid;
        var icon = iconList[manid];
        return icon;
    }
};

Jelly.prototype.removeIcon = function(param){
    // var icon = this.getIcon(param);
    var icon = param;
    var foundIndex = this.iconList.indexOf(icon);
    if (foundIndex != -1)
        this.iconList.splice(foundIndex, 1);
    return this;
};




/**************************************************
 *
 * SETUP - RUNNER
 *
 **************************************************/
Jelly.prototype.addKey = function(runner){
    var that = this;
    var keyman = this.keyman;
    var id = Jelly.createUUID();
    this.keyman.add({
        name: id,
        keys: runner.keyList,
        data: {
            shortcutName: id,
            shortcutKeyList: runner.keyList,
            runType: 'runType',
            menuName: 'menuName'
        },
        keydown:function(data){
            // console.log('CHECK RUN TYPE!!! ', data.shortcutName, data.runType, RUN_TYPE_DB)
            //Alert 등을 사용할때 키눌림상태를 해결할 수 있는 기능
            keyman.check(data.shortcutName);
            console.error(runner);
            var icon = runner.parent;
            icon.runCommand(icon.command, icon.parameter);
            // that.runCommand(runner.parent.command, runner.parent.parameter);
        }
    });
};

Jelly.prototype.addSpeech = function(runner){
    var that = this;
    var icon = runner.parent;
    var command = icon.command;
    var speechExpression = runner.speechExpression;
    //
    var speechData = {};
    speechData[command] = [speechExpression];
    this.setupCommandCondition(speechData);
};

Jelly.prototype.addSchedule = function(runner){
    var that = this;
    if (runner.cycleTime){
        that.addWork( new WorkItem().setEnable(true).setModeDirectStart(true).setCycle(runner.cycleTime).setFunc(function(){
            var icon = runner.parent;
            icon.runCommand(icon.command, icon.parameter);
            // that.runCommand(runner.parent.command, runner.parent.parameter);
        }) );
    }else if (runner.getExpression()){
        that.addWork( new WorkItem().setEnable(true).setModeDirectStart(true).setTimeManExp(runner.getExpression()).setFunc(function(){
            var icon = runner.parent;
            icon.runCommand(icon.command, icon.parameter);
            // that.runCommand(runner.parent.command, runner.parent.parameter);
        }) );
    }
};



/**************************************************
 *
 * COMMAND
 *
 **************************************************/
Jelly.prototype.command = function(object){
    if (object instanceof Jelly.SpeakResult){
        var resultList = this.analysisSpeechExpression(object);
        for (var i=0, result; i<resultList.length; i++){
            result = resultList[i];
            this.runCommand(result.type, result.parameter);
        }
    }else if (object instanceof Jelly.JellyCommand){
        this.runCommand(object.type, object.parameter)
    }
    return this;
};
Jelly.prototype.runCommand = function(command, parameter, resolve){
    parameter = (parameter) ? parameter: {};
    var commandFunc;
    if (command instanceof Jelly.JellyCommand){
        commandFunc = command.command;
        parameter = command.parameter;
    }
    if (typeof command == 'string'){
        // commandFunc = this.commandObject[command];
        var icon = this.getIcon(command);
        if (icon)
            return this.runCommand(icon.command, parameter, resolve);
    }
    if (command instanceof Function){
        commandFunc = command;
    }else if (typeof command == 'object'){
        // commandFunc = command;
        commandFunc = function(){ /* None */ };
    }
    if (commandFunc){
        commandFunc(parameter, resolve);
    }else{
        this.popman.alert('존재하지 않는 명령입니다. [' +command+ ']');
    }
    return this;
};

Jelly.prototype.openWindowWithURL = function(icon){
    var that = this;
    var openTargetWindow;
    if (!this.urlOpenMap[icon.id])
        this.urlOpenMap[icon.id] = [];
    //창 1개 제한
    this.clearClosedWindows(icon.id);
    console.error('Ooen Window', icon.id, that.urlOpenMap[icon.id]);
    if (this.urlOpenMap[icon.id].length > 0){
        openTargetWindow = this.urlOpenMap[icon.id][0];
        openTargetWindow.focus();
        return;
    }
    //Open NewPage
    openTargetWindow = window.open(icon.url, '_blank');
    //Event
    openTargetWindow.addEventListener('beforeunload ', function(e){
        console.error('Delete Window', that.urlOpenMap[icon.id]);
        var list = that.urlOpenMap[icon.id];
        if (!list)
            return;
        var foundIndex = list.indexOf(openTargetWindow);
        if (foundIndex != -1)
            list.splice(foundIndex, 1);
    });
    this.urlOpenMap[icon.id].push(openTargetWindow);
};
Jelly.prototype.clearClosedWindows = function(iconId){
    var list = this.urlOpenMap[iconId];
    for (var i=list.length -1, win; i>-1; i--){
        win = list[i];
        if (win.closed)
            list.splice(i, 1);
    }
};
Jelly.prototype.closeWindowWithURL = function(icon){
    var windowList = this.urlOpenMap[icon.id];
    if (windowList){
        windowList[0].close();
    }
};



Jelly.prototype.triggerByText = function(script){
    var finalResult = new Jelly.SpeakResult({
        time:new Date().getTime(), script:script, confidence:1, type:Jelly.SpeakResult.TYPE_TEXT
    });
    this.onSpeechFinalResult(finalResult);
};
Jelly.prototype.pushLog = function(logObject){
    this.logStack.push(logObject);
};




Jelly.createUUID = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16);
    });
};



Jelly.makeGageExpression = function(confidence){
    var result = '';
    var resultList = [];
    var length = 0;
    //- Confidence 표현문자 0.01 이상은 Gage로 표현
    if (0.01 < confidence){
        var confidence2Dot = Jelly.cutDot(confidence, 2);
        var gage = Math.floor(confidence2Dot / 0.05);
        var isOdd = (gage % 2);
        var lengthForGage10Unit = Math.floor(gage/2);
        for (var i=0; i<lengthForGage10Unit; i++){
            resultList.push(':');
            ++length;
        }
        if (isOdd){
            resultList.push('.');
            ++length;
        }

        //- 끝자락에 Percentage 수치 표시
        var percentageText = '' +Math.floor(confidence2Dot * 100);
        var percentageTextArray = percentageText.split('');
        var percentageTextLength = percentageTextArray.length;
        for (var i=0; i<percentageTextLength; i++){
            resultList.push(percentageTextArray[i]);
        }
        if (0 < length){
            if (length < percentageTextLength){
                resultList.splice(0, length);
            }else{
                var a = resultList.splice(length -percentageTextLength, percentageTextLength);
            }
        }
        //- HTML로 꾸미기
        resultList.splice(0, 0, '<span class="jelly-speak-analysis-expression-confidence-10">');
        resultList.splice(lengthForGage10Unit +1, 0, '</span>');
        if (isOdd){
            resultList.splice(lengthForGage10Unit +1 +1, 0, '<span class="jelly-speak-analysis-expression-confidence-5">');
            resultList.push('</span>');
        }
        result = resultList.join('');

    }else{
        result = (confidence +'');
        length = result.length;
    }
    //- Confidence 표현문자 10자리로 정리
    var more = 10 - length;
    if (more < 0){
        result = result.substr(0, 10);
    }else if (0 < more){
        result += Jelly.makeEmptyString(more, '&nbsp;');
    }
    return result;
}

Jelly.cutDot = function(num, dot){
    var d = Math.pow(10, dot);
    return (Math.floor(num * d) /d);
}

Jelly.makeEmptyString = function(d, char){
    char = char ? char : ' ';
    var result = '';
    for (var i=0; i<d; i++){
        result += char;
    }
    return result;
}




