
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


    $.extend($.fn.datagrid.methods, {
        endEditing: function (jq) {
            return jq.each(function(){
                var opts = $(this).datagrid('options');
                if (opts.editIndex == undefined){return true}
                if ($(this).datagrid('validateRow', opts.editIndex)){
                    $(this).datagrid('endEdit', opts.editIndex);
                    opts.editIndex = undefined;
                    return true;
                } else {
                    return false;
                }
            })
        },
        append: function(jq, row) {
            jq.each(function(){
                var dg = $(this);
                var opts = dg.datagrid('options');
                if (dg.datagrid('endEditing')) {
                    dg.datagrid('appendRow', row);
                    opts.editIndex = dg.datagrid('getRows').length-1;
                    var fields = dg.datagrid('getColumnFields',true).concat(dg.datagrid('getColumnFields'));
                    dg.datagrid('selectRow', opts.editIndex).datagrid('editCell', {
                        index: opts.editIndex,
                        field: fields[0]
                    });
                }
            })
        },
        removeit: function(jq) {
            jq.each(function(){
                var opts = $(this).datagrid('options');
                if (opts.editIndex == undefined){return}
                $(this).datagrid('cancelEdit', opts.editIndex)
                    .datagrid('deleteRow', opts.editIndex);
                opts.editIndex = undefined;
            })
        },
        editCell: function (jq, param) {
            return jq.each(function(){
                var dg = $(this);
                var opts = dg.datagrid('options');
                opts.editIndex = param.index;
                var fields = dg.datagrid('getColumnFields',true).concat(dg.datagrid('getColumnFields'));
                //console.info(fields);
                var colNum;
                for(var i=0; i<fields.length; i++){
                    var col = dg.datagrid('getColumnOption', fields[i]);
                    col.editor1 = col.editor;
                    if (fields[i] != param.field){
                        col.editor = null;
                    } else {
                        colNum = i;
                    }
                }
                dg.datagrid('beginEdit', param.index);
                var ed = dg.datagrid('getEditor', param);
                if (ed){
                    var target = $(ed.target);
                    if($(ed.target).hasClass('textbox-text')){
                        target.focus();
                    }else if ($(ed.target).hasClass('textbox-f')){
                        target.textbox('textbox').focus();
                    }else{
                        target.focus();
                    }

                    $('.datagrid-editable .textbox,.datagrid-editable .datagrid-editable-input,.datagrid-editable .textbox-text,.datagrid-cell-c5-contactAddress .textbox-text').bind('keydown', function(e){
                        var code = e.keyCode || e.which;
                        var opts = dg.datagrid('options');
                        var mark = true;
                        if (ed.type == "validatebox") {
                            var eventFun = $(ed.target).validatebox("options").eventFun;
                            if (eventFun) {
                                mark = eventFun($(this).val(),e);
                            }
                        }
                        if(code == 13 && mark) {
                            var nextColNum = colNum + 1;
                            var nextField = dg.datagrid('getColumnOption', fields[nextColNum]);
                            //console.info(nextField);
                            while(nextColNum ++, nextColNum < fields.length && nextField.editor == undefined){
                                nextField = dg.datagrid('getColumnOption', fields[nextColNum]);
                            }
                            if(nextField == null){
                                if(opts.lastFieldFun != undefined) {
                                    opts.lastFieldFun(dg, param.index, fields[0]);
                                }
                            }else if(nextField.editor != undefined){
                                opts.onClickCell.call(dg, param.index, nextField.field)
                            }
                        }
                    });
                }
                for(var i=0; i<fields.length; i++){
                    var col = dg.datagrid('getColumnOption', fields[i]);
                    col.editor = col.editor1;
                }
            });
        },
        enableCellEditing: function(jq){
            return jq.each(function(){
                var dg = $(this);
                var opts = dg.datagrid('options');
                if(!opts.oldOnClickCell) {
                    opts.oldOnClickCell = opts.onClickCell;
                }
                opts.onClickCell = function(index, field){
                    if (opts.editIndex != undefined){
                        if (dg.datagrid('validateRow', opts.editIndex)){
                            dg.datagrid('endEdit', opts.editIndex);
                            opts.editIndex = undefined;
                        } else {
                            return;
                        }
                    }
                    dg.datagrid('selectRow', index).datagrid('editCell', {
                        index: index,
                        field: field
                    });
                    opts.editIndex = index;
                    opts.oldOnClickCell.call(this, index, field);
                }
            });
        },
        statistics: function(jq, fields) {
            return jq.each(function(){
                var dg = $(this);
                var data = dg.datagrid("getData");
                if(!data.footer){
                    data.footer = [{"isFooter":true}];
                }
                var rows = dg.datagrid('getFooterRows');
                if(data.rows){
                    $.each(fields, function (i, field) {
                        var sum = 0;
                        $.each(data.rows, function(i, n){
                            sum = accAdd(sum,n[field]||0);
                        });
                        rows[0][field] = intToFloat(Number(String(sum).replace(/^(.*\..{4}).*$/,"$1")));
                    })
                }
                dg.datagrid("reloadFooter");
          })
        },
        addEditor : function(jq, param) {
            if (param instanceof Array) {
                $.each(param, function(index, item) {
                    var e = $(jq).datagrid('getColumnOption', item.field);
                    e.editor = item.editor; });
            } else {
                var e = $(jq).datagrid('getColumnOption', param.field);
                e.editor = param.editor;
            }
        },
        removeEditor : function(jq, param) {
            if (param instanceof Array) {
                $.each(param, function(index, item) {
                    var e = $(jq).datagrid('getColumnOption', item);
                    e.editor = {};
                });
            } else {
                var e = $(jq).datagrid('getColumnOption', param);
                e.editor = {};
            }
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
function intToFloat(val){
    return new Number(val).toFixed(2);
}

//新增tab
function addTopTab(dg,tabTitle,url) {
    var jq = top.jQuery;
    if(!jq(dg).tabs('exists',tabTitle)){
        jq(dg).tabs('add',{
            title:tabTitle,
            content:'<iframe scrolling="auto" frameborder="0"  src="'+url+'" style="width:100%;height:90%;overflow: scroll"></iframe>',
            closable:true
        });
    }else{
        jq(dg).tabs('select',tabTitle);
        jq('#mm-tabupdate').click();
    }
}


//结束日期不能早于开始日期
$.extend($.fn.validatebox.defaults.rules, {
    equaldDate: {
        validator: function (value, param) {
            var d1 = $(param[0]).datetimebox('getValue');  //获取开始时间
            return value >= d1;  //有效范围为大于开始时间的日期
        },
        message: '结束日期不能早于开始日期!'
    }
})
