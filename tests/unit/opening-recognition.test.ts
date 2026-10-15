import {describe,expect,it} from 'vitest';
import {recognizeOpening} from '../../src/openings/recognition';
import {START_FEN,replay} from '../../src/chess/rules';
import {sanLineToUci} from '../../src/data/openings';

describe('opening names from played positions',()=>{
  it('does not invent a name before the game starts',()=>{expect(recognizeOpening(START_FEN,[])).toBeUndefined();});
  it('identifies the Italian and Ruy Lopez as their defining moves are played',()=>{
    expect(recognizeOpening(START_FEN,sanLineToUci('e4 e5 Nf3 Nc6 Bc4'))?.opening.name).toMatch(/Italian/);
    expect(recognizeOpening(START_FEN,sanLineToUci('e4 e5 Nf3 Nc6 Bb5'))?.opening.name).toMatch(/Ruy Lopez/);
  });
  it('keeps the last identified opening after an unlisted continuation',()=>{
    const moves=sanLineToUci('e4 e5 Nf3 Nc6 Bc4 a5 a4 h5 Ra3');
    const result=recognizeOpening(START_FEN,moves);expect(result?.opening.name).toMatch(/Italian/);expect(result!.ply).toBeLessThan(moves.length);
  });
  it('recognizes transpositions by position rather than a fixed move prefix',()=>{
    const first=recognizeOpening(START_FEN,sanLineToUci('e4 e5 Nf3 Nc6 Nc3 Nf6'));
    const second=recognizeOpening(START_FEN,sanLineToUci('Nf3 Nf6 Nc3 Nc6 e4 e5'));
    expect(first?.ply).toBe(6);expect(second?.ply).toBe(6);expect(second?.opening.id).toBe(first?.opening.id);
  });
  it('recomputes after undo and recognizes named custom starting positions',()=>{
    const moves=sanLineToUci('e4 e5 Nf3 Nc6 Bc4');expect(recognizeOpening(START_FEN,moves.slice(0,3))?.opening.name).not.toMatch(/Italian/);
    const fen=replay({startFen:START_FEN,moves}).fen();expect(recognizeOpening(fen,[])?.opening.name).toMatch(/Italian/);
    expect(recognizeOpening('7k/8/8/8/8/8/8/K7 w - - 0 1',[])).toBeUndefined();
  });
});
