function refreshNum() {
    $.ajax({
        type:"POST",
        url:genAPI('settings/getBaseNextNo'),
        data:{
            type:14
        },
        cache: false,
        dataType: "json",
        success:function (res) {
            if(res.code==200){
                $("#number_span").html(res.data.number);
                $("#number").val(res.data.number)
            }
        }
    });
}
$(function () {
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }
    });
    refreshNum();
    $('#customerName').customerPanel({
        type:'customer',
        el: "#customer",
        onSelected: function (tar, row) {
            console.info(row);
        }
    });
    $("#payee").combobox({
        url: genAPI('user/comboList'),
        valueField: 'uid',
        textField: 'realName',
        cache: false,
        editable: false,
        loadFilter:function (res) {
            if(res.code == 200){
                return res.data
            } else {
                layer.msg(res.message);
            }
        }
    });
});