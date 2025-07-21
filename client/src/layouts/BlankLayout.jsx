import NoInternet from "../features/auth/components/NoInternet.jsx";

export default function BlankLayout ({children}) {
  return (
    <div className="private-layout">
      <h1>Blank Layout</h1>
      {children}
      <NoInternet/>
    </div>
  )
}