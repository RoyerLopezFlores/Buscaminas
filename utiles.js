function createArray2d(rows,columns){
    var x = new Array(rows);
    for(let i =0;i<rows;i++){
        x[i]= new Array(columns);
    }
    return x;
}
function createArray2dCeros(rows,columns){
    var x = new Array(rows);
    for(let i =0;i<rows;i++){
        x[i]= new Array(columns).fill(0);
    }
    return x;
}
function mousePosition(element,evt){
    const clientRect = element.getBoundingClientRect();
    return{
        x: Math.round(evt.clientX - clientRect.left),
        y: Math.round(evt.clientY- clientRect.top)
    }
}