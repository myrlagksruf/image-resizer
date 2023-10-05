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

const SIZE = 20

export const initPattern = () => {
    const off = new OffscreenCanvas(SIZE, SIZE)
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
    let pos = obj.pos
    if(!pos) pos = [0, 0]
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
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.setTransform(scale, 0, 0, scale, pos[0] * scale + width / 2, pos[1] * scale + height / 2)
    const pa = ctx.createPattern(obj.pattern, 'repeat')
    ctx.fillStyle = pa ?? 'white'
    ctx.fillRect(- width / 2 / scale - pos[0], - height / 2 / scale - pos[1], width / scale, height / scale)
    ctx.drawImage(obj.image, 0, 0, imgw, imgh, Math.floor(- imgw / 2), Math.floor(- imgh / 2), imgw, imgh)
    return scale
}