interface MyDraw{
    canvas:HTMLCanvasElement
    image:ImageBitmap
    pattern:OffscreenCanvas|HTMLCanvasElement
    scale?:number
    fit?:'contain'|'cover'
    pos?:[number,number]
}

const c = (ori:number, w:number) => {
    return Math.floor((ori - w) / 2)
}

export const initPattern = () => {
    const off = new OffscreenCanvas(20, 20)
    const tempCtx = off.getContext('2d') as OffscreenCanvasRenderingContext2D
    tempCtx.fillStyle = 'rgb(200, 200, 200)'
    tempCtx.fillRect(0, 0, off.width / 2, off.height / 2)
    tempCtx.fillRect(off.width / 2, off.height / 2, off.width / 2, off.height / 2)
    tempCtx.fillStyle = 'ghostwhite'
    tempCtx.fillRect(off.width / 2, 0, off.width / 2, off.height / 2)
    tempCtx.fillRect(0, off.height / 2, off.width / 2, off.height / 2)
    return off
}

export const draw = (obj:MyDraw) => {
    const ctx = obj.canvas.getContext('2d')
    if(!ctx) return obj.scale ?? 1
    if(!obj.pos) obj.pos = [0, 0]
    let {width, height} = obj.canvas
    let {width:imgw, height:imgh} = obj.image
    let scale = obj.scale
    if(!scale){
        if(obj.fit === 'contain'){
            scale = Math.min(width / imgw, height / imgh) 
        } else if(obj.fit === 'cover'){
            scale = Math.max(width / imgw, height / imgh) 
        } else {
            scale = 1
        }
    }
    const pa = ctx.createPattern(obj.pattern, 'repeat')

    ctx.fillStyle = pa ?? 'white'
    ctx.fillRect(0, 0, width, height)
    const source = [0, 0, imgw, imgh] as [number, number, number, number]
    const pos = [0, 0, width, height] as [number, number, number, number]
    if(imgw * scale > width){
        source[0] = Math.floor((imgw - width / scale) / 2)
        source[2] = Math.floor(width / scale)
    } else{
        pos[0] = Math.floor((width - imgw * scale) / 2)
        pos[2] = Math.floor(imgw * scale)
    }
    if(imgh * scale > height){
        source[1] = Math.floor((imgh - height / scale) / 2)
        source[3] = Math.floor(height / scale)
    } else{
        pos[1] = Math.floor((height - imgh * scale) / 2)
        pos[3] = Math.floor(imgh * scale)
    }
    ctx.drawImage(obj.image, ...source, ...pos)
    return scale
}