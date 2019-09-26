const addUser = function () {
    var tpl = Handlebars.compile($("#add-user-tpl").html());
    layer.open({
        type: 1,
        title:"新增",
        skin: 'layui-layer-molv', //加上边框
        area: ['400px', '200px'], //宽高
        content: tpl(),
        btn: ['确定', '取消'],
        yes: function(index, layero){
            if(formSave()){
                layer.close(index);
            }
        },
        btn2: function(index, layero){
            layer.close(index);
        },
        success: function(layero, index){
            $(layero).find(".easyui-textbox").textbox();
        }
    });
};
const formSave = function() {
    var isValid = $("#addUserForm").form('validate');
    if(isValid){
        var data = $("#addUserForm").serializeObject();
        $.ajax({
            type: "post",
            url: genAPI('settings/user/add'),
            cache:false,
            dataType:"json",
            data: JSON.stringify(data),
            contentType : "application/json;charset=UTF-8",
            success:function (res) {
                layer.msg(res.message);
                if(res.code==200){
                    $('#dataTable').datagrid('reload');
                }
            },
            error:function () {
                isValid = false;
            }
        });
    }
    return isValid;
};
const modifyStatus = function (status) {
    var data = $("#dataTable").datagrid('getSelections');
    var ids = "";
    for (var i = 0; i < data.length; i++) {
        ids += ',' + data[i].id;
    }
    if (ids) {
        $.ajax({
            type: "POST",
            url: genAPI(status === 9 ? 'settings/user/freeze' : 'settings/user/unfreeze'),
            data: {
                ids: ids.substring(1),
                status: status
            },
            cache: false,
            dataType: "json",
            success: function (res) {
                if (res.code == 200) {
                    layer.msg(status === 9 ? "禁用成功" : "启用成功");
                    $("#dataTable").datagrid("reload").datagrid("clearSelections");

                } else {
                    layer.alert(res.message, {skin: 'layui-layer-molv'});
                }
            }
        });
    } else {
        layer.msg("请至少选中一行进行操作");
    }
};
$(function () {
    $("#status").combobox({
        valueField: 'key',
        textField: 'value',
        cache: false,
        editable: false,
        panelHeight: 'auto',
        data: [{
            key: '',
            value: '全部'
        }, {
            key: '1',
            value: '启用'
        }, {
            key: '9',
            value: '禁用'
        }]
    });
    $("#query").textbox({
        prompt: '输入客户代码或名称'
    });
    var dg = $("#dataTable").datagrid({
        url: genAPI('settings/user/page'),
        pagination: true,
        rownumbers: true,
        fitColumns: false,
        showFooter: true,
        method: 'post',
        fit: true,
        loadFilter: function (data) {
            if (data.code == 200) {
                return data.data
            } else {
                layer.msg(data.message);
                return []
            }
        },
        columns: [[
            {
                field: 'ck',
                checkbox: true,
                width: 80
            }, {
                field: "id",
                hidden: true
            }, {
                field: "status",
                hidden: true
            },
            {
                field: "khdm",
                title: "客户代码",
                align: 'center',
                width: 120
            },
            {
                field: "companyName",
                title: "客户名称",
                align: 'center',
                width: 200
            },
            {
                field: "startDate",
                title: "建帐日期",
                align: 'center',
                width: 120,
                formatter: function (v, r, i) {
                    if (v)
                        return moment(v).format('YYYY-MM-DD');
                }
            },
            {
                field: "statusDisplay",
                title: "状态",
                align: 'center',
                width: 120
            },
            {
                field: "note",
                title: "备注",
                width: 200
            }
        ]]
    });
    $("#searchBtn").bind('click', function () {
        var data = $("#searchFrom").serializeObject();
        dg.datagrid('load', data);
    });
});