function refreshNum() {
    $.ajax({
        type: "POST",
        url: genAPI('settings/getBaseNextNo'),
        data: {
            type: 14
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

$(function () {
    $.ajaxSetup({
        headers: {
            uid: $.cookie('uid'),
            token: $.cookie('jwt')
        }
    });
    refreshNum();
    $('#customerName').customerPanel({
        type: 'customer',
        el: "#customer",
        onSelected: function (tar, row) {
            console.info(row);
        }
    });
    $("#payee").combobox({
        url: genAPI('user/comboList'),
        valueField: 'uid',
        textField: 'realName',
        cache: false,
        editable: false,
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
                    return intToFloat(v);
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
                    // receiptDetail.datagrid('getPanel').find('button.datagrid-row-delete').bind('click',function (event) {
                    //     layer.msg('delete'+$(this).attr('index'));
                    //     event.stopPropagation();
                    // });
                    // console.info(receiptDetail.datagrid('getData'))
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
                receiptBills.datagrid('deleteRow', index).datagrid('statistics', ["nowCheck"]);
            }
        },
        onAfterEdit:function (rowIndex, rowData, changes) {
            if(changes["nowCheck"]){
                receiptDetail.datagrid('statistics', ["nowCheck"]);
            }
        },
        onLoadSuccess: function (data) {
            receiptDetail.datagrid('statistics', ["nowCheck"]);
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
                width: 150
            },
            {
                field: "billPrice",
                title: "单据金额",
                width: 150,
                align: 'right',
                formatter: function (v, r, i) {
                    return intToFloat(v);
                }
            },
            {
                field: "hasCheck",
                title: "已核销金额",
                width: 150,
                align: 'right',
                formatter: function (v, r, i) {
                    return intToFloat(v);
                }
            },
            {
                field: "notCheck",
                title: "未核销金额",
                width: 150,
                align: 'right',
                formatter: function (v, r, i) {
                    return intToFloat(v);
                }
            },
            {
                field: "nowCheck",
                title: "本次核销金额",
                width: 150,
                align: 'right',
                formatter: function (v, r, i) {
                    return intToFloat(v);
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
                text: '核销单据',
                iconCls: 'fa fa-folder-open fa-lg',
                handler: function () {}
            }
        ]
    })
        .datagrid('enableCellEditing')
        .datagrid('loadData', {
            total: 0,
            rows:[],
            footer: [{
                billNumber: '<b>合计:</b>',
                nowCheck:0,
                isFooter: true
            }]
        });
});