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
 * Jelly - Command Listener
 *
 ***************************************************************************/
Jelly.PluginAlarmManager = function(){
    this.name = '';
    this.parent = null;
    this.statusSetuped = false;
};
Jelly.PluginAlarmManager.SYSTEM_ICON_ID_TO_OPEN = 'open-plugin-alarm-manager';
Jelly.PluginAlarmManager.USER_ICON_ID_TO_OPEN = 'open-alarm-manager';
Jelly.PluginAlarmManager.POP_MANAGER = 'pop-alarm-manager';



Jelly.PluginAlarmManager.prototype.setup = function(parent){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var menuman = parent.menuman;
    /** System Icon **/
    parent.setupSystemIcon([
        new Jelly.Icon(Jelly.PluginAlarmManager.SYSTEM_ICON_ID_TO_OPEN).setCommand(function(){
            popman.pop(Jelly.PluginAlarmManager.POP_MANAGER);
        })
    ]);
    /** User Icon **/
    parent.setupUserIcon([
        new Jelly.Icon(Jelly.PluginAlarmManager.USER_ICON_ID_TO_OPEN).setTitle('알람 설정').setHTML('⏰').setCommand(Jelly.PluginAlarmManager.SYSTEM_ICON_ID_TO_OPEN).setRunner([
        ]),
    ]);
    /** Make Component **/
    ready(function(){
        that.makePopForAlarmManager();
    });

};
Jelly.PluginAlarmManager.prototype.start = function(){

};
Jelly.PluginAlarmManager.prototype.end = function(){

};
Jelly.PluginAlarmManager.prototype.dispose = function(){

};






/**************************************************
 *
 * POP - ALARM-MANAGER
 *
 **************************************************/
Jelly.PluginAlarmManager.prototype.makePopForAlarmManager = function(){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var menuman = parent.menuman;

    /*************************
     * Make Pop - ALARM-MANAGER
     *************************/
    var popElementForManager = popman.add(popman.new({
        id: Jelly.PluginAlarmManager.POP_MANAGER,
        exp: '95%',
        closebyesc: true,
        closebyclickout: true,
        afterpop: function(data){

        }
    }));
};



/**
 * Created by sujkim on 2017-08-14.
 */
/*************************
 *
 *  tool-dev-alarm 의 핵심 컨텍스트
 *
 *************************/
alarmContext = {
    modePop:true,
    modeTTS:true,
    modeNotification:true,
    checkMilliSecond: 20 * (1000),
    checkAfterMilliSecond: 5 * (60 * 1000),
    checkBeforeMilliSecond: 0,
    plans: {
        '11:30:00':{message:'점심시간 30분전.'},
        '11:50:00':{message:'점심시간 10분전.'},
        '12:00:00':{message:'값진 식사&휴식 시간'},
        '17:50:00':{message:'퇴근시간 10분전. 다 같이 퇴근할 수 있도록 노력합시다.'},
        '18:00:00':{message:'퇴근하십쇼.'},
        '18:30:00':{message:'퇴근시간을 초과했습니다.'},
        '21:00:00':{message:'저녁 9시입니다.'}
    },
    timer: 0,
    icon: getData().getContextPath()+ '/common/images/ds_favicon.ico'
};

/*****
 * Run Alarm
 *****/
function runAlarmTimer(){
    var looper = function(){
        //Validation - Check Progressing Plan (Has Today's plan?)
        var plans = alarmContext.plans;
        var planedTime = storageman.get('meta.dev.alarm.time');
        var progressingPlans = storageman.parse('meta.dev.alarm.plans');
        if (isToday(planedTime)){
            if (!progressingPlans){
                storageman.set('meta.dev.alarm.plans', plans);
            }else{
                for (var keyTime in plans){
                    var progPlan = progressingPlans[keyTime];
                    var setedPlan = plans[keyTime];
                    //Edit Plan
                    if (progPlan && setedPlan){
                        progPlan.message = setedPlan.message;
                        //New Plan
                    }else if (!progPlan && setedPlan){
                        progressingPlans[keyTime] = setedPlan;
                    }
                }
                for (var keyTime in progressingPlans){
                    var progPlan = progressingPlans[keyTime];
                    var setedPlan = plans[keyTime];
                    //Delete Plan
                    if (progPlan && !setedPlan){
                        delete progressingPlans[keyTime];
                    }
                }
                //Save to LocalStorage
                storageman.set('meta.dev.alarm.plans', progressingPlans);
            }
        }else{
            var nowTime = new Date().getTime();
            storageman.set('meta.dev.alarm.time', nowTime);
            storageman.set('meta.dev.alarm.plans', plans);
        }
        progressingPlans = storageman.parse('meta.dev.alarm.plans');

        //Check Time
        var plan = getSoonPlanObject(progressingPlans);
        if (plan){
            //Save Status Flag - isNotificated
            plan.isNotificated = true;
            storageman.set('meta.dev.alarm.plans', progressingPlans);
            //Alert
            if (alarmContext.modePop)
                alertPop('[' +plan.time+ '] ' +plan.message);
            if (alarmContext.modeNotification)
                alertNotification(plan.time, plan.message, alarmContext.icon);
            if (alarmContext.modeTTS)
                alertTTS(plan.message);
        }
        //Check Exit Loop
        if (alarmContext.timer == null)
            return false;
        alarmContext.timer = setTimeout(looper, alarmContext.checkMilliSecond);
    };
    looper();
}

function getSoonPlanObject(plans){
    for (var key in plans){
        var plan = plans[key];
        var t = key.split(':');
        var planDate = new Date();
        planDate.setHours(t[0]);
        planDate.setMinutes(t[1]);
        planDate.setSeconds(t[2]);
        if (!plan.isNotificated && isValidTime(planDate, alarmContext.checkAfterMilliSecond, alarmContext.checkBeforeMilliSecond)){
            plan.time = key;
            return plan;
        }
    }
    return null;
}

function isToday(planedTime){
    var todayDate = new Date();
    var planedDate;
    if (planedTime){
        if (typeof planedTime == 'string'){
            planedDate = new Date(parseInt(planedTime));
        }
    }
    return planedDate && planedDate.getDay() == todayDate.getDay() && planedDate.getMonth() == todayDate.getMonth() && planedDate.getYear() == todayDate.getYear();
}

function isValidTime(planDate, checkAfterMilliSecond, checkBeforeMilliSecond){
    var nowDate = new Date();
    if (typeof planDate == 'string'){
        planDate = new Date(planDate);
    }
    var calDate = planDate.getTime() - nowDate.getTime();
    if (checkAfterMilliSecond && calDate <= 0 && Math.abs(calDate) < checkAfterMilliSecond){
        return true;;
    }else if (checkBeforeMilliSecond && calDate > 0 && calDate < checkBeforeMilliSecond){
        return true;
    }
    return false;
}
