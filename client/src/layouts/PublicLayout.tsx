import NoInternet from "../components/NoInternet.jsx";
import * as React from "react";

export default function PublicLayout ({children} :{children: React.ReactNode}) {
  return (
    <div className="private-layout">
      <h1>Public Layout</h1>
      {children}
      <NoInternet/>
    </div>
  )
}