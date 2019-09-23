$(function () {
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }

    });
    // table高度自适应
    var height = $(window).height()-60+"px";
    $("#vendorList").datagrid({
        height : height
    });
    //检索
    $(".btn-search").on("click",function () {
        $("#vendorList").datagrid({
            queryParams:{
                query:$("#searTxt").val(),
                category:$("#pid").val()
            },
        }).datagrid("reload",genAPI('settings/vendorList'));
    });
    //供应商类别
    $("#pids").combotree({
        url:genAPI('settings/categoryList'),
        valueField:'id',
        textField:'name',
        parentField:'pid',
        panelWidth:'200',
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
        queryParams:{
            typeNum:2
        },
        onClick : function(node) {
            //console.log(node);
        },
        onBeforeExpand:function(node,param){

        },
        onLoadSuccess:function(node,data){
            console.info(node);
            console.info(data);
        }

    });

    $("#vendorList").datagrid({
        url:genAPI('settings/vendorList'),
        method:'post',
        fitColumns:true,
        striped:true,
        nowrap:true,
        pagination:true,
        rownumbers:true,
        singleSelect:true,
        loadFilter:function (res) {
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        queryParams:{
            query:$("#searTxt").val(),
            category:$("#pid").val()
        },
        columns:[[
            { field:'category2',title:'供应商类别',hidden:true},
            { field:'code',title:'供应商编号',width:100},
            { field:'name',title:'供应商名称',width:200},
            { field:'contact',title:'首要联系人',width:200},
            { field:'mobile',title:'手机',width:200},
            { field:'phone',title:'座机',width:200},
            { field:'im',title:'QQ/微信/email',width:200,hidden:true},
            { field:'status',title:'状态',width:200,formatter:function (value,row,index) {
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
                $("#editTab").datagrid({data:[]}),
                    $("#pid").val(""),
                    $('#initDate2').datebox('setValue', ""),
                    $("#code").val(""),
                    $("#name").val(""),
                    $("#taxPayerNo").val(""),
                    $("#bank").val(""),
                    $("#cardNo").val(""),
                    $("#receiveFunds2").val(""),
                    $("#periodReceiveFunds2").val(""),
                    $("#taxRate").val(""),
                    $("#note").val();

                $("#action_type").val("add");

                $("#code").attr("readonly",false);

                vendorDialog();
            }
        },'-',{
            text:'修改',
            iconCls:'fa fa-pencil-square-o fa-lg',
            handler:function(){
                $("#action_type").val("edit");

                $("#code").attr("readonly",true);

                var rowSelect = $("#vendorList").datagrid('getSelected');
                if(!rowSelect){
                    layer.alert('请选中一行进行修改',{skin:'layui-layer-molv'});
                    return false;
                }
                var data={
                    "id" : rowSelect.id
                };
                if(rowSelect){
                    vendorDialog();
                    $.ajax({
                        type:"post",
                        url:genAPI('settings/vendorInfo'),
                        cache:false,
                        dataType:"json",
                        data:JSON.stringify(data),
                        contentType : "application/json;charset=UTF-8",
                        success:function (res) {
                            $("#editTab").datagrid({data:res.data.contact});
                            $("#pid").combotree('setValue',rowSelect.category2);
                            $('#initDate2').datebox('setValue', res.data.vendor.initDate2);
                            $("#code").val(res.data.vendor.code);
                            $("#name").val(res.data.vendor.name);
                            $("#taxPayerNo").val(res.data.vendor.taxPayerNo);
                            $("#bank").val(res.data.vendor.bank);
                            $("#cardNo").val(res.data.vendor.cardNo);
                            $("#receiveFunds2").val(res.data.vendor.receiveFunds2);
                            $("#periodReceiveFunds2").val(res.data.vendor.periodReceiveFunds2);
                            $("#taxRate").val(res.data.vendor.taxRate);
                        },error:function () {

                        }
                    })

                }
            }
        }]
    });



});

function vendorDialog() {

    //供应商类别
    $("#pid").combotree({
        valueField:'id',
        textField:'name',
        parentField:'pid',
        panelWidth:'200',
        formatter:function(node){
            return node.name;
        }
    }).combotree('loadData', $("#pids").combotree("tree").tree("getRoots"));

    //联系人
    $('#editTab').datagrid({
        rownumbers : true,
        singleSelect:true,
        pagination:false,
        idField:'id' ,
        columns:[[
            { field:'province',
                title:'省ID',
                hidden:true
            },
            { field:'city',
                title:'市ID',
                hidden:true
            },
            { field:'district',
                title:'区ID',
                hidden:true
            },
            { field:'address',
                title:'详细地址',
                hidden:true
            },
            { field:'provinceName',
                title:'省',
                hidden:true
            },
            { field:'cityName',
                title:'市',
                hidden:true
            },
            { field:'districtName',
                title:'区',
                hidden:true
            },
            { field:'name',
                title:'联系人',
                width : 100,
                hidden:false,
                editor : {
                    type : "validatebox"
                }
            },
            { field:'mobile',
                title:'手机',
                width : 100,
                hidden:false,
                editor : {
                    type : "validatebox",
                }
            },
            { field:'phone',
                title:'座机',
                width : 100,
                hidden:false,
                editor : {
                    type : "validatebox"
                }
            },
            { field:'im',
                title:'QQ/微信/Email',
                width : 100,
                hidden:false,
                editor : {
                    type : "validatebox"
                }
            },
            { field:'contactAddress',
                title:'联系地址',
                width : 100,
                hidden:false,
                formatter: function(value,row,index){
                    var address = row.provinceName + row.cityName + row.districtName;
                    if(address){
                        return address;
                    }
                },
                editor : {
                    type : "textbox",
                    options:{
                        buttonIcon:'fa fa-ellipsis-h fa-lg',
                        buttonAlign:'right',
                        onClickButton:function () {
                            var dd = $(this);
                            var getSelectedRow = $('#editTab').datagrid("getSelected");
                            var gIndex = $('#editTab').datagrid("getRowIndex", getSelectedRow);
                            var value = getSelectedRow.province+","+getSelectedRow.city+","+getSelectedRow.district+","+ getSelectedRow.address;
                            openSelectAddress(value);
                            var sec =  layer.open({
                                type: 1,
                                title:"新增联系地址",
                                skin: 'layui-layer-molv', //加上边框
                                area: ['600px', '388px'], //宽高
                                content: $('#addressDialog')
                                ,btn: ['保存', '取消']
                                ,yes: function(sec, layero){
                                    layer.close(sec);
                                    var provinceId = $("#province").combobox('getValue'),
                                        cityId = $("#city").combobox('getValue'),
                                        districtId = $("#district").combobox('getValue');
                                    getSelectedRow.province = provinceId;
                                    getSelectedRow.city = cityId;
                                    getSelectedRow.district = districtId;
                                    getSelectedRow.provinceName = $("#province").combobox('getText');
                                    getSelectedRow.cityName = $("#city").combobox('getText');
                                    getSelectedRow.districtName = $("#district").combobox('getText');
                                    getSelectedRow.address = $("#detailDistrict").val();
                                    $('#editTab').datagrid('updateRow', {index: gIndex, row: getSelectedRow});
                                    dd.textbox('setValue',getSelectedRow.provinceName+getSelectedRow.cityName+getSelectedRow.districtName+ getSelectedRow.address)

                                }
                                ,btn2: function(sec, layero){
                                    layer.close(sec);
                                }
                            });


                        }

                    }
                }
            },
            { field:'first',
                title:'首要联系人',
                width : 100,
                hidden:false,
                formatter:function(value , record , index){
                    if(value == 1){
                        return '是' ;
                    } else if(value == 0) {
                        return '否' ;
                    }
                } ,
                editor:{
                    type:'combobox' ,
                    options:{
                        data:[{'id':1 , 'val':'是'},{'id':0 , 'val':'否'}] ,
                        valueField:'id' ,
                        textField:'val' ,
                        required:true ,
                        panelHeight:66
                    }
                }
            }

        ]],
        lastFieldFun: function (dg, index, field) {
            console.info(index, field);
            var row = $('#editTab').datagrid('getRows')[index+1];
            if(!row) {
                $('#editTab').datagrid('append', {});
            }
            if (dg.datagrid('endEditing')) {
                dg.datagrid('selectRow', index+1).datagrid('editCell', {
                    index: index+1,
                    field: 'name'
                });
            }

        },
        toolbar:[{
            text:'新增',
            id:'addEdit',
            iconCls:'fa fa-plus fa-flg',
            handler:function () {
                var row = {
                    name:'',
                    mobile:'',
                    phone:'',
                    im:'',
                    province:'',
                    city:'',
                    district:'',
                    contactAddress:'',
                    provinceName:'',
                    cityName:'',
                    districtName:'',
                    address:'',
                    first:''
                };
                $('#editTab').datagrid('append', row);
                var editIndex = $("#editTab").datagrid('getRows').length-1;
                if($('#editTab').datagrid('endEditing')){
                    $('#editTab').datagrid('selectRow', editIndex).datagrid('editCell', {
                        index: editIndex,
                        field: 'name'
                    });
                }

            }
        },'-', {
            text: '删除',
            id:'removeEdit',
            iconCls: 'fa fa-remove fa-lg', handler: function () {
                var row = $("#editTab").datagrid('getSelections');
                if(!row){
                    layer.msg('请选中一行进行操作！')
                }
                if(row.length>0) {
                    var index = layer.confirm('你确定要删除所选记录吗？', {
                        skin: 'layui-layer-molv',
                        btn: ['确定', '取消'] //按钮
                    }, function (target) {
                        if (target) {
                            $('#editTab').datagrid('removeit');
                            layer.close(index);
                        }
                    }, function (index) {
                        layer.close(index)
                    });
                }
            }
        }],
        onBeforeEdit: function (rowIndex, rowData) {
            $('#editTab').datagrid('getColumnOption',rowIndex);
        }

    }).datagrid('enableCellEditing');

    layer.open({
        type: 1,
        title:"供应商详情",
        skin: 'layui-layer-molv', //加上边框
        area: ['680px', '480px'], //宽高
        content: $('#addVendorDialog'),
        btn: ['保存', '取消'],
        yes: function(index, layero){
            //提交保存
            submitCustom();
            layer.close(index);
        }
        ,btn2: function(index, layero){
            layer.close(index);
        }
    });
}

function submitCustom() {
    if($("#code").val()==''){
        layer.alert("供应商编码不能为空");
        return false;
    }
    if($("#name").val()==''){
        layer.alert("供应商名称不能为空");
        return false;
    }
    $("#editTab").datagrid('endEditing');
    var actionType=$("#action_type").val();
    var rowsData = $('#editTab').datagrid('getRows');
    var url="";
    var data={};
    if(actionType == "add"){
        url=genAPI('settings/addVendor');

        data = {
            code:$("#code").val(),
            name:$("#name").val(),
            category2:$("#pid").val(),
            initDate2:$("#initDate2").val(),
            taxPayerNo:$("#taxPayerNo").val(),
            bank:$("#bank").val(),
            cardNo:$("#cardNo").val(),
            receiveFunds2:$("#receiveFunds2").val(),
            periodReceiveFunds2:$("#periodReceiveFunds2").val(),
            taxRate:$("#taxRate").val(),
            contact:rowsData,
            note:$("#note").val()
        };
    }else{
        var rowSelect=$("#vendorList").datagrid("getSelected");
        url=genAPI('settings/editVendor');
        data={
            id:rowSelect.id,
            code:$("#code").val(),
            name:$("#name").val(),
            category2:$("#pid").val(),
            initDate2:$("#initDate2").val(),
            taxPayerNo:$("#taxPayerNo").val(),
            bank:$("#bank").val(),
            cardNo:$("#cardNo").val(),
            receiveFunds2:$("#receiveFunds2").val(),
            periodReceiveFunds2:$("#periodReceiveFunds2").val(),
            taxRate:$("#taxRate").val(),
            contact:rowsData,
            note:$("#note").val()
        };
    }

    $.ajax({
        type:"POST",
        url:url,
        async:true,
        contentType:"application/json",
        data:JSON.stringify(data),
        success:function(res){
            if(res.code=='200'){
                layer.msg("保存成功！");
                $('#vendorList').datagrid('reload');
            }else{
                layer.msg(res.message)
            }
        }
    });
}

function openSelectAddress(value){ //打开地址
    var ids;
    if (value){
        ids = value.split(',');
    }
    var url = genAPI('settings/district');

    $('#city').combobox('loadData', {data:[]});
    $('#district').combobox('loadData', {data:[]});
    // 省
    $("#province").combobox({
        url: url+"?key=0",
        valueField: 'id',
        textField: 'fullname',
        cache: false,
        editable: false, //只读
        loadFilter:function (res) {
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        onSelect:function(record){
            if(record.cidx){
                $('#city').combobox('reload',url+"?key=1&start="+record.cidx[0]+"&end="+record.cidx[1]);
                $('#city').combobox('options').url=null;
            }

        },
        onLoadSuccess: function () {
            if(ids && ids[0]){
                $("#province").combobox("select", ids[0]);
            }
        }
    });
    $("#city").combobox({
        valueField: 'id',
        textField: 'fullname',
        cache: false,
        editable: false,
        loadFilter:function (res) {
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        onSelect:function(record){
            $('#district').combobox('clear');
            if(record.cidx){
                $('#district').combobox('reload',url+"?key=2&start="+record.cidx[0]+"&end="+record.cidx[1]);
                $('#district').combobox('options').url=null;
            }

        },
        onLoadSuccess: function () {
            if(ids && ids[1]){
                $("#city").combobox("select", ids[1]);
            }
        }
    });
    $("#district").combobox({
        valueField: 'id',
        textField: 'fullname',
        cache: false,
        editable: false,
        loadFilter:function (res) {
            if(res.code == 200) {
                return res.data
            } else {
                layer.msg(res.message);
                return [];
            }
        },
        onLoadSuccess: function () {
            if(ids && ids[2]){
                $("#district").combobox("select", ids[2]);
            }
        }
    });
    $("#detailDistrict").val(ids[3] || "");
}







