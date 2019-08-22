function refreshNum() {
    $.ajax({
        type:"POST",
        url:genAPI('settings/getBaseNextNo'),
        data:{
            type:14
        },
        cache: false,
        dataType: "json",
        success:function (res) {
            if(res.code==200){
                $("#number_span").html(res.data.number);
                $("#number").val(res.data.number)
            }
        }
    });
}
// 客户选择面板
;(function($) {
    function init(target, opts) {
        var tar = $(target);
        tar.data('opts', opts );
        var form = $('<form><div class="form-inline"></div></form>');
        var cType = $('<div class="form-group" style="margin-left: 10px"><label>'+opts.typeEnum[opts.type].name+'类别：</label><input /></div>');
        cType.find('input')
            .addClass('easyui-combotree form-control')
            .css('width', '150px');
        cType.appendTo(form.find('.form-inline'));
        var cName = $('<div class="form-group" style="margin-left: 10px"><label>'+opts.typeEnum[opts.type].name+'名称：</label><input /></div>');
        cName.find('input')
            .addClass('easyui-textbox form-control')
            .css('width', '200px');
        cName.appendTo(form.find('.form-inline'));
        var searchBtn = $('<div class="form-group" style="margin-left: 10px"><button class="btn btn-sm">搜索</button></div>');
        searchBtn.find('button')
            .addClass('btn btn-success btn-search');
        searchBtn.appendTo(form.find('.form-inline'));
        var body = $('<div></div>')
            .css('display', 'none');
        form.appendTo(body);
        var datagrid = $('<div class="easyui-layout" style="margin-top: 10px"><table class="easyui-datagrid"></table></div>')
        datagrid.appendTo(body);
        body.appendTo($('body'));
        cType.find('input').combotree({
            prompt: '请选择'+opts.typeEnum[opts.type].name+'类别',
            url:genAPI('settings/categoryList'),
            valueField:'id',
            textField:'name',
            parentField:'pid',
            panelWidth:'200',
            loadFilter:function (data) {
                return data.data
            },
            formatter:function(node){
                return node.name;
            },
            queryParams:{
                typeNum: opts.typeEnum[opts.type].typeNum
            }
        });
        cName.find('input').textbox({
            prompt: '请输入'+opts.typeEnum[opts.type].name+'名称'
        });
        var grid = datagrid.find('table');
        grid.datagrid({
            url:genAPI(opts.typeEnum[opts.type].queryUrl),
            method:'post',
            fitColumns:true,
            striped:true,
            nowrap:true,
            pagination:true,
            rownumbers:true,
            singleSelect:true,
            // height:400,
            loadFilter:function (data) {
                return data.data
            },
            queryParams:{
                query: cName.find('input').val(),
                category: cType.find('input').val()
            },
            columns: opts.typeEnum[opts.type].columns,
        });
        var textbox = tar.textbox({
            readonly:true,
            buttonIcon:'icon-search'
        });
        textbox.next('span').find('.textbox-button').bind('click',function () {
            if(body.is(':hidden')){
                body.show();
            } else {
                body.hide();
            }
            layer.open({
                type: 1,
                title:"选择"+opts.typeEnum[opts.type].name,
                skin: 'layui-layer-molv', //加上边框
                area: ['88%', '80%'], //宽高
                content: body,
                btn: ['选中并关闭', '取消'],
                yes: function(index, layero){

                },
                btn2: function(index, layero){
                    layer.close(index);
                },
                end: function () {
                    body.hide();
                },
                success: function(layero, index){
                    grid.datagrid('resize',{height:($(layero).find('.layui-layer-content').height()-70)});
                }
            })

        });
    };
    $.fn.customerPanel = function(opts, param) {
        if (typeof opts === 'string') {
            var method = $.fn.customerPanel.methods[opts];
            if (method) {
                return method(this, param);
            }
        } else {
            opts = $.extend({}, $.fn.customerPanel.defaults, opts || {} );
            return this.each(function () {
                init(this, opts);
            });
        }
    };
    $.fn.customerPanel.methods = {
        getValue: function(tar){
            return $(tar[0]).val();
        },
        setValue: function(tar, param){
            return $(tar[0]).val(param)
        }
    };
    $.fn.customerPanel.defaults = {
        typeEnum: {
            customer: {
                name:'客户',
                queryUrl:'settings/customerList',
                typeNum:1
            },
            vendor: {
                name:'供应商',
                queryUrl:'settings/vendorList',
                typeNum:2,
                columns:[[
                    { field:'category2',title:'供应商类别',hidden:true},
                    { field:'code',title:'供应商编号',width:100},
                    { field:'name',title:'供应商名称',width:200},
                    { field:'contact',title:'首要联系人',width :200},
                    { field:'mobile',title:'手机',width:200},
                    { field:'phone',title:'座机',width:200},
                    { field:'im',title:'QQ/微信/email',width:200,hidden:true},
                    { field:'status',title:'状态',width:200,formatter:function (value,row,index) {
                            if (value=="1"){
                                return "启用";
                            } else {
                                return "禁用";
                            }
                        }}
                ]]
            }
        }
    };
})(jQuery)
$(function () {
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }
    });
    refreshNum();
    $('#customer').customerPanel({
        type:'vendor'
    });
});