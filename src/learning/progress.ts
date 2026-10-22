import type {InteractiveLesson,LessonProgress,LearningEvidence,LessonStep} from './models';
import {freshRepetition} from './repetition';
export function freshLesson(lesson:InteractiveLesson):LessonProgress {return {version:1,lessonId:lesson.id,currentStep:lesson.steps[0]!.id,viewedSteps:[],completedExercises:[],hintCount:0,stepHints:{},stepErrors:{},lastVisited:Date.now(),masteryEvidence:[],...freshRepetition()};}
export function lessonStatus(lesson:InteractiveLesson,progress?:LessonProgress){
  const checks=lesson.steps.filter(s=>s.type==='move'||s.type==='question');
  return {viewed:!!progress?.viewedSteps.length,practiced:checks.filter(s=>!s.independent).every(s=>progress?.completedExercises.includes(s.id)),demonstrated:!!progress?.masteryEvidence.length};
}

/** Prefer an unseen authored application, then failed/assisted work, then due recall. */
export function nextChallenge(lesson:InteractiveLesson,progress:LessonProgress,evidence:LearningEvidence[],now=Date.now()):LessonStep {
  const applications=lesson.steps.filter(s=>s.type==='move'&&s.activity==='application'&&s.id.startsWith('apply-'));
  const seen=new Set(evidence.map(e=>e.positionId));
  const unseen=applications.find(s=>!seen.has(s.fen.split(' ').slice(0,4).join(' '))&&!progress.completedExercises.includes(s.id));
  const weak=applications.find(s=>(progress.stepHints[s.id]??0)>0||(progress.stepErrors[s.id]??0)>0);
  return unseen??(progress.due<=now?lesson.steps.find(s=>s.id==='recall'):weak)??weak??applications[0]??lesson.steps.find(s=>s.id==='transfer')!;
}
export function evidenceActivity(e:LearningEvidence):'recognition'|'application' {
  return e.activity??(e.kind==='guided'?'recognition':'application');
}
export function isSpacedRecall(lessonId:string,evidence:LearningEvidence[],due:number,now:number){
  const previous=evidence.filter(e=>e.lessonId===lessonId&&e.success).sort((a,b)=>b.at-a.at)[0];
  return !!previous&&now>=due&&now-previous.at>=86_400_000;
}
