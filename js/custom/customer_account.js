$(function () {//ready()文档加载后
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }
    });
    $("#cus_accountList").datagrid({//easyUi的数据网格
        url:genAPI('/user/customer_list'),
        method:'post',
        fitColumns:true,
        striped:true,
        nowrap:true,
        rownumbers:true,
        singleSelect:true,
        pagination:true,
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
            { field:'uid',title:'ID',width:50,hidden:true},
            { field:'realName',title:'客户名称',width:100},
            { field:'username',title:'用户名',width:100},
            { field:'status',title:'状态',width:100,formatter: function(value,row,index){
                    if (value=="1"){
                        return "启用";
                    } else {
                        return "冻结";
                    }
                }}
        ]],
        toolbar:[{//同linkbutton链接按钮
            text:'创建',
            iconCls:'fa fa-plus fa-lg',
            handler:function(){//?
                layer.open({
                    type: 1,
                    title:"创建新客户",
                    skin: 'layui-layer-molv', //加上边框
                    area: ['500px', '400px'], //宽高
                    content: $('#accountInfo'),
                    btn: ['保存', '取消'],
                    yes: function(index, layero){
                        //提交保存
                        if(formSave()){
                            layer.close(index);
                        }
                    }
                    ,btn2: function(index, layero){
                        layer.close(index);
                    }
                });
            }
        },'-',{
            text:'更换手机号',
            iconCls:'fa fa-pencil-square-o fa-lg',
            handler:function(){
                var rowSelect=$("#cus_accountList").datagrid("getSelected");
                if(rowSelect){//?
                    console.info(rowSelect);
                    $("#uid").val(rowSelect.uid);
                    $("#oldphone").textbox('setValue',rowSelect.phone);

                    layer.open({
                        type: 1,
                        title:"更换手机号",
                        skin: 'layui-layer-molv', //加上边框
                        area: ['500px', '350px'], //宽高
                        content: $('#phoneInfo'),
                        btn: ['保存', '取消'],
                        yes: function(index, layero){
                            var isValid = $("#phoneInfo").form('validate');
                            if(isValid){
                                var data = $("#phoneInfo").serializeObject();
                            }else{
                                return false
                            }

                            //提交保存
                            $.ajax({
                                type:"post",
                                url:genAPI('user/change_customer_phone'),
                                cache:false,
                                dataType:"json",
                                data: data,
                                success:function (res) {
                                    if(res.code == 200){
                                        $('#cus_accountList').datagrid('reload');
                                        layer.close(index);
                                        $("#newphone").textbox('setValue',"");

                                    }else{
                                        layer.msg(res.message);
                                        layer.close(index);
                                        $("#newphone").textbox('setValue',"");
                                    }
                                },error:function () {

                                }
                            })
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
                var rowSelect=$("#cus_accountList").datagrid("getSelected");
                if(!rowSelect){
                    layer.alert('请选中一行进行操作',{skin:'layui-layer-molv'});
                }
                if(rowSelect){
                    var data = {
                        uid : rowSelect.uid
                    };
                    $.ajax({
                        type:"post",
                        url:genAPI('user/freeze'),
                        cache:false,
                        dataType:"json",
                        contentType: 'application/json',
                        data:JSON.stringify(data),
                        success:function (res) {
                            layer.msg(res.message);
                            if(res.code==200){
                                $('#cus_accountList').datagrid('reload');
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
                var rowSelect=$("#cus_accountList").datagrid("getSelected");
                if(!rowSelect){
                    layer.alert('请选中一行进行操作',{skin:'layui-layer-molv'});
                }
                if(rowSelect){
                    var data = {
                        uid : rowSelect.uid
                    };
                    $.ajax({
                        type:"post",
                        url:genAPI('user/unfreeze'),
                        cache:false,
                        dataType:"json",
                        contentType: 'application/json',
                        data:JSON.stringify(data),
                        success:function (res) {
                            layer.msg(res.message);
                            if(res.code==200){
                                $('#cus_accountList').datagrid('reload');
                            }
                        },error:function () {
                        }
                    })
                }
            }
        }
        ]
    });
    $('#customerName').customerPanel({
        type: 'customer',
        el: "#customer",
        required: true,
        onSelected: function (tar, row) {
           // console.info(row)
        }
    });
});
function formSave(){
        var isValid = $("#accountInfoForm").form("validate");
        if(isValid){
            var data = $("#accountInfoForm").serializeObject();
        }else{
            return false
        }
        $.ajax({
            type:"post",
            url: genAPI('/user/register_customer'),
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
                    $('#cus_accountList').datagrid('reload');
                    $("#customerName").val("");
                    $("#customer").val("");
                    $("#phone").val()
                }
            },
            error:function () {

            }
        })
    }
