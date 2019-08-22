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
// 客户选择面板
;(function($) {
    function init(target, opts) {

    };
    $.fn.customerPanel.defaults = {};
    $.fn.customerPanel = function(opts, param) {
        if (typeof opts === 'string') {
            var method = $.fn.customerPanel.methods[opts];
            if (method) {
                return method(this, param);
            }
        } else {
            opts = $.extend({}, $.fn.customerPanel.defaults, opts || {} );
            return this.each(function () {
                init( this, opts);
            });
        }
    };
})(jquery)
$(function () {
    $.ajaxSetup({
        headers:{
            uid:$.cookie('uid'),
            token:$.cookie('jwt')
        }

    });
    refreshNum();
    $('#customerName').click(function () {
        $('#customer').customerPanel('customer');

    })
});