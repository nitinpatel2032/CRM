import React from 'react';
import { useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Assuming POCustomerCard is in this location
import POCustomerCard from '../../components/DynamicData/POCustomerCard';

const CreateInvoice = () => {
   const navigate = useNavigate();
  const location = useLocation();
  const edit = location.state?.edit || false;
  const invoiceData = location.state?.invoice || null;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log('Form Data:', data);
    // Here you would typically call an API to save the invoice
  };

  const handleClear = () => {
    reset();
  };

  useEffect(() => {
  if (edit && invoiceData) {
    reset({
      invoice_number: invoiceData.invoiceNumner,
      invoice_amount: invoiceData.invoiceAmount,
      invoice_date: new Date(invoiceData.invoiceDate.split('/').reverse().join('-')),
    });
  }
}, [edit, invoiceData, reset]);

  return (
    <div className="max-w-6xl mx-auto ">
      
      {/* 2. Replaced HeaderComponent with a simpler header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create Invoice</h1>
        <button 
          onClick={() => navigate(-1)} // Navigates to the previous page
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft size={16} />
          Back to POs
        </button>
      </div>

      {/* 3. The customer card will now appear smaller due to the new max-width container */}
      <POCustomerCard />

      {/* Invoice Details Form */}
      <div className="mt-6 p-3 border rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">
          {edit ? 'Edit Invoice Details' : 'Add Invoice Details'}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5" // 4. Adjusted grid gap for a tighter feel
        >
          {/* Invoice Number - Simplified field structure */}
          <div>
            <label htmlFor="invoice_number" className="label-style">
              Invoice Number <span className="text-red-500">*</span>
            </label>
            <input
              id="invoice_number"
              type="text"
              maxLength={15}
              className="input-style"
              {...register('invoice_number', {
                required: 'Invoice number is required',
                maxLength: { value: 15, message: 'Max 15 characters' },
                pattern: { value: /^[a-zA-Z0-9]+$/, message: 'Alphanumeric only' },
              })}
            />
            {errors.invoice_number && (
              <p className="error-style">{errors.invoice_number.message}</p>
            )}
          </div>

          {/* Invoice Amount */}
          <div>
            <label htmlFor="invoice_amount" className="label-style">
              Invoice Amount <span className="text-red-500">*</span>
            </label>
            <input
              id="invoice_amount"
              type="text"
              maxLength={10}
              className="input-style"
              {...register('invoice_amount', {
                required: 'Invoice amount is required',
                min: { value: 1, message: 'Amount must be > 0' },
                pattern: { value: /^[0-9]+$/, message: 'Numbers only' },
              })}
            />
            {errors.invoice_amount && (
              <p className="error-style">{errors.invoice_amount.message}</p>
            )}
          </div>

          {/* Invoice Date */}
          <div>
            <label htmlFor="invoice_date" className="label-style">
              Invoice Date <span className="text-red-500">*</span>
            </label>
                <Controller
                name="invoice_date"
                control={control}
                rules={{ required: 'Invoice date is required' }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/MM/yyyy"
                    customInput={
                      <input
                        className="p-2 border rounded w-full"
                        placeholder="dd/MM/yyyy"
                      />
                    }
                  />
                )}
              />
            {errors.invoice_date && (
              <p className="error-style">{errors.invoice_date.message}</p>
            )}
          </div>

          {/* Upload File */}
          <div>
            <label htmlFor="invoice_file" className="label-style">
              Upload File <span className="text-red-500">*</span>
            </label>
            <input
              id="invoice_file"
              type="file"
              className="input-style file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              {...register('invoice_file', {
                required: 'Invoice file is required',
              })}
            />
            {errors.invoice_file && (
              <p className="error-style">{errors.invoice_file.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 md:col-span-2 ">
            <button type="submit" className="btn-primary">
              Submit
            </button>
            <button type="button" onClick={handleClear} className="btn-secondary">
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;