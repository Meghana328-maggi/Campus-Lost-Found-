import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, X } from 'lucide-react';

export default function QrModal({ isOpen, onClose, item }) {
  const [qrUrl, setQrUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && item) {
      const itemUrl = `${window.location.origin}/items/${item._id}`;
      QRCode.toDataURL(itemUrl, { width: 300, margin: 2, color: { dark: '#1e1b4b', light: '#ffffff' } })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `lost-found-qr-${item._id}.png`;
    link.href = qrUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Item Safe QR Code</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          Scan to view the verified item details on the Campus Lost & Found platform.
        </p>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-inner inline-block my-2">
          {qrUrl ? (
            <img src={qrUrl} alt="Item QR Code" className="w-56 h-56 mx-auto object-contain" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400">Generating...</div>
          )}
        </div>

        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2 truncate">
          {item.title}
        </p>
        <p className="text-xs text-slate-500 capitalize">{item.type} Item • {item.campusZone}</p>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={downloadQR}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-xl transition shadow-sm"
          >
            <Download className="w-4 h-4" /> Download QR
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
