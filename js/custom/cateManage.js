$(function () {
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }
    });
    getData(1,'');
    $(".navTab ul li").on("click",function () {
        $(this).stop().addClass("active").siblings().stop().removeClass("active");
        var type = $(this).attr("typeNum");
        getData(type,'');
    });

    $(".input-group-addon").on("click",function () {
        getData($(".active").attr("typeNum"),$("#searTxt").val());
    });

    $("span.combo").click(function () {
        $(".combo-p").css('z-index', '99999999999');
    });

});

function getData(type,searTxt) {

    $('#categoryList').treegrid({
        url:genAPI('settings/categoryList'),
        idField:'id',
        treeField:'name',
        fit:true,
        loadFilter:function (data) {
            return data.data
        },
        queryParams: {
            typeNum: type,
            query: searTxt||''
        },
        columns:[[
            {field:'name',title:'类别',width:'50%',align:'left'},
            {field:'status',title:'状态',width:'50%',align:'center',formatter: function(value,row,index){
                    if (value=="1"){
                        return "启用";
                    } else {
                        return "禁用";
                    }
                }}
        ]],
        //toolbar:'#btn'
        toolbar:[{
            text:' <div class="input-group">\n' +
            '        <input type="text" id="searTxt" class="form-control" placeholder="请输入分类名称"/>\n' +
            '        <span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span>\n' +
            '      </div>',
            id:'btnSearchId',
            handler:function(){


            }
        },'-',{
            text:'添加',
            iconCls:'fa fa-plus fa-lg',
            handler:function(){
                $("#action_type").val("add");
                var type = $(".active").attr("typeNum");
                if(type=="4"||type=="5"||type=="6"){
                    $(".hidden-class").css("display","none");
                }else{
                    $(".hidden-class").css("display","block");
                }
                $("#pid").combotree({formatter:function(node){
                        return node.name;
                    }});
                $('#pid').combotree('loadData', $('#categoryList').treegrid('getData'));
                layer.open({
                    type: 1,
                    skin: 'layui-layer-molv', //加上边框
                    area: ['500px', '300px'], //宽高
                    content: $('#addCateDialog')
                    ,btn: ['保存', '取消']
                    ,yes: function(index, layero){
                        saveCate();
                        layer.close(index);
                    }
                    ,btn2: function(index, layero){
                        layer.close(index);
                    },
                    end:function () {
                        $("input[name='name']").val("");
                    }
                });
            }
        },'-',{
            text:'编辑',
            iconCls:'fa fa-pencil-square-o fa-lg',
            handler:function(){
                $("#action_type").val("edit");
                $("#pid").combotree({formatter:function(node){
                        return node.name;
                    }});
                $('#pid').combotree('loadData', $('#categoryList').treegrid('getData'));
                var rowSelect=$("#categoryList").treegrid("getSelected");
                console.info(rowSelect);
                if(rowSelect){
                    if(rowSelect.pid){
                        $('#pid').combotree('setValue', rowSelect.pid);
                    }
                    $("input[name='name']").val(rowSelect.name);

                    layer.open({
                        type: 1,
                        skin: 'layui-layer-molv', //加上边框
                        area: ['500px', '300px'], //宽高
                        content: $('#addCateDialog')
                        ,btn: ['保存', '取消']
                        ,yes: function(index, layero){
                            saveCate();
                            layer.close(index);
                        }
                        ,btn2: function(index, layero){
                            layer.close(index);
                        },
                        end:function () {
                            $("input[name='name']").val("");
                        }
                    });
                }else{
                    layer.alert("请选中一行进行编辑",{skin:'layui-layer-molv'});
                }

            }
        },'-',{
            text:'启用',
            iconCls:'fa fa-check-circle fa-lg',
            handler:function(){
                var rowSelect=$("#categoryList").treegrid("getSelected");
                var data = {
                    categoryId:rowSelect.id
                };
                if(rowSelect){
                    $.ajax({
                        type:"post",
                        url:genAPI('settings/unfreezeCategory'),
                        cache:false,
                        dataType:"json",
                        data:JSON.stringify(data),
                        contentType : "application/json;charset=UTF-8",
                        success:function (res) {
                            //console.info(res);
                            if(res.code==200){
                                layer.msg('启用成功');
                                $("#categoryList").treegrid('reload');
                            }else{
                                layer.msg(res.message)
                            }

                        },error:function () {

                        }
                    })

                }else{
                    layer.alert("请选中一行进行选中",{skin:'layui-layer-molv'});
                }
            }
        },'-',{
            text:'禁用',
            iconCls:'fa fa-warning fa-lg',
            handler:function() {
                var rowSelect = $("#categoryList").treegrid("getSelected");
                var data = {
                    categoryId: rowSelect.id
                };
                if (rowSelect) {
                    $.ajax({
                        type: "post",
                        url: genAPI('settings/freezeCategory'),
                        cache: false,
                        dataType: "json",
                        data: JSON.stringify(data),
                        contentType: "application/json;charset=UTF-8",
                        success: function (res) {
                            //console.info(res);
                            if(res.code==200){
                                layer.msg('禁用成功');
                                $("#categoryList").treegrid('reload');
                            }else{
                                layer.msg(res.message)
                            }


                        }, error: function () {

                        }
                    })

                } else {
                    layer.alert("请选中一行进行选中", {skin: 'layui-layer-molv'});
                }
            }
        }]
    });
}

// 新增保存
function saveCate() {
    if($("#name").val()==""){
        layer.msg("请输入组名",{skin:'layui-layer-molv'});
        return false;
    }
    var actionType=$("#action_type").val();
    var url="";
    var data={};
    if(actionType=="add"){
        url=genAPI('settings/addCategory');
        data = {
            typeNum:$(".active").attr("typeNum"),
            name:$("input[name='name']").val(),
            pid:$("#pid").val()
        }
    }else{
        url=genAPI('settings/editCategory');
        var rowSelect=$("#categoryList").treegrid("getSelected");
        data = {
            id: rowSelect.id,
            name:$("input[name='name']").val(),
            pid:$("#pid").val()
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
            //console.info(res);
            if(res.code==200){
                $("#categoryList").treegrid('reload');
            }else{
                layer.msg(res.message)
            }

        },error:function () {

        }

    })
}




