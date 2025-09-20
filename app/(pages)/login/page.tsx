"use client";

import { useState } from "react";
import LabelAndInput from "@/custom-global-components/LabelAndInput/LabelAndInput";
import { loginAction } from "./actions";
import SubmitButton from "@/custom-global-components/SubmitButton/SubmitButton";



export default function Page() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");

  return (
    <div>
      <form action={loginAction}>
        <LabelAndInput
          changedValue={u}
          labelName="Username"
          setOnChange={setU}
          type="text"
        />
        <LabelAndInput
          changedValue={p}
          labelName="Password"
          setOnChange={setP}
          type="password"
        />
        <SubmitButton />
      </form>
    </div>
  );
}
