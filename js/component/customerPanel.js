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
        var searchBtn = $('<div class="form-group" style="margin-left: 10px"><button type="button">搜索</button></div>');
        searchBtn.find('button')
            .addClass('btn btn-sm btn-success btn-search')
            .bind('click',function () {
                datagrid.datagrid('options').url = genAPI(opts.typeEnum[opts.type].queryUrl);
                datagrid.datagrid('reload', {
                    query: cName.find('input').val(),
                    category: cType.find('input').val()
                });
            });;
        searchBtn.appendTo(form.find('.form-inline').css('margin-bottom', '10px'));
        var body = $('<div></div>')
            .css('display', 'none');
        form.appendTo(body);
        var datagrid = $('<table class="easyui-datagrid"></table>')
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
                if(data.code == 200){
                    return data.data
                } else {
                    layer.msg(data.message);
                }
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
        datagrid.datagrid({
            method:'post',
            fitColumns:true,
            striped:true,
            nowrap:true,
            pagination:true,
            rownumbers:true,
            singleSelect:true,
            loadFilter:function (data) {
                if(data.code == 200){
                    return data.data
                } else {
                    layer.msg(data.message);
                }
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
                area: ['80%', '80%'], //宽高
                content: body,
                btn: ['选中并关闭', '取消'],
                yes: function(index, layero){
                    var row = datagrid.datagrid('getSelected');
                    if(!row){
                        layer.alert('请选中一行操作',{skin:'layui-layer-molv'});
                        return false;
                    }
                    tar.textbox('setValue', row.name);
                    if(opts.el){
                        $(opts.el).val(row.id);
                    }
                    if(opts.onSelected){
                        opts.onSelected(target, row);
                    }
                    layer.close(index);
                },
                btn2: function(index, layero){
                    layer.close(index);
                },
                end: function () {
                    body.hide();
                },
                success: function(layero, index){
                    datagrid.datagrid('resize',{height:($(layero).find('.layui-layer-content').height()-50)});
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
            return $(tar).textbox('getValue');
        },
        setValue: function(tar, param){
            return $(tar).textbox('setValue', param);
        }
    };
    $.fn.customerPanel.defaults = {
        typeEnum: {
            customer: {
                name:'客户',
                queryUrl:'settings/customerList',
                typeNum:1,
                columns:[[
                    { field:'ID',title:'客户ID',hidden:true},
                    { field:'category1',title:'客户类别',hidden:true},
                    { field:'code',title:'客户代码',width:100},
                    { field:'name',title:'客户名称',width:200},
                    { field:'employeeName',title:'销售人员',width:200},
                    { field:'contact',title:'首要联系人',width:200},
                    { field:'mobile',title:'手机',width:200},
                    { field:'phone',title:'座机',width:200},
                    { field:'im',title:'QQ/微信/email',width:200,hidden:true},
                    { field:'status',title:'状态',width:200,formatter: function(value,row,index){
                            return value=="1" ? "启用" : "禁用";
                        }}
                ]]
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
                            return value=="1" ? "启用" : "禁用";
                        }}
                ]]
            }
        }
    };
})(jQuery)