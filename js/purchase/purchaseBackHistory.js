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

    function myformatter(date){
        var y = date.getFullYear();
        var m = date.getMonth()+1;
        var d = date.getDate();
        return y+'-'+(m<10?('0'+m):m)+'-'+(d<10?('0'+d):d);
    }
//采购单记录
    $("#purchaseBackRecords").datagrid({
        url: genAPI('pur/queryInvPuPage'),
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
            startDate: $("#startDate").val(),
            endDate: $("#endDate").val(),
            hxState: $("#hxState").val(),
            transType:'6'
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
                field: 'purDate',
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
                field: 'vendorName',
                title: '供应商',
                hidden: false,
                width:100
            },
            {
                field: "amount",
                title: "退货金额",
                width: 120,
                hidden: false
            },
            {
                field: "discountRate",
                title: "优惠后金额",
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
                field: "hxState",
                title: "付款状态",
                width: 150,
                hidden: false
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
                var tabTitle = '采购退货单';
                var dg="#tabs";
                var url = "webapp/purchase/purchaseBack.html";
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
    //初始化日期
    var date=new Date();
    date.setDate(1);
    var dateStart = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    $("#startDate").datebox("setValue", dateStart);
    //付款状态
    var ids;
    $('#hxState').combo({
        required : true,
        editable : true,
        multiple : true
    });
    $('#sp').appendTo($('#hxState').combo('panel'));
    $("#sp input").click(function() {
        var _value = "";
        var _text = "";
        $("[name=hxState]:input:checked").each(function() {
            _value += $(this).val() + ",";
            _text += $(this).next("span").text() + ",";
        });
        //设置下拉选中值
        $('#hxState').combo('setValue', _value).combo(
            'setText', _text);
        if (_value){
            ids = _value.substring(0,_value.length-1);
        }
    });
    //查询条件下退货单记录
    $("#chx").on("click",function () {
        $("#purchaseBackRecords").datagrid({
            queryParams: {
                query: $("#searTxt").val(),
                status: $("#status").val(),
                startDate: $("#startDate").datebox("getValue"),
                endDate: $("#endDate").datebox("getValue"),
                hxState: ids,
                transType:'6'
            },
        }).datagrid("reload", genAPI('pur/queryInvPuPage'));
    });
});

//修改---
function editPurchase() {
    var row = $("#purchaseBackRecords").datagrid('getSelections');
    if (row.length == 1) {
        var tabTitle = '采购退货单';
        var dg="#tabs";
        var url = "webapp/purchase/purchaseBack.html?id="+row[0].id;
        addTopTab(dg,tabTitle,url);
        $.cookie('id',row[0].id);
        $("#purchaseBackRecords").datagrid("clearSelections");
    }else{
        layer.msg("请选中一行进行编辑");
        $("#purchaseBackRecords").datagrid("clearSelections");
        return false;
    }
}
//审核
function auditPurchase() {
    var data = $("#purchaseBackRecords").datagrid('getSelections');
    var id="";
    for(var i=0;i<data.length;i++){
         id += data[i].id+',';
    }
    if(id){
        var ids = id.substring(0,id.length-1)
    }
    $.ajax({
        type:"POST",
        url:genAPI('pur/batchCheckInvPu'),
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
                $("#purchaseBackRecords").datagrid("reload").datagrid("clearSelections");

            }else {
                layer.alert(res.message,{skin:'layui-layer-molv'});
            }

        }
    })
}
//反审核
function reAuditPurchase() {
    var data = $("#purchaseBackRecords").datagrid('getSelections');
    var id="";
    for(var i=0;i<data.length;i++){
        id += data[i].id+',';
    }
    if(id){
        var ids = id.substring(0,id.length-1)
    }
    $.ajax({
        type:"POST",
        url:genAPI('pur/rsBatchCheckInvPu'),
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
                $("#purchaseBackRecords").datagrid("reload").datagrid("clearSelections");

            }else {
                layer.alert(res.message,{skin:'layui-layer-molv'});
            }
        }
    })
}