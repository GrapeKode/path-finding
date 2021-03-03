import React, { Component } from "react"

// Components
import { Maze } from "./maze"

class Dashboard extends Component {
  render() {
    return (
      <div className="jumbotron">
        <div className="container">
          <div className="h1">Maze v1.0.0</div>
          <hr />
          <Maze />
        </div>
      </div>
    )
  }
}

export default Dashboard
