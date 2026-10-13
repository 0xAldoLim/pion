import {describe,it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {isLegalPremove,premoveDestinations,projectPremoves} from '../../src/chess/premoves';
import {playUci} from '../../src/chess/rules';

describe('premoves',()=>{
  it('previews a sequence without changing the actual position or side to move',()=>{
    const chess=new Chess();playUci(chess,'e2e4');const actual=chess.fen();
    const preview=new Chess(projectPremoves(actual,['g1f3','f3g5','b1c3'],'w'));
    expect(preview.get('g5')).toMatchObject({type:'n',color:'w'});expect(preview.get('c3')).toMatchObject({type:'n',color:'w'});
    expect(preview.get('g1')).toBeUndefined();expect(preview.turn()).toBe('b');expect(chess.fen()).toBe(actual);
  });
  it('allows a conditional pawn capture but checks it against the real reply',()=>{
    const chess=new Chess();playUci(chess,'e2e4');
    expect(premoveDestinations(chess.fen(),'w').get('e4')).toContain('d5');
    expect(new Chess(projectPremoves(chess.fen(),['e4d5'],'w')).get('d5')).toMatchObject({type:'p',color:'w'});
    const capture=new Chess(chess.fen());playUci(capture,'d7d5');expect(isLegalPremove(capture.fen(),'e4d5','w')).toBe(true);
    const other=new Chess(chess.fen());playUci(other,'e7e5');expect(isLegalPremove(other.fen(),'e4d5','w')).toBe(false);
  });
  it('cancels a non-evasion when the reply checks the king',()=>{
    const chess=new Chess();for(const move of ['f2f3','e7e5','e2e4','d8h4'])playUci(chess,move);
    expect(isLegalPremove(chess.fen(),'b1c3','w')).toBe(false);expect(isLegalPremove(chess.fen(),'g2g3','w')).toBe(true);
  });
  it('supports underpromotion, castling and en passant after a legal reply',()=>{
    const promotion='8/P6k/8/8/8/8/8/4K3 b - - 0 1';
    expect(new Chess(projectPremoves(promotion,['a7a8n'],'w')).get('a8')).toMatchObject({type:'n'});
    const castle='r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1';
    const preview=new Chess(projectPremoves(castle,['e1g1'],'w'));expect(preview.get('g1')?.type).toBe('k');expect(preview.get('f1')?.type).toBe('r');
    expect(premoveDestinations('r3k2r/8/8/8/8/8/8/R3KB1R b KQkq - 0 1','w').get('e1')).not.toContain('g1');
    const chess=new Chess('4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1');playUci(chess,'d7d5');expect(isLegalPremove(chess.fen(),'e5d6','w')).toBe(true);
  });
  it('rejects enemy moves, own-piece captures and king captures',()=>{
    const chess=new Chess();
    expect(()=>projectPremoves(chess.fen(),['a7a6'],'w')).toThrow();
    expect(()=>projectPremoves(chess.fen(),['a1a2'],'w')).toThrow();
    expect(()=>projectPremoves('4k3/8/8/8/8/8/4R3/4K3 b - - 0 1',['e2e8'],'w')).toThrow();
    expect(isLegalPremove(chess.fen(),'e7e5','b')).toBe(false);
  });
});
