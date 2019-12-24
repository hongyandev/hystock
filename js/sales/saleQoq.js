function changeColumns(params) {
    let arr = [{
        field: 'code',
        title: '商品编号',
        width: 100
    },{
        field: 'goodsName',
        title: '商品名称',
        width: 100
    },{
        field: 'specs',
        title: '规格',
        width: 100
    }, {
        field: 'unitName',
        title: '单位',
        width: 80
    }, {
        field: 'total',
        title: '时段总金额',
        width: 80
    }];
    let obj = {
        align: 'center',
        width: 100
    };
    let upType = params.qoqType;
    let beginDate = params.beginDate;
    let endDate = params.endDate || new Date();
    if (upType && beginDate && endDate) {
        let begin = moment(beginDate);
        let end = moment(endDate);
        switch (upType) {
            case 'day':
                while (begin.isBefore(end)) {
                    let day = _.clone(obj);
                    _.extend(day, {
                        field: begin.format('YYYY-MM-DD'),
                        title: begin.format('YYYY年MM月DD日')
                    })
                    arr.push(day)
                    begin = begin.add(1, 'd');
                }
                let _day = _.clone(obj);
                _.extend(_day, {
                    field: end.format('YYYY-MM-DD'),
                    title: end.format('YYYY年MM月DD日')
                });
                arr.push(_day);
                break;
            case 'week':
                let a = begin.startOf('month');
                let b = moment(beginDate).endOf('month');
                let i = 1;
                while (a.isBefore(b)) {
                    let week = _.clone(obj);
                    _.extend(week, {
                        field: a.format('YYYY-MM-')+i,
                        title: a.format('YYYY年MM月')+'<br/>第'+i+'周'
                    });
                    arr.push(week);
                    a = a.add(1, 'w');
                    i++;
                }
                break;
            case 'month':
                let c = begin.startOf('month');
                let d = end.endOf('month');
                while (c.isBefore(d)) {
                    let month = _.clone(obj);
                    _.extend(month, {
                        field: c.format('YYYY-MM'),
                        title: c.format('YYYY年MM月')
                    });
                    arr.push(month);
                    c = c.add(1, 'M');
                }
                break;
            case 'year':
                let e = begin.startOf('year');
                let f = end.endOf('year');
                while (e.isBefore(f)) {
                    let year = _.clone(obj);
                    _.extend(year, {
                        field: e.format('YYYY'),
                        title: e.format('YYYY年')
                    });
                    arr.push(year);
                    e = e.add(1, 'y');
                }
                break;
            default:
                break;
        }
    }
    return arr;
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
            key: 'month',
            value: '按月统计'
        }, {
            key: 'year',
            value: '按年统计'
        }],
        onSelect: function (record) {
            $("#beginDate").datebox('reset');
            $("#endDate").datebox('reset').datebox(record.key === 'week' ? 'disable' : 'enable')
        }
    }).combobox('setValue', 'day');
    var dg = $("#dataTable").datagrid({
        rownumbers: true,
        fitColumns: false,
        fit: true,
        frozenColumns: [[{
            field: 'code',
            title: '商品编号',
            halign: 'center',
            width: 100
        },{
            field: 'name',
            title: '商品名称',
            halign: 'center',
            width: 100
        },{
            field: 'specs',
            title: '规格',
            halign: 'center',
            width: 100
        }, {
            field: 'unitName',
            title: '单位',
            align: 'center',
            width: 80
        }, {
            field: 'total',
            title: '时段总金额',
            halign: 'center',
            align: 'right',
            width: 80
        }]]
    });
    $("#searchBtn").bind('click', function () {
        var data = $("#searchFrom").serializeObject();
        var loading = layer.load();
        $.ajax({
            type: "post",
            url: genAPI('report/saleQoq'),
            cache: false,
            dataType: "json",
            data: data,
            success: function (res) {
                layer.close(loading);
                if(res.code==200){
                    let columns = [];
                    _.forEach(res.data.columns, function(value, key) {
                        columns.push({
                            field: key,
                            title: value,
                            halign: 'center',
                            align: 'right',
                            width: 100
                        })
                    });
                    dg.datagrid({
                        columns: [columns],
                        data: res.data.rows
                    });
                } else {
                    layer.msg(res.message)
                }
            },
            error: function (err) {
                layer.close(loading);
            }
        });
    });
});