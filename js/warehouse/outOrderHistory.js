var rec;
var storageId;
var query;
var zero;
var transType;
$(function () {
    $.ajaxSetup({
        headers: {
            uid: $.cookie('uid'),
            token: $.cookie('jwt')
        }

    });

    function myformatter(date){
        var y = date.getFullYear();
        var m = date.getMonth()+1;
        var d = date.getDate();
        return y+'-'+(m<10?('0'+m):m)+'-'+(d<10?('0'+d):d);
    }
    //初始化日期
    var date=new Date();
    date.setDate(1);
    var dateStart = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    $("#startDate").datebox("setValue", dateStart);
//业务类别
    $("#transType").combobox({
        data:[
            {
                "id": 9,
                "name": "其他出库"
            },{
                "id": 11,
                "name": "盘亏"
            }],
        valueField: 'id',
        textField: 'name',
        cache: false,
        editable: false,
        panelHeight:'200',
        onSelect:function (record) {
            transType = record.id;
        }
    });
//其他入库单记录
    $("#outOrderRecords").datagrid({
        url: genAPI('invOi/queryInvOiPage'),
        method: 'post',
        idField: 'id',
        loadMsg: '数据正在加载,请耐心的等待...',
        pagination: true,
        pageNum: 1,
        pageSize: 10,
        pageList: [20, 40, 50],
        rownumbers: true,
        fitColumns: false,
        showFooter: true,
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
            status: $("#status").val(),
            startDate:$("#startDate").datebox("getValue"),
            endDate: $("#endDate").val(),
            transType: transType
        },
        columns: [[
            {
                field : 'ck',
                checkbox:true,
                width:100
            },
            {
                field: 'id',
                hidden: true
            },
            {
                field: 'invDate',
                title: '单据日期',
                width: 100,
                hidden: false
            },
            {
                field: 'number',
                title: '单据编号',
                width: 160,
                hidden: false
            },
            {
                field: 'customer',
                title: '供应商id',
                hidden: true
            },
            {
                field: 'customerName',
                title: '供应商',
                hidden: false,
                width:100
            },
            {
                field: "status",
                title: "单据状态",
                width: 80,
                hidden: false,
                formatter:function (value,record,rowIndex) {
                    if(value==2){
                        return "已审核"
                    }else{
                        return "未审核"
                    }
                }
            },
            {
                field: "creater",
                title: "制单人",
                width: 100,
                hidden: false
            },
            {
                field: "audit",
                title: "审核人",
                width: 100,
                hidden: false
            }
        ]],
        toolbar: [{
            text: '新增',
            iconCls: 'fa fa-plus fa-lg',
            handler: function () {
                var tabTitle = '采购单';
                var dg="#tabs";
                var url = "webapp/purchase/purchase.html";
                addTopTab(dg,tabTitle,url);
            }
        }, '-', {
            text: '修改',
            iconCls: 'fa fa-pencil-square-o fa-lg',
            handler: function () {
                editPurchase();
            }
        }, '-', {
            text: '删除',
            iconCls: 'fa fa-remove fa-lg',
            handler: function () {
                var row = $("#purchaseList").datagrid('getSelections');
                if (!row) {
                    layer.msg('请选中一行进行操作！')
                }
                if (row.length > 0) {
                    var index = layer.confirm('你确定要删除所选记录吗？', {
                        skin: 'layui-layer-molv',
                        btn: ['确定', '取消'] //按钮
                    }, function (target) {
                        if (target) {
                            $('#purchaseList').datagrid('removeit');
                            layer.close(index);
                        }
                    }, function (index) {
                        layer.close(index)
                    });
                }
            }
        }]
    });

//查询条件下出库单记录
    $("#chx").on("click",function () {
        $("#outOrderRecords").datagrid({
            queryParams:{
                query: $("#searTxt").val(),
                status: $("#status").val(),
                startDate:$("#startDate").datebox("getValue"),
                endDate: $("#endDate").datebox("getValue"),
                transType:'9'
            }
        }).datagrid("reload",genAPI('invOi/queryInvOiPage'));
    })

});

//修改---
function editPurchase() {
    var row = $("#outOrderRecords").datagrid('getSelections');
    if (row.length == 1) {
        var tabTitle = '其他出库单';
        var dg="#tabs";
        var url = "webapp/warehuse/outOrder.html?id="+row[0].id;
        addTopTab(dg,tabTitle,url);
        $.cookie('id',row[0].id);
        $("#outOrderRecords").datagrid("clearSelections");
    }else{
        layer.msg("请选中一行进行编辑");
        $("#outOrderRecords").datagrid("clearSelections");
        return false;
    }
}
//审核
function auditPurchase() {
    var data = $("#outOrderRecords").datagrid('getSelections');
    var id="";
    for(var i=0;i<data.length;i++){
         id += data[i].id+',';
    }
    if(id){
        var ids = id.substring(0,id.length-1)
    }
    $.ajax({
        type:"POST",
        url:genAPI('invOi/batchCheckInvOi'),
        data:{
            ids:ids
        },
        cache: false,
        dataType: "json",
        success:function (res) {
            if(res.code==200){
                var numbers="";
                for(var i=0;i<data.length;i++){
                    numbers += data[i].number + ","
                }
                if(numbers){
                    layer.alert(numbers.substring(0,numbers.length-1)+"审核成功！",{skin:'layui-layer-molv'})
                }
                $("#outOrderRecords").datagrid("reload").datagrid("clearSelections");

            }else {
                layer.alert(res.message,{skin:'layui-layer-molv'});
            }

        }
    })
}
//反审核
function reAuditPurchase() {
    var data = $("#outOrderRecords").datagrid('getSelections');
    var id="";
    for(var i=0;i<data.length;i++){
        id += data[i].id+',';
    }
    if(id){
        var ids = id.substring(0,id.length-1)
    }
    $.ajax({
        type:"POST",
        url:genAPI('invOi/reBatchCheckInvOi'),
        data:{
            ids:ids
        },
        cache: false,
        dataType: "json",
        success:function (res) {
            if(res.code==200){
                var numbers="";
                for(var i=0;i<data.length;i++){
                    numbers += data[i].number + ","
                }
                if(numbers){
                    layer.alert(numbers.substring(0,numbers.length-1)+"反审核成功！",{skin:'layui-layer-molv'})
                }
                $("#outOrderRecords").datagrid("reload").datagrid("clearSelections");

            }else {
                layer.alert(res.message,{skin:'layui-layer-molv'});
            }
        }
    })
}