import { type Component, Show } from "solid-js";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";

interface AuthCardProps {
  title: string;
  description?: string;
  children: any;
  footer?: any;
  error?: string;
}

export const AuthCard: Component<AuthCardProps> = (props) => {
  return (
    <Card class="shadow-2xl p-10 rounded-xl overflow-hidden from-[#1a1a2e] via-[#16213e] to-[#0f3460] ">
      <CardHeader>
        {/* Nona Config Logo */}
        <div class="w-20 h-20 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="w-full h-full">
            <rect width="64" height="64" rx="14" fill="#070A13"></rect>
            <path d="M16 46 V18 L34 46 V18" fill="none" stroke="#60A5FA" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path>
            <circle cx="36" cy="34" r="7" fill="#34D399" stroke="#60A5FA" stroke-width="4"></circle>
          </svg>
        </div>
        <CardTitle>{props.title}</CardTitle>
      </CardHeader>      <CardContent class="space-y-4">
        <Show when={props.error}>
          <div class="p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl">
            {props.error}
          </div>
        </Show>
        {props.children}
      </CardContent>
      <Show when={props.footer}>
        <CardFooter class="flex flex-col space-y-4 pt-5">
          {props.footer}
        </CardFooter>
      </Show>
    </Card>
  );
};
