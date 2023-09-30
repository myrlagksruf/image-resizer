import type { MetaFunction } from "@remix-run/node";
import { useEffect, useRef, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Image Resizer" },
    { name: "description", content: "이미지의 크기 변경하는 사이트" },
  ];
};

export default function Index() {
  const [isEnter, setIsEnter] = useState(false)
  const [image, setImage] = useState('')
  
  // 이미지 정보 넣기
  
  // Offscreen 이용하기
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
  const Drop: React.DragEventHandler<HTMLDivElement> = e => {
    if (e.dataTransfer.files.length === 0) return
    const file = e.dataTransfer.files[0]
    if (!file.type.startsWith('image')) return
    URL.revokeObjectURL(image)
    setImage(URL.createObjectURL(file))
  }
  return (
    <div style={{
      display: "flex",
      overflow: "auto",
      width: "100vw",
      height: "100vh"
    }}>
      <div style={{
        flexGrow: 1,
        flexBasis: 0,
        minWidth: 800,
        borderRight: "1px solid #C9C9C9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        background:`${isEnter ? '#dedede' : ''}`,
        transition:'background 0.5s'
      }} onDragEnter={Enter} onDragLeave={Leave} onDragEnd={End} onDrop={e => { End(e); Drop(e) }} onDragOver={e => e.preventDefault()}>
        {image ?
          <div key={1} style={{
            minWidth:800,
            minHeight:800,
            aspectRatio:'1 / 1',
            borderRadius:15,
            background: "#F6F6F6",
          }}>
            <img src={image} style={{
              width:"100%",
              height:"100%",
              objectFit:"contain"
            }}/>
          </div> :
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
          }}>
            <svg width="90" height="120" viewBox="0 0 90 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15 0C11.0218 0 7.20644 1.58035 4.3934 4.3934C1.58035 7.20644 0 11.0218 0 15V105C0 108.978 1.58035 112.794 4.3934 115.607C7.20644 118.42 11.0218 120 15 120H75C78.9782 120 82.7936 118.42 85.6066 115.607C88.4196 112.794 90 108.978 90 105V40.605C89.9992 36.6271 88.4182 32.8124 85.605 30L60 4.395C57.1876 1.58176 53.3729 0.000849561 49.395 0H15ZM52.5 45C52.5 43.0109 51.7098 41.1032 50.3033 39.6967C48.8968 38.2902 46.9891 37.5 45 37.5C43.0109 37.5 41.1032 38.2902 39.6967 39.6967C38.2902 41.1032 37.5 43.0109 37.5 45V60H22.5C20.5109 60 18.6032 60.7902 17.1967 62.1967C15.7902 63.6032 15 65.5109 15 67.5C15 69.4891 15.7902 71.3968 17.1967 72.8033C18.6032 74.2098 20.5109 75 22.5 75H37.5V90C37.5 91.9891 38.2902 93.8968 39.6967 95.3033C41.1032 96.7098 43.0109 97.5 45 97.5C46.9891 97.5 48.8968 96.7098 50.3033 95.3033C51.7098 93.8968 52.5 91.9891 52.5 90V75H67.5C69.4891 75 71.3968 74.2098 72.8033 72.8033C74.2098 71.3968 75 69.4891 75 67.5C75 65.5109 74.2098 63.6032 72.8033 62.1967C71.3968 60.7902 69.4891 60 67.5 60H52.5V45Z" fill="#4E5157" />
            </svg>
            <div style={{
              fontSize: 28,
            }}>
              <div><strong>이미지</strong>를 가져와보세요!</div>
              <div>(끌어올리거나 클릭하기)</div>
            </div>
            <input type="file" hidden className="file" accept="image/*" />
          </div>
        }

      </div>
      <div style={{
        flexGrow: 1,
        minWidth: 200
      }}>
        <h2>크기 : {}</h2>
      </div>
    </div>
  );
}
