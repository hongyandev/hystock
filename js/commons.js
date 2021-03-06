
$(function () {
    // 自定义的校验器
    var reg = /^1[3|4|5|7|8|9][0-9]{9}$/;
    $.extend($.fn.validatebox.defaults.rules, {
        midLength: {
            validator: function(value, param){
                return value.length >= param[0] && value.length <= param[1];
            },
            message: ''
        } ,
        equalLength : {
            validator: function(value, param){
                return value.length == param[0];
            },
            message: '密码必须为4个字符!'
        },
        phonenumber: {
            validator: function(value, param){
                return reg.test(value);
                },
            message: '手机号输入有误！'
        }
    });

});
//解决numberbox小数点问题
$(function () {
    $.fn.numberbox.defaults.filter = function(e){
        var opts = $(this).numberbox('options');
        var s = $(this).numberbox('getText');
        if (e.which == 45){    //-
            return (s.indexOf('-') == -1 ? true : false);
        }
        var c = String.fromCharCode(e.which);
        if (c == opts.decimalSeparator){
            return (s.indexOf(c) == -1 ? true : false);
        } else if (c == opts.groupSeparator){
            return true;
        } else if ((e.which >= 48 && e.which <= 57 && e.ctrlKey == false && e.shiftKey == false) || e.which == 0 || e.which == 8) {
            return true;
        } else if (e.ctrlKey == true && (e.which == 99 || e.which == 118)) {
            return true;
        } else {
            return false;
        }
    }
});

/**
 ** 加法函数，用来得到精确的加法结果
 ** 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
 ** 调用：accAdd(arg1,arg2)
 ** 返回值：arg1加上arg2的精确结果
 **/
function accAdd(arg1, arg2) {
    if(arg1 == undefined || arg2 == undefined){
        return 0;
    }
    var r1, r2, m, c;
    try {
        r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    c = Math.abs(r1 - r2);
    m = Math.pow(10, Math.max(r1, r2));
    if (c > 0) {
        var cm = Math.pow(10, c);
        if (r1 > r2) {
            arg1 = Number(arg1.toString().replace(".", ""));
            arg2 = Number(arg2.toString().replace(".", "")) * cm;
        } else {
            arg1 = Number(arg1.toString().replace(".", "")) * cm;
            arg2 = Number(arg2.toString().replace(".", ""));
        }
    } else {
        arg1 = Number(arg1.toString().replace(".", ""));
        arg2 = Number(arg2.toString().replace(".", ""));
    }
    return (arg1 + arg2) / m;
}

//给Number类型增加一个add方法，调用起来更加方便。
Number.prototype.add = function (arg) {
    return accAdd(arg, this);
};

/**
 ** 减法函数，用来得到精确的减法结果
 ** 说明：javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。这个函数返回较为精确的减法结果。
 ** 调用：accSub(arg1,arg2)
 ** 返回值：arg1加上arg2的精确结果
 **/
function accSub(arg1, arg2) {
    var r1, r2, m, n;
    try {
        r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

// 给Number类型增加一个sub方法，调用起来更加方便。
Number.prototype.sub = function (arg) {
    return accSub(arg, this);
};

/**
 ** 乘法函数，用来得到精确的乘法结果
 ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
 ** 调用：accMul(arg1,arg2)
 ** 返回值：arg1乘以 arg2的精确结果
 **/
function accMul(arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
        m += s1.split(".")[1].length;
    }
    catch (e) {
    }
    try {
        m += s2.split(".")[1].length;
    }
    catch (e) {
    }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
}

// 给Number类型增加一个mul方法，调用起来更加方便。
Number.prototype.mul = function (arg) {
    return accMul(arg, this);
};

/**
 ** 除法函数，用来得到精确的除法结果
 ** 说明：javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。这个函数返回较为精确的除法结果。
 ** 调用：accDiv(arg1,arg2)
 ** 返回值：arg1除以arg2的精确结果
 **/
function accDiv(arg1, arg2) {
    var t1 = 0, t2 = 0, r1, r2;
    try {
        t1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
    }
    try {
        t2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
    }
    with (Math) {
        r1 = Number(arg1.toString().replace(".", ""));
        r2 = Number(arg2.toString().replace(".", ""));
        return (r1 / r2) * pow(10, t2 - t1);
    }
}

//给Number类型增加一个div方法，调用起来更加方便。
Number.prototype.div = function (arg) {
    return accDiv(this, arg);
};
//保留两位小数
function intToFloat(value, precision){
    if(value===undefined)
        value=0;
    if(precision===undefined)
        precision=2;
    if(isNaN(Number(value)))
        return;
    return Number(value).toFixed(precision);
}
function rowNumberFormat(value, row, precision) {
    return row.isFooter ? '<b>'+intToFloat(value, precision)+'</b>' : intToFloat(value, precision);
}
//新增tab
function addTopTab(dg,tabTitle,url,params) {
    var jq = top.jQuery;
    if(jq(dg).tabs('exists',tabTitle)){
        jq(dg).tabs('close',tabTitle);
    }
    if(params != undefined && typeof params === "object") {
        var str = "";
        for (var item in params){
            str += (str.length == 0 ? "" : "&") + item + "=" +params[item];
        }
        url += (url.indexOf("?") == -1 ? "?" : "&") + str;
    }
    jq(dg).tabs('add',{
        title:tabTitle,
        cache: false,
        content:'<iframe scrolling="auto" frameborder="0"  src="'+url+'" style="width:100%;height:90%;overflow: scroll"></iframe>',
        closable:true
    });
}


//结束日期不能早于开始日期
$.extend($.fn.validatebox.defaults.rules, {
    equaldDate: {
        validator: function (validator, param) {
            var d1 = $(param[0]).datetimebox('getValue');  //获取开始时间
            return value >= d1;  //有效范围为大于开始时间的日期
        },
        message: '结束日期不能早于开始日期!'
    },
    gt: {
        validator: function (value, param) {
            return value > $(param[0]).val();
        },
        message: '不能小于等于最小值'
    },
    lt: {
        validator: function (value, param) {
            return value < $(param[0]).val();
        },
        message: '不能大于等于最大值'
    },
    gtEq: {
        validator: function (value, param) {
            return value >= $(param[0]).val();
        },
        message: '不能小于最小值'
    },
    ltEq: {
        validator: function (value, param) {
            return value <= $(param[0]).val();
        },
        message: '不能大于最大值'
    }
});

var getRequest = function () {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}
