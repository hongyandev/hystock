var categoryId;
var storageId;
var query;
var zero;
var transType;
$(function () {
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }

    });
//获取单据单号
    $.ajax({
        type:"POST",
        url:genAPI('settings/getBaseNextNo'),
        data:{
            type:7
        },
        cache: false,
        dataType: "json",
        success:function (res) {
            if(res.code==200){
                $("#number").html(res.data.number);
            }
        }
    });
//回显需要修改的商品
    if($.cookie('id')){
        $.ajax({
            type: "post",
            url: genAPI('invTf/getInvTfInfo'),
            cache: false,
            dataType: "json",
            data: {
                id:$.cookie('id')
            },
            success: function (res) {
                if(res.code==200){
                    //console.info(res);
                    if(res.data){
                        $("#tfId").val(res.data.id);
                        $("#number").html(res.data.number);
                        $("#initDate").datebox("setValue",res.data.invDate);
                        $("#stoTransferList").datagrid({data:res.data.detail});
                        $("#note").val(res.data.note);
                        totalMoney();
                        if(res.data.status=="2"){
                            $("#mark").addClass("has-audit");
                            $("#audit").hide();
                            $("#reAudit,#returnPur").show();
                            $("#stoTransferList").datagrid("removeEditor",['name','storageName','unit','qty','price','note'])
                        }
                    }
                    $.cookie('id',null);
                }else{
                    layer.msg(res.message)
                }
            }, error: function () {

            }
        });
    }
//供应商类别
    $("#pids").combotree({
        url:genAPI('settings/categoryList'),
        valueField:'id',
        textField:'name',
        parentField:'pid',
        panelWidth:'200',
        loadFilter:function (res) {
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        formatter:function(node){
            return node.name;
        },
        queryParams:{
            typeNum:2
        },
        onClick : function(node) {

        },
        onBeforeExpand:function(node,param){

        },
        onLoadSuccess:function(node,data){

        }

    });
//供应商列表
    $("#vendorList").datagrid({
        url:genAPI('settings/vendorList'),
        method:'post',
        fitColumns:true,
        striped:true,
        nowrap:true,
        pagination:true,
        rownumbers:true,
        singleSelect:true,
        height:400,
        loadFilter:function (res) {
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        queryParams:{
            query:$("#searTxt").val(),
            category:$("#pids").val()
        },
        columns:[[
            { field:'category2',title:'供应商类别',hidden:true},
            { field:'code',title:'供应商编号',width:100},
            { field:'name',title:'供应商名称',width:200},
            { field:'contact',title:'首要联系人',width :200},
            { field:'mobile',title:'手机',width:200},
            { field:'phone',title:'座机',width:200},
            { field:'im',title:'QQ/微信/email',width:200,hidden:true},
            { field:'status',title:'状态',width:200,formatter:function (value,row,index) {
                    if (value=="1"){
                        return "启用";
                    } else {
                        return "禁用";
                    }
                }}
        ]],
    });
//供应商浮层
    $("#vendorClass").on('click',function () {
        if($("#vendorInfo").is(':hidden')){
            $("#vendorInfo").show();
            $("#vendorList").datagrid('resize');
        }else{
            $("#vendorInfo").hide();
        }
        layer.open({
            type: 1,
            title:"选择商品",
            skin: 'layui-layer-molv', //加上边框
            area: ['88%', '80%'], //宽高
            content: $('#vendorInfo'),
            btn: ['选中并关闭', '取消'],
            yes: function(index, layero){
                var rowSelect = $("#vendorList").datagrid('getSelected');
                if(!rowSelect){
                    layer.alert('请选中一行操作',{skin:'layui-layer-molv'});
                    return false;
                }
                $("#vendorClass").val(rowSelect.code+rowSelect.name);
                $("#vendorClass").attr("vid",rowSelect.id);
                $(".taxRate").val(rowSelect.taxRate);
                var opt = $("#stoTransferList").datagrid('options');
                var dg = $("#stoTransferList");
                dg.datagrid('refreshRow', opt.editIndex);
                var rowsData = dg.datagrid('getRows');
                if(rowsData){
                    for(var i=0;i<rowsData.length-1;i++){
                        rowsData[i].taxRate = rowSelect.taxRate;
                        rowsData[i].purPrice = rowsData[i].purPrice ? rowsData[i].purPrice : 0;
                        dg.datagrid('refreshRow', i);
                    }
                    dg.datagrid('statistics', ["qty","totalPrice"]);

                }
                layer.close(index);
                // $("#vendorList").datagrid("clearSelections")
            }
            ,btn2: function(index, layero){
                layer.close(index);
            },
            end: function () {
                $("#vendorInfo").css("display","none");
            }
        });

    });
//商品类别
    query = $("#searTxts").val();
    zero = $(".chk-ischecked").find('checkbox').prop('checked')== true ? '1' : '0';

    //入库单录入表格
    var goodsId;
    var storageId;
    $("#stoTransferList").datagrid({
        rownumbers : true,
        singleSelect:true,
        fitColumns:false,
        showFooter: true,
        idField:'id',
        height:450,
        columns:[[
            {field:'name',
                title:'产品名称- - -扫描枪录入<button class="switch switch-anim" onclick="checkNum(this)" type="checkbox"></button>',
                width : 300,
                hidden:false,
                formatter:function (value,row,index) {
                    if(row.isFooter){
                        return value;
                    }
                    return (row.code||'') + (row.name||'');
                },
                editor : {
                    type : "combogrid",
                    options:{
                        buttonIcon:'fa fa-ellipsis-h fa-lg',
                        buttonAlign:'right',
                        panelWidth: 500,
                        panelMinWidth: '50%',
                        idField: 'id',
                        textField: 'name',
                        url: genAPI('query/queryGoodsList'),
                        method: 'post',
                        prompt:'输入关键字后自动搜索',
                        mode:'remote',
                        editable:true,
                        hasDownArrow:false,
                        loadFilter:function (res) {
                            if(res.code == 200) {
                                return res.data
                            } else {
                                layer.msg(res.message);
                                return [];
                            }
                        },
                        onBeforeLoad: function(param){

                        },
                        onSelect:function(index,record){
                            goodsId = record.id;
                        },
                        onHidePanel:function () {
                            $.ajax({
                                type:"post",
                                url:genAPI('query/queryGoods'),
                                cache:false,
                                dataType:"json",
                                data:{
                                    id:goodsId
                                },
                                success:function (res) {
                                    if(res.code==200){
                                        console.info(res.data);
                                        var opt = $("#stoTransferList").datagrid("options");
                                        $("#stoTransferList").datagrid('updateRow', {
                                            index: opt.editIndex,
                                            row: res.data
                                        });

                                        $("#stoTransferList").datagrid("editCell",{
                                            index:opt.editIndex,
                                            field:'storageName'
                                        })

                                    }else{
                                        layer.msg(res.message)
                                    }
                                },error:function (res) {
                                    layer.msg(res.message)
                                }
                            })
                        },
                        onLoadSuccess:function () {
                            //return rec;
                        },
                        columns: [[
                            {field:'id',title:'id',hidden:true},
                            {field:'taxRate',title:'税率',hidden:true},
                            {field:'code',title:'商品编号',width:80,align:'center'},
                            {field:'name',title:'商品名称',width:120,align:'center'},
                            {field:'specs',title:'规格型号',width:80,align:'center'},
                            {field:'unitName',title:'基本单位',width:200,align:'center'}
                        ]],
                        fitColumns: true,
                        onClickButton:function () {
                            var sec =  layer.open({
                                type: 1,
                                title:"选择商品",
                                skin: 'layui-layer-molv', //加上边框
                                area: ['88%', '98%'], //宽高
                                content: $('#goodsList'),
                                btn: ['选中并关闭', '取消'],
                                yes: function(sec, layero){
                                    var dg = $('#stoTransferList');
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
                            });
                            queryGoods(query,zero,categoryId,storageId);
                        }
                    }
                }
            },
            {
                field:'storageIdOut',
                hidden:true
            },
            {   field:'storageNameOut',
                title:'调出仓库 &nbsp' +
                '<button class="btn btn-default btn-xs" type="button" onclick="bathStorage1()">批量</button>',
                width : 160,
                hidden:false,
                editor : {
                    type : "combobox",
                    options:{
                        buttonIcon:'fa fa-search fa-lg',
                        buttonAlign:'left',
                        valueField:'name',
                        textField:'name',
                        url:genAPI('settings/storageList'),
                        method:'post',
                        loadFilter:function (res) {
                            if(res.code == 200) {
                                return res.data
                            } else {
                                layer.msg(res.message);
                                return [];
                            }
                        },
                        onSelect:function (record) {
                            var rows = $("#stoTransferList").datagrid('getData').rows;
                            var index = $("#stoTransferList").datagrid('options').editIndex;
                            if (rows.length > 0) {
                                rows[index].storageIdOut = record.id
                            }

                        },
                        onClickButton:function () {
                            var rowData = $("#stoTransferList").datagrid("getSelected");
                            goodsInventoryList(rowData.goodsId);
                            var dd = $(this);
                            var st =  layer.open({
                                type: 1,
                                title:"仓库库存查询",
                                skin: 'layui-layer-molv', //加上边框
                                area: ['600px', '388px'], //宽高
                                content: $('#goodsInventory')
                                ,btn: ['确认', '关闭']
                                ,yes: function(st, layero){
                                    layer.close(st);
                                    var dg = $('#stoTransferList');
                                    var opt = dg.datagrid('options');
                                    var stor = $("#goodsInventoryList").datagrid("getSelected");
                                    $("#stoTransferList").datagrid("updateRow",{
                                        index: opt.editIndex,
                                        row: {
                                            storageNameOut : stor.storageName,
                                            storageId : stor.storageId
                                        }
                                    });
                                    $("#goodsInventoryList").datagrid("clearSelections");
                                }
                                ,btn2: function(st, layero){
                                    layer.close(st);
                                }
                            });


                        }
                    }
                }
            },
            {
                field:'storageIdIn',
                hidden:true
            },
            {   field:'storageNameIn',
                title:'调入仓库 &nbsp' +
                '<button class="btn btn-default btn-xs" type="button" onclick="bathStorage2()">批量</button>',
                width : 160,
                hidden:false,
                editor : {
                    type : "combobox",
                    options:{
                        buttonIcon:'fa fa-search fa-lg',
                        buttonAlign:'left',
                        valueField:'name',
                        textField:'name',
                        url:genAPI('settings/storageList'),
                        method:'post',
                        loadFilter:function (res) {
                            if(res.code == 200) {
                                return res.data
                            } else {
                                layer.msg(res.message);
                                return [];
                            }
                        },
                        onSelect:function (record) {
                            var rows = $("#stoTransferList").datagrid('getData').rows;
                            var index = $("#stoTransferList").datagrid('options').editIndex;
                            if (rows.length > 0) {
                                rows[index].storageIdIn = record.id
                            }

                        },
                        onClickButton:function () {
                            var rowData = $("#stoTransferList").datagrid("getSelected");
                            goodsInventoryList(rowData.goodsId);
                            var dd = $(this);
                            var st =  layer.open({
                                type: 1,
                                title:"仓库库存查询",
                                skin: 'layui-layer-molv', //加上边框
                                area: ['600px', '388px'], //宽高
                                content: $('#goodsInventory')
                                ,btn: ['确认', '关闭']
                                ,yes: function(st, layero){
                                    layer.close(st);
                                    var dg = $('#stoTransferList');
                                    var opt = dg.datagrid('options');
                                    var stor = $("#goodsInventoryList").datagrid("getSelected");
                                    $("#stoTransferList").datagrid("updateRow",{
                                        index: opt.editIndex,
                                        row: {
                                            storageNameIn : stor.storageName,
                                            storageId : stor.storageId
                                        }
                                    });
                                    $("#goodsInventoryList").datagrid("clearSelections");
                                }
                                ,btn2: function(st, layero){
                                    layer.close(st);
                                }
                            });


                        }
                    }
                }
            },
            {
                field:'storageId',
                hidden:true
            },
            {   field:'unit',
                title:'单位',
                width : 80,
                hidden:false,
                formatter:function (value,rowData,rowIndex) {
                    var units = rowData.units;
                    var unitName = "";
                    if(units){
                        for (var i=0; i<units.length; i++) {
                            if(value == units[i]["id"]){
                                unitName = units[i]["unitName"];
                                break;
                            }
                        }
                    }
                    return unitName;
                },
                editor : {
                    type : "combobox",
                    options:{
                        valueField:'id',
                        textField:'unitName',
                        url:genAPI('settings/getUnitsById'),//通过id获取计量单位
                        method:'post',
                        loadFilter:function (res) {
                            if(res.code == 200) {
                                return res.data
                            } else {
                                layer.msg(res.message);
                                return [];
                            }
                        },
                        onBeforeLoad:function (param){
                            //console.info(param);
                            var opts = $("#stoTransferList").datagrid('options');
                            var rows = $('#stoTransferList').datagrid('getRows');
                            var rowsData = rows[opts.editIndex];
                            console.info(rowsData);
                            param.id = rowsData.unit || 0;
                        }

                    }

                }
            },
            {
                field:"qty",
                title:"数量",
                width:150,
                hidden:false,
                editor:{
                    type : "numberbox",
                    options:{
                        value:0,
                        precision:0
                    }
                }
            },
            {
                field:"purPrice",
                title:"采购单价",
                width:150,
                hidden:true
            },
            {   field:"note",
                title:"备注",
                width:150,
                hidden:false,
                editor:{
                    type : "validatebox"
                }
            }
        ]],
        lastFieldFun: function (dg, index, field) {
            var nextIndex = index + 1;
            var row = $('#stoTransferList').datagrid('getRows')[nextIndex];

            if(!row) {
                $('#stoTransferList').datagrid('append', {});
            }
            if (dg.datagrid('endEditing')) {
                dg.datagrid('selectRow', nextIndex).datagrid('editCell', {
                    index: nextIndex,
                    field: 'name'
                });
            }
        },
        toolbar:[{
            text:'添加',
            iconCls:'fa fa-plus fa-lg',
            handler:function(){
                var row = {
                    name:'',
                    storageName:'',
                    unit:'',
                    qty:'',
                    price:'',
                    totalPrice:'',
                    note:''
                };
                $('#stoTransferList').datagrid('append', row);
                /*var editIndex = $("#stoTransferList").datagrid('getRows').length-1;
                if($('#stoTransferList').datagrid('endEditing')){
                    $('#stoTransferList').datagrid('selectRow', editIndex).datagrid('editCell', {
                        index: editIndex,
                        field: 'name'
                    });
                }*/
            }
        },'-',{
            text:'删除',
            iconCls:'fa fa-remove fa-lg',
            handler:function () {
                var t =$(this);
                console.info(t);
                var row = $("#stoTransferList").datagrid('getSelections');
                if(!row){
                    layer.msg('请选中一行进行操作！')
                }
                if(row.length>0) {
                    var index = layer.confirm('你确定要删除所选记录吗？', {
                        skin: 'layui-layer-molv',
                        btn: ['确定', '取消'] //按钮
                    }, function (target) {
                        if (target) {
                            $('#stoTransferList').datagrid('removeit');
                            var dg = $('#stoTransferList');
                            var opt = dg.datagrid('options');
                            dg.datagrid('refreshRow', opt.editIndex);
                            totalMoney();
                            layer.close(index);
                        }
                    }, function (index) {
                        layer.close(index)
                    });
                }
            }
        }],
        onAfterEdit:function (rowIndex, rowData, changes) {
            if(changes["qty"] || changes["price"]){
                totalMoney();
            }
        }
    }).datagrid('enableCellEditing').datagrid('reloadFooter',
        [{
            "name":"合计：",
            "qty":0,
            "totalPrice":0,
            "isFooter":true
        }]

    );
//获取批量仓库列表
    $.ajax({
        type:"POST",
        url:genAPI('settings/storageList'),
        cache: false,
        dataType: "json",
        contentType : "application/json;charset=UTF-8",
        success:function (res) {
            var str="";
            $.each(res.data,function (index,val){
                str+="<li>" +
                    "<a class='clear block' storgeId='"+val.id+"' href='javascript:void(0)'>" +
                    "<p class='font16'>"+val.name+"</p>" +
                    "</a>" +
                    "</li>";
            });
            $('.dropdownUl').append(str);
        }
    });

//操作日志
    $("#dd").on("click",function () {
        $.ajax({
            type:'post',
            url:genAPI('query/queryInvOpeLog'),
            data:{
                invId:$("#inOrderId").val(),
                vType:'8'
            },
            success:function (res) {
                if(res.code=='200'){
                    var str='';
                    for(var i=0;i<res.data.length;i++){
                        str+='<ul class="tipul">\n' +
                            '     <li>\n' +
                            '        <p>'+
                            '        <span>'+res.data[i].logName+'</span>\n' +
                            '        <span>'+res.data[i].user+'</span>\n' +
                            '        </p>'+
                            '        <time>'+res.data[i].createTime+'</time>\n' +
                            '     </li>\n' +
                            '  </ul>';
                    }
                    layer.tips(str,
                        '#dd', {
                            tips: [1, '#3595CC'],
                            time: 3000
                        });
                }else{
                    layer.msg(res.msg)
                }
            }
        });



    });
});
//查询商品列表（分页）
var units = [];
function queryGoods(query,zero,categoryId,storageId) {
    $("#goods").datagrid({
        url:genAPI('query/queryGoodsPage'),
        method:'post',
        rownumbers : true,
        striped:true,
        nowrap:true,
        checkOnSelect:true,
        idField:'id',
        pagination:true,
        height:300,
        loadFilter:function (res) {
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        queryParams:{
            query:query,
            zero:zero,
            categoryId:categoryId,
            storageId:storageId
        },
        columns:[[
            {
                field : 'ck',
                checkbox:true,
                width:100
            },
            {   field:'code',
                title:'商品编号',
                width : 100,
                hidden:false
            },
            {   field:'name',
                title:'商品名称',
                width : 100,
                hidden:false
            },
            {   field:'specs',
                title:'规格型号',
                width : 100,
                hidden:false
            },
            {   field:'categoryName',
                title:'商品类别',
                width : 100,
                hidden:false
            },
            {   field:'unit',
                title:'单位',
                width : 50,
                hidden:false,
                formatter:function (value,rowData,rowIndex) {
                    var units = rowData.units;
                    var unitName = "";
                    if(units){
                        for (var i=0; i<units.length; i++) {
                            if(value == units[i]["id"]){
                                unitName = units[i]["unitName"];
                                break;
                            }
                        }
                    }
                    return unitName;
                },
                editor : {
                    type : "combobox",
                    options:{
                        valueField:'id',
                        textField:'unitName',
                        url:genAPI('settings/getUnitsById'),//通过id获取计量单位
                        method:'post',
                        loadFilter:function (res) {
                            if(res.code == 200) {
                                return res.data
                            } else {
                                layer.msg(res.message);
                                return [];
                            }
                        },
                        onBeforeLoad:function (param){
                            //console.info(param);
                            var opts = $("#goods").datagrid('options');
                            var rows = $('#goods').datagrid('getRows');
                            var rowsData = rows[opts.editIndex];
                            console.info(rowsData);
                            param.id = rowsData.unit;
                        }

                    }

                }
            },
            {   field:'currentQty',
                title:'可用库存',
                width : 80,
                hidden:false
            },
            {   field:'qty',
                title:'录入数量',
                width : 80,
                hidden:false,
                editor : {
                    type : "numberbox"
                }
            },
            {   field:'bz',
                title:'备注',
                width : 100,
                hidden:false
            },
            {   field:'taxRate',
                title:'税率',
                width : 100,
                hidden:true
            }
        ]],
        lastFieldFun: function (dg, index, field) {
            //console.info(index, field);
            dg.datagrid('endEditing');
        },
        onClickRow: function (rowIndex, rowData) {
            $(this).datagrid('selectRow', rowIndex);
        }
    }).datagrid('enableCellEditing');
}
//
function goodsInventoryList(goodsId) {
    $("#goodsInventoryList").datagrid({
        url:genAPI('query/queryGoodsInventory'),
        method:'post',
        rownumbers : true,
        striped:true,
        nowrap:true,
        singleSelect:true,
        idField:'id',
        height:200,
        loadFilter:function (res) {
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        queryParams:{
            goodsId:goodsId
        },
        columns:[[
            {   field:'storageId',
                title:'仓库号',
                width : 100,
                hidden:false
            },
            {   field:'storageName',
                title:'仓库名',
                width : 100,
                hidden:false
            },
            {   field:'currentQty',
                title:'数量',
                width : 100,
                hidden:false
            },
            {   field:'currentUnitCost',
                title:'单位成本',
                width : 100,
                hidden:false
            },
            {   field:'currentTotal',
                title:'总金额',
                width : 50,
                hidden:false
            }
        ]],
        lastFieldFun: function (dg, index, field) {
            //console.info(index, field);
            dg.datagrid('endEditing');
        },
        onClickRow: function (rowIndex, rowData) {
            $(this).datagrid('selectRow', rowIndex);
        }
    })
}
//合计
function totalMoney() {
    var dg = $('#stoTransferList');
    var rowsData = dg.datagrid('getRows');
    for(var i=0;i<rowsData.length;i++){
        if(!rowsData[i].goodsId){
            rowsData[i].goodsId = rowsData[i].id;
            rowsData[i].id = null;
        }
        rowsData[i].price = rowsData[i].purPrice ? rowsData[i].purPrice : 0;
        rowsData[i].purPrice = rowsData[i].purPrice ? rowsData[i].purPrice : 0;
        rowsData[i].qty = rowsData[i].qty ? rowsData[i].qty : 0;
        rowsData[i].totalPrice = intToFloat(accMul(rowsData[i].purPrice,rowsData[i].qty));
        dg.datagrid('refreshRow', i);
    }
    dg.datagrid('statistics', ["qty","totalPrice"]);
}
//查询商品
function seachForm() {
    var query = $("#searTxts").val();
    var chk = $(".chk-ischecked").find('checkbox').prop('checked')== true ? '9' : '1';
    var category = $('#cateTree').tree('getSelected');
    if(category){
        $("#goods").datagrid('load',{
            query: query,
            status: chk,
            category:category.id
        })
    }else{
        $("#goods").datagrid('load',{
            query: query,
            status: chk,
            category:""
        })
    }

}
//开启扫描枪录入
function start() {
    var dg = $("#stoTransferList");
    dg.datagrid('removeEditor','name');
    dg.datagrid('addEditor',[
        {
            field:'name',
            editor:{
                type:'validatebox',
                options: {
                    eventFun : function(v, e) {
                        var barCode = v;
                        var code = e.keyCode || e.which;
                        if(code == 13){
                            $.ajax({
                                type:"POST",
                                url:genAPI('query/queryGoods'),
                                async:true,
                                data:{
                                    barCode:barCode
                                },
                                dataType:"json",
                                success:function(res){
                                    if(res.code=='200'){
                                        var dg = $("#stoTransferList");
                                        var opt = dg.datagrid("options");
                                        if(res.data==null){
                                            $(e.target).val("");
                                        } else {
                                            var rowData = dg.datagrid('getRows');
                                            var flag = true;
                                            for(var i=0;i<rowData.length;i++){
                                                if(rowData.barCode ==  $(e.target).val()){
                                                    rowData[i].qty++;
                                                    flag = false;
                                                }
                                            }
                                            if(flag){
                                                res.data.qty = 1;
                                                dg.datagrid('updateRow', {
                                                    index: opt.editIndex,
                                                    row: res.data
                                                });
                                                dg.datagrid("append",{});
                                            }
                                        }
                                        dg.datagrid("editCell",{
                                            index: opt.editIndex,
                                            field: 'name'
                                        })
                                    }else{
                                        layer.msg(res.message)
                                    }
                                }
                            })
                        }
                        return false;
                    }
                }


            }
        }
    ]);


}
//关闭扫描枪录入
function end() {
    $("#stoTransferList").datagrid('removeEditor',['name','storageName','unit','qty']);
    $("#stoTransferList").datagrid('addEditor',[
        {field:'name',
            title:'产品名称- - -扫描枪录入<button class="switch switch-anim" onclick="checkNum(this)" type="checkbox"></button>',
            width : 300,
            hidden:false,
            formatter:function (value,row,index) {
                if(row.isFooter){
                    return value;
                }
                return (row.code||'') + (row.name||'');

            },
            editor : {
                type : "combogrid",
                options:{
                    buttonIcon:'fa fa-ellipsis-h fa-lg',
                    buttonAlign:'right',
                    panelWidth: 500,
                    panelMinWidth: '50%',
                    idField: 'id',
                    textField: 'name',
                    url: genAPI('query/queryGoodsList'),
                    method: 'post',
                    prompt:'输入关键字后自动搜索',
                    mode:'remote',
                    editable:true,
                    hasDownArrow:false,
                    loadFilter:function (res) {
                        if(res.code == 200) {
                            return res.data
                        } else {
                            layer.msg(res.message);
                            return [];
                        }
                    },
                    onBeforeLoad: function(param){
                        console.info(param);
                        if(param){

                        }
                    },
                    onSelect:function(index,record){
                        goodsid = record.id;
                    },
                    onHidePanel:function () {
                        $.ajax({
                            type:"post",
                            url:genAPI('query/queryGoods'),
                            cache:false,
                            dataType:"json",
                            data:{
                                id:goodsid
                            },
                            success:function (res) {
                                if(res.code==200){
                                    console.info(res.data);
                                    var opt = $("#stoTransferList").datagrid("options");
                                    $("#stoTransferList").datagrid('updateRow', {
                                        index: opt.editIndex,
                                        row: res.data
                                    });

                                    $("#stoTransferList").datagrid("editCell",{
                                        index:opt.editIndex,
                                        field:'storageName'
                                    })

                                }else{
                                    layer.msg(res.message)
                                }
                            },error:function (res) {
                                layer.msg(res.message)
                            }
                        })
                    },
                    onLoadSuccess:function () {
                        //return rec;
                    },
                    columns: [[
                        {field:'id',title:'id',hidden:true},
                        {field:'taxRate',title:'税率',hidden:true},
                        {field:'code',title:'商品编号',width:80,align:'center'},
                        {field:'name',title:'商品名称',width:120,align:'center'},
                        {field:'specs',title:'规格型号',width:80,align:'center'},
                        {field:'unitName',title:'基本单位',width:200,align:'center'}
                    ]],
                    fitColumns: true,
                    onClickButton:function () {
                        var sec =  layer.open({
                            type: 1,
                            title:"选择商品",
                            skin: 'layui-layer-molv', //加上边框
                            area: ['88%', '98%'], //宽高
                            content: $('#goodsList'),
                            btn: ['选中并关闭', '取消'],
                            yes: function(sec, layero){
                                var dg = $('#stoTransferList');
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
                        });
                        queryGoods(query,zero,categoryId,storageId);
                    }
                }
            }
        },
        {   field:'storageName',
            title:'仓库 &nbsp' +
            '<button class="btn btn-default btn-xs" type="button" onclick="bathStorage()">批量</button>',
            width : 160,
            hidden:false,
            formatter:function (value,rowData,rowIndex) {
                //console.info(value,rowData)
                return rowData.storageName || ""
            },
            editor : {
                type : "combobox",
                options:{
                    buttonIcon:'fa fa-search fa-lg',
                    buttonAlign:'left',
                    valueField:'id',
                    textField:'name',
                    url:genAPI('settings/storageList'),
                    method:'post',
                    loadFilter:function (res) {
                        if(res.code == 200) {
                            return res.data
                        } else {
                            layer.msg(res.message);
                            return [];
                        }
                    },
                    onSelect:function (record) {
                        return record.name;
                    },
                    onClickButton:function () {
                        var dd = $(this);
                        var st =  layer.open({
                            type: 1,
                            skin: 'layui-layer-molv', //加上边框
                            area: ['600px', '388px'], //宽高
                            content: $('')
                            ,btn: ['保存', '取消']
                            ,yes: function(st, layero){
                                layer.close(st);

                            }
                            ,btn2: function(st, layero){
                                layer.close(st);
                            }
                        });


                    }
                }
            }
        },
        {   field:'unit',
            title:'单位',
            width : 80,
            hidden:false,
            formatter:function (value,rowData,rowIndex) {
                var units = rowData.units;
                var unitName = "";
                if(units){
                    for (var i=0; i<units.length; i++) {
                        if(value == units[i]["id"]){
                            unitName = units[i]["unitName"];
                            break;
                        }
                    }
                }
                return unitName;
            },
            editor : {
                type : "combobox",
                options:{
                    valueField:'id',
                    textField:'unitName',
                    url:genAPI('settings/getUnitsById'),//通过id获取计量单位
                    method:'post',
                    loadFilter:function (res) {
                        if(res.code == 200) {
                            return res.data
                        } else {
                            layer.msg(res.message);
                            return [];
                        }
                    },
                    onBeforeLoad:function (param){
                        //console.info(param);
                        var opts = $("#stoTransferList").datagrid('options');
                        var rows = $('#stoTransferList').datagrid('getRows');
                        var rowsData = rows[opts.editIndex];
                        console.info(rowsData);
                        param.id = rowsData.unit || 0;
                    }

                }

            }
        },
        {
            field:"qty",
            title:"数量",
            width:150,
            hidden:false,
            editor:{
                type : "numberbox",
                options:{
                    value:0,
                    precision:0
                }
            }
        },
        {
            field:"discountRate",
            title:"折扣率",
            width:150,
            hidden:false,
            editor:{
                type : "numberbox",
                options:{
                    value:0,
                    precision:2
                }

            }
        }
    ])

}
//开关选中与否
function checkNum(checkbox){
    $('.switch-anim').toggleClass('checked');
    if($(checkbox).hasClass('checked')){
        console.log("选中");
        if($("#status").val() == "2"){
            $("#stoTransferList").datagrid("removeEditor","name");
        }else{
            start();
        }

    }else{
        console.log("没选中");
        if($("#status").val() == "2"){
            $("#stoTransferList").datagrid("removeEditor",['name','storageName','unit','qty','discountRate','note'])
        }else{
            end();
        }

    }
    var opts = $("#stoTransferList").datagrid('options');
    //console.info(opts);
    $("#stoTransferList").datagrid('cancelEdit',opts.editIndex);
}
//批量仓库
function bathStorage1() {
    if($('.dropdownBg1').is(':hidden')){
        $(".dropdownBg1").show();
        var row = $("#stoTransferList").datagrid("getRows");
        $('.dropdownBg1').find('li').click(function () {
            var storageName = $(this).text();
            var storageid = $(this).find("a").attr("storgeid");
            for(var i=0;i<row.length;i++){
                $("#stoTransferList").datagrid("updateRow",{
                    index: i,
                    row: {
                        storageNameOut : storageName,
                        storageIdOut : storageid
                    }
                })
            }
            $('.dropdownBg1').hide();
        });
    }else{//否则
        $('.dropdownBg1').hide();
    }
}
function bathStorage2() {
    if($('.dropdownBg2').is(':hidden')){
        $(".dropdownBg2").show();
        var row = $("#stoTransferList").datagrid("getRows");
        $('.dropdownBg').find('li').click(function () {
            var storageName = $(this).text();
            var storageid = $(this).find("a").attr("storgeid");
            for(var i=0;i<row.length;i++){
                $("#stoTransferList").datagrid("updateRow",{
                    index: i,
                    row: {
                        storageNameIn : storageName,
                        storageIdIn : storageid
                    }
                })
            }
            $('.dropdownBg2').hide();
        });
    }else{//否则
        $('.dropdownBg2').hide();
    }
}
//新增
function addTransferList() {
    var tabTitle = '调拨单';
    var dg="#tabs";
    var url = "webapp/warehouse/storageTransfer.html";
    addTopTab(dg,tabTitle,url)
}
//保存
function saveTransferList() {
    $("#stoTransferList").datagrid('endEditing');
    var dg = $("#stoTransferList");
    var inDet = dg.datagrid('getRows');
    var invDate = $('#initDate').datebox('getValue');
    var customer = $("#vendorClass").attr("vid");
    if(inDet.length == 0){
        layer.msg("请选择商品！");
        return false;
    }else {
        var a = true;
        for(var i=0;i<inDet.length;i++){
            if(inDet[i].goodsId && inDet[i].storageId == ""){
                layer.msg("请选择仓库！");
                a = false;
                break;
            } else if (!inDet[i].goodsId){
                //purDet.splice(i,1)
                dg.datagrid("deleteRow", i);
            }
        }
        if(!a){return false}
        inDet = dg.datagrid('getRows');
    }
    var data = {
        id:$("#tfId").val() ? $("#tfId").val() : 0,
        number:$("#number").html(),
        invDate:invDate,
        note:$("#note").val(),
        detail:inDet
    };
    /*if($("#tfId").val()!=0){
        url
    }*/
    $.ajax({
        type:"POST",
        url:genAPI($("#tfId").val()!=0 ? 'invTf/modifyInvTf' :'invTf/createInvTf'),
        async:true,
        contentType:"application/json",
        data:JSON.stringify(data),
        success:function(res){
            if(res.code=='200'){
                layer.msg("保存成功！");
                console.info(res.data);
                $("#tfId").val(res.data.id);
            }else{
                layer.msg(res.message)
            }
        }
    });
}
//审核
function auditTransferList() {
    $("#stoTransferList").datagrid('endEditing');
    var dg = $("#stoTransferList");
    var inDet = dg.datagrid('getRows');
    var invDate = $('#initDate').datebox('getValue');
    if(inDet.length == 0){
        layer.msg("请选择商品！");
        return false;
    }else {
        var a = true;
        for(var i=0;i<inDet.length;i++){
            if(inDet[i].goodsId && inDet[i].storageId == ""){
                layer.msg("请选择仓库！");
                a = false;
                break;
            } else if (!inDet[i].goodsId){
                //purDet.splice(i,1)
                dg.datagrid("deleteRow", i);
            }
        }
        if(!a){return false}
        inDet = dg.datagrid('getRows');
    }
    var data = {
        id:$("#tfId").val() ? $("#tfId").val() : 0,
        number:$("#number").html(),
        invDate:invDate,
        note:$("#note").val(),
        detail:inDet
    };
    $.ajax({
        type:"POST",
        url:genAPI('invTf/checkInvTf'),
        async:true,
        contentType:"application/json",
        data:JSON.stringify(data),
        success:function (res) {
            if(res.code==200){
                $("#mark").addClass("has-audit");
                $("#audit").hide();
                $("#reAudit,#returnPur").show();
                $("#stoTransferList").datagrid("removeEditor",['name','storageName','unit','qty','discountRate','note'])
            }else{
                layer.msg(res.message);
            }
        }
    })
}
//历史单据
function historyReceipts() {
    var tabTitle = '调拨单记录';
    var dg="#tabs";
    var url = "webapp/warehouse/stoTransHistory.html";
    addTopTab(dg,tabTitle,url)

}
