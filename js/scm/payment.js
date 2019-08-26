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
    $("#receiptBills").datagrid('loadData', {
        total: 0,
        rows:[],
        footer: [{
            billNumber: '<b>合计:</b>',
            isFooter: true
        }]
    });
    refreshNum();
}
function saveReceipt() {
    if($('#receiptFrom').form('validate')){
        var data = $('#receiptFrom').serializeObject();
        $.extend(data, {
            detail: $("#receiptDetail").datagrid('acceptChanges').datagrid('getRows'),
            bills: $("#receiptBills").datagrid('getRows')
        })
        if(data.detail.length == 0){
            layer.msg('请添加结算明细');
            return;
        }
        if(data.bills.length == 0) {
            layer.msg('请选择源单据')
            return;
        }
        console.info(data)
        $.ajax({
            type:"post",
            url: genAPI(data.id ? 'receipt/modify' : 'receipt/create') ,
            contentType:"application/json",
            data:JSON.stringify(data),
            success:function (res) {
                if(res.code==200){
                    $("#receiptId").val(res.data.id);
                }
                layer.msg(res.message);
            }
        })
    } else {
        layer.msg("单据信息填写不完整")
    }
}
function auditReceipt(sign) {
    console.info(sign)
}
function historyReceipt() {
    addTopTab("#tabs",'收款单记录',"webapp/scm/billHistory.html?type="+$("#transType").val());
}
$(function () {
    $.ajaxSetup({
        headers: {
            uid: $.cookie('uid'),
            token: $.cookie('jwt')
        }
    });
    refreshNum();
    $('#customerName').customerPanel({
        type: 'vendor',
        el: "#customer",
        required: true,
        onSelected: function (tar, row) {
            $("#totalArrears").numberbox('setValue', isNaN(Number(row.pay))?0:row.pay);
            var billsRows = $("#receiptBills").datagrid('getRows');
            if(billsRows.length > 0){
                $("#receiptBills").datagrid('loadData', {
                    total: 0,
                    rows:[],
                    footer: [{
                        accountName: '<b>合计:</b>',
                        payment:0,
                        isFooter: true
                    }]
                });
            }
        }
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
            }
        },
        onAfterEdit:function (rowIndex, rowData, changes) {
            if(changes["payment"]){
                receiptDetail.datagrid('statistics', ["payment"]);
            }
        },
        onLoadSuccess: function (data) {
            receiptDetail.datagrid('statistics', ["payment"]);
        },
        columns: [[
            {
                field: 'action',
                width: 38,
                align: 'center',
                formatter: function (value, row, index) {
                    return !row.isFooter ? '<button class="btn btn-xs btn-danger" type="button"><i class="fa fa-times"></i></button>' : '';
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
    var receiptBills = $("#receiptBills");
    receiptBills.datagrid({
        rownumbers: true,
        singleSelect: true,
        fitColumns: false,
        showFooter: true,
        onSelectCell: function (index, field) {
            if (field === 'action'){
                receiptBills.datagrid('deleteRow', index).datagrid('statistics', ["billPrice","hasCheck","notCheck","nowCheck"]);
            }
        },
        onAfterEdit:function (rowIndex, rowData, changes) {
            if(changes["nowCheck"]){
                receiptBills.datagrid('statistics', ["billPrice","hasCheck","notCheck","nowCheck"]);
            }
        },
        onLoadSuccess: function (data) {
            receiptDetail.datagrid('statistics', ["billPrice","hasCheck","notCheck","nowCheck"]);
        },
        columns: [[
            {
                field: 'action',
                width: 38,
                align: 'center',
                formatter: function (value, row, index) {
                    return !row.isFooter ? '<button class="btn btn-xs btn-danger" type="button"><i class="fa fa-times"></i></button>' : '';
                }
            },
            {
                field: "billId",
                hidden: true
            },
            {
                field: "billNumber",
                title: "源单编号",
                width: 200
            },
            {
                field: "billTransType",
                hidden: true
            },
            {
                field: "billTransTypeName",
                title: "业务类别",
                width: 80
            },
            {
                field: "billDate",
                title: "单据日期",
                width: 150,
                formatter: function (v,r,i) {
                    if(v)
                        return moment(v).format('YYYY-MM-DD');
                }
            },
            {
                field: "billPrice",
                title: "单据金额",
                width: 150,
                align: 'right',
                formatter: function (v, r, i) {
                    return rowNumberFormat(v, r);
                }
            },
            {
                field: "hasCheck",
                title: "已核销金额",
                width: 150,
                align: 'right',
                formatter: function (v, r, i) {
                    return rowNumberFormat(v, r);
                }
            },
            {
                field: "notCheck",
                title: "未核销金额",
                width: 150,
                align: 'right',
                formatter: function (v, r, i) {
                    return rowNumberFormat(v, r);
                }
            },
            {
                field: "nowCheck",
                title: "本次核销金额",
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
            }
        ]],
        toolbar: [
            {
                text: '选择源单',
                handler: function () {
                    var customerId = $("#customer").val();
                    if(!customerId){
                        layer.msg('请选择购货单位');
                        return;
                    }
                    var template = Handlebars.compile($("#bills-search-panel").html());
                    layer.open({
                        type: 1,
                        title:"选择源单",
                        skin: 'layui-layer-molv', //加上边框
                        area: ['80%', '80%'], //宽高
                        content: template({
                            billType: 5,
                            customerId: customerId
                        }),
                        btn: ['选中并关闭', '取消'],
                        yes: function(index, layero){
                            var dg = $(layero).find(".easyui-datagrid");
                            var row = dg.datagrid("getSelected")
                            if(!row){
                                layer.msg('请选中一行操作');
                                return false;
                            }
                            var rows = $("#receiptBills").datagrid('getRows');
                            var index = -1;
                            $.each(rows, function (i, o) {
                                if(o.billId == row.billId){
                                    index = i;
                                }
                            });
                            if(index != -1) {
                                layer.msg("此单已选取，请选择其他单据。");
                                return;
                            }
                            $("#receiptBills")
                                .datagrid('appendRow', row)
                                .datagrid('statistics', ["billPrice","hasCheck","notCheck"]);
                            layer.close(index);
                        },
                        btn2: function(index, layero){
                            layer.close(index);
                        },
                        end: function () {
                        },
                        success: function(layero, index){
                            $(layero).find("input.begindate").datebox({
                                value: moment().date(1).format('YYYY-MM-DD')
                            });
                            $(layero).find("input.enddate").datebox();
                            $(layero).find(".easyui-textbox").textbox({
                                prompt: '支持以逗号（英文格式）分隔多个单据号查询',
                                width: _.multiply($(layero).find('.layui-layer-content').width(), 0.8)
                            });
                            var dg = $(layero).find(".easyui-datagrid");
                            dg.datagrid({
                                fitColumns:true,
                                striped:true,
                                nowrap:true,
                                pagination:true,
                                rownumbers:true,
                                singleSelect:true,
                                url : genAPI('query/billsReceipt'),
                                method:'post',
                                queryParams: $(layero).find("form").serializeObject(),
                                loadFilter:function (data) {
                                    if(data.code == 200){
                                        return data.data
                                    } else {
                                        layer.msg(data.message);
                                    }
                                },
                                columns: [[
                                    {
                                        field: "billId",
                                        hidden: true
                                    },
                                    {
                                        field: "billNumber",
                                        title: "源单编号",
                                        width: 200
                                    },
                                    {
                                        field: "billTransType",
                                        hidden: true
                                    },
                                    {
                                        field: "billTransTypeName",
                                        title: "业务类别",
                                        width: 80
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
                                        field: "billPrice",
                                        title: "单据金额",
                                        align: 'right',
                                        formatter: function (v, r, i) {
                                            return rowNumberFormat(v, r);
                                        },
                                        width: 120
                                    },
                                    {
                                        field: "hasCheck",
                                        title: "已核销金额",
                                        align: 'right',
                                        formatter: function (v, r, i) {
                                            return rowNumberFormat(v, r);
                                        },
                                        width: 120
                                    },
                                    {
                                        field: "notCheck",
                                        title: "未核销金额",
                                        align: 'right',
                                        formatter: function (v, r, i) {
                                            return rowNumberFormat(v, r);
                                        },
                                        width: 120
                                    }
                                ]]
                            }).datagrid('resize',{
                                height: _.subtract($(layero).find('.layui-layer-content').height(), 90)
                            });
                            $(layero).find("button.searchBtn").bind("click", function () {
                                var data = $(layero).find("form").serializeObject();
                                dg.datagrid('load', data);
                            })
                        }
                    })
                }
            }
        ]
    })
        .datagrid('enableCellEditing')
        .datagrid('loadData', {
            total: 0,
            rows:[],
            footer: [{
                billNumber: '<b>合计:</b>',
                isFooter: true
            }]
        });
    $("#operationLogs").bind("click", function () {
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
                    if(res.code===200){
                        var tpl = Handlebars.compile($("#operation-logs-tpl").html());
                        if(res.data.length > 0){
                            layer.tips(tpl(res),
                                that, {
                                    tips: [1, '#3595CC'],
                                    time: 3000
                                });
                        }
                    }else{
                        layer.msg(res.message)
                    }
                }
            });
        } else {
            layer.tips("暂无操作日志", that, {
                tips: [1, '#3595CC'],
                time: 3000
            });
        }
    })
});