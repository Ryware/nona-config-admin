import { type ParentComponent, createContext, useContext, createSignal, Show } from "solid-js";

interface TabsContextValue {
  activeTab: () => string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue>();

interface TabsProps {
  defaultValue: string;
  class?: string;
}

export const Tabs: ParentComponent<TabsProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal(props.defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div class={props.class}>
        {props.children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  class?: string;
}

export const TabsList: ParentComponent<TabsListProps> = (props) => {
  return (
    <div class={`flex gap-6 border-b border-white/10 ${props.class || ""}`}>
      {props.children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  class?: string;
}

export const TabsTrigger: ParentComponent<TabsTriggerProps> = (props) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = () => context.activeTab() === props.value;

  return (
    <button
      class={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
        isActive()
          ? "text-brand-blue border-brand-blue"
          : "text-text-secondary border-transparent hover:text-text-primary hover:border-white/20"
      } ${props.class || ""}`}
      onClick={() => context.setActiveTab(props.value)}
    >
      {props.children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  class?: string;
}

export const TabsContent: ParentComponent<TabsContentProps> = (props) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  return (
    <Show when={context.activeTab() === props.value}>
      <div class={props.class}>
        {props.children}
      </div>
    </Show>
  );
};
