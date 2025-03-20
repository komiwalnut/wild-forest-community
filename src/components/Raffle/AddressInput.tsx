import React, { useState, useRef, useEffect } from 'react';
import { AddressInputProps } from '../../types';

export function AddressInput({
  onAddressesChange,
  useAllStakers,
  validationInfo,
  loading,
  uniqueStakersCount
}: AddressInputProps) {
  const [inputText, setInputText] = useState('');
  const [invalidAddresses, setInvalidAddresses] = useState<string[]>([]);
  const [duplicateAddresses, setDuplicateAddresses] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    onAddressesChange(newText);
  };
  
  const handleUseAllStakers = () => {
    useAllStakers((addressesText: string) => {
      setInputText(addressesText);
      onAddressesChange(addressesText);
    });
  };

  const handleClearAll = () => {
    setInputText('');
    onAddressesChange('');
  };
  
  const handleRemoveDuplicates = () => {
    if (inputText) {
      const lines = inputText.trim().split('\n').filter(line => line.trim() !== '');
      const uniqueLines = Array.from(new Set(lines));
      const newText = uniqueLines.join('\n');
      setInputText(newText);
      onAddressesChange(newText);
    }
  };

  useEffect(() => {
    if (!inputText) {
      setInvalidAddresses([]);
      setDuplicateAddresses([]);
      return;
    }

    const validAddressPattern = /^0x[a-fA-F0-9]{40}$/;
    const lines = inputText.split('\n').filter(line => line.trim() !== '');

    const invalid = lines.filter(line => {
      const trimmedLine = line.trim();
      return trimmedLine && !validAddressPattern.test(trimmedLine);
    });

    const addressMap = new Map();
    const duplicates: string[] = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      if (addressMap.has(trimmedLine)) {
        duplicates.push(trimmedLine);
      } else {
        addressMap.set(trimmedLine, true);
      }
    });
    
    setInvalidAddresses(invalid);
    setDuplicateAddresses(duplicates);
  }, [inputText]);

  const highlightAddress = (address: string) => {
    if (!textareaRef.current) return;
    
    const text = textareaRef.current.value;
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === address) {
        const startPos = lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0);
        const endPos = startPos + lines[i].length;
        
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(startPos, endPos);
        break;
      }
    }
  };
  
  return (
    <div className="card mb-6">
      <div className="stats-title">1. Participant Addresses</div>
      <p className="text-sm text-light-alt mt-1">
        Paste wallet addresses of participants below. The raffle power will be calculated based on their staked Lords.
      </p>
      
      <div className="mt-4">
        <textarea
          ref={textareaRef}
          className="form-control h-40 font-mono text-sm"
          placeholder={"Paste wallet addresses here (0xabc...123), one per line\n\nExample:\n0x0000000000000000000000000000000000000000\n0xabcdef0123456789012345678901234567890123"}
          rows={10}
          value={inputText}
          onChange={handleInputChange}
          disabled={loading}
          style={{ 
            resize: 'none',
            height: '160px',
            width: '100%',
            boxSizing: 'border-box',
            whiteSpace: 'pre-line'
          }}
        />
      </div>
      
      <div className="address-controls">
        <div className="button-group">
          <button
            className="btn btn-secondary"
            onClick={handleUseAllStakers}
            disabled={loading}
          >
            Use Lord Stakers ({uniqueStakersCount})
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={handleClearAll}
            disabled={loading}
          >
            Clear All
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={handleRemoveDuplicates}
            disabled={loading || validationInfo.duplicates === 0}
          >
            Remove Duplicates
          </button>
        </div>
        
        {inputText.trim() !== '' && (
          <div className="validation-group">
            <div className="count-validation">
              Lines: {validationInfo.lines}
            </div>
            <div className={`count-validation ${validationInfo.validAddresses < validationInfo.lines ? 'text-error' : ''}`}>
              Valid Addresses: {validationInfo.validAddresses}/{validationInfo.lines} 
              {validationInfo.validAddresses < validationInfo.lines && <span className="warning-icon ml-1">⚠️</span>}
            </div>
            {validationInfo.duplicates > 0 && (
              <div className="warning-validation text-warning">
                Duplicate Addresses: {validationInfo.duplicates} <span className="warning-icon">⚠️</span>
              </div>
            )}
          </div>
        )}
      </div>

      {invalidAddresses.length > 0 && (
        <div className="mt-4">
          <div className="error-box">
            <h3 className="text-sm font-semibold text-error mb-1">
              Invalid Addresses <span className="warning-icon">⚠️</span>
            </h3>
            <div className="invalid-addresses-list">
              {invalidAddresses.map((address, index) => (
                <div 
                  key={index} 
                  className="invalid-address-item"
                  onClick={() => highlightAddress(address)}
                >
                  {address}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {duplicateAddresses.length > 0 && (
        <div className="mt-4">
          <div className="warning-box">
            <h3 className="text-sm font-semibold text-warning mb-1">
              Duplicate Addresses <span className="warning-icon">⚠️</span>
            </h3>
            <div className="duplicate-addresses-list">
              {duplicateAddresses.map((address, index) => (
                <div 
                  key={index} 
                  className="duplicate-address-item"
                  onClick={() => highlightAddress(address)}
                >
                  {address}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}