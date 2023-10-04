import type { MetaFunction } from "@remix-run/node";
import { useEffect, useRef, useState } from "react";
import { draw, initPattern } from "~/lib/image";
import { selectObj } from "~/lib/select";

export const meta: MetaFunction = () => {
  return [
    { title: "Image Resizer" },
    { name: "description", content: "이미지의 크기 변경하는 사이트" },
  ];
};

const IMAGE_NOT_LOADING = 0,
      IMAGE_LOADING = 1,
      IMAGE_LOADED = 2

const VERTICAL = 0,
      HORIZONTAL = 1,
      ALLWAY = 2

const getPos = (obj:{elm:HTMLCanvasElement, x:number, y:number}) => {
  const { elm, x, y } = obj
  const { width, height } = getComputedStyle(elm)
  const w = parseFloat(width)
  const h = parseFloat(height)
  const tempScale = Math.max(elm.width / w, elm.height / h)
  return [tempScale * x, tempScale * y]
}

export default function Index() {
  const [isEnter, setIsEnter] = useState(false)
  const [loading, setLoading] = useState(IMAGE_NOT_LOADING)
  const [select, setSelect] = useState<[keyof typeof selectObj, number]>(['Instagram', 0])
  const [scale, setScale] = useState(1)
  const [scaleFit, setScaleFit] = useState<'contain'|'cover'|''>('')
  const [mouseInfo, setMouseInfo] = useState({
    isDown:false,
    isFirst:false,
    way:ALLWAY,
    pos:[0, 0]
  })
  const [curPos, setCurPos] = useState<[number,number]>([0, 0])
  const img = useRef<ImageBitmap>()
  const canvas = useRef<HTMLCanvasElement>(null)
  const pattern = useRef<OffscreenCanvas>()
  
  const getImageData = async (file:Blob) => {
    const temp = await createImageBitmap(file)
    img.current = temp
    setLoading(IMAGE_LOADED)
    setScale(1)
  }

  const Enter: React.DragEventHandler<HTMLDivElement> = e => {
    if (e.currentTarget === e.target) {
      setIsEnter(true)
    }
  }
  const Leave: React.DragEventHandler<HTMLDivElement> = e => {
    if (e.currentTarget === e.target) {
      setIsEnter(false)
    }
  }
  const End: React.DragEventHandler<HTMLDivElement> = e => {
    e.preventDefault()
    setIsEnter(false)
  }
  const Drop = (files:FileList|null) => {
    if (!files || files.length === 0 || loading === IMAGE_LOADING) return
    const file = files[0]
    if (!file.type.startsWith('image')) return
    setLoading(IMAGE_LOADING)
    getImageData(file)
  }

  useEffect(() => {
    const resize = () => {
      if(!canvas.current || !img.current || !pattern.current) return
      setScale(draw({canvas:canvas.current,image:img.current,pattern:pattern.current,scale}))
    }
    pattern.current = initPattern()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])
  
  useEffect(() => {
    if(loading !== IMAGE_LOADED) return
    if(!canvas.current || !img.current || !pattern.current) return
    draw({
      canvas:canvas.current,
      pos:curPos,
      image:img.current,
      pattern:pattern.current,
      scale
    })
  }, [select, loading, scale, curPos])

  useEffect(() => {
    if(loading !== IMAGE_LOADED) return
    if(!canvas.current || !img.current || !pattern.current || !scaleFit) return
    setCurPos([0, 0])
    const s = draw({
      canvas:canvas.current,
      pos:[0, 0],
      image:img.current,
      pattern:pattern.current,
      fit:scaleFit
    })
    setScale(s)
    setScaleFit('')
  }, [scaleFit])

  const inp = useRef<HTMLInputElement>(null)
  return (
    <div style={{
      display: "flex",
      overflow: "auto",
      width: "100vw",
      height: "100vh"
    }}>
      <div style={{
        flexGrow: 3,
        flexBasis: 0,
        minWidth: 800,
        borderRight: "1px solid #C9C9C9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        background:`${isEnter ? '#dedede' : 'transparent'}`,
        transition:'background 0.5s'
      }} onDragEnter={Enter}
        onDragLeave={Leave}
        onDragEnd={End}
        onDrop={e => { End(e); Drop(e.dataTransfer.files) }}
        onDragOver={e => e.preventDefault()}
      >
        {loading === IMAGE_LOADED ?
          <canvas style={{
            border:'1px solid black',
            width:'100%',
            height:'100%',
            objectFit:'contain',
          }} ref={canvas} width={selectObj[select[0]][select[1]].width} height={selectObj[select[0]][select[1]].height}
            onPointerDown={e => setMouseInfo(v => ({...v, pos:getPos({elm:canvas.current as HTMLCanvasElement, x: e.nativeEvent.offsetX, y:e.nativeEvent.offsetY}), isDown:true, isFirst:true}))}
            onPointerUp={() => setMouseInfo(v => ({...v, pos:[0, 0], isDown:false, isFirst:false}))}
            onPointerCancel={() => setMouseInfo(v => ({...v, pos:[0, 0], isDown:false, isFirst:false}))}
            onPointerMove={e => {
              if(!mouseInfo.isDown || !canvas.current) return
              const [x, y] = getPos({elm:canvas.current, x:e.nativeEvent.offsetX, y:e.nativeEvent.offsetY})
              const [ox, oy] = mouseInfo.pos

              const [dx, dy] = [x - ox, y - oy]
              console.log(x, y)
              setMouseInfo(v => ({...v, pos:[x, y]}))
              setCurPos(v => [v[0] + dx / scale, v[1] + dy / scale])
            }}
          ></canvas>:
          <div key={2} style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              background: "#F6F6F6",
              maxWidth: 800,
              maxHeight: 500,
              borderRadius: 15,
              gap: 40,
              border: `${isEnter ? '5px solid #99ccff' : '0 solid #99ccff'}`,
              transition:'border 0.5s'
            }}
            onClick={_ => inp.current?.click?.()}
          >
            <svg width="90" height="120" viewBox="0 0 90 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15 0C11.0218 0 7.20644 1.58035 4.3934 4.3934C1.58035 7.20644 0 11.0218 0 15V105C0 108.978 1.58035 112.794 4.3934 115.607C7.20644 118.42 11.0218 120 15 120H75C78.9782 120 82.7936 118.42 85.6066 115.607C88.4196 112.794 90 108.978 90 105V40.605C89.9992 36.6271 88.4182 32.8124 85.605 30L60 4.395C57.1876 1.58176 53.3729 0.000849561 49.395 0H15ZM52.5 45C52.5 43.0109 51.7098 41.1032 50.3033 39.6967C48.8968 38.2902 46.9891 37.5 45 37.5C43.0109 37.5 41.1032 38.2902 39.6967 39.6967C38.2902 41.1032 37.5 43.0109 37.5 45V60H22.5C20.5109 60 18.6032 60.7902 17.1967 62.1967C15.7902 63.6032 15 65.5109 15 67.5C15 69.4891 15.7902 71.3968 17.1967 72.8033C18.6032 74.2098 20.5109 75 22.5 75H37.5V90C37.5 91.9891 38.2902 93.8968 39.6967 95.3033C41.1032 96.7098 43.0109 97.5 45 97.5C46.9891 97.5 48.8968 96.7098 50.3033 95.3033C51.7098 93.8968 52.5 91.9891 52.5 90V75H67.5C69.4891 75 71.3968 74.2098 72.8033 72.8033C74.2098 71.3968 75 69.4891 75 67.5C75 65.5109 74.2098 63.6032 72.8033 62.1967C71.3968 60.7902 69.4891 60 67.5 60H52.5V45Z" fill="#4E5157" />
            </svg>
            <div style={{
              fontSize: 28,
            }}>
              <div><strong>이미지</strong>를 가져와보세요!</div>
              <div>(끌어올리거나 클릭하기)</div>
            </div>
            <input onInput={e => Drop(e.currentTarget.files)} ref={inp} type="file" hidden className="file" accept="image/*" />
          </div>
        }

      </div>
      <div style={{
        flexGrow: 1,
        minWidth: 200,
        maxWidth:600,
        fontSize: 20,
        padding:10
      }}>
        <div style={{
          display:'flex',
          alignItems:'center',
          marginBottom:50
        }}>크기 조정 대상 : <select style={{
            fontSize: 20,
            border:'hidden',
            backgroundColor:'rgb(210,210,210)',
            padding:'5px 10px',
            borderRadius:10,
            marginLeft:10,
          }} value={select[0]} onChange={e => setSelect([e.target.value as keyof typeof selectObj, 0])}>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="Twitter">Twitter</option>
            <option value="YouTube">YouTube</option>
            <option value="Pinterest">Pinterest</option>
            <option value="Linkedin">Linkedin</option>
            <option value="Snapchat">Snapchat</option>
            {/* <option value="표준">표준</option>
            <option value="사용자 정의">사용자 정의</option> */}
          </select>
        </div>
        <div style={{
          display:"flex",
          gap:10,
          marginBottom:50
        }}>
          {selectObj[select[0]].map((v, i) => <div key={i}>
            <button style={{
              width:100,
              height:100,
              display:'flex',
              justifyContent:'center',
              alignItems:'center',
              borderRadius:5,
              ...(i === select[1] ? {border:'2px solid black'} : {})
            }} onClick={() => setSelect([select[0], i])}>
              <div style={{
                width:v.width / Math.max(v.width, v.height) * 90,
                height:v.height / Math.max(v.width, v.height) * 90,
                background:'gray',
                color:'white',
                display:'flex',
                fontSize:14,
                justifyContent:'center',
                alignItems:'center',
              }}>
                {v.ratio}
              </div>
            </button>
            <div style={{
              fontWeight:'bolder',
              textAlign:'center',
            }}>{v.name}</div>
            <div style={{
              fontSize:14,
              color:'rgb(100,100,100)',
              textAlign:'center',
            }}>{v.width}x{v.height}</div>
          </div>)}
        </div>
        <div style={{marginBottom:20}}>
          <div>이미지 비율 : <input type="number" min={0.01} step={0.01} max={10} value={scale} onChange={e => {
            if(isNaN(e.currentTarget.valueAsNumber)) return
            setScale(e.currentTarget.valueAsNumber)
          }} /></div>
          <input type="range" style={{
            width:'100%'
          }} min={0.01} value={scale.toFixed(3)} max={10} step={0.01} onChange={e => setScale(e.currentTarget.valueAsNumber)}/>
          <div>
            <button onClick={() => setScaleFit('contain')} style={{fontSize:20,width:100, height:30}}>contain</button>
            <button onClick={() => setScaleFit('cover')} style={{fontSize:20,width:100, height:30}}>cover</button>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div>중심 위치</div>
          <span style={{display:'inline-block', padding:10}}>x : <input value={curPos[0]} step={0.01} type='number' onChange={e => {
            if(isNaN(e.currentTarget.valueAsNumber)) return
            setCurPos(v => [e.currentTarget.valueAsNumber, v[1]])
          }} /> </span>
          <span style={{display:'inline-block', padding:10}}>y : <input value={curPos[1]} step={0.01} type='number' onChange={e => {
            if(isNaN(e.currentTarget.valueAsNumber)) return
            setCurPos(v => [v[0], e.currentTarget.valueAsNumber])
          }} /></span>
          <div style={{marginTop:10}}><button onClick={() => setCurPos([0, 0])} style={{fontSize:20,width:200, height:30}}>위치 가운데로</button></div>
        </div>
      </div>
    </div>
  );
}
