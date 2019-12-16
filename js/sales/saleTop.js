function changeColumns(topType) {
    let columns;
    switch (topType) {
        case 'salerTop':
            columns = [
                [{
                    field: 'num',
                    title: '排名',
                    rowspan: 2,
                    align: 'center',
                    width: 80
                }, {
                    field: 'operator',
                    title: '业务员',
                    rowspan: 2,
                    align: 'center',
                    width: 80
                }, {
                    title: '销售不含税',
                    align: 'center',
                    colspan: 2
                }, {
                    title: '销售不含税毛利',
                    align: 'center',
                    colspan: 3
                }, {
                    title: '销售含税',
                    align: 'center',
                    colspan: 2
                }, {
                    title: '销售含税毛利',
                    align: 'center',
                    colspan: 3
                }, {
                    title: '销售回款',
                    align: 'center',
                    colspan: 3
                }],
                [{
                    field: 'saleAmount',
                    title: '销售金额',
                    align: 'center',
                    formatter: function (value) {
                        return rowNumberFormat(value, 2)
                    },
                    width: 80

                }, {
                    field: 'saleAmountPercent',
                    title: '占比 %',
                    align: 'center',
                    width: 80
                }, {
                    field: 'saleGp',
                    title: '销售毛利额',
                    align: 'center',
                    formatter: function (value) {
                        return rowNumberFormat(value, 2)
                    },
                    width: 80
                }, {
                    field: 'saleGpRate',
                    title: '毛利率 %',
                    align: 'center',
                    width: 80
                }, {
                    field: 'saleGpPercent',
                    title: '占比 %',
                    align: 'center',
                    width: 80
                }, {
                    field: 'saleAmountTax',
                    title: '销售金额',
                    align: 'center',
                    formatter: function (value) {
                        return rowNumberFormat(value, 2)
                    },
                    width: 80
                }, {
                    field: 'saleAmountTaxPercent',
                    title: '占比 %',
                    align: 'center',
                    width: 80
                }, {
                    field: 'saleGpTax',
                    title: '销售毛利额',
                    align: 'center',
                    formatter: function (value) {
                        return rowNumberFormat(value, 2)
                    },
                    width: 80
                }, {
                    field: 'saleGpTaxRate',
                    title: '毛利率 %',
                    align: 'center',
                    width: 80
                }, {
                    field: 'saleGpTaxPercent',
                    title: '占比 %',
                    align: 'center',
                    width: 80
                }, {
                    field: 'rpAmount',
                    title: '销售回款',
                    align: 'center',
                    formatter: function (value) {
                        return rowNumberFormat(value, 2)
                    },
                    width: 80
                }, {
                    field: 'rpAmountRate',
                    title: '回款率 %',
                    align: 'center',
                    width: 80
                }, {
                    field: 'rpAmountPercent',
                    title: '占比 %',
                    align: 'center',
                    width: 80
                }]];
            break;
        default:
            columns = [[
                {
                    title: "排名",
                    align: 'center',
                    width: 80
                }
            ]];
            break;
    }
    return columns;
}
$(function () {
    $("#beginDate").datebox({
        value: moment().date(1).format('YYYY-MM-DD')
    });
    $("#topType").combobox({
        valueField: 'key',
        textField: 'value',
        cache: false,
        editable: false,
        panelHeight: 'auto',
        data: [{
            key: 'salerTop',
            value: '业务员销售排行榜'
        }]
    }).combobox('setValue', 'salerTop');
    var dg = $("#dataTable").datagrid({
        fitColumns: false,
        loadMsg: '正在查询，请稍后...',
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
                field: 'num',
                title: "排名",
                align: 'center',
                width: 80
            }
        ]]
    });
    $("#searchBtn").bind('click', function () {
        var data = $("#searchFrom").serializeObject();
        // console.info(data);
        // dg.datagrid('options').;
        dg.datagrid({
            url: genAPI('report/saleTop'),
            queryParams: data,
            columns: changeColumns(data.topType)
        });
    });
});