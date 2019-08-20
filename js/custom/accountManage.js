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
            return data.data
        },
        columns:[[
            { field:'id',title:'ID',width:20},
            { field:'code',title:'账户编码',width:100},
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
                    area: ['350px', '250px'], //宽高
                    content: $('#accountInfo'),
                    btn: ['保存', '取消'],
                    yes: function(index, layero){
                        //提交保存
                        formSave("create");
                        layer.close(index);
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
                    layer.open({
                        type: 1,
                        title:"编辑",
                        skin: 'layui-layer-molv', //加上边框
                        area: ['350px', '300px'], //宽高
                        content: $('#accountInfo'),
                        btn: ['保存', '取消'],
                        yes: function(index, layero){
                            //提交保存
                            formSave("modify");
                            layer.close(index);
                        }
                        ,btn2: function(index, layero){
                            layer.close(index);
                        }
                    });
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
                    var data = {
                        accountId : rowSelect.id
                    };
                    $.ajax({
                        type:"post",
                        url:genAPI('settings/account/freeze'),
                        cache:false,
                        dataType:"json",
                        data:JSON.stringify(data),
                        contentType : "application/json;charset=UTF-8",
                        success:function (res) {
                            // console.info(res);
                            if(res.code==200){
                                layer.msg("成功冻结该账户");
                                $('#accountList').datagrid('reload');
                            }else{
                                layer.msg(res.message);
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
                    var data = {
                        accountId : rowSelect.id
                    };
                    $.ajax({
                        type:"post",
                        url:genAPI('settings/account/unfreeze'),
                        cache:false,
                        dataType:"json",
                        data:JSON.stringify(data),
                        contentType : "application/json;charset=UTF-8",
                        success:function (res) {
                            // console.info(res);
                            layer.msg("该账户已成功启用");
                            $('#accountList').datagrid('reload');
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
    if($("#number").val()==""){
        layer.alert("请输入账户编号",{skin:'layui-layer-molv'});
        return false;
    }
    if($("#name").val()==""){
        layer.alert("请输入账户名称",{skin:'layui-layer-molv'});
        return false;
    }
    var url="";
    var data = $("#accountInfoForm").serializeObject();
    if(action=="create"){
        url=genAPI('settings/account/create');
    } else if(action=="modify"){
        url=genAPI('settings/account/modify');
    }
    console.info(data);
    return;
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
            $("#accountList").datagrid('reload');
        }
    })
}
