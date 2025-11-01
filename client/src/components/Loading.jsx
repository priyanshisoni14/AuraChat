import React, { useEffect } from 'react'
import { useNavigate} from 'react-router-dom'

const Loading = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/')
    }, 1500)

    return () => clearTimeout(timeout)
  }, [navigate])

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="animate-spin rounded-full h-14 w-14 border-4 border-t-transparent border-indigo-500"></div>
    </div>
  )
}

export default Loading
