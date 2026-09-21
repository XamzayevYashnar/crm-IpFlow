export interface NavItem {
  label: string;
  to: string;
  ready: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}
