# Jelly
## 🥝 [👨🏻‍💻⛔] Not yet implemented...  
[![Build Status](https://travis-ci.org/sj-js/jelly.svg?branch=master)](https://travis-ci.org/sj-js/jelly)
[![Coverage Status](https://coveralls.io/repos/github/sj-js/jelly/badge.svg)](https://coveralls.io/github/sj-js/jelly)
[![All Download](https://img.shields.io/github/downloads/sj-js/jelly/total.svg)](https://github.com/sj-js/jelly/releases)
[![Release](https://img.shields.io/github/release/sj-js/jelly.svg)](https://github.com/sj-js/jelly/releases)
[![License](https://img.shields.io/github/license/sj-js/jelly.svg)](https://github.com/sj-js/jelly/releases)

- Icon 생성/관리/실행 WebPage에 당신만의 Menu를 쉽게 구성할 수 있습니다.
- 단축키/음성인식/Timer/Plugin
- ✨ Source: https://github.com/sj-js/jelly
- ✨ Document: https://sj-js.github.io/sj-js/jelly
- Developing.. Testing.. 


## Index
*@* **order** *@*
```
- Jelly
- Icon
- Runner
- Plugin
- Example
```



## 1. Getting Started

### 1-1. How to use

1. Load library and new instance
    ```html
    <!-- Library - SJJS -->
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/crossman/dist/js/crossman.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/storageman/dist/js/storageman.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/keyman/dist/js/keyman.js"></script> 
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/boxman/dist/js/boxman.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/popman/dist/js/popman.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/menuman/dist/js/menuman.js"></script>  
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/variableman/dist/js/variableman.js"></script>
    <!-- Library - SJJS-Jelly -->
    <link href="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/css/jelly.css" rel="stylesheet" type="text/css"/>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-model.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-icon.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-runner-key.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-runner-speech.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-runner-schedule.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-plugin-stats.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-plugin-icon-manager.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-plugin-icon-manager-inputer.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-plugin-alarm-manager.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-plugin-db-manager.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-plugin-xhr-manager.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-plugin-command-search-test.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/jelly/dist/js/jelly-speaker-plugin-word-chain.js"></script> 
    <script>
         var jelly = new Jelly();
    </script>
    ```  
    OR in ES6+
    ```js
    const Jelly = require('@sj-js/jelly');
    const jelly = new Jelly();
    ```
   
2. addMenu   
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
            new Jelly.PluginIconManager(),
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
            new Jelly.Icon().setCommand('search').setRunner([
                new Jelly.SpeechRunner('${parameter.except(이라고).except(라고)} 검색'),
                new Jelly.SpeechRunner(new RegExp('\\w+ 검색')),
            ]),
            new Jelly.Icon().setCommand('search-on-naver').setRunner([
                new Jelly.SpeechRunner('${parameter.except(이라고).except(라고)} 네이버에서 검색'),
                new Jelly.SpeechRunner(new RegExp('.+ 검색')),
            ]),
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
        .loadIcon()
        .detect()
        .start();
    ```
   


### 1-2 Simple Example
- For convenience, the following code, which loads and creates a Library in the example, is omitted.
    ```html
    ...
    ```

    *@* *+prefix* *x* *@*
    ```html
    <!-- Library - SJJS -->
    <script src="../crossman/crossman.js"></script>
    <script src="../storageman/storageman.js"></script>
    <script src="../keyman/keyman.js"></script> 
    <script src="../boxman/boxman.js"></script>
    <script src="../popman/popman.js"></script>
    <script src="../menuman/menuman.js"></script>  
    <script src="../variableman/variableman.js"></script>
    <!-- Library - SJJS-Jelly -->
    <link href="../jelly/jelly.css" rel="stylesheet" type="text/css" />
    <script src="../jelly/jelly-speaker.js" ></script>
    <script src="../jelly/jelly-speaker-model.js" ></script>
    <script src="../jelly/jelly-speaker-icon.js" ></script>
    <script src="../jelly/jelly-speaker-runner-key.js" ></script>
    <script src="../jelly/jelly-speaker-runner-speech.js" ></script>
    <script src="../jelly/jelly-speaker-runner-schedule.js" ></script>
    <script src="../jelly/jelly-speaker-plugin-stats.js" ></script>
    <script src="../jelly/jelly-speaker-plugin-icon-manager.js" ></script>
    <script src="../jelly/jelly-speaker-plugin-icon-manager-inputer.js" ></script>
    <script src="../jelly/jelly-speaker-plugin-alarm-manager.js" ></script>
    <script src="../jelly/jelly-speaker-plugin-db-manager.js" ></script>
    <script src="../jelly/jelly-speaker-plugin-xhr-manager.js" ></script>
    <script src="../jelly/jelly-speaker-plugin-command-search-test.js" ></script>
    <script src="../jelly/jelly-speaker-plugin-word-chain.js" ></script> 
    <script>
         var jelly = new Jelly({modeNeedsToCallName: true, validTimeToCommand: 4000, storagePath: '/jelly/icon'});
    </script>
    ```

##### Sample A
- Example)
    *@* *!* *@*
    ```html
    <script>
        jelly.addPlugin([
            new Jelly.PluginStats(),
            new Jelly.PluginCommandSearchTest('search', '검색'),
            new Jelly.PluginWordChain(),
            new Jelly.PluginAlarmManager(),
            new Jelly.PluginDBManager(),
            new Jelly.PluginXHRManager(),
            new Jelly.PluginIconManager()
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
        .loadIcon()
        .detect()
        .start();
    </script>
  
    <body>
        <div>
            Hi! Hello!
        </div>
        <button id="jelly-button-setup" class="jelly-button button-style-3" data-preview="설정" data-jelly-click="open-plugin-icon-manager">
            <div class="ani-spin">⚙️</div>
        </button>
    </body>
    ``` 

    