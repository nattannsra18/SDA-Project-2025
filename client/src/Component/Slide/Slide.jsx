import React, { useState } from 'react'
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import "./Slide.css"


function Slide() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const img = [
    "/images/OIP.jpg",
    "/images/GTAV.jpg",
    "/images/rivals.jpg"
  ];
  
  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (prev === 0) {
        return img.length - 1; // ถ้าสไลด์ปัจจุบันคือ 0, กลับไปที่สไลด์สุดท้าย
      } else {
        return prev - 1; // ลดสไลด์ปัจจุบันลง 1
      }
    });
  }
  const nextSlide = () => {
    setCurrentSlide((prev) => {
      if (prev === img.length - 1) {
        return 0; // ถ้าสไลด์ปัจจุบันคือสุดท้าย, กลับไปที่สไลด์แรก
      } else {
        return prev + 1; // เพิ่มสไลด์ปัจจุบันขึ้น 1
      }
    });
  }
  return (
    <div className='slider '>
    <div  className='container' style={{transform:`translateX(-${currentSlide*100 }vw)`}}>
    <img  src= {img[0]} alt='' />
    <img src= {img[1]} alt='' />
    <img src= {img[2]} alt='' />
    </div>
    <div className='icons'>
    <div className='icon' onClick={prevSlide}>
    <FaArrowLeft /> 
    </div>
    <div className='icon' onClick={nextSlide }>
      < FaArrowRight/>
    </div>
    </div>
    </div>


  )
}

export default Slide