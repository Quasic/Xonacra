/* readArcanox.js
 * Handles Arcanox.apk like a graphics pack
 * (C)opyright Junglefowl of Arcanox
 * Released under GPL v3
 *
 * Usage: readArcanox(apk,list,hook)
 * apk is a file object for Arcanox.apk
 * list is an object with following optional properties:
 *  assets:[assetnames]
 *    known assetnames: "background","dungeon_map","gui","ingame","island"
 *  if list is omitted, all known parts will be loaded
 * hook is called as follows after each part is loaded:
 * hook(key,atlasToDiv,bgDiv,atlas)
 * key tells which part has loaded
 *  for assets, key is "assets/_"+assetname
 * atlasToDiv(div,key) sets asset named by key as the background of div, animating it if it has indicies
 * bgDiv(div,atlas entry) sets the div background according to the atlas information
 * atlas is an object that holds all atlas information
 * */
function readArcanox(apk,list,hook){
	if(!list)list={
		assets:["background","dungeon_map","gui","ingame","island"]
	};
var atlas={};
	function reply(k){hook(k,atlasToDiv,bgDiv,atlas)}

function commasplit2kn(s,o,x,y){
	var a=s.split(",");
	o[x]=+a[0];
	o[y]=+a[1];
}
function atlasToDiv(div,k){
	if(div.atlasAnimationInterval){
		clearInterval(div.atlasAnimationInterval);
		div.atlasAnimationInterval=false;
	}
	if(atlas[k].length>0){
		var i=1,f=function(){
			bgDiv(div,atlas[k][++i<atlas[k].length?i:i=1]);
		};
		bgDiv(div,atlas[k][1]);
		div.atlasAnimationInterval=setInterval(f,100);
	}else bgDiv(div,atlas[k]);
};
function bgDiv(div,o){
	div.style.backgroundImage="url('"+o.src+"')";
	div.style.backgroundSize=o.bx+"px "+o.by+"px";
	div.style.backgroundRepeat="repeat";
	div.style.backgroundPosition=(o.bx-o.x)+"px "+(o.by-o.y)+"px";
	div.style.width=o.sx+"px";div.style.height=o.sy+"px";
	div.style.margin=o.ox+"px "+o.oy+"px";
};
    if (apk) {
        var reader = new FileReader();
        
        reader.onload = function(event) {
            JSZip.loadAsync(event.target.result).then(function(zip) {
		    if(list.assets&&list.assets.length>0)list.assets.forEach(function(b){
			    var p="assets/_"+b,
			       f=zip.file(p+".png");
			    if(f)f.async("arraybuffer").then(function(imageData){
				    var u=URL.createObjectURL(new Blob([imageData.slice(16)],{type:"image/png"})),
					    af=p+".atlas",
					    f=zip.file(af);
				    if(f)f.async("text").then(function(text){
					    var i=0,k,kv,o,xy,
						    line=text.split("\n");
					    if(line[i]!="")console.error(af+" doesn't start with a blank line");
					    else i++;
					    if("_"+b+".png"!=line[i])return console.error(af+" seems to be for "+text[1]+" instead of _"+b+".png");
					    i++;
					    while(i<line.length&&(kv=line[i].split(":")).length>1){
						    if(kv[0]=="size")xy=kv[1];
						    i++;
					    }
					    while(i<line.length){
					       k=line[i++];
					       o={src:u};
					       commasplit2kn(xy,o,"bx","by");
					       while(i<line.length&&(kv=line[i].split(":")).length>1){
						       kv[0]=kv[0].replace(/^ +/,"");
						       if("index"==kv[0]){
							       if(kv[1]>0)o.index=+kv[1];
						       }else if("xy"==kv[0])commasplit2kn(kv[1],o,"x","y");
						       else if("size"==kv[0])commasplit2kn(kv[1],o,"sx","sy");
						       else if("offset"==kv[0])commasplit2kn(kv[1],o,"ox","oy");
						       else if("rotate"==kv[0]&&!kv[1].match(/^ *false$/))console.error("rotate "+kv[1]+" not supported for "+af+" line "+i)
						       i++;
					       }
						    if(o.index>0){
							    //ascending order animation
							    if(!(k in atlas))atlas[k]=[];
							    atlas[k][o.index]=o;
						    }else atlas[k]=o;
					    }
					    reply(p);
				    });
			    	else console.error(p+".atlas not found in apk!");
			    });
			    else console.error(p+".png not found in apk!");
		    });
		    //sounds, etc.
                });
            };
        };
        
        reader.readAsArrayBuffer(apk);
}
