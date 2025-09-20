import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const page = () => {
  return (
    <div>
      <form>
        <Label />
        <Input id="email" name="email" />
        <Input id="password" name="password" />
      </form>
    </div>
  );
};

export default page;
