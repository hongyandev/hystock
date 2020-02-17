function batchSetting(key) {
    console.log(key);
    var rows = $('#goodsLists').datagrid('getChecked');
    var url, data, goodsIds = '';
    _.forEach(rows, function (row, index) {
        goodsIds += goodsIds.length > 0 ? "," + row.id : row.id;
    });
    switch (key) {
        case 'storage':
            url = genAPI('goods/batchSetStorage');
            var storageId = $('#storage').val();
            if(!storageId) {
                layer.msg('请选择仓库');
                return;
            }
            data = {
                goodsIds: goodsIds,
                storageId: storageId
            }
            break;
        case 'warning':
            url = genAPI('goods/batchSetStoWarn');
            var storageWarn = $('#storageWarn').val();
            var minInventory = 0, maxInventory = 0, stoWarn = [];
            if(storageWarn == '1'){
                $('#inventoryWarning').datagrid('acceptChanges');
                stoWarn = $("#inventoryWarning").datagrid('getRows');
            } else {
                if ($('#minInventory').numberbox('isValid') && $('').numberbox('isValid')) {
                    minInventory = $('#minInventory').val();
                    maxInventory = $('#maxInventory').val();
                } else {
                    layer.msg('请正确填写预警数量');
                    return;
                }
            }
            data = {
                goodsIds: goodsIds,
                storageWarn: storageWarn,
                stoWarn: stoWarn,
                minInventory: minInventory,
                maxInventory: maxInventory
            }
            break;
        case 'category':
            url = genAPI('goods/batchSetCategory');
            var categoryId = $('#category').val();
            if(!categoryId) {
                layer.msg('请选择类别');
                return;
            }
            data = {
                goodsIds: goodsIds,
                categoryId: categoryId
            }
            break;
    }
    if (key == 'warning') {
        $.ajax({
            type: "post",
            url: url,
            cache: false,
            dataType: "json",
            data: JSON.stringify(data),
            contentType: "application/json;charset=UTF-8",
            success: function (res) {
                if (res.code == 200) {
                    layer.msg('设置成功');
                } else {
                    layer.msg(res.message)
                }
            }, error: function () {

            }
        })
    } else {
        $.ajax({
            type: "post",
            url: url,
            cache: false,
            dataType: "json",
            data: data,
            success: function (res) {
                if (res.code == 200) {
                    layer.msg('设置成功');
                } else {
                    layer.msg(res.message)
                }
            }, error: function () {

            }
        })
    }
}
function setStatus(key) {
    var rows = $('#goodsLists').datagrid('getChecked');
    if (rows.length == 0) {
        layer.msg('请至少选择一行操作。');
        return;
    }
    var url, goodsIds = '';
    _.forEach(rows, function (row, index) {
       goodsIds += goodsIds.length > 0 ? "," + row.id : row.id;
    });
    switch (key) {
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
                goodsIds: goodsIds
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
}

function getGoodsData(query, chk, category) {
    $('#goodsLists').datagrid('load', {
        query: query,
        status: chk,
        category: category
    });
}

var tips;

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

$(function () {
    $.ajaxSetup({
        headers: {
            uid: $.cookie('uid'),
            token: $.cookie('jwt')
        }
    });
    $('#goodsLists').datagrid({
        url: genAPI('goods/goodsList'),
        fit: true,
        method: 'post',
        striped: true,
        nowrap: true,
        pagination: true,
        rownumbers: true,
        checkOnSelect: true,
        onBeforeLoad: function (param) {
            var firstLoad = $(this).attr("firstLoad");
            if (firstLoad == "false" || typeof (firstLoad) == "undefined") {
                $(this).attr("firstLoad", "true");
                return false;
            }
            return true;
        },
        loadFilter: function (res) {
            if (res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        columns: [[
            {
                field: 'ck',
                checkbox: true,
                width: 100
            },
            {
                field: 'code',
                title: '商品编号',
                align: 'center',
                width: 100
            },
            {
                field: 'name',
                title: '商品名称',
                align: 'center',
                width: 100
            },
            {
                field: 'categoryName',
                title: '商品类别',
                align: 'center',
                width: 100
            },
            {
                field: 'specs',
                title: '规格型号',
                align: 'center',
                width: 100
            },
            {
                field: 'unitName',
                title: '单位',
                align: 'center',
                width: 150
            },
            {
                field: 'currentQty',
                title: '当前库存',
                align: 'center',
                width: 100
            },
            {
                field: 'unitCost',
                title: '单位成本',
                align: 'center',
                formatter: function (value) {
                    return _.ceil(value, 4);
                },
                width: 80
            },
            {
                field: 'quantity',
                title: '期初数量',
                align: 'center',
                width: 100
            },
            {
                field: 'score',
                title: '期初总价',
                align: 'center',
                width: 100,
                formatter: function (value, record, index) {
                    if (record.quantity) {
                        return record.unitCost * record.quantity
                    }
                }
            },
            {
                field: 'purPrice',
                title: '采购价',
                align: 'center',
                width: 100
            },
            {
                field: 'salePrice',
                title: '零售价',
                align: 'center',
                width: 100
            },
            {
                field: 'wholesalePrice',
                title: '批发价',
                align: 'center',
                width: 100
            },
            {
                field: 'status',
                title: '状态',
                align: 'center',
                width: 100,
                formatter: function (value, record, index) {
                    if (value == "1") {
                        return "启用";
                    } else {
                        return "禁用";
                    }
                }
            }
        ]],
        toolbar: '#toolbar'
    });
    $('#addGoodsBtn').on('click',function () {
        addTopTab("#tabs", "新增商品", "webapp/custom/goodDetail.html");
    });
    $('#editorGoodsBtn').on('click', function () {
        var rowSelect = $("#goodsLists").datagrid("getSelected");
        if (!rowSelect) {
            layer.msg('请选中一行进行操作！');
        } else {
            var url = "webapp/custom/goodsDetail.html?id=" + rowSelect.id;
            addTopTab("#tabs", "修改商品", url);
            $("#goodsLists").datagrid("clearSelections");
        }
    });
    $("#batch-setting-panel").window({
        onOpen: function () {
            $("#storage").combobox({
                url: genAPI('settings/storageList'),
                valueField: 'id',
                textField: 'name',
                cache: false,
                editable: false,
                panelHeight: 'auto',
                prompt:'请选择...',
                loadFilter: function (res) {
                    return res.code == 200 ? res.data : [];
                }
            });
            $('#minInventory').numberbox({
                label: '最小库存',
                min: 0,
                validType: "ltEq['#maxInventory']"
            });
            $('#maxInventory').numberbox({
                label: '最大库存',
                min: 0,
                validType: "gtEq['#minInventory']"
            });
            // var height = $('#batch-setting-panel').find('.panel-body').height() - 30;
            $('#inventoryWarning').datagrid({
                fit: true,
                url: genAPI('goods/getGoodsStoWarnList'),
                striped: true,
                nowrap: true,
                rownumbers: true,
                singleSelect: true,
                // height: height,
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
                        width: 120,
                        editor: {
                            type: "numberbox"
                        }
                    },
                    {
                        field: 'maxInventory',
                        title: '最大库存 <button class="btn btn-default btn-xs bathMax" type="button" onclick="bathSet(this)">批量</button>',
                        width: 120,
                        editor: {
                            type: "numberbox"
                        }
                    }
                ]]
            })
                .datagrid('enableCellEditing');
            $("#category").combotree({
                url: genAPI('settings/categoryList'),
                valueField: 'id',
                textField: 'name',
                cache: false,
                editable: false,
                panelHeight: 'auto',
                prompt:'请选择...',
                queryParams: {
                    typeNum: 3
                },
                loadFilter: function (res) {
                    return res.code == 200 ? res.data : [];
                },
                formatter: function (node) {
                    return node.name;
                }
            });
        }
    });
    $('#set-inventory-warning-store').bind('click', function () {
        closeTips();
        $(this).toggleClass('checked');
        if ($(this).is('.checked')) {
            $('#storageWarn').val(1);
            $('.inventory-warning-store').show();
            var inventoryWarning = $('#inventoryWarning');
            inventoryWarning.datagrid("resize");
            inventoryWarning.datagrid("load", {
                goodsId: 0
            });
            $('.inventory-warning-goods').hide();
        } else {
            $('#storageWarn').val(0);
            $('.inventory-warning-store').hide();
            $('.inventory-warning-goods').show();
        }
    });
    var pp = $("#batch-setting-panel").find(".easyui-tabs");
    pp.tabs({
        fit: true,
        onSelect: function (title, index) {
            // console.log(title, index);
            switch (index) {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    break;
            }
        }
    });
    $('#batchSettingBtn').on('click', function () {
        var rows = $('#goodsLists').datagrid('getChecked');
        if (rows.length == 0) {
            layer.msg('请至少选择一行操作。');
            return;
        }
        $('#batch-setting-panel').window('open');

    });
    $('#importGoodsBtn').on('click', function () {
        addTopTab("#tabs",'导入商品',"webapp/custom/importGoods.html");
    });
    $('#cateTree').tree({
        fit: true,
        lines: true,
        animate: true,
        url: genAPI('settings/categoryList'),
        queryParams: {
            typeNum: 3
        },
        formatter: function (node) {
            return node.name;
        },
        loadFilter: function (res) {
            if (res.code == 200) {
                return [{
                    id: '',
                    name: '全部分类',
                    children: res.data
                }]
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        onClick: function (node) {
            var query = $("#searTxt").val();
            var chk = $(".chk-ischecked").find('checkbox').prop('checked') == true ? '1' : '';
            getGoodsData(query, chk, node.id);
        }
    });
    var query = $("#searTxt").val();
    var chk = $(".chk-ischecked").find('checkbox').prop('checked') == true ? '1' : '';
    var category = $('#cateTree').tree('getSelected');
    if (category) {
        getGoodsData(query, chk, category.id);
    } else {
        getGoodsData(query, chk, "");
    }
    $("#checkType li").on('click', function () {
        var idx = $(this).index();
        $(this).find('span').addClass("checked");
        $(this).siblings().find("span").removeClass("checked");
        $(".content li").eq(idx).show().siblings().hide();
    });
});

//查询商品
function seachForm(query, chk) {
    var category = $('#cateTree').tree('getSelected');
    if (category) {
        getGoodsData(query, chk, category.id);
    } else {
        getGoodsData(query, chk, "");
    }

}

var storageId, categoryId, ids = "";

