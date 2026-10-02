import Login from "../features/auth/login";
import Register from "../features/auth/Register";

function App() {
  if (window.location.pathname === "/register") {
    return <Register />;
  }

  return <Login/>  ;
}

export default App;
