import type { Color } from 'chess.js';

export type Score = {kind: 'cp'; value: number} | {kind: 'mate'; value: number; winner: Color};
export interface Candidate {move: string; score: Score; depth: number; pv: string[]; nodes: number}
export interface EngineSettings {profile: 'fast' | 'balanced' | 'deep' | 'custom'; depth: number; timeMs: number; multiPv: number; hashMb: number; threads: number; pack: 'lite' | 'deep'}
export interface Evaluation {fen: string; engine: string; settings: EngineSettings; candidates: Candidate[]; bestMove: string; completed: boolean; timestamp: number}
export type ScoringMode = 'inspired' | 'pion';
export type Classification = 'brilliant' | 'great' | 'book' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'miss' | 'blunder';
export const CLASSES: Classification[] = ['brilliant','great','book','best','excellent','good','inaccuracy','mistake','miss','blunder'];
export interface TacticalEvidence {kind: string; text: string; squares: string[]; line?: string[]; depth?: number; position: string}
export interface ReviewMove {
  ply: number; color: Color; san: string; uci: string; fenBefore: string; fenAfter: string;
  before: Evaluation; after: Evaluation; bestMove: string; bestSan: string;
  evidence: TacticalEvidence[]; forced: boolean; book: boolean; sacrificeVerified: boolean;
  opportunity: boolean; phase: 'opening'|'middlegame'|'endgame'; status: 'complete';
  scores: Record<ScoringMode, {classification: Classification; accuracy: number; loss: number; version: string}>;
}
export interface Game {
  id: string; createdAt: number; updatedAt: number; startFen: string; moves: string[]; san: string[];
  mode: 'bot'|'hotseat'|'import'|'rated'; botId: string; playerColor: Color;
  rated?: {category: RatingCategory; opponent: number; before: number; delta?: number; after?: number};
  status: 'active'|'finished'; result: string; reason: string;
  initialSeconds: number; increment: number; clocks: {w: number; b: number};
  review?: {moves: ReviewMove[]; completed: boolean; settings: EngineSettings; version: string; positionId: string};
  headers?: Record<string,string>;
}
export interface Puzzle {
  id: string; fen: string; moves: string[]; rating: number; themes: string[];
  source: string; license: string; attribution: string; setup: boolean;
  explanation?: string;
  master?: {white: string; black: string; event: string; date: string; moveNumber: number; gamePgn: string};
}
export interface Attempt {id: string; puzzleId: string; at: number; solved: boolean; hints: number; firstSeen: boolean; rating: number; themes: string[]; duration: number; mode: 'practice'|'rush'|'mistake'|'master'}
export interface Repetition {interval: number; ease: number; due: number; successes: number; failures: number}
export interface Mistake extends Repetition {id: string; gameId: string; ply: number; fen: string; move: string; line: string[]; tags: string[]; source: string; license: string}
export interface Repertoire extends Repetition {id: string; openingId: string; name: string; moves: string[]; color: Color;startFen?:string;folder?:string;notes?:string;favorite?:boolean;parentId?:string;sourceGameId?:string}
export interface TrainingEvent {id: string; at: number; kind: 'lesson'|'opening'|'endgame'; target: string; success: boolean; hints: number}
export type RatingCategory = 'blitz'|'rapid';
export interface Rating {id: RatingCategory; value: number; games: number; wins: number; losses: number; draws: number; updatedAt: number}
export interface Preferences {
  id: 'main'; colorMode: 'light'|'dark'; theme: 'forest'|'slate'|'sand'|'ocean'|'walnut'|'violet'|'tournament'; pieces: 'classic'|'outline'|'neo'|'wood'; sound: boolean;
  animation: boolean; reducedMotion: boolean; largeText: boolean; contrast: boolean;
  coach: 'off'|'important'|'every'|'training'; explanation: 'quick'|'educational'|'deep'; voice: boolean;
  highlights: boolean; showEval: boolean; engine: EngineSettings; puzzleRating: number;
  training: {tactics: number; games: number; mistakes: number; openings: number; endgames: number};
  botPace: 'quick'|'standard'|'thoughtful'; premoves:boolean;
  practiceHints:boolean; practiceUndo:boolean; practiceFeedback:boolean;
}
export const PROFILES: Record<'fast'|'balanced'|'deep', EngineSettings> = {
  fast: {profile:'fast',depth:12,timeMs:350,multiPv:3,hashMb:32,threads:1,pack:'lite'},
  balanced: {profile:'balanced',depth:18,timeMs:1200,multiPv:3,hashMb:64,threads:1,pack:'lite'},
  deep: {profile:'deep',depth:24,timeMs:5000,multiPv:4,hashMb:128,threads:1,pack:'lite'},
};
export const DEFAULT_PREFS: Preferences = {id:'main',colorMode:'light',theme:'forest',pieces:'classic',sound:true,animation:true,reducedMotion:false,largeText:false,contrast:true,coach:'important',explanation:'educational',voice:false,highlights:true,showEval:true,engine:PROFILES.balanced,puzzleRating:600,training:{tactics:40,games:25,mistakes:20,openings:10,endgames:5},botPace:'standard',premoves:true,practiceHints:true,practiceUndo:true,practiceFeedback:false};
