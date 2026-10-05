import { AlertCircle, Check, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  onClose,
}: ToastProps) {
  return (
    <div className={`cinema-toast cinema-toast-${type}`}>
      <div className="cinema-toast-icon">
        {type === "success" && <Check size={17} />}
        {type === "error" && <AlertCircle size={17} />}
        {type === "info" && <Info size={17} />}
      </div>

      <div className="cinema-toast-content">
        <span className="cinema-toast-label">
          {type === "success" && "SUCCESS"}
          {type === "error" && "ERROR"}
          {type === "info" && "I-CINEMA"}
        </span>

        <p>{message}</p>
      </div>

      <button
        className="cinema-toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}