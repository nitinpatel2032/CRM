// src/context/POContext.js
import { createContext, useContext, useState } from "react";

const POContext = createContext();

export const usePOContext = () => useContext(POContext);

export const POProvider = ({ children }) => {
  const [poData, setPOData] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  return (
    <POContext.Provider value={{ poData, setPOData ,invoiceData, setInvoiceData}}>
      {children}
    </POContext.Provider>
  );
};
