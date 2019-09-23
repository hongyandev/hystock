var categoryId;
var query;
$(function () {
    var treeData;
    $.ajaxSetup({
        headers: {
            uid: $.cookie('uid'),
            token: $.cookie('jwt')
        }

    });

    //初始化日期
    var date=new Date();
    date.setDate(1);
    var dateStart = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    $("#startDate").datebox("setValue", dateStart);

    //检索供应商（浮层）
    $(".btn-search").on("click", function () {
        $("#vendorList").datagrid({
            queryParams: {
                query: $("#searTxt").val(),
                category: $("#pidss").val()
            },
        }).datagrid("reload", genAPI('settings/vendorList'));
    });
    //供应商类别（浮层）
    $("#pidss").combotree({
        url: genAPI('settings/categoryList'),
        valueField: 'id',
        textField: 'name',
        parentField: 'pid',
        panelWidth: '200',
        loadFilter: function (res) {
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        formatter: function (node) {
            return node.name;
        },
        queryParams: {
            typeNum: 2
        },
        onClick: function (node) {
            // alert(JSON.stringify(node));
        },
        onBeforeExpand: function (node, param) {

        },
        //供应商类别
        onLoadSuccess: function (node, data) {
            treeData = data;
            $("#pids").combotree({
                valueField: 'id',
                textField: 'name',
                parentField: 'pid',
                formatter: function (node) {
                    return node.name;
                }
            }).combotree('loadData',treeData);
        }

    });



    //供应商列表（浮层）
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
        loadFilter: function (res) {
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        queryParams: {
            query: $("#searTxt").val(),
            category: $("#pidss").val()
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
    $("#pidss").combotree();
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

    //商品类别（浮层）
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
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        onClick: function (node) {
            $("#goods").datagrid('load', {
                query: query,
                categoryId: node.id
            })
        }
    });

    //商品浮层
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

//查询商品列表（浮层）
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
        loadFilter: function (res) {
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
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
    var node = $("#pids").combotree('tree').tree('getSelected');
    var t = node ? node.id : '';
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
        singleSelect: true,
        loadFilter: function (res) {
            if(res.code == 200) {
                return res.data.rows
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        queryParams: {
            beginDate: $("#startDate").val(),
            endDate: $("#endDate").val(),
            supplierId: $("#vendorClass").attr("vid"),
            goodsId: $("#goodl").val(),
            number: $("#number").val(),
            categoryId: t,
            storageId: $("#storageId").val()
        }
    });
}



