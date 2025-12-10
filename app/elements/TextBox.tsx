import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
interface IProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText?: string;
  error?: string;
  children?: React.ReactNode; 
  isPassword?: boolean;  
}

const TextBox = React.forwardRef<HTMLInputElement, IProps>(
  ({ labelText, error, children, isPassword, className, ...props }, ref) => {
    const [show, setShow] = useState(false); 

    const inputType = isPassword ? (show ? "text" : "password") : props.type;

    return (
      <div className={`relative flex flex-col ${className || ""}`}>
        {labelText && (
          <label
            htmlFor={props.id ?? props.name}
            className="block text-gray-600 mb-1 text-sm"
          >
            {labelText}
          </label>
        )}

        <div className="relative w-full">
          <input
            {...props}
            ref={ref}
            type={inputType}
            className={`w-full border rounded-md py-2 pl-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-400 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />

          {(isPassword || children) && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="px-2 text-gray-500"
                  tabIndex={-1}
                >
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
              {children}
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

TextBox.displayName = "TextBox";
export default TextBox;
