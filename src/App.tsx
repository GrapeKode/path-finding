import React from "react"
import { Switch, Route, BrowserRouter as Router } from "react-router-dom"
import "./App.css"
import "./_helpers/flex.css"
import "./_helpers/main.css"

// Routes
import Dashboard from "./layouts/dashboard"

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={Dashboard} />
        </Switch>
      </Router>
    </div>
  )
}

export default App
