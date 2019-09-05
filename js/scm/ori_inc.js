function refreshNum() {
    $.ajax({
        type: "POST",
        url: genAPI('settings/getBaseNextNo'),
        data: {
            type: $("#transType").val()
        },
        cache: false,
        dataType: "json",
        success: function (res) {
            if (res.code == 200) {
                $("#number_span").html(res.data.number);
                $("#number").val(res.data.number)
            }
        }
    });
}
function createReceipt() {
    $('#receiptFrom').form('reset');
    $("#receiptDetail").datagrid('loadData', {
        total: 0,
        rows:[],
        footer: [{
            accountName: '<b>合计:</b>',
            isFooter: true
        }]
    });
    refreshNum();
}
function saveReceipt(sign) {
    if($('#receiptFrom').form('validate')){
        var data = $('#receiptFrom').serializeObject();
        $.extend(data, {
            detail: $("#receiptDetail").datagrid('acceptChanges').datagrid('getRows'),
        })
        if(data.detail.length == 0){
            layer.msg('请添加结算明细');
            return;
        }
        $.ajax({
            type:"post",
            url: sign=='audit' ? genAPI('receipt/check') : genAPI(data.id ? 'receipt/modify' : 'receipt/create') ,
            contentType:"application/json",
            data:JSON.stringify(data),
            success:function (res) {
                if(res.code==200){
                    $("#receiptId").val(res.data.id);
                    $("#status").val(res.data.status);
                    if(sign=='audit'){
                        refresh(res.data.id);
                    }
                }
                layer.msg(res.message);
            }
        })
    } else {
        layer.msg("单据信息填写不完整")
    }
}
function auditReceipt(sign) {
    if(sign=='audit'){
        saveReceipt(sign);
    } else {
        $.ajax({
            type: "POST",
            url: genAPI('receipt/reBatchCheck'),
            data: {
                ids: $("#receiptId").val(),
                transType: $("#transType").val()
            },
            cache: false,
            dataType: "json",
            success: function (res) {
                if (res.code == 200) {
                    layer.msg("反审核成功");
                    refresh($("#receiptId").val());
                } else {
                    layer.alert(res.message, {skin: 'layui-layer-molv'});
                }
            }
        });
    }
}
function refresh(id) {
    var jq = top.jQuery;
    var tab = jq('#tabs').tabs('getSelected');
    jq('#tabs').tabs('update', {
        tab: tab,
        options: {
            content:'<iframe scrolling="auto" frameborder="0"  src="webapp/scm/ori_inc.html?id='+id+'" style="width:100%;height:90%;overflow: scroll"></iframe>'
        }
    })
    tab.panel('refresh');
}
function historyReceipt() {
    addTopTab("#tabs",'其他收入单记录',"webapp/scm/billHistory.html?transType="+$("#transType").val());
}
function deleteReceipt() {
    if($("#receiptId").val() && $("#status").val() == 1) {
        $.ajax({
            type: "POST",
            url: genAPI('receipt/delete'),
            data: {
                id: $("#receiptId").val()
            },
            cache: false,
            dataType: "json",
            success: function (res) {
                if (res.code == 200) {
                    layer.msg("删除成功");
                    createReceipt();
                } else {
                    layer.alert(res.message, {skin: 'layui-layer-molv'});
                }
            }
        });
    } else {
        layer.msg("单据当前状态不可删除");
    }
}
function statistics() {
    var dFooter = $("#receiptDetail").datagrid('getFooterRows');
    if (dFooter) {
        var payment = Number(dFooter[0].payment);
        $("#totalProceeds").numberbox('setValue', isNaN(payment) ? 0 : payment);
    }
}
$(function () {
    var theRequest = getRequest();
    var id = theRequest.id;
    if (id === undefined) {
        refreshNum();
    }
    $('#customerName').customerPanel({
        el: "#customer",
        type: 'customer',
        required: true
    });
    $("#payee").combobox({
        url: genAPI('user/comboList'),
        valueField: 'uid',
        textField: 'realName',
        cache: false,
        editable: false,
        panelHeight: 'auto',
        required:true,
        loadFilter: function (res) {
            if (res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
            }
        }
    });
    var receiptDetail = $('#receiptDetail');
    receiptDetail.datagrid({
        rownumbers: true,
        singleSelect: true,
        fitColumns: false,
        showFooter: true,
        onSelectCell: function (index, field) {
            if (field === 'action'){
                receiptDetail.datagrid('deleteRow', index).datagrid('statistics', ["payment"]);
                statistics();
            }
        },
        onAfterEdit:function (rowIndex, rowData, changes) {
            if(changes["payment"]){
                receiptDetail.datagrid('statistics', ["payment"]);
                statistics();
            }
        },
        onLoadSuccess: function (data) {
            receiptDetail.datagrid('statistics', ["payment"]);
            statistics();
        },
        columns: [[
            {
                field: 'action',
                width: 38,
                align: 'center',
                formatter: function (value, row, index) {
                    return (!row.isFooter && $("#status").val()=='1') ? '<button class="btn btn-xs btn-danger" type="button"><i class="fa fa-times"></i></button>' : '';
                }
            },
            {
                field: "account",
                hidden: true
            },
            {
                field: "accountName",
                title: "结算账户",
                width: 200,
                editor: {
                    type: "combobox",
                    options: {
                        valueField: 'name',
                        textField: 'name',
                        url: genAPI('settings/account/list'),
                        method: 'post',
                        editable: false,
                        panelHeight: 'auto',
                        loadFilter: function (res) {
                            return res.code === 200 ? res.data : [];
                        },
                        onSelect: function (rec) {
                            var rows = receiptDetail.datagrid('getData').rows;
                            if (rows.length > 0) {
                                rows[receiptDetail.datagrid('cell').index].account = rec.id
                            }
                        }
                    }
                }
            },
            {
                field: "payment",
                title: "结算金额",
                width: 150,
                align: 'right',
                formatter: function (v, r, i) {
                    return rowNumberFormat(v, r);
                },
                editor: {
                    type: "numberbox",
                    options: {
                        value: 0,
                        precision: 2
                    }
                }
            },
            {
                field: "wayName",
                title: "结算方式",
                width: 150,
                editor: {
                    type: "combobox",
                    options: {
                        valueField: 'name',
                        textField: 'name',
                        panelHeight: 'auto',
                        url: genAPI('settings/categoryList'),
                        method: 'post',
                        editable: false,
                        loadFilter: function (res) {
                            return res.code === 200 ? res.data : [];
                        },
                        queryParams: {
                            typeNum: 6
                        },
                        onSelect: function (rec) {
                            var rows = receiptDetail.datagrid('getData').rows;
                            if (rows.length > 0) {
                                rows[receiptDetail.datagrid('cell').index].way = rec.id
                            }
                        }
                    }
                }
            },
            {
                field: "settlement",
                title: "结算号",
                width: 200,
                editor: {
                    type: 'text'
                }
            }
        ]],
        toolbar: [
            {
                text: '添加',
                iconCls: 'fa fa-plus fa-lg',
                handler: function () {
                    receiptDetail.datagrid('appendRow', {
                        account: '',
                        payment: 0,
                        way: '',
                        settlement: ''
                    }).datagrid('editCell', {
                        index: receiptDetail.datagrid('getRows').length - 1,
                        field: 'accountName'
                    });
                }
            }
        ]
    })
        .datagrid('enableCellEditing')
        .datagrid('loadData', {
            total: 0,
            rows:[],
            footer: [{
                accountName: '<b>合计:</b>',
                payment:0,
                isFooter: true
            }]
        });
    if (id) {
        $.ajax({
            type: 'post',
            url: genAPI('receipt/get'),
            data: {
                id: id,
                transType: $("#transType").val()
            },
            success: function (res) {
                if (res.code === 200) {
                    $("#receiptFrom").form('load',res.data);
                    $("#number_span").html(res.data.number);
                    if(res.data.status == '2'){
                        $("#mark").addClass("has-audit");
                        receiptDetail.datagrid('disableCellEditing');
                        receiptDetail.datagrid('getPanel').find("div.datagrid-toolbar a").eq(0).hide();
                    }
                    receiptDetail.datagrid('loadData',res.data.detail).datagrid('statistics', ["payment"]);
                    statistics();
                } else {
                    layer.msg(res.message)
                }
            }
        });
    }
    var tips;
    $("#operationLogs").bind("click", function () {
        if(tips){
            layer.close(tips);
            tips = undefined;
            return;
        }
        var that = this;
        var receiptId = $("#receiptId").val();
        if(receiptId){
            $.ajax({
                type:'post',
                url: genAPI('query/queryInvOpeLog'),
                data:{
                    invId: receiptId,
                    vType: $("#transType").val()
                },
                success:function (res) {
                    if (res.code === 200) {
                        var tpl = Handlebars.compile($("#operation-logs-tpl").html());
                        if (res.data.length > 0) {
                            tips = layer.tips(tpl(res),
                                that, {
                                    tips: [1, '#3595CC'],
                                    time: 0
                                });
                        }
                    } else {
                        layer.msg(res.message)
                    }
                }
            });
        } else {
            tips = layer.tips("暂无操作日志", that, {
                tips: [1, '#3595CC'],
                time: 3000
            });
        }
    })
})