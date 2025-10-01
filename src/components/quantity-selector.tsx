import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantitySelector({ quantity, setQuantity, min = 1, max = 99, disabled = false }: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (!disabled) setQuantity(Math.max(min, quantity - 1));
  };

  const handleIncrement = () => {
    if (!disabled) setQuantity(Math.min(max, quantity + 1));
  };

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-r-none"
        onClick={handleDecrement}
        disabled={disabled || quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        className="h-10 w-16 rounded-none border-l-0 border-r-0 text-center"
        value={quantity}
        onChange={(e) => {
            if (disabled) return;
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value)) {
                setQuantity(Math.max(min, Math.min(max, value)));
            }
        }}
        readOnly={disabled}
      />
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-l-none"
        onClick={handleIncrement}
        disabled={disabled || quantity >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
