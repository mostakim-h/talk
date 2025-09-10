import NoInternet from "../components/NoInternet.jsx";
import * as React from "react";

export default function BlankLayout ({children} :{children: React.ReactNode}) {
  return (
    <div className="private-layout">
      {children}
      <NoInternet/>
    </div>
  )
}