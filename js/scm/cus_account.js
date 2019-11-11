var theRequest = getRequest();
var transType = theRequest.transType;

function exportExcel() {
    $("#dataTable").datagrid('toExcel', '客户对账单.xls')
}

$(function () {
    $("#transType").val(transType);
    $("#beginDate").datebox({
        value: moment().date(1).format('YYYY-MM-DD')
    });
    $(".beginDate").html(moment().date(1).format('YYYY-MM-DD'));
    $(".endDate").html(moment().format('YYYY-MM-DD'));
    $('#customerName').customerPanel({
        type: 'customer',
        el: "#customer",
        required: true,
        onSelected: function (tar, row) {
            console.info(row)
        }
    });

    var dg = $("#dataTable").datagrid({
        rownumbers: true,
        fitColumns: false,
        shownumbers:true,
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
                width: 100
            },
            {
                field: "源销货订单号",
                title: "源销货订单号",
                align: 'center',
                width: 150,
                hidden:true
            },
            {
                field: "totalAmount",
                title: "销售金额",
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
                field: "客户承担费用",
                title: "客户承担费用",
                align: 'center',
                width: 120,
                hidden:true
            },
            {
                field: "amount",
                title: "应收金额",
                align: 'center',
                width: 100
            },
            {
                field: "rpAmount",
                title: "实际收款金额",
                align: 'center',
                width: 120
            },
            {
                field: "inAmount",
                title: "应收款余额",
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
            $(".customerName").html(data.customerName);
            $(".contactName").html(data.contactName);
            $(".mobile").html(data.mobile);
            $(".address").html(data.address);
        }
    });
    $("#searchBtn").bind('click', function () {
        var data = $("#searchFrom").serializeObject();
        // console.info(data);
        $(".beginDate").html(data.beginDate);
        $(".endDate").html(data.endDate);
        dg.datagrid('options').url = genAPI('report/cus_account');
        dg.datagrid('load', data);
    });
})