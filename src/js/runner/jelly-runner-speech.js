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
 * RUNNER - speech
 *
 **************************************************/
Jelly.SpeechRunner = function(object){
    this.type = Jelly.TYPE_RUNNER_SPEECH;
    this.parent = null;
    this.speechExpression = '';
    this.regexp = null;

    //Speech Retry Checker
    this.retryCount = 0;
    this.lastRetryTimeCheck = new Date().getTime();

    if (object instanceof String){
        this.speechExpression = object;
    }else if (object instanceof RegExp){
        this.regexp = object;
    }
    // this.init(object);
};


Jelly.SpeechRunner.prototype.init = function(object){
    for (var key in object)
        this[key]= object[key];
    return this;
};
Jelly.SpeechRunner.prototype.setup = function(parent){
    return this;
};
Jelly.SpeechRunner.prototype.getExpression = function(){
    return this.speechExpression;
};
Jelly.SpeechRunner.prototype.analysis = function(speechText){
    var parent = this.parent;
    var variableman = parent.variableman;
    var speechExpression = this.getExpression();
    if (speechExpression instanceof RegExp){
        speechExpression.match(speechText);
    }else{
        //- Analysis
        var analysisResultList = variableman.parseDataList(speechText, speechExpression);
        //- Make RegExp
        analysisResultList;
        //- Make Parameter

    }
    var parameter = {};
    return parameter;
};



/****************************************************************************************************
 *
 * PROCESS - SpeechRecognizer
 *
 ****************************************************************************************************/
Jelly.prototype.startSpeechRecognizer = function(){
    var that = this;

    //Retry
    var retryEanble = true;
    if (Jelly.checkElapsedTime(5000, that.lastRetryTimeCheck)){
        that.retryCount = 0;
        that.lastRetryTimeCheck = new Date().getTime();
        retryEanble = true;
    }else{
        retryEanble = (that.retryCount <= 10);
    }

    if (!retryEanble){
        // console.error("retry after 1000ms", that.lastRetryTimeCheck, that.retryCount);
        setTimeout(function(){ that.startSpeechRecognizer(); }, 1000);
        return;
    }else{
        ++that.retryCount;
        console.log("try", that.lastRetryTimeCheck, that.retryCount);
    }

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    window.SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    window.SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
    //Make
    var recognizer = this.speechRecognizer = new SpeechRecognition();
    recognizer.interimResults = true;
    recognizer.continuous = true;
    recognizer.maxAlternatives = 1;
    recognizer.lang = 'ko-KR';
    recognizer.onerror = function(event){
        if (event.error == 'aborted' || event.error == 'no-speech'){
            console.log(event.error, event);
            return;
        }
        console.error('Error', event);
    };
    recognizer.onstart = function() {
        console.log('  >> Speech recognizer service has started');
    };

    recognizer.onend = function() {
        if (!that.speechRecognizer){
            console.log('  >> Speech recognizer service disconnected');
            return that.onStopSpeech();
        }

        console.log('Speech recognizer service retry ~');
        that.startSpeechRecognizer();
    };
    recognizer.onnomatch = function(event) {
        console.log('no match');
    };
    recognizer.onspeechstart = function() {
        console.log('speech start');
        that.onStartSpeechResult();
    };
    recognizer.onspeechend = function() {
        console.log('speech end');
        if (!that.speechRecognizer){
            return;
        }
        that.onEndSpeechResult(that.lastProcessResult);
        that.lastProcessResult = new Jelly.SpeakProcess();
    };
    recognizer.onresult = function(event){
        that.lastTimeSpeechInput = new Date().getTime();
        var results = event.results;

        // that.onSpeechResult(results);
        var processResult = that.lastProcessResult = new Jelly.SpeakProcess({results:results, resultIndex:event.resultIndex});
        that.onSpeechResult(processResult);

        // var result = that.getMostConfidentResult(results);
        var result = results[event.resultIndex];
        if (result.isFinal){
            var finalResult = new Jelly.SpeakResult({
                time: that.lastTimeSpeechInput,
                script: result[0].transcript,
                confidence: result[0].confidence
            });
            that.pushLog(finalResult);
            that.onSpeechFinalResult(finalResult);
        }
    };
    recognizer.start();
};

Jelly.prototype.stopSpeechRecognizer = function(){
    this.speechRecognizer.abort();
    this.speechRecognizer = null;
    return this;
};

Jelly.prototype.checkSpeechRecognizerStatus = function(){
    return !!this.speechRecognizer;
};


Jelly.prototype.getMostConfidentResult = function(results){
    var bestConfidenceIndex = -1;
    for (var i=0, bestConfidence=0; i<results.length; i++){
        if (results[i][0].confidence > bestConfidence){
            bestConfidence = results[i][0].confidence;
            bestConfidenceIndex = i;
        }
    }
    return results[bestConfidenceIndex];
};
Jelly.prototype.onSpeechFinalResult = function(finalResult){
    var result = this.execEventListenerByEventName(Jelly.EVENT_FINALRESULT, finalResult);
    if (!result)
        this.runCommand(finalResult);
};

Jelly.prototype.onSpeechResult = function(result){
    this.execEventListenerByEventName(Jelly.EVENT_RESULT, result);
};

Jelly.prototype.onStartSpeechResult = function(result){
    this.execEventListenerByEventName(Jelly.EVENT_STARTSPEECH, result);
};

Jelly.prototype.onEndSpeechResult = function(result){
    this.execEventListenerByEventName(Jelly.EVENT_ENDSPEECH, result);
};


Jelly.prototype.onSpeechResultMessage = function(speechText){
    this.execEventListenerByEventName(Jelly.EVENT_RESULT, speechText);
    if (this.modeNeedsToCallName){
        if (this.statusCalledMyName){
            this.analysisSpeechExpression(speechText);
        }else if (this.checkMyName(speechText)){
            //Check Listener Name
            this.startListenCommand();
            this.onSpeechResultMessage(speechText);
        }
        return;
    }else{
        this.analysisSpeechExpression(speechText);
    }
};

Jelly.prototype.onStopSpeech = function(){
    this.execEventListenerByEventName(Jelly.EVENT_STOPSPEECH, null);
};





Jelly.prototype.startListenCommand = function(){
    this.statusCalledMyName = true;
    var now = new Date().getTime();
    this.startTimeForCommand = now;
    this.lastTimeSpeechInput = now;
    //- Event
    document.body.style.backgroundColor = '#ee99cc';
    this.textToSpeech('왜 불러?');
    return this;
};
Jelly.prototype.stopListenCommand = function(){
    this.statusCalledMyName = false;
    var now = new Date().getTime();
    this.endTimeForCommand = now;
    //- Event
    document.body.style.backgroundColor = '#000000';
    return this;
};


Jelly.prototype.checkMyName = function(speechText){
    var result = speechText.indexOf(this.name) != -1;
    return result
};

Jelly.prototype.analysisSpeechExpression = function(speechText){
    var that = this;
    //Gether AnalysisResult
    var resultList = [];
    for (var runnerId in this.speechRunnerMap){
        var speechRunner = this.speechRunnerMap[runnerId];
        var parameter = speechRunner.analysis(speechText);
        if (parameter){
            var icon = speechRunner.parent;
            resultList.push({type:icon.commandName, parameter:parameter});
        }

    }
    //Run
    // console.error('Analysis SpeechExp Result>> ', resultList);
    getData(resultList).each(function(it){
        that.runCommand(it.commandName, it.parameter);
    });
    return resultList;
};
Jelly.prototype.match = function(object, condition){
    var result = null;
    if (object.script.trim() == condition.trim())
        result = {ya:true};
    return result;
};
Jelly.prototype.finishCommand = function(){
    return this;
};



Jelly.prototype.textToSpeech = function(text){
    var msg = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(msg);
    return this;
};







Jelly.checkElapsedTime = function(lastMilliSecondTime, validIntervalMilliSecondTime, checkingMilliSecondTime){
    checkingMilliSecondTime = (checkingMilliSecondTime === null || checkingMilliSecondTime === undefined) ? new Date().getTime() : checkingMilliSecondTime;
    var elapsedTime = Jelly.getElapsedTimeFrom(lastMilliSecondTime, checkingMilliSecondTime);
    var result = validIntervalMilliSecondTime < Math.abs(elapsedTime);
    return result;
};

Jelly.getElapsedTimeFrom = function(fromTime, checkingMilliSecondTime){
    var elapsedTime = checkingMilliSecondTime - fromTime;
    return elapsedTime;
}