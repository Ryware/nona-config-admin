import { type Component, type JSX } from "solid-js";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: JSX.Element;
}

export const PageHeader: Component<PageHeaderProps> = (props) => {
  return (
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">{props.title}</h2>
        {props.description && (
          <p class="mt-1 text-gray-600">{props.description}</p>
        )}
      </div>
      {props.action}
    </div>
  );
};
