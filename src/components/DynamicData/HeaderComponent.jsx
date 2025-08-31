import React from 'react'

const HeaderComponent = ({heading,buttonName,icon,onClick}) => {
  return (
   <div className="p-4 flex items-center justify-between w-full border rounded shadow mb-2 bg-white">
    <div className='text-gray-600 font-bold text-xl'>{heading}</div>
    <div className='flex items-center justify-center gap-2 bg-indigo-500 py-2 px-3 rounded-lg text-white cursor-pointer hover:bg-indigo-700' onClick={onClick}>{icon} <span>{buttonName}</span></div>
   </div>
  )
}

export default HeaderComponent