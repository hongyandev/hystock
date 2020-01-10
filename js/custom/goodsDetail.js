var tips;

function bathSet(ele) {
    closeTips();
    var col = $(ele).is('.bathMin') ? 'minInventory' : 'maxInventory'
    tips = layer.tips('<div class="input-group input-group-sm">' +
        '      <input id="bath' + col + '" type="number" class="form-control" placeholder="请输入..." value="0">' +
        '      <span class="input-group-btn">' +
        '        <button class="btn btn-default" type="button" onclick="bathSetVal(\'' + col + '\')">确定</button>' +
        '        <button class="btn btn-default" type="button" onclick="closeTips()">取消</button>' +
        '      </span>\n' +
        '    </div>',
        ele, {
            tips: [3, '#FAFAFA'],
            anim: -1,
            time: 0
        });
}

function bathSetVal(expr) {
    var value = $('#bath' + expr).val();
    if (value < 0) {
        layer.msg('不能为负数');
        return;
    }
    var inventoryWarning = $("#inventoryWarning");
    var rows = inventoryWarning.datagrid("getRows");
    _.forEach(rows, function (item) {
        item[expr] = value;
    });
    closeTips();
    inventoryWarning.datagrid("loadData", {
        code: 200,
        data: rows
    });
}

function closeTips() {
    if (tips) {
        layer.close(tips);
        tips = undefined;
    }
}

$(function () {
    $.ajaxSetup({
        headers: {
            uid: $.cookie('uid'),
            token: $.cookie('jwt')
        }
    });
    $(".easyui-textbox").textbox({
        cls: 'formfield',
        labelWidth: 100,
        labelPosition: 'before',
        labelAlign: 'right'
    });
    $(".easyui-combobox").combobox({
        cls: 'formfield',
        labelWidth: 100,
        labelPosition: 'before',
        labelAlign: 'right',
        panelHeight: 'auto',
        cache: false,
        editable: false
    });
    // 鸿雁产品代码
    $('#cpdm').textbox({
        buttonIcon: 'icon-search',
        onClickButton: function () {

        }
    });
    // 首选仓库
    $("#storage").combobox({
        loadFilter: function (data) {
            return data.code == 200 ? data.data : [];
        },
        url: genAPI('settings/storageList'),
        valueField: 'id',
        textField: 'name'
    });
    // 商品类别
    $("#category").combotree({
        cls: 'formfield',
        labelWidth: 100,
        labelPosition: 'before',
        labelAlign: 'right',
        panelHeight: 'auto',
        cache: false,
        editable: false,
        loadFilter: function (data) {
            return data.code == 200 ? data.data : [];
        },
        url: genAPI('settings/categoryList'),
        valueField: 'id',
        textField: 'name',
        queryParams: {
            typeNum: 3
        },
        formatter: function (node) {
            var opts = $('#category').combotree('options');
            return node[opts.textField]
        }
    });
    //单计量单位
    $("#unitSingle").combobox({
        loadFilter: function (data) {
            return data.code == 200 ? data.data : [];
        },
        url: genAPI('settings/unitList'),
        valueField: 'id',
        textField: 'unitName',
        queryParams: {
            isGroup: 0
        },
        formatter: function (row) {
            var opts = $(this).combobox('options');
            return row[opts.textField]
        },
        onSelect: function (record) {
            $("#unit").val(record.id);
            goodsPrice.datagrid('load', {
                goodsId: $("#id").val() || 0,
                unit: record.id
            })
        }
    });
    //多计量单位
    $("#unitGroup").combobox({
        loadFilter: function (data) {
            return data.code == 200 ? data.data : [];
        },
        url: genAPI('settings/unitList'),
        valueField: 'id',
        textField: 'unitNames',
        queryParams: {
            isGroup: 1,
            isCombo: 1
        },
        formatter: function (row) {
            var opts = $(this).combobox('options');
            return row[opts.textField]
        },
        onSelect: function (record) {
            var deputyUnitId = (record.id + ":" + record.deputyUnitId).split(":");
            var deputyUnitName = (record.unitName + ":" + record.deputyUnitName).split(":");
            var firstSaleUnitdata = [];
            for (var i = 0; i < deputyUnitName.length; i++) {
                var deputyUnit = {};
                deputyUnit["unitName"] = deputyUnitName[i];
                deputyUnit['id'] = deputyUnitId[i];
                firstSaleUnitdata.push(deputyUnit);
            }
            $("#firstSaleUnit").combobox('loadData', firstSaleUnitdata);
            $("#firstPurUnit").combobox('loadData', firstSaleUnitdata);
            $("#unit").val(record.id);
            goodsPrice.datagrid('load', {
                goodsId: $("#id").val() || 0,
                unit: record.id
            })
        }
    });
    $("#firstSaleUnit, #firstPurUnit").combobox({
        valueField: 'id',
        textField: 'unitName',
        formatter: function (row) {
            var opts = $(this).combobox('options');
            return row[opts.textField]
        }
    });
    // 销售状态
    $("#sell").combobox({
        valueField: 'key',
        textField: 'value',
        loadFilter: function (data) {
            return data;
        },
        data: [{
            key: '1',
            value: '销售'
        }, {
            key: '0',
            value: '停销'
        }]
    });
    $("#moreUnitBtn").on("click", function () {
        if ($(this).attr("checked")) {
            $(".unit-group").show();
            $(".unit-one").hide();
            $("#unit").val($("#unitGroup").val());
        } else {
            $(".unit-group").hide();
            $(".unit-one").show();
            $("#unit").val($("#unitSingle").val());
        }
        goodsPrice.datagrid('load', {
            goodsId: $("#id").val() || 0,
            unit: $("#unit").val()
        })
    });
    var goodsPrice = $("#goodsPrice");
    goodsPrice.datagrid({
        url: genAPI('goods/getGoodsPriceList'),
        queryParams: {
            goodsId: 0,
            unit: 0
        },
        striped: true,
        nowrap: true,
        rownumbers: true,
        singleSelect: true,
        loadFilter: function (res) {
            return res.code == 200 ? res.data : [];
        },
        columns: [[
            {
                field: 'lb',
                title: '单位类别',
                width: 100,
            },
            {
                field: 'unitId',
                title: '计量单位',
                width: 100,
                hidden: true
            },
            {
                field: 'unitName',
                title: '计量单位',
                width: 100,
            },
            {
                field: 'salePrice',
                title: '零售价',
                width: 100,
                editor: {
                    type: "numberbox"
                }
            },
            {
                field: 'wholesalePrice',
                title: '批发价',
                width: 100,
                editor: {
                    type: "numberbox"
                }
            },
            {
                field: 'purPrice',
                title: '采购价',
                width: 100,
                editor: {
                    type: "numberbox"
                }
            }
        ]]
    })
        .datagrid('enableCellEditing');
    var tabPrice = $("#tabPrice");
    tabPrice.datagrid({
        striped: true,
        nowrap: true,
        rownumbers: true,
        singleSelect: true,
        loadFilter: function (res) {
            return res.code == 200 ? res.data : [];
        },
        toolbar: [{
            iconCls: 'glyphicon glyphicon-refresh',
            handler: function(){

            }
        }],
        columns: [[
            {
                field: 'levelName',
                title: '客户等级',
                width: 100
            },
            {
                field: 'discountRate',
                title: '下浮折扣(%)',
                width: 200,
                editor: {
                    type: "numberbox"
                }
            }
        ]]
    })
        .datagrid('enableCellEditing');
    var goodsImage = $("#goodsImage");
    goodsImage.datagrid({
        striped: true,
        nowrap: true,
        rownumbers: true,
        singleSelect: true,
        loadFilter: function (res) {
            return res.code == 200 ? res.data : [];
        },
        columns: [[
            {
                field: 'url',
                title: '图片',
                width: 200,
            },
            {
                field: 'thumb',
                title: '是否主图',
                width: 100
            },
            {
                field: 'sort',
                title: '排序',
                width: 100,
                editor: {
                    type: "numberbox"
                }
            }
        ]]
    })
        .datagrid('enableCellEditing');
    //实例化编辑器
    var um = UM.getEditor('myEditor', {
        toolbar: [
            'undo redo | bold italic underline strikethrough forecolor | removeformat ',
            'selectall cleardoc paragraph | fontfamily fontsize',
            '| justifyleft justifycenter justifyright justifyjustify | image'
        ]
    });
    $("#seting-inventory-warning").bind('click', function () {
        closeTips();
        $(this).toggleClass('checked')
        if ($(this).is('.checked')) {
            $('.inventory-warning').show();
            $('#set-inventory-warning-store').bind('click', function () {
                closeTips();
                $('#set-inventory-warning-store').toggleClass('checked');
                if ($('#set-inventory-warning-store').is('.checked')) {
                    $('.inventory-warning-store').show();
                    inventoryWarning
                        .datagrid("resize");
                    inventoryWarning.datagrid("load", {
                            goodsId: $("#id").val() || 0
                        });
                    $('.inventory-warning-goods').hide();
                } else {
                    $('.inventory-warning-store').hide();
                    $('.inventory-warning-goods').show();
                }
            });
            if ($('#set-inventory-warning-store').is('.checked')) {
                $('.inventory-warning-store').show();
                $('.inventory-warning-goods').hide();
            } else {
                $('.inventory-warning-store').hide();
                $('.inventory-warning-goods').show();
            }
        } else {
            $('.inventory-warning').hide();
            $('.inventory-warning-store').hide();
            $('.inventory-warning-goods').hide();
            $('#set-inventory-warning-store').unbind('click');
        }
    });
    $('#minInventory').numberbox({
        label:'最小库存',
        width:300,
        min:0,
        validType: "ltEq['#maxInventory']"
    });
    $('#maxInventory').numberbox({
        label:'最大库存',
        width:300,
        min:0,
        validType: "gtEq['#minInventory']"
    });
    var inventoryWarning = $("#inventoryWarning");
    inventoryWarning.datagrid({
        url: genAPI('goods/getGoodsStoWarnList'),
        queryParams: {
            goodsId: 0
        },
        striped: true,
        nowrap: true,
        rownumbers: true,
        singleSelect: true,
        loadFilter: function (res) {
            return res.code == 200 ? res.data : [];
        },
        columns: [[
            {
                field: 'storageName',
                title: '仓库',
                width: 200
            },
            {
                field: 'minInventory',
                title: '最小库存 <button class="btn btn-default btn-xs bathMin" type="button" onclick="bathSet(this)">批量</button>',
                width: 200,
                editor: {
                    type: "numberbox"
                }
            },
            {
                field: 'maxInventory',
                title: '最大库存 <button class="btn btn-default btn-xs" type="button" onclick="bathSet(this)">批量</button>',
                width: 200,
                editor: {
                    type: "numberbox"
                }
            }
        ]]
    })
        .datagrid('enableCellEditing');
    var goodsInventory = $('#goodsInventory');
    goodsInventory.datagrid({
        striped: true,
        nowrap: true,
        rownumbers: true,
        singleSelect: true,
        loadFilter: function (res) {
            return res.code == 200 ? res.data : [];
        },
        showFooter: true,
        columns: [[
            {
                field: 'storageId',
                hidden: true
            },
            {
                field: 'storageName',
                title: '仓库',
                width: 200,
                editor: {
                    type: "combobox",
                    options: {
                        url: genAPI('settings/storageList'),
                        valueField: 'name',
                        textField: 'name',
                        cache: false,
                        editable: false,
                        panelHeight: 'auto',
                        loadFilter: function (res) {
                            return res.code == 200 ? res.data : [];
                        },
                        onSelect: function (rec) {
                            var rows = goodsInventory.datagrid('getData').rows;
                            if (rows.length > 0) {
                                rows[goodsInventory.datagrid('cell').index].storageId = rec.id
                            }
                        }
                    }
                }
            },
            {
                field: 'quantity',
                title: '库存数',
                width: 100,
                editor: {
                    type: "numberbox"
                }
            },
            {
                field: 'unitCost',
                title: '单位成本',
                width: 100,
                editor: {
                    type: "numberbox"
                }
            },
            {
                field: 'earlyTotal',
                title: '总价',
                width: 100
            }

        ]],
        toolbar: '#goods-inventory-toolbar'
    })
        .datagrid('enableCellEditing')
        .datagrid('loadData', {
            code: 200,
            data: {
                total: 0,
                rows: [],
                footer: [{
                    storageId: '<b>合计:</b>',
                    earlyTotal: 0,
                    isFooter: true
                }]
            }
        });
    $("#seting-goods-inventory").bind("click", function () {
        $(this).toggleClass('checked')
        if ($(this).is('.checked')) {
            $(".goods-inventory").show();
            goodsInventory.datagrid("resize");
        } else {
            $(".goods-inventory").hide();
        }
    });
    var requestParams = getRequest();
    var goodsId = requestParams.id;
    var action = requestParams.action;
    if (goodsId) {
        $.ajax({
            type: "post",
            url: genAPI('goods/getGoodsInfo'),
            cache: false,
            dataType: "json",
            data: {
                id: goodsId
            },
            success: function (res) {
                if(res.code==200){
                    var goods = res.data.goods;
                    if (goods.isUnitGroup == '1') {
                        $('#moreUnitBtn').click();
                        goods['unitGroup'] = goods['unit'];
                    } else {
                        goods['unitSingle'] = goods['unit'];
                    }
                    $('#goodsFrom').form('load', goods);
                    $('#category').combotree('setValue', goods.category);
                    if (goods.inventoryWarn == '1') {
                        $('#seting-inventory-warning').click();
                        if (goods.storageWarn == '1') {
                            $('#set-inventory-warning-store').click();
                        }
                    }
                    var inventory = res.data.earlyStage;
                    if (inventory && inventory.rows.length > 0) {
                        $("#seting-goods-inventory").click();
                        goodsInventory.datagrid('loadData', {
                            code: 200,
                            data: inventory
                        });
                    }
                    goodsPrice.datagrid('loadData', {
                        code: 200,
                        data: res.data.price
                    });
                    tabPrice.datagrid('loadData', {
                        code: 200,
                        data: res.data.discount
                    });
                } else {
                    layer.msg(res.message)
                }
            },
            error:function (err) {
                layer.msg(err)
            }
        })
    }
});