export class MazeGenerator {
  private stack: number[][] = []
  private maze: number[][]

  constructor(private readonly size: number) {
    // this.maze.push(new Array(size).fill(0))
    this.maze = new Array(size).fill(new Array(size).fill(0))
  }

  public getMaze(): number[][] {
    return this.maze
  }

  public generateMaze() {
    this.stack.push([0, 0])
    while (this.stack.length !== 0) {
      const next = this.stack.pop() as number[]

      if (this.validNextNode(next)) {
        console.log("generateMaze.next >>>", `| ${next[0]} / ${next[1]} |`, this.maze[next[0]][next[1]])
        // this.maze = JSON.parse(JSON.stringify(this.maze))
        this.maze[next[0]][next[1]] = 1
        // console.log("maze >>>", JSON.parse(JSON.stringify(this.maze)))
        const neighbors = this.findNeighbors(next)
        // console.log("neighbors >>>", neighbors)
        this.randomlyAddNodesToStack(neighbors)
      }
    }

    // console.log("maze >>>", JSON.parse(JSON.stringify(this.maze)))
  }

  private validNextNode(node: number[]): boolean {
    let numNeighboringOnes = 0
    for (let y = node[1] - 1; y < node[1] + 2; y++) {
      for (let x = node[0] - 1; x < node[0] + 2; x++) {
        if (this.pointOnGrid(x, y) && this.pointNotNode(node, x, y) && this.maze[y][x] === 1) {
          numNeighboringOnes++
        }
      }
    }
    // console.log("validNextNode >>>", numNeighboringOnes, this.maze[node[1]][node[0]], numNeighboringOnes < 3 && this.maze[node[1]][node[0]] !== 1)
    return numNeighboringOnes < 3 && this.maze[node[1]][node[0]] !== 1
  }

  private randomlyAddNodesToStack(nodes: number[][]): void {
    let targetIndex
    while (nodes.length > 0) {
      targetIndex = this.getRendomInt(nodes.length - 1)
      const node = nodes.splice(targetIndex, 1)[0]
      // console.log("randomlyAddNodesToStack >>>", targetIndex, node)
      this.stack.push(node)
    }
  }

  private findNeighbors(node: number[]): number[][] {
    const neighbors: number[][] = []
    for (let y = node[1] - 1; y < node[1] + 2; y++) {
      for (let x = node[0] - 1; x < node[0] + 2; x++) {
        if (this.pointOnGrid(x, y) && this.pointNotCorner(node, x, y) && this.pointNotNode(node, x, y)) {
          neighbors.push([x, y])
        }
      }
    }
    return neighbors
  }

  private pointOnGrid(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.size && y < this.size
  }

  private pointNotCorner(node: number[], x: number, y: number): boolean {
    return x === node[0] || y === node[1]
  }

  private pointNotNode(node: number[], x: number, y: number): boolean {
    return !(x === node[0] && y === node[1])
  }

  private getRendomInt(max: number): number {
    return Math.floor(Math.random() * max)
  }
}
