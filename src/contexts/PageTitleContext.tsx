import { createContext, useContext, createSignal, type ParentComponent, type Accessor, type Setter } from "solid-js";

interface PageTitleContextValue {
  pageTitle: Accessor<string>;
  setPageTitle: Setter<string>;
}

const PageTitleContext = createContext<PageTitleContextValue>();

export const PageTitleProvider: ParentComponent = (props) => {
  const [pageTitle, setPageTitle] = createSignal("Dashboard");

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {props.children}
    </PageTitleContext.Provider>
  );
};

export const usePageTitle = () => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error("usePageTitle must be used within PageTitleProvider");
  }
  return context;
};
