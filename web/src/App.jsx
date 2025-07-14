import { useAuth } from "./context/AuthContext";
import LoginForm from "./components/LoginForm";
import Feed from "./components/Feed";
import "./App.css";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <div className="App">{isAuthenticated ? <Feed /> : <LoginForm />}</div>
    </>
  );
}

export default App;
