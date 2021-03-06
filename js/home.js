const quickLink = function (transType) {
    layer.msg(transType);
    // [3, 5, 14, 15, 7, 8, 9, 16, 17]
    var tabTitle, url, params;
    switch (transType) {
        case 3:
            tabTitle = '销售单记录';
            url = "webapp/sales/saleHistory.html";
            break;
        case 5:
            tabTitle = '采购单记录';
            url = "webapp/purchase/purchaseHistory.html";
            break;
        case 14:
            tabTitle = '收款单记录';
            url = "webapp/scm/billHistory.html";
            params = {
                transType: transType
            };
            break;
        case 15:
            tabTitle = '付款单记录';
            url = "webapp/scm/billHistory.html";
            params = {
                transType: transType
            };
            break;
        case 7:
            tabTitle = '调拨单记录';
            url = "webapp/warehouse/stoTransHistory.html";
            break;
        case 8:
            tabTitle = '其他入库单记录';
            url = "webapp/warehouse/inOrderHistory.html";
            break;
        case 9:
            tabTitle = '其他出库单记录';
            url = "webapp/warehouse/outOrderHistory.html";
            break;
        case 16:
            tabTitle = '其他收入单记录';
            url = "webapp/scm/billHistory.html";
            params = {
                transType: transType
            };
            break;
        case 17:
            tabTitle = '其他支出单记录';
            url = "webapp/scm/billHistory.html";
            params = {
                transType: transType
            };
            break;
        default:
            return;
    }
    addTopTab("#tabs", tabTitle, url, params);
};
$(function () {
    var _i = 0, _time = 'day', saChart, puChart, chartOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter: '{b}<br />{a0}: {c0} 元<br />{a1}: {c1} 元'
        },
        legend: {
            data: []
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        yAxis: {
            type: 'value'
        },
        xAxis: {
            type: 'category',
            data: []
        },
        series: [
            {
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight'
                    }
                },
                data: []
            },
            {
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight'
                    }
                },
                data: []
            }
        ]
    };
    const _count = [3, 5, 14, 15, 7, 8, 9, 16, 17], panels = _.chunk(_count, 4), pages = panels.length, chartTheme = 'macarons';
    const getGoodsMsgData = function (i) {
        _i += i;
        if (_i === -1) {
            _i = 0;
        }
        if (_i === 0) {
            $('.pre').hide();
        } else {
            $('.pre').show();
        }
        if (_i < pages - 1) {
            $('.next').show();
        } else {
            $('.next').hide();
        }
        $('.goodsMsg-dtl').find('.name,.number').html('');
        var data = {
            types: panels[_i]
        };
        $.ajax({
            type: 'POST',
            url: genAPI('query/goodsMsg'),
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function (res) {
                if (res.code == 200) {
                    const data = res.data;
                    $('.goodsMsg-dtl .panel').each(function (i, el) {
                        if (i < data.length) {
                            $(el).find('.name').html('未审核' + data[i]['name']);
                            $(el).find('.number').html('<a href="javascript:quickLink(' + data[i]['type'] + ')">' + data[i]['number'] + '</a>');
                        }
                    });
                } else {
                    layer.msg(res.message);
                }
            },
            error: function (err) {
                layer.msg(err);
            }
        });
    };
    var homeChart = $('#home-chart').tabs({
        tools: '#tab-tools',
        onSelect: function (title, index) {
            loadChart();
        }
    });
    $('#mm').menu({
        onClick: function (item) {
            $('#mb').find('.l-btn-text').html(item.text);
            _time = item.name;
            loadChart()
        }
    })
    $('.pre').click(function () {
        getGoodsMsgData(-1);
    });
    $('.next').click(function () {
        getGoodsMsgData(1);
    });
    getGoodsMsgData(_i);
    const loadChart = function () {
        var tab = homeChart.tabs('getSelected');
        var index = homeChart.tabs('getTabIndex', tab);
        switch (index) {
            case 0:
                if (saChart === undefined) {
                    saChart = echarts.init(document.getElementById("saChart"), chartTheme);
                    saChart.setOption(chartOption);
                }
                saChart.showLoading();
                $.ajax({
                    type: 'POST',
                    url: genAPI('query/homeChartData'),
                    data: {
                        index: index,
                        time: _time
                    },
                    success: function (res) {
                        saChart.hideLoading();
                        if (res.code == 200) {
                            var data = res.data;
                            saChart.setOption({
                                legend: {
                                    data: ['销售', '销售退货']
                                },
                                xAxis: {
                                    data: data.xAxis
                                },
                                series: [
                                    {
                                        name: '销售',
                                        data: data.a0
                                    },
                                    {
                                        name: '销售退货',
                                        data: data.a1
                                    }
                                ]
                            });
                        } else {
                            layer.msg(res.message);
                        }
                    },
                    error: function (err) {
                        layer.msg(err);
                    }
                });
                break;
            case 1:
                if (puChart === undefined) {
                    puChart = echarts.init(document.getElementById("puChart"), chartTheme);
                    puChart.setOption(chartOption);
                }
                puChart.showLoading();
                $.ajax({
                    type: 'POST',
                    url: genAPI('query/homeChartData'),
                    data: {
                        index: index,
                        time: _time
                    },
                    success: function (res) {
                        puChart.hideLoading();
                        if (res.code == 200) {
                            var data = res.data;
                            puChart.setOption({
                                legend: {
                                    data: ['采购', '采购退货']
                                },
                                xAxis: {
                                    data: data.xAxis
                                },
                                series: [
                                    {
                                        name: '采购',
                                        data: data.a0
                                    },
                                    {
                                        name: '采购退货',
                                        data: data.a1
                                    }
                                ]
                            });
                        } else {
                            layer.msg(res.message);
                        }
                    },
                    error: function (err) {
                        layer.msg(err);
                    }
                });
                break;
        }
    }
    loadChart();
    const loadKeyData = function () {
        let loading = layer.load();
        $.ajax({
            type: 'GET',
            url: genAPI('query/homeKeyData'),
            success: function (res) {
                layer.close(loading);
                if (res.code == 200) {
                    if (res.data.length > 0) {
                        var tpl = Handlebars.compile($("#home-key-data-tpl").html());
                        $("#home-key-data").html(tpl(res));
                    }
                } else {
                    layer.msg(res.message);
                }
            },
            error: function (err) {
                layer.msg(err);
            }
        });
    }
    loadKeyData();
    $('#refreshKeyData').click(function () {
        loadKeyData();
    })
});