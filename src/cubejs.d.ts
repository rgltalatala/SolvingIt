declare module 'cubejs/lib/cube' {
  class Cube {
    static fromString(facelets: string): Cube;
    toJSON(): {
      cp: number[];
      co: number[];
      ep: number[];
      eo: number[];
    };
  }
  export default Cube;
}
