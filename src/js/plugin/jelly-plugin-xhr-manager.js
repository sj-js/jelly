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
Jelly.PluginXHRManager = function(){
    this.name = '';
    this.parent = null;
    this.statusSetuped = false;
};
Jelly.PluginXHRManager.SYSTEM_ICON_ID_TO_OPEN = 'open-plugin-xhr-manager';
Jelly.PluginXHRManager.USER_ICON_ID_TO_OPEN = 'open-xhr-manager';
Jelly.PluginXHRManager.POP_MANAGER = 'pop-xhr-manager';



Jelly.PluginXHRManager.prototype.setup = function(parent){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var menuman = parent.menuman;
    /** System Icon **/
    parent.setupSystemIcon([
        new Jelly.Icon(Jelly.PluginXHRManager.SYSTEM_ICON_ID_TO_OPEN).setCommand(function(){
            parent.popman.pop(Jelly.PluginXHRManager.POP_MANAGER);
        })
    ]);
    /** User Icon **/
    parent.setupUserIcon([
        new Jelly.Icon(Jelly.PluginXHRManager.USER_ICON_ID_TO_OPEN).setTitle('Request 관리자').setHTML('🙋').setCommand(Jelly.PluginXHRManager.SYSTEM_ICON_ID_TO_OPEN).setRunner([

        ]),
    ]);
    /** Make Component **/
    ready(function(){
        that.makePopForXHRManager();
    });
};
Jelly.PluginXHRManager.prototype.start = function(){

};
Jelly.PluginXHRManager.prototype.end = function(){

};
Jelly.PluginXHRManager.prototype.dispose = function(){

};






/**************************************************
 *
 * POP - XHR-MANAGER
 *
 **************************************************/
Jelly.PluginXHRManager.prototype.makePopForXHRManager = function(){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var popman = parent.popman;
    var keyman = parent.keyman;
    var menuman = parent.menuman;

    /*************************
     * Make Pop - XHR-MANAGER
     *************************/
    var popElementForManager = popman.add(popman.new({
        id: Jelly.PluginXHRManager.POP_MANAGER,
        exp: '90%',
        closebyesc: true,
        closebyclickout: true,
        afterpop: function(data){

        }
    }));

    this.divButtonList = newEl('div', {id:'devButtonList'}).addClass(['dev-box'])
        .add([
            newEl('button', {id:'testbbtt'}).html('REQUEST').addEventListener('click', function(e){
                var url = getEl('devInputURL').value();
                var method = getEl('selectForMethod').value();
                var header = getEl('textareaForHeader').parse();
                var body = getEl('textareaForBody').parse();
                header = header ? header : {};
                body = body ? body : {};
                that.request(url, method, header, body);
            })
        ]);
    this.divRequestURL = newEl('div', {id:'devRequestURLForXHR'}).addClass(['dev-box'])
        .add([
            newEl('input', {id:'devInputURL'})
        ]);
    this.divRequestMethod = newEl('div', {id:'devRequestMethodForXHR'}).addClass(['dev-box'])
        .add([
            newEl('select', {id:'selectForMethod'}).add([
                newEl('option').html('GET').value('GET'),
                newEl('option').html('POST').value('POST'),
                newEl('option').html('PUT').value('PUT'),
                newEl('option').html('DELETE').value('DELETE')
            ])
        ]);
    this.divRequestHeader = newEl('div', {id:'devRequestHeaderForXHR'}).addClass(['dev-box'])
        .add([
            newEl('textarea', {id:'textareaForHeader'})
        ]);
    this.divRequestBody = newEl('div', {id:'devRequestBodyForXHR'}).addClass(['dev-box'])
        .add([
            newEl('textarea', {id:'textareaForBody'})
        ]);
    this.divViewResponse = newEl('div', {id:'devViewForResponse'}).addClass(['dev-box']);
    this.divLogRequest = boxman.newBox({
        id: 'devLogRequestForXHR',
        width: '100px',
        height: '100px',
    });
    this.divLogResponse = newEl('div', {id:'devLogResponseForXHR'}).addClass(['dev-box'])
        .add([
            newEl('div').style('width:50px; height:20px; border:1px solid black'),
            newEl('div').style('width:50px; height:20px; border:1px solid black'),
        ]);

    getEl(popElementForManager).add([
        newEl('div').style('float:left; width:100%').add([
            newEl('div').style('display:inline-block; float:left; border:1px solid black; width:300px;').addln([
                this.divButtonList,
                this.divRequestMethod,
                'URL',
                this.divRequestURL,
                'HEADER',
                this.divRequestHeader,
                'BODY',
                this.divRequestBody,
            ]),
            newEl('div').style('display:inline-block; float:left; border:1px solid black; width:300px').addln([
                'RESPONSE',
                this.divViewResponse,
            ]),
        ]),
        newEl('div').style('float:left; width:100%; float:left; border:1px solid black;').add([
            'LOG',
            this.divLogRequest,
            this.divLogResponse,
        ]),
    ]);
};

Jelly.PluginXHRManager.prototype.request = function(url, method, header, body){
    console.error('[REQUEST]', url, method, header, body);
    var that = this;
    var response = null;
    var xhr = null;
    switch (method){
        case CrossMan.XHR.GET:
            xhr = getXHR(url, body, header).request(function(response){
                that.showResponse(response);
                that.log(xhr, response);
            });
            break;
        case CrossMan.XHR.POST:
            xhr = postXHR(url, body, header).request(function(response){
                that.showResponse(response);
                that.log(xhr, response);
            });
            break;
        case CrossMan.XHR.PUT:
            xhr = putXHR(url, body, header).request(function(response){
                that.showResponse(response);
                that.log(xhr, response);
            });
            break;
        case CrossMan.XHR.DELETE:
            xhr = deleteXHR(url, body, header).request(function(response){
                that.showResponse(response);
                that.log(xhr, response);
            });
            break;
    }
};



Jelly.PluginXHRManager.prototype.showResponse = function(response){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    var text = '';
    if (typeof response == 'object')
        text = JSON.stringify(response);
    else
        text = response;
    getEl(this.divViewResponse).html(text);
};



Jelly.PluginXHRManager.prototype.log = function(xhr, response){
    var that = this;
    var parent = this.parent;
    var boxman = parent.boxman;
    boxman.newObj({
        content: 'response' + response,
        parent: this.divLogRequest
    });

};
Jelly.PluginXHRManager.prototype.logRequest = function(xhr){

};
Jelly.PluginXHRManager.prototype.logResponse = function(response){

};