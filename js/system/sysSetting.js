
$(function () {
    $.ajaxSetup({
        headers: {
            uid: $.cookie('uid'),
            token: $.cookie('jwt')
        }
    });
    $.ajax({
        type: "post",
        url: genAPI('settings/getSystemParams'),
        cache: false,
        dataType: "json",
        success:function (res) {
            if(res.code=='200'){
                $("#sysid").val(res.data.id);
                $("#companyName").val(res.data.companyName);
                $("#companyAddress").val(res.data.companyAddress);
                $("#companyTel").val(res.data.companyTel);
                $("#companyFax").val(res.data.companyFax);
                $("#postcode").val(res.data.postcode);
                $("#startDate").val(moment(res.data.startDate).format('L'));
                $("#billRequiredCheck option[value='" + res.data.billRequiredCheck + "']").attr("selected", true);
                $("#tax").val(res.data.tax);
            }
        }
    })
});
function saveSysinfo() {
    var data={
             id:$("#sysid").val(),
    companyName:$("#companyName").val(),
 companyAddress:$("#companyAddress").val(),
     companyTel:$("#companyTel").val(),
     companyFax:$("#companyFax").val(),
       postcode:$("#postcode").val(),
billRequiredCheck:$("#billRequiredCheck").val(),
            tax:$("#tax").val()
    }
    $.ajax({
        type:"POST",
        url:genAPI('settings/saveSystemParams'),
        async:true,
        contentType:"application/json",
        data:JSON.stringify(data),
        success:function(res){
            if(res.code=='200'){
                layer.msg("保存成功！");
            }else{
                layer.msg(res.message)
            }
        }
    });
}

