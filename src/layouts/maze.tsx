import React, { Component, Fragment } from "react"
import { FinalPath, MazeStatus, Position, VisitedPosition } from "./types"
// import { MazeGenerator } from "../common/generate-maze"
import generate from "../common/test-gen-maze"

export interface MazeState {
  mazeStatus: MazeStatus
  mazeSize: number
  startPos: Position
  finishPos: Position
  obstaclesPos?: Position[]
  visitedPos: VisitedPosition[]
  closedPos: Position[]
  finalPath: FinalPath[]
  speed: number
}

export class Maze extends Component<{}, MazeState> {
  private timer: any

  state: MazeState = {
    mazeStatus: MazeStatus.SelectStartPosition,
    mazeSize: 16,
    speed: 80,
    startPos: {
      row: 7,
      col: 7,
    },
    finishPos: {
      row: 2,
      col: 1,
    },
    obstaclesPos: [],
    visitedPos: [],
    closedPos: [],
    finalPath: [],
  }

  componentDidMount() {
    // Lib
    const gen = generate(this.state.mazeSize)
    console.log(gen)
    // const matrix = gen.map((row: any) => row.map((el: any) => ([el.top, el.bottom, el.left, el.right].filter((el) => !el).length > 1 ? 0 : 1)))
    const matrix = gen.map((row) => row.map((el: any) => ([el.top, el.bottom, el.left, el.right].filter((el) => !el).length > 1 ? [0, 0] : [el.x, el.y])))
    console.log(matrix)

    // console.log(gen.map((row) => row.map((el: any) => ((el.top || el.right) && (el.left || el.bottom) ? [el.x, el.y] : [0, 0]))))

    const newObs = []

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j][0] !== 0 && matrix[i][j][1] !== 0) {
          newObs.push({ row: matrix[i][j][0], col: matrix[i][j][1] })
        }
      }
    }

    this.setState({ obstaclesPos: newObs })

    this.setSavedObstacles()

    // Converted Java
    // const maze = new MazeGenerator(4)
    // maze.generateMaze()
    // console.log(maze.getMaze())
  }

  generateMaze() {}

  setSavedObstacles() {
    const newObstacles = localStorage.getItem("obstacles")
    const newStartFinishPos = localStorage.getItem("startFinishPos")

    if (newObstacles) {
      this.setState((prev: MazeState) => ({
        ...prev,
        obstaclesPos: JSON.parse(newObstacles),
      }))
    }
    if (newStartFinishPos) {
      const parsedStartFinishPos = JSON.parse(newStartFinishPos) as { startPos: Position; finishPos: Position }
      this.setState({ startPos: parsedStartFinishPos.startPos, finishPos: parsedStartFinishPos.finishPos })
    }
  }

  explore(rowIndex: number, cellIndex: number) {
    const { mazeSize } = this.state
    const dx = [-1, +1, 0, 0]
    const dy = [0, 0, +1, -1]

    for (let i = 0; i < 4; i++) {
      const visitPosX = rowIndex + dx[i]
      const visitPosY = cellIndex + dy[i]

      // Skip out of bounds positions
      if (visitPosX < 0 || visitPosY < 0) continue
      if (visitPosX >= mazeSize || visitPosY >= mazeSize) continue

      // Skip invalid positions
      if (this.isObstacle(visitPosX, visitPosY) || this.isClosedCell(visitPosX, visitPosY)) continue

      this.addVisitedCell(visitPosX, visitPosY)

      // Check finish point
      if (this.isFinishPosition(visitPosX, visitPosY)) {
        // alert("FINISH")
        this.stop()
        this.addFinalPath()
        return "FINISH"
      }
    }
  }

  getMostRelevantPosition(): VisitedPosition {
    const { visitedPos } = this.state
    let nextNode: VisitedPosition = {
      position: {
        row: -1,
        col: -1,
      },
      finishDist: 1000,
      startDist: 1000,
    }

    for (const node of visitedPos) {
      const currentPosX = node.position.row
      const currentPosY = node.position.col

      // Skip closed cells
      if (this.isClosedCell(currentPosX, currentPosY)) continue

      if (node.finishDist < nextNode.finishDist && !this.isFinalPath(node.position.row, node.position.col)) {
        nextNode = node
      }
    }

    return nextNode
  }

  findPath() {
    const nextNode = this.getMostRelevantPosition()
    // console.log("Next Node >>>", `[${nextNode.position.row}, ${nextNode.position.col}] > ${nextNode.startDist} ${nextNode.finishDist}`)
    this.addClosedCell(nextNode.position.row, nextNode.position.col)
    this.explore(nextNode.position.row, nextNode.position.col)
  }

  getTotalDistance(visitedPosition: VisitedPosition) {
    return visitedPosition.finishDist + visitedPosition.startDist
  }

  addFinalPath() {
    const { visitedPos, finishPos, startPos } = this.state
    const newFinalPath: FinalPath[] = []

    for (const visited of visitedPos) {
      const prevVisitedNode = newFinalPath[newFinalPath.length - 1] || {
        position: {
          row: finishPos.row,
          col: finishPos.col,
        },
        finishDist: 0,
        startDist: (Math.abs(finishPos.row - startPos.row) + Math.abs(finishPos.col - startPos.col)) * 10,
        totalDistance: (Math.abs(finishPos.row - startPos.row) + Math.abs(finishPos.col - startPos.col)) * 10,
      }

      if (this.isClosedCell(visited.position.row, visited.position.col)) {
        const totalDistance = this.getTotalDistance(visited)

        // console.log({ ...visited, position: [visited.position.row, visited.position.col].toString() }, totalDistance)
        // console.log(prevVisitedNode.position.row - visited.position.row, prevVisitedNode.position.col - visited.position.col)

        if (
          visited.finishDist <= totalDistance &&
          [0, 1].includes(Math.abs(prevVisitedNode.position.row - visited.position.row)) &&
          [0, 1].includes(Math.abs(prevVisitedNode.position.col - visited.position.col)) &&
          Math.abs(prevVisitedNode.finishDist - visited.finishDist) === 10
          // !newFinalPath.some((el, index) => el.finishDist === visited.finishDist && el.startDist === visited.startDist && el.totalDistance === totalDistance)
        ) {
          newFinalPath.push({ ...visited, totalDistance })
        }
      }
    }

    this.setState(
      {
        finalPath: newFinalPath,
      },
      () => {
        console.log("FINAL >>>", this.state)
        console.warn(`Steps: ${this.state.finalPath.length + 1}`)
      }
    )
  }

  addClosedCell(rowIndex: number, cellIndex: number) {
    if (this.skipStartEndPosition(rowIndex, cellIndex) || this.isObstacle(rowIndex, cellIndex)) {
      return
    }

    this.setState((prev: MazeState) => ({
      closedPos: [{ row: rowIndex, col: cellIndex }, ...prev.closedPos],
    }))
  }

  addVisitedCell(rowIndex: number, cellIndex: number) {
    if (
      this.skipStartEndPosition(rowIndex, cellIndex) ||
      this.isObstacle(rowIndex, cellIndex) ||
      this.isClosedCell(rowIndex, cellIndex) ||
      this.isVisitedCell(rowIndex, cellIndex)
    ) {
      return
    }

    const { startPos, finishPos } = this.state
    const newVisitedCell: VisitedPosition = {
      position: { row: rowIndex, col: cellIndex },
      startDist: (Math.abs(rowIndex - startPos.row) + Math.abs(cellIndex - startPos.col)) * 10,
      finishDist: (Math.abs(finishPos.row - rowIndex) + Math.abs(finishPos.col - cellIndex)) * 10,
    }

    this.setState((prev: MazeState) => ({
      ...prev,
      visitedPos: [newVisitedCell, ...prev.visitedPos],
    }))
  }

  addObstacles(rowIndex: number, cellIndex: number) {
    if (this.isObstacle(rowIndex, cellIndex)) {
      const newObstacles = this.state.obstaclesPos?.filter((pos) => !(pos.row === rowIndex && pos.col === cellIndex))
      this.setState((prev: MazeState) => ({
        ...prev,
        obstaclesPos: newObstacles,
      }))
    } else {
      this.setState((prev: MazeState) => ({
        ...prev,
        obstaclesPos: [{ row: rowIndex, col: cellIndex }, ...(prev.obstaclesPos ? prev.obstaclesPos : [])],
      }))
    }
  }

  addStartEndPositions(rowIndex: number, cellIndex: number) {
    const { mazeStatus } = this.state

    // Add Start Position
    if (mazeStatus === MazeStatus.SelectStartPosition || mazeStatus === MazeStatus.ResetPositions) {
      this.setState({ startPos: { row: rowIndex, col: cellIndex }, mazeStatus: MazeStatus.SelectEndPosition })
      alert("Select End position.")
    }
    // Add End Position
    if (mazeStatus === MazeStatus.SelectEndPosition) {
      this.setState({ finishPos: { row: rowIndex, col: cellIndex }, mazeStatus: MazeStatus.PositionsSelected })
      alert("NOTE: Add obstacle by clicking the cells.")
    }
  }

  // Controllers
  start() {
    this.explore(this.state.startPos.row, this.state.startPos.col)
    this.timer = setInterval(() => {
      this.findPath()
    }, this.state.speed)
  }
  save() {
    const { obstaclesPos, startPos, finishPos } = this.state
    if (obstaclesPos) {
      localStorage.setItem("obstacles", JSON.stringify(obstaclesPos))
      localStorage.setItem("startFinishPos", JSON.stringify({ startPos, finishPos }))
    }
  }
  stop() {
    clearInterval(this.timer)
  }
  reset() {
    this.stop()

    this.setState({
      mazeStatus: MazeStatus.ResetPositions,
      visitedPos: [],
      closedPos: [],
      finalPath: [],
    })
  }

  generate() {}

  resetAll() {
    this.reset()
    this.setState({ obstaclesPos: [] })
    localStorage.removeItem("obstacles")
  }

  // Utils
  skipStartEndPosition(rowIndex: number, cellIndex: number) {
    return this.isStartPosition(rowIndex, cellIndex) || this.isFinishPosition(rowIndex, cellIndex)
  }

  // Checkers
  isStartPosition(rowIndex: number, cellIndex: number) {
    return rowIndex === this.state.startPos.row && cellIndex === this.state.startPos.col
  }

  isFinishPosition(rowIndex: number, cellIndex: number) {
    return rowIndex === this.state.finishPos.row && cellIndex === this.state.finishPos.col
  }

  isObstacle(rowIndex: number, cellIndex: number) {
    return this.state.obstaclesPos?.some((pos, index) => pos.row === rowIndex && pos.col === cellIndex)
  }

  isVisitedCell(rowIndex: number, cellIndex: number) {
    return this.state.visitedPos?.some((visitedCell, index) => visitedCell.position.row === rowIndex && visitedCell.position.col === cellIndex)
  }

  isClosedCell(rowIndex: number, cellIndex: number) {
    return this.state.closedPos.some((pos, index) => pos.row === rowIndex && pos.col === cellIndex)
  }

  isFinalPath(rowIndex: number, cellIndex: number) {
    return this.state.finalPath.some((el, index) => el.position.row === rowIndex && el.position.col === cellIndex)
  }

  // View

  createCells(rowIndex: number, cellsNo: number) {
    const { visitedPos } = this.state
    const cells = []
    for (let i = 0; i < cellsNo; i++) {
      const start = this.isStartPosition(rowIndex, i) && "start"
      const finish = this.isFinishPosition(rowIndex, i) && "finish"
      const obstacle = this.isObstacle(rowIndex, i) && "obstacle"
      const visited = this.isVisitedCell(rowIndex, i) && "visited"
      const final = this.isFinalPath(rowIndex, i) && "final"

      cells.push(
        <div
          className={`col flex-center ${start} ${finish} ${obstacle} ${final ? final : visited}`}
          style={{ border: ".5px solid black" }}
          onClick={() => (this.state.mazeStatus === MazeStatus.PositionsSelected ? this.addObstacles(rowIndex, i) : this.addStartEndPositions(rowIndex, i))}
        >
          {/* {`${rowIndex} ${i}`} */}

          {finish ? "F" : start ? "S" : ""}
          {visited ? visitedPos.find((pos) => pos.position.row === rowIndex && pos.position.col === i)?.finishDist : obstacle ? "#" : ""}
        </div>
      )
    }

    return cells
  }

  createRows(size: number) {
    const rows = []
    for (let i = 0; i < size; i++) {
      rows.push(
        <div className="row" style={{ minHeight: size + "px" }}>
          {this.createCells(i, size)}
        </div>
      )
    }

    return rows
  }

  render() {
    return (
      <Fragment>
        <div id="Maze" className="container" style={{ border: "1px solid black" }}>
          {this.createRows(this.state.mazeSize)}
        </div>
        <div className="container mt-3">
          <div className="row">
            <div className="col-md">
              <a href="#START" className="btn btn-outline-primary btn-lg w-100" onClick={() => this.start()}>
                START
              </a>
            </div>
            <div className="col-md">
              <a href="#SAVE" className="btn btn-outline-success btn-lg w-100" onClick={() => this.save()}>
                SAVE
              </a>
            </div>
            <div className="col-md">
              <a href="#STOP" className="btn btn-outline-danger btn-lg w-100" onClick={() => this.stop()}>
                STOP
              </a>
            </div>
            <div className="col-md">
              <a href="#RESET" className="btn btn-outline-secondary btn-lg w-100" onClick={() => this.reset()} onDoubleClick={() => this.resetAll()}>
                RESET
              </a>
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
}

export default Maze
