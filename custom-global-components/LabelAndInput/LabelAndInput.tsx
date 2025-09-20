"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  labelName: string;
  type?: string;
  setOnChange?: (v: string) => void;
  changedValue?: string;
  placeholderText?: string;
  classNameDivWrapper?: string;
  classNameInput?: string;
};

export default function LabelAndInput({
  labelName,
  type = "text",
  setOnChange,
  changedValue,
  placeholderText,
  classNameDivWrapper,
  classNameInput,
}: Props) {
  return (
    <div
      className={
        classNameDivWrapper || "flex flex-col items-start justify-start gap-2"
      }
    >
      <Label htmlFor={labelName}>{labelName}</Label>
      <Input
        className={classNameInput}
        defaultValue={changedValue}
        id={labelName}
        name={labelName}
        onChange={setOnChange ? (e) => setOnChange(e.target.value) : undefined}
        placeholder={placeholderText}
        type={type}
      />
    </div>
  );
}
