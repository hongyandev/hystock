(function($){
    $.extend($.fn.datagrid.methods, {
        endEditing: function (jq) {
            return jq.each(function(){
                var opts = $(this).datagrid('options');
                if (opts.editIndex == undefined){return true}
                if ($(this).datagrid('validateRow', opts.editIndex)){
                    $(this).datagrid('endEdit', opts.editIndex);
                    opts.editIndex = undefined;
                    return true;
                } else {
                    return false;
                }
            })
        },
        append: function(jq, row) {
            jq.each(function(){
                var dg = $(this);
                var opts = dg.datagrid('options');
                if (dg.datagrid('endEditing')) {
                    dg.datagrid('appendRow', row);
                    opts.editIndex = dg.datagrid('getRows').length-1;
                    var fields = dg.datagrid('getColumnFields',true).concat(dg.datagrid('getColumnFields'));
                    dg.datagrid('selectRow', opts.editIndex).datagrid('editCell', {
                        index: opts.editIndex,
                        field: fields[0]
                    });
                }
            })
        },
        removeit: function(jq) {
            jq.each(function(){
                var opts = $(this).datagrid('options');
                if (opts.editIndex == undefined){return}
                $(this).datagrid('cancelEdit', opts.editIndex)
                    .datagrid('deleteRow', opts.editIndex);
                opts.editIndex = undefined;
            })
        },
        editCell: function (jq, param) {
            return jq.each(function(){
                var dg = $(this);
                var opts = dg.datagrid('options');
                opts.editIndex = param.index;
                var fields = dg.datagrid('getColumnFields',true).concat(dg.datagrid('getColumnFields'));
                //console.info(fields);
                var colNum;
                for(var i=0; i<fields.length; i++){
                    var col = dg.datagrid('getColumnOption', fields[i]);
                    col.editor1 = col.editor;
                    if (fields[i] != param.field){
                        col.editor = null;
                    } else {
                        colNum = i;
                    }
                }
                dg.datagrid('beginEdit', param.index);
                var ed = dg.datagrid('getEditor', param);
                if (ed){
                    var target = $(ed.target);
                    if($(ed.target).hasClass('textbox-text')){
                        target.focus();
                    }else if ($(ed.target).hasClass('textbox-f')){
                        target.textbox('textbox').focus();
                    }else{
                        target.focus();
                    }

                    $('.datagrid-editable .textbox,.datagrid-editable .datagrid-editable-input,.datagrid-editable .textbox-text,.datagrid-cell-c5-contactAddress .textbox-text').bind('keydown', function(e){
                        var code = e.keyCode || e.which;
                        var opts = dg.datagrid('options');
                        var mark = true;
                        if (ed.type == "validatebox") {
                            var eventFun = $(ed.target).validatebox("options").eventFun;
                            if (eventFun) {
                                mark = eventFun($(this).val(),e);
                            }
                        }
                        if(code == 13 && mark) {
                            var nextColNum = colNum + 1;
                            var nextField = dg.datagrid('getColumnOption', fields[nextColNum]);
                            //console.info(nextField);
                            while(nextColNum ++, nextColNum < fields.length && nextField.editor == undefined){
                                nextField = dg.datagrid('getColumnOption', fields[nextColNum]);
                            }
                            if(nextField == null){
                                if(opts.lastFieldFun != undefined) {
                                    opts.lastFieldFun(dg, param.index, fields[0]);
                                }
                            }else if(nextField.editor != undefined){
                                opts.onClickCell.call(dg, param.index, nextField.field)
                            }
                        }
                    });
                }
                for(var i=0; i<fields.length; i++){
                    var col = dg.datagrid('getColumnOption', fields[i]);
                    col.editor = col.editor1;
                }
            });
        },
        enableCellEditing: function(jq){
            return jq.each(function(){
                var dg = $(this);
                var opts = dg.datagrid('options');
                if(!opts.oldOnClickCell) {
                    opts.oldOnClickCell = opts.onClickCell;
                }
                opts.onClickCell = function(index, field){
                    if (opts.editIndex != undefined){
                        if (dg.datagrid('validateRow', opts.editIndex)){
                            dg.datagrid('endEdit', opts.editIndex);
                            opts.editIndex = undefined;
                        } else {
                            return;
                        }
                    }
                    dg.datagrid('selectRow', index).datagrid('editCell', {
                        index: index,
                        field: field
                    });
                    opts.editIndex = index;
                    opts.oldOnClickCell.call(this, index, field);
                }
            });
        },
        statistics: function(jq, fields) {
            return jq.each(function(){
                var dg = $(this);
                var data = dg.datagrid("getData");
                if(!data.footer){
                    data.footer = [{"isFooter":true}];
                }
                var rows = dg.datagrid('getFooterRows');
                if(data.rows){
                    $.each(fields, function (i, field) {
                        var sum = 0;
                        $.each(data.rows, function(i, n){
                            sum = accAdd(sum,n[field]||0);
                        });
                        rows[0][field] = intToFloat(Number(String(sum).replace(/^(.*\..{4}).*$/,"$1")));
                    })
                }
                dg.datagrid("reloadFooter");
            })
        },
        addEditor : function(jq, param) {
            if (param instanceof Array) {
                $.each(param, function(index, item) {
                    var e = $(jq).datagrid('getColumnOption', item.field);
                    e.editor = item.editor; });
            } else {
                var e = $(jq).datagrid('getColumnOption', param.field);
                e.editor = param.editor;
            }
        },
        removeEditor : function(jq, param) {
            if (param instanceof Array) {
                $.each(param, function(index, item) {
                    var e = $(jq).datagrid('getColumnOption', item);
                    e.editor = {};
                });
            } else {
                var e = $(jq).datagrid('getColumnOption', param);
                e.editor = {};
            }
        }
    });
})(jQuery);