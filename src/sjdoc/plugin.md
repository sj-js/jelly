# Plugin


## .addPlugin([ ... ])
```js
var jelly = new Jelly({modeNeedsToCallName:true, validTimeToCommand:4000, storagePath:'/jelly/icon'});
    .addPlugin([
        new Jelly.PluginStats(),
    ]);
```



## Plugins
```js
new Jelly.PluginStats(),
new Jelly.PluginCommandSearchTest('search', '검색'),
new Jelly.PluginWordChain(),
new Jelly.PluginAlarmManager(),
new Jelly.PluginDBManager(),
new Jelly.PluginXHRManager(),
new Jelly.PluginIconManager()
    .setCustomChecker('web-checker', {'url':'http*'}, function(iconList, resolve){
        var urlList = getData(iconList).collect(function(it){ return it.url });
        getXHR(SEARCHER.URL_CHECK_URL_ALL, {urlList:urlList, timeout:1500}).request(function(resultList){
            var statusMap = getData(iconList).collectMap(function(it, index){ return {key:iconList[index].id, value:resultList[index]}; });
            resolve(statusMap);
        });
    }, 10000)
    .setCustomChecker('db-checker', {'url':'jdbc*'}, function(iconList, resolve){
        var urlList = getData(iconList).collect(function(it){ return it.url });
        var idList = getData(iconList).collect(function(it){ return it.data.username });
        var pwList = getData(iconList).collect(function(it){ return it.data.password });
        getXHR(SEARCHER.URL_CHECK_DB_ALL,{urlList:urlList, idList:idList, pwList:pwList}).request( function(resultList){
            var statusMap = getData(iconList).collectMap(function(it, index){ return {key:iconList[index].id, value:resultList[index]}; });
            resolve(statusMap);
        });
    }, 10000),
new Jelly.PluginIconManagerInputer().setLoadData(function(){
    return { hi: {id:'test', type:'click'},  hello: {id:'test2', type:'click'}, };
});
```