import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit">
      {pending ? "Logging in..." : "Login"}
    </Button>
  );
}

export default SubmitButton;