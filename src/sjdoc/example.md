# Example



## Example-1

```js
//TODO: 개념정리중
var jelly = new Jelly({modeNeedsToCallName: true, validTimeToCommand: 4000, storagePath: '/jelly/icon'})
    .addPlugin([
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
        }),
    ])
    .setupSystemIcon([
        new Jelly.Icon('search').setCommand(function(parameter){
            searchWithParameterURL(parameter.keyword); //없으면 자동으로 Input의 Value 채취
        }),
        new Jelly.Icon('search-on-naver').setCommand(function(parameter){
            window.open("https://search.naver.com/search.naver?ie=UTF-8&query=" +parameter, "_blank");
        }),
        new Jelly.Icon('search-on-google').setCommand(function(parameter){
            window.open("https://www.google.com/search?q=" +parameter, "_blank");
        }),
        new Jelly.Icon('show').setCommand(function(parameter){
            // run('show', parameter);
        }),
        new Jelly.Icon('open').setCommand(function(parameter){
            window.open('https://naver.com', '_blank');
        }),
        new Jelly.Icon('move-to-home').setCommand(function(parameter){
            location.href = SEARCHER.URL_TO_HOME;
        }),
        new Jelly.Icon('open-user-manager').setCommand(function(parameter){
            openUserManager();
        }),
        new Jelly.Icon('open-team-manager').setCommand(function(parameter){
            openTeamManager();
        }),
        new Jelly.Icon('open-category-manager').setCommand(function(parameter){
            openCategoryManager();
        }),
        new Jelly.Icon('open-product-manager').setCommand(function(parameter){
            openProductManager();
        }),
        new Jelly.Icon('open-index-manager').setCommand(function(parameter){
            openIndexManager();
        }),
        new Jelly.Icon().setCommand('search').setRunner([
            new Jelly.SpeechRunner('${parameter.except(이라고).except(라고)} 검색'),
            new Jelly.SpeechRunner(new RegExp('\\w+ 검색')),
        ]),
        new Jelly.Icon().setCommand('search-on-naver').setRunner([
            new Jelly.SpeechRunner('${parameter.except(이라고).except(라고)} 네이버에서 검색'),
            new Jelly.SpeechRunner(new RegExp('.+ 검색')),
        ]),
        new Jelly.Icon().setCommand('search-on-google').setRunner([
            new Jelly.SpeechRunner('${parameter.except(이라고).except(라고)} 구글에서 검색'),
        ]),
        new Jelly.Icon().setCommand('open').setRunner([
            new Jelly.SpeechRunner('안녕'),
            // new JellySpeaker.ScheduleRunner('{dayOfWeek(토,일), cycle(10m, 05:45)}, {dayOfWeek(월), cycle(07:00, 14:00, 19:30)}'),
        ]),
        new Jelly.Icon('open-graph-network').setCommand(function(parameter){
            openGraphNetwork(parameter);
        }),
    ])
    .setupUserIcon([
        /** 데이터 보조 **/
        new Jelly.Icon('user-manager').setTitle('사용자 관리자').setHTML('🧍').setCommand('open-user-manager').setRunner([
            new Jelly.KeyRunner([KeyMan.ALT, KeyMan.N2]),
        ]),
        new Jelly.Icon('team-manager').setTitle('소속 관리자').setHTML('👨‍👩‍👧 ').setCommand('open-team-manager').setRunner([
            new Jelly.KeyRunner([KeyMan.ALT, KeyMan.N9]),
        ]),
        new Jelly.Icon('category-manager').setTitle('카테고리 관리자').setHTML('🗂️').setCommand('open-category-manager').setRunner([
            new Jelly.KeyRunner([KeyMan.ALT, KeyMan.N3]),
        ]),
        new Jelly.Icon('product-manager').setTitle('상품 관리자').setHTML('📦').setCommand('open-product-manager').setRunner([
            new Jelly.KeyRunner([KeyMan.ALT, KeyMan.N4]),
        ]),
        new Jelly.Icon('index-manager').setTitle('인덱스 관리자').setHTML('🕵️‍♂️').setCommand('open-index-manager').setRunner([
            new Jelly.KeyRunner([KeyMan.ALT, KeyMan.N6]),
        ]),

        /** 관제 **/
        new Jelly.Icon('page-gitlab').setTitle('GitLab').setHTML('🦊').setURL('http://192.168.0.18'),
        new Jelly.Icon('page-jelly').setTitle('Jelly').setHTML('Jelly').setURL('http://192.168.0.18:8080/jelly'),
        new Jelly.Icon('page-ealsticsearch').setTitle('ElasticSearch').setHTML('ES').setURL('http://192.168.0.18:9200'),
        new Jelly.Icon('page-kibana').setTitle('Kibana').setHTML('Kibana').setURL('http://192.168.0.18:5601'),
        new Jelly.Icon('page-logstash').setTitle('Logstash').setHTML('Logstash').setURL('http://192.168.0.18:9600'),
        // new JellySpeaker.Icon('page-tibero').setTitle('Tibero').setHTML('Tibero').setURL('jdbc:tibero:thin:@192.168.0.18:8629:tibero').setData({username:'nia', password:'nia'}),
        new Jelly.Icon('page-postgres').setTitle('Postgres').setHTML('Postgres').setURL('jdbc:postgresql://192.168.0.18:5432/postgres').setData({username:'postgres', password:'postgres'}),

        /** 기능들 **/
        new Jelly.Icon('schedule-001').setTitle('주기적으로 Data Count 가져와').setHTML('🔢').setCommand(function(){ loadCount() }).setRunner([
            new Jelly.ScheduleRunner(30 * 1000)
        ]),
        // new JellySpeaker.Icon('testing').setTitle('testing').setHTML('🔢').setCommand(function(){ console.error(new Date().getTime()) }).setRunner([
        //     new JellySpeaker.ScheduleRunner('{dayOfWeek(일), cycle(23:45, 23:46, 23:50, 23:55, 00:37, 00:42)}, {dayOfWeek(월,화), cycle(2m)}')
        // ]),
        new Jelly.Icon('button-002').setTitle('학습해봐!').setHTML('👩‍🎓').setCommand(function(){ testLearn() }).setRunner([
            new Jelly.SpeechRunner('학습 해 봐'),
        ]),
        new Jelly.Icon('toggle-memory-watcher').setTitle('메모리 감시자').setHTML('📉').setClass(Jelly.PluginIconManager.CLASS_ICON_TOGGLE)
            .setCommand(function(parameter, resolve){
                parameter.status ? stopMemoryWatcher(resolve) : startMemoryWatcher(resolve);
            })
            .setModeStatusCheck(true, function(resolve){
                checkMemoryWatcher(function(result){ resolve(result); });
            }),
    ])
    .setupBot([
        // new JellySpeaker.Bot({name:"WHATEVER_SOMETHING_TO_DO", cycleTime:1000}).addAction([
        //     new JellySpeaker.ActionGroupOrderly({rate:0.30}).add([
        //         new JellySpeaker.Action(rate:0.25, command:'pay', param:{"WHERE":{"NAME":"A%"}}),
        //         new JellySpeaker.Action(rate:0.25, command:'pay', param:{"WHERE":{"NAME":"B%"}}),
        //         new JellySpeaker.Action(rate:0.50, command:'pay', param:{"WHERE":{"NAME":"C%"}}),
        //     ]),
        //     new JellySpeaker.ActionGroupRandom({rate:0.25}).add([
        //         new JellySpeaker.Action(rate:0.25, command:'pay', param:{"WHERE":{"NAME":"B%"}}),
        //         new JellySpeaker.Action(rate:0.25, command:'pay', param:{"WHERE":{"NAME":"B%"}}),
        //         new JellySpeaker.Action(rate:0.50, command:'pay', param:{"WHERE":{"NAME":"B%"}}),
        //     ]),
        //     new JellySpeaker.Action({rate:0.45, command:'pay', param:{"WHERE":{"NAME":"B%"}}})
        //     ]),
        // ])
    ])
    .loadIcon()
    .detect()
    .start();
```