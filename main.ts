import { Maze } from './maze.js';
import { Player } from './player.js';

const maze = new Maze(6, 6, 20, [new Player()]);
maze.start();
