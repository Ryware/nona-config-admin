import { type ParentComponent } from "solid-js";

export const AuthLayout: ParentComponent = (props) => {
  return (
    <div
      class="min-h-screen flex flex-col items-center justify-center p-4"
      style="background-color: #0e1323;"
    >
      {props.children}
    </div>
  );
};

