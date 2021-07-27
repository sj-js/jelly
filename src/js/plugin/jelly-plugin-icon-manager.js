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
Jelly.PluginIconManager = function(){
    this.event = new SjEvent();

    this.name = '';
    this.parent = null;
    this.statusSetuped = false;
    this.modePopStick = false;

    this.defaultClazz = [Jelly.PluginIconManager.CLASS_ICON_DEFAULT];

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
Jelly.PluginIconManager.COMMAND_NAME_FOR_OPEN = 'open-plugin-icon-manager';
Jelly.PluginIconManager.COMMAND_NAME_FOR_OPEN_SETUP_RUNNER = 'open-plugin-icon-manager-setup-runner';
Jelly.PluginIconManager.POP_ICON_MANAGER = 'pop-icon-manager';
Jelly.PluginIconManager.POP_ICON_MANAGER_SETUP_RUNNER = 'pop-icon-manager-setup-runner';
Jelly.PluginIconManager.BOX_ICON_LIST = 'box-icon-list';
Jelly.PluginIconManager.EVENT_JELLYICONMANAGER_SETUP = 'jellyiconmanagersetup';
Jelly.PluginIconManager.EVENT_JELLYICONMANAGER_AFTERPOP = 'jellyiconmanagerafterpop';

Jelly.PluginIconManager.CLASS_ICON_DEFAULT = 'jelly-plugin-icon-manager-default';
Jelly.PluginIconManager.CLASS_ICON_TOGGLE = 'jelly-plugin-icon-manager-toggle';



/**************************************************
 *
 * EVENT
 *
 **************************************************/
Jelly.PluginIconManager.prototype.addEventListener               = function(element, eventName, eventFunc){ return this.event.addEventListener(element, eventName, eventFunc); };
Jelly.PluginIconManager.prototype.addEventListenerByEventName    = function(eventName, eventFunc){ this.event.addEventListenerByEventName(eventName, eventFunc); return this; };
Jelly.PluginIconManager.prototype.hasEventListener               = function(element, eventName, eventFunc){ return this.event.hasEventListener(element, eventName, eventFunc); };
Jelly.PluginIconManager.prototype.hasEventListenerByEventName    = function(eventName, eventFunc){ return this.event.hasEventListenerByEventName(eventName, eventFunc); };
Jelly.PluginIconManager.prototype.hasEventListenerByEventFunc    = function(eventFunc){ return this.event.hasEventListenerByEventFunc(eventFunc); };
Jelly.PluginIconManager.prototype.removeEventListener            = function(element, eventName, eventFunc){ return this.event.removeEventListener(element, eventName, eventFunc); };
Jelly.PluginIconManager.prototype.removeEventListenerByEventName = function(eventName, eventFunc){ return this.event.removeEventListenerByEventName(eventName, eventFunc); };
Jelly.PluginIconManager.prototype.removeEventListenerByEventFunc = function(eventFunc){ return this.event.removeEventListenerByEventFunc(eventFunc); };
Jelly.PluginIconManager.prototype.execEventListener              = function(element, eventName, event){ return this.event.execEventListener(element, eventName, event); };
Jelly.PluginIconManager.prototype.execEventListenerByEventName   = function(eventName, event){ return this.event.execEventListenerByEventName(eventName, event); };



/**************************************************
 *
 * OPTION
 *
 **************************************************/
Jelly.PluginIconManager.prototype.setCycleTimeForStatusCheck = function(cycleTime){
    this.cycleTimeForStatusChecker = cycleTime;
    return this;
};
Jelly.PluginIconManager.prototype.setCustomChecker = function(checkerName, filter, func, cycleTime){
    this.checkerNameMap[checkerName] = {
        filter: filter,
        func: func,
        cycleTime: cycleTime
    };
    return this;
};


/**************************************************
 *
 * SETUP
 *
 **************************************************/
Jelly.PluginIconManager.prototype.setup = function(parent){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var menuman = parent.menuman;
    /** System Icon **/
    parent.setupSystemIcon([
        new Jelly.Icon(Jelly.PluginIconManager.COMMAND_NAME_FOR_OPEN)
            .setCommand(function(parameter){
                popman.popIfOff(Jelly.PluginIconManager.POP_ICON_MANAGER);
            })
            .setRunner([
                new Jelly.SpeechRunner(['아이콘창 열어', '아이콘관리창 열어']),
                new Jelly.KeyRunner([[KeyMan.SHIFT], [KeyMan.SHIFT]]),
            ])
    ]);
    /** User Icon **/
    parent.setupUserIcon([
        new Jelly.Icon('toggle-speech-recognizer').setTitle('음성인식기').setHTML('🎤').setClass(Jelly.PluginIconManager.CLASS_ICON_TOGGLE)
            .setCommand(function(parameter, resolve){
                parameter.status ? parent.stopSpeechRecognizer() : parent.startSpeechRecognizer();
                resolve();
            })
            .setModeStatusCheck(true, function(resolve){
                resolve(parent.checkSpeechRecognizerStatus());
            }),
    ]);
    /** Make Component **/
    ready(function(){
        that.makePopForIconManager();
        that.makePopForSetupRunner();
        that.makeContextMenuForIconManager();
        that.makeChecker();
        /** Make Key **/
        that.addDefaultShortcuts();
        that.addCommander();
    });
};
Jelly.PluginIconManager.prototype.start = function(){

};
Jelly.PluginIconManager.prototype.end = function(){

};
Jelly.PluginIconManager.prototype.dispose = function(){

};





Jelly.PluginIconManager.prototype.makeChecker = function(){
    var that = this;
    var parent = this.parent;
    /** Status Checker **/
    if (that.checkerNameMap){
        getData(that.checkerNameMap).each(function(checkerName, checkerObject){
            parent.addWork(new WorkItem().setEnable(true).setModeDirectStart(true).setCycle(checkerObject.cycleTime).setFunc(function(){
                var icons = parent.getIcons();
                if (checkerObject.filter)
                    icons = getEl(icons).find(checkerObject.filter);
                checkerObject.func(icons, function(statusMap){
                    for (var key in statusMap){
                        var status = statusMap[key];
                        var icon = parent.getIcon(key);
                        icon.status = Jelly.Icon.checkBooleanStatus(status);
                        icon.execEventListenerByEventName(Jelly.Icon.EVENT_CHANGESTATUS, icon);
                    }
                });
                //- URL Checker
                // if (that.customURLChecker){
                //     that.customURLChecker(icons, function(statusMap){
                //         for (var key in statusMap){
                //             var status = statusMap[key];
                //             var icon = parent.getIcon(key);
                //             icon.status = JellySpeaker.Icon.checkBooleanStatus(status);
                //             icon.execEventListenerByEventName(JellySpeaker.Icon.EVENT_CHANGESTATUS, icon);
                //         }
                //     });
                // }else{
                //     for (var ii=0, icon; ii<icons.length; ii++){
                //         icon = icons[ii];
                //         if (icon.url)
                //             continue;
                //         that.checkIconUrl(icon, function(icon){
                //             icon.execEventListenerByEventName(JellySpeaker.Icon.EVENT_CHANGESTATUS, icon);
                //         });
                //     }
                // }

            }));
        });
    }
    /** Status Checker **/
    parent.addWork(new WorkItem().setEnable(true).setModeDirectStart(true).setCycle(that.cycleTimeForStatusChecker).setFunc(function(){
        //- Custom Checker
        var iconListToCheckStatus = getData(icons).findAll(function(it){
            return it.modeStatusCheck;
        });
        getData(iconListToCheckStatus).each(function(it){
            it.checkStatus();
        });
    }));
    /** Custom Status Checker **/
    var icons = parent.getIcons();
    for (var ii=0, icon; ii<icons.length; ii++){
        icon = icons[ii];
        icon.addEventListenerByEventName(Jelly.Icon.EVENT_CHANGESTATUS, function(icon){
            that.styleIcon(icon);
        });
        icon.checkStatus();
    }
    // parent.addWork( new WorkItem().setEnable(true).setModeDirectStart(true).setCycle(that.cycleTimeForStatusChecker).setFunc(function(){
    //     var icons =  parent.getIcons();
    //     for (var ii=0, icon; ii<icons.length; ii++){
    //         icon = icons[ii];
    //         //Check
    //         var status = icon.checkStatus(icon);
    //     }
    // }) );
};



/*************************
 * ADD SHORTCUT
 *************************/
Jelly.PluginIconManager.prototype.addDefaultShortcuts = function(){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var menuman = parent.menuman;

    /** 개발툴창 임시로 보기 **/
    keyman.add({
        id:"pop_dev",
        name:'pop_dev',
        keys:[KeyMan.CTRL, KeyMan.SHIFT],
        keydown:function(){
            parent.runCommand(Jelly.PluginIconManager.COMMAND_NAME_FOR_OPEN);
            if (that.modePopStick)
                getEl('input-dev-search-all').focus();
            that.showPositionShorcutKey();
        },
        keyup:function(){
            that.hidePositionShortcutKey();
            if (!that.modePopStick)
                popman.close(Jelly.PluginIconManager.POP_ICON_MANAGER);
        }
    });

    /** 개발툴창 임시로 보기 기능 고정해보리기 **/
    keyman.add({
        id:"stick_dev",
        name:'stick_dev',
        keys:[KeyMan.SPACE],
        keydown:function(){
            console.error("Check >", keyman.isOn('pop_dev'));
            if (keyman.isOn('pop_dev')){
                that.modePopStick = (that.modePopStick) ? false : true;
                if (that.modePopStick)
                    getEl('input-dev-search-all').focus();
            }
        }
    });

    for (var i=0, cnt; i<9; i++){ //TODO: 이상하게 (CTRL + SHIFT + 0)은 안된다.
        cnt = (i+1);
        keyman.add({
            id:'position-shortcut-' +cnt,
            name:'position-shortcut-' +cnt,
            keys:'CTRL + SHIFT + ' +((cnt == 10) ? 0 : cnt),
            data:{
                index: i
            },
            keydown:function(data){
                var icon = that.getUserIconByOrder(data.index);
                icon.runCommand();
            },
            keyup:function(){
            }
        });
    }
};

/*************************
 * ADD COMMANDER
 *************************/
Jelly.PluginIconManager.prototype.addCommander = function(){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var menuman = parent.menuman;

    keyman.add({
        name: 'test',
        keys: [['shift'], ['shift']],
        execute: function(e){
            parent.runCommand(Jelly.PluginIconManager.COMMAND_NAME_FOR_OPEN);
        }
    });

    // keyman
    //     .addCommander('1p')
    //     .setUp(['w']).setDown(['s']).setLeft(['a']).setRight(['d']).setButtonA(['t']).setButtonB(['SHIFT']).setButtonC(['g']).setButtonD(['h'])
    //     .addCommandMap({
    //         'uppercut': [KeyMan.RIGHT, KeyMan.DOWN, KeyMan.DOWNRIGHT, KeyMan.RIGHT, KeyMan.B],
    //         'rabekku': [KeyMan.LEFT, KeyMan.RIGHT, KeyMan.A],
    //         'dropkick': [KeyMan.RIGHT, KeyMan.RIGHT, KeyMan.D],
    //         'openDevTool': [KeyMan.B, KeyMan.B]
    //     })
    //     .addCommandEventMap({
    //         'dropkick': function(){
    //             // toggleModeMetaDev();
    //             console.log('dropkick!');
    //         },
    //         'openDevTool': function(){
    //             parent.runCommand(Jelly.PluginIconManager.COMMAND_NAME_FOR_OPEN);
    //         }
    //     });

    //TODO: Commander 직관화
    //TODO: KeyMan Context 전환

    // keyman
    //     .addCommandMap({
    //         'hello': [KeyMan.N1, KeyMan.N2, KeyMan.N3],
    //         'hello': [KeyMan.N1, KeyMan.N2, KeyMan.N3],
    //     })
    //     .addCommandEventMap({
    //         'hello': function(){
    //             console.log('dropkick!');
    //         },
    //         'hello2': function(){
    //             console.log('dropkick2!');
    //         }
    //     })
    //
    // keyman
    //     .addCommander('1p')
    //     .setUp(['w']).setDown(['s']).setLeft(['a']).setRight(['d']).setButtonA(['t']).setButtonB(['SHIFT']).setButtonC(['g']).setButtonD(['h'])
    //     .addCommandMap({
    //         'uppercut': [KeyMan.RIGHT, KeyMan.DOWN, KeyMan.DOWNRIGHT, KeyMan.RIGHT, KeyMan.B],
    //         'rabekku': [KeyMan.LEFT, KeyMan.RIGHT, KeyMan.A],
    //         'dropkick': [KeyMan.RIGHT, KeyMan.RIGHT, KeyMan.D],
    //         'openDevTool': [KeyMan.B, KeyMan.B]
    //     })
    //     .addCommandEventMap({
    //         'dropkick': function(){
    //             // toggleModeMetaDev();
    //             console.log('dropkick!');
    //         },
    //         'openDevTool': function(){
    //             parent.runCommand(JellySpeaker.PluginIconManager.COMMAND_NAME_FOR_OPEN);
    //         }
    //     });
};






Jelly.PluginIconManager.prototype.setupIcon = function(icon){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var objElement = getEl(boxman.newObj())
        .addClass(that.defaultClazz)
        .addClass(icon.clazz)
        .style('display:inline-block; width:100px; height:100px; overflow:hidden;')
        .html(icon.html + icon.title)
        .addEventListener('click', function(event){
            try{
                icon.runCommand();
            }catch(ex){
                console.error(ex);
            }
        })
        .returnElement();
    icon.objElement = objElement;
    return objElement;
};



Jelly.PluginIconManager.prototype.getIcon = function(param){
    if (typeof param == 'string'){
        return this.getIconById(param);
    }else if (param instanceof Element){
        return this.getIconByEl(param);
    }else if (param instanceof Jelly.Icon){
        return param;
    }else{
        var resultList = this.getObjsByCondition(param);
        if (resultList != null && resultList.length > 0)
            return resultList[0];
    }
    return;
};
Jelly.PluginIconManager.prototype.getIcons = function(){
    return this.iconList;
}
Jelly.prototype.getIconsByCondition = function(condition){
    var resultList = [];
    var iconList = this.parent.iconList;
    // for (var boxName in iconList){
    //     var obj = iconList[boxName];
    //     var result = getEl(obj).find(condition);
    //     if (result)
    //         resultList.push(result);
    // }
    for (var i=0; i<iconList; i++){
        var icon = iconList[i];
        var result = getEl(icon).find(condition);
        if (result)
            resultList.push(result);
    }
    return resultList;
};
Jelly.PluginIconManager.prototype.getIconById = function(id){
    var objElement = document.getElementById(id);
    // var icon = this.iconList[objElement.manid];
    // return icon;

    return this.getIconByEl(objElement);
};
Jelly.PluginIconManager.prototype.getIconByEl = function(element){
    var iconList = this.parent.iconList;
    // if (element && element.manid){
    //     var manid = element.manid;
    //     var icon = iconList[manid];
    //     return icon;
    // }

    for (var i=0, icon; i<iconList.length; i++){
        icon = iconList[i];
        if (icon.objElement && icon.objElement === element){
            return icon;
        }
    }
    return null;
};
Jelly.PluginIconManager.prototype.getUserIconByOrder = function(index){
    var that = this;
    var parent = this.parent;
    var objList = parent.boxman.getObjListByBox(Jelly.PluginIconManager.BOX_ICON_LIST);
    console.error(index, objList);
    return (objList.length > index) ? that.getIcon(objList[index].element) : null;
};


Jelly.PluginIconManager.prototype.removeIcon = function(param){
    var icon = this.getIcon(param);
    this.parent.boxman.delObj(icon.objElement);
    icon.removeFromParent();
    return this;
};
Jelly.PluginIconManager.prototype.delIcon = Jelly.PluginIconManager.prototype.removeIcon;



Jelly.PluginIconManager.prototype.setupRunner = function(icon){
    var that = this;
    var parent = that.parent;
    var runnerList = icon.runnerList;
    for (var i=0, runner; i<runnerList.length; i++){
        runner = runnerList[i];
        if (runner instanceof Jelly.KeyRunner){
            runner.setup(parent);
        }else if (runner instanceof Jelly.SpeechRunner){
            runner.setup(parent);
        }else if (runner instanceof Jelly.ScheduleRunner){
            runner.setup(parent);
        }else{
            //What?
        }
    }
};




/****************************************************************************************************
 *
 * POP - ICON MANAGER
 *
 ****************************************************************************************************/
Jelly.PluginIconManager.prototype.makePopForIconManager = function(){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var menuman = parent.menuman;

    /*************************
     * Make Pop - ICON-MANAGER
     *************************/
    var popElementForIconManager = popman.add(popman.new({
        id: Jelly.PluginIconManager.POP_ICON_MANAGER,
        exp: '85%',
        closebyesc: true,
        closebyclickout: true,
        afterpop: function(data){
            parent.execEventListenerByEventName(Jelly.PluginIconManager.EVENT_JELLYICONMANAGER_AFTERPOP, popElementForIconManager);
        }
    }));

    /*************************
     * Make Box
     *************************/
    var boxElement = boxman.newBox({id:Jelly.PluginIconManager.BOX_ICON_LIST, width:'90%', height:'300px'});
    boxman.setBoxMode(Jelly.PluginIconManager.BOX_ICON_LIST, {appendType:BoxMan.APPEND_TYPE_BETWEEN});

    getEl(popElementForIconManager)
        .setStyle('text-align', 'center')
        .setStyle('font-family', 'monospace')
        .add([
            getEl(boxElement)
                .setStyle('display', 'inline-block')
                .setStyle('text-align', 'left')
        ])
    ;

    /*************************
     * Make Obj - ICON
     *************************/
    for (var i=0, icon, objElement; i<parent.iconList.length; i++){
        icon = parent.iconList[i];
        if (!icon.modeVisible)
            continue;
        if (icon.modeSystem)
            continue;
        //- Make OBJ Element
        objElement = that.setupIcon(icon);
        getEl(objElement).appendTo(boxElement);
        popman.setPreview(objElement, {content:(icon.html+ ' ' + icon.title +' / '+ icon.command)});
        //- Set Runner
        that.setupRunner(icon);
    }

    /** Event **/
    parent.execEventListenerByEventName(Jelly.PluginIconManager.EVENT_JELLYICONMANAGER_SETUP, popElementForIconManager);
};

Jelly.PluginIconManager.prototype.makeContextMenuForIconManager = function(icon){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var menuman = parent.menuman;
    /*************************
     * Make ContextMenu
     *************************/
    menuman.addMenuBoard(
        new MenuMan.MenuBoard('jelly-icon')
            .setElementMatchCondition({'class':'*jelly*'})
            .setMenus('icon-setup-runner', 'icon-enable', 'icon-disable', 'icon-delete')
    )
    menuman.addMenu(
        new MenuMan.Menu('icon-setup-runner').setTitle('Setup Runner').setRunHandler(function(dbItem){
            var icon = that.getIcon(dbItem);
            that.currentSetupRunnerIcon = icon;
            popman.pop(Jelly.PluginIconManager.POP_ICON_MANAGER_SETUP_RUNNER, function(data){

            });
            //OK =>
            // var somethingObject;
            // var icon = that.getIcon(dbItem);
            // icon.setupRunner(somethingObject);
            // console.error(icon);
        }),
        new MenuMan.Menu('icon-enable').setTitle('Enable').setRunHandler(function(event){
            var dbItem = event.target;
            var icon = that.getIcon(dbItem);
            icon.setModeEnable(true);
        }),
        new MenuMan.Menu('icon-disable').setTitle('Disable').setRunHandler(function(event){
            var dbItem = event.target;
            var icon = that.getIcon(dbItem);
            icon.setModeEnable(false);
        }),
        new MenuMan.Menu('icon-delete').setTitle('Delete').setRunHandler(function(event){
            var dbItem = event.target;
            var icon = that.getIcon(dbItem);
            popman.confirm('Are you sure to delete icon?' +icon.title, function(){
                that.removeIcon(dbItem);
                return true;
            });
        })
    )
};




/****************************************************************************************************
 *
 * POP - SETUP RUNNER
 *
 ****************************************************************************************************/
Jelly.PluginIconManager.prototype.makePopForSetupRunner = function(){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var menuman = parent.menuman;

    var contextForSetupRunner = newEl('div').addClass('jelly-icon-manager-setup-runner').returnElement();
    var contextForTitle = newEl('div').html('<span class="label-pop">Runner</span>').style('text-align:left;').returnElement();
    var divForDescription = newEl('div').returnElement();
    var divListForKeyShortcutRunner = newEl('div').addClass('item-list').returnElement();
    var divListForKeyCommandRunner = newEl('div').addClass('item-list').returnElement();
    var divListForSpeechRunner = newEl('div').addClass('item-list').returnElement();
    var divListForScheduleRunner = newEl('div').addClass('item-list').returnElement();
    var contextForKeyShortcutRunner = newEl('div').html('<span class="label-list">ShortcutKey Runner</span>').style('display:inline-block; text-align:left; width:90%;').returnElement();
    var contextForKeyCommandRunner = newEl('div').html('<span class="label-list">CommandKey Runner</span>').style('display:inline-block; text-align:left; width:90%;').returnElement();
    var contextForSpeechRunner = newEl('div').html('<span class="label-list">Speech Runner</span>').style('display:inline-block; text-align:left; width:90%;').returnElement();
    var contextForScheduleRunner = newEl('div').html('<span class="label-list">Schedule Runner</span>').style('display:inline-block; text-align:left; width:90%;').returnElement();

    /*************************
     * Make Pop - ICON-MANAGER-SETUP-RUNNER
     *************************/
    var popElementForIconManagerSetupRunner = popman.add(popman.new({
        id: Jelly.PluginIconManager.POP_ICON_MANAGER_SETUP_RUNNER,
        exp: '65%',
        closebyesc: true,
        closebyclickout: true,
        add: function(data){
        },
        afterpop: function(data){
            var icon = that.currentSetupRunnerIcon;
            //Runner Title
            getEl(divForDescription).html(icon.title);
            //Runner Item 구성
            getEl(divListForKeyShortcutRunner).html('');
            getEl(divListForKeyCommandRunner).html('');
            getEl(divListForSpeechRunner).html('');
            getEl(divListForScheduleRunner).html('');

            console.error(icon.runnerList);
            for (var i=0; i<icon.runnerList.length; i++){
                var runner = icon.runnerList[i];
                if (runner instanceof Jelly.KeyRunner){
                    var inputElement = newEl('input', {'type':'text'}).returnElement();
                    keyman.addShortcutInput(inputElement);
                    keyman.setShortcutInputValue(inputElement, runner.keyList);
                    getEl(divListForKeyShortcutRunner).add(inputElement);
                }else if (runner instanceof Jelly.SpeechRunner){
                    var inputElement = newEl('input', {'type':'text'}).value(runner.speechExpression).returnElement();
                    getEl(divListForSpeechRunner).add(inputElement);
                }else if (runner instanceof Jelly.ScheduleRunner){
                    var inputElement = newEl('input', {'type':'text'}).value(runner.timeManExpression).returnElement();
                    getEl(divListForScheduleRunner).add(inputElement);
                }else{
                    //What?
                }
            }
        }
    }));

    getEl(popElementForIconManagerSetupRunner).style('text-align:center;').add([
        getEl(contextForSetupRunner).add([
            getEl(contextForTitle).add(divForDescription),
            newEl('div').add([
                newEl('button').html('+ShortcutKey').addEventListener('click', function(e){
                    getEl(divListForKeyShortcutRunner).add([
                        newEl('div').add( keyman.newShortcutInput() )
                    ]);
                }),
                newEl('button').html('+CommandKey').addEventListener('click', function(e){
                    getEl(divListForKeyCommandRunner).add([
                        newEl('div').add( keyman.newCommandInput() )
                    ]);
                }),
                newEl('button').html('+Speech').addEventListener('click', function(e){
                    getEl(divListForSpeechRunner).add([
                        newEl('div').add( newEl('input') )
                    ]);
                }),
                newEl('button').html('+Schedule').addEventListener('click', function(e){
                    getEl(divListForScheduleRunner).add([
                        newEl('div').add( newEl('input') )
                    ]);
                })
            ]),
            getEl(contextForKeyShortcutRunner).add([divListForKeyShortcutRunner]),
            getEl(contextForKeyCommandRunner).add([divListForKeyCommandRunner]),
            getEl(contextForSpeechRunner).add([divListForSpeechRunner]),
            getEl(contextForScheduleRunner).add([divListForScheduleRunner]),
            newEl('div').style('display:inline-block; text-align:center; width:90%;').add([
                newEl('button').html('O').style('width:200px; height:50px;').addEventListener('click', function(e){
                    that.saveToStorage(that.currentSetupRunnerIcon);
                    popman.close(popElementForIconManagerSetupRunner);
                }),
                newEl('button').html('X').style('width:200px; height:50px;').addEventListener('click', function(e){
                    popman.close(popElementForIconManagerSetupRunner);
                })
            ])
        ])
    ]);
};










/**************************************************
 *
 * CHECKER - SETUP RUNNER
 *
 **************************************************/
Jelly.PluginIconManager.prototype.checkIconUrl = function(icon, callback){
    var that = this;
    this.checkUrl(icon.url, function(event, elapsedTime){
        //- Check Status
        if ((status != 404 && event.currentTarget.status != 0) || (event.currentTarget.status == 0 && elapsedTime < 1000)){
            icon.status = Jelly.Icon.STATUS_ON;
        }else{
            icon.status = Jelly.Icon.STATUS_OFF;
        }
        if (callback)
            callback(icon);
    });
};
Jelly.PluginIconManager.prototype.checkUrl = function(url, callback){
    var time = new Date().getTime();
    var http = new XMLHttpRequest();
    http.open('POST', url, true);
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.onreadystatechange = function(event){
        var elaspedTime = new Date().getTime() - time;
        console.log('Elasped Time => ', url, event.currentTarget.status, elaspedTime);
        if (callback)
            callback(event, elaspedTime);
    };
    http.send(null);
};
Jelly.PluginIconManager.prototype.styleIcon = function(icon){
    var that = this;
    //- Style Status
    if (icon.lastStatus != icon.status){
        // console.log('CHECKING..', icon.url, event.currentTarget.status, icon.status, icon.objElement);
        // icon.execEvent('changestatus', icon.status);
        if (icon.objElement){
            getEl(icon.objElement).removeClass([that.classForIconStatusOn, that.classForIconStatusOff]);
            if (icon.status == Jelly.Icon.STATUS_ON){
                // console.error('ON');
                getEl(icon.objElement).addClass(that.classForIconStatusOn);
            }else if (icon.status == Jelly.Icon.STATUS_OFF){
                // console.error('OFF');
                getEl(icon.objElement).addClass(that.classForIconStatusOff);
            }else if (icon.status == Jelly.Icon.STATUS_PENDING){
                // console.error('OFF');
                getEl(icon.objElement).addClass(that.classForIconStatusOff);
            }
        }
    }
    icon.lastStatus = icon.status;
};




/**************************************************
 *
 * Position ShortcutKey
 *
 **************************************************/
Jelly.PluginIconManager.prototype.showPositionShorcutKey = function(){
    var that = this;
    var parent = this.parent;
    var highestZIndex = getData().findHighestZIndex();
    for (var i=0, icon, order=0; i<parent.iconList.length; i++){
        icon = parent.iconList[i];
        if (!icon.objElement)
            continue;
        if (++order > 9)
            break;
        var clientRect = getEl(icon.objElement).getBoundingClientRect();
        var scrollX = getEl().getBodyScrollX();
        var scrollY = getEl().getBodyScrollY();
        var elementForPositionShortcutKey = newEl('div').html(order == 10 ? 0 : order)
            .addClass('jelly-plugin-icon-manager-position-shortcut')
            .setStyle('position', 'absolute')
            .setStyle('left', (clientRect.left +scrollX -(10))+ 'px')
            .setStyle('top', (clientRect.top +scrollY +(clientRect.height/8))+ 'px')
            .setStyle('zIndex', highestZIndex)
            .returnElement();
        that.elementForPositionShortcutKeyList.push(elementForPositionShortcutKey);
        getEl(document.body).add(elementForPositionShortcutKey);

        //- Show KeyRunner
        // var runnerList = icon.getKeyRunnerList();
        // for (var jj=0, runner; jj<runnerList.length; jj++){
        //     runner = runnerList[jj];
        //     var elementForRunner = newEl('div').html(runner.getExpression())
        //         .addClass('jelly-plugin-icon-manager-key-runner')
        //         .setStyle('position', 'absolute')
        //         .setStyle('left', (clientRect.left -(10))+ 'px')
        //         .setStyle('top', (clientRect.top +(clientRect.height/8) +30)+ 'px')
        //         .setStyle('zIndex', highestZIndex)
        //         .returnElement();
        //     getEl(document.body).add(elementForRunner);
        // }
        // // console.error(icon.objElement, clientRect);
        //
        // //- Show ScheduleRunner
        // var runnerList = icon.getScheduleRunnerList();
        // for (var jj=0, runner; jj<runnerList.length; jj++){
        //     runner = runnerList[jj];
        //     var elementForRunner = newEl('div').html(runner.getRemainingTime())
        //         .addClass('jelly-plugin-icon-manager-key-runner')
        //         .setStyle('position', 'absolute')
        //         .setStyle('left', (clientRect.left -(10))+ 'px')
        //         .setStyle('top', (clientRect.top +(clientRect.height/8) +30)+ 'px')
        //         .setStyle('zIndex', highestZIndex)
        //         .returnElement();
        //     getEl(document.body).add(elementForRunner);
        // }
    }
};
Jelly.PluginIconManager.prototype.hidePositionShortcutKey = function(){
    var that = this;
    var parent = this.parent;
    for (var i=0, elemenetForPositionShortcut; i<this.elementForPositionShortcutKeyList.length; i++){
        elemenetForPositionShortcut = this.elementForPositionShortcutKeyList[i];
        getEl(elemenetForPositionShortcut).removeFromParent();
    }
    this.elementForPositionShortcutKeyList = [];
};






















/**************************************************
 *
 * SAVE & LOAD
 *
 **************************************************/
Jelly.PluginIconManager.prototype.saveIcon = function(){
    this.saveCustomShortcutList();
    this.resetIcon();
    return this;
};
Jelly.PluginIconManager.prototype.resetIcon = function(){
    this.clearCustomShortcutList();
    this.loadCustomShortcutList();
    return this;
};



Jelly.PluginIconManager.prototype.saveCustomShortcutList = function(){
    var that = this;
    var parent = that.parent;

    var dataToSave = {
        iconMap: {}
    };

    //- Make data to save
    for (var i=0, icon, iconDataToSave; i<parent.iconList.length; i++){
        icon = parent.iconList[i];
        if (icon.modeSystem)
            continue;
        //필요없는 필드 삭제
        iconDataToSave = dataToSave.iconMap[icon.id] = {};
        Object.assign(iconDataToSave, icon);
        delete iconDataToSave.parent;
        delete iconDataToSave.objElement;
        for (var j=0, runner; j<iconDataToSave.runnerList.length; j++){
            runner = iconDataToSave.runnerList[j];
            delete runner.parent;
        }
    }

    //- Save data
    console.log('save data', dataToSave);
    storageman.set(parent.storagePath, dataToSave);
};
Jelly.PluginIconManager.prototype.loadCustomShortcutList = function(){
    var that = this;
    var parent = that.parent;

    //- Load data
    var dataToLoad = storageman.get(parent.storagePath);
    console.log('load data', dataToLoad);
    return;

    //- Make
    var iconMap = dataToLoad.iconMap;
    for (var iconId in iconMap){
        var icon = iconMap[iconId];
        parent.userIconMap[iconId] = icon;
    }

    //- Setup Icon
    for (var i=0, icon; i<parent.iconList.length; i++){
        icon = parent.iconList[i];
        //- Setup Runner
        var runnerList = icon.runnerList;
        for (var ii=0, runner; ii<runnerList.length; ii++){
            runner = runnerList[ii];
            if (runner instanceof Jelly.KeyRunner){
                runner.setupShortcut(parent);
            }else if (runner instanceof Jelly.SpeechRunner){
                runner.setupSpeech(parent);
            }else if (runner instanceof Jelly.ScheduleRunner){
                runner.setupSchedule(parent);
            }else{
                //What?
            }
        }
    }
};
Jelly.PluginIconManager.prototype.clearCustomShortcutList = function(){
    var that = this;
    var parent = that.parent;
    //Clear Obj
    boxman.clearBox(Jelly.PluginIconManager.BOX_ICON_LIST);
    //Clear Runner
    for (var i=0, icon; i<parent.iconList.length; i++){
        icon = parent.iconList[i];
        var runnerList = icon.runnerList;
        for (var ii=0, runner; ii<runnerList.length; ii++){
            runner = runnerList[ii];
            if (runner instanceof Jelly.KeyRunner){
                this.delShortcut(runner.key)
            }else if (runner instanceof Jelly.SpeechRunner){
                this.delSpeech();
            }else if (runner instanceof Jelly.ScheduleRunner){
                this.delSchedule();
            }else{
                //What?
            }
        }
    }
};



Jelly.PluginIconManager.prototype.setupShortcut = function(key){
    keyman.add(key);
};
Jelly.PluginIconManager.prototype.setupSpeech = function(key){

};
Jelly.PluginIconManager.prototype.setupSchedule = function(key){

};

Jelly.PluginIconManager.prototype.delShortcut = function(key){
    keyman.delShortcut(key);
};
Jelly.PluginIconManager.prototype.delSpeech = function(key){

};
Jelly.PluginIconManager.prototype.delSchedule = function(key){

};







