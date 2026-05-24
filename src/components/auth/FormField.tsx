import { type Component, createSignal, Show } from "solid-js";
import type { JSX } from "solid-js/h/jsx-runtime";
import { Input } from "../ui/input";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onInput: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
  onKeyDown?: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent, JSX.EventHandler<HTMLInputElement, KeyboardEvent>> | undefined;
  required?: boolean;
  autofocus?: boolean;
  leftIcon?: string;
}

export const FormField: Component<FormFieldProps> = (props) => {
  const [showPassword, setShowPassword] = createSignal(false);

  return (
    <div class="group flex flex-col gap-1.5">
      <label
        for={props.id}
        class="block text-[11px] font-medium text-on-surface-variant tracking-[0.05em] group-focus-within:text-primary transition-colors"
      >
        {props.label}
      </label>
      <div class="relative flex items-center">
        <Show when={props.leftIcon}>
          <span class="material-symbols-outlined absolute left-3.5 text-outline text-[18px] pointer-events-none">
            {props.leftIcon}
          </span>
        </Show>
        <Input
          id={props.id}
          type={props.type === "password" ? (showPassword() ? "text" : "password") : (props.type || "text")}
          placeholder={props.placeholder}
          value={props.value}
          onInput={props.onInput}
          required={props.required}
          autofocus={props.autofocus}
          onkeydown={props.onKeyDown}
          class={`py-3.5 ${
            props.leftIcon
              ? (props.type === "password" ? "pl-10 pr-11" : "pl-10 pr-4")
              : (props.type === "password" ? "pl-4 pr-11" : "")
          }`}
        />
        <Show when={props.type === "password"}>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword())}
            class="absolute right-3.5 text-outline hover:text-on-surface transition-colors focus:outline-none flex items-center justify-center p-1 cursor-pointer select-none"
            aria-label={showPassword() ? "Hide password" : "Show password"}
          >
            <span class="material-symbols-outlined text-[20px]">
              {showPassword() ? "visibility_off" : "visibility"}
            </span>
          </button>
        </Show>
      </div>
    </div>
  );
};


