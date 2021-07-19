/****************************************************************************************************
 *
 * RUNNER SETUP
 *
 ****************************************************************************************************/
/**************************************************
 *
 * RUNNER - key
 *
 **************************************************/
Jelly.KeyRunner = function(object){
    this.type = Jelly.TYPE_RUNNER_KEY;
    this.parent = null;
    this.keyList = null;


    // if (object instanceof Array){
    //     this.keyList = object;
    // }else if (typeof object == 'string'){
    //     this.keyList = KeyMan.parse(object);
    // }

    this.keyList = KeyMan.parse(object);
    // this.init(object);
};
Jelly.KeyRunner.prototype.init = function(object){
    for (var key in object)
        this[key]= object[key];
    return this;
};
Jelly.KeyRunner.prototype.setup = function(parent){
    return this;
};
Jelly.KeyRunner.prototype.getExpression = function(){
    return KeyMan.convertToExpression(this.keyList);
};



