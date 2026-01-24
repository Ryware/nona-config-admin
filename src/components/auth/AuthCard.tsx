import { type Component, Show } from "solid-js";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Logo } from "../ui/logo";

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
        <Logo />
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
