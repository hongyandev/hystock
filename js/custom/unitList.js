$(function () {
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }

    });

    getunitWap(0,'');
    $(".navTab ul li").on("click",function () {
        $(this).stop().addClass("active").siblings().stop().removeClass("active");
        var type = $(this).attr("typeNum");
        if(type=='0'){
            $(".unitGroupWap").hide();
            $(".unitWap").show();
            getunitWap(type,'');
        }else if(type=='1'){
            $(".unitWap").hide();
            $(".unitGroupWap").show();
            getunitGroupWap(type,'');
        }

    });

    function getunitWap(type) {
        $("#unitList1").datagrid({
            url:genAPI('settings/unitList'),
            method:'post',
            fitColumns:true,
            striped:true,
            nowrap:true,
            rownumbers:true,
            singleSelect:true,
            loadFilter:function (data) {
                return data.data
            },
            queryParams: {
                isGroup: type
            },
            columns:[[
                { field:'id',title:'主键ID',hidden:false},
                { field:'unitName',title:'计量单位名称',width:100}
            ]],
            toolbar:[{
                text:'添加',
                iconCls:'fa fa-plus fa-lg',
                handler:function(){
                    layer.open({
                        type: 1,
                        title:'新增单计量单位',
                        skin: 'layui-layer-molv', //加上边框
                        area: ['400px', '200px'], //宽高
                        content: $('#addUnit1')
                        ,btn: ['保存', '取消']
                        ,yes: function(index, layero){
                            var data={
                                type:type,
                                unitName:$("input[name='unitNum']").val()
                            };
                            if($("input[name='unitNum']").val()==""){
                                layer.msg("新增计量单位失败，单位名称不能为空");
                                return false;
                            }
                            $.ajax({
                                type:"post",
                                url:genAPI('settings/addUnit'),
                                cache:false,
                                dataType:"json",
                                headers:{
                                    "uid":$.cookie('uid'),
                                    "token":$.cookie('jwt')
                                },
                                data: JSON.stringify(data),
                                contentType : "application/json;charset=UTF-8",
                                success:function (res) {
                                    if(res.code==200){
                                        layer.close(index);
                                        $("#unitList1").datagrid('reload');
                                    }else{
                                        layer.msg(res.message);
                                    }

                                },
                                error:function () {

                                }
                            })

                        }
                        ,btn2: function(index, layero){
                            layer.close(index);
                        },
                        end: function(index, layero){
                            $("input[name='unitNum").val("");
                        }
                    })

                }
            },'-',{
                text:'修改',
                iconCls:'fa fa-pencil-square-o fa-lg',
                handler:function(){
                    var rowSelect = $("#unitList1").datagrid("getSelected");
                    console.info(rowSelect);
                    if(!rowSelect){
                        layer.alert("请选中一行进行修改",{skin:'layui-layer-molv'});
                        return false;
                    }
                    $("input[name='unitNum']").val(rowSelect.unitName);

                    layer.open({
                        type: 1,
                        title:'修改单计量单位',
                        skin: 'layui-layer-molv', //加上边框
                        area: ['400px', '200px'], //宽高
                        content: $('#addUnit1')
                        ,btn: ['保存', '取消']
                        ,yes: function(index, layero){
                            var data={
                                type:type,
                                id:rowSelect.id,
                                unitName:$("input[name='unitNum']").val()
                            };
                            if($("input[name='unitNum']").val()==""){
                                layer.msg("新增计量单位失败，单位名称不能为空");
                                return false;
                            }
                            $.ajax({
                                type:"post",
                                url:genAPI('settings/addUnit'),
                                cache:false,
                                dataType:"json",
                                headers:{
                                    "uid":$.cookie('uid'),
                                    "token":$.cookie('jwt')
                                },
                                data: JSON.stringify(data),
                                contentType : "application/json;charset=UTF-8",
                                success:function (res) {
                                    if(res.code==200){
                                        layer.msg("修改成功！");
                                        layer.close(index);
                                        $("#unitList1").datagrid('reload');
                                    }else{
                                        layer.msg(res.message)
                                    }

                                },
                                error:function () {

                                }
                            })

                        }
                        ,btn2: function(index, layero){
                            layer.close(index);
                        },
                        end: function(index, layero){
                            $("input[name='unitNum").val("");
                        }
                    })
                }
            },'-',{
                text:'删除',
                iconCls:'fa fa-pencil-square-o fa-lg',
                handler:function(){
                    var rowSelect=$("#unitList1").datagrid("getSelected");
                    // console.info(rowSelect);
                    if(!rowSelect){
                        layer.alert("请选中一行进行删除",{skin:'layui-layer-molv'});
                        return false;
                    }
                    var data={
                        id:rowSelect.id
                    };
                    if(rowSelect){
                        $.ajax({
                            type:"post",
                            url:genAPI('settings/deleteUnit'),
                            cache:false,
                            dataType:"json",
                            headers:{
                                "uid":$.cookie('uid'),
                                "token":$.cookie('jwt')
                            },
                            data: JSON.stringify(data),
                            contentType : "application/json;charset=UTF-8",
                            success:function (res) {
                                if(res.code==200){
                                    layer.msg("删除成功！");
                                    $("#unitList1").datagrid('reload');
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
            onLoadError:function (res) {
                layer.alert(res.message);
            }
        });
    }
    function getunitGroupWap(type) {
        $("#unitList2").datagrid({
            url:genAPI('settings/unitList'),
            method:'post',
            fitColumns:true,
            striped:true,
            nowrap:true,
            rownumbers:true,
            singleSelect:true,
            loadFilter:function (data) {
                return data.data
            },
            queryParams: {
                isGroup: type
            },
            columns:[[
                { field:'id',title:'主键ID',hidden:false},
                { field:'unitName',title:'计量单位名称',width:100},
                { field:'deputyUnitName',title:'副计量单位名称',width:100},
                { field:'deputyUnitRate',title:'副计量单位比例',width:100}
            ]],
            toolbar:[{
                text:'添加',
                iconCls:'fa fa-plus fa-lg',
                handler:function(){

                    layer.open({
                        type: 1,
                        title:'新增多计量单位',
                        skin: 'layui-layer-molv', //加上边框
                        area: ['500px', '300px'], //宽高
                        content: $('#addUnit2')
                        ,btn: ['保存', '取消']
                        ,yes: function(index, layero){
                            var unitNames =[];
                            $("input[name='unitInput']").each(function(){
                                unitNames.push($(this).val());
                            });
                            // console.info(unitNames);
                            var rateNums = [];
                            $("input[name='rateNum']").each(function(){
                                rateNums.push($(this).val());
                            });
                            // console.info(rateNums);
                            var deputyUnits=[];
                            for(var i=0;i<unitNames.length;i++){
                                var deputyUnit={};
                                deputyUnit["unitName"]=unitNames[i];
                                deputyUnit['deputyUnitRate']=rateNums[i];
                                deputyUnits.push(deputyUnit);
                            }
                            //console.info(deputyUnits);
                            var data = {
                                unitName:$("input[name='unitNum1']").val(),
                                isGroup:type,
                                deputyUnits:deputyUnits
                            };

                            if($("input[name='unitNum1']").val()==""){
                                layer.msg("新增计量单位失败，基本单位不能为空");
                                return false;
                            }
                            if(deputyUnits.length <= 0){
                                layer.msg("新增计量单位失败，单位个数必须要大于1");
                                return false;
                            }

                            $.ajax({
                                type:"post",
                                url:genAPI('settings/addUnit'),
                                cache:false,
                                dataType:"json",
                                headers:{
                                    "uid":$.cookie('uid'),
                                    "token":$.cookie('jwt')
                                },
                                data: JSON.stringify(data),
                                contentType : "application/json;charset=UTF-8",
                                success:function (res) {
                                    if(res.code==200){
                                        layer.close(index);
                                        $("#unitList2").datagrid('reload');
                                    }else{
                                        layer.msg(res.message)
                                    }

                                },
                                error:function () {

                                }
                            })
                        }
                        ,btn2: function(index, layero){
                            layer.close(index);
                        },
                        end: function(index, layero){
                            $("input[name='unitNum1").val("");
                            $("input[name='unitInput']").val("");
                            $("input[name='rateNum']").val("");
                        }
                    })
                }
            },'-',{
                text:'修改',
                iconCls:'fa fa-pencil-square-o fa-lg',
                handler:function(){
                    $("#mod-form-rows").empty();
                    var rowSelect = $("#unitList2").datagrid("getSelected");
                    if(!rowSelect){
                        layer.alert("请选中一行进行修改",{skin:'layui-layer-molv'});
                        return false;
                    }
                    console.info(rowSelect);
                    console.info(rowSelect.deputyUnitName);
                    console.info(rowSelect.deputyUnitRate);
                    if(rowSelect){
                        var unitName=rowSelect.unitName;
                        $("input[name='unitNum1']").val(rowSelect.unitName);
                        var deputyUnitIdArray=rowSelect.deputyUnitId.split(":");
                        var deputyUnitName=rowSelect.deputyUnitName;
                        var deputyUnitRateArray=rowSelect.deputyUnitRate.split(":");
                        var deputyUnitNameArray=deputyUnitName.split(":");
                        var li="";
                        var j=1;
                        for(var i=deputyUnitNameArray.length-1;i>=0;i--){
                            li+="<li class=\"row-item\">\n" +
                                "<input type='hidden' class='deputyUnitId' value='"+deputyUnitIdArray[i]+"'/>"+
                                "                        <div class=\"label-wrap\">\n" +
                                "                            <a class=\"fa fa-trash-o fa-lg fa-ico\" title=\"删除\" onclick='delUnitRow(this)'></a>\n" +
                                "                            <label id=\"deputyUnitLabel\">副单位"+(j)+"</label>\n" +
                                "                        </div>\n" +
                                "                        <div class=\"ctn-wrap\">\n" +
                                "                            <input type=\"text\" class=\"ui-input\" name='unitInput' value='"+deputyUnitNameArray[i]+"' />\n" +
                                "                            <span class=\"descript\">=</span>\n" +
                                "                            <input type=\"text\" class=\"ui-input rateNum\" name='rateNum' value='"+deputyUnitRateArray[i]+"' onkeyup='checkInt(this)'/>\n" +
                                "                            <span class=\"descript baseUnitLabel\" class=\"baseUnitLabel\">"+unitName+"</span>\n" +
                                "                        </div>\n" +
                                "                    </li>";
                            //console.info(li);
                            j++;
                        }
                        $("#mod-form-rows").append(li);

                        layer.open({
                            type: 1,
                            title:'修改多计量单位',
                            skin: 'layui-layer-molv', //加上边框
                            area: ['500px', '300px'], //宽高
                            content: $('#addUnit2')
                            ,btn: ['保存', '取消']
                            ,yes: function(index, layero){


                                if($("input[name='unitNum1']").val()==""){
                                    layer.msg("新增计量单位失败，基本单位不能为空");
                                    return false;
                                }
                                if(deputyUnitNameArray.length <= 0){
                                    layer.msg("新增计量单位失败，单位个数必须要大于1");
                                    return false;
                                }
                                var unitNames =[];
                                $("input[name='unitInput']").each(function(){
                                    unitNames.push($(this).val());
                                });
                                // console.info(unitNames);
                                var rateNums = [];
                                $("input[name='rateNum']").each(function(){
                                    rateNums.push($(this).val());
                                });
                                var deputyUnitIds = [];
                                $(".deputyUnitId").each(function () {
                                    deputyUnitIds.push($(this).val());
                                })
                                var deputyUnits=[];
                                for(var i=0;i<unitNames.length;i++){
                                    var deputyUnit={};
                                    deputyUnit["unitName"]=unitNames[i];
                                    deputyUnit['deputyUnitRate']=rateNums[i];
                                    deputyUnit['id']=deputyUnitIds[i];
                                    deputyUnits.push(deputyUnit);
                                }


                                var data = {
                                    unitName:$("input[name='unitNum1']").val(),
                                    isGroup:type,
                                    id:rowSelect.id,
                                    deputyUnits:deputyUnits
                                };
                                $.ajax({
                                    type:"post",
                                    url:genAPI('settings/addUnit'),
                                    cache:false,
                                    dataType:"json",
                                    headers:{
                                        "uid":$.cookie('uid'),
                                        "token":$.cookie('jwt')
                                    },
                                    data: JSON.stringify(data),
                                    contentType : "application/json;charset=UTF-8",
                                    success:function (res) {
                                        if(res.code==200){
                                            layer.close(index);
                                            // location.reload();
                                            $("#unitList2").datagrid('reload');
                                        }else{
                                            layer.msg(res.message);
                                        }

                                    },
                                    error:function () {

                                    }
                                })

                            }
                            ,btn2: function(index, layero){
                                layer.close(index);
                            },
                            end: function(index, layero){
                                $("#mod-form-rows").empty();
                                $("input[name='unitNum1").val("");
                                $("input[name='unitInput']").val("");
                                $("input[name='rateNum']").val("");
                                /*location.reload();*/
                            }
                        })
                    }

                }
            },'-',{
                text:'删除',
                iconCls:'fa fa-pencil-square-o fa-lg',
                handler:function(){
                    var rowSelect=$("#unitList2").datagrid("getSelected");
                    // console.info(rowSelect);
                    if(!rowSelect){
                        //$.messager.alert('提醒','请选中一行进行删除');
                        layer.alert("请选中一行进行删除",{skin:'layui-layer-molv'});
                        return false;
                    }
                    var data={
                        id:rowSelect.id
                    };
                    if(rowSelect){
                        $.ajax({
                            type:"post",
                            url:genAPI('settings/deleteUnit'),
                            cache:false,
                            dataType:"json",
                            headers:{
                                "uid":$.cookie('uid'),
                                "token":$.cookie('jwt')
                            },
                            data: JSON.stringify(data),
                            contentType : "application/json;charset=UTF-8",
                            success:function (res) {
                                if(res.code==200){
                                    layer.msg("删除成功！");
                                    $("#unitList2").datagrid('reload');
                                }else{
                                    layer.msg(res.message)
                                }

                            },
                            error:function () {

                            }
                        })
                    }

                }
            }]
        });
    }

    //给input初始化绑定鼠标离开焦点事件
    $("input[name='unitNum1'],input[name='unitNum']").blur(function () {
        $(".baseUnitLabel").text($(this).val());
    })

});

function addUnitRow(obj) {

    //获取当前对象上一个平级对象里面的子元素input的值
    var unit=$(obj).prev().children("input").val();
    //Number()将对象值转为数字，否则会出现01 11 21 这种结果
    var deputyUnitText=Number($("#mod-form-rows li").length)+Number(1);
    //创建一个li对象
    var li="<li class=\"row-item\">" +
        "                        <input type='hidden' value=''/>"+
        "                        <div class=\"label-wrap\">\n" +
        "                            <a class=\"fa fa-trash-o fa-lg fa-ico\" title=\"删除\" onclick='delUnitRow(this)'></a>\n" +
        "                            <label id=\"deputyUnitLabel\">副单位"+deputyUnitText+"</label>\n" +
        "                        </div>\n" +
        "                        <div class=\"ctn-wrap\">\n" +
        "                            <input type=\"text\" class=\"ui-input\" name='unitInput' />\n" +
        "                            <span class=\"descript\">=</span>\n" +
        "                            <input type=\"text\" class=\"ui-input rateNum\" name='rateNum' onkeyup='checkInt(this)'/>\n" +
        "                            <span class=\"descript baseUnitLabel\" class=\"baseUnitLabel\">"+unit+"</span>\n" +
        "                        </div>\n" +
        "                    </li>";
        //将这个li对象append到这个ul
        $("#mod-form-rows").append(li);
        //将单位值放到指定位置
        $(".baseUnitLabel").text(unit);
}

function delUnitRow(obj) {
    $(obj).parent().parent().remove();
    var data = {
        id:$(obj).parents().siblings('.deputyUnitId').val()
    };
    $.ajax({
        type:"post",
        url:genAPI('settings/deleteUnit'),
        cache:false,
        dataType:"json",
        headers:{
            "uid":$.cookie('uid'),
            "token":$.cookie('jwt')
        },
        data: JSON.stringify(data),
        contentType : "application/json;charset=UTF-8",
        success:function (res) {
            if(res.code==200){
                layer.msg("删除成功！");
                $("#unitList2").datagrid('reload');
            }else{
                layer.msg(res.message)
            }

        },
        error:function () {

        }
    })
}

function checkInt(e) {
    var re = new RegExp("^[0-9]*[1-9][0-9]*$");
    if (e.value != "") {
        if (!re.test(e.value)) {
            layer.msg("请输入整数");
            e.value = "";
            e.focus();
        }
    }
}
