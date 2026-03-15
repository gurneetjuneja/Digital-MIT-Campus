import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Loader2 } from 'lucide-react';

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const hasScannedRef = useRef(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    const startScanner = async () => {
      if (isInitializedRef.current || scannerRef.current) {
        return;
      }

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0 && isMounted && containerRef.current) {
          setCameraId(devices[0].id);
          
          const scannerId = `qr-reader-${Date.now()}`;
          
          containerRef.current.innerHTML = `<div id="${scannerId}"></div>`;
          
          const html5QrCode = new Html5Qrcode(scannerId);
          scannerRef.current = html5QrCode;
          isInitializedRef.current = true;

          await html5QrCode.start(
            devices[0].id,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              if (!hasScannedRef.current && isMounted) {
                hasScannedRef.current = true;
                onScanSuccess(decodedText);
                stopScanner();
              }
            },
            (errorMessage) => {
            }
          );
          
          if (isMounted) {
            setScanning(true);
          }
        } else if (isMounted) {
          setError('No camera found. Please ensure your device has a camera.');
        }
      } catch (err) {
        console.error('Error starting scanner:', err);
        if (isMounted) {
          setError('Failed to start camera. Please check permissions.');
        }
        isInitializedRef.current = false;
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 100);

    return () => {
      clearTimeout(timer);
      isMounted = false;
      stopScanner();
    };
  }, [onScanSuccess]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
        scannerRef.current = null;
        setScanning(false);
        hasScannedRef.current = false;
        isInitializedRef.current = false;
      } catch (err) {
        console.error('Error stopping scanner:', err);
        scannerRef.current = null;
        setScanning(false);
        hasScannedRef.current = false;
        isInitializedRef.current = false;
      }
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  };

  const handleClose = async () => {
    await stopScanner();
    hasScannedRef.current = false;
    isInitializedRef.current = false;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#4B0082]">Scan QR Code</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleClose}
              className="btn btn-outline"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div
                ref={containerRef}
                className="w-full rounded-lg overflow-hidden"
                style={{ minHeight: '300px' }}
              ></div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 text-center">
                Position the QR code within the frame to scan
              </p>
            </div>

            <button
              onClick={handleClose}
              className="btn btn-outline w-full"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;

