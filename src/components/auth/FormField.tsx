import { type Component } from "solid-js";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onInput: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
  required?: boolean;
  autofocus?: boolean;
}

export const FormField: Component<FormFieldProps> = (props) => {
  return (
    <div class="space-y-2">
      <Label for={props.id}>{props.label}</Label>
      <Input
        id={props.id}
        type={props.type || "text"}
        placeholder={props.placeholder}
        value={props.value}
        onInput={props.onInput}
        required={props.required}
        autofocus={props.autofocus}
      />
    </div>
  );
};
