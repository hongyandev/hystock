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
        // showFooter: true,
        idField: 'id',
        onSelectCell: function (index, field) {
            if (field === 'action'){
                layer.msg(index + "");
            }
        },
        columns: [[
            {
                field: 'action',
                width: 38,
                align: 'center',
                formatter: function (value, row, index) {
                    return '<button class="btn btn-xs btn-danger datagrid-row-delete" type="button"><i class="fa fa-times"></i></button>';
                }
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
                editor: {
                    type: "numberbox",
                    options: {
                        value: 0,
                        precision: 0
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
                    console.info(receiptDetail.datagrid('getData'))
                }
            }
        ]
    }).datagrid('enableCellEditing')
});