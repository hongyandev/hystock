var rec;
var categoryId;
var storageId;
var query;
var zero;
$(function () {
    var company = $.cookie('company');
    var obj = JSON.parse(company);
    var tax = obj.tax;
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }

    });
//获取编剧单号
    $.ajax({
        type:"POST",
        url:genAPI('settings/getBaseNextNo'),
        data:{
            type:4
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
    if($.cookie('pbid')){
        $.ajax({
            type: "post",
            url: genAPI('invSa/toSaReturn'),
            cache: false,
            dataType: "json",
            data: {
                id:$.cookie('pbid')
            },
            success: function (res) {
                if(res.code==200){
                    // console.info(res);
                    if(res.data){
                        $("#salerId").val(res.data.id);
                        $("#status").val(res.data.status);
                        $("#vendorClass").val(res.data.vendorName);
                        $("#vendorClass").attr("vid",res.data.customer);
                        $("#number").html(res.data.number);
                        $("#saleRList").datagrid({data:res.data.detail});
                        $("#discountRate").val(res.data.discountRate);
                        $("#disAmount").val(res.data.disAmount);
                        $("#payment").val(res.data.income);
                        $("#amount").val(res.data.amount);
                        $("#totalAmount").val(res.data.totalAmount);
                        $("#note").val(res.data.note);
                        totalMoney();
                        // discountData();
                        if(res.data.status=="2"){
                            $("#mark").addClass("has-audit");
                            $("#audit").hide();
                            $("#reAudit,#returnPur").show();
                            $("#discountRate,#deduction,#payment,#arrears,#account").attr("readOnly",true);
                            $("#saleRList").datagrid("removeEditor",['name','storageName','unit','qty','discountRate','note'])
                        }
                    }

                    $.cookie('pbid',null);
                }else{
                    layer.msg(res.message)
                }
            }, error: function () {

            }
        });
    }
//初始化日期
    $('#initDate').datebox('calendar');
    function myformatter(date){
        var y = date.getFullYear();
        var m = date.getMonth()+1;
        var d = date.getDate();
        return y+'-'+(m<10?('0'+m):m)+'-'+(d<10?('0'+d):d);
    }
//检索客户
    $(".btn-search").on("click",function () {
        $("#vendorList").datagrid({
            queryParams:{
                query:$("#searTxt").val(),
                category:$("#pids").val()
            },
        }).datagrid("reload",genAPI('settings/customerList'));
    });
//客户类别
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
            typeNum:1
        },
        onClick : function(node) {

        },
        onBeforeExpand:function(node,param){

        },
        onLoadSuccess:function(node,data){

        }

    });
    var khlayer;
//客户列表
    $("#vendorList").datagrid({
        url:genAPI('settings/customerList'),
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
            { field:'category2',title:'客户类别',hidden:true},
            { field:'code',title:'客户编号',width:100},
            { field:'name',title:'客户名称',width:200},
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
        onDblClickRow:function (rowIndex,rowData) {
            $("#vendorClass").val(rowData.code+rowData.name);
            $("#vendorClass").attr("vid",rowData.id);
            $(".taxRate").val(rowData.taxRate);
            var opt = $("#saleRList").datagrid('options');
            var dg = $("#saleRList");
            dg.datagrid('refreshRow', opt.editIndex);
            var rowsData = dg.datagrid('getRows');
            if(rowsData){
                for(var i=0;i<rowsData.length-1;i++){
                    rowsData[i].taxRate = rowSelect.taxRate;
                    rowsData[i].discountRate = rowsData[i].discountRate ? rowsData[i].discountRate : 0;
                    rowsData[i].SalePrice = rowsData[i].SalePrice ? rowsData[i].SalePrice : 0;
                    rowsData[i].tax = accMul(accSub(accMul(rowsData[i].SalePrice,rowsData[i].qty),accMul(rowsData[i].qty,accMul(rowsData[i].SalePrice,accDiv(rowsData[i].discountRate,100)))),accDiv(rowsData[i].taxRate,100));
                    rowsData[i].totalLevied = accMul(accSub(accMul(rowsData[i].SalePrice,rowsData[i].qty),accMul(rowsData[i].qty,accMul(rowsData[i].SalePrice,accDiv(rowsData[i].discountRate,100)))),accAdd(1,accDiv(rowsData[i].taxRate,100)));
                    dg.datagrid('refreshRow', i);
                }
                dg.datagrid('statistics', ["qty","discountPrise","totalPrice","tax","totalLevied"]);

            }
            discountData();
            layer.close(khlayer);
        }
    });
//客户浮层
    $("#vendorClass").on('click',function () {
        if($("#vendorInfo").is(':hidden')){
            $("#vendorInfo").show();
            $("#vendorList").datagrid('resize');
        }else{
            $("#vendorInfo").hide();
        }
        khlayer =  layer.open({
            type: 1,
            title:"选择客户",
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
                var opt = $("#saleRList").datagrid('options');
                var dg = $("#saleRList");
                dg.datagrid('refreshRow', opt.editIndex);
                var rowsData = dg.datagrid('getRows');
                if(rowsData){
                    for(var i=0;i<rowsData.length-1;i++){
                        rowsData[i].taxRate = rowSelect.taxRate;
                        rowsData[i].discountRate = rowsData[i].discountRate ? rowsData[i].discountRate : 0;
                        rowsData[i].salePrice = rowsData[i].salePrice ? rowsData[i].salePrice : 0;
                        rowsData[i].tax = accMul(accSub(accMul(rowsData[i].salePrice,rowsData[i].qty),accMul(rowsData[i].qty,accMul(rowsData[i].salePrice,accDiv(rowsData[i].discountRate,100)))),accDiv(rowsData[i].taxRate,100));
                        rowsData[i].totalLevied = accMul(accSub(accMul(rowsData[i].salePrice,rowsData[i].qty),accMul(rowsData[i].qty,accMul(rowsData[i].salePrice,accDiv(rowsData[i].discountRate,100)))),accAdd(1,accDiv(rowsData[i].taxRate,100)));
                        dg.datagrid('refreshRow', i);
                    }
                    dg.datagrid('statistics', ["qty","discountPrise","totalPrice","tax","totalLevied"]);

                }
                discountData();
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
    $('#cateTree').tree({
        lines:true,
        animate:true,
        url:genAPI('settings/categoryList'),
        queryParams: {
            typeNum: 3
        },
        formatter:function(node){
            return node.name;
        },
        loadFilter: function(res){
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        onClick : function(node) {
            $("#goods").datagrid('load',{
                query: query,
                zero: zero,
                categoryId:node.id,
                storageId:storageId
            })
        }
    });
//获取仓库
    $("#storage").combobox({
        url:genAPI('settings/storageList'),
        valueField: 'id',
        textField: 'name',
        cache: false,
        editable: false,
        panelHeight:'200',
        loadFilter:function (res) {
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        onSelect:function (record) {
            storageId = record.id;
        },
        onClick:function (node) {
            $("#goods").datagrid('load',{
                query: query,
                zero: zero,
                categoryId:categoryId,
                storageId:node.id
            })
        }
    });
//销售退货录入表格
    var goodsid;
    var storageId;
    $("#saleRList").datagrid({
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
                                        var opt = $("#saleRList").datagrid("options");
                                        $("#saleRList").datagrid('updateRow', {
                                            index: opt.editIndex,
                                            row: res.data
                                        });

                                        $("#saleRList").datagrid("editCell",{
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
                                    var dg = $('#saleRList');
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
                            });
                            queryGoods(query,zero,categoryId,storageId);
                        }
                    }
                }
            },
            {
                field:'storageId',
                hidden:true
            },
            {   field:'storageName',
                title:'仓库 &nbsp' +
                '<button class="btn btn-default btn-xs" type="button" onclick="bathStorage()">批量</button>',
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
                            /*storageName = record.name;
                            storageId = record.id;*/
                            var rows = $("#saleRList").datagrid('getData').rows;
                            var index = $("#saleRList").datagrid('options').editIndex;
                            if (rows.length > 0) {
                                rows[index].storageId = record.id
                            }
                        },
                        onClickButton:function () {
                            var rowData = $("#saleRList").datagrid("getSelected");
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
                                    var dg = $('#saleRList');
                                    var opt = dg.datagrid('options');
                                    var stor = $("#goodsInventoryList").datagrid("getSelected");
                                    $("#saleRList").datagrid("updateRow",{
                                        index: opt.editIndex,
                                        row: {
                                            storageName : stor.storageName,
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
                            var opts = $("#saleRList").datagrid('options');
                            var rows = $('#saleRList').datagrid('getRows');
                            var rowsData = rows[opts.editIndex];
                            console.info(rowsData);
                            param.id = rowsData.unit || 0;
                        }

                    }

                }
            },
            { field:'srcQty',
                title: "可退数量",
                width:150,
                hidden:false
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
                field:"salePrice",
                title:"单价",
                width:150,
                hidden:false
            },
            {
                field:"taxPrice",
                title:"含税单价",//单价*（1+税率）
                width:150,
                hidden:false,
                formatter:function (value,record,index) {
                    if(record.isFooter){
                        return value;
                    }
                    try {
                        var taxPrice = record.salePrice.mul(accAdd(1,accDiv(record.taxRate,100)))
                        record.taxPrice = taxPrice;
                        $("#saleRList").datagrid("updateRow",{index: index, row: record});
                        return taxPrice;
                    } catch (e) {
                        return value;
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
            },
            {
                field:"discountPrise",
                title:"折扣额",//单价*折扣率*数量
                width:150,
                hidden:false,
                formatter:function (value,record,index) {
                    if(record.isFooter){
                        return value;
                    }
                    try {
                        var discountPrise = intToFloat(accMul(record.qty,accMul(record.salePrice,accDiv(record.discountRate,100))));
                        return discountPrise;
                    } catch (e) {
                        return value;
                    }
                }
            },
            {
                field:"totalPrice",
                title:"金额",//单价*数量-（单价*折扣率*数量）
                width:150,
                hidden:false,
                formatter:function (value,record,index) {
                    if(record.isFooter){
                        return value;
                    }
                    try {
                        return intToFloat(accSub(accMul(record.salePrice,record.qty),accMul(record.qty,accMul(record.salePrice,accDiv(record.discountRate,100)))));
                    } catch (e) {
                        return value;
                    }
                }
            },
            {
                field:"taxRate",
                title:"税率",
                width:150,
                hidden:false
            },
            {
                field:"tax",
                title:"税额",//[单价*数量-(单价*折扣率*数量)]*税率
                width:150,
                hidden:false,
                formatter:function (value,record,index) {
                    if(record.isFooter){
                        return value;
                    }
                    try {
                        return intToFloat(accMul(accSub(accMul(record.salePrice,record.qty),accMul(record.qty,accMul(record.salePrice,accDiv(record.discountRate,100)))),accDiv(record.taxRate,100)));
                    } catch (e) {
                        return value;
                    }
                }
            },
            {
                field:"totalLevied",
                title:"价税合计",//[单价*数量-(单价*折扣率*数量)]*(1+税率)
                width:150,
                hidden:false,
                formatter:function (value,record,index) {
                    if(record.isFooter){
                        return value;
                    }
                    try {
                        return intToFloat(accMul(accSub(accMul(record.salePrice,record.qty),accMul(record.qty,accMul(record.salePrice,accDiv(record.discountRate,100)))),accAdd(1,accDiv(record.taxRate,100))));
                    } catch (e) {
                        return value;
                    }

                }
            },
            { field:'srcBillId',
                title: "原购货单号id",
                hidden:true
            },
            { field:'srcBillNum',
                title: "原购货单号",
                width:150,
                hidden:false
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
            var row = $('#saleRList').datagrid('getRows')[nextIndex];

            if(!row) {
                $('#saleRList').datagrid('append', {});
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
                    salePrice:'',
                    taxPrice:'',
                    discountRate:'',
                    discountPrise:'',
                    totalPrice:'',
                    taxRate:tax,
                    tax:'',
                    totalLevied:'',
                    note:''
                };
                $('#saleRList').datagrid('append', row);
            }
        },'-',{
            text:'删除',
            iconCls:'fa fa-remove fa-lg',
            handler:function () {
                var t =$(this);
                console.info(t);
                var row = $("#saleRList").datagrid('getSelections');
                if(!row){
                    layer.msg('请选中一行进行操作！')
                }
                if(row.length>0) {
                    var index = layer.confirm('你确定要删除所选记录吗？', {
                        skin: 'layui-layer-molv',
                        btn: ['确定', '取消'] //按钮
                    }, function (target) {
                        if (target) {
                            $('#saleRList').datagrid('removeit');
                            var dg = $('#saleRList');
                            var opt = dg.datagrid('options');
                            dg.datagrid('refreshRow', opt.editIndex);
                            totalMoney();
                            discountData();
                            layer.close(index);
                        }
                    }, function (index) {
                        layer.close(index)
                    });
                }
            }
        }],
        onAfterEdit:function (rowIndex, rowData, changes) {
            if(changes["discountRate"]|| changes["qty"]){
                totalMoney();
                discountData();
            }
        }
    }).datagrid('enableCellEditing').datagrid('reloadFooter',
        [{
            "name":"合计：",
            "qty":0,
            "discountPrise":0,
            "totalPrice":0,
            "tax":0,
            "totalLevied":0,
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
//更改优惠率联动优惠后金额
    $('input[name="discountRate"]').on('input propertychange', function() {
        discountData();
    });
//计算本次欠款
    $("#payment").on('input propertychange', function() {
        $("#arrears").val(accSub($("#amount").val() || 0,$("#payment").val() || 0))
    });
//回显需要修改的商品
    if($.cookie('id')){
        $.ajax({
            type: "post",
            url: genAPI('invSa/getInvSaInfo'),
            cache: false,
            dataType: "json",
            data: {
                id:$.cookie('id')
            },
            success: function (res) {
                if(res.code==200){
                    console.info(res);
                    if(res.data){
                        $("#salerId").val(res.data.id);
                        $("#status").val(res.data.status);
                        $("#vendorClass").val(res.data.vendorName);
                        $("#vendorClass").attr("vid",res.data.customer);
                        $("#number").html(res.data.number);
                        $("#initDate").datebox("setValue",res.data.saleDate);
                        $("#saleRList").datagrid({data:res.data.detail});
                        $("#discountRate").val(res.data.discountRate);
                        $("#disAmount").val(res.data.disAmount);
                        $("#payment").val(res.data.income);
                        $("#totalAmount").val(res.data.totalAmount);
                        $("#amount").val(res.data.amount);
                        $("#note").val(res.data.note);
                        totalMoney();
                        // discountData();
                        if(res.data.status=="2"){
                            $("#mark").addClass("has-audit");
                            $("#audit").hide();
                            $("#reAudit,#returnPur").show();
                            $("#discountRate,#deduction,#payment,#arrears,#account").attr("readOnly",true);
                            $("#saleRList").datagrid("removeEditor",['name','storageName','unit','qty','discountRate','note'])
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
//操作日志
    $("#purLog").on("click",function () {
        $.ajax({
            type:'post',
            url:genAPI('query/queryInvOpeLog'),
            data:{
                invId:$("#salerId").val(),
                vType:'4'
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
                    if(res.data.length>0){
                        layer.tips(str,
                            '#dd', {
                                tips: [1, '#3595CC'],
                                time: 3000
                            });
                    }else{
                        layer.tips("暂无操作日志",'#dd', {
                            tips: [1, '#3595CC'],
                            time: 3000
                        });
                    }
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
                title:'税率(%)',
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
//优惠后的金额与本次付款
function discountData() {
    var footerData = $("#saleRList").datagrid("getFooterRows");
    //console.info(footerData);
    //var paymentData = $("#payment").val() || 0;
    var discountRateData =accDiv($("#discountRate").val() || 0,100) ;
    //销货金额
    $("#totalAmount").val(intToFloat(footerData[0].totalLevied));
    //付款优惠
    $("#disAmount").val(intToFloat(accMul(footerData[0].totalLevied,discountRateData)));
    //优惠后的金额
    $("#amount").val(intToFloat(accSub(footerData[0].totalLevied,accMul(footerData[0].totalLevied,discountRateData))));
    //本次付款
    $("#payment").val(intToFloat(accSub(footerData[0].totalLevied,accMul(footerData[0].totalLevied,discountRateData))));
    //本次欠款
    $("#arrears").val(intToFloat(accSub(accSub(footerData[0].totalLevied,accMul(footerData[0].totalLevied,discountRateData)),$("#payment").val() || 0)));

}
//合计
function totalMoney() {
    var dg = $('#saleRList');
    var rowsData = dg.datagrid('getRows');
    for(var i=0;i<rowsData.length;i++){
        if(!rowsData[i].goodsId){
            rowsData[i].goodsId = rowsData[i].id;
            rowsData[i].id = null;
        }
        rowsData[i].discountRate = rowsData[i].discountRate ? rowsData[i].discountRate : 0;
        rowsData[i].purPrice = rowsData[i].purPrice ? rowsData[i].purPrice : 0;
        rowsData[i].taxRate = rowsData[i].taxRate ? rowsData[i].taxRate : 0;
        rowsData[i].qty = rowsData[i].qty ? rowsData[i].qty : 0;
        rowsData[i].discountPrise = intToFloat(accMul(rowsData[i].qty,accMul(rowsData[i].purPrice,accDiv(rowsData[i].discountRate,100))));
        rowsData[i].totalPrice = intToFloat(accSub(accMul(rowsData[i].purPrice,rowsData[i].qty),accMul(rowsData[i].qty,accMul(rowsData[i].purPrice,accDiv(rowsData[i].discountRate,100)))));
        rowsData[i].tax = intToFloat(accMul(accSub(accMul(rowsData[i].purPrice,rowsData[i].qty),accMul(rowsData[i].qty,accMul(rowsData[i].purPrice,accDiv(rowsData[i].discountRate,100)))),accDiv(rowsData[i].taxRate,100)));
        rowsData[i].totalLevied = intToFloat(accMul(accSub(accMul(rowsData[i].purPrice,rowsData[i].qty),accMul(rowsData[i].qty,accMul(rowsData[i].purPrice,accDiv(rowsData[i].discountRate,100)))),accAdd(1,accDiv(rowsData[i].taxRate,100))));
        dg.datagrid('refreshRow', i);
    }

    dg.datagrid('statistics', ["qty","discountPrise","totalPrice","tax","totalLevied"]);
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
    var dg = $("#saleRList");
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
                                        var dg = $("#saleRList");
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
    $("#saleRList").datagrid('removeEditor',['name','storageName','unit','qty','discountRate']);
    $("#saleRList").datagrid('addEditor',[
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
                                    var opt = $("#saleRList").datagrid("options");
                                    $("#saleRList").datagrid('updateRow', {
                                        index: opt.editIndex,
                                        row: res.data
                                    });

                                    $("#saleRList").datagrid("editCell",{
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
                                var dg = $('#saleRList');
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
                        var opts = $("#saleRList").datagrid('options');
                        var rows = $('#saleRList').datagrid('getRows');
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
            title:"折扣率(%)",
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
            $("#saleRList").datagrid("removeEditor","name");
        }else{
            start();
        }

    }else{
        console.log("没选中");
        if($("#status").val() == "2"){
            $("#saleRList").datagrid("removeEditor",['name','storageName','unit','qty','discountRate','note'])
        }else{
            end();
        }

    }
    var opts = $("#saleRList").datagrid('options');
    //console.info(opts);
    $("#saleRList").datagrid('cancelEdit',opts.editIndex);
}
//批量仓库
function bathStorage() {
    if($('.dropdownBg').is(':hidden')){
        $(".dropdownBg").show();
        var row = $("#saleRList").datagrid("getRows");
        $('.dropdownBg').find('li').click(function () {
            var storageName = $(this).text();
            var storageid = $(this).find("a").attr("storgeid");
            for(var i=0;i<row.length;i++){
                $("#saleRList").datagrid("updateRow",{
                    index: i,
                    row: {
                        storageName : storageName,
                        storageId : storageid
                    }
                })
            }
            $('.dropdownBg').hide();
        });
    }else{//否则
        $('.dropdownBg').hide();
    }
}
//保存
function saveRsale() {
    $("#saleRList").datagrid('endEditing');
    var dg = $("#saleRList");
    var detail = dg.datagrid('getRows');
    var saleDate = $('#initDate').datebox('getValue');
    var customer = $("#vendorClass").attr("vid");
    if(detail.length == 0){
        layer.msg("请选择商品！");
        return false;
    }else {
        var a = true;
        for(var i=0;i<detail.length;i++){
            if(detail[i].goodsId && detail[i].storageId == ""){
                layer.msg("请选择仓库！");
                a = false;
                break;
            } else if (!detail[i].goodsId){
                //detail.splice(i,1)
                dg.datagrid("deleteRow", i);
            }
        }
        if(!a){return false}
        detail = dg.datagrid('getRows');
    }
    if(!customer){
        layer.msg("请选择客户！");
        return false;
    }
    var data = {
        id:$("#salerId").val() ? $("#salerId").val() : 0,
        transType:'4',
        number:$("#number").html(),
        customer:customer,
        saleDate:saleDate,
        discountRate:$("#discountRate").val(),
        disAmount:$("#disAmount").val(),
        income:$("#payment").val(),
        totalAmount:$("#totalAmount").val(),
        amount:$("#amount").val(),
        note:$("#note").val(),
        detail:detail
    };
    $.ajax({
        type:"POST",
        url:genAPI($("#salerId").val()!=0 ? '/invSa/modifyInvSa': '/invSa/createInvSa'),
        async:true,
        contentType:"application/json",
        data:JSON.stringify(data),
        success:function(res){
            if(res.code=='200'){
                layer.msg("保存成功！");
                $("#salerId").val(res.data.id)
            }else{
                layer.msg(res.message)
            }
        }
    });
}
//保存并新增
function addRsale() {
    var tabTitle = '销售退货单';
    var dg="#tabs";
    var url = "webapp/sales/saleReturn.html";
    addTopTab(dg,tabTitle,url)
}
//审核
function auditRsale() {
    $("#saleRList").datagrid('endEditing');
    var dg = $("#saleRList");
    var detail = dg.datagrid('getRows');
    var saleDate = $('#initDate').datebox('getValue');
    var customer = $("#vendorClass").attr("vid");
    if(detail.length == 0){
        layer.msg("请选择商品！");
        return false;
    }else {
        var a = true;
        for(var i=0;i<detail.length;i++){
            if(detail[i].goodsId && detail[i].storageId == ""){
                layer.msg("请选择仓库！");
                a = false;
                break;
            } else if (!detail[i].goodsId){
                //detail.splice(i,1)
                dg.datagrid("deleteRow", i);
            }
        }
        if(!a){return false}
        detail = dg.datagrid('getRows');
    }
    if(!customer){
        layer.msg("请选择客户！");
        return false;
    }
    var data = {
        id:$("#salerId").val() ? $("#salerId").val() : 0,
        transType:'4',
        number:$("#number").html(),
        customer:customer,
        saleDate:saleDate,
        discountRate:$("#discountRate").val(),
        disAmount:$("#disAmount").val(),
        income:$("#payment").val(),
        totalAmount:$("#totalAmount").val(),
        amount:$("#amount").val(),
        note:$("#note").val(),
        detail:detail
    };
    $.ajax({
        type:"POST",
        url:genAPI('/invSa/checkInvSa'),
        async:true,
        contentType:"application/json",
        data:JSON.stringify(data),
        success:function (res) {
            if(res.code==200){
                $("#mark").addClass("has-audit");
                $("#audit").hide();
                $("#reAudit,#returnPur").show();
                $("#saleRList").datagrid("removeEditor",['name','storageName','unit','qty','discountRate','note'])
            }else{
                layer.msg(res.message);
            }
        }
    })
}
//反审核
function reAuditRsale() {
    $.ajax({
        type:"POST",
        url:genAPI('/invSa/rsbatchCheckInvSa'),
        data:{
            ids:$("#salerId").val()
        },
        cache: false,
        dataType: "json",
        success:function (res) {
            if(res.code==200){
                layer.msg("反审核成功！");
                $("#mark").removeClass("has-audit");
                $("#audit").show();
                $("#discountRate,#deduction,#payment,#arrears,#account").attr("readOnly",false);
                $("#reAudit,#returnPur").hide();
                end();
            }else {
                layer.msg(res.message);
            }
        }
    })
}
//复制
function copyRsale() {

}
//历史单据
function historyReceipts() {
    var tabTitle = '销售退货单记录';
    var dg="#tabs";
    var url = "webapp/sales/saleRetHistory.html";
    addTopTab(dg,tabTitle,url)

}








