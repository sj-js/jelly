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






/***************************************************************************
 *
 * WORK-ITEM
 *
 ***************************************************************************/
function WorkItem(func){
    this.modeEnable = true;
    this.func = null;
    this.cycleCount = WorkItem.CYCLE_NO_LIMIT;
    this.cycleTime = 1000;
    this.timeManExp = null;

    this.modeCheckTimeWithEndTime = false;
    this.modeIgnoreError = false;
    this.modeDirectStart = false;

    this.startTime = new Date().getTime();
    this.endTime = new Date().getTime();
    this.lastStartTime = new Date().getTime();
    this.timeForRun = 0;
    this.errorList = [];

    if (func)
        this.setFunc(func);
}
WorkItem.CYCLE_NO_LIMIT = -100;
WorkItem.CYCLE_NO_MORE = 0;
WorkItem.checkElapsedTime = function(compareTime, limitTime, standardTime){
    standardTime = (standardTime) ? standardTime : new Date().getTime();
    return limitTime < (standardTime - compareTime);
};

WorkItem.prototype.setEnable = function(modeEnable){
    this.modeEnable = modeEnable;
    return this;
};
WorkItem.prototype.setFunc = function(func){
    this.func = func;
    return this;
};
WorkItem.prototype.setCycle = function(cycleTime, cycleCount){
    this.setCycleTime(cycleTime ? cycleTime : 1000);
    this.setCycleCount(cycleCount ? cycleCount : WorkItem.CYCLE_NO_LIMIT);
    return this;
};
WorkItem.prototype.setCycleCount = function(cycleCount){
    this.cycleCount = cycleCount;
    return this;
};
WorkItem.prototype.setCycleTime = function(cycleTime){
    this.cycleTime = cycleTime;
    return this;
};
WorkItem.prototype.setTimeManExp = function(timeManExp){
    this.timeManExp = timeManExp;
    return this;
};
WorkItem.prototype.setModeDirectStart = function(modeDirectStart){
    if (modeDirectStart)
        this.startTime = 0;
    return this;
};




WorkItem.prototype.checkMoreWork = function(){
    var result = this.checkCycleCount() && (this.modeIgnoreError || (!this.modeIgnoreError && !this.hasError()));
    return result;
};
WorkItem.prototype.checkTime = function(standardTime){
    standardTime = (standardTime) ? standardTime : new Date().getTime();
    var result;
    var compareTime;
    if (this.timeManExp){
        result = WorkItem.validCycleTime(this.timeManExp, this.lastStartTime);
    }else{
        compareTime = (this.modeCheckTimeWithEndTime) ? this.endTime : this.startTime;
        result = this.cycleTime <= (standardTime - compareTime);
    }
    return result;
};
WorkItem.prototype.checkCycleCount = function(){
    if (this.cycleCount == WorkItem.CYCLE_NO_MORE)
        return false;
    return true;
};
WorkItem.prototype.hasError = function(){
    return this.errorList.length > 0;
};
WorkItem.prototype.run = function(){
    //Check
    if (!this.modeEnable)
        return false;
    if (!this.checkTime())
        return false;
    if (!this.checkCycleCount())
        return false;
    if (this.cycleCount != WorkItem.CYCLE_NO_LIMIT)
        --this.cycleCount;
    //Run
    try{
        this.startTime = new Date().getTime();
        this.lastStartTime = this.startTime;
        ++this.timeForRun;
        this.func();
        this.endTime = new Date().getTime();
    }catch(e){
        this.errorList.push(e);
        throw e
    }
    return true;
};





/*****************************************************************************************************
 *
 * < Time Range Checker >
 *  ※ TimeManDateExpression을 사용한다. (기본단위는 time / time은 점점(..)으로 범위지정 가능 / 쉼표(,) 로 기본 OR조건 열거 / 중괄호({}) 안에서 쉼표(,)는 AND조건 열거 / dayOfWeek()로 특정요일 조건 / time()으로 특정시간 조건 )
 *    - 시: 0 ~ 23
 *    - 분: 0 ~ 60
 *    - 요일: (일, 월, 화, 수, 목, 금, 토) or (SUN, MON, TUE, WED, THU, FRI, SAT) or (1, 2, 3, 4 ,5 ,6, 7) or (日, 月, 火, 水, 木, 金, 土) or ...
 *    - 예(특정시간)>
 *       11, 12, 13:10..15:30, 19..20, 21, 22
 *
 *    - 예(매일일과시간 + 주말은점심도)>
 *       time(9..11, 13..18), {dayOfWeek(토,일), time(11..13)}
 *
 *    - 예(월요일은무조건 + 화수목은일과시간 + 금요일은아침만)>
 *       dayOfWeek(월), {dayOfWeek(화,수,목), time(09:00..17:00)}, {dayOfWeek(금), time(09:00..11:00)}
 *
 *    - 예(주말은무조건 + 21,22시는항상 + 월수금은아침 + 화목은오후)>
 *       dayOfWeek(토,일), 21..22, {dayOfWeek(월,수,금), time(08:00..12:00)}, {dayOfWeek(화,목), time(14:00..18:00)}
 *
 *
 * < Time Cycle Checker >
 *  ※ 위의 Time Range Checker를 기반으로 cycle을 이용하여 실행시간을 관리할 수 있다.
 *    - 예(100초 마다)>
 *       cycle(100s)
 *
 *    - 예(30분 마다)>
 *       cycle(30m)
 *
 *    - 예(주말은무조건(5000ms마다) + 21,22시는항상(5000ms마다) + 월수금은 아침만(100s마다) + 화목은 오후만(특정시간마다))>
 *       dayOfWeek(토,일), 21..22, cycle(5000), {dayOfWeek(월,수,금), time(08:00..12:00), cycle(100s)}, {dayOfWeek(화,목), time(14:00..18:00), cycle(14:00, 15:20, 17:30)}
 *
 ******************************************************************************************************/
// static Map<String, Closure> timeManExpressionMethod
WorkItem.timeManExpressionMethodMap = {};
// static List<List<String>> sameMeaningDataForDayOfWeekList = [
WorkItem.sameMeaningDataForDayOfWeekList = [
    ['0', '일', '일요일', 'Sun', 'Sunday', 'Dom', 'Domingo', '日', '日曜日'],
    ['1', '월', '월요일', 'Mon', 'Monday', 'Lun', 'Lunes', '月', '月曜日'],
    ['2', '화', '화요일', 'Tue', 'Tuesday', 'Mar', 'Martes', '火', '火曜日'],
    ['3', '수', '수요일', 'Wed', 'Wednesday', 'Mié', 'Miércoles', '水', '水曜日'],
    ['4', '목', '목요일', 'Thu', 'Thursday', 'Jue', 'Jueves', '木', '木曜日'],
    ['5', '금', '금요일', 'Fri', 'Friday', 'Vie', 'Viernes', '金', '金曜日'],
    ['6', '토', '토요일', 'Sat', 'Saturday', 'Sáb', 'Sábado', '土', '土曜日'],
];
// WorkItem.getDayOfWeek = function(date){
//     date = date ? date : new Date();
//     return date.getDay();
// };
// WorkItem.getHours = function(date){
//     date = date ? date : new Date();
//     return date.getHours();
// };

WorkItem.validCycleTime = function(timeManExpression, lastStartTime, targetDate){
    targetDate = (targetDate) ? targetDate : new Date(); //NowDate
    return WorkItem.timeManExpressionAnyMatch(timeManExpression, targetDate, lastStartTime);
};

WorkItem.isInTime = function(timeManExpression, targetDate){
    targetDate = (targetDate) ? targetDate : new Date(); //NowDate
    return WorkItem.timeManExpressionAnyMatch(timeManExpression, targetDate, null);
};


WorkItem.timeManExpressionAnyMatch = function(timeManExpression, targetDate, lastStartTime){
    var timeRangeList = WorkItem.makeArgumentListByComma(timeManExpression);
    if (!timeRangeList)
        return true;
    for (var i=0, timeRange; i<timeRangeList.length; i++){
        timeRange = timeRangeList[i];
        // console.error(' ==>', timeRange);
        if (WorkItem.validateTimeManExpression(timeRange)){
            if (getData(timeRange).contains(['{', '}'])){
                if (WorkItem.timeManExpressionEveryMatch(timeRange.substring(1, timeRange.length -1), targetDate, lastStartTime))
                    return true;
            }else{
                if (WorkItem.runMethodByRange(timeRange, targetDate, lastStartTime))
                    return true;
            }
        }else{
            return false;
        }
    }
};

WorkItem.timeManExpressionEveryMatch = function(timeRangeToCheck, targetDate, lastStartTime){
    var timeRangeList = WorkItem.makeArgumentListByComma(timeRangeToCheck);
    if (!timeRangeList)
        return true;
    for (var i=0, timeRange; i<timeRangeList.length; i++){
        timeRange = timeRangeList[i];
        // console.error('  ==>', timeRange);
        if (WorkItem.validateTimeManExpression(timeRange)){
            if (getData(timeRange).contains(['{', '}'])){
                if (!WorkItem.timeManExpressionEveryMatch(timeRange.substring(1, timeRange.length -1), targetDate, lastStartTime))
                    return false;
            }else{
                if (!WorkItem.runMethodByRange(timeRange, targetDate, lastStartTime))
                    return false;
            }
        }else{
            return false;
        }
    }
    return true;
};

WorkItem.makeArgumentListByComma = function(arguments){
    arguments = arguments ? arguments : '';
    return arguments.split(/\s*,(?![^(]*\))(?![^{]*\})\s*/);
};

WorkItem.validateTimeManExpression = function(range){
    return (
        //Brace are paired ???
        getData(range).count('{') == getData(range).count('}')
        //Brace are paired ???
        && getData(range).count('(') == getData(range).count(')')
    )
};

WorkItem.runMethodByRange = function(range, targetDate, lastStartTime){
    var trimedRange = range ? range.trim() : range;
    var startBraceIndex = trimedRange.indexOf('(');
    var endBraceIndex = trimedRange.indexOf(')');
    var methodName;
    var arguments;
    var defaultMethodName = 'time';
    //Get Method Name
    //Get Arguments
    if (startBraceIndex != -1){
        methodName = trimedRange.substring(0, startBraceIndex);
        methodName = methodName ? methodName : defaultMethodName;
        arguments = range.substring(startBraceIndex +1, endBraceIndex);
    }else{
        methodName = defaultMethodName;
        arguments = trimedRange;
    }
    //Run
    return WorkItem.runMethod(methodName, {date:targetDate, lastStartTime:lastStartTime}, WorkItem.makeArgumentListByComma(arguments));
};

WorkItem.runMethod = function(name, data, argumentList){
    var closure = WorkItem.makeTimeManExpressionMethodClosureMap()[name];
    if (closure){
        return closure(data, argumentList);
    }else{
        console.error("There is no method [" +name+ "]");
        return false
    }
};

WorkItem.makeTimeManExpressionMethodClosureMap = function(){
    if (WorkItem.timeManExpressionMethod)
        return WorkItem.timeManExpressionMethod;
    WorkItem.timeManExpressionMethod = {
        time: function(data, timeRangeArgumentList){
            //Get Now
            var targetDate = data.date;
            var lastStartTime = data.lastStartTime;
            // var timeExpression = "${targetDate.get(Calendar.HOUR_OF_DAY)}:${targetDate.get(Calendar.MINUTE)}:${targetDate.get(Calendar.SECOND)}.${targetDate.get(Calendar.MILLISECOND)} ";
            var timeExpression = targetDate.getHours()+ ":" +targetDate.getMinutes()+ ":" +targetDate.getSeconds();
            var compareDate = WorkItem.generateCalendarTimeOnToday(timeExpression);
            //Check Now is in range
            return getData(timeRangeArgumentList).any(function(range){
                if (getData(range).contains("..")){
                    var timeList = range.split('..');
                    var fromDate = WorkItem.generateCalendarTimeOnToday(timeList[0]);
                    var toDate = WorkItem.generateCalendarTimeOnToday(timeList[1]);
                    if (fromDate < (toDate)){
                        //Example) 06:00..11:00
                        return compareDate > (fromDate) && compareDate < (toDate);
                    }else{
                        //Example) 08:00..03:00
                        return compareDate > (fromDate) || compareDate < (toDate);
                    }
                }else{
                    var specificDate = WorkItem.generateCalendarTimeOnToday(range);
                    return specificDate.getHours() == targetDate.getHours();
                }
            });
        },
        dayOfWeek: function(data, dayOfWeekArgumentList){
            //Get Now
            var targetDate = data.date;
            var lastStartTime = data.lastStartTime;
            var nowDayOfWeek = targetDate.getDay();
            //Check Now is in range
            return getData(dayOfWeekArgumentList).any(function(dayOfWeek){
                return WorkItem.isSameMeaning(WorkItem.sameMeaningDataForDayOfWeekList, nowDayOfWeek +'', dayOfWeek +'');
            });
        },
        cycle: function(data, cycleArgumentList){
            //Get Now
            var targetDate = data.date;
            var targetTime = targetDate.getTime();
            var lastStartTime = data.lastStartTime;
            var timeExpression = targetDate.getHours()+ ":" +targetDate.getMinutes()+ ":" +targetDate.getSeconds();
            var compareDate = WorkItem.generateCalendarTimeOnToday(timeExpression);
            //Check Now is in range
            return getData(cycleArgumentList).any(function(cycle){
                var colonCount = getData(cycle).count(":");
                if (0 < colonCount){
                    //특정시간
                    var specificDate = WorkItem.generateCalendarTimeOnToday(cycle);
                    var specificTime = specificDate.getTime();
                    if ((lastStartTime < specificTime) && (specificTime < targetTime)){
                        console.error(specificDate, targetDate, (lastStartTime < specificTime) && (specificTime < targetTime));
                    }
                    return (lastStartTime < specificTime) && (specificTime < targetTime);
                }else{
                    //주기적
                    var time = -1;
                    if (cycle.indexOf('ms') != -1){
                        time = parseInt(cycle) * 1;
                    }else if (cycle.indexOf('s') != -1){
                        time = parseInt(cycle) * 1000;
                    }else if (cycle.indexOf('m') != -1){
                        time = parseInt(cycle) * 1000 * 60;
                    }else if (cycle.indexOf('h') != -1){
                        time = parseInt(cycle) * 1000 * 60 * 60;
                    }else{
                        time = parseInt(cycle) * 1;
                    }
                    var nextTime = lastStartTime + time;
                    var elapsedTime = targetTime - nextTime;
                    // console.error(time, nextTime, elapsedTime, time <= elapsedTime);
                    return (time <= elapsedTime);
                }
            });
        }
    };
    return WorkItem.timeManExpressionMethod;
};

WorkItem.generateCalendarTimeOnToday = function(hourMinuteString){
    var hour = 0;
    var minute = 0;
    var second = 0;
    var millisecond = 0;
    var colonCount = getData(hourMinuteString).count(":");
    if (colonCount == 1){
        var hourMinuteArray = hourMinuteString.split(":");
        hour = parseInt( hourMinuteArray[0].trim() );
        minute = parseInt( hourMinuteArray[1].trim() );
    }else if (colonCount == 2){
        var hourMinuteArray = hourMinuteString.split(":");
        hour = parseInt( hourMinuteArray[0].trim() );
        minute = parseInt( hourMinuteArray[1].trim() );
        if (getData(hourMinuteArray[2]).contains('.')){
            var secondMillisecondArray = hourMinuteArray[2].split('.');
            second = parseInt( secondMillisecondArray[0].trim() );
            millisecond = parseInt( secondMillisecondArray[1].trim() );
        }else{
            second = parseInt( hourMinuteArray[2].trim() );
        }
    }else{
        hour = parseInt( hourMinuteString );
    }
    var today = new Date();
    var date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute, second, millisecond);
    return date
};


WorkItem.isSameMeaning = function(dataListCollection, a, b){
    a = a.toLowerCase();
    b = b.toLowerCase();
    var sameMeaningList;
    if (dataListCollection instanceof Array){
        for (var i=0; i<dataListCollection.length; i++){
            sameMeaningList = dataListCollection[i];
            var resultA = getData(sameMeaningList).find(function(it){ return it.toLowerCase() == a; });
            var resultB = getData(sameMeaningList).find(function(it){ return it.toLowerCase() == b; });
            if (resultA && resultB)
                return true;
        }
        return false;

    }else if (typeof dataListCollection == 'object'){
        for (var key in dataListCollection){
            sameMeaningList = dataListCollection[key];
            var resultA = getData(sameMeaningList).find(function(it){ return it.toLowerCase() == a; });
            var resultB = getData(sameMeaningList).find(function(it){ return it.toLowerCase() == b; });
            if (resultA && resultB)
                return true;
        }
        return false;
    }
    return false;
};