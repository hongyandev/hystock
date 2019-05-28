
$(function () {
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }
    });
    var height = $(window).height()+"px";
    $("#perTeam").datagrid({
        height : height
    });
    $("#perTeam").datagrid({
        url:genAPI('group/list'),
        method:'post',
        fitColumns:true,
        striped:true,
        nowrap:true,
        rownumbers:true,
        singleSelect:true,
        loadFilter:function (data) {
            return data.data
        },
        columns:[[
            { field:'id',title:'分组id',width:20},
            { field:'khdm',title:'客户代码',width:100,hidden:true},
            { field:'name',title:'组名',width:100},
            { field:'status',title:'状态',width:100,formatter: function(value,row,index){
                    if (value=="1"){
                        return "启用";
                    } else {
                        return "禁用";
                    }
                }}
        ]],
        toolbar:[{
            text:'添加',
            iconCls:'fa fa-plus fa-lg',
            handler:function(){
                $("#action_type").val("add");
                $(".hidden-class").css("display","none");
                layer.open({
                    type: 1,
                    title:'添加职员组',
                    skin: 'layui-layer-molv', //加上边框
                    area: ['500px', '300px'], //宽高
                    content: $('#addGroup')
                    ,btn: ['保存', '取消']
                    ,yes: function(index, layero){
                        addGroupSave();
                        layer.close(index);
                    },
                    btn2:function (index, layero) {
                        layer.close(index);
                    },
                    end:function () {
                        $("#name").val("");
                        $(".hidden-class").css("display","block");
                    }
                });
            }
        },'-',{
            text:'编辑',
            iconCls:'fa fa-pencil-square-o fa-lg',
            handler:function(){
                $("#action_type").val("edit");

                var rowSelect=$("#perTeam").datagrid("getSelected");
                //console.info(rowSelect);
                if(rowSelect){
                    $("#id").val(rowSelect.id).attr("readonly",true);
                    $("#name").val(rowSelect.name);

                    layer.open({
                        type: 1,
                        title:'编辑职员组',
                        skin: 'layui-layer-molv', //加上边框
                        area: ['500px', '300px'], //宽高
                        content: $('#addGroup')
                        ,btn: ['保存', '取消']
                        ,yes: function(index, layero){
                            addGroupSave();
                            layer.close(index);
                        },
                        btn2:function (index, layero) {
                            layer.close(index);
                        },
                        end:function () {
                            $("#name").val("");
                        }
                    });
                }else{
                    layer.alert("请选中一行进行编辑",{skin:'layui-layer-molv'});
                }

                }
            },'-',{
            text:'删除',
            iconCls:'fa fa-remove fa-lg',
            handler:function(){
                var rowSelect=$("#perTeam").datagrid("getSelected");
                if(!rowSelect){
                    layer.alert("请选中一行进行删除",{skin:'layui-layer-molv'});
                    return false;
                }
                var data={
                    groupId:rowSelect.id
                };
                if(rowSelect){
                  $.ajax({
                      type:"post",
                      url:genAPI('group/deleteGroup'),
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
                              $("#perTeam").datagrid('reload');
                          }else{
                              layer.msg(res.message)
                          }

                      }
                  })
                }


            }
        },'-',{
            text:'获取职员组',
            iconCls:'fa fa-get-pocket fa-lg',
            handler:function() {
                var rowSelect = $("#perTeam").datagrid("getSelected");

                if (!rowSelect) {
                    layer.alert("请选中一行进行删除",{skin:'layui-layer-molv'});
                    return false;
                }
                var data = {
                    groupId: rowSelect.id
                };
                if (rowSelect) {

                    layer.open({
                        type: 1,
                        title:'获取职员组',
                        skin: 'layui-layer-molv', //加上边框
                        area: ['500px', '300px'], //宽高
                        content: $('#resourceGroup')
                        ,btn: ['保存', '取消']
                        ,yes: function(index, layero){
                            resourceGroupSave();
                            layer.close(index);
                        },
                        btn2:function (index, layero) {
                            layer.close(index);
                        },
                        end:function () {

                        }
                    });
                    var setting = {
                        check: {
                            enable: true ,//显示复选框
                            chkStyle : "checkbox"
                        },
                        data:{
                            simpleData: {
                                enable:true,
                                idKey: "id",
                                pIdKey: "pid",
                                rootPId: ""
                            }
                        }
                    };
                    $.ajax({
                        type: "post",
                        url: genAPI('resource/resourceTreeByGroupId'),
                        cache: false,
                        dataType: "json",
                        headers: {
                            "uid": $.cookie('uid'),
                            "token": $.cookie('jwt')
                        },
                        data: JSON.stringify(data),
                        contentType: "application/json;charset=UTF-8",
                        success: function (res) {
                            if(res.code==200){
                                //console.info(res.data);
                                var zTreeObj = $.fn.zTree.init($("#groupTree"),setting,res.data);
                                var rootNode_0 = zTreeObj.getNodeByParam('pid',0,null);
                                zTreeObj.expandNode(rootNode_0, true, false, false, false);
                            }else{
                                layer.msg(res.message)
                            }

                        }
                    })
                }
            }
        }]
    })
});
function addGroupSave(){
    if($("#name").val()==""){
         layer.alert("请输入组名",{skin:'layui-layer-molv'});
        //$.messager.alert('提醒','请输入组名');
        return false;

    }
    var actionType=$("#action_type").val();

    var url="";
    var data={};
    if(actionType=="add"){
        url=genAPI('group/addGroup');
        data = {
            name:$("#name").val()
        }
    }else{
        url=genAPI('group/editGroup');
        data = {
            id:$("#id").val(),
            name:$("#name").val()
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
            //layer.close(index);
            if(res.code==200){
                $("#perTeam").datagrid('reload');
            }else{
                layer.msg(res.message)
            }

        }
    })
}
function resourceGroupSave() {
    var zTreeObj = $.fn.zTree.getZTreeObj("groupTree");
    var nodes = zTreeObj.getCheckedNodes(true);
    //console.info(nodes);
    var v="";
    var arr = new Array("");
    for(var i=0;i<nodes.length;i++){
        v+=nodes[i].name + ",";
        arr.push(nodes[i].id);
    }
   // console.log(arr.join(",").substring(1)); //获取选中节点的值
    var row = $('#perTeam').datagrid('getSelected');
    var data = {
        groupId:row.id,
        ids:arr.join(",").substring(1)
    };
    $.ajax({
        type:"post",
        url:genAPI('group/setAuthority'),
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
                $("#perTeam").datagrid('reload');
            }else{
                layer.msg(res.message)
            }

        }
    })
}