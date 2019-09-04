var theRequest = getRequest();
var transType = theRequest.transType;
function modifyReceipt() {
    var row = $("#dataTable").datagrid('getSelections');
    if (row.length == 1) {
        var tabTitle, url;
        switch (transType) {
            case '14':
                tabTitle = '收款单';
                url = "webapp/scm/receipt.html?id=" + row[0].id;
                break;
            case '15':
                tabTitle = '付款单';
                url = "webapp/scm/payment.html?id=" + row[0].id;
                break;
            case '16':
                tabTitle = '其他收入单';
                url = "webapp/scm/ori_inc.html?id=" + row[0].id;
                break;
            case '17':
                tabTitle = '其他支出单';
                url = "webapp/scm/ori_exp.html?id=" + row[0].id;
                break;
            default:
                return;
        }
        var dg = "#tabs";
        addTopTab(dg, tabTitle, url);
        $("#dataTable").datagrid("clearSelections");
    } else {
        layer.msg("请选中一行进行编辑");
        $("#dataTable").datagrid("clearSelections");
    }
}

function deleteReceipt() {
    var row = $("#dataTable").datagrid('getSelections');
    if (row.length == 1) {
        if(row[0].status == 1) {
            $.ajax({
                type: "POST",
                url: genAPI('receipt/delete'),
                data: {
                    id: row[0].id
                },
                cache: false,
                dataType: "json",
                success: function (res) {
                    if (res.code == 200) {
                        layer.msg("删除成功");
                        $("#dataTable").datagrid("reload").datagrid("clearSelections");
                    } else {
                        layer.alert(res.message, {skin: 'layui-layer-molv'});
                    }
                }
            });
        } else {
            layer.msg("单据当前状态不可删除");
        }
    } else {
        layer.msg("请选中一行删除");
        $("#dataTable").datagrid("clearSelections");
    }
}

function auditReceipt(sign) {
    var data = $("#dataTable").datagrid('getSelections');
    var ids = "";
    for (var i = 0; i < data.length; i++) {
        ids += ',' + data[i].id;
    }
    if (ids) {
        $.ajax({
            type: "POST",
            url: genAPI(sign === 'audit' ? 'receipt/batchCheck' : 'receipt/reBatchCheck'),
            data: {
                ids: ids.substring(1),
                transType: transType
            },
            cache: false,
            dataType: "json",
            success: function (res) {
                if (res.code == 200) {
                    layer.msg(sign === 'audit' ? "审核成功" : "反审核成功");
                    $("#dataTable").datagrid("reload").datagrid("clearSelections");

                } else {
                    layer.alert(res.message, {skin: 'layui-layer-molv'});
                }
            }
        });
    } else {
        layer.msg("请至少选中一行进行操作");
    }
}

$(function () {
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
                var data = [{
                    realName: '全部',
                    uid: ''
                }]
                $.each(res.data, function (i, o) {
                    data.push(o)
                })
                return data;
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
            key: '',
            value: '全部'
        }, {
            key: '1',
            value: '未审核'
        }, {
            key: '2',
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
        method: 'post',
        fit: true,
        loadFilter: function (data) {
            if (data.code == 200) {
                return data.data
            } else {
                layer.msg(data.message);
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
                field: "repDate",
                title: "单据日期",
                align: 'center',
                width: 120,
                formatter: function (v, r, i) {
                    if (v)
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
                field: "totalAmount",
                title: "结算金额",
                align: 'right',
                formatter: function (v, r, i) {
                    return rowNumberFormat(v, r);
                },
                width: 120
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
        // console.info(data);
        dg.datagrid('options').url = genAPI('receipt/queryPage');
        dg.datagrid('load', data);
    });
})