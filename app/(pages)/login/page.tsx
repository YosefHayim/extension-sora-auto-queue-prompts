'use client'
import LabelAndInput from "@/custom-components/LabelAndInput/LabelAndInput";

const page = () => {


  return (
    <div>
      <form>
        <LabelAndInput
          labelName="Username"
          type="text"
        />
      </form>
    </div>
  );
};

export default page;
