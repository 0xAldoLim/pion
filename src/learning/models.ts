import type {Repetition} from '../chess/types';

export type Skill='board-vision'|'threat-recognition'|'calculation'|'opening-fundamentals'|'opening-recall'|'king-safety'|'planning'|'endgames'|'defense';
export type Goal = {kind:'mate'|'castle'|'promotion'|'fork'|'pin'|'check'|'preventMate'|'safeCapture'|'developAttack'|'defend'|'enPassant'|'escapeCheck';target?:string;piece?:string;minimum?:number} | {kind:'curated';moves:string[];reason:string};
interface StepBase {id:string;objective:string;fen:string;explanation:string;hints:[string,string,string];arrows?:{orig:string;dest:string;brush:string}[]}
export interface TextStep extends StepBase {type:'explanation'|'summary'}
export interface DemoStep extends StepBase {type:'demonstration';moves:string[];captions:string[]}
export interface MoveStep extends StepBase {type:'move';goal:Goal;examples:string[];independent?:boolean;failure:string;activity?:'recognition'|'application';sequence?:string[];sequenceCaptions?:string[]}
export interface ChoiceStep extends StepBase {type:'question';choices:{id:string;text:string;correct:boolean;feedback:string}[];independent?:boolean}
export type LessonStep=TextStep|DemoStep|MoveStep|ChoiceStep;
export interface InteractiveLesson {version:1;id:string;title:string;category:string;stage:number;summary:string;skills:Skill[];prerequisites:string[];related:string[];steps:LessonStep[]}
export interface LearningCourse {id:string;title:string;description:string;stage:number;concepts:string[];lessonIds:string[]}
export interface LessonProgress extends Repetition {version:1;lessonId:string;currentStep:string;viewedSteps:string[];completedExercises:string[];hintCount:number;stepHints:Record<string,number>;stepErrors:Record<string,number>;lastVisited:number;masteryEvidence:string[];stepLines?:Record<string,string[]>}
export interface LearningEvidence {version:1;id:string;lessonId:string;stepId:string;positionId:string;skill:Skill;at:number;success:boolean;hints:number;errors:number;kind:'guided'|'transfer'|'recall';firstSeen:boolean;spaced?:boolean;activity?:'recognition'|'application'}
export interface OpeningStudyProgress extends Repetition {version:1;id:string;openingId:string;positionId:string;color:'w'|'b';reviewedAt:number;errors:number;hintsUsed:number;recallSuccesses:number;mode:'guided'|'recall';move:string}
