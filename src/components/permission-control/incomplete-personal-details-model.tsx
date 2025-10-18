"use client"
import { useGlobalContextProvider } from '@/providers/global-context';
import { AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

export const IncompletePersonalDetailsModal = ({ onClose } : {onClose?: () => void}) => {
  const [missingFields, setMissingFields] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const {accountDetails} = useGlobalContextProvider()
  const router = useRouter()

  useEffect(() => {
    const checkMissingFields = () => {
      const missing = [];

      // Check phone
      if (!accountDetails?.phone) {
        missing.push('Phone Number');
      }

      // Check address - only add if ALL address fields are empty
      const address = accountDetails?.address || {};
      const hasAnyAddressValue = Object.entries(address).some(([key, value]) => {
        return value && value.trim() !== '';
      });

      if (!hasAnyAddressValue) {
        missing.push('Address');
      }

      setMissingFields(missing);
      
      // Only show modal if there are missing fields and user hasn't dismissed it
      const dismissed = localStorage.getItem('incompleteDetailsModalDismissed');
      if (missing.length > 0 && !dismissed) {
        setShowModal(true);
      }
    };

    if (accountDetails) {
      checkMissingFields();
    }
  }, [accountDetails]);

  const handleSetNow = () => {
    setShowModal(false);
    router.push('/settings/account-details')
  };

  const handleLater = () => {
    localStorage.setItem('incompleteDetailsModalDismissed', 'true');
    setShowModal(false);
    if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    setShowModal(false);
    if (onClose) {
      onClose();
    }
  };

  if (!showModal || missingFields.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50">
      {/* Modal */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-400 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-xl text-secondary font-semibold">
              Complete Your Profile
            </h2>
          </div>
          <button 
            onClick={handleClose} 
            className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="mb-6">
            <p className="text-base font-semibold text-gray-900 mb-2">
              Incomplete Personal Details
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Some important information is missing from your profile. Please complete the following fields to ensure full access to all features:
            </p>
            
            {/* Missing Fields List */}
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-secondary mb-2">
                Missing Information:
              </p>
              <ul className="space-y-2">
                {missingFields.map((field, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-primary">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Go to <span className="font-semibold text-gray-900">Account Details</span> to update your information.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <Button 
            onClick={handleLater} 
            variant="outline"
            className="px-6 bg-transparent h-11 hover:bg-secondary hover:text-white cursor-pointer"
          >
            Later
          </Button>
          <Button 
            onClick={handleSetNow} 
           className="bg-primary hover:bg-secondary cursor-pointer h-11 px-6"
          >
            Update Now
          </Button>
        </div>
      </div>
    </div>
  );
};

