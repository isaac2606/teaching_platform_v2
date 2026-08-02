import { useEffect } from "react";

// This completely replaces MUI's <Snackbar> and <Box>
export default function Toast({ message, type = "success", open, onClose }) {
  
  // This replaces MUI's autoHideDuration={6000}
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  const bgColors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-blue-500"
  };

  return (
    // This fixed div replaces MUI's anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
      
      {/* This replaces MUI's <Snackbar> styling with our custom Tailwind classes */}
      <div className={`${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-4`}>
        
        {/* The Message */}
        <p className="font-medium">{message}</p>
        
        {/* This replaces MUI's <IconButton> and <CloseIcon> */}
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-md transition-colors"
        >
          {/* We use a raw SVG instead of downloading the massive @mui/icons-material package */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

      </div>
    </div>
  );
}
