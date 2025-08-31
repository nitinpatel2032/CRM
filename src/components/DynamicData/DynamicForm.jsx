import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { SquareX } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const DynamicForm = ({ fieldConfig, onSubmit, duplicateErrors, title, onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm();

  const handleClear = () => reset();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-3xl relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-red-600 text-2xl font-bold"
        >
          <SquareX />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`${fieldConfig.length === 2
            ? "flex flex-col items-center justify-center gap-4"
            : "grid grid-cols-1 sm:grid-cols-2 gap-4"
            }`}
        >
          {fieldConfig.map((field) => (
            <div key={field.name} className={`${fieldConfig.length === 2 ? "flex flex-col w-full" : "flex flex-col"}`}>
              <label className="mb-1 font-medium">{field.label}</label>

              {/* Autocomplete for Select */}
              {field.type === 'select' && (
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validations || {}}
                  render={({ field: controllerField }) => (
                    <Autocomplete
                      options={field.options || []}
                      onChange={(_, value) => controllerField.onChange(value)}
                      value={controllerField.value || null}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: 42,
                          minHeight: 42
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={`Select ${field.label}`}
                          // error={!!errors[field.name]}
                          // helperText={errors[field.name]?.message}
                        />
                      )}
                    />
                  )}
                />
              )}

              {/* Date Picker for Date Type */}
              {field.type === 'date' && (
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validations || {}}
                  render={({ field: controllerField }) => (
                    <DatePicker
                      selected={controllerField.value}
                      onChange={(date) => controllerField.onChange(date)}
                      className="p-2 border rounded w-full"
                      placeholderText="dd/MM/yyyy"
                      dateFormat="dd/MM/yyyy"
                    />
                  )}
                />
              )}

              {/* Textarea */}
              {field.type === 'textarea' && (
                <textarea
                  className="p-2 border rounded"
                  {...register(field.name, field.validations || {})}
                />
              )}

              {/* Other Input Fields */}
              {field.type !== 'select' && field.type !== 'textarea' && field.type !== 'date' && (
                <input
                  maxLength={field.maxLength}
                  type={field.type}
                  className="p-2 border rounded"
                  {...register(field.name, field.validations || {})}
                />
              )}

              {/* Error Messages */}
              {errors[field.name] && (
                <span className="text-red-500 text-sm">{errors[field.name]?.message}</span>
              )}
              {duplicateErrors && duplicateErrors[field.name] && (
                <span className="text-red-500 text-sm">{duplicateErrors[field.name]}</span>
              )}
            </div>
          ))}

          {/* Buttons */}
          <div className="col-span-1 sm:col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DynamicForm;
