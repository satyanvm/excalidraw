import { ReactNode } from "react";

export function IconButton({
  icon,
  onClick,
  activated,
  selectedTool,
  setSelectedTool,
}: {
  icon: ReactNode;
  onClick: () => void;
  activated: boolean;
  selectedTool: any;
  setSelectedTool: any;
}) {
  return (
    <div
      onClick={onClick}
      className={`pointer rounded-full border p-2 bg-black hover:bg-gray ${activated ? "text-red-400" : "text-white"}`}
    >
      {icon}
    </div>
  );
}
