import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { poConfigFields } from '../../FormData/FormDetails';
import apiService from '../../services/apiService';
import { Combobox } from '../../components/Combobox';

export const POModal = ({ poToEdit, closeModal, onPOUpdated }) => {
  const initializeState = () => {
    const initialState = {};
    poConfigFields.forEach(field => {
      initialState[field.name] = '';
    });
    return initialState;
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [poData, setPOData] = useState(initializeState());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [project,setProject] = useState([]);

  const isEditMode = !!poToEdit;

  const loadCompanies = async () => {
  setLoading(true);
  try {
    const [res1, res2] = await Promise.all([
      apiService.fetchCompany("bindcompany",0),
      apiService.fetchCompany("bindproject",poData?.company ? poData?.company : 0)
    ]);

    setCompanies(res1.data);
    setProject(res2.data);
  } catch (error) {
    toast.error("Failed to fetch data.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadCompanies();
  }, [poData?.company]);

  useEffect(() => {
  if (isEditMode && poToEdit) {
    // merge defaults with incoming PO
    setPOData(prev => ({
      ...prev,
      ...poToEdit,
      company: poToEdit.customerId, 
      project: poToEdit.ProjectId, 
      poDate: new Date(poToEdit.poDate).toISOString().split("T")[0]
    }));

    // if file is present from API, set it as existingAttachment
    if (poToEdit.fileName && poToEdit.fileData) {
      // Convert buffer array → base64 string for preview
      const byteArray = new Uint8Array(poToEdit.fileData.data);
      let binary = '';
      byteArray.forEach(byte => binary += String.fromCharCode(byte));
      const base64 = window.btoa(binary);

      setExistingAttachment({
        name: poToEdit.fileName,
        data: base64
      });
    }
  }
}, [isEditMode, poToEdit]);

  //  Validation helpers
  const validateField = (name, value, validations) => {
    if (!validations) return null;
    if (validations.required && !value) return validations.required;
    if (validations.maxLength && value.length > validations.maxLength.value)
      return validations.maxLength.message;
    if (validations.pattern && !validations.pattern.value.test(value))
      return validations.pattern.message;
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    poConfigFields.forEach(field => {
      const err = validateField(field.name, poData[field.name], field.validations);
      if (err) newErrors[field.name] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    const newValue = type === 'file' ? files[0] : value;
    setPOData(prev => ({ ...prev, [name]: newValue }));

    const field = poConfigFields.find(f => f.name === name);
    if (field?.validations) {
      const err = validateField(name, newValue, field.validations);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // File size validation (10 MB max)
  if (file.size > 10 * 1024 * 1024) {
    toast.error("File is too large. Maximum size is 10MB.");
    e.target.value = '';
    return;
  }

  setExistingAttachment(null);

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    setSelectedFile({
      name: file.name,
      type: file.type,
      data: reader.result.split(',')[1]  // remove metadata
    });

    // also update poData to keep it in sync
    setPOData(prev => ({
      ...prev,
      fileName: file.name,
      fileData: reader.result.split(',')[1],
    }));
  };
  reader.onerror = (error) => {
    console.error('Error converting file to Base64:', error);
    toast.error('Could not process file.');
  };
};

  //  Updated renderField with Combobox
const handleFormSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    toast.error("Please fix errors before submitting");
    return;
  }

  setIsSubmitting(true);

  try {
    const formData = new FormData();
    Object.keys(poData).forEach((key) => {
      formData.append(key, poData[key]);
    });

    const data = Object.fromEntries(formData);

    // Decide which file details to send
    let fileName = "";
    let fileData = "";

    if (selectedFile) {
      fileName = selectedFile.name;
      fileData = selectedFile.data;
    } else if (existingAttachment) {
      fileName = existingAttachment.name;
      fileData = existingAttachment.data;
    }

    if (isEditMode) {
      // ------- UPDATE PO -------

      const formattedData = {
        action: "update",
        poNumber: data.poNumber,
        company: parseInt(data.company, 10),
        project: parseInt(data.project, 10),
        poDate: data.poDate,
        poAmount: data.poAmount,
        poFilePath: data.poFilePath || "",
        poComment: data.poComment,
        POID: parseInt(data.id, 10),
        status: data.status,
        customer: data.customer,
        fileName,
        fileData,
      };

      const response = await apiService.updatePO(formattedData);

      if (response?.data?.status === -2) {
        toast.error(response?.data?.message);
      } else if (response?.data?.status === -3) {
        toast.error(response?.data?.message);
      } else {
        toast.success(response?.data?.message);
      }
    } else {
      // ------- CREATE PO -------

      const formattedData = {
        action: "create",
        poNumber: data.poNumber,
        company: parseInt(data.company, 10),
        project: parseInt(data.project, 10),
        poDate: data.poDate,
        poAmount: data.poAmount,
        // poFilePath: data.poFilePath || "",
        poComment: data.poComment,
        // customer: data.customer,
        fileName,
        fileData,
      };

      const response = await apiService.addPO(formattedData);

      if (response?.data?.status === -1) {
        toast.error(response?.data?.message);
      } else {
        toast.success(response?.data?.message);
      }
    }

    onPOUpdated();
    closeModal();
  } catch (err) {
    console.error("error", err);
    toast.error(`Failed to ${isEditMode ? "update" : "create"} PO.`);
  } finally {
    setIsSubmitting(false);
  }
};

  const renderField = (field) => {
    switch (field.type) {
      case 'select':
         let options = [];
      if (field.name === "company") {
        options = companies;
      } else if (field.name === "project") {
        options = project;
      }

        return (
          <Combobox
            options={options}
            value={poData[field.name]}
            onChange={(val) => setPOData(prev => ({ ...prev, [field.name]: val }))}
            optionValue="Id"
            optionLabel="Name"
            placeholder={`Select ${field.label}`}
            disabled={loading}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={poData[field.name]}
            onChange={handleInputChange}
            placeholder={field.label}
            className="input-style"
            rows="3"
          />
        );
      case 'file':
  return (
    <div>
      <input
        id={field.name}
        name={field.name}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="input-style"
      />

      {/* Show existing file if editing */}
      {isEditMode && existingAttachment && !selectedFile && (
        <p className="text-xs text-gray-500 mt-1">
          Current File:{" "}
          <a
            href={`data:application/pdf;base64,${existingAttachment.data}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            {existingAttachment.name}
          </a>
        </p>
      )}
    </div>
  );

      case 'date':
        return (
          <input
            type="date"
            id={field.name}
            name={field.name}
            value={poData[field.name]}
            onChange={handleInputChange}
            className="input-style"
          />
        );
      default:
        return (
          <input
            type="text"
            id={field.name}
            name={field.name}
            value={poData[field.name]}
            onChange={handleInputChange}
            placeholder={field.label}
            className="input-style"
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {isEditMode ? 'Edit Purchase Order' : 'Add Purchase Order'}
          </h2>
          <button
            onClick={closeModal}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {poConfigFields.map(field => (
              <div key={field.name}>
                <label htmlFor={field.name} className="label-style">
                  {field.label}
                  {field.validations?.required && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                {renderField(field)}
                {errors[field.name] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="submit"
              className="btn-primary disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add PO')}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
