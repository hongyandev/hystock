$(function () {
    $.ajaxSetup({
        headers: {
            uid: $.cookie('uid'),
            token: $.cookie('jwt')
        }
    });
    var theRequest = getRequest();
    var transType = theRequest.transType;
    $("#transType").val(transType);
    $("#beginDate").datebox({
        value: moment().date(1).format('YYYY-MM-DD')
    });
    $("#operator").combobox({
        url: genAPI('user/comboList'),
        valueField: 'uid',
        textField: 'realName',
        cache: false,
        editable: false,
        panelHeight: 'auto',
        loadFilter: function (res) {
            if (res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
            }
        }
    });
    $("#status").combobox({
        valueField: 'key',
        textField: 'value',
        cache: false,
        editable: false,
        panelHeight: 'auto',
        data: [{
            key: 1,
            value: '未审核'
        },{
            key: 2,
            value: '已审核'
        }]
    });
    $("#query").textbox({
        prompt: '输入单据号或客户名称查询'
    });
    var dg = $("#dataTable").datagrid({
        pagination: true,
        rownumbers: true,
        fitColumns: false,
        showFooter: true,
        method:'post',
        fit:true,
        loadFilter:function (data) {
            if(data.code == 200){
                return data.data
            } else {
                layer.msg(data.message);
            }
        },
        columns: [[
            {
                field : 'ck',
                checkbox: true,
                width: 80
            },{
                field: "id",
                hidden: true
            },
            {
                field: "repDate",
                title: "单据日期",
                align: 'center',
                width: 120,
                formatter: function (v,r,i) {
                    if(v)
                        return moment(v).format('YYYY-MM-DD');
                }
            },
            {
                field: "number",
                title: "单据编号",
                align: 'center',
                width: 150
            },
            {
                field: "customerName",
                title: "客户",
                align: 'center',
                width: 200
            },
            {
                field: "totalPayment",
                title: "结算金额",
                align: 'right',
                formatter: function (v, r, i) {
                    return rowNumberFormat(v, r);
                },
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
        console.info(data);
        dg.datagrid('options').url = genAPI('receipt/queryPage');
        dg.datagrid('load', data);
    });
})