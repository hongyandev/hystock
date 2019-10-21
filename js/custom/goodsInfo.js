
$(function () {
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }

    });

//回显商品详情
     if($.cookie('id')){
                $.ajax({
                    type:"post",
                    url:genAPI('goods/getGoodsInfo'),
                    cache:false,
                    dataType:"json",
                    data:{
                        id:$.cookie('id')
                    },
                    success:function (res) {
                        if(res.code==200){
                            console.info(res);
                            var data = res.data;
                            $("#id").val(data.goods.id);
                            $("#code").val(data.goods.code);
                            $("#cpdm").val(data.goods.cpdm);
                            $("#name").val(data.goods.name);
                            $("#barCode").val(data.goods.barCode);
                            $("#specs").val(data.goods.specs);
                            $('#category').combotree('setValue',data.goods.category);
                            $("#storage").combobox('setValue',data.goods.storage);
                            $("#unitSingle").combobox('setValue',data.goods.unit);
                            if(data.goods.isUnitGroup == '1'){
                                // $("#moreUnitBtn").click();
                                $("#moreUnitBtn").attr("checked","");
                                $(".unitGroupBox").show();
                                $("#unitGroup").combobox('setValue',data.goods.unit);
                                $(".unitSingle").hide();
                            }else{
                                $("#moreUnitBtn").removeAttr("checked");
                                $(".unitGroupBox").hide();
                                $('#unitSingle').combobox('setValue',data.goods.unit);
                                $(".unitSingle").show();
                            }
                            if(data.goods.inventoryWarn == '1'){
                                //$(".kcyj").click();
                                $(".kcyj").find("input").attr("checked",'');
                                $(".kcyjCon").show();
                            }else{
                                $(".kcyj").find("input").removeAttr("checked");
                                $(".kcyjCon").hide();
                            }
                            if(data.goods.storageWarn == '1'){
                                $("#warning").find("input").attr("checked","");
                                $('.divEditTabKc').show();
                                $("#editTabKc").datagrid("resize");
                                $(".inputKc").css('display','none');
                            }else{
                                $("#warning").find("input").removeAttr("checked");
                                $('.divEditTabKc').hide();
                                $(".inputKc").css('display','block');
                            }
                            $("#firstSaleUnit").val(data.goods.firstSaleUnit);
                            $("#firstPurUnit").val(data.goods.firstPurUnit);
                            $("#minInventory").val(data.goods.minInventory);
                            $("#maxInventory").val(data.goods.maxInventory);
                            $("#note").val(data.goods.note);
                            $('#editTabGoodsPrice').datagrid('reload',{goodsId:$("#id").val(), unit:$("#unitGroup").val()});
                            $('#editTabPrice').datagrid('reload',{goodsId:$("#id").val()});
                            $('#editTabKc').datagrid('reload',{goodsId:$("#id").val()});
                            $('#goodsInventory').datagrid('reload',{goodsId:$("#id").val()});
                            if(data.earlyStage.rows.length>0){
                                $(".earlyStage").find("input").prop("checked",true);
                                $('#divEditTab').show();
                                $('#goodsInventory').datagrid('resize');
                            }else{
                                $(".earlyStage").find("input").prop("checked",false);
                                $('#divEditTab').hide();
                            }
                            $.cookie('id',null);
                        }else{
                            layer.msg(res.message)
                        }
                    },error:function (res) {
                        layer.msg(res.message)
                    }
                });
            }

//获取仓库
    $("#storage").combobox({
        url:genAPI('settings/storageList'),
        valueField: 'id',
        textField: 'name',
        cache: false,
        editable: false,
        panelHeight:'200',
        loadFilter:function (data) {
            if(data.code == 200) {
                return data.data
            } else {
                layer.msg(data.message);
                return [];
            }
        },
        onSelect:function (record) {

        }
    });
//商品类别
    $("#category").combotree({
        url:genAPI('settings/categoryList'),
        valueField: 'id',
        textField: 'name',
        cache: false,
        editable: false,
        panelHeight:'200',
        queryParams:{
            typeNum:3
        },
        loadFilter:function (data) {
            if(data.code == 200) {
                return data.data
            } else {
                layer.msg(data.message);
                return [];
            }
        },
        formatter:function(node){
            return node.name;
        },
        onSelect:function (record) {

        }
    });
//单计量单位和多计量单位的切换
    $("#moreUnitBtn").on("click",function () {
        if($(this).attr("checked")){
            $("#moreUnitBtn").attr("checked","");
            $(".unitSingle").hide();
            $(this).parent().siblings().show();
            $(".sck,.srk").show();
        }else{
            $("#moreUnitBtn").removeAttr("checked");
            $(".unitSingle").show();
            $(this).parent().siblings().hide();
            $(".sck,.srk").hide();
        }
    });
//单计量单位渲染
    $("#unitSingle").combobox({
        url:genAPI('settings/unitList'),
        valueField: 'id',
        textField: 'unitName',
        cache: false,
        editable: false,
        panelHeight:'200',
        queryParams:{
            isGroup:0
        },
        loadFilter:function (data) {
            if(data.code == 200) {
                return data.data
            } else {
                layer.msg(data.message);
                return [];
            }
        },
        formatter: function(row){
            var opts = $(this).combobox('options');
                return row[opts.textField]
        },
        onSelect:function (record) {
            console.info(record);
            $("#editTabGoodsPrice").datagrid('load',{
                goodsId:$("#id").val() || 0,
                unit:record.id
            })

        }

    });
//多计量单位渲染
    $("#unitGroup").combobox({
        url:genAPI('settings/unitList'),
        valueField: 'id',
        textField: 'unitNames',
        cache: false,
        editable: false,
        panelHeight:'200',
        queryParams:{
            isGroup:1,
            isCombo:1
        },
        loadFilter:function (data) {
            if(data.code == 200) {
                return data.data
            } else {
                layer.msg(data.message);
                return [];
            }
        },
        formatter: function(row){
            var opts = $(this).combobox('options');
            return row[opts.textField]
        },
        onSelect:function (record) {
            console.info(record);
            var deputyUnitId = (record.id+":"+record.deputyUnitId).split(":");
            var deputyUnitName = (record.unitName + ":" + record.deputyUnitName).split(":");
            //console.info(deputyUnitId);
            //console.info(deputyUnitName);
            var firstSaleUnitdata=[];
            for(var i=0;i<deputyUnitName.length;i++){
                var deputyUnit={};
                deputyUnit["unitName"]=deputyUnitName[i];
                deputyUnit['id']=deputyUnitId[i];
                firstSaleUnitdata.push(deputyUnit);
            }
           // console.info(firstSaleUnitdata);
            $("#firstSaleUnit").combobox('loadData',firstSaleUnitdata);
            $("#firstPurUnit").combobox('loadData',firstSaleUnitdata);
            $("#editTabGoodsPrice").datagrid('load',{
                goodsId:$("#id").val() || 0,
                unit:record.id
            })

        }
    });
    $("#firstSaleUnit").combobox({
        valueField: 'id',
        textField: 'unitName',
        cache: false,
        editable: false,
        panelHeight:'200',
        formatter: function(row){
            var opts = $(this).combobox('options');
            return row[opts.textField]
        }
    });
    $("#firstPurUnit").combobox({
        valueField: 'id',
        textField: 'unitName',
        cache: false,
        editable: false,
        panelHeight:'200',
        formatter: function(row){
            var opts = $(this).combobox('options');
            return row[opts.textField]
        }
    });

//计量单位table
    $('#editTabGoodsPrice').datagrid({
        method:'post',
        url:genAPI('goods/getGoodsPriceList'),
        idField:'id',
        striped:true,
        nowrap:true,
        queryParams:{
            goodsId:$("#id").val() || 0,
            unit:$("#unitGroup").val() || 0
        },
        loadFilter: function(data){
            if(data.code == 200) {
                return data.data
            } else {
                layer.msg(data.message);
                return [];
            }
        },
         rownumbers : true,
         singleSelect : true,
         fit:true,
         columns:[[
             {
                 field:'lb',
                 title:'',
                 width:100,
                 hidden:false
             },
             { field:'unitId',
                 title:'计量单位',
                 width : 100,
                 hidden:true
             },
             { field:'unitName',
                 title:'计量单位',
                 width : 100,
                 hidden:false
             },
             { field:'salePrice',
                 title:'零售价',
                 width : 100,
                 hidden:false,
                 editor : {
                     type : "validatebox"
                 }
             },
             { field:'wholesalePrice',
                 title:'批发价',
                 width : 100,
                 hidden:false,
                 editor : {
                     type : "validatebox"
                 }
             },
             { field:'purPrice',
                 title:'采购价',
                 width : 100,
                 hidden:false,
                 editor : {
                     type : "validatebox"
                 }
             }
         ]],
         lastFieldFun: function (dg, index, field) {
             console.info(index, field);
             var row = $('#editTabKc').datagrid('getRows')[index+1];
             if(!row) {
                 $('#editTabKc').datagrid('append', {});
                 //$("#editTab").datagrid('endEditing');
             }
             if (dg.datagrid('endEditing')) {
                 dg.datagrid('selectRow', index+1).datagrid('editCell', {
                     index: index+1,
                     field: 'salePrice'
                 });
             }
         }
 }).datagrid('enableCellEditing');
//价格策略
    $("#editTabPrice").datagrid({
         url : genAPI('goods/getGoodsDiscountList'),
         method:'post',
         idField:'id',
         striped:true,
         nowrap:true,
         rownumbers : true,
         singleSelect : true,
         fit:true,
         queryParams:{
             goodsId:$("#id").val() || 0
         },
         loadFilter: function(data){
             if(data.code == 200) {
                 return data.data
             } else {
                 layer.msg(data.message);
                 return [];
             }
         },
         columns:[[
             { field:'levelName',
                 title:'客户等级',
                 width : 100,
                 hidden:false
             },
             { field:'discountRate',
                 title:'折扣(%)',
                 width : 200,
                 hidden:false,
                 editor : {
                     type : "validatebox"
                 }
             }
         ]],
         lastFieldFun: function (dg, index, field) {
             console.info(index, field);
             var row = $('#editTabPrice').datagrid('getRows')[index+1];
             if(!row) {
                 //$('#editTabKc').datagrid('append', {});
                 $("#editTabPrice").datagrid('endEditing');
             }
             if (dg.datagrid('endEditing')) {
                 dg.datagrid('selectRow', index+1).datagrid('editCell', {
                     index: index+1,
                     field: 'discountRate'
                 });
             }
         }
     }).datagrid('enableCellEditing');
//库存预警editTabKc
    $(".kcyj").on("click",function () {
        if($(".kcyj").find("input").prop("checked") == true){
            $(".kcyjCon").show();
        }else{
            $(".kcyjCon").hide();
        }

    });
    $("#warning").on("click",function () {
        if($(this).find("input").prop("checked") == true){
            $('.divEditTabKc').show();
            $("#editTabKc").datagrid("resize");
            $(".inputKc").css('display','none');
        }else{
            $('.divEditTabKc').hide();
            $(".inputKc").css('display','block');
        }
    });
    //最低库存与最高库存值得验证
    $("#minInventory").on("blur",function(){
        if(  parseFloat($("#maxInventory").val()) < parseFloat($("#minInventory").val())){
            layer.msg("最低库存不能大于最高库存！");
            return  $(this).val("");
        }else if(parseFloat($("#minInventory").val()) == '0'){
            layer.msg("最小库存已经设为空！");
        }else if(parseFloat($("#minInventory").val()) < 0){
            layer.msg("最小库存设置无效！");
            return  $(this).val("");
        }
    });
    $("#maxInventory").on("blur",function(){
        if( parseFloat($("#maxInventory").val()) < parseFloat($("#minInventory").val())){
            layer.msg("最高库存不能小于最低库存！");
            return  $(this).val("");
        }else if(parseFloat($("#maxInventory").val()) == '0'){
            layer.msg("最小库存已经设为空！");
        }else if(parseFloat($("#maxInventory").val()) < 0){
            layer.msg("最小库存设置无效！");
            return  $(this).val("");
        }
    });

    $("#editTabKc").datagrid({
        url : genAPI('goods/getGoodsStoWarnList'),
        method:'post',
        striped:true,
        idField:'id',
        nowrap:true,
        rownumbers : true,
        singleSelect : true,
        queryParams:{
            goodsId:$("#id").val() || 0
        },
        loadFilter: function(data){
            if(data.code == 200) {
                return data.data
            } else {
                layer.msg(data.message);
                return [];
            }
        },
        columns:[[
            { field:'storageName',
                title:'仓库名',
                width : 100,
                hidden:false,
                editor:{
                    type:"validatebox",
                }
            },
            { field:'minInventory',
                title:'最小库存<button class="btn btn-default btn-xs" type="button" onclick="bathMin()">批量</button>',
                width : 200,
                hidden:false,
                editor : {
                    type : "validatebox"
                }
            },
            { field:'maxInventory',
                title:'最大库存<button class="btn btn-default btn-xs" type="button" onclick="bathMax()">批量</button>',
                width : 200,
                hidden:false,
                editor : {
                    type : "validatebox"
                }
            }
        ]],
        lastFieldFun: function (dg, index, field) {
            console.info(index, field);
            var row = $('#editTabKc').datagrid('getRows')[index+1];
            if(!row) {
                $("#editTabKc").datagrid('endEditing');
            }
            if (dg.datagrid('endEditing')) {
                dg.datagrid('selectRow', index+1).datagrid('editCell', {
                    index: index+1,
                    field: 'minInventory'
                });
            }
        }
    }).datagrid('enableCellEditing');
// 期初设置

     $('.earlyStage').on("click",function () {
         if($(this).find("input").prop("checked") == true){
             $('#divEditTab').show();
             $('#goodsInventory').datagrid('resize');
         }else{
             $('#divEditTab').hide();
         }

     });
    //
    var storageId;
    var storageName;
    $('#goodsInventory').datagrid({
        url:genAPI('goods/getGoodsEarlyStageInventoryList'),
        method:'post',
        rownumbers : true,
        singleSelect:true,
        idField:'id',
        fit:true,
        pagination:false,
        queryParams:{
            goodsId:$("#id").val() || 0
        },
        loadFilter: function(data){
            if(data.code == 200) {
                return data.data
            } else {
                layer.msg(data.message);
                return [];
            }
        },
        showFooter:true,
        columns:[[
            { field:'storageId',
                title:'仓库号',
                width : 100,
                hidden:false,
                formatter:function(value , record , index){
                    return record.storageId = storageId
                }
            },
            { field:'storageName',
                title:'仓库号',
                width : 100,
                hidden:false,
                formatter:function(value , record , index){

                    return record.storageCode = storageName
                },
                editor : {
                    type : "combobox",
                    options:{
                        url:genAPI('settings/storageList'),
                        valueField: 'id',
                        textField: 'name',
                        cache: false,
                        editable: false,
                        panelHeight:'200',
                        loadFilter:function (data) {
                            if(data.code == 200) {
                                return data.data
                            } else {
                                layer.msg(data.message);
                                return [];
                            }
                        },
                        onSelect:function (record) {
                            console.info(record);
                            storageId = record.id;
                            storageName = record.name
                        }
                    }
                }
            },
            { field:'quantity',
                title:'库存数',
                width : 200,
                hidden:false,
                editor : {
                    type : "validatebox"
                }
            },
            { field:'unitCost',
                title:'单位成本',
                width : 200,
                hidden:false,
                editor : {
                    type : "validatebox"
                }
            },
            { field:'total',
                title:'期初总价',
                width : 200,
                hidden:false
            }

        ]],
        lastFieldFun: function (dg, index, field) {
            //console.info(index, field);
            var row = $('#goodsInventory').datagrid('getRows')[index+1];
            if(!row) {
                $('#goodsInventory').datagrid('append', {});
            }
            if (dg.datagrid('endEditing')) {
                dg.datagrid('selectRow', index+1).datagrid('editCell', {
                    index: index+1,
                    field: 'storageCode'
                });
            }
        },
        toolbar:[{
            text:'新增',
            id:'addEdit',
            iconCls:'fa fa-plus fa-flg',
            handler:function () {
                var row = {
                    storageCode:'',
                    quantity:'',
                    unitCost:'',
                    totalPrice:''
                };
                $('#goodsInventory').datagrid('append', row);

                var editIndex = $("#goodsInventory").datagrid('getRows').length-1;

                if($('#goodsInventory').datagrid('endEditing')){
                    $('#goodsInventory').datagrid('selectRow', editIndex).datagrid('editCell', {
                        index: editIndex,
                        field: 'storageCode'
                    });
                }

            }
        },'-', {
            text: '删除',
            id:'removeEdit',
            iconCls: 'fa fa-remove fa-lg',
            handler: function () {
                var row = $("#goodsInventory").datagrid('getSelections');
                if(!row){
                    layer.msg('请选中一行进行操作！');
                }
                if(row.length>0) {
                    var index = layer.confirm('你确定要删除所选记录吗？', {
                        skin: 'layui-layer-molv',
                        btn: ['确定', '取消'] //按钮
                    }, function (target) {
                        if (target) {
                            $('#goodsInventory').datagrid('removeit');
                            layer.close(index);
                        }
                    }, function (index) {
                        layer.close(index)
                    });
                }
            }
        }],
        onBeforeEdit: function (rowIndex, rowData) {
            $('#goodsInventory').datagrid('getColumnOption',rowIndex);
        },
        onLoadSuccess: function (data) {
           // $('#editTab1').datagrid('statistics',"quantity");
        },
        onAfterEdit:function (rowIndex, rowData, changes) {
            if(changes["quantity"] || changes["unitCost"]){
                var dg = $('#goodsInventory');
                var total = accMul(rowData["quantity"]||0, rowData["unitCost"]||0);
                rowData["total"] = Number(String(total).replace(/^(.*\..{4}).*$/,"$1"));
                dg.datagrid("refreshRow", rowIndex);
                dg.datagrid('statistics', ["quantity","total"]);
            }
        }
    }).datagrid('enableCellEditing');
});
//保存
function saveAddGoods() {
    //var actionType=$("#action_type").val();
   //var actionType = parent.$("#action_type").val();
    //var actionType = parent.action_type;
    var actionType = getRequest().at;
   console.info(actionType);
    return;
    $("#editTabGoodsPrice,#editTabPrice,#editTabKc,#goodsInventory").datagrid('endEditing');
    if($("#code").val()==""){
        layer.msg("请填写商品编码！");
        return false;
    }
    if($("#name").val()==""){
        layer.msg("请填写商品名称！");
        return false;
    }
    var goodsPrice = $('#editTabGoodsPrice').datagrid('getRows');
    var goodsDiscount = $("#editTabPrice").datagrid('getRows');
    var goodsStoWarn = $("#editTabKc").datagrid('getRows');
    var goodsInventory = $("#goodsInventory").datagrid('getRows');
    var url="";
    var data={};
    if(actionType == "add"){
        url=genAPI('goods/addGoods');
        data={
            code:$("#code").val(),
            cpdm:$("#cpdm").val(),
            name:$("#name").val(),
            barCode:$("#barCode").val(),
            specs:$("#specs").val(),
            category:$('#category').val(),
            storage:$("#storage").val(),
            unit: $("#moreUnitBtn").prop('checked')==true ? $("#unitGroup").val() : $('#unitSingle').val(),
            isUnitGroup:$("#moreUnitBtn").prop('checked')==true ? "1" : "0",
            firstSaleUnit:$("#firstSaleUnit").val(),
            firstPurUnit:$("#firstPurUnit").val(),
            inventoryWarn:$(".kcyj").find("input").prop('checked')==true ? "1" : "0",
            minInventory:$("#minInventory").val(),
            maxInventory:$("#maxInventory").val(),
            storageWarn:$("#warning").find("input").prop('checked')==true ? "1" : "0",
            note:$("#note").val(),
            goodsPrice:goodsPrice,
            goodsDiscount:goodsDiscount,
            goodsStoWarn:$(".kcyj").find("input").prop('checked')==true ? goodsStoWarn : [],
            goodsInventory:goodsInventory
        };
    }else{

        url=genAPI('goods/editGoods');
        data={
            id:$("#id").val(),
            code:$("#code").val(),
            cpdm:$("#cpdm").val(),
            name:$("#name").val(),
            barCode:$("#barCode").val(),
            specs:$("#specs").val(),
            category:$('#category').val(),
            storage:$("#storage").val(),
            unit: $("#moreUnitBtn").prop('checked')==true ? $("#unitGroup").val() : $('#unitSingle').val(),
            isUnitGroup:$("#moreUnitBtn").prop('checked')==true ? "1" : "0",
            firstSaleUnit:$("#firstSaleUnit").val(),
            firstPurUnit:$("#firstPurUnit").val(),
            inventoryWarn:$(".kcyj").find("input").prop('checked')==true ? "1" : "0",
            minInventory:$("#minInventory").val(),
            maxInventory:$("#maxInventory").val(),
            storageWarn:$("#warning").find("input").prop('checked')==true ? "1" : "0",
            note:$("#note").val(),
            goodsPrice:goodsPrice,
            goodsDiscount:goodsDiscount,
            goodsStoWarn:$(".kcyj").find("input").prop('checked')==true ? goodsStoWarn : [],
            goodsInventory:goodsInventory
        };
    }
    var index = parent.layer.getFrameIndex(window.name);
    $.ajax({
        type:"post",
        url:url,
        cache:false,
        dataType:"json",
        data:JSON.stringify(data),
        contentType : "application/json;charset=UTF-8",
        success:function (res) {
            if(res.code==200){
                layer.msg("保存成功");
                parent.layer.close(index);
            }else{
                layer.msg(res.message)
            }
        },error:function (res) {
            layer.msg(res.message)
        }
    })
}


//批量
function bathMin() {
    $(".dropdown").css({"left":"130px"});
    $(".dropdown").find(".bathSave").off("click");
    if($('.dropdown').is(':hidden')){
        $(".dropdown").find(".bathSave").click(function () {
            bathSave("minInventory");
            $('.dropdown').hide();
            $(".dropdown").find("input").val("");
        });
        $(".dropdown").show()
    }else{//否则
        $('.dropdown').hide();
    }


}
function bathMax() {
    $(".dropdown").css({"left":"330px"});
    $(".dropdown").find(".bathSave").off("click");
    if($('.dropdown').is(':hidden')){
        $(".dropdown").show();
        $(".dropdown").find(".bathSave").click(function () {
            bathSave("maxInventory");
            $('.dropdown').hide();
            $(".dropdown").find("input").val("");
        });

    }else{//否则
        $('.dropdown').hide();
    }

}
function bathSave(field) {
    var row = $("#editTabKc").datagrid("getRows");
    var txt = $('.dropdown').find('input').val();
    for(var i=0;i<row.length;i++){
        row[i][field] = txt;
    }
    $("#editTabKc").datagrid("loadData",{data:row});

    console.info($("#editTabKc").datagrid('getColumnFields'));
}