import {START_FEN} from '../chess/rules';
export interface LessonDemo {fen:string;moves:string[];captions:string[];title:string}
const development:LessonDemo={title:'Develop and castle',fen:START_FEN,moves:['e2e4','e7e5','g1f3','b8c6','f1c4','g8f6','d2d3','f8c5','e1g1'],captions:['Claim central space.','Black contests the center.','Develop a knight and attack e5.','Defend e5 and develop.','The bishop eyes f7.','Black develops with pressure on e4.','Support the center and open the bishop.','Black activates another piece.','Castle: the king and rook move together.']};
const checks:LessonDemo={title:'Check every forcing reply',fen:START_FEN,moves:['f2f3','e7e5','g2g4','d8h4'],captions:['Moving the f-pawn opens a king diagonal.','Black opens the queen’s diagonal.','A second pawn move leaves the king exposed.','Qh4 is mate: White cannot capture, block, or escape.']};
export const LESSON_DEMOS:Record<string,LessonDemo>={
  'board-vision':checks,'development':development,'king-safety':checks,'calculation':checks,
  'forks':{title:'Check, then capture the second target',fen:'2q3k1/8/2N5/8/8/8/8/7K w - - 0 1',moves:['c6e7','g8h7','e7c8'],captions:['Ne7 checks the king and attacks the queen on c8.','The king must answer the check.','The knight can now capture the queen.']},
  'pins':{title:'A pinned defender cannot leave its king',fen:'6k1/5n2/8/8/8/1B6/8/7K w - - 0 1',moves:['b3a2','g8f8','a2b3'],captions:['The bishop stays on the diagonal to g8. The knight cannot leave that line while shielding its king.','The king steps away, releasing the absolute pin.','The bishop returns; the knight is now free to move.']},
  'queen-mate':{title:'Cover the escape squares',fen:'7k/8/5KQ1/8/8/8/8/8 w - - 0 1',moves:['g6g7'],captions:['Qg7 is protected by the king on f6. Black has no escape.']},
  'rook-mate':{title:'King and rook work together',fen:'7k/8/6K1/8/8/8/8/R7 w - - 0 1',moves:['a1a8'],captions:['Ra8 checks along the final rank. The king covers the escape squares.']},
  'promotion':{title:'Choose your new piece',fen:'8/P6k/8/8/8/8/8/4K3 w - - 0 1',moves:['a7a8q'],captions:['The pawn becomes a queen. Other positions can call for an underpromotion.']},
};

