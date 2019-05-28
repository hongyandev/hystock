
var ENV = 'TEST'; // TEST 测试  PROD 正式

// 系统配置
var config = (function(){
    var PARAM = {
        TEST:{
            url:'http://dev.jxc.sge.cn/'
        },
        PROD:{
            url:''

        }
    };
    return {
        PARAM:PARAM[ENV]
    }
})();

// 合成api
function genAPI(apiName,apiAction){
    return config.PARAM.url + apiName;
}




