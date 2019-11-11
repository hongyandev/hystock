var theRequest = getRequest();
var transType = theRequest.transType;

function exportExcel() {
    $("#dataTable").datagrid('toExcel', '供应商对账单.xls')
}

$(function () {
    $("#transType").val(transType);
    $("#beginDate").datebox({
        value: moment().date(1).format('YYYY-MM-DD')
    });
    $(".beginDate").html(moment().date(1).format('YYYY-MM-DD'));
    $(".endDate").html(moment().format('YYYY-MM-DD'));
    $('#customerName').customerPanel({
        type: 'vendor',
        el: "#customer",
        required: true,
        onSelected: function (tar, row) {
            console.info(row);
            /*$("#allPayment").numberbox('setValue', isNaN(Number(row.pay)) ? 0 : row.pay);
            $("#totalPayment").numberbox('setValue', 0);
            var billsRows = $("#receiptBills").datagrid('getRows');
            if (billsRows.length > 0) {
                $("#receiptBills").datagrid('loadData', {
                    total: 0,
                    rows: [],
                    footer: [{
                        accountName: '<b>合计:</b>',
                        payment: 0,
                        isFooter: true
                    }]
                });
            }*/
        }
    });

    var dg = $("#dataTable").datagrid({
        rownumbers: true,
        fitColumns: false,
        showFooter: true,
        singleSelect:true,
        method: 'post',
        loadFilter: function (data) {
            if (data.code == 200) {
                return data.data
            } else {
                layer.msg(data.message);
            }
        },
        columns: [[
            {
                field: "id",
                hidden: true
            },
            {
                field: "date",
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
                field: "transName",
                title: "业务类型",
                align: 'center',
                width: 150
            },
            {
                field: "totalAmount",
                title: "采购金额",
                align: 'center',
                width: 100
            },
            {
                field: "disAmount",
                title: "优惠金额",
                align: 'center',
                width: 100
            },
            {
                field: "amount",
                title: "应付金额",
                align: 'center',
                width: 100
            },
            {
                field: "rpAmount",
                title: "实际付款金额",
                align: 'center',
                width: 120
            },
            {
                field: "inAmount",
                title: "应付款余额",
                align: 'center',
                width: 120
            },
            {
                field: "note",
                title: "备注",
                align:'center',
                width: 200,
                hidden:true
            }
        ]],
        toolbar: '#tb',
        onLoadSuccess:function (data) {
            console.info(data);
            $(".supplierName").html(data.customerName);
            $(".contactName").html(data.contactName);
            $(".mobile").html(data.mobile);
            $(".address").html(data.address);
        },
        onClickRow:function (rowIndex,rowData) {
            console.info(rowData)
        }
    });
    $("#searchBtn").bind('click', function () {
        var data = $("#searchFrom").serializeObject();
        // console.info(data);
        $(".beginDate").html(data.beginDate);
        $(".endDate").html(data.endDate);
        dg.datagrid('options').url = genAPI('report/sup_account');
        dg.datagrid('load', data);
    });
})