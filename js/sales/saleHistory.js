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
//销货单记录
    $("#salesRecords").datagrid({
        url: genAPI('/invSa/queryInvSaPage'),
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
            transType:'3'
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
                field: 'saleDate',
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
                title: '客户',
                hidden: true
            },
            {
                field: "amount",
                title: "购货金额",
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
                field: "income",
                title: "到款金额",
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

    //查询条件下销货单记录
    $("#chx").on("click",function () {
        $("#salesRecords").datagrid({
            queryParams:{
                query:$("#searTxt").val(),
                status:$("#status").val(),
                startDate:$("#startDate").datebox("getValue"),
                endDate: $("#endDate").datebox("getValue"),
                hxState: ids,
                transType: 3
            }
        }).datagrid("reload",genAPI('/invSa/queryInvSaPage'));
    })

});

//修改---
function editPurchase() {
    var row = $("#salesRecords").datagrid('getSelections');
    if (row.length == 1) {
        var tabTitle = '销售单';
        var dg="#tabs";
        var url = "webapp/sales/sale.html?id="+row[0].id;
        addTopTab(dg,tabTitle,url);
        $.cookie('id',row[0].id);
        $("#salesRecords").datagrid("clearSelections");
    }else{
        layer.msg("请选中一行进行编辑");
        $("#salesRecords").datagrid("clearSelections");
        return false;
    }
}
//审核
function auditSales() {
    var data = $("#salesRecords").datagrid('getSelections');
    var id="";
    for(var i=0;i<data.length;i++){
        id += data[i].id+',';
    }
    if(id){
        var ids = id.substring(0,id.length-1)
    }
    $.ajax({
        type:"POST",
        url:genAPI('/invSa/batchCheckInvSa'),
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
                $("#salesRecords").datagrid("reload").datagrid("clearSelections");

            }else {
                layer.alert(res.message,{skin:'layui-layer-molv'});
            }

        }
    })
}
//反审核
function reAuditSales() {
    var data = $("#salesRecords").datagrid('getSelections');
    var id="";
    for(var i=0;i<data.length;i++){
        id += data[i].id+',';
    }
    if(id){
        var ids = id.substring(0,id.length-1)
    }
    $.ajax({
        type:"POST",
        url:genAPI('/invSa/rsbatchCheckInvSa'),
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
                $("#salesRecords").datagrid("reload").datagrid("clearSelections");

            }else {
                layer.alert(res.message,{skin:'layui-layer-molv'});
            }
        }
    })
}

//新增销售单
function saveSales() {
    var tabTitle = '销售单';
    var dg="#tabs";
    var url = "webapp/sales/sale.html";
    addTopTab(dg,tabTitle,url)

}