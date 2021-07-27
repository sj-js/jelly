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
Jelly.PluginWordChain = function(){
    this.name = '';
    this.parent = null;
    this.statusSetuped = false;
};
Jelly.PluginWordChain.prototype.setup = function(parent){

};
Jelly.PluginWordChain.prototype.start = function(){

};
Jelly.PluginWordChain.prototype.end = function(){

};
Jelly.PluginWordChain.prototype.dispose = function(){

};