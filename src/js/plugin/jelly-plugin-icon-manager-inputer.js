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
        newEl = crossman.newEl,
        getEl = crossman.getEl,
        SjEvent = crossman.SjEvent
    ;
}catch(e){}

/***************************************************************************
 *
 * Jelly - Command Listener
 *
 ***************************************************************************/
Jelly.PluginIconManagerInputer = function(){
    this.event = new SjEvent();

    this.name = '';
    this.parent = null;
    this.statusSetuped = false;

    this.lastSearchWord = null;
    this.searchingResultMap = {};
    this.funcList = [];
    this.repoList = [];
};
Jelly.PluginIconManagerInputer.EVENT_LOADSEARCHDATA = 'loadsearchdata';



/**************************************************
 *
 * EVENT
 *
 **************************************************/
Jelly.PluginIconManagerInputer.prototype.addEventListener               = function(element, eventName, eventFunc){ return this.event.addEventListener(element, eventName, eventFunc); };
Jelly.PluginIconManagerInputer.prototype.addEventListenerByEventName    = function(eventName, eventFunc){ this.event.addEventListenerByEventName(eventName, eventFunc); return this; };
Jelly.PluginIconManagerInputer.prototype.hasEventListener               = function(element, eventName, eventFunc){ return this.event.hasEventListener(element, eventName, eventFunc); };
Jelly.PluginIconManagerInputer.prototype.hasEventListenerByEventName    = function(eventName, eventFunc){ return this.event.hasEventListenerByEventName(eventName, eventFunc); };
Jelly.PluginIconManagerInputer.prototype.hasEventListenerByEventFunc    = function(eventFunc){ return this.event.hasEventListenerByEventFunc(eventFunc); };
Jelly.PluginIconManagerInputer.prototype.removeEventListener            = function(element, eventName, eventFunc){ return this.event.removeEventListener(element, eventName, eventFunc); };
Jelly.PluginIconManagerInputer.prototype.removeEventListenerByEventName = function(eventName, eventFunc){ return this.event.removeEventListenerByEventName(eventName, eventFunc); };
Jelly.PluginIconManagerInputer.prototype.removeEventListenerByEventFunc = function(eventFunc){ return this.event.removeEventListenerByEventFunc(eventFunc); };
Jelly.PluginIconManagerInputer.prototype.execEventListener              = function(element, eventName, event){ return this.event.execEventListener(element, eventName, event); };
Jelly.PluginIconManagerInputer.prototype.execEventListenerByEventName   = function(eventName, event){ return this.event.execEventListenerByEventName(eventName, event); };



Jelly.PluginIconManagerInputer.prototype.setup = function(parent){
    var that = this;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;

    //- Setup Command
    var icon = new Jelly.Icon(Jelly.PluginIconManager.COMMAND_NAME_FOR_OPEN).setCommand(function(parameter){
        popman.pop(Jelly.PluginIconManager.POP_ICON_MANAGER);
    });
    parent.setupSystemIcon(icon);

    //- Setup Icons ...
    ready(function(){
        /*************************
         * Make Pop - ICON-MANAGER
         *************************/
        if (popman.has(Jelly.PluginIconManager.POP_ICON_MANAGER)){
            that.makeInputer();
        }else{
            parent.addEventListenerByEventName(Jelly.PluginIconManager.EVENT_JELLYICONMANAGER_SETUP, function(){
                that.makeInputer();
            });
        }

        /*************************
         * Make Pop Event
         *************************/
        parent.addEventListenerByEventName(Jelly.PluginIconManager.EVENT_JELLYICONMANAGER_AFTERPOP, function(){
            getEl('input-dev-search-all').focus();
            boxman.getKeyboarder().setSelectorBox('result-dev-search-all');
            getEl('input-dev-search-all').focus();
        });
    });

};
Jelly.PluginIconManagerInputer.prototype.start = function(){

};
Jelly.PluginIconManagerInputer.prototype.end = function(){

};
Jelly.PluginIconManagerInputer.prototype.dispose = function(){

};





Jelly.PluginIconManagerInputer.prototype.makeInputer = function(){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;

    var popElement = popman.getPop(Jelly.PluginIconManager.POP_ICON_MANAGER).element;

    /*************************
     * Make Icon Data
     *************************/
    var dataMap = {};
    for (var i=0, icon; i<parent.iconList.length; i++){
        icon = parent.iconList[i];
        dataMap[icon.title] = {id:'test', type:'test'};
    }
    that.repoList.push(dataMap);

    /*************************
     * Make Inputer
     *************************/
    var contextDiv = newEl('div').returnElement();
    var contextDivForInputer = newEl('div').returnElement();
    // var contextDivForResult = newEl('div', {id:'result-dev-search-all'}).returnElement();
    var contextDivForResult = boxman.newBox({id:'result-dev-search-all'});
    var inputer = newEl('input', {id:'input-dev-search-all'}).returnElement();
    getEl(contextDivForInputer)
        .setStyle('text-align', 'center')
        .add(inputer);
    getEl(contextDivForResult)
        .setStyle('text-align', 'left')
        .addClass('dev-result-box');
    getEl(contextDiv).add(contextDivForInputer).add(contextDivForResult).appendToAsFirst(popElement);

    getEl(inputer)
        .style('width:90%; height:50px; font-size:20px; border-radius:10px;')
        .addEventListener('focus', function(event){
            boxman.getKeyboarder().setSelectorBox('result-dev-search-all');
            boxman.getElementByBox('result-dev-search-all').style.display = 'block';
        })
        .addEventListener('blur', function(event){
            boxman.getKeyboarder().delSelectorBox('result-dev-search-all');
            boxman.getElementByBox('result-dev-search-all').style.display = 'none';
        })
        .addEventListener('keyup', function(event){
            var inputId = 'input-dev-search-all';
            var resultId = 'result-dev-search-all';
            boxman.suspendBox(resultId, inputId);
            var word = getEl(inputId).value();
            that.search(word, resultId);
        });
}












/***************************************************************************
 *
 * Open Develop Tool
 *
 ***************************************************************************/
/*****
 * Setup Special Search
 *****/
var mapIdFinder = function(word){
    var resultMap = {};
    var onlyNum = word.replace(/\D/g, '');
    if (onlyNum && onlyNum != '') {
        var item1 = {
            key: '@ META_OBJECT / OBJECT_ID ' + onlyNum,
            tableName: 'META_OBJECT',
            objectId: onlyNum,
            runType: RUN_TYPE_DB
        };
        var item2 = {
            key: '@ MOBJ_INV / OI_ID ' + onlyNum,
            tableName: 'MOBJ_INV',
            oiId: onlyNum,
            runType: RUN_TYPE_DB
        };
        var item3 = {
            key: '@ MOBJ_PROPERTY / OBJECT_ID ' + onlyNum,
            tableName: 'MOBJ_PROPERTY',
            objectId: onlyNum,
            runType: RUN_TYPE_DB
        };
        var item4 = {
            key: '@ MOBJ_DESC / OBJECT_ID ' + onlyNum,
            tableName: 'MOBJ_DESC',
            objectId: onlyNum,
            runType: RUN_TYPE_DB
        };
        resultMap[item1.key] = item1;
        resultMap[item2.key] = item2;
        resultMap[item3.key] = item3;
        resultMap[item4.key] = item4;
    }
    return resultMap;
};

/*****
 * CACHE SEARCH DATA
 *****/
Jelly.PluginIconManagerInputer.prototype.setLoadData = function(func){
    if ( !(func instanceof Array))
        func = [func];
    for (var i=0; i<func.length; i++){
        var func = func[i];
        this.funcList.push(func);
    }
    this.loadSearchData();
    return this;
};
Jelly.PluginIconManagerInputer.prototype.loadSearchData = function(){
    // if (this.hasEventListenerByEventName(JellySpeaker.PluginIconManagerInputer.EVENT_LOADSEARCHDATA))
    //     this.execEventListenerByEventName(JellySpeaker.PluginIconManagerInputer.EVENT_LOADSEARCHDATA, this.pushSearchData);

    for (var i=0; i<this.funcList.length; i++){
        var func = this.funcList[i];
        var dataMap = func();
        this.repoList.push(dataMap);
    }
    return this;


    // //Cache System
    // toolContext.repoForSystem = {
    //     '# TOOL':       {id:'popup-dev', type:'shortcut'}
    //     ,'# LOGOUT':    {id:'logout', type:'click'}
    //     ,'# HOME':      {id:'home-btn', type:'click'}
    //     ,'# HELP':      {id:'menual-btn', type:'click'}
    // };
    // //Cache Menu
    // getAjaxWithAsync(toolContext.pathToMenuRepo, {}, function(data){
    //     toolContext.repoForMenu = data;
    // });
    // //Cache Properties
    // getAjaxWithAsync(toolContext.pathToPropRepo, {}, function(data){
    //     toolContext.repoForProp = data;
    // });
    // //Cache DB
    // getAjaxWithAsync(toolContext.pathToDBRepo, {}, function(data){
    //     toolContext.repoForDB = data;
    // });
};

Jelly.PluginIconManagerInputer.prototype.search = function(word, resultId){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;

    if (word != this.lastSearchWord){
        //Save Last Word
        this.lastSearchWord = word;
        //Clear Searched List
        this.clearInputSearch(resultId);
        //Input Searched List
        for (var i=0, repoMap; i<this.repoList.length; i++){
            repoMap = this.repoList[i];
            this.inputSearch(word, repoMap);
        }
        //Render Result Items
        for (var itemNm in this.searchingResultMap){
            boxman.newObj({
                parent:resultId,
                content:itemNm,
                attribute:this.searchingResultMap[itemNm]
            });
        }
        //Select First Item
        boxman.getKeyboarder().selectNextObjInBox(resultId);
    }
};

Jelly.PluginIconManagerInputer.prototype.clearInputSearch = function(resultId){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    //DEL ALL SEARCH ITEM LIST
    boxman.delObjByBox(resultId);
    getEl(resultId).html('');
    this.searchingResultMap = {};
};

Jelly.PluginIconManagerInputer.prototype.inputSearch = function(word, repoMap){
    if (repoMap){
        if (typeof repoMap == 'function'){
            repoMap = repoMap();
        }
        //ADD DEFAULT SEARCH ITEM
        if (word == null || word == '')
            return;
        // // Search OR Word
        // var searchExp = word.replace(/\s+/g, '|');
        // var regexp = new RegExp(''+ searchExp +'');
        //Search AND Word
        var searchWordList = word.split(/\s+/);
        var searchExp = '';
        for (var i=0; i<searchWordList.length; i++){
            searchExp += ('(?=.*'+ searchWordList[i] +')');
        }
        //FIND
        var regexp = new RegExp(''+ searchExp +'.*', 'i');
        for (var itemNm in repoMap){
            if (regexp.test(itemNm))
                this.searchingResultMap[itemNm] = repoMap[itemNm];
        }
    }
};



