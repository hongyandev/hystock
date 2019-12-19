
var ENV = 'LOCAL'; // TEST 测试  PROD 正式

// 系统配置
var config = (function(){
    var PARAM = {
        LOCAL:{
            url:'http://localhost:8081/'
        },
        TEST:{
            url:'http://dev.jxc.sge.cn/'
        },
        PROD:{
            url:'http://jxc.sge.cn/'
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

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
$(function () {
    try {
        moment.locale('zh-cn');
        $.ajaxSetup({
            headers: {
                uid: $.cookie('uid'),
                token: $.cookie('jwt')
            }
        });
    }catch(err){}
})




