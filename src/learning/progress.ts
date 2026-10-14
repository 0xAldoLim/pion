import type {InteractiveLesson,LessonProgress} from './models';
import {freshRepetition} from './repetition';
export function freshLesson(lesson:InteractiveLesson):LessonProgress {return {version:1,lessonId:lesson.id,currentStep:lesson.steps[0]!.id,viewedSteps:[],completedExercises:[],hintCount:0,stepHints:{},stepErrors:{},lastVisited:Date.now(),masteryEvidence:[],...freshRepetition()};}
export function lessonStatus(lesson:InteractiveLesson,progress?:LessonProgress){
  const checks=lesson.steps.filter(s=>s.type==='move'||s.type==='question');
  return {viewed:!!progress?.viewedSteps.length,practiced:checks.filter(s=>!s.independent).every(s=>progress?.completedExercises.includes(s.id)),demonstrated:!!progress?.masteryEvidence.length};
}
