var tips, lastIndex = -1;

function bathSet(ele) {
    closeTips();
    var col = $(ele).is('.bathMin') ? 'minInventory' : 'maxInventory'
    tips = layer.tips('<div class="input-group input-group-sm">' +
        '      <input id="bath' + col + '" type="number" class="form-control" placeholder="请输入..." value="0">' +
        '      <span class="input-group-btn">' +
        '        <button class="btn btn-default" type="button" onclick="bathSetVal(\'' + col + '\')">确定</button>' +
        '        <button class="btn btn-default" type="button" onclick="closeTips()">取消</button>' +
        '      </span>' +
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
        tips = null;
    }
}

function addInventoryRow() {
    var goodsInventory = $("#goodsInventory");
    goodsInventory.datagrid('acceptChanges')
        .datagrid('appendRow', {
            storageId: 0,
            storageName: '',
            quantity: 0,
            unitCost: 0,
            earlyTotal: 0
        })
        .datagrid('acceptChanges')
        .datagrid('editCell', {
            index: goodsInventory.datagrid('getRows').length - 1,
            field: 'storageName'
        });
}

function deleteInventoryRow() {
    if (lastIndex > -1) {
        var index = layer.confirm('确定删除所选行？', {
            btn: ['确定', '取消']
        }, function (target) {
            if (target) {
                $("#goodsInventory").datagrid('deleteRow', lastIndex).datagrid('statistics', ["earlyTotal"]);
                layer.close(index);
            }
            lastIndex = -1;
        }, function (index) {
            layer.close(index);
            lastIndex = -1;
        });
    } else {
        layer.msg('请选择一行进行操作。');
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
    // 商品状态
    $("#status").combobox({
        valueField: 'key',
        textField: 'value',
        loadFilter: function (data) {
            return data;
        },
        data: [{
            key: '1',
            value: '启用'
        }, {
            key: '2',
            value: '销售'
        }, {
            key: '3',
            value: '停销'
        }, {
            key: '9',
            value: '禁用'
        }],
        onSelect: function (record) {
            var combo = this;
            layer.confirm('是否将此商品设为' + record.value + '状态？', {
                btn: ['是','否']
            }, function(){
                var url;
                switch (record.key) {
                    case '1':
                        url = genAPI('goods/unfreezeGoods');
                        break;
                    case '2':
                        url = genAPI('goods/onSell');
                        break;
                    case '3':
                        url = genAPI('goods/offSell');
                        break;
                    case '9':
                        url = genAPI('goods/freezeGoods');
                        break;
                }
                if (typeof url != 'undefined') {
                    $.ajax({
                        type: "post",
                        url: url,
                        cache: false,
                        dataType: "json",
                        data: {
                            goodsIds: $('#id').val()
                        },
                        success: function (res) {
                            layer.msg(res.message)
                        },
                        error:function (err) {
                            layer.close(index);
                            layer.msg(err)
                        }
                    });
                }
            }, function(){
                console.log(combo);
            });
        }
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
        striped: true,
        nowrap: true,
        rownumbers: true,
        singleSelect: true,
        loadFilter: function (res) {
            return res.code == 200 ? res.data : [];
        },
        onBeforeLoad: function (param) {
            var firstLoad = $(this).attr("firstLoad");
            if (firstLoad == "false" || typeof (firstLoad) == "undefined") {
                $(this).attr("firstLoad", "true");
                return false;
            }
            return true;
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
        url: genAPI('goods/getGoodsDiscountList'),
        striped: true,
        nowrap: true,
        rownumbers: true,
        singleSelect: true,
        loadFilter: function (res) {
            return res.code == 200 ? res.data : [];
        },
        onBeforeLoad: function (param) {
            var firstLoad = $(this).attr("firstLoad");
            if (firstLoad == "false" || typeof (firstLoad) == "undefined") {
                $(this).attr("firstLoad", "true");
                return false;
            }
            return true;
        },
        toolbar: [{
            iconCls: 'glyphicon glyphicon-refresh',
            handler: function(){
                tabPrice.datagrid('load', {
                    goodsId: $('#id').val()
                })
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
        singleSelect: true,
        idField: 'url',
        columns: [[
            {
                field: 'ck',
                checkbox: true
            },
            {
                field: 'url',
                title: '图片',
                formatter: function (value, row, index) {
                  return '<div><img class="img-rounded" src="' + imagePath + row.url +'" style="width: 140px; height: 140px" />' +
                      (row.thumb == "1" ? '<span class="badge">主图</span>':'') +
                      '</div>';
                },
                width: 200
            },
            {
                field: 'thumb',
                hidden: true
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
    $('#uploadImageBtn').on('click', function(){
        var files = $('#imagefile').filebox('files');
        if (files.length == 0) {
            layer.msg("请选择图片文件。");
            return;
        }
        var index = layer.load(0, {
            shade: [0.1, '#000'] //0.1透明度的白色背景
        });
        var f = files[0];
        var xhr = new XMLHttpRequest();
        xhr.open("post", genAPI('uploader/imageUp') + "?type=ajax", true);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.setRequestHeader("token", $.cookie('jwt'));
        xhr.setRequestHeader("uid", $.cookie('uid'));
        var fd = new FormData();
        fd.append('upfile', f);
        xhr.send(fd);
        xhr.addEventListener('load', function (e) {
            layer.close(index);
            var r = e.target.response;
            var json = eval('('+r+')');
            if (json.state === 'SUCCESS') {
                var row = {
                    url: json.url,
                    thumb: "0",
                    sort: goodsImage.datagrid('getRows').length + 1
                };
                goodsImage.datagrid('appendRow', row)
                    .datagrid('acceptChanges');
                $('#imagefile').filebox('clear');
            } else {
                layer.msg(json.state);
            }
        });
    });
    $('#deleteImageBtn').on('click', function () {
        var rows = goodsImage.datagrid('getChecked');
        if (rows.length == 0) {
            layer.msg('请勾选要删除的图片。');
            return;
        }
        var index = layer.load(0, {
            shade: [0.1, '#000'] //0.1透明度的白色背景
        });
        $.ajax({
            type: "post",
            url: genAPI('goods/deleteGoodsImage'),
            cache: false,
            dataType: "json",
            data: JSON.stringify({
                goodsId: $('#id').val(),
                rows: rows
            }),
            contentType: "application/json;charset=UTF-8",
            success: function (res) {
                layer.close(index);
                if(res.code == 200){
                    goodsImage.datagrid('uncheckAll');
                    _.forEach(rows, function (row, index) {
                        goodsImage.datagrid('deleteRow', goodsImage.datagrid('getRowIndex', row['url']));
                    });
                } else {
                    layer.msg(res.message)
                }
            },
            error:function (err) {
                layer.close(index);
                layer.msg(err)
            }
        });
    });
    $('#setMainImageBtn').on('click', function () {
        var checkRows = goodsImage.datagrid('getChecked');
        if (checkRows.length == 0) {
            layer.msg('请勾选要设置的图片。');
            return;
        }
        if (checkRows.length > 1) {
            layer.msg('只能将一张图片设为主图。');
            return;
        }
        var rows = goodsImage.datagrid('getRows');
        var checkIndex = goodsImage.datagrid('getRowIndex', checkRows[0]['url']);
        _.forEach(rows, function (item, index) {
            item['thumb'] = checkIndex === index ? '1' : '0';
            goodsImage.datagrid('refreshRow', index);
        });
        goodsImage.datagrid('uncheckAll');
    });
    //实例化编辑器
    var um = UM.getEditor('myEditor', {
        imageUrl: genAPI('uploader/imageUp'),
        imagePath: imagePath,
        dropFileEnabled: false,
        pasteImageEnabled: false,
        textarea: 'goodsDetail',
        headers: {
            uid: $.cookie('uid'),
            token: $.cookie('jwt')
        },
        toolbar: [
            'undo redo | bold italic underline strikethrough forecolor | removeformat ',
            'selectall cleardoc paragraph | fontfamily fontsize',
            '| justifyleft justifycenter justifyright justifyjustify | image'
        ]
    });
    $("#seting-inventory-warning").bind('click', function () {
        closeTips();
        $(this).toggleClass('checked');
        if ($(this).is('.checked')) {
            $('#inventoryWarn').val(1);
            $('.inventory-warning').show();
            $('#set-inventory-warning-store').bind('click', function () {
                closeTips();
                $('#set-inventory-warning-store').toggleClass('checked');
                if ($('#set-inventory-warning-store').is('.checked')) {
                    $('#storageWarn').val(1);
                    $('.inventory-warning-store').show();
                    inventoryWarning
                        .datagrid("resize");
                    inventoryWarning.datagrid("load", {
                            goodsId: $("#id").val() || 0
                        });
                    $('.inventory-warning-goods').hide();
                } else {
                    $('#storageWarn').val(0);
                    $('.inventory-warning-store').hide();
                    $('.inventory-warning-goods').show();
                }
            });
            if ($('#set-inventory-warning-store').is('.checked')) {
                $('#storageWarn').val(1);
                $('.inventory-warning-store').show();
                $('.inventory-warning-goods').hide();
            } else {
                $('#storageWarn').val(0);
                $('.inventory-warning-store').hide();
                $('.inventory-warning-goods').show();
            }
        } else {
            $('#inventoryWarn').val(0);
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
        striped: true,
        nowrap: true,
        rownumbers: true,
        singleSelect: true,
        loadFilter: function (res) {
            return res.code == 200 ? res.data : [];
        },
        onBeforeLoad: function (param) {
            var firstLoad = $(this).attr("firstLoad");
            if (firstLoad == "false" || typeof (firstLoad) == "undefined") {
                $(this).attr("firstLoad","true");
                return false;
            }
            return true;
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
                title: '最大库存 <button class="btn btn-default btn-xs bathMax" type="button" onclick="bathSet(this)">批量</button>',
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
        toolbar: '#goods-inventory-toolbar',
        onAfterEdit: function (rowIndex, rowData, changes) {
            if (changes["quantity"] || changes["unitCost"]) {
                var total = _.multiply(rowData["quantity"] || 0, rowData["unitCost"] || 0);
                rowData["earlyTotal"] = total;
                goodsInventory.datagrid("refreshRow", rowIndex).datagrid('statistics', ["earlyTotal"]);
            }
        },
        onClickRow: function (rowIndex, rowData) {
            lastIndex = rowIndex;
        }
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
                    um.setContent(goods.detail || '');
                    if (goods.inventoryWarn == '1') {
                        $('#seting-inventory-warning').click();
                        if (goods.storageWarn == '1') {
                            $('#set-inventory-warning-store').click();
                        }
                    }
                    /*
                    var inventory = res.data.earlyStage;
                    if (inventory && inventory.rows.length > 0) {
                        $("#seting-goods-inventory").click();
                        goodsInventory.datagrid('loadData', {
                            code: 200,
                            data: inventory
                        })
                            .datagrid('statistics', ["earlyTotal"]);
                    }
                    */
                    /*
                    goodsPrice.datagrid('loadData', {
                        code: 200,
                        data: res.data.price
                    });
                    */
                    tabPrice.datagrid('loadData', {
                        code: 200,
                        data: res.data.discount
                    });
                    goodsImage.datagrid('loadData', res.data.goodsImage)
                } else {
                    layer.msg(res.message)
                }
            },
            error:function (err) {
                layer.msg(err)
            }
        })
    }
    $("#saveBtn").bind('click', function () {
        if($('#goodsFrom').form('validate')){
            var data = $('#goodsFrom').serializeObject();
            if (data.unit == 0) {
                layer.msg("计量单位未填写。");
                return;
            }
            if (data.unitGroup && (!data.firstSaleUnit || !data.firstPurUnit)) {
                layer.msg("首选出入库单位未填写。");
                return;
            }
            if (data.inventoryWarn == "1") {
                if (data.storageWarn == "1") {
                    $.extend(data, {
                        goodsStoWarn: inventoryWarning.datagrid('acceptChanges').datagrid('getRows')
                    })
                } else {
                    if (data.minInventory == "" || data.maxInventory == "") {
                        layer.msg("库存预警数量未填写。");
                        return;
                    }
                    $.extend(data, {
                        goodsStoWarn: []
                    });
                }
            }
            $.extend(data, {
                goodsImage: goodsImage.datagrid('acceptChanges').datagrid('getRows'),
                goodsPrice: goodsPrice.datagrid('acceptChanges').datagrid('getRows'),
                goodsDiscount: tabPrice.datagrid('acceptChanges').datagrid('getRows'),
                goodsInventory: data.setGoodsInventory ? goodsInventory.datagrid('acceptChanges').datagrid('getRows') : []
            });
            var url = data.id ? genAPI('goods/editGoods') : genAPI('goods/addGoods');
            console.log(url, data);
            var index = layer.load(0, {
                shade: [0.1, '#000'] //0.1透明度的白色背景
            });
            $.ajax({
                type: "post",
                url: url,
                cache: false,
                dataType: "json",
                data: JSON.stringify(data),
                contentType: "application/json;charset=UTF-8",
                success: function (res) {
                    layer.close(index);
                    if (res.code == 200) {
                        layer.msg("保存成功");
                    } else {
                        layer.msg(res.message)
                    }
                },
                error: function (err) {
                    layer.close(index);
                    layer.msg(JSON.stringify(err))
                }
            });
        } else {
            layer.msg("商品信息不完整");
        }
    })
});