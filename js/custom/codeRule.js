$(function () {
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }

    });

    $('#codeRule').datagrid({
        url : genAPI('settings/coderuleList'),
        method:'post',
        striped:true,
        nowrap:true,
        //pagination:true,
        rownumbers:true,
        singleSelect:true,
        checkOnSelect:true,
        fit:true,
        queryParams:{
        },
        loadFilter: function(data){
            if(data.code == 200) {
                return data.data
            } else {
                layer.msg(data.message);
                return [];
            }
        },
        columns : [[
            {
                field : 'billstype',
                title : '规则类型',
                align : 'center',
                width:100,
                formatter:function (value,rowData,rowIndex) {
                    if (value=="1"){
                        return "商品编码";
                    } else if(value =="2") {
                        return "客户编码";
                    } else if(value == "3"){
                        return "销售单"
                    } else if(value == "4"){
                        return "销售退货单"
                    } else if(value == "5"){
                        return "采购单"
                    } else if(value == "6"){
                        return "采购退货单"
                    } else if(value == "7"){
                        return "调拨单"
                    } else if(value == "8"){
                        return "其他入库单,盘盈"
                    } else if(value == "9"){
                        return "其他出库单,盘亏"
                    } else{
                        return "成本调整单"
                    }
                }
            },
            {
                field : 'name',
                title : '规则名称',
                align : 'center',
                width:100
            },
            {
                field : 'coderule',
                title : '编号规则',
                align : 'center',
                width:200
            },
            {
                field : 'digits',
                title : '编号位数',
                align : 'center',
                width:100
            }
        ]],
        toolbar:[{
            text:'添加',
            iconCls:'fa fa-plus fa-lg',
            handler:function(){
                $("#action_type").val("add");
                layer.open({
                    type: 1,
                    title:'编码规则',
                    skin: 'layui-layer-molv', //加上边框
                    area: ['650px', '450px'], //宽高
                    content: $('#addCodeRule')
                    ,btn: ['保存', '取消']
                    ,yes: function(index, layero){
                        codeRuleSave();
                        layer.close(index);
                    }
                    ,btn2: function(index, layero){
                        layer.close(index);
                    },
                    end: function(index, layero){
                        $("#billstype").find('option[value="1"]').attr("selected",true);
                        $("#resetZero").find('option[value="1"]').attr("selected",true);
                        $("#name").val("");
                        $("#prefix").val("");
                        $("#startNo").val("");
                        $("#demo").val("");
                        $("#digits").val("");
                        $("#year").parent().removeClass("checked");
                        $("#month").parent().removeClass("checked");
                        $("#day").parent().removeClass("checked")
                    }
                })

            }
        },'-',{
            text:'修改',
            iconCls:'fa fa-pencil-square-o fa-lg',
            handler:function(){
                $("#action_type").val("edit");
                var rowSelect = $("#codeRule").datagrid("getSelected");
                console.info(rowSelect);
                if(!rowSelect){
                    layer.alert("请选中一行进行修改",{skin:'layui-layer-molv'});
                    return false;
                }
                $("#billstype").find('option[value="'+rowSelect.billstype+'"]').attr("selected",true);
                $("#name").val(rowSelect.name);
                $("#prefix").val(rowSelect.prefix);
                $("#resetZero").find('option[value="'+rowSelect.resetZero+'"]').attr("selected",true);
                $("#startNo").val(rowSelect.startNo);
                $("#demo").val(rowSelect.coderule);
                $("#digits").val(rowSelect.digits);
                rowSelect.yearChk == "1" ? $("#year").parent().addClass("checked") :  $("#year").parent().removeClass("checked");
                rowSelect.monthChk == "1" ? $("#month").parent().addClass("checked") :  $("#month").parent().removeClass("checked");
                rowSelect.dayChk == "1" ? $("#day").parent().addClass("checked") :  $("#day").parent().removeClass("checked");
                layer.open({
                    type: 1,
                    title:'编码规则',
                    skin: 'layui-layer-molv', //加上边框
                    area: ['650px', '450px'], //宽高
                    content: $('#addCodeRule')
                    ,btn: ['保存', '取消']
                    ,yes: function(index, layero){
                        if($("#name").val()==""){
                            layer.msg("规则名称不能为空！");
                            return false;
                        }
                        if($("#prefix").val()==""){
                            layer.msg("编码前缀不能为空！");
                            return false;
                        }
                        if($("#digits").val()==""){
                            layer.msg("编码位数不能为空！");
                            return false;
                        }
                        if($("#prefix").val()==""){
                            layer.msg("规则名称不能为空！");
                            return false;
                        }
                        codeRuleSave();
                        layer.close(index);
                    }
                    ,btn2: function(index, layero){
                        layer.close(index);
                    },
                    end: function(index, layero){
                        $("#billstype").find('option[value="1"]').attr("selected",true);
                        $("#resetZero").find('option[value="1"]').attr("selected",true);
                        $("#name").val("");
                        $("#prefix").val("");
                        $("#startNo").val("");
                        $("#demo").val("");
                        $("#digits").val("");
                        $("#year").parent().removeClass("checked");
                        $("#month").parent().removeClass("checked");
                        $("#day").parent().removeClass("checked")
                    }
                })
            }
        },'-',{
            text:'删除',
            iconCls:'fa fa-pencil-square-o fa-lg',
            handler:function(){
                var rowSelect=$("#codeRule").datagrid("getSelected");
                // console.info(rowSelect);
                if(!rowSelect){
                    layer.alert("请选中一行进行删除",{skin:'layui-layer-molv'});
                    return false;
                }
                if(rowSelect){
                    $.ajax({
                        type:"post",
                        url:genAPI('settings/deleteCoderule'),
                        cache:false,
                        dataType:"json",
                        headers:{
                            "uid":$.cookie('uid'),
                            "token":$.cookie('jwt')
                        },
                        data: {
                            coderuleId:rowSelect.id
                        },
                        success:function (res) {
                            if(res.code==200){
                                layer.msg("删除成功！");
                                $("#codeRule").datagrid('reload');
                            }else{
                                layer.msg(res.message)
                            }

                        },
                        error:function () {

                        }
                    })
                }
            }
        }],
        onLoadSuccess:function(data){

        }
    });

    //

    $(".dateSelect span").on("click",function () {
        if($(this).hasClass("checked")){
            $(this).removeClass("checked");

        }else{
            $(this).addClass("checked");
        }
    });

    //编码规则
    var flag=false;
    $("#startNo").on('input propertychange',function () {
            flag=true;
            setVal();
     });
    $("#digits").on('input propertychange',function () {
        setVal();
    });
    $("#prefix").on('input propertychange',function () {
        setVal();
    });
    $("#year").parent().click(function () {
      setVal();
    });
    $("#month").parent().click(function () {
        setVal();
    });
    $("#day").parent().click(function () {
        setVal();
    });
    function setVal() {
        if(!flag){
            return ;
        }
        var myDate = new Date;
        var prefix = $("#prefix").val();
        var startNo = $("#startNo").val();
        var noLength=$("#digits").val() == '' ? 0:$("#digits").val();
        var year=$("#year").parent().hasClass('checked') == true ? myDate.getFullYear():'';
        var month=$("#month").parent().hasClass('checked') == true? myDate.getMonth()+1:'';
        var day=$("#day").parent().hasClass('checked') == true ? myDate.getDate():'';
        if(startNo.length < noLength){
            for(var i=startNo.length;i<noLength;i++){
                startNo="0"+startNo;
            }
        }
        $("#demo").val(prefix+year+month+day+startNo);
    }

});


function codeRuleSave() {
    var actionType=$("#action_type").val();
    var url="";
    var data={};
    if(actionType=="add"){
        url=genAPI('settings/addCoderule');
        data = {
            billstype:$("#billstype").find('option:selected').val(),
            name:$("#name").val(),
            prefix:$("#prefix").val(),
            yearChk:$("#year").parent().hasClass("checked") == true ? 1 : 0,
            monthChk:$("#month").parent().hasClass("checked") == true ? 1 : 0,
            dayChk:$("#day").parent().hasClass("checked") == true ? 1 : 0,
            resetZero:$("#resetZero").find("option:selected").val(),
            digits:$("#digits").val(),
            startNo:$("#startNo").val()
        }
    }else{
        url=genAPI('settings/editCoderule');
        var rowSelect=$("#codeRule").treegrid("getSelected");
        data = {
            id:rowSelect.id,
            billstype:$("#billstype").find('option:selected').val(),
            name:$("#name").val(),
            prefix:$("#prefix").val(),
            yearChk:$("#year").parent().hasClass("checked") == true ? 1 : 0,
            monthChk:$("#month").parent().hasClass("checked") == true ? 1 : 0,
            dayChk:$("#day").parent().hasClass("checked") == true ? 1 : 0,
            resetZero:$("#resetZero").find("option:selected").val(),
            digits:$("#digits").val(),
            startNo:$("#startNo").val()
        }
    }
    $.ajax({
        type:"post",
        url:url,
        cache:false,
        dataType:"json",
        data:JSON.stringify(data),
        contentType : "application/json;charset=UTF-8",
        success:function (res) {
            if(res.code==200){
                $("#codeRule").datagrid('reload');
            }else{
                layer.msg(res.message)
            }

        },error:function () {

        }

    })
}

