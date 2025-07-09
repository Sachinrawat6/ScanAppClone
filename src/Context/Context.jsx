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


const updateLastScanner = async(scanData)=>{
    try {
        const payload = {
            
            order_number: Number(scanData.order_id),
            user_id: Number(scanData.user_id),
            user_location_id: Number(scanData.user_location_id),
          };      
        const response = await axios.post(`${BASE_URL}/scan`,payload);
        return response.data 

    } catch (error) {
        setError("Failed to scan qr code", error);
    }
}

useEffect(()=>{
    fetchEmployeeId()
},[]);



    return <ProductContext.Provider  value={{fetchEmployeeId, loading, employeeId, error, updateLastScanner}} >  {children} </ProductContext.Provider>
}

const useGlobalContext = ()=>{
    return useContext(ProductContext)
}

export {ProductContextProvider, useGlobalContext}