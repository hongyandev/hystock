$(function () {
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }
    });

    var dg = $("#impTable").datagrid({
        pagination: false,
        rownumbers: true,
        fitColumns: false,
        showFooter: true,
        method: 'post',
        fit: true,
        columns : [[
            {
                field : '导入错误',
                title : '导入错误原因',
                align : 'center',
                width:100
            },
            {
                field : '商品编码',
                title : '商品编码',
                align : 'center',
                width:100
            },
            {
                field : '鸿雁产品代码',
                title : '鸿雁产品代码',
                align : 'center',
                width:100
            },
            {
                field : '商品名称',
                title : '商品名称',
                align : 'center',
                width:100
            },
            {
                field : '规格型号',
                title : '规格型号',
                align : 'center',
                width:100
            },
            {
                field : '商品类别',
                title : '商品类别',
                align : 'center',
                width:150
            },
            {
                field : '计量单位',
                title : '计量单位',
                align : 'center',
                width:100
            },
            {
                field : '零售价',
                title : '零售价',
                align : 'center',
                width:100
            },
            {
                field : '批发价',
                title : '批发价',
                align : 'center',
                width:100
            },
            {
                field : 'purPrice',
                title : '采购价',
                align : 'center',
                width:100
            },
            {
                field : '仓库号',
                title : '仓库号',
                align : 'center',
                width:100
            },
            {
                field : '期初库存',
                title : '期初库存',
                align : 'center',
                width:100
            },
            {
                field : '单位成本',
                title : '单位成本',
                align : 'center',
                width:100
            },
            {
                field : '最大预警库存',
                title : '最大预警库存',
                align : 'center',
                width:100
            },
            {
                field : '最小预警库存',
                title : '最小预警库存',
                align : 'center',
                width:100
            }
        ]],
        toolbar:[{
            text:'导出',
            iconCls:'fa fa-download fa-lg',
            handler:function(){
                dg.datagrid('toExcel',"未导入成功的商品列表");
            }
        }]
    });
    $("#file").on("change",function () {
        $(".importtemp span").html($('#file')[0].files[0].name);
    });
    $("#imptemp").on("click",function () {
        var formData = new FormData();
        formData.append('file', $('#file')[0].files[0]);
        var loading = layer.load(1, {
            shade: [0.1,'#fff'] //0.1透明度的白色背景
        });
        $.ajax({
            type: "post",
            url: genAPI('goods/importGoods'),
            cache: false,
            dataType: "json",
            data:formData,
            processData: false,
            contentType: false,
            success: function (res) {
                //console.info(res);
                layer.close(loading);
                if(res.code==200){
                    layer.msg('导入成功');
                    if(res.data.failure.length){
                        $('.impTable').show();
                        dg.datagrid("resize");
                        dg.datagrid('loadData', res.data.failure);
                    }
                }else{
                    layer.msg(res.message)
                }

            }, error: function () {

            }
        })
    })
});