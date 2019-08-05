var rec;
var storageId;
var query;
var zero;
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
                $("#vendorClass").val(rowSelect.code + rowSelect.name);
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
    //产品浮层
    $("#goodl").on('click',function () {
        layer.open({
            type: 1,
            title:"选择商品",
            skin: 'layui-layer-molv', //加上边框
            area: ['88%', '98%'], //宽高
            content: $('#goodsList'),
            btn: ['选中并关闭', '取消'],
            yes: function(sec, layero){
                var dg = $('#purchaseList');
                var opt = dg.datagrid('options');
                var data = $("#goods").datagrid('getSelections');
                $("#goods").datagrid('endEditing');
                var dgIndex = opt.editIndex + 1;
                dg.datagrid('updateRow', {
                    index: opt.editIndex,
                    row: data[0]
                });
                dg.datagrid('refreshRow', 0);
                for(var i=1;i<data.length;i++){
                    dg.datagrid('insertRow', {
                        index: dgIndex,
                        row: data[i]
                    });
                    dg.datagrid('refreshRow', i);
                    dgIndex ++;
                }
                $("#goods").datagrid("clearSelections");
                totalMoney();
                discountData();
                layer.close(sec);
                if(dg.datagrid("getRows").length == dgIndex) {
                    dg.datagrid("append", {});
                } else {
                    dg.datagrid("editCell",{index: dgIndex, field: 'name'});
                }
            }
            ,btn2: function(sec, layero){
                layer.close(sec);
            }
        })
    });
});


