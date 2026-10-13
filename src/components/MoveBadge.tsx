import {BookOpen,Check,ChevronUp,ChevronsUp,CircleAlert,CircleX,Diamond,Star,Target,Zap} from 'lucide-react';
import type {Classification} from '../chess/types';
const icons={brilliant:Zap,great:ChevronsUp,book:BookOpen,best:Star,excellent:Diamond,good:Check,inaccuracy:ChevronUp,mistake:CircleAlert,miss:Target,blunder:CircleX};
export function MoveBadge({kind}: {kind:Classification}) {
  const Icon=icons[kind];return <span className={`move-badge ${kind}`} role="img" aria-label={`${kind} move`} title={kind}><Icon size={17} strokeWidth={2.8}/></span>;
}
