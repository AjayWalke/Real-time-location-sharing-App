import React from 'react'

const StatusPanel = ({status}:{status:string}) => {
  return (
    <div>
      <p>{status}</p>
    </div>
  )
}

export default StatusPanel
