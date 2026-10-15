import {it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {MASTER_STUDIES} from '../../src/data/master-studies';
import {CURRICULUM} from '../../src/data/curriculum';
import {OPENING_COURSES} from '../../src/data/opening-courses';
it('keeps fourteen complete legal master games with valid decision, lesson and provenance',()=>{
  expect(MASTER_STUDIES).toHaveLength(14);expect(new Set(MASTER_STUDIES.map(s=>s.source)).size).toBe(14);
  for(const study of MASTER_STUDIES){const c=new Chess();c.loadPgn(study.pgn);const h=c.getHeaders(),moves=c.history({verbose:true});expect(h).toMatchObject({White:study.white,Black:study.black,Date:study.date,Event:study.event,Round:study.round,Result:study.result});expect(moves[study.criticalPly]).toBeDefined();expect(moves.length).toBeGreaterThan(50);expect(study.sourceSha256).toMatch(/^[0-9a-f]{64}$/);expect(study.license).toBe('CC-BY-SA-4.0');expect(CURRICULUM.some(l=>l.id===study.lessonId)).toBe(true);expect(OPENING_COURSES.some(c=>c.id===study.openingId)).toBe(true);expect(study.explanation.length).toBeGreaterThan(100);}
});
it('grounds the en passant study in the actual immediate two-square reply',()=>{const s=MASTER_STUDIES.find(s=>s.id==='tata-2024-1-4')!,c=new Chess();c.loadPgn(s.pgn);const h=c.history({verbose:true});expect(h[s.criticalPly-1]!.san).toBe('b4');expect(h[s.criticalPly]!.isEnPassant()).toBe(true);expect(h[s.criticalPly]!.from+h[s.criticalPly]!.to).toBe('c4b3');});
