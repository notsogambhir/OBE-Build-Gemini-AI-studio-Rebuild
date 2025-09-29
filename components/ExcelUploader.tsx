import React, { useRef, useCallback } from 'react';
import { Upload } from './Icons';

declare const XLSX: any;

// FIX: Made component generic to support typed data parsing.
interface ExcelUploaderProps<T> {
    onFileUpload: (data: T[]) => void;
    label: string;
    format: string;
}

// FIX: Converted to a generic function component.
function ExcelUploader<T>({ onFileUpload, label, format }: ExcelUploaderProps<T>) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                if(typeof XLSX === 'undefined') {
                    alert('Excel library (SheetJS) is not loaded. Please check your internet connection or script tag.');
                    return;
                }
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                // FIX: Cast parsed JSON to the generic type T.
                onFileUpload(json as T[]);
            } catch (error) {
                console.error("Error parsing Excel file:", error);
                alert("Failed to parse the Excel file. Please ensure it's a valid format.");
            }
        };
        reader.readAsArrayBuffer(file);
        if (inputRef.current) {
            inputRef.current.value = ''; 
        }
    }, [onFileUpload]);

    return (
        <div className="flex flex-col items-end">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
                <Upload className="w-5 h-5" /> {label}
            </button>
             <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".xlsx, .xls, .csv"
            />
            {format && <p className="text-xs text-gray-500 mt-1">{format}</p>}
        </div>
    );
};

export default ExcelUploader;