"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Props = {
  labelName: string; // must match schema key: "username" | "password"
  type?: string;
  formFieldDescription?: string;
  placeholderText?: string;
  classNameInput?: string;
};

export default function LabelAndInput({
  labelName,
  type = "text",
  formFieldDescription,
  placeholderText,
  classNameInput,
}: Props) {
  const methods = useFormContext();

  if (!methods) {
    throw new Error("LabelAndInput must be used within a FormProvider");
  }

  return (
    <div>
      <Controller
        control={methods.control}
        name={labelName}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={labelName}>{labelName}</FormLabel>
            <FormControl>
              <Input
                className={classNameInput}
                id={labelName}
                placeholder={placeholderText}
                type={type}
                {...field}
              />
            </FormControl>
            {formFieldDescription && (
              <FormDescription>{formFieldDescription}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
