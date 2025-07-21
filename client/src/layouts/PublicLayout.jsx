import NoInternet from "../features/auth/components/NoInternet.jsx";

export default function PublicLayout ({children}) {
  return (
    <div className="private-layout">
      <h1>Public Layout</h1>
      {children}
      <NoInternet/>
    </div>
  )
}