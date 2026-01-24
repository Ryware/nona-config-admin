import { onMount } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import { AppLayout } from "../../components/layout/AppLayout";
import { usePageTitle } from "../../contexts/PageTitleContext";

export default function DashboardPage() {
  const { setPageTitle } = usePageTitle();
  
  // Set page title on mount
  onMount(() => {
    setPageTitle("Dashboard");
  });
  
  return (
    <AppLayout>
      <Tabs aria-label="Main navigation" class="tabs">
        <Tabs.List class="tabs__list">
          <Tabs.Trigger class="tabs__trigger" value="profile">Parameters</Tabs.Trigger>
          <Tabs.Trigger class="tabs__trigger" value="dashboard">Projects</Tabs.Trigger>
          <Tabs.Trigger class="tabs__trigger" value="settings">Users</Tabs.Trigger>
          <Tabs.Trigger class="tabs__trigger" value="contact">Contact</Tabs.Trigger>
          <Tabs.Indicator class="tabs__indicator" />
        </Tabs.List>
        <Tabs.Content class="tabs__content" value="profile">Profile details</Tabs.Content>
        <Tabs.Content class="tabs__content" value="dashboard">Dashboard details</Tabs.Content>
        <Tabs.Content class="tabs__content" value="settings">Settings details</Tabs.Content>
        <Tabs.Content class="tabs__content" value="contact">Contact details</Tabs.Content>
      </Tabs>
    </AppLayout>
  );
}
