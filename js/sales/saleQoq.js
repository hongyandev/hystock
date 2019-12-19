function changeColumns(params) {
    let columns;
    switch (params.qoqType) {
        case 'day':
            break;
        case 'week':
            break;
        case 'month':
            break;
        case 'year':
            break;
        default:
            columns = [
                {
                    field: 'num',
                    title: "序号",
                    align: 'center',
                    width: 80
                }
            ];
            break;
    }
    return columns;
}
$(function () {
    $("#beginDate").datebox({
        value: moment().date(1).format('YYYY-MM-DD')
    }).datebox('calendar').calendar({
        validator: function(date){
            var end = moment($("#endDate").val() || new Date());
            return moment(date).isBefore(end)
        }
    });
    $("#endDate").datebox().datebox('calendar').calendar({
        validator: function(date){
            var bigin = moment($("#beginDate").val() || new Date());
            return moment(date).isAfter(bigin);
        }
    });
    $("#qoqType").combobox({
        valueField: 'key',
        textField: 'value',
        cache: false,
        editable: false,
        panelHeight: 'auto',
        data: [{
            key: 'day',
            value: '按日统计'
        }, {
            key: 'week',
            value: '按周统计'
        }, {
            key: 'month',
            value: '按月统计'
        }, {
            key: 'year',
            value: '按年统计'
        }]
    }).combobox('setValue', 'day');
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
                title: "序号",
                align: 'center',
                width: 80
            }
        ]]
    });
    $("#searchBtn").bind('click', function () {
        var data = $("#searchFrom").serializeObject();
        dg.datagrid({
            url: genAPI('report/saleQoq'),
            queryParams: data,
            columns: changeColumns(data)
        });
    });
});