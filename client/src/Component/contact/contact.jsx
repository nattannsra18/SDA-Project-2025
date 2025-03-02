import React from 'react'
import "./contact.css"
import { FaFacebook } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";
import { FaSnapchatSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

const Contact = () => {
  return (
    <div className='contact'>
        <div className="wrapper">
            <span>BE IN TOUCH WITH US:</span>
            <div className="mail">
                <input type='text' placeholder='Enter your email...'/>
                <button>JOIN US</button>
            </div>
            <div className="icons">
                <FaFacebook className="icon" /> 
                <FaSquareInstagram className="icon" />
                <IoIosMail className="icon" />
                <FaSnapchatSquare className="icon" />
                <FaSquareXTwitter className="icon" />
            </div>
        </div>
    </div>
  )
}

export default Contact