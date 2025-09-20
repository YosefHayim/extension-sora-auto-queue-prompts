"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LabelAndInputProps = {
  labelName: string;
  type?: string;
  setOnChange: (value: string) => void;
  changedValue?: string;
  placeholderText?: string;
  classNameDivWrapper?: string;
  classNameInput?: string;
};

const LabelAndInput: React.FC<LabelAndInputProps> = (props) => {
  return (
    <div className={props.classNameDivWrapper || "flex flex-col items-start justify-start gap-2"}>
      <Label htmlFor={props.labelName}>{props.labelName}</Label>
      <Input
        className={props.classNameInput}
        defaultValue={props.changedValue}
        id={props.labelName}
        name={props.labelName}
        onChange={(e) => props.setOnChange(e.target.value)}
        placeholder={props.placeholderText}
        type={props.type || "text"}
      />
    </div>
  );
};

export default LabelAndInput;
