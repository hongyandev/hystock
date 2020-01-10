$(function () {
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }
    });
    var height = $(window).height()-60+"px";
    $("#goodsLists").datagrid({
        height : height
    });
    var query = $("#searTxt").val();
    var chk = $(".chk-ischecked").find('checkbox').prop('checked')== true ? '1' : '';

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
            $("#goodsLists").datagrid('load',{
                query: query,
                status: chk,
                category:node.id
            })
          }
    });
    var category = $('#cateTree').tree('getSelected');
    if(category){
        getGoodsData(query,chk,category.id)
    }else{
        getGoodsData(query,chk,"")
    }
    $("#checkType li").click(function(){
        var idx=$(this).index();
        $(this).find('span').addClass("checked");
        $(this).siblings().find("span").removeClass("checked");
        $(".content li").eq(idx).show().siblings().hide();
    });

});
//查询商品
function seachForm(query,chk) {
    var category = $('#cateTree').tree('getSelected');
    if(category){
        $("#goodsLists").datagrid('load',{
            query: query,
            status: chk,
            category:category.id
        })
    }else{
        $("#goodsLists").datagrid('load',{
            query: query,
            status: chk,
            category:""
        })
    }

}
var storageId;
var categoryId;
var ids="";
function getGoodsData(query,chk,category) {
    $('#goodsLists').datagrid({
        url : genAPI('goods/goodsList'),
        method:'post',
        striped:true,
        nowrap:true,
        pagination:true,
        rownumbers:true,
        //singleSelect:true,
        checkOnSelect:true,
        queryParams:{
            query:query,
            status:chk,
            category:""
        },
        loadFilter: function(res){
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        columns : [[
            {
                field : 'ck',
                checkbox:true,
                width:100
            },
            {
                field : 'code',
                title : '商品编号',
                align : 'center',
                width:100
            },
            {
                field : 'name',
                title : '商品名称',
                align : 'center',
                width:100
            },
            {
                field : 'categoryName',
                title : '商品类别',
                align : 'center',
                width:100
            },
            {
                field : 'specs',
                title : '规格型号',
                align : 'center',
                width:100
            },
            {
                field : 'unitName',
                title : '单位',
                align : 'center',
                width:150
            },
            {
                field : 'currentQty',
                title : '当前库存',
                align : 'center',
                width:100
            },
            {
                field : 'unitCost',
                title : '单位成本',
                align : 'center',
                formatter : function (value) {
                    return _.ceil(value, 4);
                },
                width:80
            },
            {
                field : 'quantity',
                title : '期初数量',
                align : 'center',
                width:100
            },
            {
                field : 'score',
                title : '期初总价',
                align : 'center',
                width:100,
                formatter:function (value,record,index) {
                    if(record.quantity){
                        return record.unitCost*record.quantity
                    }
                }
            },
            {
                field : 'purPrice',
                title : '采购价',
                align : 'center',
                width:100
            },
            {
                field : 'salePrice',
                title : '零售价',
                align : 'center',
                width:100
            },
            {
                field : 'wholesalePrice',
                title : '批发价',
                align : 'center',
                width:100
            },
            {
                field : 'status',
                title : '状态',
                align : 'center',
                width:100,
                formatter:function (value,record,index) {
                    if (value=="1"){
                        return "启用";
                    } else {
                        return "禁用";
                    }
                }
            }
        ]],
        toolbar:[{
            text:'新增',
            iconCls:'fa fa-plus fa-lg',
            handler:function(){
                //var action_type = $("#action_type").val("add");
                var action_type = 'add';
                var tabTitle = '新增商品';
                var dg="#tabs";
                var url = "webapp/custom/goodInfo.html?at="+action_type;
                addTopTab(dg,tabTitle,url);
            }
        },'-',{
            text:'编辑',
            iconCls:'fa fa-pencil-square-o fa-lg',
            handler:function(){
               //var action_type = $("#action_type").val("edit");
               var action_type = 'edit';
                var rowSelect=$("#goodsLists").datagrid("getSelected");
                //console.info(rowSelect);
                if(!rowSelect){
                    layer.msg('请选中一行进行操作！');
                }else{
                    var tabTitle = '修改商品';
                    var dg="#tabs";
                    var url = "webapp/custom/goodInfo.html?"+rowSelect.id+"&at="+action_type;
                    addTopTab(dg,tabTitle,url);
                    $.cookie('id',rowSelect.id);
                    $("#goodsLists").datagrid("clearSelections");
                }


            }
        },{
            text:'编辑2',
            iconCls:'fa fa-pencil-square-o fa-lg',
            handler:function(){
                //var action_type = $("#action_type").val("edit");
                var action_type = 'edit';
                var rowSelect=$("#goodsLists").datagrid("getSelected");
                //console.info(rowSelect);
                if(!rowSelect){
                    layer.msg('请选中一行进行操作！');
                }else{
                    var tabTitle = '修改商品2';
                    var dg="#tabs";
                    var url = "webapp/custom/goodsDetail.html?id="+rowSelect.id+"&at="+action_type;
                    addTopTab(dg,tabTitle,url);
                    $("#goodsLists").datagrid("clearSelections");
                }


            }
        },'-',{
            text:'批量设置',
            iconCls:'fa fa-cog fa-lg',
            handler:function(){
                var row = $('#goodsLists').datagrid('getSelections');
                for(var i=0;i<row.length;i++){
                    ids+=","+row[i].id;
                }
                console.info(ids.substring(1));
                var rowSelect=$("#goodsLists").datagrid("getSelected");

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
                    onSelect:function (record) {
                        categoryId = record.id;
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
                    }
                });

                //库存预警
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
                    loadFilter: function(res){
                        if(res.code == 200) {
                            return res.data
                        } else {
                            layer.msg(res.message);
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
                            width : 120,
                            hidden:false,
                            editor : {
                                type : "validatebox"
                            }
                        },
                        { field:'maxInventory',
                            title:'最大库存<button class="btn btn-default btn-xs" type="button" onclick="bathMax()">批量</button>',
                            width : 120,
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

                if(rowSelect){
                    layer.open({
                        title:'批量设置商品',
                        type:1,
                        area: ['700px', '480px'], //宽高
                        skin:'layui-layer-molv',
                        content:$("#manageWrapper"),
                        btn:['关闭'],
                        yes:function (index,layero) {
                            layer.close(index)
                        }
                    })
                }else{
                    layer.alert("请选择需要设置的项",{skin:'layui-layer-molv'});
                }

            }
        },'-',{
            text:'启用',
            iconCls:'fa fa-refresh fa-lg',
            handler:function(){
                var row = $("#goodsLists").datagrid('getSelections');
                if(row.length <= 0){
                    layer.msg('请选中一行进行操作！');
                }else if(row.length>1){
                    layer.msg('请选中一行进行操作！');
                }else{
                    var url = genAPI('goods/unfreezeGoods');
                   // goodsGetfree(url,row[0].id,row[0].name)
                    $.ajax({
                        type:"post",
                        url:url,
                        cache:false,
                        dataType:"json",
                        data:{
                            goodsId:row[0].id
                        },
                        success:function (res) {
                            if(res.code==200){
                                layer.msg(row[0].name+"启用成功");
                                $("#goodsLists").datagrid('reload');
                            }else{
                                layer.msg(res.message)
                            }
                        },error:function (res) {
                            layer.msg(res.message)
                        }
                    })
                }

            }
        },'-',{
            text:'禁用',
            iconCls:'fa fa-warning fa-lg',
            handler:function(){
                var row = $("#goodsLists").datagrid('getSelections');
                if(row.length <= 0){
                    layer.msg('请选中一行进行操作！');
                }else if(row.length>1){
                    layer.msg('请选中一行进行操作！');
                }else{
                    var url = genAPI('goods/freezeGoods');
                    //goodsGetfree(url,row[0].id,row[0].name)
                    $.ajax({
                        type:"post",
                        url:url,
                        cache:false,
                        dataType:"json",
                        data:{
                            goodsId:row[0].id
                        },
                        success:function (res) {
                            if(res.code==200){
                                layer.msg(row[0].name+"禁用成功");
                                $("#goodsLists").datagrid('reload');
                            }else{
                                layer.msg(res.message)
                            }
                        },error:function (res) {
                            layer.msg(res.message)
                        }
                    })
                }

            }
        },'-',{
            text:'导入',
            iconCls:'fa fa-download fa-lg',
            handler:function(){
                var tabTitle = '导入商品';
                var dg="#tabs";
                var url = "webapp/custom/importGoods.html";
                addTopTab(dg,tabTitle,url);
            }
        }],
        onLoadSuccess:function(data){

        }
    });
}
//启用-禁用
/*function goodsGetfree(url,id,name) {
    $.ajax({
        type:"post",
        url:url,
        cache:false,
        dataType:"json",
        data:{
            goodsId:id
        },
        contentType : "application/json;charset=UTF-8",
        success:function (res) {
            if(res.code==200){
                layer.msg(name+"操作成功");
                $("#goodsLists").datagrid('reload');
            }else{
                layer.msg(res.message)
            }
        },error:function (res) {
            layer.msg(res.message)
        }
    })
}*/
//保存仓库
function storageSave() {
    $.ajax({
        type: "post",
        url: genAPI('goods/batchSetStorage'),
        cache: false,
        dataType: "json",
        data: {
            goodsIds:ids.substring(1),
            storageId:storageId
        },
        success: function (res) {
            //console.info(res);
            if(res.code==200){
                layer.msg('设置成功');
                $('#goodsLists').datagrid('reload')
            }else{
                layer.msg(res.message)
            }
        }, error: function () {

        }
    })
}
//保存商品类别
function categorySave() {

    $.ajax({
        type: "post",
        url: genAPI('goods/batchSetCategory'),
        cache: false,
        dataType: "json",
        data: {
            goodsIds:ids.substring(1),
            categoryId:categoryId
        },
        success: function (res) {
            //console.info(res);
            if(res.code==200){
                layer.msg('设置成功');
                $('#goodsLists').datagrid('reload')
            }else{
                layer.msg(res.message)
            }


        }, error: function () {

        }
    })
}
//保存库存
function stoWarnSave() {
    var stoWarnCon = $("#editTabKc").datagrid('getRows');
    $("#editTabKc").datagrid('endEditing');
    var storageWarn = $('#warning').find('input').prop("checked") == true ? "1" : "0";
    var stoWarn = $('#warning').find('input').prop("checked") == true ? stoWarnCon : [];
    var minInventory = $('#warning').find('input').prop("checked") == true ? "" : $("#minInventory").val();
    var maxInventory = $('#warning').find('input').prop("checked") == true ? "" : $("#maxInventory").val();
    var data = {
        goodsIds:ids.substring(1),
        storageWarn:storageWarn,
        stoWarn:stoWarn,
        minInventory:minInventory,
        maxInventory:maxInventory
    };
    $.ajax({
        type: "post",
        url: genAPI('goods/batchSetStoWarn'),
        cache: false,
        dataType: "json",
        data:JSON.stringify(data),
        contentType : "application/json;charset=UTF-8",
        success: function (res) {
            //console.info(res);
            if(res.code==200){
                layer.msg('设置成功');
                $('#goodsLists').datagrid('reload')
            }else{
                layer.msg(res.message)
            }


        }, error: function () {

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
    $(".dropdown").css({"left":"250px"});
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
}
