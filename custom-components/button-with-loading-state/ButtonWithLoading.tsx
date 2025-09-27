import { Button } from "@/components/ui/button";
import Loader from "../Loader/Loader";

type ButtonWithLoadingProps = {
  className?: string;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  loading: boolean;
  text: string;
  icon?: React.ReactNode;
}

const ButtonWithLoading: React.FC<ButtonWithLoadingProps> = ({ className, type, variant, loading, text, icon }) => {
  return (
    <Button className={className} type={type} variant={variant}>
      {loading ? <Loader /> : <>{icon} {text}</>}
    </Button>
  );
};

export default ButtonWithLoading;
