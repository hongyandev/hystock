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
    $("#query").textbox({
        prompt: '输入单据号或客户名称查询'
    });
    var dg = $("#dataTable");
    dg.datagrid({
        pagination: true,
        rownumbers: true,
        fitColumns: false,
        showFooter: true,
        method:'post',
        loadFilter:function (data) {
            if(data.code == 200){
                return data.data
            } else {
                layer.msg(data.message);
            }
        },
        columns: [[
            {
                checkbox: true,
                width: 80
            },{
                field: "id",
                hidden: true
            },
            {
                field: "billDate",
                title: "单据日期",
                width: 120,
                formatter: function (v,r,i) {
                    if(v)
                        return moment(v).format('YYYY-MM-DD');
                }
            },
            {
                field: "number",
                title: "单据编号",
                width: 150
            },
            {
                field: "billTransTypeName",
                title: "客户",
                width: 200
            },
            {
                field: "billPrice",
                title: "结算金额",
                align: 'right',
                formatter: function (v, r, i) {
                    return rowNumberFormat(v, r);
                },
                width: 120
            },
            {
                field: "notCheck",
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