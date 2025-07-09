import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const ProductContext = createContext();

const ProductContextProvider = ({children})=>{

const[loading, setLoading] = useState(false);
const[employeeId, setEmployeeId] = useState([]);
const[lastTailor, setLastTailor]= useState([]);
const[error, setError] = useState("");
const BASE_URL = 'https://fastapi.qurvii.com';

// fetch employee id 
const fetchEmployeeId = async()=>{
    setLoading(true);
    try {
    // const response = await axios.request(options);
    const response = await axios.get(`${BASE_URL}/getUsers`);
    const data = response.data.data || [];
    setEmployeeId(data);
    } catch (error) {
        setError("Failed to load employee id", error)
    }
    finally{
        setLoading(false);
    }
}

useEffect(()=>{
    fetchEmployeeId()
},[]);



    return <ProductContext.Provider  value={{fetchEmployeeId, loading, employeeId, error}} >  {children} </ProductContext.Provider>
}

const useGlobalContext = ()=>{
    return useContext(ProductContext)
}

export {ProductContextProvider, useGlobalContext}