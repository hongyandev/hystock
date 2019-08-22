$(function () {//ready()文档加载后
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }
    });
    $("#accountList").datagrid({//easyUi的数据网格
        url:genAPI('/settings/account/list'),
        method:'post',
        fitColumns:true,
        striped:true,
        nowrap:true,
        rownumbers:true,
        singleSelect:true,
        fit:true,
        loadFilter:function (data) {
            if(data.code == 200) {
                return data.data
            } else {
                layer.msg(data.message);
                return [];
            }
        },
        columns:[[
            { field:'id',title:'ID',width:50},
            { field:'number',title:'账户编码',width:100},
            { field:'name',title:'账户名称',width:100},
            { field:'status',title:'状态',width:100,formatter: function(value,row,index){
                    if (value=="1"){
                        return "启用";
                    } else {
                        return "冻结";
                    }
                }}
        ]],
        toolbar:[{//同linkbutton链接按钮
            text:'新增',
            iconCls:'fa fa-plus fa-lg',
            handler:function(){//?
                layer.open({
                    type: 1,
                    title:"新增",
                    skin: 'layui-layer-molv', //加上边框
                    area: ['500px', '400px'], //宽高
                    content: $('#accountInfo'),
                    btn: ['保存', '取消'],
                    yes: function(index, layero){
                        //提交保存
                        if(formSave("create")){
                            layer.close(index);
                        }
                    }
                    ,btn2: function(index, layero){
                        layer.close(index);
                    }
                });
            }
        },'-',{
            text:'编辑',
            iconCls:'fa fa-pencil-square-o fa-lg',
            handler:function(){
                var rowSelect=$("#accountList").datagrid("getSelected");
                if(rowSelect){//?
                    console.info(rowSelect)
                    layer.open({
                        type: 1,
                        title:"编辑",
                        skin: 'layui-layer-molv', //加上边框
                        area: ['500px', '400px'], //宽高
                        content: $('#accountInfo'),
                        btn: ['保存', '取消'],
                        yes: function(index, layero){
                            //提交保存
                            if(formSave("modify")){
                                layer.close(index);
                            }
                        }
                        ,btn2: function(index, layero){
                            layer.close(index);
                        }
                    });
                    $.ajax({
                        type:"post",
                        url:genAPI('settings/account/get'),
                        cache:false,
                        dataType:"json",
                        data: {
                            id : rowSelect.id
                        },
                        success:function (res) {
                            if(res.code == 200){
                                $('#accountInfo').form('load',res.data)
                            }else{
                                layer.msg(res.message);
                            }
                        },error:function () {
                        }
                    })
                }else{
                    layer.alert("请选中一行进行操作",{skin:'layui-layer-molv'});
                }
            }
        },'-',{
            text:'冻结账户',
            iconCls:'fa fa-warning fa-lg',
            handler:function(){
                var rowSelect=$("#accountList").datagrid("getSelected");
                if(!rowSelect){
                    layer.alert('请选中一行进行操作',{skin:'layui-layer-molv'});
                }
                if(rowSelect){
                    $.ajax({
                        type:"post",
                        url:genAPI('settings/account/freeze'),
                        cache:false,
                        dataType:"json",
                        data:{
                            accountId: rowSelect.id
                        },
                        success:function (res) {
                            layer.msg(res.message);
                            if(res.code==200){
                                $('#accountList').datagrid('reload');
                            }
                        },error:function () {
                        }
                    })
                }
            }
        },'-',{
            text:'启用账户',
            iconCls:'fa fa-check-circle fa-lg',
            handler:function(){
                var rowSelect=$("#accountList").datagrid("getSelected");
                if(!rowSelect){
                    layer.alert('请选中一行进行操作',{skin:'layui-layer-molv'});
                }
                if(rowSelect){
                    $.ajax({
                        type:"post",
                        url:genAPI('settings/account/unfreeze'),
                        cache:false,
                        dataType:"json",
                        data:{
                            accountId: rowSelect.id
                        },
                        success:function (res) {
                            layer.msg(res.message);
                            if(res.code==200){
                                $('#accountList').datagrid('reload');
                            }
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
function formSave(action){
    var isValid = $("#accountInfoForm").form('validate');
    if(isValid){
        var data = $("#accountInfoForm").serializeObject();
        if(!data.first){
            data.first = 0;
        }
        $.ajax({
            type:"post",
            url: action=="create" ? genAPI('settings/account/create') : genAPI('settings/account/modify'),
            cache:false,
            dataType:"json",
            headers:{
                "uid":$.cookie('uid'),
                "token":$.cookie('jwt')
            },
            data: JSON.stringify(data),
            contentType : "application/json;charset=UTF-8",
            success:function (res) {
                layer.msg(res.message);
                if(res.code==200){
                    $('#accountList').datagrid('reload');
                }
            },
            error:function () {
                isValid = false;
            }
        })
    }
    return isValid;
}
