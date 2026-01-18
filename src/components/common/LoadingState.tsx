import { type Component } from "solid-js";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: Component<LoadingStateProps> = (props) => {
  return (
    <div class="flex justify-center py-12">
      <div class="text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent mb-3"></div>
        <p class="text-gray-500">{props.message || "Loading..."}</p>
      </div>
    </div>
  );
};
