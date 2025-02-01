
const LOG_TREE = false

export const logger = {
  tree: (...args : any) => {
    if (LOG_TREE)
      console.log(args);
  }
}
