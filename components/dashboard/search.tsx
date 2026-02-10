import { Search } from "lucide-react";

import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

interface SearchFormProps extends React.ComponentProps<"form"> {
  placeholder?: string;
}

export function SearchForm({
  placeholder = "Search...",
  ...props
}: SearchFormProps) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <div className="relative mt-1">
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2.5 text-sm text-[#737373] hover:bg-white/[0.05] cursor-pointer transition-colors">
              <Search className="h-4 w-4" />
              <span className="flex-1">{placeholder}</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium text-[#525252]">
                /
              </kbd>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
