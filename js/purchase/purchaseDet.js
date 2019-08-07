var categoryId;
var query;
$(function () {
    $.ajaxSetup({
        headers: {
            uid: $.cookie('uid'),
            token: $.cookie('jwt')
        }

    });

    //检索供应商
    $(".btn-search").on("click", function () {
        $("#vendorList").datagrid({
            queryParams: {
                query: $("#searTxt").val(),
                category: $("#pids").val()
            },
        }).datagrid("reload", genAPI('settings/vendorList'));
    });
    //供应商类别
    $("#pids").combotree({
        url: genAPI('settings/categoryList'),
        valueField: 'id',
        textField: 'name',
        parentField: 'pid',
        panelWidth: '200',
        loadFilter: function (data) {
            return data.data
        },
        formatter: function (node) {
            return node.name;
        },
        queryParams: {
            typeNum: 2
        },
        onClick: function (node) {
            alert(JSON.stringify(node));
        },
        onBeforeExpand: function (node, param) {

        },
        onLoadSuccess: function (node, data) {

        }

    });
    //供应商列表
    $("#vendorList").datagrid({
        url: genAPI('settings/vendorList'),
        method: 'post',
        fitColumns: true,
        striped: true,
        nowrap: true,
        pagination: true,
        rownumbers: true,
        singleSelect: true,
        height: 400,
        loadFilter: function (data) {
            return data.data
        },
        queryParams: {
            query: $("#searTxt").val(),
            category: $("#pids").val()
        },
        columns: [[
            {field: 'category2', title: '供应商类别', hidden: true},
            {field: 'code', title: '供应商编号', width: 100},
            {field: 'name', title: '供应商名称', width: 200},
            {field: 'contact', title: '首要联系人', width: 200},
            {field: 'mobile', title: '手机', width: 200},
            {field: 'phone', title: '座机', width: 200},
            {field: 'im', title: 'QQ/微信/email', width: 200, hidden: true},
            {
                field: 'status', title: '状态', width: 200, formatter: function (value, row, index) {
                    if (value == "1") {
                        return "启用";
                    } else {
                        return "禁用";
                    }
                }
            }
        ]],
    });
    //供应商浮层
    $("#vendorClass").on('click', function () {
        if ($("#vendorInfo").is(':hidden')) {
            $("#vendorInfo").show();
            $("#vendorList").datagrid('resize');
        } else {
            $("#vendorInfo").hide();
        }
        layer.open({
            type: 1,
            title: "选择供应商",
            skin: 'layui-layer-molv', //加上边框
            area: ['88%', '80%'], //宽高
            content: $('#vendorInfo'),
            btn: ['选中并关闭', '取消'],
            yes: function (index, layero) {
                var rowSelect = $("#vendorList").datagrid('getSelected');
                if (!rowSelect) {
                    layer.alert('请选中一行操作', {skin: 'layui-layer-molv'});
                    return false;
                }
                $("#vendorClass").val(rowSelect.code);
                $("#vendorClass").attr("vid", rowSelect.id);
                layer.close(index);
            }
            , btn2: function (index, layero) {
                layer.close(index);
            },
            end: function () {
                $("#vendorInfo").css("display", "none");
            }
        });

    });

    //商品类别
    query = $("#searTxts").val();
    $('#cateTree').tree({
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
            return res.data
        },
        onClick: function (node) {
            $("#goods").datagrid('load', {
                query: query,
                categoryId: node.id
            })
        }
    });

    //产品浮层
    $("#goodl").on('click', function () {
        layer.open({
            type: 1,
            title: "选择商品",
            skin: 'layui-layer-molv', //加上边框
            area: ['88%', '80%'], //宽高
            content: $('#goodsList'),
            btn: ['选中并关闭', '取消'],
            yes: function (index, layero) {
                var rowSelect = $("#goods").datagrid('getSelected');
                if (!rowSelect) {
                    layer.alert('请选中一行操作', {skin: 'layui-layer-molv'});
                    return false;
                }
                $("#goodl").val(rowSelect.code);
                $("#goodl").attr("vid", rowSelect.id);
                layer.close(index);
            }
            , btn2:
                function (sec, layero) {
                    layer.close(sec);
                }
        })
        queryGoods(query, categoryId);
    });
});

//查询商品列表（分页）

function queryGoods(query, categoryId) {
    $("#goods").datagrid({
        url: genAPI('query/queryGoodsPage'),
        method: 'post',
        rownumbers: true,
        striped: true,
        nowrap: true,
        checkOnSelect: true,
        idField: 'id',
        pagination: true,
        height: 300,
        singleSelect: true,
        loadFilter: function (data) {
            return data.data;
        },
        queryParams: {
            query: query,
            categoryId: categoryId,
        },
        columns: [[
            {
                field: 'code',
                title: '商品编号',
                width: 100,
                hidden: false
            },
            {
                field: 'name',
                title: '商品名称',
                width: 100,
                hidden: false
            },
            {
                field: 'specs',
                title: '规格型号',
                width: 100,
                hidden: false
            },
            {
                field: 'categoryName',
                title: '商品类别',
                width: 100,
                hidden: false
            },
            {
                field: 'unit',
                title: '单位',
                width: 50,
                hidden: false,
            },
            {
                field: 'currentQty',
                title: '可用库存',
                width: 80,
                hidden: false
            }
        ]],
        onClickRow: function (rowIndex, rowData) {
            $(this).datagrid('selectRow', rowIndex);
        }
    })
}

//点击查询
function clickSearch() {
    alert(JSON.stringify($("#pids").combotree('tree').tree('getSelected')));
//采购单明细查询
    $("#purchaseRes").datagrid({
        url: genAPI('query/pu_detail'),
        method: 'post',
        idField: 'number',
        loadMsg: '数据正在加载,请耐心的等待...',
        pagination: true,
        pageNum: 1,
        pageSize: 10,
        pageList: [20, 40, 50],
        rownumbers: true,
        fitColumns: false,
        loadFilter: function (data) {
            return data.data
        },
        queryParams: {
            beginDate: $("#startDate").val(),
            endDate: $("#endDate").val(),
            supplierId: $("#vendorClass").val(),
            goodsId: $("#goodl").val(),
            number: $("#number").val(),
            categoryId: $("#pids").combotree('tree').tree('getSelected').id,
            storageId: $("#storageId").val()
        },
        columns: [[
            {
                field: 'id',
                hidden: true
            },
            {
                field: 'rows.transName',
                title: '业务名称',
                width: 100,
                hidden: false
            },
            {
                field: 'rows.number',
                title: '单据编号',
                width: 160,
                hidden: false
            },
            {
                field: 'rows.customerName',
                title: '供应商名称',
                hidden: false,
                width: 100
            },
            {
                field: 'rows.name',
                title: '商品名称',
                hidden: false,
                width: 140
            },
            {
                field: "rows.qty",
                title: "数量",
                width: 120,
                hidden: false
            },
            {
                field: "rows.unitName",
                title: "单位",
                width: 120,
                hidden: false
            },
            {
                field: "rows.purPrice",
                title: "单价",
                width: 120,
                hidden: false
            },
            {
                field: "rows.taxRate",
                title: "税率",
                width: 120,
                hidden: false
            },
            {
                field: "rows.discountRate",
                title: "折扣率",
                width: 120,
                hidden: false
            },
            {
                field: "payment",
                title: "付款金额",
                width: 100,
                hidden: false
            },
            {
                field: "rows.storageName",
                title: "仓库名",
                width: 120,
                hidden: false
            },
            {
                field: "rows.purDate",
                title: "单据日期",
                width: 150,
                hidden: false
            },
            {
                field: "rows.note",
                title: "备注",
                width: 150,
                hidden: false
            }
        ]]
    });
}



