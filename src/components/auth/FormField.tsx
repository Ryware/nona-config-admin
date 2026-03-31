import { type Component } from "solid-js";

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
    <div class="group">
      <label
        for={props.id}
        class="block text-xs font-bold text-start uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary transition-colors"
      >
        {props.label}
      </label>
      <input
        id={props.id}
        type={props.type || "text"}
        placeholder={props.placeholder}
        value={props.value}
        onInput={props.onInput}
        required={props.required}
        autofocus={props.autofocus}
        class="w-full bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30 focus:ring-0 focus:border-b-primary text-on-surface placeholder:text-outline/40 py-4  transition-all font-mono text-[13px] outline-none pl-4"
      />
    </div>
  );
};

