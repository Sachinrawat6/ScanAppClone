import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Scanner from './pages/Scanner'
import { ProductContextProvider } from './Context/Context'

const App = () => {
  return (
    <ProductContextProvider>
    <BrowserRouter>
    <Routes>
      <Route path='/' element = {<Login/>}/>
      <Route path='/scanner' element = {<Scanner/>}/>

    </Routes>
    </BrowserRouter>
    </ProductContextProvider>
  )
}

export default App