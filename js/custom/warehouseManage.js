$(function () {//ready()文档加载后
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }
    });
    $("#warehouseManage").datagrid({//easyUi的数据网格
        url:genAPI('/settings/storageList'),
        method:'post',
        fitColumns:true,
        striped:true,
        nowrap:true,
        rownumbers:true,
        singleSelect:true,
        fit:true,
        loadFilter:function (data) {
            return data.data
        },
        columns:[[
            { field:'id',title:'仓库id',width:20},
            { field:'code',title:'仓库编码',width:100},
            { field:'name',title:'仓库名称',width:100},
            { field:'status',title:'状态',width:100,formatter: function(value,row,index){
                    if (value=="1"){
                        return "启用";
                    } else {
                        return "禁用";
                    }
                }}
        ]],
        toolbar:[{//同linkbutton链接按钮
            text:'添加',
            iconCls:'fa fa-plus fa-lg',
            handler:function(){//?
                layer.open({
                    type: 1,
                    title:"新增",
                    skin: 'layui-layer-molv', //加上边框
                    area: ['350px', '250px'], //宽高
                    content: $('#addWareH'),
                    btn: ['保存', '取消'],
                    yes: function(index, layero){
                        //提交保存
                        addWareHSave();
                        layer.close(index);
                    }
                    ,btn2: function(index, layero){
                        layer.close(index);
                    }
                });
                $(".hidden-class").css("display","none");//?
            }
        },'-',{
            text:'编辑',
            iconCls:'fa fa-pencil-square-o fa-lg',
            handler:function(){
                $("#action_type").val("edit");
                var rowSelect=$("#warehouseManage").datagrid("getSelected");
                if(rowSelect){//?
                    $(".hidden-class").css("display","none");
                    $("#id").val(rowSelect.id).attr("readonly",true);//?
                    $("#name").val(rowSelect.name);
                    $("#code").val(rowSelect.code).attr("readonly",true);
                    layer.open({
                        type: 1,
                        title:"编辑",
                        skin: 'layui-layer-molv', //加上边框
                        area: ['350px', '300px'], //宽高
                        content: $('#addWareH'),
                        btn: ['保存', '取消'],
                        yes: function(index, layero){
                            //提交保存
                            addWareHSave();
                            layer.close(index);
                        }
                        ,btn2: function(index, layero){
                            layer.close(index);
                        },
                        end:function () {
                            $("#name").val("");//?
                        }
                    });

                }else{
                    layer.alert("请选中一行进行编辑",{skin:'layui-layer-molv'});
                }
            }
        },'-',{
            text:'冻结仓库',
            iconCls:'fa fa-warning fa-lg',
            handler:function(){
                var rowSelect=$("#warehouseManage").datagrid("getSelected");
                if(!rowSelect){
                    layer.alert('请选中一行进行操作',{skin:'layui-layer-molv'});
                }
                if(rowSelect){
                    var data = {
                        storageId : rowSelect.id
                    };
                    $.ajax({
                        type:"post",
                        url:genAPI('settings/freezeStorage'),
                        cache:false,
                        dataType:"json",
                        data:JSON.stringify(data),
                        contentType : "application/json;charset=UTF-8",
                        success:function (res) {
                            // console.info(res);
                            if(res.code==200){
                                layer.msg("成功冻结该仓库");
                                $('#warehouseManage').datagrid('reload');
                            }else{
                                layer.msg(res.message);
                            }

                        },error:function () {

                        }
                    })
                }
            }
        },'-',{
            text:'启用仓库',
            iconCls:'fa fa-check-circle fa-lg',
            handler:function(){
                var rowSelect=$("#warehouseManage").datagrid("getSelected");
                if(!rowSelect){
                    layer.alert('请选中一行进行操作',{skin:'layui-layer-molv'});
                }
                if(rowSelect){
                    var data = {
                        storageId : rowSelect.id
                    };
                    $.ajax({
                        type:"post",
                        url:genAPI('settings/unfreezeStorage'),
                        cache:false,
                        dataType:"json",
                        data:JSON.stringify(data),
                        contentType : "application/json;charset=UTF-8",
                        success:function (res) {
                            // console.info(res);
                            layer.msg("该仓库已成功启用");
                            $('#warehouseManage').datagrid('reload');
                        },error:function () {

                        }
                    })
                }
            }
        }
        ]
    })
    }
)
function addWareHSave(){
    if($("#code").val()==""){
        layer.alert("请输入仓库编号",{skin:'layui-layer-molv'});
        //$.messager.alert('提醒','请输入仓库编号');
        return false;
    }
    if($("#name").val()==""){
        layer.alert("请输入仓库名",{skin:'layui-layer-molv'});
        //$.messager.alert('提醒','请输入仓库名');
        return false;
    }
    var actionType=$("#action_type").val();

    var url="";
    var data={};
    if(actionType=="add"){
        url=genAPI('settings/addStorage');
        data = {
            name:$("#name").val(),
            code:$("#code").val()
        }
    }else{
        url=genAPI('settings/editStorage');
        data = {
            id:$("#id").val(),
            name:$("#name").val(),
            code:$("#code").val()
        }
    }
    $.ajax({
        type:"post",
        url:url,
        cache:false,
        dataType:"json",
        headers:{
            "uid":$.cookie('uid'),
            "token":$.cookie('jwt')
        },
        data: JSON.stringify(data),
        contentType : "application/json;charset=UTF-8",
        success:function (res) {

            $("#warehouseManage").datagrid('reload');
        }
    })
}
