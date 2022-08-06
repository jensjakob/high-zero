import { useState } from "react";
import UserArea from "./UserArea";
import Lines from "./Lines";

import "./App.css";

function App() {
  const [user, setUser] = useState<string | null>();

  function loginHandler(user: string) {
    setUser(user);
  }

  return (
    <div className="App">
      {user ? <Lines user={user} /> : <UserArea onLogin={loginHandler} />}
    </div>
  );
}

export default App;
