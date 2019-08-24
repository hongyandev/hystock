$.extend($.fn.datagrid.methods, {
    statistics: function(jq) {
        //所有的列
        var opt = $(jq).datagrid('options').columns;
        //所有的行
        var rows = $(jq).datagrid("getRows");
        //debugger;
        var footer = new Array();
        footer['sum'] = "";
        for (var i = 0; i < opt[0].length; i++) {
            var s = opt[0][i].heji;
            console.info(s);
            //给需要合计计算的列定义合计属性，并且设置其计算规则，以下代码直接用eval函数执行计算规则，算出结果，暂时封了以下sum、avg、min、max四个函数，特殊需求自己加。
            //例如columnA的合计是columnA的值相加(定义为：{field: 'columnA', title: 'A', width: 120,heji: 'sum("columnA")'},其heji属性就是你要计算合计的方法实现)，
            //columnB的合计是columnB的平均值(定义为：{field: 'columnB', title: 'B', width: 120,heji: 'avg("columnB")'},其heji属性就是你要计算合计的方法实现)，
            //columnC的合计是columnA的合计除以columnB的合计(定义为：{field: 'columnC', title: 'C', width: 120,heji: '(sum("columnA")/avg("columnB"))'},其heji属性就是你要计算合计的方法实现)
            if (opt[0][i].heji) {
                footer['sum'] = footer['sum'] +'"' + opt[0][i].field + '":"' + eval(opt[0][i].heji) +'"' + ',';
            }
        }
        var footerObj = new Array();
        if (footer['sum'] != "") {
            var tmp = '{' + footer['sum'].substring(0, footer['sum'].length - 1) + "}";
            var obj = eval('(' + tmp + ')');
            if (obj[opt[0][0].field] == undefined) {
                footer['sum'] += '"' + opt[0][0].field + '":"合计:"';//第0列显示为合计
                obj = eval('({' + footer['sum'] + '})');
            } else {
                obj[opt[0][0].field] = "<b>合计:</b>" + obj[opt[0][0].field];
            }
            footerObj.push(obj);
        }
        if (footerObj.length > 0) {
            console.info(footerObj);
            $(jq).datagrid('reloadFooter', footerObj);
        }
        function sum(filed){
            var sumNum = 0;
            for(var i=0;i<rows.length;i++){
                if(isNaN(Number(rows[i][filed])))
                    continue;
                sumNum += Number(rows[i][filed]);
            }
            return sumNum.toFixed(2);
        }

        function avg(filed){
            var sumNum = 0;
            for(var i=0;i<rows.length;i++){
                if(isNaN(Number(rows[i][filed])))
                    continue;
                sumNum += Number(rows[i][filed]);
            }
            return (sumNum/rows.length).toFixed(2);
        }

        function max(filed){
            var max = 0;
            for(var i=0;i<rows.length;i++){
                if(i==0){
                    if(isNaN(Number(rows[i][filed])))
                        continue;
                    max = Number(rows[i][filed]);
                }else{
                    if(isNaN(Number(rows[i][filed])))
                        continue;
                    max = Math.max(max,Number(rows[i][filed]));
                }
            }
            return  max ;
        }

        function min(filed){
            var min = 0;
            for(var i=0;i<rows.length;i++){
                if(i==0){
                    if(isNaN(Number(rows[i][filed])))
                        continue;
                    min = Number(rows[i][filed]);
                }else{
                    if(isNaN(Number(rows[i][filed])))
                        continue;
                    min = Math.min(min,Number(rows[i][filed]));
                }
            }
            return  min ;
        }
    }
});