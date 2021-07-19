/***************************************************************************
 *
 * Jelly - Command Listener
 *
 ***************************************************************************/
Jelly.PluginDBManager = function(){
    this.name = '';
    this.parent = null;
    this.statusSetuped = false;
};
Jelly.PluginDBManager.SYSTEM_ICON_ID_TO_OPEN = 'open-plugin-db-manager';
Jelly.PluginDBManager.USER_ICON_ID_TO_OPEN = 'open-db-manager';
Jelly.PluginDBManager.POP_MANAGER = 'pop-db-manager';



Jelly.PluginDBManager.prototype.setup = function(parent){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var menuman = parent.menuman;
    /** System Icon **/
    parent.setupSystemIcon([
        new Jelly.Icon(Jelly.PluginDBManager.SYSTEM_ICON_ID_TO_OPEN).setCommand(function(){
            popman.pop(Jelly.PluginDBManager.POP_MANAGER);
        })
    ]);
    /** User Icon **/
    parent.setupUserIcon([
        new Jelly.Icon(Jelly.PluginDBManager.USER_ICON_ID_TO_OPEN).setTitle('DB 관리자').setHTML('🗄️').setCommand(Jelly.PluginDBManager.SYSTEM_ICON_ID_TO_OPEN).setRunner([
        ]),
    ]);
    /** Make Component **/
    ready(function(){
        that.makePopForDBManager();
    });
};
Jelly.PluginDBManager.prototype.start = function(){

};
Jelly.PluginDBManager.prototype.end = function(){

};
Jelly.PluginDBManager.prototype.dispose = function(){

};





/**************************************************
 *
 * POP - DB-MANAGER
 *
 **************************************************/
Jelly.PluginDBManager.prototype.makePopForDBManager = function(){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var menuman = parent.menuman;

    /*************************
     * Make Pop - DB-MANAGER
     *************************/
    var divLogRequest = newEl('div', {id:'devLogRequestForDB'}).addClass(['dev-box']).style('width:80%; height:80%; float:left; overflow:auto;');
    var divLogResponse = newEl('div', {id:'devLogResponseForDB'}).addClass(['dev-box']).style('width:80%; height:80%; float:left; overflow:auto;');
    var divColumnList = newEl('div').style('width:20%; height:90%; float:left; overflow:auto;').addClass(['dev-box']).add([
        newEl('div', {id:'devDbColumnOptions'}).style('width:100%;').addClass('dev-box-item').add([
            newEl('button', {id:'btnModeAll'}).addClass('dev-btn-1').html('ALL'),
            newEl('button', {id:'btnModeOnlyHasCount'}).addClass('dev-btn-1').html('CNT'),
            newEl('button', {id:'btnModeOnlyHasAttribute'}).addClass('dev-btn-1').html('ATT'),
            newEl('button', {id:'btnModeCustom'}).addClass('dev-btn-1').html('SET'),
        ]),
        newEl('div', {id:'devDbColumnSelector'}).style('width:100%;')
    ]);
    var divTitle = newEl('div', {id:'dev-db-title'}).style('width:80%; height:70px; float:left; overflow:hidden; font-size:30px;').addClass(['dev-box']);
    var textarea = newEl('textarea').style('width:100%; height:100%;');
    var divQueryArea = newEl('div', {id:'dev-query-db-box'}).style('width:50%; height:50px; float:left; overflow:hidden;').addClass(['dev-box']).add([
        textarea
    ]);
    var divDbGrider = newEl('div', {id:'devDbGrider'}).addClass(['dev-box']).style('width:80%; height:80%; float:left; overflow:auto;');
    var divDbPager = newEl('div', {id:'devDbPager'}).addClass('column-list').style('width:80%; height:; float:left; overflow:auto;').addClass(['dev-box']);

    var popElementForManager = popman.add(popman.new({
        id: Jelly.PluginDBManager.POP_MANAGER,
        exp: '95%',
        closebyesc: true,
        closebyclickout: true,
        afterpop: function(data){
            getXHR(SEARCHER.URL_GET_TABLE_LIST).request(function(data){
                console.error('tablelist result:', data);
                if (data.dataList){
                    divDbGrider.html('');
                    getData(data.dataList).each(function(it){
                        newEl('br').appendTo(divDbGrider);
                        newEl('button').html(JSON.stringify(it)).addEventListener('click', function(e){
                            that.executeQuery('SELECT * FROM ' +it['table_name']);
                        }).appendTo(divDbGrider);
                    });
                }
            });
        }
    }));

    getEl(popElementForManager).add([
        divColumnList,
        divTitle,
        divQueryArea,
        newEl('button').style('width:100px; height:50px;').html('EXECUTE').addEventListener('click', function(e){
            that.executeQuery(textarea.value(), function(data){

            });
        }),
        divDbGrider,
        divDbPager
    ]);
};



Jelly.PluginDBManager.prototype.executeQuery = function(query, callbackWhenSuccess){
    getXHR(SEARCHER.URL_EXECUTE_QUERY, {query:query}).request(function(data){
        if (data.dataList){
            var divDbGrider = getEl('devDbGrider').html('');
            getData(data.dataList).each(function(it){
                divDbGrider.add( newEl('button').html(JSON.stringify(it)) );
            });
        }
        (callbackWhenSuccess && callbackWhenSuccess(data));
    });
};



















function setGridColumn(tableName, classId, propertyId, objectId, oiId){
    // Load ColumnList From DB
    var columnList = getColumns(tableName, classId, propertyId, objectId, oiId);
    // Render Column List
    getEl('devDbColumnSelector').html('');
    if (columnList){
        for (var i=0; i<columnList.length; i++){
            var col = columnList[i];
            if (toolContext.modeOnlyHasCountColumn && !col.hasCount)
                continue;
            else if (toolContext.modeOnlyHasAttributeColumn && !col.hasAttribute)
                continue;
            var newElement = boxman.newObj({parent:getEl('devDbColumnSelector').returnElement(), attribute:col}, {'data-type':'column'});
            newElement.metaDBColName = col.field;
            newElement.metaDBAttName = col.name;
            getEl(newElement).addEl('<div data-expression-count></div>').addEl('<div data-expression-attribute></div>');
            if (col.hasCount)
                getEl(newElement).addClass('column-has-count');
            else
                getEl(newElement).addClass('column-no-count');
            getEl(newElement).add(col.field);
            if (col.hasAttribute)
                getEl(newElement).add(' - '+ col.name).addClass('column-has-attribute');
            getEl('devDbColumnSelector').add(newElement);
            // To Create Grid
            col.formatter = function(row, cell, value, columnDef, dataContext){
                value = (value) ? value : '';
                if (columnDef.hasCount){
                    if (columnDef.hasAttribute){
                        return value;
                    }else{
                        return "<div style='width:100%;height:100%;background:#EEEEEE;'>"+value+"</div>";
                    }
                }else{
                    return "<div style='width:100%;height:100%;background:#B6B6B6;'>"+value+"</div>";
                }
            };
        }
    }else{
        throw 'No List';
    }
}

function getSetedColumn(){
    //
    var list = boxman.getObjAttributeListByBox('devDbColumnSelector');
    //번호 컬럼 추가표시
    list.splice(0, 0, {name:'No.',field:'ROWSEQ',width:40, align:'center'});
    return list;
}

var tabParam;
var tabUi = { };
function setGrid(tableName, classId, propertyId, objectId, oiId, columnList){
    // SUM WIDTH
    var width = 0;
    for (var i=0; i<columnList.length; i++){
        width += columnList[i].width;
    }
    // Create New Grider & Pager
    var newGriderElement = toolContext.dbPureGrider.cloneNode(true);
    var newPagerElement = toolContext.dbPurePager.cloneNode(true);
    if ($('#devDbGrider')[0].children[0])
        $('#devDbGrider')[0].removeChild($('#devDbGrider')[0].children[0]);
    if ($('#devDbPager')[0].children[0])
        $('#devDbPager')[0].removeChild($('#devDbPager')[0].children[0]);

    //Inject try/catch
    var script = newGriderElement.getElementsByTagName('script')[0];
    script.innerHTML = 'try{' + script.innerHTML + '}catch(e){}';

    var script = newPagerElement.getElementsByTagName('script')[0];
    script.innerHTML = 'try{' + script.innerHTML + '}catch(e){}';

    getEl('devDbGrider').add(newGriderElement);
    getEl('devDbPager').add(newPagerElement);
    // Setup Grider
    window.devNewId = (window.devNewId) ? window.devNewId+1 : 1;
    newGriderElement.setAttribute('data-clone', 'true');
    newGriderElement.setAttribute('id', 'tmp'+window.devNewId);
    newGriderElement.style.width = width + 'px';
    for (var i=0; i<newGriderElement.children.length; i++){
        var el = newGriderElement.children[i];
        if (el.tagName.toUpperCase() == 'DIV'){
            window.devNewId = (window.devNewId) ? window.devNewId+1 : 1;
            el.id = 'tmpTemp'+window.devNewId;
        }
    }
    // Setup Pager
    window.devNewId = (window.devNewId) ? window.devNewId+1 : 1;
    newPagerElement.setAttribute('data-clone', 'true');
    newPagerElement.setAttribute('id', 'tmp'+window.devNewId);
    for (var i=0; i<newPagerElement.children.length; i++){
        var el = newPagerElement.children[i];
        if (el.tagName.toUpperCase() == 'DIV'){
            window.devNewId = (window.devNewId) ? window.devNewId+1 : 1;
            el.id = 'tmpTemp'+window.devNewId;
        }
    }
    // Complete
    // $('#dev-db-grid').msGrid({
    //     url	: toolContext.pathToDBClass
    //     ,options : {}
    //     ,columns : columnList
    //     ,pager : '#dev-db-grid-pager'
    //     ,height : 600
    //     ,tabs : '#tabs'
    //     ,param : function(param){
    //         tabParam = null;
    //         param.tableName = tableName;
    //         param.classId = classId;
    //         param.propertyId = propertyId;
    //         param.objectId = objectId;
    //         param.oiId = oiId;
    //         return param;
    //     }
    // }).bind('selectrow' , function(evt, row, data){
    //     tabParam = { objectId : data.objectId, classId : '80' };
    //     tabsselect(null, tabUi);
    // });
    // Load!!
    loadGridData();
}
function loadGridData(){
    // $('#dev-db-grid').msGrid('reload');
    // console.log('COMPLETE MSGRID');
}
function getColumns(tableName, classId, propertyId, objectId, oiId){
    // console.log('METADATA TRY TO LOAD', 'CLASSID: '+classId, 'PROPERTYID:' +propertyId, 'OBJECTID' +objectId, 'OIID' +oiId);
    var resultList = getAjaxValue(toolContext.pathToDBMeta, {
        tableName: tableName,
        classId: classId,
        propertyId: propertyId,
        objectId: objectId,
        oiId: oiId
    });
    // console.log('METADATA LOADED', resultList);
    return resultList;
}
function tabsselect(evt, ui){
    if(ui){
        // if($(ui.panel).find('div.grid-wrapper').length){
        //     if(tabParam)
        //         $(ui.panel).find('div.grid-wrapper').eq(0).msGrid('setParameters', tabParam).msGrid('reload');
        //     else
        //         $(ui.panel).find('div.grid-wrapper').eq(0).msGrid('clearGridData');
        // }
        tabUi = ui;
    }
}
// $('#tabs').bind('tabsselect', tabsselect);


function getClassId(tableName, objectId, oiId){
    var classId = getAjaxValue(toolContext.pathToGetClassId, {
        tableName:tableName,
        objectId:objectId,
        oiId: oiId
    });
    return classId;
}

function getClassName(tableName, classId, propertyId){
    var className = getAjaxValue(toolContext.pathToGetClassName, {
        tableName:tableName,
        classId:classId,
        propertyId:propertyId
    });
    return className;
}

function editorForAttribute(dbItemElement){
    toolContext.searchingResultMap[toolContext.lastDBName].columnName = dbItemElement.metaDBColName;
    toolContext.searchingResultMap[toolContext.lastDBName].attributeName = dbItemElement.metaDBAttName;
    popman.pop('popup-dev-db-history', function(){
        var item = toolContext.searchingResultMap[toolContext.lastDBName];
        // Clear Printed Info
        getEl("dev-value-db-tablename").html('');
        getEl("dev-value-db-classid").html('');
        getEl("dev-value-db-propertyid").html('');
        getEl("dev-value-db-columnname").html('');
        getEl("dev-input-db-classname").value('');
        getEl("dev-input-db-attributename").value('');
        getEl("dev-input-db-description").value('');
        getEl('devDbHistory').html('');
        // Request Info
        var resultList = getXHR(toolContext.pathToGetAttributeHistory, {
            tableName:  item.tableName,
            classId:    item.classId,
            propertyId: item.propertyId,
            columnName: item.columnName,
            objectId:   item.objectId,
            oiId:       item.oiId
        }).setAsync(false).request();

        // console.log('///// item(param)');
        // console.log(item);
        // console.log('///// ResultList');
        // console.log(resultList);
        if (resultList != null && resultList.length > 0){
            // Print History
            var historyStr = '';
            for (var i=0; i<resultList.length; i++){
                var history = resultList[i];
                historyStr += ('[' +history.createDt+ '] ' +history.className+ ' / ' +history.attributeName+ ' / ' +history.description+ '</br></br>');
            }
            getEl('devDbHistory').html(historyStr);
            // Print Now Info
            var latestHistory = resultList[0];
            getEl('dev-value-db-tablename').html(latestHistory.tableName);
            getEl('dev-value-db-classid').html(latestHistory.classId);
            getEl('dev-value-db-propertyid').html(latestHistory.propertyId);
            getEl('dev-value-db-columnname').html(latestHistory.columnName);
            getEl('dev-input-db-classname').value(latestHistory.className);
            getEl('dev-input-db-attributename').value(latestHistory.attributeName);
            getEl('dev-input-db-description').value(latestHistory.description);
        }
    });
}

function deleteAttribute(dbItemElement){
    boxman.delObj(dbItemElement);
}





// //DBGRID MODE - ALL
// $("#btnModeAll").bind('click', function(){
//     toolContext.modeOnlyHasCountColumn = false;
//     toolContext.modeOnlyHasAttributeColumn = false;
//     runOpenDBGrid(toolContext.lastDBName, true);
// });
// //DBGRID MODE - ONLY COUNT
// $("#btnModeOnlyHasCount").bind('click', function(){
//     toolContext.modeOnlyHasCountColumn = !toolContext.modeOnlyHasCountColumn;
//     runOpenDBGrid(toolContext.lastDBName, true);
// });
// //DBGRID MODE - ONLY ATTRIBUTE
// $("#btnModeOnlyHasAttribute").bind('click', function(){
//     toolContext.modeOnlyHasAttributeColumn = !toolContext.modeOnlyHasAttributeColumn;
//     runOpenDBGrid(toolContext.lastDBName, true);
// });
// //DBGRID MODE - SET
// $("#btnModeCustom").bind('click', function(){
//     runOpenDBGrid(toolContext.lastDBName);
// });
//
// //DB EDIT MODE - SAVE
// $("#btnSaveHistory").bind('click', function(){
//     var item = toolContext.searchingResultMap[toolContext.lastDBName];
//     getAjaxValueWIthSync(toolContext.pathToAddDBMeta, {
//         tableName:      item.tableName,
//         classId:        item.classId,
//         propertyId:     item.propertyId,
//         objectId:       item.objectId,
//         oiId:           item.oiId,
//         columnName:     item.columnName,
//         className:      $("#dev-input-db-classname").val(),
//         attributeName:  $("#dev-input-db-attributename").val(),
//         description:    $("#dev-input-db-description").val()
//     });
//     // console.log('sync save');
//     //RELOAD DB VIEW
//     runOpenDBGrid(toolContext.lastDBName, true);
//     //RELOAD Datas
//     loadSearchData();
//     //CLOSE EDITOR
//     popman.close('popup-dev-db-history');
// });
