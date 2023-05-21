const root = document.getElementById("root");
const canvas = document.createElement("canvas");
const width = 600;
const height = 400;
canvas.height=height;
canvas.width = width;
root.append(canvas);
const context = canvas.getContext("2d");
context.fillStyle = "black";
context.fillRect(0,0,width,height);
const wg =20;
const nw = Math.floor(width/wg);
const nh = Math.floor(height/wg);
const ncell = nh*nw;
context.strokeStyle = "white";
function mousePosition(element,evt){
    const clientRect = element.getBoundingClientRect();
    return{
        x: Math.round(evt.clientX - clientRect.left),
        y: Math.round(evt.clientY- clientRect.top)
    }
}
class Bloque{
    constructor({x,y,wg,color = "white"}){
        this.x = x;
        this.y = y;
        this.wg = wg;
        this.color = color;
        this.type = "normal";
        this.bg = "black";
        this.click = false;
        this.band = false;
        this.changeBand = false;
    }
    draw(context){
        
        context.save();
        context.strokeStyle = "red";
        context.translate(this.x+1,this.y+1);
        context.strokeRect(0,0,this.wg-2,this.wg-2);
        context.restore();
    }
    drawNoClick(context){
        
        context.save();
        context.strokeStyle = "cyan";
        context.translate(this.x,this.y);
        context.strokeRect(0,0,this.wg-3,this.wg -3);
        context.restore();
    }
    drawLimpiar(context){
        context.save();
        context.fillStyle = this.bg;
        context.translate(this.x-1, this.y-1);
        context.fillRect(0,0,this.wg,this.wg);
        context.restore();
    }
    drawBand(context){
        context.save();
        context.fillStyle = "white";
        context.font = `${this.wg - 2}px Arial`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        
        context.translate(this.x + this.wg/2,this.y+ this.wg/2);
        context.fillText("b",0,0);
        context.restore();
    }
}
class BloqueBomba extends Bloque{
    constructor({x,y,wg,color="white",cb="yellow"}){
        super({x,y,wg,color});
        this.cb = cb;
        this.radio  = Math.floor(wg/2);
        this.type = "bomba";

    }
    draw(context){
        
        context.save();
        context.strokeStyle = this.cb;
        context.translate(this.x + this.radio-1,this.y + this.radio-1);
        context.beginPath();
        context.arc(0,0,this.radio-4,0,Math.PI*2);
        context.stroke();
        context.restore();
    }
    drawRed(context){
        context.save();
        context.fillStyle = "red";
        context.translate(this.x,this.y);
        context.fillRect(0,0,this.wg,this.wg);
        context.restore();
    }
}
class BloqueResguard extends Bloque{
    constructor({x,y,wg,text,color="white"}){
        super({x,y,wg,color});
        this.txt = text;
        this.type = "resguard";
    }
    draw(context){
        
        context.save();
        context.fillStyle=this.color;
        context.font = `${this.wg-1}px Arial`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.translate(this.x + this.wg/2,this.y+ this.wg/2);
        context.fillText(this.txt,0,0);
        context.restore();

    }
}
const colores = "blue,green,red,violet,yellow,white,aqua,lime".split(",");
class BloqueNum extends BloqueResguard{
    constructor({x,y,wg,num,color="white"}){
        super({x,y,wg,num,color});
        this.type = "numero";
        this.num = num;
        this.txt = ""+num;
        this.color=colores[(this.num-1)%colores.length];
    }
}
let numBombas = 0;
let bloques;

const getAdyacentes = (i,ncell,nw) =>{
    return [i-nw, i , i + nw].flatMap(e=>{
        const listPos = [];
        if(e>=0 && e<ncell && e!=i) listPos.push(e);
        if(Math.floor((e+1)/nw) == Math.floor(e/nw) && e<ncell && e>=0) listPos.push(e+1);
        if(Math.floor((e-1)/nw) == Math.floor(e/nw) && e>=0 && e<ncell) listPos.push(e-1);
        return listPos;
    })
}



const getPositionBloque = (bloque,wg,nw)=>{
    return Math.floor(bloque.x/wg) + Math.floor(bloque.y/wg)*nw;
}

let gameover = false;
const restarGame = () =>{
    gameover = false;
    context.fillStyle = "black";
    context.fillRect(0,0,width,height);
    bloques = Array.from({length:ncell}, (_,i) =>{
        const y = Math.floor(i/nw)*wg;
        const x = i%nw*wg;
        const nrand = Math.random();
    
        if (0.85<nrand){
            numBombas ++;
            return new BloqueBomba({x,y,wg});
        }
        return new Bloque({x,y,wg});
        
    });
    bloques.forEach((element,i) => {
        const ady = getAdyacentes(i,ncell,nw);
        const num = ady.reduce((prev,curr)=>{
            if(curr<0 || curr >= ncell) return prev;
            if(bloques[curr].type == "bomba") return prev+1;
            return prev;
        },0)
        if(num>0 && element.type != "bomba") bloques[i] = new BloqueNum({x:element.x,y:element.y,wg:wg,num});
        bloques[i].drawNoClick(context);
        
    });
}
restarGame();
canvas.onclick = (evt)=>{
    if(gameover) return;
    const pos = mousePosition(canvas,evt);
    let i = Math.floor(pos.x/wg) + Math.floor(pos.y/wg)*nw;
    
    
    if(bloques[i].changeBand){
        bloques[i].band = false;
        bloques[i].changeBand = false;
        return;
    }
    if(bloques[i].band) return;
    if(bloques[i].type == "bomba"){
        gameover = true;
        bloques.forEach(e=>{
            if(e.type=="bomba"){
                e.drawLimpiar(context);
                e.draw(context);
                if(e.band) e.drawBand(context);
                
            }
        })
        bloques[i].drawRed(context);
        bloques[i].draw(context);
        return;
    }

    
    bloques[i].click = true;

    if(bloques[i].type != "normal"){
        
        bloques[i].drawLimpiar(context);
        bloques[i].draw(context);
        return;
    }
    const pila = [bloques[i]];
    const listaVisibles = []
    while (pila.length>0){
        i = getPositionBloque(pila.shift(),wg,nw);
        listaVisibles.push(i);
        const ady = getAdyacentes(i,ncell,nw);
        listaVisibles.push(...ady);
        ady.forEach(e=>{
            if(bloques[e].band) return;
            if(bloques[e].type=="normal" && !bloques[e].click) {
                bloques[e].click = true;
                pila.push(bloques[e])
            };
        });
    }
    listaVisibles.forEach(e=>{
        if(bloques[e].band) return;
        bloques[e].drawLimpiar(context);
        bloques[e].draw(context);
        bloques[e].click = true;
    })
    
    
    
    
};
var timer;
canvas.onmousedown = (evt) =>{
    if(gameover) return;
    const pos = mousePosition(canvas,evt);
    let i = Math.floor(pos.x/wg) + Math.floor(pos.y/wg)*nw;
    timer = setTimeout(() =>{
        if(bloques[i].click) return;
        if(bloques[i].band){
            bloques[i].changeBand = true;
            bloques[i].drawLimpiar(context);
            bloques[i].drawNoClick(context);
            return;
        }
        bloques[i].band = true;
        bloques[i].drawLimpiar(context);
        bloques[i].drawBand(context);
    },500);
};
canvas.onmouseup = () =>{
    if(gameover) return;
    clearTimeout(timer);
    
};

//for(let i=0;i<ncell;i++){
//    context.save();
//    context.translate(x,y);
//    context.strokeRect(0,0,wg-3,wg-3);
//    context.restore();
//}
