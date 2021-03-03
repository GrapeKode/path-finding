export interface Position {
  row: number
  col: number
}

export interface VisitedPosition {
  position: Position
  startDist: number
  finishDist: number
}

export interface FinalPath extends VisitedPosition {
  totalDistance: number
}

export enum MazeStatus {
  SelectStartPosition = "SelectStartPosition",
  SelectEndPosition = "SelectEndPosition",
  ResetPositions = "ResetPositions",
  PositionsSelected = "PositionsSelected",
}
