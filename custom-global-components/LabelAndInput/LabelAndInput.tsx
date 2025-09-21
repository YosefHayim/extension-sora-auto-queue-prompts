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
  labelName: string;
  type?: string;
  formFieldDescription?: string;
  placeholderText?: string;
  classNameInput?: string;
  labelClassName?: string
};

export default function LabelAndInput(props: Props) {
  const methods = useFormContext();

  if (!methods) {
    throw new Error("LabelAndInput must be used within a FormProvider");
  }

  return (
    <div>
      <Controller
        control={methods.control}
        name={props.labelName}
        render={({ field }) => (
          <FormItem>
            <FormLabel className={props.labelClassName} htmlFor={props.labelName}>
              {props.labelName}
            </FormLabel>
            <FormControl>
              <Input
                className={props.classNameInput}
                id={props.labelName}
                placeholder={props.placeholderText}
                type={props.type}
                {...field}
              />
            </FormControl>
            {props.formFieldDescription && (
              <FormDescription>{props.formFieldDescription}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
