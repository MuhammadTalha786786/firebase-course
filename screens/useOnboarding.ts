import { View, Text } from 'react-native'
import React, { useState } from 'react'

export const useOnboarding = () => {
    const [firstLaunch,setFirstLaunch] = useState(null)
  return {
  firstLaunch,
  setFirstLaunch
  }
   
}
export default useOnboarding