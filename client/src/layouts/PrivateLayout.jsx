import NoInternet from "../components/NoInternet.jsx";

export default function PrivateLayout ({children}) {
  return (
    <div className="private-layout">
      <h1>Private Layout</h1>
      {children}
      <NoInternet/>
    </div>
  )
}