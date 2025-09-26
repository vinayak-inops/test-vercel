"use client"
import { useState } from "react";
import TableEditManager from "./_componets/table-edit-manager";

export default function Home() {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-y-scroll h-full flex-1">
      <TableEditManager paramsValue={"excel-file-edit"} setOpen={setOpen}/>
    </div>
  );
}
