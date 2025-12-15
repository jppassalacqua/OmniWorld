
export const THEME = {
  colors: {
    primary: "indigo-600",
    primaryHover: "indigo-500",
    bg: "slate-950",
    surface: "slate-900",
    border: "slate-800",
    text: "slate-200",
    textDim: "slate-400"
  },
  layout: {
    splitPane: "h-full bg-slate-950",
    sidebar: "flex flex-col h-full bg-slate-900 border-r border-slate-800",
    sidebarHeader: "p-4 border-b border-slate-800 space-y-3 bg-slate-900/50 backdrop-blur shrink-0",
    sidebarContent: "flex-1 overflow-y-auto p-2",
    mainContent: "flex-1 flex flex-col bg-slate-950 relative overflow-hidden h-full",
    emptyState: "flex items-center justify-center h-full text-slate-600 flex-col",
    modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4",
    modalContent: "bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl",
    container: "max-w-7xl mx-auto w-full p-8",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
  },
  input: {
    base: "w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all",
    search: "w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all",
    title: "text-3xl font-bold bg-transparent border-none text-white focus:ring-0 w-full placeholder:text-slate-700",
    select: "w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500",
    textarea: "w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[100px]"
  },
  button: {
    icon: "p-1.5 hover:text-white text-slate-400 transition-colors rounded hover:bg-slate-800",
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20",
    secondary: "px-4 bg-slate-800 text-slate-400 hover:text-white rounded transition-colors border border-slate-700 hover:border-slate-600",
    danger: "text-slate-500 hover:text-red-400 p-2 transition-colors rounded hover:bg-red-900/10",
    ghost: "text-slate-400 hover:text-white transition-colors",
    tab: (active: boolean) => `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${active ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`,
    filter: (active: boolean) => `px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`,
  },
  text: {
    label: "text-xs text-slate-500 uppercase font-bold mb-1 block",
    subtle: "text-slate-500 text-sm",
    header: "text-sm font-bold text-slate-400 uppercase tracking-wider",
    h1: "text-3xl font-bold text-white tracking-tight",
    h2: "text-xl font-bold text-white",
  },
  card: {
    base: "bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer transition-all flex flex-col group relative overflow-hidden",
    header: "flex justify-between items-start mb-4",
    icon: "w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300",
    title: "font-bold text-lg text-slate-200 mb-2 group-hover:text-indigo-400 truncate transition-colors",
    body: "text-sm text-slate-500 flex-1 overflow-hidden line-clamp-3",
    footer: "text-xs text-slate-600 pt-4 border-t border-slate-800 flex justify-between items-center mt-auto"
  },
  richText: {
    container: "relative flex flex-col h-full border border-slate-700 rounded-lg overflow-hidden bg-slate-900/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all",
    toolbar: "flex items-center gap-1 bg-slate-800/80 backdrop-blur p-1.5 border-b border-slate-700 sticky top-0 z-10",
    toolbarButton: "p-1.5 hover:bg-slate-700 rounded text-slate-300 transition-colors",
    editor: "font-mono text-sm leading-relaxed h-full min-h-[200px] bg-transparent border-none focus:ring-0 p-3 outline-none text-slate-200",
    mentionDropdown: "absolute left-0 top-full mt-1 w-64 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 ring-1 ring-black/50 animate-in fade-in zoom-in-95 duration-100",
    mentionItem: "w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white flex items-center gap-2 border-b border-slate-800 last:border-0 transition-colors"
  }
};
