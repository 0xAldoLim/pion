import {describe,it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {capturedMaterial} from '../../src/chess/material';

describe('capture ownership and current material',()=>{
  it('starts empty and separates the colors after an equal pawn exchange',()=>{
    const position=new Chess();expect(capturedMaterial(position).w.advantage).toBe(0);
    for(const san of ['e4','d5','exd5','Qxd5'])position.move(san);
    const material=capturedMaterial(position);
    expect(material.w.pieces).toEqual({p:1,n:0,b:0,r:0,q:0});expect(material.b.pieces).toEqual(material.w.pieces);
    expect(material.w.advantage).toBe(0);expect(material.b.advantage).toBe(0);
  });
  it('tracks an en passant capture and removes it when the move is undone',()=>{
    const position=new Chess();for(const san of ['e4','a6','e5','d5','exd6'])position.move(san);
    expect(capturedMaterial(position).w).toMatchObject({pieces:{p:1},advantage:1});expect(capturedMaterial(position).b.advantage).toBe(0);
    position.undo();expect(capturedMaterial(position).w).toMatchObject({pieces:{p:0},advantage:0});
  });
  it('counts promotion in the board balance even without a capture',()=>{
    const position=new Chess('7k/P7/8/8/8/8/8/4K3 w - - 0 1');position.move('a8=Q+');
    expect(capturedMaterial(position).w).toEqual({pieces:{p:0,n:0,b:0,r:0,q:0},advantage:9});
  });
  it('keeps the actual promoted piece when it is captured',()=>{
    const position=new Chess('1r6/P6k/8/8/8/8/8/4K3 w - - 0 1');position.move('a8=Q');position.move('Rxa8');
    expect(capturedMaterial(position).b).toEqual({pieces:{p:0,n:0,b:0,r:0,q:1},advantage:5});expect(capturedMaterial(position).w.advantage).toBe(0);
  });
  it('measures material from the current position for imported unequal starts',()=>{
    const position=new Chess('7k/8/8/8/8/8/8/R3K3 w - - 0 1');
    expect(capturedMaterial(position).w).toMatchObject({pieces:{r:0},advantage:5});expect(capturedMaterial(position).b.advantage).toBe(0);
  });
});
